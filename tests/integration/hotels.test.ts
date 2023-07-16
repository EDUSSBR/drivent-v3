import faker from '@faker-js/faker';
import httpStatus from 'http-status';
import * as jwt from 'jsonwebtoken';
import supertest from 'supertest';

import { createUser } from '../factories';
import {
  cleanDb,
  generateUserWithEnrollment,
  generateUserWithEnrollmentAndTicket,
  generateValidToken,
} from '../helpers';
import { createHotel } from '../factories/hotels-factory';
import app, { init } from '@/app';
import { hotelWithRooms } from '@/protocols';

beforeEach(async () => {
  await init();
  await cleanDb();
});

const server = supertest(app);
describe('GET /hotels', () => {
  //TOKEN INVALIDO
  describe('invalid token', () => {
    it('should respond with status 401 if given token is not valid', async () => {
      const token = faker.lorem.word();
      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if no token is given', async () => {
      const response = await server.get('/hotels');
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if there is no session for given token', async () => {
      const userWithoutSession = await createUser();
      const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  });
  //TOKEN VALIDO
  describe('valid token', () => {
    //TOKEN - NO ENROLLMENT
    describe('user with no enrollment', () => {
      it('should respond with status 404 if there is no enrollment', async () => {
        const token = await generateValidToken();
        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.NOT_FOUND);
      });
    });
    //TOKEN + ENROLLMENT
    describe('user with enrollment', () => {
      //TOKEN + ENROLLMENT + TICKET
      describe('with ticket', () => {
        describe('if hotels found', () => {
          describe('if ticket is not paid yet ', () => {
            it('should respond with status 402 if ticket is not paid (RESERVED) yet', async () => {
              const { token } = await generateUserWithEnrollmentAndTicket({
                isRemote: false,
                includesHotel: true,
                ticketStatus: 'RESERVED',
              });
              const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
              expect(response.status).toBe(402);
            });
          });
          describe('if ticket isRemote', () => {
            it('should respond with status 402 if ticket is remote', async () => {
              const { token } = await generateUserWithEnrollmentAndTicket({
                isRemote: true,
                includesHotel: true,
                ticketStatus: 'PAID',
              });
              const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
              expect(response.status).toBe(402);
            });
          });
          describe('if ticket not includesHotel', () => {
            it('should respond with status 402 if ticket doesnot includes hotel', async () => {
              const { token } = await generateUserWithEnrollmentAndTicket({
                isRemote: false,
                includesHotel: false,
                ticketStatus: 'PAID',
              });
              const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
              expect(response.status).toBe(402);
            });
          });
          describe('if available hotels', () => {
            it('if there is hotel and all conditions met (enrollment,ticket,payments)! ', async () => {
              await createHotel();
              const { token } = await generateUserWithEnrollmentAndTicket({
                isRemote: false,
                includesHotel: true,
                ticketStatus: 'PAID',
              });
              const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
              expect(response.status).toBe(200);
              expect(response.body).toEqual(
                expect.arrayContaining([
                  {
                    id: expect.any(Number),
                    name: expect.any(String),
                    image: expect.any(String),
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                  },
                ]),
              );
            });
          });
        });
        describe('if there is not available hotels', () => {
          it('if there is NOT  hotels available and all conditions met (enrollmetn,ticket,payments)!', async () => {
            const { token } = await generateUserWithEnrollmentAndTicket({
              isRemote: false,
              includesHotel: true,
              ticketStatus: 'PAID',
            });
            const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(404);
          });
        });
      });
      //TOKEN + ENROLLMENT - NO TICKET
      describe('without ticket', () => {
        it('should responde with status 404 if there is no ticket', async () => {
          const { token } = await generateUserWithEnrollment();
          const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
          expect(response.status).toBe(404);
        });
      });
    });
  });
});

//-----------------------------------------------------------
describe('GET /hotels/:hotelId', () => {
  describe('invalid token', () => {
    it('should respond with status 401 if no token is given', async () => {
      const response = await server.get('/hotels/1');
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if given token is not valid', async () => {
      const token = faker.lorem.word();
      const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if there is no session for given token', async () => {
      const userWithoutSession = await createUser();
      const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
      const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  });
  describe('valid token', () => {
    //TOKEN - NO ENROLLMENT
    describe('user with no enrollment', () => {
      it('should respond with status 404 if there is no enrollment', async () => {
        const token = await generateValidToken();
        const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.NOT_FOUND);
      });
    });
    //TOKEN + ENROLLMENT
    describe('user with enrollment', () => {
      //TOKEN + ENROLLMENT + TICKET
      describe('with ticket', () => {
        describe('if hotels found', () => {
          describe('if ticket is not paid yet ', () => {
            it('should respond with status 402 if ticket is not paid (RESERVED) yet', async () => {
              const { token } = await generateUserWithEnrollmentAndTicket({
                isRemote: false,
                includesHotel: true,
                ticketStatus: 'RESERVED',
              });
              const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);
              expect(response.status).toBe(402);
            });
          });
          describe('if ticket isRemote', () => {
            it('should respond with status 402 if ticket is remote', async () => {
              const { token } = await generateUserWithEnrollmentAndTicket({
                isRemote: true,
                includesHotel: true,
                ticketStatus: 'PAID',
              });
              const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);
              expect(response.status).toBe(402);
            });
          });
          describe('if ticket not includesHotel', () => {
            it('should respond with status 402 if ticket doesnot includes hotel', async () => {
              const { token } = await generateUserWithEnrollmentAndTicket({
                isRemote: false,
                includesHotel: false,
                ticketStatus: 'PAID',
              });
              const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);
              expect(response.status).toBe(402);
            });
          });
          describe('if available hotels', () => {
            it('if there is hotel and all conditions met (enrollment,ticket,payments)! ', async () => {
              const hotels = await createHotel();
              const { token } = await generateUserWithEnrollmentAndTicket({
                isRemote: false,
                includesHotel: true,
                ticketStatus: 'PAID',
              });
              const response = await server.get(`/hotels/${hotels[0].id}`).set('Authorization', `Bearer ${token}`);
              expect(response.status).toBe(200);
              expect(response.body).toEqual({
                id: expect.any(Number),
                name: expect.any(String),
                image: expect.any(String),
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
                Rooms: expect.arrayContaining([
                  {
                    id: expect.any(Number),
                    name: expect.any(String),
                    capacity: expect.any(Number),
                    hotelId: expect.any(Number),
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                  },
                ]),
              });
              // VALIDAR BODY
            });
          });
        });
        describe('if there is not available hotels', () => {
          it('if there is NOT  hotels available and all conditions met (enrollmetn,ticket,payments)!', async () => {
            const { token } = await generateUserWithEnrollmentAndTicket({
              isRemote: false,
              includesHotel: true,
              ticketStatus: 'PAID',
            });
            const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(404);
            // VALIDAR BODY
          });
        });
      });
      //TOKEN + ENROLLMENT - NO TICKET
      describe('without ticket', () => {
        it('should responde with status 404 if there is no ticket', async () => {
          const { token } = await generateUserWithEnrollment();
          const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);
          expect(response.status).toBe(404);
        });
      });
    });
  });
});

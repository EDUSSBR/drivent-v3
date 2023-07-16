import * as jwt from 'jsonwebtoken';
import { TicketStatus, User } from '@prisma/client';

import {
  CreateTicketTypeFactory,
  createEnrollmentWithAddress,
  createGenericTicketType,
  createTicket,
  createUser,
} from './factories';
import { createSession } from './factories/sessions-factory';
import { prisma } from '@/config';

export async function cleanDb() {
  await prisma.address.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.ticket.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.ticketType.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.hotel.deleteMany({});
}

export async function generateValidToken(user?: User) {
  const incomingUser = user || (await createUser());
  const token = jwt.sign({ userId: incomingUser.id }, process.env.JWT_SECRET);

  await createSession(token);

  return token;
}

export const generateUserWithEnrollment = async () => {
  const user = await createUser();
  const enrollment = Promise.resolve(await createEnrollmentWithAddress(user));
  const token = await generateValidToken(user);
  return { user, enrollment, token };
};

type GenerateUserWithEnrollmentAndTicket = CreateTicketTypeFactory & { ticketStatus: TicketStatus };
export const generateUserWithEnrollmentAndTicket = async ({
  isRemote,
  includesHotel,
  ticketStatus,
}: GenerateUserWithEnrollmentAndTicket) => {
  const { user, enrollment, token } = await generateUserWithEnrollment();
  const ticketType = await createGenericTicketType({ isRemote, includesHotel });
  const ticket = await createTicket((await enrollment).id, ticketType.id, ticketStatus);
  return { user, enrollment, token, ticketType, ticket };
};

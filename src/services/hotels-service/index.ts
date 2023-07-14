import { Hotel, Room } from '@prisma/client';
import { notFoundError } from '@/errors';
import enrollmentRepository from '@/repositories/enrollment-repository';
import hotelsRepository from '@/repositories/hotels-repository';
import paymentsRepository from '@/repositories/payments-repository';
import { GetRoomsByHotelId } from '@/protocols';
import ticketsRepository from '@/repositories/tickets-repository';
import { paymentRequiredError } from '@/errors/payment-required-error';

async function checkIfUserCanGetHotel(userId: number) {
  const enrollment = await enrollmentRepository.findByUserId(userId);
  if (!enrollment) throw notFoundError();
  const ticket = await ticketsRepository.findTicketAndPaymentByEnrollmentId(enrollment.id);

  if (!ticket) throw notFoundError();
  if (!ticket.TicketType.isRemote || !ticket.TicketType.includesHotel || ticket.status !== 'PAID') {
    throw paymentRequiredError();
  }
  // const payment = await paymentsRepository.findPaymentsByTicketId(ticket.id);
  // let total = 0;
  // for (let i = 0; i < payment.length; i++) {
  //   total += payment[i].value;
  // }
  // if (ticket.TicketType.price !== total) {
  //   throw paymentRequiredError();
  // }
}

async function checkIfFoundHotels(hotelPromise: Promise<Hotel | Hotel[]>) {
  await hotelPromise;
  if (Array.isArray(hotelPromise) && hotelPromise.length === 0) throw notFoundError();
  if (!hotelPromise) throw notFoundError();
}

async function getHotels(userId: number): Promise<Hotel[]> {
  const hotels = hotelsRepository.findHotels();
  await checkIfUserCanGetHotel(userId);
  await checkIfFoundHotels(hotels);
  return hotels;
}
async function getRoomsByHotelsId({ userId, hotelId }: GetRoomsByHotelId): Promise<Hotel> {
  const hotelWithRoom = hotelsRepository.findHotelWithRoomsById(hotelId);
  await checkIfUserCanGetHotel(userId);
  await checkIfFoundHotels(hotelWithRoom);
  return hotelWithRoom;
}

const hotelsService = { getHotels, getRoomsByHotelsId };

export default hotelsService;

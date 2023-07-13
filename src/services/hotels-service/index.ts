import { Hotel, Room } from '@prisma/client';
import { notFoundError } from '@/errors';
import enrollmentRepository from '@/repositories/enrollment-repository';
import hotelsRepository from '@/repositories/hotels-repository';
import paymentsRepository from '@/repositories/payments-repository';
import { GetRoomsByHotelId } from '@/protocols';
import ticketsRepository from '@/repositories/tickets-repository';
import { paymentRequiredError } from '@/errors/payment-required-error';

async function getHotels(userId: number): Promise<Hotel[]> {
  const [enrollment, hotels] = await Promise.all([
    enrollmentRepository.findByUserId(userId),
    hotelsRepository.findHotels(),
  ]);
  if (!enrollment) throw notFoundError();

  const ticket = await ticketsRepository.findTicketAndPaymentByEnrollmentId(enrollment.id);

  if (!ticket) throw notFoundError();
  if (!ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw paymentRequiredError();
  }
  const payment = await paymentsRepository.findPaymentsByTicketId(ticket.id);
  let total = 0;
  for (let i = 0; i < payment.length; i++) {
    total += payment[i].value;
  }
  if (ticket.TicketType.price !== total) {
    throw paymentRequiredError();
  }
  if (hotels.length === 0) throw notFoundError();
  return hotels;
}
async function getRoomsByHotelsId({ userId, hotelId }: GetRoomsByHotelId): Promise<Hotel> {
  const [enrollment, hotelWithRoom] = await Promise.all([
    enrollmentRepository.findByUserId(userId),
    hotelsRepository.findHotelWithRoomsById(hotelId),
  ]);
  if (!enrollment || !hotelWithRoom) throw notFoundError();

  const ticket = await ticketsRepository.findTicketAndPaymentByEnrollmentId(enrollment.id);

  if (!ticket) throw notFoundError();
  if (!ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw paymentRequiredError();
  }
  const payment = await paymentsRepository.findPaymentsByTicketId(ticket.id);
  let total = 0;
  for (let i = 0; i < payment.length; i++) {
    total += payment[i].value;
  }
  if (ticket.TicketType.price !== total) {
    throw paymentRequiredError();
  }
  return hotelWithRoom;
}

const hotelsService = { getHotels, getRoomsByHotelsId };

export default hotelsService;

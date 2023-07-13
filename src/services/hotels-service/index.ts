import { Hotel, Room } from '@prisma/client';
import { notFoundError } from '@/errors';
import enrollmentRepository from '@/repositories/enrollment-repository';
import hotelsRepository from '@/repositories/hotels-repository';
import { GetRoomsByHotelId } from '@/protocols';
import ticketsRepository from '@/repositories/tickets-repository';
import { paymentRequiredError } from '@/errors/payment-required-error';

async function getHotels(userId: number): Promise<Hotel[]> {
  const [enrollment, hotels] = await Promise.all([
    enrollmentRepository.findByUserId(userId),
    hotelsRepository.findHotels(),
  ]);
  if (!enrollment || hotels.length === 0) throw notFoundError();

  const ticket = await ticketsRepository.findTicketAndPaymentByEnrollmentId(enrollment.id);
  if (!ticket) throw notFoundError();
  if (!ticket.TicketType.isRemote || !ticket.Payment || !ticket.TicketType.includesHotel) throw paymentRequiredError();
  return hotels;
}
async function getRoomsByHotelsId({ userId, hotelId }: GetRoomsByHotelId): Promise<Hotel[]> {
  const [enrollment, hotels] = await Promise.all([
    enrollmentRepository.findByUserId(userId),
    hotelsRepository.findHotels(),
  ]);
  if (!enrollment || hotels.length === 0) throw notFoundError();

  const ticket = await ticketsRepository.findTicketAndPaymentByEnrollmentId(enrollment.id);
  if (!ticket) throw notFoundError();
  if (!ticket.TicketType || !ticket.Payment || !ticket.TicketType.includesHotel) throw paymentRequiredError();
  const rooms = await hotelsRepository.findHotelWithRoomsById(hotelId);
  if (!rooms) throw notFoundError();
  return rooms;
}

const hotelsService = { getHotels, getRoomsByHotelsId };

export default hotelsService;

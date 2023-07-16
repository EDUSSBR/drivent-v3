import { Hotel } from '@prisma/client';
import { notFoundError } from '@/errors';
import enrollmentRepository from '@/repositories/enrollment-repository';
import hotelsRepository from '@/repositories/hotels-repository';
import { GetRoomsByHotelId, RoomWithDateFormated, hotelWithRooms } from '@/protocols';
import ticketsRepository from '@/repositories/tickets-repository';
import { paymentRequiredError } from '@/errors/payment-required-error';

async function checkIfUserCanGetHotel(userId: number) {
  const enrollment = await enrollmentRepository.findByUserId(userId);
  if (!enrollment) throw notFoundError();
  const ticket = await ticketsRepository.findTicketAndPaymentByEnrollmentId(enrollment.id);

  if (!ticket) throw notFoundError();
  if (ticket.TicketType.isRemote || !ticket.TicketType.includesHotel || ticket.status !== 'PAID') {
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
  const hotel = await hotelPromise;
  if (Array.isArray(hotel) && hotel.length === 0) throw notFoundError();
  if (!hotel) throw notFoundError();
}

async function getHotels(userId: number): Promise<Hotel[]> {
  const hotels = hotelsRepository.findHotels();
  await checkIfUserCanGetHotel(userId);
  await checkIfFoundHotels(hotels);
  return hotels;
}

async function getRoomsByHotelsId({ userId, hotelId }: GetRoomsByHotelId): Promise<hotelWithRooms> {
  const hotelWithRooms = hotelsRepository.findHotelWithRoomsById(hotelId);
  await checkIfUserCanGetHotel(userId);
  await checkIfFoundHotels(hotelWithRooms);
  const { id, name, image, createdAt, updatedAt, Rooms } = await hotelWithRooms;
  const RoomsWithFormattedDate: RoomWithDateFormated[] = Rooms.map((room) => ({
    ...room,
    createdAt: new Date(room.createdAt).toISOString(),
    updatedAt: new Date(room.updatedAt).toISOString(),
  }));

  return {
    id,
    name,
    image,
    createdAt: new Date(createdAt).toISOString(),
    updatedAt: new Date(updatedAt).toISOString(),
    Rooms: RoomsWithFormattedDate,
  };
}

const hotelsService = { getHotels, getRoomsByHotelsId };

export default hotelsService;

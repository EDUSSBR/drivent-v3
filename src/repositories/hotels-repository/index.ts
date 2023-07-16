import { Hotel, Room } from '@prisma/client';
import { prisma } from '@/config';

async function findHotels(): Promise<Hotel[]> {
  return prisma.hotel.findMany({});
}
async function findHotelWithRoomsById(hotelId: number): Promise<Hotel & { Rooms: Room[] }> {
  return prisma.hotel.findUnique({
    where: { id: hotelId },
    include: {
      Rooms: true,
    },
  });
}

export default {
  findHotels,
  findHotelWithRoomsById,
};

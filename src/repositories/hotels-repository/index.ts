import { Room, Hotel } from '@prisma/client';
import { prisma } from '@/config';

async function findHotels(): Promise<Hotel[]> {
  return prisma.hotel.findMany();
}

async function findRoomsByHotelId(hotelId: number): Promise<Room[]> {
  return prisma.room.findMany({
    where: { hotelId },
  });
}

export default {
  findHotels,
  findRoomsByHotelId,
};

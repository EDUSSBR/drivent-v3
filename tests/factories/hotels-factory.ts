import faker from '@faker-js/faker';
import { prisma } from '@/config';

export async function createHotel() {
  const hotelInfo = {
    name: faker.name.findName(),
    image: faker.internet.avatar(),
  };

  const hotel = await prisma.hotel.create({
    data: hotelInfo,
  });
  const roomsInfo = [
    {
      capacity: 10,
      hotelId: hotel.id,
      name: 'Quarto 1',
    },
    {
      capacity: 11,
      hotelId: hotel.id,
      name: 'Quarto 2',
    },
    {
      capacity: 12,
      hotelId: hotel.id,
      name: 'Quarto 3',
    },
    {
      capacity: 13,
      hotelId: hotel.id,
      name: 'Quarto 4',
    },
    {
      capacity: 14,
      hotelId: hotel.id,
      name: 'Quarto 5',
    },
    {
      capacity: 15,
      hotelId: hotel.id,
      name: 'Quarto 6',
    },
  ];
  await prisma.room.createMany({
    data: roomsInfo,
  });
  return await prisma.hotel.findMany({ include: { Rooms: true } });
}

import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";
const prisma = new PrismaClient();

async function main() {
  let event = await prisma.event.findFirst();
  let hotel = await prisma.hotel.findFirst();
  let room = await prisma.room.findFirst();;
  if (!event) {
    event = await prisma.event.create({
      data: {
        title: "Driven.t",
        logoImageUrl: "https://files.driveneducation.com.br/images/logo-rounded.png",
        backgroundImageUrl: "linear-gradient(to right, #FA4098, #FFD77F)",
        startsAt: dayjs().toDate(),
        endsAt: dayjs().add(21, "days").toDate(),
      },
    });
  }
  if (!hotel) {
    hotel = await prisma.hotel.create({
      data: {
        name: "Some Hotel",
        image: "https://media.istockphoto.com/id/1414744533/pt/foto/woman-hand-holding-credit-cards-and-using-smartphone-for-shopping-online-with-payment-on.jpg"
      }
    })


  }
  if (!room) {
    await prisma.room.createMany({
      data: [
        {
          capacity: 10,
          hotelId: hotel.id,
          name: "Quarto 1",
        },
        {
          capacity: 11,
          hotelId: hotel.id,
          name: "Quarto 2",
        },
        {
          capacity: 12,
          hotelId: hotel.id,
          name: "Quarto 3",
        },
        {
          capacity: 13,
          hotelId: hotel.id,
          name: "Quarto 4",
        },
        {
          capacity: 14,
          hotelId: hotel.id,
          name: "Quarto 5",
        },
        {
          capacity: 15,
          hotelId: hotel.id,
          name: "Quarto 6",
        },
      ]
    })
  }

  let hotelWithRooms = await prisma.hotel.findFirst({ where: { id: hotel.id }, include: { Rooms: true } })
  console.log({ event, hotel, hotelWithRooms });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import hotelsService from '@/services/hotels-service';

export async function getHotels(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const hotels = await hotelsService.getHotels(userId);
  return res.status(httpStatus.OK).send(hotels);
}

export async function getRoomsByHotelsId(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { hotelId } = req.params;
  const rooms = await hotelsService.getRoomsByHotelsId({ userId, hotelId: parseInt(hotelId) });
  return res.status(httpStatus.OK).send(rooms);
}

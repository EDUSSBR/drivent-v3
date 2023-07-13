import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import hotelsService from '@/services/hotels-service';

export async function getHotels(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  try {
    const hotels = await hotelsService.getHotels(userId);
    return res.status(httpStatus.OK).send(hotels);
  } catch (e) {
    return res.sendStatus(httpStatus.NO_CONTENT);
  }
}

export async function getRoomsByHotelsId(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { hotelId } = req.params;
  try {
    const rooms = await hotelsService.getRoomsByHotelsId({ userId, hotelId: parseInt(hotelId) });
    return res.status(httpStatus.OK).send(rooms);
  } catch (e) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

import { Router } from 'express';
import { authenticateToken } from '@/middlewares';
import { getHotels, getRoomsByHotelsId } from '@/controllers';

const hotelsRouter = Router();

hotelsRouter.use(authenticateToken);
hotelsRouter.get('/', getHotels);
hotelsRouter.get('/:hotelId', getRoomsByHotelsId);

export { hotelsRouter };

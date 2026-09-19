import { Router } from 'express';
import { getHotels, getHotel, createHotel, updateHotel, deleteHotel, getNearbyHotels } from '../controllers/hotelController';
import { validate, validateQuery } from '../middleware/validate';
import { createHotelSchema, updateHotelSchema, getNearbyHotelsSchema } from '../validators/hotelValidator';
import { authGuard } from '../middleware/authGuard';
import { requireRole } from '../middleware/requireRole';
import { asyncWrapper } from '../utils/asyncWrapper';

const router = Router();

// Hotels
router.get('/hotels', asyncWrapper(getHotels));
router.get('/hotels/nearby', validateQuery(getNearbyHotelsSchema), asyncWrapper(getNearbyHotels));
router.get('/hotels/:id', asyncWrapper(getHotel));
router.post('/hotels', authGuard, requireRole('business'), validate(createHotelSchema), asyncWrapper(createHotel));
router.patch('/hotels/:id', authGuard, requireRole(['business', 'admin']), validate(updateHotelSchema), asyncWrapper(updateHotel));
router.delete('/hotels/:id', authGuard, requireRole(['business', 'admin']), asyncWrapper(deleteHotel));

export default router;

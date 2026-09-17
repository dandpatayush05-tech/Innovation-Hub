import { Router } from 'express';
import { getUnifiedBookings, cancelBooking } from '../controllers/bookingController';
import { authGuard } from '../middleware/authGuard';
import { asyncWrapper } from '../utils/asyncWrapper';

const router = Router();

router.get('/', authGuard, asyncWrapper(getUnifiedBookings));
router.post('/:id/cancel', authGuard, asyncWrapper(cancelBooking));

export default router;

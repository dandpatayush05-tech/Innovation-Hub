import { Router } from 'express';
import { getUnifiedBookings, cancelBooking, getUserBookings, getUserGuideBookings, createBooking, createGuideBooking, createAutoBooking, getUserAutoBookings } from '../controllers/bookingController';
import { authGuard } from '../middleware/authGuard';
import { asyncWrapper } from '../utils/asyncWrapper';
import { validate } from '../middleware/validate';
import { createBookingSchema, createGuideBookingSchema, createAutoBookingSchema } from '../validators/bookingValidator';

const router = Router();

// Existing unified
router.get('/bookings', authGuard, asyncWrapper(getUnifiedBookings));
router.post('/bookings/:id/cancel', authGuard, asyncWrapper(cancelBooking));

// From travelRoutes.ts
router.post('/bookings', authGuard, validate(createBookingSchema), asyncWrapper(createBooking));
router.get('/bookings/user/:userId', authGuard, asyncWrapper(getUserBookings));

router.post('/guide-bookings', authGuard, validate(createGuideBookingSchema), asyncWrapper(createGuideBooking));
router.get('/guide-bookings/user/:userId', authGuard, asyncWrapper(getUserGuideBookings));

router.post('/bookings/auto', authGuard, validate(createAutoBookingSchema), asyncWrapper(createAutoBooking));
router.get('/bookings/auto/user/:userId', authGuard, asyncWrapper(getUserAutoBookings));

export default router;

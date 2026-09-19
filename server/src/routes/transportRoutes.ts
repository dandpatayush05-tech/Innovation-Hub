import { Router } from 'express';
import { getFlights, getFlight, createFlightBooking, searchFlights, getFlightSchedule } from '../controllers/flightController';
import { getBuses, getBus, createBusBooking } from '../controllers/busController';
import { createAutoBooking, getUserAutoBookings } from '../controllers/autoController';
import { validate } from '../middleware/validate';
import { createFlightBookingSchema, createBusBookingSchema, createAutoBookingSchema, flightSearchValidator } from '../validators/transportValidator';
import { authGuard } from '../middleware/authGuard';
import { asyncWrapper } from '../utils/asyncWrapper';

const router = Router();

// Flights
router.get('/flights', asyncWrapper(getFlights));
router.get('/flights/search', validate(flightSearchValidator), asyncWrapper(searchFlights));
router.get('/flights/:id', asyncWrapper(getFlight));
router.get('/flights/:flightNumber/schedule', asyncWrapper(getFlightSchedule));
router.post('/bookings/flights', authGuard, validate(createFlightBookingSchema), asyncWrapper(createFlightBooking));

// Buses
router.get('/buses', asyncWrapper(getBuses));
router.get('/buses/:id', asyncWrapper(getBus));
router.post('/bookings/buses', authGuard, validate(createBusBookingSchema), asyncWrapper(createBusBooking));

// Auto Transport
router.post('/bookings/auto', authGuard, validate(createAutoBookingSchema), asyncWrapper(createAutoBooking));
router.get('/bookings/auto/user/:userId', authGuard, asyncWrapper(getUserAutoBookings));

export default router;

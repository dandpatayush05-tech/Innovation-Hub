import { Router } from 'express';
import { getDestinations, getDestination } from '../controllers/destinationController';
import { getHotels, getHotel, createHotel } from '../controllers/hotelController';
import { registerBusiness, getBusiness, getBusinesses } from '../controllers/businessController';
import { createBooking, getUserBookings, updateBookingStatus, createGuideBooking, getUserGuideBookings } from '../controllers/bookingController';
import { createContactRequest, getContactRequests } from '../controllers/contactController';
import { validate } from '../middleware/validate';
import { createBusinessSchema, createHotelSchema, createBookingSchema, updateBookingStatusSchema, createGuideBookingSchema, createContactSchema } from '../validators/travelValidator';
import { authGuard, requireRole } from '../middleware/authGuard';
import { asyncWrapper } from '../utils/asyncWrapper';

const router = Router();

// Destinations
router.get('/destinations', asyncWrapper(getDestinations));
router.get('/destinations/:id', asyncWrapper(getDestination));

// Hotels
router.get('/hotels', asyncWrapper(getHotels));
router.get('/hotels/:id', asyncWrapper(getHotel));
router.post('/hotels', authGuard, requireRole('business'), validate(createHotelSchema), asyncWrapper(createHotel));

// Businesses
router.get('/businesses', authGuard, requireRole('admin'), asyncWrapper(getBusinesses));
router.get('/businesses/:id', asyncWrapper(getBusiness));
router.post('/businesses/register', authGuard, validate(createBusinessSchema), asyncWrapper(registerBusiness));

// Bookings
router.post('/bookings', authGuard, validate(createBookingSchema), asyncWrapper(createBooking));
router.get('/bookings/user/:userId', authGuard, asyncWrapper(getUserBookings));
router.patch('/bookings/:id/status', authGuard, requireRole('business'), validate(updateBookingStatusSchema), asyncWrapper(updateBookingStatus));

// Guide Bookings
router.post('/guide-bookings', authGuard, validate(createGuideBookingSchema), asyncWrapper(createGuideBooking));
router.get('/guide-bookings/user/:userId', authGuard, asyncWrapper(getUserGuideBookings));

// Contact
router.post('/contact', validate(createContactSchema), asyncWrapper(createContactRequest));
router.get('/contact', authGuard, requireRole('admin'), asyncWrapper(getContactRequests));

export default router;

import { Router } from 'express';
import { getDestinations, getDestination, createDestination, updateDestination, deleteDestination } from '../controllers/destinationController';
import { getHotels, getHotel, createHotel, updateHotel, deleteHotel } from '../controllers/hotelController';
import { getTours, getTour, createTour, updateTour, deleteTour } from '../controllers/tourController';
import { registerBusiness, getBusiness, getBusinesses, updateBusiness, deleteBusiness } from '../controllers/businessController';
import { getUserBookings, getUserGuideBookings, createBooking, createGuideBooking } from '../controllers/bookingController';
import { getReviews, createReview, updateReview, deleteReview } from '../controllers/reviewController';
import { createContactRequest, getContactRequests } from '../controllers/contactController';
import { getFlights, getFlight, createFlightBooking } from '../controllers/flightController';
import { getBuses, getBus, createBusBooking } from '../controllers/busController';
import { createAutoBooking, getUserAutoBookings } from '../controllers/autoController';
import { validate } from '../middleware/validate';
import { createBusinessSchema, createHotelSchema, createBookingSchema, updateBookingStatusSchema, createGuideBookingSchema, createContactSchema, createDestinationSchema, updateDestinationSchema, updateBusinessSchema, updateHotelSchema, createTourSchema, updateTourSchema, createReviewSchema, updateReviewSchema, createFlightBookingSchema, createBusBookingSchema, createAutoBookingSchema } from '../validators/travelValidator';
import { authGuard, requireRole } from '../middleware/authGuard';
import { asyncWrapper } from '../utils/asyncWrapper';
import { createRazorpayOrder, verifyRazorpaySignature } from '../controllers/paymentController';
import { globalSearch } from '../controllers/searchController';

const router = Router();

// Search
router.get('/search', asyncWrapper(globalSearch));

// Destinations
router.get('/destinations', asyncWrapper(getDestinations));
router.get('/destinations/:id', asyncWrapper(getDestination));
router.post('/destinations', authGuard, requireRole(['business', 'admin']), validate(createDestinationSchema), asyncWrapper(createDestination));
router.patch('/destinations/:id', authGuard, requireRole(['business', 'admin']), validate(updateDestinationSchema), asyncWrapper(updateDestination));
router.delete('/destinations/:id', authGuard, requireRole(['business', 'admin']), asyncWrapper(deleteDestination));

// Hotels
router.get('/hotels', asyncWrapper(getHotels));
router.get('/hotels/:id', asyncWrapper(getHotel));
router.post('/hotels', authGuard, requireRole('business'), validate(createHotelSchema), asyncWrapper(createHotel));
router.patch('/hotels/:id', authGuard, requireRole(['business', 'admin']), validate(updateHotelSchema), asyncWrapper(updateHotel));
router.delete('/hotels/:id', authGuard, requireRole(['business', 'admin']), asyncWrapper(deleteHotel));

// Tours
router.get('/tours', asyncWrapper(getTours));
router.get('/tours/:id', asyncWrapper(getTour));
router.post('/tours', authGuard, requireRole('business'), validate(createTourSchema), asyncWrapper(createTour));
router.patch('/tours/:id', authGuard, requireRole(['business', 'admin']), validate(updateTourSchema), asyncWrapper(updateTour));
router.delete('/tours/:id', authGuard, requireRole(['business', 'admin']), asyncWrapper(deleteTour));

// Businesses
router.get('/businesses', asyncWrapper(getBusinesses));
router.get('/businesses/:id', asyncWrapper(getBusiness));
router.post('/businesses/register', authGuard, validate(createBusinessSchema), asyncWrapper(registerBusiness));
router.patch('/businesses/:id', authGuard, requireRole(['business', 'admin']), validate(updateBusinessSchema), asyncWrapper(updateBusiness));
router.delete('/businesses/:id', authGuard, requireRole(['business', 'admin']), asyncWrapper(deleteBusiness));

// Bookings
router.post('/bookings', authGuard, validate(createBookingSchema), asyncWrapper(createBooking));
router.get('/bookings/user/:userId', authGuard, asyncWrapper(getUserBookings));
// Flights
router.get('/flights', asyncWrapper(getFlights));
router.get('/flights/:id', asyncWrapper(getFlight));
router.post('/bookings/flights', authGuard, validate(createFlightBookingSchema), asyncWrapper(createFlightBooking));

// Buses
router.get('/buses', asyncWrapper(getBuses));
router.get('/buses/:id', asyncWrapper(getBus));
router.post('/bookings/buses', authGuard, validate(createBusBookingSchema), asyncWrapper(createBusBooking));

// Auto Transport
router.post('/bookings/auto', authGuard, validate(createAutoBookingSchema), asyncWrapper(createAutoBooking));
router.get('/bookings/auto/user/:userId', authGuard, asyncWrapper(getUserAutoBookings));

// Reviews
router.get('/reviews', asyncWrapper(getReviews));
router.post('/reviews', authGuard, validate(createReviewSchema), asyncWrapper(createReview));
router.patch('/reviews/:id', authGuard, validate(updateReviewSchema), asyncWrapper(updateReview));
router.delete('/reviews/:id', authGuard, asyncWrapper(deleteReview));

// Guide Bookings
router.post('/guide-bookings', authGuard, validate(createGuideBookingSchema), asyncWrapper(createGuideBooking));
router.get('/guide-bookings/user/:userId', authGuard, asyncWrapper(getUserGuideBookings));
// Contact
router.post('/contact', validate(createContactSchema), asyncWrapper(createContactRequest));
router.get('/contact', authGuard, requireRole('admin'), asyncWrapper(getContactRequests));

// Payments (Razorpay)
router.post('/payments/create-order', authGuard, asyncWrapper(createRazorpayOrder));
router.post('/payments/verify', authGuard, asyncWrapper(verifyRazorpaySignature));



export default router;
router.get('/bookings/user/:id', authGuard, asyncWrapper(getUserBookings));
router.get('/guide-bookings/user/:id', authGuard, asyncWrapper(getUserGuideBookings));

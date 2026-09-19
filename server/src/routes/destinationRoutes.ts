import { Router } from 'express';
import { getDestinations, getDestination, getDestinationDetail, getCountries, getDestinationWeather, getNearbyDestinations, getDestinationTransport, createDestination, updateDestination, deleteDestination } from '../controllers/destinationController';
import { globalSearch } from '../controllers/searchController';
import { validate } from '../middleware/validate';
import { createDestinationSchema, updateDestinationSchema } from '../validators/destinationValidator';
import { authGuard } from '../middleware/authGuard';
import { requireRole } from '../middleware/requireRole';
import { asyncWrapper } from '../utils/asyncWrapper';

const router = Router();

// Search
router.get('/search', asyncWrapper(globalSearch));

// Destinations
router.get('/destinations/countries', asyncWrapper(getCountries));
router.get('/destinations/:id/detail', asyncWrapper(getDestinationDetail));
router.get('/destinations/:id/weather', asyncWrapper(getDestinationWeather));
router.get('/destinations/:id/nearby', asyncWrapper(getNearbyDestinations));
router.get('/destinations/:id/transport', asyncWrapper(getDestinationTransport));
router.get('/destinations', asyncWrapper(getDestinations));
router.get('/destinations/:id', asyncWrapper(getDestination));
router.post('/destinations', authGuard, requireRole(['business', 'admin']), validate(createDestinationSchema), asyncWrapper(createDestination));
router.patch('/destinations/:id', authGuard, requireRole(['business', 'admin']), validate(updateDestinationSchema), asyncWrapper(updateDestination));
router.delete('/destinations/:id', authGuard, requireRole(['business', 'admin']), asyncWrapper(deleteDestination));

export default router;

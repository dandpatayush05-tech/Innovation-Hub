import { Router } from 'express';
import {
  searchTransport,
  getFlights,
  getFlightById,
  searchFlightsHandler,
  getBuses,
  getBusById,
  estimateTransport
} from '../controllers/transportController';
import { validate } from '../middleware/validate';
import { searchTransportSchema } from '../validators/transportValidator';
import { asyncWrapper } from '../utils/asyncWrapper';

const router = Router();

// Flights endpoints
router.get('/flights', asyncWrapper(getFlights));
router.get('/flights/search', asyncWrapper(searchFlightsHandler));
router.get('/flights/:id', asyncWrapper(getFlightById));

// Buses endpoints
router.get('/buses', asyncWrapper(getBuses));
router.get('/buses/:id', asyncWrapper(getBusById));

// Transport estimation & unified search
router.post('/transport/estimate', asyncWrapper(estimateTransport));
router.post('/transport/search', validate(searchTransportSchema), asyncWrapper(searchTransport));

export default router;


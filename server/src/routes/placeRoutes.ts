import { Router } from 'express';
import { registerBusiness, getBusiness, getBusinesses, updateBusiness, deleteBusiness } from '../controllers/businessController';
import { getPlaces, getPlace, createNewPlace, updateExistingPlace, removePlace, getNearbyPlaces, getPlaceDirections } from '../controllers/placeController';
import { validate, validateQuery } from '../middleware/validate';
import { createBusinessSchema, updateBusinessSchema, createPlaceSchema, updatePlaceSchema, getNearbyPlacesSchema, getDirectionsSchema } from '../validators/placeValidator';
import { authGuard } from '../middleware/authGuard';
import { requireRole } from '../middleware/requireRole';
import { asyncWrapper } from '../utils/asyncWrapper';

const router = Router();

// Places
router.get('/places', asyncWrapper(getPlaces));
router.get('/places/:id', asyncWrapper(getPlace));
router.get('/places/:id/nearby', validateQuery(getNearbyPlacesSchema), asyncWrapper(getNearbyPlaces));
router.get('/places/:id/directions', validateQuery(getDirectionsSchema), asyncWrapper(getPlaceDirections));
router.post('/places', authGuard, requireRole(['business', 'admin']), validate(createPlaceSchema), asyncWrapper(createNewPlace));
router.patch('/places/:id', authGuard, requireRole(['business', 'admin']), validate(updatePlaceSchema), asyncWrapper(updateExistingPlace));
router.delete('/places/:id', authGuard, requireRole(['business', 'admin']), asyncWrapper(removePlace));

// Businesses
router.get('/businesses', asyncWrapper(getBusinesses));
router.get('/businesses/:id', asyncWrapper(getBusiness));
router.post('/businesses/register', authGuard, validate(createBusinessSchema), asyncWrapper(registerBusiness));
router.patch('/businesses/:id', authGuard, requireRole(['business', 'admin']), validate(updateBusinessSchema), asyncWrapper(updateBusiness));
router.delete('/businesses/:id', authGuard, requireRole(['business', 'admin']), asyncWrapper(deleteBusiness));

export default router;

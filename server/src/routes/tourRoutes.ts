import { Router } from 'express';
import { getTours, getTour, createTour, updateTour, deleteTour } from '../controllers/tourController';
import { validate } from '../middleware/validate';
import { createTourSchema, updateTourSchema } from '../validators/tourValidator';
import { authGuard } from '../middleware/authGuard';
import { requireRole } from '../middleware/requireRole';
import { asyncWrapper } from '../utils/asyncWrapper';

const router = Router();

// Tours
router.get('/tours', asyncWrapper(getTours));
router.get('/tours/:id', asyncWrapper(getTour));
router.post('/tours', authGuard, requireRole('business'), validate(createTourSchema), asyncWrapper(createTour));
router.patch('/tours/:id', authGuard, requireRole(['business', 'admin']), validate(updateTourSchema), asyncWrapper(updateTour));
router.delete('/tours/:id', authGuard, requireRole(['business', 'admin']), asyncWrapper(deleteTour));

export default router;

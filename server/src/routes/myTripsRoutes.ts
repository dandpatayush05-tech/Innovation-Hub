import { Router } from 'express';
import multer from 'multer';
import { listTrips, getTrip, uploadPhoto, getRevisit, createTrip } from '../controllers/tripController';
import { authGuard } from '../middleware/authGuard';
import { asyncWrapper } from '../utils/asyncWrapper';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', authGuard, asyncWrapper(listTrips));
router.post('/', authGuard, asyncWrapper(createTrip));
router.get('/:id', authGuard, asyncWrapper(getTrip));
router.get('/:id/revisit', authGuard, asyncWrapper(getRevisit));
router.post('/:id/photos', authGuard, upload.single('photo'), asyncWrapper(uploadPhoto));

export default router;

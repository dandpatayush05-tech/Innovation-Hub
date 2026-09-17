import { Router, Request, Response, NextFunction } from 'express';
import { 
  generateItinerary, getItinerary, getUserItineraries,
  createItinerary, updateItinerary, deleteItinerary, duplicateItinerary
} from '../controllers/itineraryController';
import { validate } from '../middleware/validate';
import { generateItinerarySchema, createItinerarySchema, updateItinerarySchema } from '../validators/itineraryValidator';
import { authGuard } from '../middleware/authGuard';
import { asyncWrapper } from '../utils/asyncWrapper';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

const router = Router();

const generateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: { message: 'Too many itineraries generated, please try again later.' } }
});

const optionalAuth = (req: Request & { user?: { id: string; role: string; email: string; name: string } }, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
      req.user = decoded as { id: string; role: string; email: string; name: string };
    } catch (e) {}
  }
  next();
};

router.post('/generate', generateLimiter, optionalAuth, validate(generateItinerarySchema), asyncWrapper(generateItinerary));
router.post('/', authGuard, validate(createItinerarySchema), asyncWrapper(createItinerary));
router.get('/user/:userId', authGuard, asyncWrapper(getUserItineraries));
router.get('/:id', optionalAuth, asyncWrapper(getItinerary));
router.patch('/:id', authGuard, validate(updateItinerarySchema), asyncWrapper(updateItinerary));
router.delete('/:id', authGuard, asyncWrapper(deleteItinerary));
router.post('/:id/duplicate', authGuard, asyncWrapper(duplicateItinerary));

export default router;

import { Router, Request, Response, NextFunction } from 'express';
import { generateItinerary, getItinerary, getUserItineraries } from '../controllers/itineraryController';
import { validate } from '../middleware/validate';
import { generateItinerarySchema } from '../validators/itineraryValidator';
import { authGuard } from '../middleware/authGuard';
import { asyncWrapper } from '../utils/asyncWrapper';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

const router = Router();

const generateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 generations per hour
  message: { error: { message: 'Too many itineraries generated, please try again later.' } }
});

// Optional Auth Guard to attach req.user if token is present, but don't block if absent
const optionalAuth = (req: Request & { user?: any }, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = jwt.verify(token, env.JWT_ACCESS_SECRET);
    } catch (e) {}
  }
  next();
};

router.post('/generate', generateLimiter, optionalAuth, validate(generateItinerarySchema), asyncWrapper(generateItinerary));
router.get('/:id', optionalAuth, asyncWrapper(getItinerary));
router.get('/user/:userId', authGuard, asyncWrapper(getUserItineraries));

export default router;

import { Router } from 'express';
import { register, login, refresh, logout, getMe, updateMe } from '../controllers/authController';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema, updateMeSchema } from '../validators/authValidator';
import { authGuard } from '../middleware/authGuard';
import { asyncWrapper } from '../utils/asyncWrapper';
import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per IP
  message: { error: { message: 'Too many authentication attempts, please try again later.' } }
});

router.post('/register', authLimiter, validate(registerSchema), asyncWrapper(register));
router.post('/login', authLimiter, validate(loginSchema), asyncWrapper(login));
router.post('/refresh', asyncWrapper(refresh));
router.post('/logout', authGuard, asyncWrapper(logout));
router.get('/me', authGuard, asyncWrapper(getMe));
router.patch('/me', authGuard, validate(updateMeSchema), asyncWrapper(updateMe));

export default router;

import { Router } from 'express';
import { register, login, refresh, logout, getMe, updateMe } from '../controllers/authController';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema, updateMeSchema } from '../validators/authValidator';
import { authGuard } from '../middleware/authGuard';
import { asyncWrapper } from '../utils/asyncWrapper';

const router = Router();
router.post('/register', validate(registerSchema), asyncWrapper(register));
router.post('/login', validate(loginSchema), asyncWrapper(login));
router.post('/refresh', asyncWrapper(refresh));
router.post('/logout', authGuard, asyncWrapper(logout));
router.get('/me', authGuard, asyncWrapper(getMe));
router.patch('/me', authGuard, validate(updateMeSchema), asyncWrapper(updateMe));

export default router;

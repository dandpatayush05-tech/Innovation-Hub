import { Router } from 'express';
import { register, login, refresh, logout, getMe, updateMe, changePassword, resetPassword } from '../controllers/authController';
import { validate } from '../middleware/validate';
import { updateMeSchema } from '../validators/authValidator';
import { authGuard } from '../middleware/authGuard';
import { asyncWrapper } from '../utils/asyncWrapper';

const router = Router();
router.post('/register', asyncWrapper(register));
router.post('/login', asyncWrapper(login));
router.post('/refresh', asyncWrapper(refresh));
router.post('/logout', authGuard, asyncWrapper(logout));
router.post('/change-password', authGuard, asyncWrapper(changePassword));
router.post('/reset-password', asyncWrapper(resetPassword));
router.get('/me', authGuard, asyncWrapper(getMe));
router.patch('/me', authGuard, validate(updateMeSchema), asyncWrapper(updateMe));

export default router;

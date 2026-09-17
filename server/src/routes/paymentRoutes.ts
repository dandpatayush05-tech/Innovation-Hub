import { Router } from 'express';
import { createRazorpayOrder, verifyRazorpaySignature } from '../controllers/paymentController';
import { authGuard } from '../middleware/authGuard';
import { asyncWrapper } from '../utils/asyncWrapper';

const router = Router();

router.post('/create-order', authGuard, asyncWrapper(createRazorpayOrder));
router.post('/verify', authGuard, asyncWrapper(verifyRazorpaySignature));

export default router;

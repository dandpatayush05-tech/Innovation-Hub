import { Router } from 'express';
import { createRazorpayOrder, verifyRazorpaySignature, getPayments, downloadReceipt, getOverview, downloadCombinedReceipt, getPaymentStatus } from '../controllers/paymentController';
import { authGuard } from '../middleware/authGuard';
import { asyncWrapper } from '../utils/asyncWrapper';
import { validate } from '../middleware/validate';
import { createOrderSchema, verifyPaymentSchema } from '../validators/paymentValidators';

const router = Router();

router.get('/overview', authGuard, asyncWrapper(getOverview));
router.post('/order', authGuard, validate(createOrderSchema), asyncWrapper(createRazorpayOrder));
router.post('/verify', authGuard, validate(verifyPaymentSchema), asyncWrapper(verifyRazorpaySignature));
router.get('/', authGuard, asyncWrapper(getPayments));
router.get('/:id', authGuard, asyncWrapper(getPaymentStatus));
router.get('/:id/receipt', authGuard, asyncWrapper(downloadReceipt));
router.get('/groups/:id/receipt', authGuard, asyncWrapper(downloadCombinedReceipt));

// Backward compatibility or legacy paths if frontend hasn't updated yet (optional)
router.post('/create-order', authGuard, asyncWrapper(createRazorpayOrder));

export default router;

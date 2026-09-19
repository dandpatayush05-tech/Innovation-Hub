import { z } from 'zod';

export const createOrderSchema = z.object({
  bookingIds: z.array(z.string().uuid()).min(1, 'At least one booking ID is required'),
  discountCode: z.string().optional()
});

export const verifyPaymentSchema = z.object({
  paymentGroupId: z.string().uuid(),
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string()
});

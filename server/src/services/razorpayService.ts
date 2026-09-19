import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret',
});

export const createOrder = async (amount: number, currency: string = 'INR') => {
  const options = {
    amount: Math.round(amount * 100), // amount in smallest currency unit (paise)
    currency,
    receipt: `receipt_${Date.now()}`
  };

  const order = await razorpay.orders.create(options);
  return order;
};

export const verifySignature = (orderId: string, paymentId: string, signature: string): boolean => {
  const secret = process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret';
  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === signature;
};

export const verifyWebhookSignature = (rawBody: Buffer, signature: string, secret: string): boolean => {
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
};

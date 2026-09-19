import api from '../lib/axios';

export interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  calculatedAmount?: number;
}

export interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  booking_id?: string;
  booking_type?: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
}

export interface CreateOrderParams {
  booking_id: string;
  booking_type: 'hotel' | 'tour' | 'flight' | 'bus' | 'auto';
}

export const createRazorpayOrder = async (params: CreateOrderParams): Promise<CreateOrderResponse> => {
  const response = await api.post('/payments/create-order', params);
  return response.data;
};

export const verifyRazorpayPayment = async (data: VerifyPaymentPayload): Promise<VerifyPaymentResponse> => {
  const response = await api.post('/payments/verify', data);
  return response.data;
};

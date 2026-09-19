import api from '../lib/axios';

export interface CreateOrderResponse {
  paymentGroupId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  calculatedAmount?: number;
}

export interface VerifyPaymentPayload {
  paymentGroupId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
}

export interface CreateOrderParams {
  bookingIds: string[];
  discountCode?: string;
}

export interface PaymentOverviewItem {
  booking_id: string;
  item_type: string;
  amount: number;
  label: string;
}

export interface PaymentOverviewResponse {
  tripLabel: string;
  items: PaymentOverviewItem[];
  subtotal: number;
  discountAmount: number;
  discountLabel: string | null;
  serviceFee: number;
  total: number;
  benefits: string[];
}

export const getOverview = async (bookingIds: string[]): Promise<PaymentOverviewResponse> => {
  const response = await api.get('/payments/overview', { params: { bookingIds: bookingIds.join(',') } });
  return response.data;
};

export const createRazorpayOrder = async (params: CreateOrderParams): Promise<CreateOrderResponse> => {
  const response = await api.post('/payments/order', params);
  return response.data;
};

export const verifyRazorpayPayment = async (data: VerifyPaymentPayload): Promise<VerifyPaymentResponse> => {
  const response = await api.post('/payments/verify', data);
  return response.data;
};

// Legacy for backward compatibility (optional if any old components still call it)
export const createLegacyOrder = async (params: { booking_id: string; booking_type: string; trip_id?: string }) => {
  const response = await api.post('/payments/create-order', params);
  return response.data;
};

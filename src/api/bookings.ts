import api from '../lib/axios';
import { UnifiedBooking, Booking, GuideBooking } from '../types/booking';
export * from '../types/booking';

export const getUnifiedBookings = async (): Promise<{ bookings: UnifiedBooking[] }> => {
  const { data } = await api.get('/bookings');
  return data;
};

export const cancelBooking = async (id: string, type: UnifiedBooking['type']): Promise<{ message: string }> => {
  const { data } = await api.post(`/bookings/${id}/cancel`, { type });
  return data;
};

// Legacy/Module-specific Booking Types and Functions



export const createBooking = async (data: Partial<Booking>) => {
  const response = await api.post('/bookings', data);
  return response.data;
};

export const createGuideBooking = async (data: Partial<GuideBooking>) => {
  const response = await api.post('/guide-bookings', data);
  return response.data;
};

export const getUserBookings = async (userId: string) => {
  const response = await api.get(`/bookings/user/${userId}`);
  return response.data;
};

export const getUserGuideBookings = async (userId: string) => {
  const response = await api.get(`/guide-bookings/user/${userId}`);
  return response.data;
};

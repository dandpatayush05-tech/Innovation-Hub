import api from './axios';

export interface UnifiedBooking {
  id: string;
  user_id: string;
  type: 'hotel' | 'experience' | 'flight' | 'bus' | 'auto';
  status: 'pending' | 'confirmed' | 'cancelled' | 'requested' | 'in_progress' | 'completed';
  date: string;
  title: string;
  subtitle: string;
  amount: number | null;
  created_at: string;
}

export const getUnifiedBookings = async (): Promise<{ bookings: UnifiedBooking[] }> => {
  const { data } = await api.get('/bookings');
  return data;
};

export const cancelBooking = async (id: string, type: UnifiedBooking['type']): Promise<{ message: string }> => {
  const { data } = await api.post(`/bookings/${id}/cancel`, { type });
  return data;
};

// Legacy/Module-specific Booking Types and Functions

export interface Booking {
  id: string;
  hotel_id: string;
  user_id: string;
  check_in_date: string;
  check_out_date: string;
  guests: number;
  rooms: number;
  total_price: number;
  status: string;
  hotel?: { name: string; image_url: string; };
  occasion?: string;
}

export interface GuideBooking {
  id: string;
  tour_id: string;
  user_id: string;
  booking_date: string;
  participants: number;
  total_price: number;
  status: string;
  tour?: { name: string; };
  occasion?: string;
}

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

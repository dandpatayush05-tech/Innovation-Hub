import api from '../lib/axios';

export interface AutoBookingRequest {
  start_date: string;
  pickup_location: string;
  dropoff_location: string;
  passenger_count: number;
  vehicle_type: string;
  additional_instructions?: string;
}

export interface AutoBooking {
  id: string;
  user_id: string;
  auto_id: string | null;
  start_date: string;
  end_date: string | null;
  pickup_location: string;
  dropoff_location: string;
  passenger_count: number;
  vehicle_type: string;
  additional_instructions: string | null;
  status: 'requested' | 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export const createAutoBooking = async (data: AutoBookingRequest): Promise<{ message: string; booking: AutoBooking }> => {
  const response = await api.post('/bookings/auto', data);
  return response.data;
};

export const getUserAutoBookings = async (userId: string): Promise<{ bookings: AutoBooking[] }> => {
  const response = await api.get(`/bookings/auto/user/${userId}`);
  return response.data;
};

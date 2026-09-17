import api from './axios';

export interface Bus {
  id: string;
  business_id: string;
  operator_name: string;
  route_source: string;
  route_destination: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  total_seats: number;
  created_at: string;
  bookedSeats?: string[]; // Augmented from API
}

export interface GetBusesParams {
  source?: string;
  destination?: string;
  date?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  limit?: number;
  page?: number;
}

export const getBuses = async (params?: GetBusesParams): Promise<{ data: Bus[], pagination: any }> => {
  const { data } = await api.get('/buses', { params });
  return data;
};

export const getBus = async (id: string): Promise<{ data: Bus }> => {
  const { data } = await api.get(`/buses/${id}`);
  return data;
};

export interface CreateBusBookingData {
  bus_id: string;
  seats: number;
  passenger_details: {
    firstName: string;
    lastName: string;
    seatNumber: string;
  }[];
}

export const createBusBooking = async (bookingData: CreateBusBookingData): Promise<{ message: string, booking: any }> => {
  const { data } = await api.post('/bookings/buses', bookingData);
  return data;
};

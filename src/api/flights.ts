import api from '../lib/axios';

export interface Flight {
  id: string;
  business_id: string;
  airline: string;
  flight_number: string;
  departure_airport: string;
  arrival_airport: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  created_at: string;
  updated_at: string;
  bookedSeats?: string[];
}

export interface FlightsResponse {
  data: Flight[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
}

export interface FlightBooking {
  id: string;
  user_id: string;
  flight_id: string;
  passengers: number;
  passenger_details: any[];
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
  updated_at: string;
  flight?: Flight;
}

export const searchFlights = async (params: FlightSearchParams): Promise<{ outbound: Flight[], return: Flight[] | null }> => {
  const response = await api.get('/flights/search', { params });
  return response.data;
};

export const getFlight = async (id: string): Promise<{ data: Flight }> => {
  const response = await api.get(`/flights/${id}`);
  return response.data;
};

export const createFlightBooking = async (data: {
  flight_id: string;
  passengers: number;
  passenger_details?: any[];
}): Promise<{ message: string; booking: FlightBooking }> => {
  const response = await api.post('/bookings/flights', data);
  return response.data;
};

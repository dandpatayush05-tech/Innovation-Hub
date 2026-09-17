import api from './axios';

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

export interface GetFlightsParams {
  page?: number;
  limit?: number;
  search?: string;
  departureAirport?: string;
  arrivalAirport?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  order?: 'asc' | 'desc';
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

export const getFlights = async (params?: GetFlightsParams): Promise<FlightsResponse> => {
  const response = await api.get('/flights', { params });
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

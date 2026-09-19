import api from '../lib/axios';

export interface Coordinate {
  lat: number;
  lng: number;
}

export interface TransportSearchParams {
  from: Coordinate;
  to: Coordinate;
  date: string;
  passengers: number;
  sortBy: 'price' | 'comfort';
}

export interface TransportOption {
  id: string;
  mode: 'flight' | 'bus' | 'auto';
  fare: number;
  comfortScore: number;
  etaMin: number;
  provider: string;
  providerDetails: {
    name: string;
    identifier: string;
    departureTime: string;
    arrivalTime: string;
  };
}

export interface TransportSearchResponse {
  distances: {
    flight: { distanceKm: number; durationMin: number };
    bus: { distanceKm: number; durationMin: number };
    auto: { distanceKm: number; durationMin: number };
  };
  options: TransportOption[];
}

export const searchTransport = async (params: TransportSearchParams): Promise<TransportSearchResponse> => {
  const response = await api.post('/transport/search', params);
  return response.data;
};

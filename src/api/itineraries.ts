import api from './axios';

export type ActivityType = 'hotel' | 'flight' | 'bus' | 'auto' | 'attraction' | 'experience' | 'restaurant' | 'note';

export interface ItineraryActivity {
  id?: string;
  time: string;
  title: string;
  description: string;
  type?: ActivityType;
  estimated_cost?: number;
  booking_id?: string;
  booking_status?: 'planned' | 'booked';
  reference_id?: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  activities: ItineraryActivity[];
}

export interface Itinerary {
  id: string;
  user_id: string | null;
  name?: string;
  prompt: string;
  destination: string;
  start_date?: string;
  end_date?: string;
  travelers?: number;
  estimated_budget: string;
  notes?: string;
  cover_image?: string;
  is_public?: boolean;
  ai_recommendations: string[];
  days: ItineraryDay[];
  created_at: string;
  updated_at?: string;
}

export const generateItinerary = async (prompt: string): Promise<{ message: string; itinerary: Itinerary }> => {
  const { data } = await api.post('/itineraries/generate', { prompt });
  return data;
};

export const createItinerary = async (itinerary: Partial<Itinerary>): Promise<{ itinerary: Itinerary }> => {
  const { data } = await api.post('/itineraries', itinerary);
  return data;
};

export const getUserItineraries = async (userId: string): Promise<{ itineraries: Itinerary[] }> => {
  const { data } = await api.get(`/itineraries/user/${userId}`);
  return data;
};

export const getItinerary = async (id: string): Promise<{ itinerary: Itinerary }> => {
  const { data } = await api.get(`/itineraries/${id}`);
  return data;
};

export const updateItinerary = async (id: string, updates: Partial<Itinerary>): Promise<{ itinerary: Itinerary }> => {
  const { data } = await api.patch(`/itineraries/${id}`, updates);
  return data;
};

export const deleteItinerary = async (id: string): Promise<{ message: string }> => {
  const { data } = await api.delete(`/itineraries/${id}`);
  return data;
};

export const duplicateItinerary = async (id: string): Promise<{ itinerary: Itinerary }> => {
  const { data } = await api.post(`/itineraries/${id}/duplicate`);
  return data;
};

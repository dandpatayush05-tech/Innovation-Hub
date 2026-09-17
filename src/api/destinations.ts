import api from './axios';

export interface IntelligenceData {
  where_to_go?: string[];
  how_to_reach?: {
    flight?: string;
    train?: string;
    bus?: string;
    auto?: string;
  };
  best_time_to_visit?: {
    months?: string;
    notes?: string;
  };
  what_to_do?: string[];
  budget?: {
    hotel?: number;
    food?: number;
    activities?: number;
  };
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  description: string;
  image_url: string;
  tags: string[];
  latitude?: number;
  longitude?: number;
  intelligence_data?: IntelligenceData;
  created_at: string;
  updated_at: string;
}

export interface DestinationsResponse {
  data: Destination[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GetDestinationsParams {
  page?: number;
  limit?: number;
  search?: string;
  country?: string;
  tag?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export const getDestinations = async (params?: GetDestinationsParams): Promise<DestinationsResponse> => {
  const response = await api.get('/destinations', { params });
  return response.data;
};

export const getDestination = async (id: string): Promise<{ data: Destination }> => {
  const response = await api.get(`/destinations/${id}`);
  return response.data;
};

export const createDestination = async (data: Partial<Destination>): Promise<{ data: Destination }> => {
  const response = await api.post('/destinations', data);
  return response.data;
};

export const updateDestination = async (id: string, data: Partial<Destination>): Promise<{ data: Destination }> => {
  const response = await api.patch(`/destinations/${id}`, data);
  return response.data;
};

export const deleteDestination = async (id: string): Promise<void> => {
  await api.delete(`/destinations/${id}`);
};

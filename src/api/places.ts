import api from '../lib/axios';

export interface Place {
  id: string;
  business_id: string;
  name: string;
  description: string;
  category: string;
  address: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  image_url: string;
  created_at: string;
  updated_at: string;
}

export interface GetPlacesParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  city?: string;
  country?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PlacesResponse {
  data: Place[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const getPlaces = async (params?: GetPlacesParams): Promise<PlacesResponse> => {
  const response = await api.get('/places', { params });
  return response.data;
};

export const getPlace = async (id: string): Promise<{ data: Place }> => {
  const response = await api.get(`/places/${id}`);
  return response.data;
};

import api from './axios';

export interface Hotel {
  id: string;
  business_id: string;
  destination_id: string;
  name: string;
  description: string;
  price_per_night: number;
  amenities?: string[];
  rating?: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface HotelsResponse {
  data: Hotel[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GetHotelsParams {
  page?: number;
  limit?: number;
  search?: string;
  destinationId?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export const getHotels = async (params?: GetHotelsParams): Promise<HotelsResponse> => {
  const response = await api.get('/hotels', { params });
  return response.data;
};

export const getHotel = async (id: string): Promise<{ data: Hotel }> => {
  const response = await api.get(`/hotels/${id}`);
  return response.data;
};

export const createHotel = async (data: Partial<Hotel> & { destinationId: string, pricePerNight: number, imageUrl?: string }): Promise<{ message: string, data: Hotel }> => {
  const response = await api.post('/hotels', data);
  return response.data;
};

export const updateHotel = async (id: string, data: Partial<Hotel> & { destinationId?: string, pricePerNight?: number, imageUrl?: string }): Promise<{ data: Hotel }> => {
  const response = await api.patch(`/hotels/${id}`, data);
  return response.data;
};

export const deleteHotel = async (id: string): Promise<void> => {
  await api.delete(`/hotels/${id}`);
};

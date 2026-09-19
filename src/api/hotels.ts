import api from '../lib/axios';
import { Hotel, HotelsResponse } from '../types/hotel';
export * from '../types/hotel';

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

export interface GetNearbyHotelsParams {
  latitude: number;
  longitude: number;
  radius?: number;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  page?: number;
  limit?: number;
}

export const getNearbyHotels = async (params: GetNearbyHotelsParams): Promise<HotelsResponse> => {
  const response = await api.get('/hotels/nearby', { params });
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

import api from '../lib/axios';
import { Destination, DestinationsResponse } from '../types/destination';
export * from '../types/destination';

export interface GetDestinationsParams {
  page?: number;
  limit?: number;
  search?: string;
  country?: string;
  tag?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  popular?: boolean;
}

export const getDestinations = async (params?: GetDestinationsParams): Promise<DestinationsResponse> => {
  const response = await api.get('/destinations', { params });
  return response.data;
};

export const getDestination = async (id: string): Promise<{ data: Destination }> => {
  const response = await api.get(`/destinations/${id}`);
  return response.data;
};

export const getDestinationDetail = async (id: string): Promise<any> => {
  const response = await api.get(`/destinations/${id}/detail`);
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

export const getDestinationWeather = async (id: string): Promise<any> => {
  const response = await api.get(`/destinations/${id}/weather`);
  return response.data;
};

export const getNearbyDestinations = async (id: string, radius?: number): Promise<any> => {
  const params = radius ? { radius } : {};
  const response = await api.get(`/destinations/${id}/nearby`, { params });
  return response.data;
};

export const getDestinationTransport = async (id: string): Promise<any> => {
  const response = await api.get(`/destinations/${id}/transport`);
  return response.data;
};

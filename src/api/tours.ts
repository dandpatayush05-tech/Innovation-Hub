import api from './axios';

export interface Tour {
  id: string;
  business_id: string;
  destination_id: string;
  name: string;
  description: string;
  price: number;
  duration_hours: number;
  category: string;
  availability: number;
  image_url: string;
  created_at: string;
  updated_at: string;
}

export interface ToursResponse {
  data: Tour[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GetToursParams {
  page?: number;
  limit?: number;
  search?: string;
  destinationId?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minAvailability?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export const getTours = async (params?: GetToursParams): Promise<ToursResponse> => {
  const response = await api.get('/tours', { params });
  return response.data;
};

export const getTour = async (id: string): Promise<{ data: Tour }> => {
  const response = await api.get(`/tours/${id}`);
  return response.data;
};

export const createTour = async (data: Partial<Tour> & { destinationId: string, durationHours: number, imageUrl?: string }): Promise<{ message: string, data: Tour }> => {
  const response = await api.post('/tours', data);
  return response.data;
};

export const updateTour = async (id: string, data: Partial<Tour> & { destinationId?: string, durationHours?: number, imageUrl?: string }): Promise<{ data: Tour }> => {
  const response = await api.patch(`/tours/${id}`, data);
  return response.data;
};

export const deleteTour = async (id: string): Promise<void> => {
  await api.delete(`/tours/${id}`);
};

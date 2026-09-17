import api from './axios';

export interface Business {
  id: string;
  user_id: string;
  business_name: string;
  business_type: 'hotel' | 'agency' | 'guide';
  description?: string;
  location?: string;
  contact_email: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface BusinessesResponse {
  data: Business[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GetBusinessesParams {
  page?: number;
  limit?: number;
  search?: string;
  business_type?: 'hotel' | 'agency' | 'guide';
  location?: string;
  verified?: boolean;
  user_id?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export const getBusinesses = async (params?: GetBusinessesParams): Promise<BusinessesResponse> => {
  const response = await api.get('/businesses', { params });
  return response.data;
};

export const getBusiness = async (id: string): Promise<{ data: Business }> => {
  const response = await api.get(`/businesses/${id}`);
  return response.data;
};

export const registerBusiness = async (data: Partial<Business>): Promise<{ message: string, data: Business }> => {
  const response = await api.post('/businesses/register', data);
  return response.data;
};

export const updateBusiness = async (id: string, data: Partial<Business>): Promise<{ data: Business }> => {
  const response = await api.patch(`/businesses/${id}`, data);
  return response.data;
};

export const deleteBusiness = async (id: string): Promise<void> => {
  await api.delete(`/businesses/${id}`);
};

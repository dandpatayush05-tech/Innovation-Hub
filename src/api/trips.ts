import api from '../lib/axios';

export interface Trip {
  id: string;
  destination: string;
  start_date: string;
  end_date: string;
  cover_photo_url: string;
  created_at: string;
  experienceCount?: number;
}

export const getTrips = async (): Promise<{ data: Trip[] }> => {
  const response = await api.get('/trips');
  return response.data;
};

export const getTrip = async (id: string): Promise<{ data: any }> => {
  const response = await api.get(`/trips/${id}`);
  return response.data;
};

export const createTrip = async (data: Partial<Trip>): Promise<{ data: Trip }> => {
  const response = await api.post('/trips', data);
  return response.data;
};

export const getRevisit = async (id: string): Promise<{ data: any }> => {
  const response = await api.get(`/trips/${id}/revisit`);
  return response.data;
};

export const uploadTripPhoto = async (id: string, file: File, caption?: string): Promise<{ data: any }> => {
  const formData = new FormData();
  formData.append('photo', file);
  if (caption) {
    formData.append('caption', caption);
  }
  const response = await api.post(`/trips/${id}/photos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

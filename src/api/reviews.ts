import api from '../lib/axios';
import type { User } from '../context/AuthContext';

export interface Review {
  id: string;
  user_id: string;
  hotel_id?: string;
  tour_id?: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
  verified?: boolean;
  user?: Pick<User, 'id' | 'name'>;
}

export interface ReviewsResponse {
  reviews: Review[];
}

export interface CreateReviewPayload {
  hotel_id?: string;
  tour_id?: string;
  rating: number;
  comment: string;
}

export const getReviews = async (params: { hotel_id?: string; tour_id?: string }): Promise<ReviewsResponse> => {
  const { data } = await api.get('/reviews', { params });
  return data;
};

export const createReview = async (payload: CreateReviewPayload): Promise<{ message: string; review: Review }> => {
  const { data } = await api.post('/reviews', payload);
  return data;
};

export const deleteReview = async (id: string): Promise<{ message: string }> => {
  const { data } = await api.delete(`/reviews/${id}`);
  return data;
};

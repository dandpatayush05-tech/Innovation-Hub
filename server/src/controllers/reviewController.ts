import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middleware/authGuard';

export const getReviews = async (req: Request, res: Response) => {
  const { hotel_id, tour_id } = req.query;

  let query = supabase
    .from('reviews')
    .select('*, user:users(id, name)');

  if (hotel_id) {
    query = query.eq('hotel_id', hotel_id);
  } else if (tour_id) {
    query = query.eq('tour_id', tour_id);
  } else {
    return res.status(400).json({ error: { message: 'Must provide hotel_id or tour_id' } });
  }

  const { data: reviews, error } = await query.order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: { message: 'Failed to fetch reviews' } });
  }

  res.json({ reviews: reviews || [] });
};

export const createReview = async (req: AuthRequest, res: Response) => {
  const { hotel_id, tour_id, rating, comment } = req.body;
  const user_id = req.user?.id;

  // Validate the target resource exists
  if (hotel_id) {
    const { data: hotel } = await supabase.from('hotels').select('id').eq('id', hotel_id).single();
    if (!hotel) return res.status(404).json({ error: { message: 'Hotel not found' } });
  } else if (tour_id) {
    const { data: tour } = await supabase.from('tours').select('id').eq('id', tour_id).single();
    if (!tour) return res.status(404).json({ error: { message: 'Tour not found' } });
  }

  // Enforce 1 review per user per resource
  let existingQuery = supabase.from('reviews').select('id').eq('user_id', user_id);
  if (hotel_id) existingQuery = existingQuery.eq('hotel_id', hotel_id);
  if (tour_id) existingQuery = existingQuery.eq('tour_id', tour_id);

  const { data: existing } = await existingQuery.maybeSingle();
  if (existing) {
    return res.status(409).json({ error: { message: 'You have already reviewed this.' } });
  }

  const { data: review, error } = await supabase
    .from('reviews')
    .insert({ user_id, hotel_id, tour_id, rating, comment })
    .select('*, user:users(id, name)')
    .single();

  if (error || !review) {
    return res.status(500).json({ error: { message: 'Failed to create review' } });
  }

  res.status(201).json({ message: 'Review created successfully', review });
};

export const updateReview = async (req: AuthRequest, res: Response) => {
  const { data: review } = await supabase.from('reviews').select('*').eq('id', req.params.id).single();
  if (!review) return res.status(404).json({ error: { message: 'Review not found' } });

  if (review.user_id !== req.user?.id && req.user?.role !== 'admin') {
    return res.status(403).json({ error: { message: 'Forbidden' } });
  }

  const { data: updatedReview, error } = await supabase
    .from('reviews')
    .update({ ...req.body, updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select('*, user:users(id, name)')
    .single();

  if (error || !updatedReview) {
    return res.status(500).json({ error: { message: 'Failed to update review' } });
  }

  res.json({ message: 'Review updated', review: updatedReview });
};

export const deleteReview = async (req: AuthRequest, res: Response) => {
  const { data: review } = await supabase.from('reviews').select('*').eq('id', req.params.id).single();
  if (!review) return res.status(404).json({ error: { message: 'Review not found' } });

  if (review.user_id !== req.user?.id && req.user?.role !== 'admin') {
    return res.status(403).json({ error: { message: 'Forbidden' } });
  }

  const { error } = await supabase.from('reviews').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: { message: 'Failed to delete review' } });

  res.json({ message: 'Review deleted successfully' });
};

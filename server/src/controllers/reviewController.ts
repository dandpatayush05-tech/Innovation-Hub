import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middleware/authGuard';
import { ApiError, BadRequestError, ForbiddenError, NotFoundError, ConflictError } from '../utils/ApiError';


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
    throw new BadRequestError('Must provide hotel_id or tour_id', undefined);
  }

  const { data: reviews, error } = await query.order('created_at', { ascending: false });

  if (error) {
    throw new ApiError(500, 'Failed to fetch reviews', 'INTERNAL_ERROR', undefined);
  }

  res.json({ reviews: reviews || [] });
};

export const createReview = async (req: AuthRequest, res: Response) => {
  const { hotel_id, tour_id, rating, comment } = req.body;
  const user_id = req.user?.id;

  // Validate the target resource exists and verify booking completion
  if (hotel_id) {
    const { data: hotel } = await supabase.from('hotels').select('id').eq('id', hotel_id).single();
    if (!hotel) throw new NotFoundError('Hotel not found', undefined);

    const { data: booking } = await supabase
      .from('bookings')
      .select('id, status, check_out')
      .eq('user_id', user_id)
      .eq('hotel_id', hotel_id)
      .in('status', ['completed', 'confirmed'])
      .limit(1)
      .maybeSingle();

    if (!booking) {
      throw new ForbiddenError('You can only review hotels you have booked.', undefined);
    }
    if (new Date(booking.check_out) > new Date()) {
      throw new ForbiddenError('You cannot review a hotel before your check-out date.', undefined);
    }

  } else if (tour_id) {
    const { data: tour } = await supabase.from('tours').select('id').eq('id', tour_id).single();
    if (!tour) throw new NotFoundError('Tour not found', undefined);

    const { data: booking } = await supabase
      .from('guide_bookings')
      .select('id, status, date')
      .eq('user_id', user_id)
      .eq('tour_id', tour_id)
      .in('status', ['completed', 'confirmed'])
      .limit(1)
      .maybeSingle();

    if (!booking) {
      throw new ForbiddenError('You can only review tours you have booked.', undefined);
    }
    if (new Date(booking.date) > new Date()) {
      throw new ForbiddenError('You cannot review a tour before its scheduled date.', undefined);
    }
  }

  // Enforce 1 review per user per resource
  let existingQuery = supabase.from('reviews').select('id').eq('user_id', user_id);
  if (hotel_id) existingQuery = existingQuery.eq('hotel_id', hotel_id);
  if (tour_id) existingQuery = existingQuery.eq('tour_id', tour_id);

  const { data: existing } = await existingQuery.maybeSingle();
  if (existing) {
    throw new ConflictError('You have already reviewed this.', undefined);
  }

  const { data: review, error } = await supabase
    .from('reviews')
    .insert({ user_id, hotel_id, tour_id, rating, comment, verified: true })
    .select('*, user:users(id, name)')
    .single();

  if (error || !review) {
    throw new ApiError(500, 'Failed to create review', 'INTERNAL_ERROR', undefined);
  }

  res.status(201).json({ message: 'Review created successfully', review });
};

export const updateReview = async (req: AuthRequest, res: Response) => {
  const { data: review } = await supabase.from('reviews').select('*').eq('id', req.params.id).single();
  if (!review) throw new NotFoundError('Review not found', undefined);

  if (review.user_id !== req.user?.id && req.user?.role !== 'admin') {
    throw new ForbiddenError('Forbidden', undefined);
  }

  const { data: updatedReview, error } = await supabase
    .from('reviews')
    .update({ ...req.body, updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select('*, user:users(id, name)')
    .single();

  if (error || !updatedReview) {
    throw new ApiError(500, 'Failed to update review', 'INTERNAL_ERROR', undefined);
  }

  res.json({ message: 'Review updated', review: updatedReview });
};

export const deleteReview = async (req: AuthRequest, res: Response) => {
  const { data: review } = await supabase.from('reviews').select('*').eq('id', req.params.id).single();
  if (!review) throw new NotFoundError('Review not found', undefined);

  if (review.user_id !== req.user?.id && req.user?.role !== 'admin') {
    throw new ForbiddenError('Forbidden', undefined);
  }

  const { error } = await supabase.from('reviews').delete().eq('id', req.params.id);
  if (error) throw new ApiError(500, 'Failed to delete review', 'INTERNAL_ERROR', undefined);

  res.json({ message: 'Review deleted successfully' });
};

import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest, isOwnerOrAdmin } from '../middleware/authGuard';

export const getHotels = async (req: Request, res: Response) => {
  // Pagination
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
  const offset = (page - 1) * limit;

  let query = supabase.from('hotels').select('*', { count: 'exact' });
  
  if (req.query.destinationId) {
    query = query.eq('destination_id', req.query.destinationId as string);
  }
  
  // Search by name
  if (req.query.search) {
    const searchParam = req.query.search as string;
    query = query.ilike('name', `%${searchParam}%`);
  }

  // Filter by price
  if (req.query.minPrice) {
    query = query.gte('price_per_night', parseFloat(req.query.minPrice as string));
  }
  if (req.query.maxPrice) {
    query = query.lte('price_per_night', parseFloat(req.query.maxPrice as string));
  }

  // Filter by rating
  if (req.query.minRating) {
    query = query.gte('rating', parseFloat(req.query.minRating as string));
  }

  // Sorting
  const sort = (req.query.sort as string) || 'created_at';
  const order = (req.query.order as string) === 'asc' ? true : false; // default desc
  query = query.order(sort, { ascending: order });

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data: hotels, count, error } = await query;

  if (error) {
    return res.status(500).json({ error: { message: 'Failed to fetch hotels', details: error.message } });
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  res.json({
    data: hotels || [],
    pagination: {
      total,
      page,
      limit,
      totalPages
    }
  });
};

export const getHotel = async (req: Request, res: Response) => {
  const { data: hotel, error } = await supabase.from('hotels').select('*').eq('id', req.params.id).single();
  
  if (error || !hotel) return res.status(404).json({ error: { message: 'Hotel not found' } });
  res.json({ data: hotel });
};

export const createHotel = async (req: AuthRequest, res: Response) => {
  // Verify the user owns a business
  const { data: business } = await supabase.from('businesses').select('*').eq('user_id', req.user?.id).single();
  
  if (!business) {
    return res.status(403).json({ error: { message: 'You must register a business before creating a hotel' } });
  }

  // Convert destinationId to destination_id
  const payload = { ...req.body };
  if (payload.destinationId) {
    payload.destination_id = payload.destinationId;
    delete payload.destinationId;
  }
  
  // Convert pricePerNight to price_per_night
  if (payload.pricePerNight) {
    payload.price_per_night = payload.pricePerNight;
    delete payload.pricePerNight;
  }

  // Convert imageUrl to image_url
  if (payload.imageUrl) {
    payload.image_url = payload.imageUrl;
    delete payload.imageUrl;
  }

  payload.business_id = business.id;

  const { data: hotel, error } = await supabase
    .from('hotels')
    .insert(payload)
    .select()
    .single();
    
  if (error || !hotel) {
    return res.status(500).json({ error: { message: 'Failed to create hotel', details: error?.message } });
  }

  res.status(201).json({ message: 'Hotel created successfully', data: hotel });
};

export const updateHotel = async (req: AuthRequest, res: Response) => {
  // Fetch existing hotel to check business_id
  const { data: existingHotel, error: fetchError } = await supabase
    .from('hotels')
    .select('business_id')
    .eq('id', req.params.id)
    .single();

  if (fetchError || !existingHotel) {
    return res.status(404).json({ error: { message: 'Hotel not found' } });
  }

  // Fetch the business to check ownership
  const { data: existingBusiness, error: businessError } = await supabase
    .from('businesses')
    .select('user_id')
    .eq('id', existingHotel.business_id)
    .single();

  if (businessError || !existingBusiness) {
    return res.status(404).json({ error: { message: 'Associated business not found' } });
  }

  if (!isOwnerOrAdmin(req.user!, existingBusiness.user_id)) {
    return res.status(403).json({ error: { message: 'Forbidden: You do not own this hotel' } });
  }

  // Map camelCase to snake_case for DB
  const updateData: Record<string, unknown> = {};
  if (req.body.name) updateData.name = req.body.name;
  if (req.body.description !== undefined) updateData.description = req.body.description;
  if (req.body.destinationId) updateData.destination_id = req.body.destinationId;
  if (req.body.pricePerNight) updateData.price_per_night = req.body.pricePerNight;
  if (req.body.amenities) updateData.amenities = req.body.amenities;
  if (req.body.imageUrl) updateData.image_url = req.body.imageUrl;
  if (req.user?.role === 'admin' && req.body.rating !== undefined) {
      updateData.rating = req.body.rating;
  }

  const { data: hotel, error } = await supabase
    .from('hotels')
    .update(updateData)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error || !hotel) {
    return res.status(500).json({ error: { message: 'Failed to update hotel', details: error?.message } });
  }

  res.json({ data: hotel });
};

export const deleteHotel = async (req: AuthRequest, res: Response) => {
  // Fetch existing hotel to check business_id
  const { data: existingHotel, error: fetchError } = await supabase
    .from('hotels')
    .select('business_id')
    .eq('id', req.params.id)
    .single();

  if (fetchError || !existingHotel) {
    return res.status(404).json({ error: { message: 'Hotel not found' } });
  }

  // Fetch the business to check ownership
  const { data: existingBusiness, error: businessError } = await supabase
    .from('businesses')
    .select('user_id')
    .eq('id', existingHotel.business_id)
    .single();

  if (businessError || !existingBusiness) {
    return res.status(404).json({ error: { message: 'Associated business not found' } });
  }

  if (!isOwnerOrAdmin(req.user!, existingBusiness.user_id)) {
    return res.status(403).json({ error: { message: 'Forbidden: You do not own this hotel' } });
  }

  const { error } = await supabase
    .from('hotels')
    .delete()
    .eq('id', req.params.id);

  if (error) {
    return res.status(500).json({ error: { message: 'Failed to delete hotel', details: error.message } });
  }

  res.status(204).send();
};

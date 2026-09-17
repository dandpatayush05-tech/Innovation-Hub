import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest, isOwnerOrAdmin } from '../middleware/authGuard';

export const getTours = async (req: Request, res: Response) => {
  // Pagination
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
  const offset = (page - 1) * limit;

  let query = supabase.from('tours').select('*', { count: 'exact' });
  
  if (req.query.destinationId) {
    query = query.eq('destination_id', req.query.destinationId as string);
  }
  
  // Search by name or description
  if (req.query.search) {
    const searchParam = req.query.search as string;
    query = query.or(`name.ilike.%${searchParam}%,description.ilike.%${searchParam}%`);
  }

  // Filter by category
  if (req.query.category) {
    query = query.eq('category', req.query.category as string);
  }

  // Filter by price
  if (req.query.minPrice) {
    query = query.gte('price', parseFloat(req.query.minPrice as string));
  }
  if (req.query.maxPrice) {
    query = query.lte('price', parseFloat(req.query.maxPrice as string));
  }

  // Filter by availability
  if (req.query.minAvailability) {
    query = query.gte('availability', parseInt(req.query.minAvailability as string));
  }

  // Sorting
  const sort = (req.query.sort as string) || 'created_at';
  const order = (req.query.order as string) === 'asc' ? true : false; // default desc
  query = query.order(sort, { ascending: order });

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data: tours, count, error } = await query;

  if (error) {
    return res.status(500).json({ error: { message: 'Failed to fetch tours', details: error.message } });
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  res.json({
    data: tours || [],
    pagination: {
      total,
      page,
      limit,
      totalPages
    }
  });
};

export const getTour = async (req: Request, res: Response) => {
  const { data: tour, error } = await supabase.from('tours').select('*').eq('id', req.params.id).single();
  
  if (error || !tour) return res.status(404).json({ error: { message: 'Tour not found' } });
  res.json({ data: tour });
};

export const createTour = async (req: AuthRequest, res: Response) => {
  // Verify the user owns a business
  const { data: business } = await supabase.from('businesses').select('*').eq('user_id', req.user?.id).single();
  
  if (!business) {
    return res.status(403).json({ error: { message: 'You must register a business before creating a tour' } });
  }

  const payload = { ...req.body };
  if (payload.destinationId) {
    payload.destination_id = payload.destinationId;
    delete payload.destinationId;
  }
  if (payload.durationHours) {
    payload.duration_hours = payload.durationHours;
    delete payload.durationHours;
  }
  if (payload.imageUrl) {
    payload.image_url = payload.imageUrl;
    delete payload.imageUrl;
  }

  payload.business_id = business.id;

  const { data: tour, error } = await supabase
    .from('tours')
    .insert(payload)
    .select()
    .single();
    
  if (error || !tour) {
    return res.status(500).json({ error: { message: 'Failed to create tour', details: error?.message } });
  }

  res.status(201).json({ message: 'Tour created successfully', data: tour });
};

export const updateTour = async (req: AuthRequest, res: Response) => {
  // Fetch existing tour to check business_id
  const { data: existingTour, error: fetchError } = await supabase
    .from('tours')
    .select('business_id')
    .eq('id', req.params.id)
    .single();

  if (fetchError || !existingTour) {
    return res.status(404).json({ error: { message: 'Tour not found' } });
  }

  // Fetch the business to check ownership
  const { data: existingBusiness, error: businessError } = await supabase
    .from('businesses')
    .select('user_id')
    .eq('id', existingTour.business_id)
    .single();

  if (businessError || !existingBusiness) {
    return res.status(404).json({ error: { message: 'Associated business not found' } });
  }

  if (!isOwnerOrAdmin(req.user!, existingBusiness.user_id)) {
    return res.status(403).json({ error: { message: 'Forbidden: You do not own this tour' } });
  }

  // Map camelCase to snake_case for DB
  const updateData: Record<string, unknown> = {};
  if (req.body.name) updateData.name = req.body.name;
  if (req.body.description !== undefined) updateData.description = req.body.description;
  if (req.body.destinationId) updateData.destination_id = req.body.destinationId;
  if (req.body.price !== undefined) updateData.price = req.body.price;
  if (req.body.durationHours !== undefined) updateData.duration_hours = req.body.durationHours;
  if (req.body.category !== undefined) updateData.category = req.body.category;
  if (req.body.availability !== undefined) updateData.availability = req.body.availability;
  if (req.body.imageUrl) updateData.image_url = req.body.imageUrl;

  const { data: tour, error } = await supabase
    .from('tours')
    .update(updateData)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error || !tour) {
    return res.status(500).json({ error: { message: 'Failed to update tour', details: error?.message } });
  }

  res.json({ data: tour });
};

export const deleteTour = async (req: AuthRequest, res: Response) => {
  // Fetch existing tour to check business_id
  const { data: existingTour, error: fetchError } = await supabase
    .from('tours')
    .select('business_id')
    .eq('id', req.params.id)
    .single();

  if (fetchError || !existingTour) {
    return res.status(404).json({ error: { message: 'Tour not found' } });
  }

  // Fetch the business to check ownership
  const { data: existingBusiness, error: businessError } = await supabase
    .from('businesses')
    .select('user_id')
    .eq('id', existingTour.business_id)
    .single();

  if (businessError || !existingBusiness) {
    return res.status(404).json({ error: { message: 'Associated business not found' } });
  }

  if (!isOwnerOrAdmin(req.user!, existingBusiness.user_id)) {
    return res.status(403).json({ error: { message: 'Forbidden: You do not own this tour' } });
  }

  const { error } = await supabase
    .from('tours')
    .delete()
    .eq('id', req.params.id);

  if (error) {
    return res.status(500).json({ error: { message: 'Failed to delete tour', details: error.message } });
  }

  res.status(204).send();
};

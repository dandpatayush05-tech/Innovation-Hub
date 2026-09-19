import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middleware/authGuard';
import { isOwnerOrAdmin } from '../middleware/requireRole';
import { ApiError, ForbiddenError, NotFoundError } from '../utils/ApiError';


export const registerBusiness = async (req: AuthRequest, res: Response) => {
  const { data: business, error } = await supabase
    .from('businesses')
    .insert({
      business_name: req.body.businessName,
      business_type: req.body.businessType,
      description: req.body.description,
      location: req.body.location,
      contact_email: req.body.contactEmail,
      user_id: req.user?.id
    })
    .select()
    .single();

  if (error || !business) {
    throw new ApiError(500, 'Failed to register business', 'INTERNAL_ERROR', error?.message);
  }

  res.status(201).json({ message: 'Business registered successfully', data: business });
};

export const getBusinesses = async (req: Request, res: Response) => {
  // Pagination
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
  const offset = (page - 1) * limit;

  let query = supabase.from('businesses').select('*', { count: 'exact' });

  // Search by name or description
  if (req.query.search) {
    const searchParam = req.query.search as string;
    query = query.or(`business_name.ilike.%${searchParam}%,description.ilike.%${searchParam}%`);
  }

  // Filter by category (business_type)
  if (req.query.business_type) {
    query = query.eq('business_type', req.query.business_type as string);
  }

  // Filter by location
  if (req.query.location) {
    query = query.eq('location', req.query.location as string);
  }

  // Filter by verified
  if (req.query.verified !== undefined) {
    query = query.eq('verified', req.query.verified === 'true');
  }

  // Filter by user_id
  if (req.query.user_id) {
    query = query.eq('user_id', req.query.user_id as string);
  }

  // Sorting
  const sort = (req.query.sort as string) || 'created_at';
  const order = (req.query.order as string) === 'asc' ? true : false; // default desc
  query = query.order(sort, { ascending: order });

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data: businesses, count, error } = await query;

  if (error) {
    throw new ApiError(500, 'Failed to fetch businesses', 'INTERNAL_ERROR', error.message);
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  res.json({
    data: businesses || [],
    pagination: {
      total,
      page,
      limit,
      totalPages
    }
  });
};

export const getBusiness = async (req: Request, res: Response) => {
  const { data: business, error } = await supabase.from('businesses').select('*').eq('id', req.params.id).single();
  
  if (error || !business) throw new NotFoundError('Business not found', undefined);
  res.json({ data: business });
};

export const updateBusiness = async (req: AuthRequest, res: Response) => {
  // Fetch existing business for ownership check
  const { data: existingBusiness, error: fetchError } = await supabase
    .from('businesses')
    .select('user_id')
    .eq('id', req.params.id)
    .single();

  if (fetchError || !existingBusiness) {
    throw new NotFoundError('Business not found', undefined);
  }

  if (!isOwnerOrAdmin(req.user!, existingBusiness.user_id)) {
    throw new ForbiddenError('Forbidden: You do not own this business', undefined);
  }

  const updateData: Record<string, unknown> = {};
  if (req.body.businessName) updateData.business_name = req.body.businessName;
  if (req.body.businessType) updateData.business_type = req.body.businessType;
  if (req.body.description !== undefined) updateData.description = req.body.description;
  if (req.body.location !== undefined) updateData.location = req.body.location;
  if (req.body.latitude !== undefined) updateData.latitude = req.body.latitude;
  if (req.body.longitude !== undefined) updateData.longitude = req.body.longitude;
  if (req.body.contactEmail) updateData.contact_email = req.body.contactEmail;
  if (req.user?.role === 'admin' && req.body.verified !== undefined) {
      updateData.verified = req.body.verified;
  }

  const { data: business, error } = await supabase
    .from('businesses')
    .update(updateData)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error || !business) {
    throw new ApiError(500, 'Failed to update business', 'INTERNAL_ERROR', error?.message);
  }

  res.json({ data: business });
};

export const deleteBusiness = async (req: AuthRequest, res: Response) => {
  // Fetch existing business for ownership check
  const { data: existingBusiness, error: fetchError } = await supabase
    .from('businesses')
    .select('user_id')
    .eq('id', req.params.id)
    .single();

  if (fetchError || !existingBusiness) {
    throw new NotFoundError('Business not found', undefined);
  }

  if (!isOwnerOrAdmin(req.user!, existingBusiness.user_id)) {
    throw new ForbiddenError('Forbidden: You do not own this business', undefined);
  }

  const { error } = await supabase
    .from('businesses')
    .delete()
    .eq('id', req.params.id);

  if (error) {
    throw new ApiError(500, 'Failed to delete business', 'INTERNAL_ERROR', error.message);
  }

  res.status(204).send();
};

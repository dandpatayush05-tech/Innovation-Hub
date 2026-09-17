import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const getDestinations = async (req: Request, res: Response) => {
  // Pagination
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 10, 50); // safe max limit 50
  const offset = (page - 1) * limit;

  // Base query with count
  let query = supabase.from('destinations').select('*', { count: 'exact' });

  // Search by name or description
  if (req.query.search) {
    const searchParam = req.query.search as string;
    query = query.or(`name.ilike.%${searchParam}%,description.ilike.%${searchParam}%`);
  }

  // Filter by country
  if (req.query.country) {
    query = query.eq('country', req.query.country as string);
  }

  // Filter by tags
  if (req.query.tag) {
    query = query.contains('tags', [req.query.tag as string]);
  }

  // Sorting
  const sort = (req.query.sort as string) || 'created_at';
  const order = (req.query.order as string) === 'asc' ? true : false; // default desc
  query = query.order(sort, { ascending: order });

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data: destinations, count, error } = await query;

  if (error) {
    return res.status(500).json({ error: { message: 'Failed to fetch destinations', details: error.message } });
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  res.json({
    data: destinations || [],
    pagination: {
      total,
      page,
      limit,
      totalPages
    }
  });
};

export const getDestination = async (req: Request, res: Response) => {
  const { data: destination, error } = await supabase
    .from('destinations')
    .select('*')
    .eq('id', req.params.id)
    .single();
  
  if (error || !destination) {
    return res.status(404).json({ error: { message: 'Destination not found' } });
  }
  
  res.json({ data: destination });
};

export const createDestination = async (req: Request, res: Response) => {
  const { data: destination, error } = await supabase
    .from('destinations')
    .insert([req.body])
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: { message: 'Failed to create destination', details: error.message } });
  }

  res.status(201).json({ data: destination });
};

export const updateDestination = async (req: Request, res: Response) => {
  const { data: destination, error } = await supabase
    .from('destinations')
    .update(req.body)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error || !destination) {
    return res.status(404).json({ error: { message: 'Failed to update destination or not found' } });
  }

  res.json({ data: destination });
};

export const deleteDestination = async (req: Request, res: Response) => {
  const { error } = await supabase
    .from('destinations')
    .delete()
    .eq('id', req.params.id);

  if (error) {
    return res.status(400).json({ error: { message: 'Failed to delete destination', details: error.message } });
  }

  res.status(204).send();
};

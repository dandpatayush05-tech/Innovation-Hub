import { supabase } from '../config/supabase';

export interface GetBusesParams {
  source?: string;
  destination?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  order?: string;
  limit?: number;
  page?: number;
}

export const listBuses = async (params: GetBusesParams = {}) => {
  const {
    source,
    destination,
    minPrice,
    maxPrice,
    sort = 'created_at',
    order = 'desc',
    limit = 20,
    page = 1
  } = params;

  let query = supabase.from('buses').select('*', { count: 'exact' });
  
  if (source) {
    query = query.ilike('route_source', `%${source}%`);
  }
  if (destination) {
    query = query.ilike('route_destination', `%${destination}%`);
  }

  if (minPrice) query = query.gte('price', minPrice);
  if (maxPrice) query = query.lte('price', maxPrice);

  const from = (Number(page) - 1) * Number(limit);
  const to = from + Number(limit) - 1;
  
  query = query
    .order(sort as string, { ascending: order === 'asc' })
    .range(from, to);

  const { data, count, error } = await query;

  if (error) throw error;

  return {
    data: data || [],
    pagination: {
      total: count || 0,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil((count || 0) / Number(limit))
    }
  };
};

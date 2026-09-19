import { supabase } from '../config/supabase';

export interface GetAutosParams {
  city?: string;
  vehicleType?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  order?: string;
  limit?: number;
  page?: number;
}

export const listAutos = async (params: GetAutosParams = {}) => {
  const {
    city,
    vehicleType,
    minPrice,
    maxPrice,
    sort = 'created_at',
    order = 'desc',
    limit = 20,
    page = 1
  } = params;

  let query = supabase.from('auto_vehicles').select('*', { count: 'exact' });

  if (city) {
    query = query.ilike('city', `%${city}%`);
  }
  if (vehicleType) {
    query = query.eq('vehicle_type', vehicleType);
  }

  if (minPrice) query = query.gte('price_per_day', minPrice);
  if (maxPrice) query = query.lte('price_per_day', maxPrice);

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

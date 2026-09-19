import { supabase } from '../config/supabase';

export interface GetFlightsParams {
  search?: string;
  departureAirport?: string;
  arrivalAirport?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  order?: string;
  limit?: number;
  page?: number;
}

export const listFlights = async (params: GetFlightsParams = {}) => {
  const {
    search,
    departureAirport,
    arrivalAirport,
    minPrice,
    maxPrice,
    sort = 'created_at',
    order = 'desc',
    limit = 20,
    page = 1
  } = params;

  let query = supabase.from('flights').select('*', { count: 'exact' });

  if (search) {
    query = query.or(`airline.ilike.%${search}%,departure_airport.ilike.%${search}%,arrival_airport.ilike.%${search}%`);
  }
  
  if (departureAirport) {
    query = query.ilike('departure_airport', `%${departureAirport}%`);
  }
  if (arrivalAirport) {
    query = query.ilike('arrival_airport', `%${arrivalAirport}%`);
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

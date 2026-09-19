import { supabase } from '../config/supabase';

export const listPlaces = async (params: any = {}) => {
  const { search, category, country, sort = 'created_at', order = 'desc', limit = 20, page = 1 } = params;

  let selectStr = '*';
  if (country) {
    selectStr = '*, destination:destinations!inner(country)';
  }

  let query = supabase.from('places').select(selectStr, { count: 'exact' });

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }
  if (category) {
    query = query.eq('category', category);
  }
  if (country) {
    query = query.eq('destination.country', country);
  }

  const from = (Number(page) - 1) * Number(limit);
  const to = from + Number(limit) - 1;

  query = query
    .order(sort as string, { ascending: order === 'asc' })
    .range(from, to);

  const { data, count, error } = await query;
  if (error) throw error;
  
  return {
    data,
    pagination: {
      total: count,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil((count || 0) / Number(limit))
    }
  };
};

export const getPlaceById = async (id: string) => {
  const { data, error } = await supabase
    .from('places')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const createPlace = async (placeData: any) => {
  const { data, error } = await supabase
    .from('places')
    .insert(placeData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updatePlace = async (id: string, placeData: any) => {
  const { data, error } = await supabase
    .from('places')
    .update(placeData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deletePlace = async (id: string) => {
  const { error } = await supabase
    .from('places')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

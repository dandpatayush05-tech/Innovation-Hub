import { supabase } from '../config/supabase';

export const listTours = async (params: {
  page: number;
  limit: number;
  destinationId?: string;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minAvailability?: number;
  sort: string;
  order: boolean;
}) => {
  const offset = (params.page - 1) * params.limit;

  let query = supabase.from('tours').select('*', { count: 'exact' });

  if (params.destinationId) {
    query = query.eq('destination_id', params.destinationId);
  }

  if (params.search) {
    query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%`);
  }

  if (params.category) {
    query = query.eq('category', params.category);
  }

  if (params.minPrice) {
    query = query.gte('price', params.minPrice);
  }
  
  if (params.maxPrice) {
    query = query.lte('price', params.maxPrice);
  }

  if (params.minAvailability) {
    query = query.gte('availability', params.minAvailability);
  }

  query = query.order(params.sort, { ascending: params.order });
  query = query.range(offset, offset + params.limit - 1);

  return await query;
};

export const getTourById = async (id: string) => {
  return await supabase.from('tours').select('*').eq('id', id).single();
};

export const getBusinessByUserId = async (userId: string) => {
  return await supabase.from('businesses').select('*').eq('user_id', userId).single();
};

export const getBusinessOwnerByTourId = async (tourId: string) => {
  const { data: existingTour, error: fetchError } = await supabase
    .from('tours')
    .select('business_id')
    .eq('id', tourId)
    .single();

  if (fetchError || !existingTour) return { error: fetchError || new Error('Tour not found') };

  const { data: existingBusiness, error: businessError } = await supabase
    .from('businesses')
    .select('user_id')
    .eq('id', existingTour.business_id)
    .single();

  if (businessError || !existingBusiness) return { error: businessError || new Error('Associated business not found') };

  return { ownerId: existingBusiness.user_id };
};

export const createTourRecord = async (data: any) => {
  return await supabase
    .from('tours')
    .insert(data)
    .select()
    .single();
};

export const updateTourRecord = async (id: string, data: any) => {
  return await supabase
    .from('tours')
    .update(data)
    .eq('id', id)
    .select()
    .single();
};

export const deleteTourRecord = async (id: string) => {
  return await supabase
    .from('tours')
    .delete()
    .eq('id', id);
};

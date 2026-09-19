import { supabase } from '../config/supabase';

export const listHotels = async (params: {
  page: number;
  limit: number;
  destinationId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort: string;
  order: boolean;
}) => {
  const offset = (params.page - 1) * params.limit;

  let query = supabase.from('hotels').select('*', { count: 'exact' });

  if (params.destinationId) {
    query = query.eq('destination_id', params.destinationId);
  }

  if (params.search) {
    query = query.ilike('name', `%${params.search}%`);
  }

  if (params.minPrice) {
    query = query.gte('price_per_night', params.minPrice);
  }
  
  if (params.maxPrice) {
    query = query.lte('price_per_night', params.maxPrice);
  }

  if (params.minRating) {
    query = query.gte('rating', params.minRating);
  }

  query = query.order(params.sort, { ascending: params.order });
  query = query.range(offset, offset + params.limit - 1);

  return await query;
};

export const getHotelById = async (id: string) => {
  return await supabase.from('hotels').select('*').eq('id', id).single();
};

export const getBusinessByUserId = async (userId: string) => {
  return await supabase.from('businesses').select('*').eq('user_id', userId).single();
};

export const getBusinessOwnerByHotelId = async (hotelId: string) => {
  const { data: existingHotel, error: fetchError } = await supabase
    .from('hotels')
    .select('business_id')
    .eq('id', hotelId)
    .single();

  if (fetchError || !existingHotel) return { error: fetchError || new Error('Hotel not found') };

  const { data: existingBusiness, error: businessError } = await supabase
    .from('businesses')
    .select('user_id')
    .eq('id', existingHotel.business_id)
    .single();

  if (businessError || !existingBusiness) return { error: businessError || new Error('Associated business not found') };

  return { ownerId: existingBusiness.user_id };
};

export const createHotelRecord = async (data: any) => {
  return await supabase
    .from('hotels')
    .insert(data)
    .select()
    .single();
};

export const updateHotelRecord = async (id: string, data: any) => {
  return await supabase
    .from('hotels')
    .update(data)
    .eq('id', id)
    .select()
    .single();
};

export const deleteHotelRecord = async (id: string) => {
  return await supabase
    .from('hotels')
    .delete()
    .eq('id', id);
};

export const listNearbyHotels = async (params: {
  latitude: number;
  longitude: number;
  radius: number;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  page: number;
  limit: number;
}) => {
  const { latitude: lat, longitude: lng, radius, minPrice, maxPrice, rating, page, limit } = params;

  // Approximate 1 degree of latitude = 111 km
  const latDelta = radius / 111;
  const lngDelta = radius / (111 * Math.cos(lat * (Math.PI / 180)));

  const latMin = lat - latDelta;
  const latMax = lat + latDelta;
  const lngMin = lng - lngDelta;
  const lngMax = lng + lngDelta;

  let query = supabase
    .from('hotels')
    .select('*')
    .gte('latitude', latMin)
    .lte('latitude', latMax)
    .gte('longitude', lngMin)
    .lte('longitude', lngMax);

  if (minPrice) query = query.gte('price_per_night', minPrice);
  if (maxPrice) query = query.lte('price_per_night', maxPrice);
  if (rating) query = query.gte('rating', rating);

  const { data, error } = await query;
  if (error) return { error };
  if (!data) return { data: [], count: 0 };

  // Calculate exact distances and filter
  const R = 6371; // Earth radius in km
  let results = data.map((hotel: any) => {
    const dLat = (hotel.latitude - lat) * (Math.PI / 180);
    const dLon = (hotel.longitude - lng) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat * (Math.PI / 180)) * Math.cos(hotel.latitude * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance_km = R * c;

    return { ...hotel, distance_km };
  }).filter((hotel: any) => hotel.distance_km <= radius);

  // Sort by distance
  results.sort((a, b) => a.distance_km - b.distance_km);

  const total = results.length;
  const offset = (page - 1) * limit;
  results = results.slice(offset, offset + limit);

  return { data: results, count: total };
};

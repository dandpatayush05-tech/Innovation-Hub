import { supabase } from '../config/supabase';
import { listHotels } from './hotelService';
import { listTours } from './tourService';
import { calculateHaversineDistance, calculateTravelTime } from './maps';

export const listDestinations = async (params: {
  page: number;
  limit: number;
  search?: string;
  country?: string;
  tag?: string;
  sort: string;
  order: boolean;
  popular?: boolean;
}) => {
  const offset = (params.page - 1) * params.limit;

  let query = supabase.from('destinations').select('*', { count: 'exact' });

  if (params.search) {
    query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%`);
  }

  if (params.country) {
    query = query.eq('country', params.country);
  }

  if (params.tag) {
    query = query.contains('tags', [params.tag]);
  }

  // If popular is true, we sort by name as a placeholder for popularity since no rating exists on destinations
  let sortField = params.sort;
  let isAscending = params.order;
  if (params.popular) {
    sortField = 'name';
    isAscending = true;
  }

  query = query.order(sortField, { ascending: isAscending });
  query = query.range(offset, offset + params.limit - 1);

  return await query;
};

export const getDestinationById = async (id: string) => {
  return await supabase
    .from('destinations')
    .select('*')
    .eq('id', id)
    .single();
};

export const getDestinationDetail = async (id: string) => {
  // 1. Fetch overview
  const { data: overview, error: overviewError } = await supabase
    .from('destinations')
    .select('id, name, country, description, image_url, best_time_to_visit, climate_notes')
    .eq('id', id)
    .single();

  if (overviewError || !overview) {
    throw new Error('Destination not found');
  }

  // 2. Fetch related data concurrently
  const [
    attractionsRes,
    hotelsRes,
    toursRes,
    restaurantsRes,
    shopsRes
  ] = await Promise.all([
    supabase.from('places').select('*').eq('destination_id', id).eq('category', 'attraction').limit(10),
    listHotels({ page: 1, limit: 10, destinationId: id, sort: 'created_at', order: false }),
    listTours({ page: 1, limit: 10, destinationId: id, sort: 'created_at', order: false }),
    supabase.from('places').select('*').eq('destination_id', id).eq('category', 'restaurant').limit(10),
    supabase.from('places').select('*').eq('destination_id', id).eq('category', 'shop').limit(10)
  ]);

  return {
    overview,
    attractions: attractionsRes.data || [],
    hotels: hotelsRes.data || [],
    tours: toursRes.data || [],
    restaurants: restaurantsRes.data || [],
    shops: shopsRes.data || []
  };
};

export const getCountries = async () => {
  // Fetch all destinations to group by country in memory, as Supabase RPC isn't available for this yet.
  const { data: destinations, error } = await supabase
    .from('destinations')
    .select('country, id, image_url');

  if (error) throw error;

  const countryMap = new Map();
  destinations?.forEach(dest => {
    if (!countryMap.has(dest.country)) {
      countryMap.set(dest.country, {
        country: dest.country,
        destination_count: 1,
        image_url: dest.image_url // Just use the first destination's image
      });
    } else {
      const existing = countryMap.get(dest.country);
      existing.destination_count += 1;
    }
  });

  return Array.from(countryMap.values());
};

export const getNearbyDestinations = async (id: string, radiusKm: number = 200) => {
  // 1. Get origin destination coordinates
  const origin = await getDestinationById(id);
  if (!origin.data || !origin.data.latitude || !origin.data.longitude) {
    throw new Error('Origin destination coordinates missing');
  }
  const { latitude: originLat, longitude: originLng } = origin.data;

  // 2. Fetch all other destinations with coordinates
  const { data: allDestinations, error } = await supabase
    .from('destinations')
    .select('id, name, country, image_url, latitude, longitude')
    .neq('id', id)
    .not('latitude', 'is', null)
    .not('longitude', 'is', null);

  if (error) throw error;

  // 3. Filter by radius, deduplicate by name, and calculate travel time
  const uniqueDestinations = new Map();
  allDestinations?.forEach(dest => {
    if (!uniqueDestinations.has(dest.name)) {
      uniqueDestinations.set(dest.name, dest);
    }
  });

  const nearby = Array.from(uniqueDestinations.values())
    .map(dest => {
      const distance = calculateHaversineDistance(
        originLat, 
        originLng, 
        Number(dest.latitude), 
        Number(dest.longitude)
      );
      return {
        ...dest,
        distanceKm: Math.round(distance),
        travelTime: calculateTravelTime(distance)
      };
    })
    .filter(dest => dest.distanceKm > 0 && dest.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 10);

  return nearby;
};

export const createDestinationRecord = async (data: any) => {
  return await supabase
    .from('destinations')
    .insert([data])
    .select()
    .single();
};

export const updateDestinationRecord = async (id: string, data: any) => {
  return await supabase
    .from('destinations')
    .update(data)
    .eq('id', id)
    .select()
    .single();
};

export const deleteDestinationRecord = async (id: string) => {
  return await supabase
    .from('destinations')
    .delete()
    .eq('id', id);
};

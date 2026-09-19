import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { ApiError } from '../utils/ApiError';


interface SearchResult {
  id: string;
  type: 'destination' | 'business' | 'hotel' | 'tour';
  title: string;
  summary: string;
  image: string | null;
}

export const globalSearch = async (req: Request, res: Response) => {
  const query = (req.query.q as string) || '';
  const type = req.query.type as string | undefined;

  const lat = req.query.lat ? parseFloat(req.query.lat as string) : null;
  const lng = req.query.lng ? parseFloat(req.query.lng as string) : null;
  const radius = req.query.radius ? parseFloat(req.query.radius as string) : 50;
  const startDate = req.query.startDate as string;
  const endDate = req.query.endDate as string;

  let minLat: number | null = null, maxLat: number | null = null;
  let minLng: number | null = null, maxLng: number | null = null;

  if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
    const latOffset = radius / 111;
    const lngOffset = radius / (111 * Math.cos(lat * (Math.PI / 180)));
    minLat = lat - latOffset;
    maxLat = lat + latOffset;
    minLng = lng - Math.abs(lngOffset);
    maxLng = lng + Math.abs(lngOffset);
  }

  // We limit each table to avoid giant responses if search is too broad
  const limit = 10;
  const results: SearchResult[] = [];

  const safeQuery = `%${query}%`;

  try {
    const promises: any[] = [];

    // Pre-fetch unavailable inventory if dates provided
    let unavailableHotelIds: string[] = [];
    if (startDate && endDate) {
      const { data } = await supabase
        .from('bookings')
        .select('hotel_id')
        .not('status', 'eq', 'cancelled')
        // Simple overlap check
        .lte('check_in', endDate)
        .gte('check_out', startDate);
      if (data) unavailableHotelIds = data.map(b => b.hotel_id);
    }

    // 1. Search Destinations
    if (!type || type === 'destination') {
      let destQuery = supabase.from('destinations').select('id, name, description, image_url').or(`name.ilike.${safeQuery},description.ilike.${safeQuery}`);
      if (minLat && maxLat && minLng && maxLng) {
        destQuery = destQuery.gte('latitude', minLat).lte('latitude', maxLat).gte('longitude', minLng).lte('longitude', maxLng);
      }
      promises.push(
        destQuery
          .or(`name.ilike.${safeQuery},description.ilike.${safeQuery}`)
          .limit(limit)
          .then(({ data, error }) => {
            if (!error && data) {
              data.forEach(d => {
                results.push({
                  id: d.id,
                  type: 'destination',
                  title: d.name,
                  summary: d.description,
                  image: d.image_url
                });
              });
            }
          })
      );
    }

    // 2. Search Businesses (Verified Only)
    if (!type || type === 'business') {
      promises.push(
        supabase
          .from('businesses')
          .select('id, business_name, description')
          .eq('verified', true)
          .or(`business_name.ilike.${safeQuery},description.ilike.${safeQuery}`)
          .limit(limit)
          .then(({ data, error }) => {
            if (!error && data) {
              data.forEach(b => {
                results.push({
                  id: b.id,
                  type: 'business',
                  title: b.business_name,
                  summary: b.description || 'Verified Business',
                  image: null // Businesses don't have images in current schema
                });
              });
            }
          })
      );
    }

    // 3. Search Hotels
    if (!type || type === 'hotel') {
      let hotelQuery = supabase.from('hotels').select('id, name, description, image_url').or(`name.ilike.${safeQuery},description.ilike.${safeQuery}`);
      if (minLat && maxLat && minLng && maxLng) {
        hotelQuery = hotelQuery.gte('latitude', minLat).lte('latitude', maxLat).gte('longitude', minLng).lte('longitude', maxLng);
      }
      if (unavailableHotelIds.length > 0) {
        hotelQuery = hotelQuery.not('id', 'in', `(${unavailableHotelIds.join(',')})`);
      }
      promises.push(
        hotelQuery
          .or(`name.ilike.${safeQuery},description.ilike.${safeQuery}`)
          .limit(limit)
          .then(({ data, error }) => {
            if (!error && data) {
              data.forEach(h => {
                results.push({
                  id: h.id,
                  type: 'hotel',
                  title: h.name,
                  summary: h.description,
                  image: h.image_url
                });
              });
            }
          })
      );
    }

    // 4. Search Tours
    if (!type || type === 'tour') {
      let tourQuery = supabase.from('tours').select('id, name, description, image_url').or(`name.ilike.${safeQuery},description.ilike.${safeQuery}`);
      if (minLat && maxLat && minLng && maxLng) {
        tourQuery = tourQuery.gte('latitude', minLat).lte('latitude', maxLat).gte('longitude', minLng).lte('longitude', maxLng);
      }
      promises.push(
        tourQuery
          .or(`name.ilike.${safeQuery},description.ilike.${safeQuery}`)
          .limit(limit)
          .then(({ data, error }) => {
            if (!error && data) {
              data.forEach(t => {
                results.push({
                  id: t.id,
                  type: 'tour',
                  title: t.name,
                  summary: t.description,
                  image: t.image_url
                });
              });
            }
          })
      );
    }

    // Execute all queries concurrently
    await Promise.all(promises);

    res.json({
      data: results,
      count: results.length
    });
  } catch (error: any) {
    throw new ApiError(500, 'Failed to perform global search', 'INTERNAL_ERROR', error.message);
  }
};

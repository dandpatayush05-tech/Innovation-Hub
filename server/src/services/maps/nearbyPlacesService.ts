import { supabase } from '../../config/supabase';
import { nearbySearch, GooglePlaceResult } from './placesClient';
import { mapsCache } from './cache';
import { calculateHaversineDistance, calculateTravelTime } from '../maps';

// Normalized Response Shape
export interface NormalizedPlace {
  id: string; 
  name: string;
  category: string;
  distance_m: number; 
  distance_text: string; 
  travel_time_text?: string; 
  rating?: number;
  opening_hours?: string; 
  source: 'local' | 'google';
  lat: number;
  lng: number;
}

const LOCAL_CATEGORIES = ['hotels', 'restaurants', 'shops', 'attractions'];

const CATEGORY_TO_GOOGLE_TYPE: Record<string, string> = {
  hospitals: 'hospital',
  atms: 'atm',
  parking: 'parking',
  transport: 'transit_station',
  restaurants: 'restaurant',
  hotels: 'lodging',
  shops: 'store'
};

export const getNearbyForAttraction = async (
  lat: number,
  lng: number,
  categories: string[],
  radiusKm: number = 5
): Promise<Record<string, NormalizedPlace[]>> => {
  const result: Record<string, NormalizedPlace[]> = {};

  for (const category of categories) {
    const cacheKey = mapsCache.buildKey('nearby', lat, lng, category, radiusKm);
    const cached = mapsCache.get<NormalizedPlace[]>(cacheKey);
    
    if (cached) {
      result[category] = cached;
      continue;
    }

    let places: NormalizedPlace[] = [];

    if (LOCAL_CATEGORIES.includes(category)) {
      // 1. Query Local Data
      let query;
      if (category === 'hotels') {
         query = supabase.from('hotels').select('*');
      } else {
         // restaurants, shops, attractions mapped to places table
         const singularCategory = category.endsWith('s') ? category.slice(0, -1) : category;
         query = supabase.from('places').select('*').eq('category', singularCategory);
      }
      
      const { data: localData, error } = await query;
      
      if (!error && localData) {
        localData.forEach((item: any) => {
           if (item.latitude && item.longitude) {
             const distKm = calculateHaversineDistance(lat, lng, Number(item.latitude), Number(item.longitude));
             if (distKm <= radiusKm) {
                places.push({
                  id: item.id,
                  name: item.name,
                  category,
                  distance_m: Math.round(distKm * 1000),
                  distance_text: distKm < 1 ? `${Math.round(distKm * 1000)} m` : `${distKm.toFixed(1)} km`,
                  travel_time_text: calculateTravelTime(distKm),
                  rating: item.rating,
                  source: 'local',
                  lat: Number(item.latitude),
                  lng: Number(item.longitude)
                });
             }
           }
        });
        
        // Sort by distance
        places.sort((a, b) => a.distance_m - b.distance_m);
      }
    } else {
      // 2. Query Google Places API
      const googleType = CATEGORY_TO_GOOGLE_TYPE[category] || category;
      const radiusMeters = Math.round(radiusKm * 1000);
      
      const googleData = await nearbySearch(lat, lng, googleType, radiusMeters);
      
      googleData.forEach((item: GooglePlaceResult) => {
        if (item.location?.latitude && item.location?.longitude) {
           const distKm = calculateHaversineDistance(lat, lng, item.location.latitude, item.location.longitude);
           
           places.push({
             id: item.id,
             name: item.displayName?.text || 'Unknown',
             category,
             distance_m: Math.round(distKm * 1000),
             distance_text: distKm < 1 ? `${Math.round(distKm * 1000)} m` : `${distKm.toFixed(1)} km`,
             travel_time_text: calculateTravelTime(distKm),
             rating: item.rating,
             opening_hours: item.regularOpeningHours?.openNow ? 'Open Now' : 'Closed',
             source: 'google',
             lat: item.location.latitude,
             lng: item.location.longitude
           });
        }
      });

      places.sort((a, b) => a.distance_m - b.distance_m);
    }

    // Slice to top 10
    places = places.slice(0, 10);
    
    // Cache for 60 mins
    mapsCache.set(cacheKey, places, 60 * 60 * 1000);
    result[category] = places;
  }

  return result;
};

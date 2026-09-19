import axios from 'axios';
import { calculateHaversineDistance } from './maps';

interface Coordinate {
  lat: number;
  lng: number;
}

interface DistanceResult {
  distanceKm: number;
  durationMin: number;
}

// Simple in-memory LRU cache
const cache = new Map<string, { result: DistanceResult; timestamp: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours
const MAX_CACHE_SIZE = 1000;

const getCacheKey = (from: Coordinate, to: Coordinate, mode: 'driving' | 'flying') => {
  return `${mode}_${from.lat.toFixed(4)},${from.lng.toFixed(4)}_${to.lat.toFixed(4)},${to.lng.toFixed(4)}`;
};

export const getDrivingDistance = async (from: Coordinate, to: Coordinate): Promise<DistanceResult> => {
  const key = getCacheKey(from, to, 'driving');
  
  if (cache.has(key)) {
    const cached = cache.get(key)!;
    if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.result;
    }
    cache.delete(key);
  }

  try {
    // OSRM coordinates are lon,lat
    const url = `http://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=false`;
    const response = await axios.get(url);
    
    if (response.data.code === 'Ok' && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      const distanceKm = route.distance / 1000;
      const durationMin = route.duration / 60;
      
      const result = { distanceKm, durationMin };
      
      if (cache.size >= MAX_CACHE_SIZE) {
        const firstKey = cache.keys().next().value;
        if (firstKey) cache.delete(firstKey);
      }
      cache.set(key, { result, timestamp: Date.now() });
      
      return result;
    }
    
    throw new Error('OSRM API returned no route');
  } catch (error) {
    console.error('OSRM Distance API Error, falling back to Haversine:', error);
    // Fallback to Haversine * 1.3 for roads
    const dist = calculateHaversineDistance(from.lat, from.lng, to.lat, to.lng);
    const distanceKm = dist * 1.3;
    const durationMin = (distanceKm / 50) * 60; // Assuming 50km/h avg speed
    return { distanceKm, durationMin };
  }
};

export const getFlyingDistance = (from: Coordinate, to: Coordinate): DistanceResult => {
  const distanceKm = calculateHaversineDistance(from.lat, from.lng, to.lat, to.lng);
  // Assume 800km/h for flight speed + 60 mins for takeoff/landing/taxi
  const durationMin = (distanceKm / 800) * 60 + 60;
  return { distanceKm, durationMin };
};

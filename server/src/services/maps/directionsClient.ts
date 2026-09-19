import axios from 'axios';
import { env } from '../../config/env';

const BASE_URL = 'https://routes.googleapis.com/directions/v2:computeRoutes';

export interface TravelInfo {
  distanceMeters: number;
  durationSeconds: number;
}

export const getTravelInfo = async (
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number,
  mode: 'DRIVE' | 'BICYCLE' | 'WALK' | 'TWO_WHEELER' | 'TRANSIT' = 'DRIVE'
): Promise<TravelInfo | null> => {
  if (!env.GOOGLE_MAPS_API_KEY) {
    return null;
  }

  try {
    const response = await axios.post(
      BASE_URL,
      {
        origin: { location: { latLng: { latitude: originLat, longitude: originLng } } },
        destination: { location: { latLng: { latitude: destLat, longitude: destLng } } },
        travelMode: mode,
      },
      {
        headers: {
          'X-Goog-Api-Key': env.GOOGLE_MAPS_API_KEY,
          'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters',
        },
      }
    );

    const route = response.data.routes?.[0];
    if (!route) return null;

    // Convert "1500s" to number 1500
    const durationStr = route.duration || '0s';
    const durationSeconds = parseInt(durationStr.replace('s', ''), 10);

    return {
      distanceMeters: route.distanceMeters || 0,
      durationSeconds,
    };
  } catch (error: any) {
    console.error('Error in getTravelInfo:', error?.response?.data || error.message);
    return null;
  }
};

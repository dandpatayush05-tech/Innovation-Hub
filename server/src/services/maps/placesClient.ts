import axios from 'axios';
import { env } from '../../config/env';

const BASE_URL = 'https://places.googleapis.com/v1/places';

export interface GooglePlaceResult {
  id: string;
  displayName?: { text: string };
  location?: { latitude: number; longitude: number };
  rating?: number;
  userRatingCount?: number;
  primaryType?: string;
  regularOpeningHours?: { openNow: boolean };
}

export const nearbySearch = async (
  lat: number,
  lng: number,
  type: string,
  radius: number = 5000
): Promise<GooglePlaceResult[]> => {
  if (!env.GOOGLE_MAPS_API_KEY) {
    console.warn('GOOGLE_MAPS_API_KEY is not set. Returning empty places.');
    return [];
  }

  try {
    const response = await axios.post(
      `${BASE_URL}:searchNearby`,
      {
        includedTypes: [type],
        maxResultCount: 20,
        locationRestriction: {
          circle: {
            center: {
              latitude: lat,
              longitude: lng,
            },
            radius: radius,
          },
        },
      },
      {
        headers: {
          'X-Goog-Api-Key': env.GOOGLE_MAPS_API_KEY,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.location,places.rating,places.userRatingCount,places.primaryType,places.regularOpeningHours',
        },
      }
    );

    return response.data.places || [];
  } catch (error: any) {
    console.error('Error in nearbySearch:', error?.response?.data || error.message);
    return [];
  }
};

export const getPlaceDetails = async (placeId: string): Promise<GooglePlaceResult | null> => {
  if (!env.GOOGLE_MAPS_API_KEY) {
    return null;
  }

  try {
    const response = await axios.get(
      `${BASE_URL}/${placeId}`,
      {
        headers: {
          'X-Goog-Api-Key': env.GOOGLE_MAPS_API_KEY,
          'X-Goog-FieldMask': 'id,displayName,location,rating,userRatingCount,primaryType,regularOpeningHours,photos',
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error in getPlaceDetails:', error?.response?.data || error.message);
    return null;
  }
};

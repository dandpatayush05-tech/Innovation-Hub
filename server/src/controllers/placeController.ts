import { Request, Response, NextFunction } from 'express';
import { listPlaces, getPlaceById, createPlace, updatePlace, deletePlace } from '../services/places';
import { ApiError, NotFoundError } from '../utils/ApiError';

export const getPlaces = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await listPlaces(req.query);
    res.json(result);
  } catch (_error) {
    next(new ApiError(500, 'Failed to fetch places', 'INTERNAL_ERROR'));
  }
};

export const getPlace = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const place = await getPlaceById(req.params.id as string);
    if (!place) {
      throw new NotFoundError('Place not found');
    }
    res.json({ data: place });
  } catch (error: any) {
    if (error instanceof ApiError) return next(error);
    next(new ApiError(500, 'Failed to fetch place', 'INTERNAL_ERROR'));
  }
};

export const createNewPlace = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const place = await createPlace(req.body);
    res.status(201).json({ message: 'Place created successfully', data: place });
  } catch (_error) {
    next(new ApiError(500, 'Failed to create place', 'INTERNAL_ERROR'));
  }
};

export const updateExistingPlace = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const place = await updatePlace(req.params.id as string, req.body);
    res.json({ message: 'Place updated successfully', data: place });
  } catch (_error) {
    next(new ApiError(500, 'Failed to update place', 'INTERNAL_ERROR'));
  }
};

export const removePlace = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deletePlace(req.params.id as string);
    res.json({ message: 'Place deleted successfully' });
  } catch (_error) {
    next(new ApiError(500, 'Failed to delete place', 'INTERNAL_ERROR'));
  }
};

import { getNearbyForAttraction } from '../services/maps/nearbyPlacesService';
import { getTravelInfo } from '../services/maps/directionsClient';
import { mapsCache } from '../services/maps/cache';
import { calculateTravelTime } from '../services/maps';

export const getNearbyPlaces = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const place = await getPlaceById(req.params.id as string);
    if (!place || !place.latitude || !place.longitude) {
      throw new NotFoundError('Place not found or missing coordinates');
    }

    const categories = (req.query.categories as string).split(',').map(c => c.trim());
    const radius = Number(req.query.radius || 5);

    const result = await getNearbyForAttraction(Number(place.latitude), Number(place.longitude), categories, radius);
    res.json({ data: result });
  } catch (error: any) {
    if (error instanceof ApiError) return next(error);
    next(new ApiError(500, 'Failed to fetch nearby places', 'INTERNAL_ERROR'));
  }
};

export const getPlaceDirections = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const place = await getPlaceById(req.params.id as string);
    if (!place || !place.latitude || !place.longitude) {
      throw new NotFoundError('Destination place not found or missing coordinates');
    }

    const originLat = Number(req.query.originLat);
    const originLng = Number(req.query.originLng);
    const mode = (req.query.mode as any) || 'DRIVE';

    const cacheKey = mapsCache.buildKey('directions', originLat, originLng, place.latitude, place.longitude, mode);
    const cached = mapsCache.get(cacheKey);

    if (cached) {
      return res.json({ data: cached });
    }

    const info = await getTravelInfo(originLat, originLng, Number(place.latitude), Number(place.longitude), mode);
    if (!info) {
      throw new ApiError(500, 'Failed to calculate directions', 'EXTERNAL_API_ERROR');
    }

    const result = {
      distanceMeters: info.distanceMeters,
      durationSeconds: info.durationSeconds,
      travel_time_text: calculateTravelTime(info.distanceMeters / 1000)
    };

    mapsCache.set(cacheKey, result, 10 * 60 * 1000); // 10 minutes TTL
    res.json({ data: result });
  } catch (error: any) {
    if (error instanceof ApiError) return next(error);
    next(new ApiError(500, 'Failed to fetch directions', 'INTERNAL_ERROR'));
  }
};

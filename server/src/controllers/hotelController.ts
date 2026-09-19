import { Request, Response } from 'express';
import * as hotelService from '../services/hotelService';
import { AuthRequest } from '../middleware/authGuard';
import { isOwnerOrAdmin } from '../middleware/requireRole';
import { ApiError, ForbiddenError, NotFoundError } from '../utils/ApiError';

export const getHotels = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
  
  const sort = (req.query.sort as string) || 'created_at';
  const order = (req.query.order as string) === 'asc' ? true : false;

  const { data: hotels, count, error } = await hotelService.listHotels({
    page,
    limit,
    destinationId: req.query.destinationId as string | undefined,
    search: req.query.search as string | undefined,
    minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
    maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
    minRating: req.query.minRating ? parseFloat(req.query.minRating as string) : undefined,
    sort,
    order
  });

  if (error) {
    throw new ApiError(500, 'Failed to fetch hotels', 'INTERNAL_ERROR', error.message);
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  res.json({
    data: hotels || [],
    pagination: {
      total,
      page,
      limit,
      totalPages
    }
  });
};

export const getHotel = async (req: Request, res: Response) => {
  const { data: hotel, error } = await hotelService.getHotelById(req.params.id as string);
  
  if (error || !hotel) {
    throw new NotFoundError('Hotel not found', undefined);
  }
  
  res.json({ data: hotel });
};

export const createHotel = async (req: AuthRequest, res: Response) => {
  const { data: business } = await hotelService.getBusinessByUserId(req.user?.id as string);
  
  if (!business) {
    throw new ForbiddenError('You must register a business before creating a hotel', undefined);
  }

  const payload = { ...req.body };
  if (payload.destinationId) {
    payload.destination_id = payload.destinationId;
    delete payload.destinationId;
  }
  if (payload.pricePerNight) {
    payload.price_per_night = payload.pricePerNight;
    delete payload.pricePerNight;
  }
  if (payload.imageUrl) {
    payload.image_url = payload.imageUrl;
    delete payload.imageUrl;
  }
  payload.business_id = business.id;

  const { data: hotel, error } = await hotelService.createHotelRecord(payload);
    
  if (error || !hotel) {
    throw new ApiError(500, 'Failed to create hotel', 'INTERNAL_ERROR', error?.message);
  }

  res.status(201).json({ message: 'Hotel created successfully', data: hotel });
};

export const updateHotel = async (req: AuthRequest, res: Response) => {
  const { ownerId, error: checkError } = await hotelService.getBusinessOwnerByHotelId(req.params.id as string);

  if (checkError || !ownerId) {
    throw new NotFoundError('Hotel or associated business not found', undefined);
  }

  if (!isOwnerOrAdmin(req.user!, ownerId)) {
    throw new ForbiddenError('Forbidden: You do not own this hotel', undefined);
  }

  const updateData: Record<string, unknown> = {};
  if (req.body.name) updateData.name = req.body.name;
  if (req.body.description !== undefined) updateData.description = req.body.description;
  if (req.body.destinationId) updateData.destination_id = req.body.destinationId;
  if (req.body.pricePerNight) updateData.price_per_night = req.body.pricePerNight;
  if (req.body.amenities) updateData.amenities = req.body.amenities;
  if (req.body.imageUrl) updateData.image_url = req.body.imageUrl;
  if (req.body.availability !== undefined) updateData.availability = req.body.availability;
  if (req.body.latitude !== undefined) updateData.latitude = req.body.latitude;
  if (req.body.longitude !== undefined) updateData.longitude = req.body.longitude;
  if (req.user?.role === 'admin' && req.body.rating !== undefined) {
      updateData.rating = req.body.rating;
  }

  const { data: hotel, error } = await hotelService.updateHotelRecord(req.params.id as string, updateData);

  if (error || !hotel) {
    throw new ApiError(500, 'Failed to update hotel', 'INTERNAL_ERROR', error?.message);
  }

  res.json({ data: hotel });
};

export const deleteHotel = async (req: AuthRequest, res: Response) => {
  const { ownerId, error: checkError } = await hotelService.getBusinessOwnerByHotelId(req.params.id as string);

  if (checkError || !ownerId) {
    throw new NotFoundError('Hotel or associated business not found', undefined);
  }

  if (!isOwnerOrAdmin(req.user!, ownerId)) {
    throw new ForbiddenError('Forbidden: You do not own this hotel', undefined);
  }

  const { error } = await hotelService.deleteHotelRecord(req.params.id as string);

  if (error) {
    throw new ApiError(500, 'Failed to delete hotel', 'INTERNAL_ERROR', error.message);
  }

  res.status(204).send();
};

export const getNearbyHotels = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

  const { data: hotels, count, error } = await hotelService.listNearbyHotels({
    latitude: Number(req.query.latitude),
    longitude: Number(req.query.longitude),
    radius: Number(req.query.radius || 5),
    minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
    maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
    rating: req.query.rating ? parseFloat(req.query.rating as string) : undefined,
    page,
    limit
  });

  if (error) {
    throw new ApiError(500, 'Failed to fetch nearby hotels', 'INTERNAL_ERROR', error.message);
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  res.json({
    data: hotels || [],
    pagination: {
      total,
      page,
      limit,
      totalPages
    }
  });
};

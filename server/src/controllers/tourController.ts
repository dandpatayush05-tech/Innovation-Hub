import { Request, Response } from 'express';
import * as tourService from '../services/tourService';
import { AuthRequest } from '../middleware/authGuard';
import { isOwnerOrAdmin } from '../middleware/requireRole';
import { ApiError, ForbiddenError, NotFoundError } from '../utils/ApiError';

export const getTours = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
  
  const sort = (req.query.sort as string) || 'created_at';
  const order = (req.query.order as string) === 'asc' ? true : false;

  const { data: tours, count, error } = await tourService.listTours({
    page,
    limit,
    destinationId: req.query.destinationId as string | undefined,
    search: req.query.search as string | undefined,
    category: req.query.category as string | undefined,
    minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
    maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
    minAvailability: req.query.minAvailability ? parseInt(req.query.minAvailability as string) : undefined,
    sort,
    order
  });

  if (error) {
    throw new ApiError(500, 'Failed to fetch tours', 'INTERNAL_ERROR', error.message);
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  res.json({
    data: tours || [],
    pagination: {
      total,
      page,
      limit,
      totalPages
    }
  });
};

export const getTour = async (req: Request, res: Response) => {
  const { data: tour, error } = await tourService.getTourById(req.params.id as string);
  
  if (error || !tour) {
    throw new NotFoundError('Tour not found', undefined);
  }
  
  res.json({ data: tour });
};

export const createTour = async (req: AuthRequest, res: Response) => {
  const { data: business } = await tourService.getBusinessByUserId(req.user?.id as string);
  
  if (!business) {
    throw new ForbiddenError('You must register a business before creating a tour', undefined);
  }

  const payload = { ...req.body };
  if (payload.destinationId) {
    payload.destination_id = payload.destinationId;
    delete payload.destinationId;
  }
  if (payload.durationHours) {
    payload.duration_hours = payload.durationHours;
    delete payload.durationHours;
  }
  if (payload.imageUrl) {
    payload.image_url = payload.imageUrl;
    delete payload.imageUrl;
  }
  payload.business_id = business.id;

  const { data: tour, error } = await tourService.createTourRecord(payload);
    
  if (error || !tour) {
    throw new ApiError(500, 'Failed to create tour', 'INTERNAL_ERROR', error?.message);
  }

  res.status(201).json({ message: 'Tour created successfully', data: tour });
};

export const updateTour = async (req: AuthRequest, res: Response) => {
  const { ownerId, error: checkError } = await tourService.getBusinessOwnerByTourId(req.params.id as string);

  if (checkError || !ownerId) {
    throw new NotFoundError('Tour or associated business not found', undefined);
  }

  if (!isOwnerOrAdmin(req.user!, ownerId)) {
    throw new ForbiddenError('Forbidden: You do not own this tour', undefined);
  }

  const updateData: Record<string, unknown> = {};
  if (req.body.name) updateData.name = req.body.name;
  if (req.body.description !== undefined) updateData.description = req.body.description;
  if (req.body.destinationId) updateData.destination_id = req.body.destinationId;
  if (req.body.price !== undefined) updateData.price = req.body.price;
  if (req.body.durationHours !== undefined) updateData.duration_hours = req.body.durationHours;
  if (req.body.category !== undefined) updateData.category = req.body.category;
  if (req.body.availability !== undefined) updateData.availability = req.body.availability;
  if (req.body.imageUrl) updateData.image_url = req.body.imageUrl;

  const { data: tour, error } = await tourService.updateTourRecord(req.params.id as string, updateData);

  if (error || !tour) {
    throw new ApiError(500, 'Failed to update tour', 'INTERNAL_ERROR', error?.message);
  }

  res.json({ data: tour });
};

export const deleteTour = async (req: AuthRequest, res: Response) => {
  const { ownerId, error: checkError } = await tourService.getBusinessOwnerByTourId(req.params.id as string);

  if (checkError || !ownerId) {
    throw new NotFoundError('Tour or associated business not found', undefined);
  }

  if (!isOwnerOrAdmin(req.user!, ownerId)) {
    throw new ForbiddenError('Forbidden: You do not own this tour', undefined);
  }

  const { error } = await tourService.deleteTourRecord(req.params.id as string);

  if (error) {
    throw new ApiError(500, 'Failed to delete tour', 'INTERNAL_ERROR', error.message);
  }

  res.status(204).send();
};

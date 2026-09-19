import { Request, Response } from 'express';
import * as destinationService from '../services/destinationService';
import { getWeatherForDestination } from '../services/weather';
import { getTransportToDestination } from '../services/transportService';
import { ApiError, BadRequestError, NotFoundError } from '../utils/ApiError';

export const getDestinations = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
  
  const sort = (req.query.sort as string) || 'created_at';
  const order = (req.query.order as string) === 'asc' ? true : false;

  const { data: destinations, count, error } = await destinationService.listDestinations({
    page,
    limit,
    search: req.query.search as string | undefined,
    country: req.query.country as string | undefined,
    tag: req.query.tag as string | undefined,
    sort,
    order,
    popular: req.query.popular === 'true'
  });

  if (error) {
    throw new ApiError(500, 'Failed to fetch destinations', 'INTERNAL_ERROR', error.message);
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  res.json({
    data: destinations || [],
    pagination: {
      total,
      page,
      limit,
      totalPages
    }
  });
};

export const getDestination = async (req: Request, res: Response) => {
  const { data: destination, error } = await destinationService.getDestinationById(req.params.id as string);
  
  if (error || !destination) {
    throw new NotFoundError('Destination not found', undefined);
  }
  
  res.json({ data: destination });
};

export const getDestinationDetail = async (req: Request, res: Response) => {
  try {
    const data = await destinationService.getDestinationDetail(req.params.id as string);
    res.json({ data });
  } catch (error: any) {
    throw new NotFoundError(error.message || 'Destination not found', undefined);
  }
};

export const getCountries = async (req: Request, res: Response) => {
  try {
    const countries = await destinationService.getCountries();
    res.json({ data: countries });
  } catch (error: any) {
    throw new ApiError(500, error.message || 'Failed to fetch countries', 'INTERNAL_ERROR');
  }
};

export const getDestinationWeather = async (req: Request, res: Response) => {
  try {
    const { data: destination, error } = await destinationService.getDestinationById(req.params.id as string);
    if (error || !destination) {
      throw new NotFoundError('Destination not found');
    }
    
    if (!destination.latitude || !destination.longitude) {
      return res.json({ data: null, message: 'Coordinates not available for this destination.' });
    }

    const weather = await getWeatherForDestination(destination.latitude, destination.longitude);
    res.json({ data: weather });
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, error.message || 'Failed to fetch weather', 'INTERNAL_ERROR');
  }
};

export const getNearbyDestinations = async (req: Request, res: Response) => {
  try {
    const radius = req.query.radius ? parseInt(req.query.radius as string, 10) : 200;
    const nearby = await destinationService.getNearbyDestinations(req.params.id as string, radius);
    res.json({ data: nearby });
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, error.message || 'Failed to fetch nearby destinations', 'INTERNAL_ERROR');
  }
};

export const getDestinationTransport = async (req: Request, res: Response) => {
  try {
    const { data: destination, error } = await destinationService.getDestinationById(req.params.id as string);
    if (error || !destination) {
      throw new NotFoundError('Destination not found');
    }

    const transport = await getTransportToDestination(destination.name);
    res.json({ data: transport });
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, error.message || 'Failed to fetch transport options', 'INTERNAL_ERROR');
  }
};

export const createDestination = async (req: Request, res: Response) => {
  const { data: destination, error } = await destinationService.createDestinationRecord(req.body);

  if (error) {
    throw new BadRequestError('Failed to create destination', error.message);
  }

  res.status(201).json({ data: destination });
};

export const updateDestination = async (req: Request, res: Response) => {
  const { data: destination, error } = await destinationService.updateDestinationRecord(req.params.id as string, req.body);

  if (error || !destination) {
    throw new NotFoundError('Failed to update destination or not found', undefined);
  }

  res.json({ data: destination });
};

export const deleteDestination = async (req: Request, res: Response) => {
  const { error } = await destinationService.deleteDestinationRecord(req.params.id as string);

  if (error) {
    throw new BadRequestError('Failed to delete destination', error.message);
  }

  res.status(204).send();
};

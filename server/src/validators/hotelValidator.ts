import { z } from 'zod';

export const createHotelSchema = z.object({
  destinationId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Destination ID'),
  name: z.string().min(2),
  description: z.string().min(10),
  pricePerNight: z.number().positive(),
  amenities: z.array(z.string()).optional(),
  imageUrl: z.string().url(),
  availability: z.number().int().min(0).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional()
});

export const updateHotelSchema = createHotelSchema.partial();

export const getNearbyHotelsSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(1).max(50).optional().default(5),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(50).optional().default(10)
});

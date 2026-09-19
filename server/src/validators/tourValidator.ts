import { z } from 'zod';

export const createTourSchema = z.object({
  destinationId: z.string().uuid('Invalid Destination ID'),
  name: z.string().min(2),
  description: z.string().min(10),
  price: z.number().nonnegative(),
  durationHours: z.number().int().positive(),
  category: z.string().min(2),
  availability: z.number().int().min(0),
  imageUrl: z.string().url(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional()
});

export const updateTourSchema = createTourSchema.partial();

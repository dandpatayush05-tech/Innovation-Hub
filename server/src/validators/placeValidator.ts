import { z } from 'zod';

export const createBusinessSchema = z.object({
  businessName: z.string().min(2),
  businessType: z.enum(['hotel', 'agency', 'guide']),
  description: z.string().optional(),
  location: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  contactEmail: z.string().email()
});

export const updateBusinessSchema = createBusinessSchema.partial();

export const createPlaceSchema = z.object({
  name: z.string().min(2),
  category: z.string(),
  description: z.string().optional(),
  location: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  image_url: z.string().url().optional()
});

export const updatePlaceSchema = createPlaceSchema.partial();

export const getNearbyPlacesSchema = z.object({
  categories: z.string().refine((val) => {
    const cats = val.split(',');
    const valid = ['hotels', 'restaurants', 'shops', 'hospitals', 'atms', 'parking', 'transport', 'attractions'];
    return cats.every(c => valid.includes(c.trim()));
  }, 'Invalid categories'),
  radius: z.coerce.number().min(1).max(50).optional().default(5)
});

export const getDirectionsSchema = z.object({
  originLat: z.coerce.number().min(-90).max(90),
  originLng: z.coerce.number().min(-180).max(180),
  mode: z.enum(['DRIVE', 'BICYCLE', 'WALK', 'TWO_WHEELER', 'TRANSIT']).optional().default('DRIVE')
});

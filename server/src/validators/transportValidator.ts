import { z } from 'zod';

export const searchTransportSchema = z.object({
  from: z.object({
    lat: z.number(),
    lng: z.number()
  }),
  to: z.object({
    lat: z.number(),
    lng: z.number()
  }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Required date format YYYY-MM-DD'),
  passengers: z.number().int().min(1).default(1),
  sortBy: z.enum(['price', 'comfort']).default('price')
});

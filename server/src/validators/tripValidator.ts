import { z } from 'zod';

export const createReviewSchema = z.object({
  hotel_id: z.string().uuid().optional(),
  tour_id: z.string().uuid().optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10, 'Review must be at least 10 characters')
}).refine(data => data.hotel_id || data.tour_id, {
  message: 'Either hotel_id or tour_id must be provided'
}).refine(data => !(data.hotel_id && data.tour_id), {
  message: 'Cannot provide both hotel_id and tour_id'
});

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().min(10).optional()
});

export const createContactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  organizationType: z.enum(['traveler', 'hotel', 'agency', 'guide']),
  message: z.string().min(10)
});

import { z } from 'zod';

export const generateItinerarySchema = z.object({
  prompt: z.string().min(10, 'Prompt must be at least 10 characters long to provide enough context for the AI.'),
  days: z.number().int().min(1).max(14).optional(),
  budget: z.string().optional(),
  interests: z.array(z.string()).optional()
});

export const createItinerarySchema = z.object({
  name: z.string().min(1).optional(),
  prompt: z.string(),
  destination: z.string(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  travelers: z.number().int().min(1).optional(),
  days: z.array(z.any()).optional(),
  estimated_budget: z.string().optional(),
  notes: z.string().optional(),
  cover_image: z.string().optional(),
  is_public: z.boolean().optional(),
  ai_recommendations: z.array(z.string()).optional()
});

export const updateItinerarySchema = createItinerarySchema.partial();

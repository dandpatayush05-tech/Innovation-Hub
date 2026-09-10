import { z } from 'zod';

export const generateItinerarySchema = z.object({
  prompt: z.string().min(10, 'Prompt must be at least 10 characters long to provide enough context for the AI.'),
  days: z.number().int().min(1).max(14).optional(),
  budget: z.string().optional(),
  interests: z.array(z.string()).optional()
});

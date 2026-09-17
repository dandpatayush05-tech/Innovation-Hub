import { z } from 'zod';

export const sendMessageSchema = z.object({
  content: z.string().min(1, 'Message content cannot be empty'),
  recipient_id: z.string().uuid('Invalid recipient ID').optional(),
  business_id: z.string().uuid('Invalid business ID').optional(),
});

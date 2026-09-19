import { z } from 'zod';

export const addFavoriteSchema = z.object({
  item_type: z.enum(['hotel', 'tour', 'destination', 'place']),
  item_id: z.string().uuid(),
  user_id: z.string().uuid().optional() // Can be optional if derived from req.user
});

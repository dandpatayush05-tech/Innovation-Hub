import { z } from 'zod';

// Source of truth: server/src/validators/authValidator.ts
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

// Source of truth: server/src/validators/travelValidator.ts
export const createBookingSchema = z.object({
  hotel_id: z.string().uuid('Invalid Hotel ID').optional(),
  check_in_date: z.string(),
  check_out_date: z.string(),
  guests: z.number().int().positive('At least 1 guest is required'),
  rooms: z.number().int().positive().optional(),
  total_price: z.number().nonnegative().optional(),
  occasion: z.string().optional()
});

export const createReviewSchema = z.object({
  hotel_id: z.string().uuid().optional(),
  tour_id: z.string().uuid().optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10, 'Review must be at least 10 characters')
});

export const createGuideBookingSchema = z.object({
  tour_id: z.string().uuid('Invalid Tour ID').optional(),
  booking_date: z.string().min(1, 'Date is required'),
  time_slot: z.string().optional(),
  participants: z.number().int().positive('At least 1 participant is required'),
  guest_info: z.array(z.any()).optional(),
  total_price: z.number().nonnegative().optional(),
  notes: z.string().optional(),
  occasion: z.string().optional()
});

export const createContactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  interest: z.enum(['traveler', 'hotel', 'agency', 'guide'], {
    errorMap: () => ({ message: 'Please select an option' })
  }),
  message: z.string().optional()
});

// ... add others if needed by the frontend forms

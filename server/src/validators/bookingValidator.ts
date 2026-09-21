import { z } from 'zod';

export const createBookingSchema = z.object({
  hotel_id: z.string().uuid('Invalid Hotel ID'),
  check_in_date: z.string(),
  check_out_date: z.string(),
  guests: z.number().int().positive(),
  rooms: z.number().int().positive().optional(),
  total_price: z.number().nonnegative().optional(),
  occasion: z.string().optional()
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled'])
});

export const createGuideBookingSchema = z.object({
  tour_id: z.string().uuid('Invalid Tour ID'),
  booking_date: z.string().datetime(),
  time_slot: z.string().optional(),
  participants: z.number().int().positive(),
  guest_info: z.array(z.any()).optional(),
  total_price: z.number().nonnegative().optional(),
  notes: z.string().optional(),
  occasion: z.string().optional()
});

export const createAutoBookingSchema = z.object({
  start_date: z.string().datetime(),
  pickup_location: z.string().min(1, 'Pickup location is required'),
  dropoff_location: z.string().min(1, 'Dropoff location is required'),
  passenger_count: z.number().int().positive(),
  vehicle_type: z.enum(['car', 'suv', 'van', 'auto_rickshaw']),
  additional_instructions: z.string().optional()
});

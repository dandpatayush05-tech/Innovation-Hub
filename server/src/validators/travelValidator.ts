import { z } from 'zod';

export const createBusinessSchema = z.object({
  businessName: z.string().min(2),
  businessType: z.enum(['hotel', 'agency', 'guide']),
  description: z.string().optional(),
  location: z.string().optional(),
  contactEmail: z.string().email()
});

export const updateBusinessSchema = createBusinessSchema.partial();

export const createHotelSchema = z.object({
  destinationId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Destination ID'),
  name: z.string().min(2),
  description: z.string().min(10),
  pricePerNight: z.number().positive(),
  amenities: z.array(z.string()).optional(),
  imageUrl: z.string().url(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional()
});

export const updateHotelSchema = createHotelSchema.partial();

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

export const createContactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  organizationType: z.enum(['traveler', 'hotel', 'agency', 'guide']),
  message: z.string().min(10)
});

export const createFlightBookingSchema = z.object({
  flight_id: z.string().uuid('Invalid Flight ID'),
  passengers: z.number().int().positive(),
  passenger_details: z.array(z.any()).optional()
});

export const createBusBookingSchema = z.object({
  bus_id: z.string().uuid('Invalid Bus ID'),
  seats: z.number().int().positive(),
  passenger_details: z.array(z.any()).optional()
});

export const createAutoBookingSchema = z.object({
  start_date: z.string().datetime(),
  pickup_location: z.string().min(2),
  dropoff_location: z.string().min(2),
  passenger_count: z.number().int().positive(),
  vehicle_type: z.string().min(2),
  additional_instructions: z.string().optional()
});

export const createDestinationSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  country: z.string().min(2, 'Country is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  image_url: z.string().url('Must be a valid URL'),
  tags: z.array(z.string()).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional()
});

export const updateDestinationSchema = createDestinationSchema.partial();

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

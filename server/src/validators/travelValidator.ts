import { z } from 'zod';

export const createBusinessSchema = z.object({
  businessName: z.string().min(2),
  businessType: z.enum(['hotel', 'agency', 'guide']),
  description: z.string().optional(),
  location: z.string().optional(),
  contactEmail: z.string().email()
});

export const createHotelSchema = z.object({
  destinationId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Destination ID'),
  name: z.string().min(2),
  description: z.string().min(10),
  pricePerNight: z.number().positive(),
  amenities: z.array(z.string()).optional(),
  imageUrl: z.string().url()
});

export const createBookingSchema = z.object({
  hotelId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Hotel ID'),
  checkIn: z.string().datetime(),
  checkOut: z.string().datetime(),
  guests: z.number().int().positive()
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled'])
});

export const createGuideBookingSchema = z.object({
  businessId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Business ID'),
  date: z.string().datetime(),
  notes: z.string().optional()
});

export const createContactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  organizationType: z.enum(['traveler', 'hotel', 'agency', 'guide']),
  message: z.string().min(10)
});

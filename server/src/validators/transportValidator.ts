import { z } from 'zod';

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

export const flightSearchValidator = z.object({
  query: z.object({
    origin: z.string().min(3),
    destination: z.string().min(3),
    departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format'),
    returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').optional(),
    passengers: z.preprocess((val) => Number(val), z.number().int().min(1))
  })
});

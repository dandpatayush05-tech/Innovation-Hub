import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { ApiError, UnauthorizedError, NotFoundError, ConflictError } from '../utils/ApiError';
import { listBuses } from '../services/busService';

export const getBuses = async (req: Request, res: Response) => {
  try {
    const { 
      source,
      destination,
      minPrice, 
      maxPrice,
      sort,
      order,
      limit,
      page
    } = req.query;

    const result = await listBuses({
      source: source as string,
      destination: destination as string,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sort: sort as string,
      order: order as string,
      limit: limit ? Number(limit) : undefined,
      page: page ? Number(page) : undefined
    });

    res.json(result);
  } catch (_error) {
    console.error(_error);
    throw new ApiError(500, 'Failed to fetch buses', 'INTERNAL_ERROR', undefined);
  }
};

export const getBus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data: bus, error: busError } = await supabase
      .from('buses')
      .select('*')
      .eq('id', id)
      .single();

    if (busError) throw busError;
    if (!bus) throw new NotFoundError('Bus not found', undefined);

    // Find booked seats
    const { data: bookings, error: bookingsError } = await supabase
      .from('bus_bookings')
      .select('passenger_details')
      .eq('bus_id', id)
      .neq('status', 'cancelled');

    if (bookingsError) throw bookingsError;

    const bookedSeats: string[] = [];
    if (bookings) {
      bookings.forEach(b => {
        if (Array.isArray(b.passenger_details)) {
          b.passenger_details.forEach(p => {
            if (p.seatNumber) {
              bookedSeats.push(p.seatNumber);
            }
          });
        }
      });
    }

    res.json({ data: { ...bus, bookedSeats } });
  } catch (_error) {
    console.error(_error);
    throw new ApiError(500, 'Failed to fetch bus', 'INTERNAL_ERROR', undefined);
  }
};

export const createBusBooking = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      throw new UnauthorizedError('Unauthorized', undefined);
    }

    const { bus_id, seats, passenger_details } = req.body;

    // Verify bus exists
    const { data: bus, error: busError } = await supabase
      .from('buses')
      .select('*')
      .eq('id', bus_id)
      .single();

    if (busError || !bus) {
      throw new NotFoundError('Bus not found', undefined);
    }

    // Check for seat conflicts
    const requestedSeats = (passenger_details || []).map((p: any) => p.seatNumber).filter(Boolean);
    
    if (requestedSeats.length > 0) {
      const { data: existingBookings, error: bookingsError } = await supabase
        .from('bus_bookings')
        .select('passenger_details')
        .eq('bus_id', bus_id)
        .neq('status', 'cancelled');

      if (bookingsError) throw bookingsError;

      const bookedSeats = new Set<string>();
      existingBookings?.forEach(b => {
        if (Array.isArray(b.passenger_details)) {
          b.passenger_details.forEach(p => {
            if (p.seatNumber) bookedSeats.add(p.seatNumber);
          });
        }
      });

      const conflict = requestedSeats.some((s: string) => bookedSeats.has(s));
      if (conflict) {
        throw new ConflictError('One or more selected seats are already booked.', undefined);
      }
    }

    // Insert pending booking
    const { data, error } = await supabase
      .from('bus_bookings')
      .insert({
        user_id: user.id,
        bus_id,
        seats,
        passenger_details: passenger_details || [],
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ 
      message: 'Bus booking created successfully (pending payment)',
      booking: data 
    });
  } catch (error) {
    console.error('Create bus booking error:', error);
    throw new ApiError(500, 'Failed to create bus booking', 'INTERNAL_ERROR', undefined);
  }
};

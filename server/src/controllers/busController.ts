import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { ApiError, UnauthorizedError, NotFoundError, ConflictError } from '../utils/ApiError';
import { listBuses } from '../services/busService';
import { FALLBACK_BUSES } from '../services/fallbackDataService';
import { sendList, sendSingle } from '../utils/response';

export const getBuses = async (req: Request, res: Response) => {
  try {
    const {
      source,
      destination,
      from,
      to,
      minPrice,
      maxPrice,
      sort,
      order,
      limit,
      page
    } = req.query;

    const fromCity = (source || from) as string;
    const toCity = (destination || to) as string;

    const result = await listBuses({
      source: fromCity,
      destination: toCity,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sort: sort as string,
      order: order as string,
      limit: limit ? Number(limit) : undefined,
      page: page ? Number(page) : undefined
    });

    if (result && result.data && result.data.length > 0) {
      return res.json(result);
    }

    let fallback = [...FALLBACK_BUSES];
    if (fromCity) {
      fallback = fallback.filter(b => b.from_city.toLowerCase().includes(fromCity.toLowerCase()));
    }
    if (toCity) {
      fallback = fallback.filter(b => b.to_city.toLowerCase().includes(toCity.toLowerCase()));
    }
    if (fallback.length === 0) fallback = FALLBACK_BUSES;

    return sendList(res, fallback, undefined, 200, true);
  } catch (_error) {
    console.warn('Database error in getBuses, serving fallback:', _error);
    return sendList(res, FALLBACK_BUSES, undefined, 200, true);
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

    if (!busError && bus) {
      const { data: bookings } = await supabase
        .from('bus_bookings')
        .select('passenger_details')
        .eq('bus_id', id)
        .neq('status', 'cancelled');

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

      return res.json({ data: { ...bus, bookedSeats } });
    }

    const fallback = FALLBACK_BUSES.find(b => b.id === id) || FALLBACK_BUSES[0];
    return sendSingle(res, { ...fallback, bookedSeats: ['U1', 'L3'] }, 200, true);
  } catch (_error) {
    console.warn('Database error in getBus, serving fallback:', _error);
    const fallback = FALLBACK_BUSES.find(b => b.id === req.params.id) || FALLBACK_BUSES[0];
    return sendSingle(res, { ...fallback, bookedSeats: ['U1', 'L3'] }, 200, true);
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

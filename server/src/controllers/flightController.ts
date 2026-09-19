import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { ApiError, UnauthorizedError, NotFoundError, ConflictError } from '../utils/ApiError';
import { listFlights } from '../services/flightService';
import { flightProvider } from '../services/flights';

export const getFlights = async (req: Request, res: Response) => {
  try {
    const { 
      search,
      departureAirport,
      arrivalAirport,
      minPrice, 
      maxPrice,
      sort,
      order,
      limit,
      page
    } = req.query;

    const result = await listFlights({
      search: search as string,
      departureAirport: departureAirport as string,
      arrivalAirport: arrivalAirport as string,
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
    throw new ApiError(500, 'Failed to fetch flights', 'INTERNAL_ERROR', undefined);
  }
};

export const getFlight = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('flights')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundError('Flight not found', undefined);

    // Find booked seats
    const { data: bookings, error: bookingsError } = await supabase
      .from('flight_bookings')
      .select('passenger_details')
      .eq('flight_id', id)
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

    res.json({ data: { ...data, bookedSeats } });
  } catch (_error) {
    console.error(_error);
    throw new ApiError(500, 'Failed to fetch flight', 'INTERNAL_ERROR', undefined);
  }
};

export const createFlightBooking = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      throw new UnauthorizedError('Unauthorized', undefined);
    }

    const { flight_id, passengers, passenger_details } = req.body;

    // Verify flight exists
    const { data: flight, error: flightError } = await supabase
      .from('flights')
      .select('*')
      .eq('id', flight_id)
      .single();

    if (flightError || !flight) {
      throw new NotFoundError('Flight not found', undefined);
    }

    // Check for seat conflicts
    const requestedSeats = (passenger_details || []).map((p: any) => p.seatNumber).filter(Boolean);
    
    if (requestedSeats.length > 0) {
      const { data: existingBookings, error: bookingsError } = await supabase
        .from('flight_bookings')
        .select('passenger_details')
        .eq('flight_id', flight_id)
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
      .from('flight_bookings')
      .insert({
        user_id: user.id,
        flight_id,
        passengers,
        passenger_details: passenger_details || [],
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ 
      message: 'Flight booking created successfully (pending payment)',
      booking: data 
    });
  } catch (error) {
    console.error('Create flight booking error:', error);
    throw new ApiError(500, 'Failed to create flight booking', 'INTERNAL_ERROR', undefined);
  }
};

export const searchFlights = async (req: Request, res: Response) => {
  try {
    const { origin, destination, departureDate, returnDate, passengers } = req.query;

    const originStr = Array.isArray(origin) ? String(origin[0]) : String(origin);
    const destStr = Array.isArray(destination) ? String(destination[0]) : String(destination);
    const depDateStr = Array.isArray(departureDate) ? String(departureDate[0]) : String(departureDate);

    const outboundFlights = await flightProvider.searchFlights({
      origin: originStr,
      destination: destStr,
      departureDate: depDateStr,
      passengers: Number(passengers)
    });

    let returnFlights = null;
    if (returnDate) {
      const retDateStr = Array.isArray(returnDate) ? String(returnDate[0]) : String(returnDate);
      returnFlights = await flightProvider.searchFlights({
        origin: destStr,
        destination: originStr,
        departureDate: retDateStr,
        passengers: Number(passengers)
      });
    }

    res.json({
      outbound: outboundFlights,
      return: returnFlights
    });
  } catch (error) {
    console.error('Search flights error:', error);
    throw new ApiError(500, 'Failed to search flights', 'INTERNAL_ERROR', undefined);
  }
};

export const getFlightSchedule = async (req: Request, res: Response) => {
  try {
    const { flightNumber } = req.params;
    const { date } = req.query;

    if (!date) {
      throw new ApiError(400, 'date query parameter is required', 'BAD_REQUEST', undefined);
    }

    const dateStr = Array.isArray(date) ? String(date[0]) : String(date);
    const flightNumStr = Array.isArray(flightNumber) ? String(flightNumber[0]) : String(flightNumber);
    const schedule = await flightProvider.getSchedule(flightNumStr, dateStr);
    res.json(schedule);
  } catch (error: any) {
    console.error('Get flight schedule error:', error);
    if (error.message === 'Flight schedule not found') {
      throw new NotFoundError('Flight schedule not found', undefined);
    }
    throw new ApiError(500, 'Failed to get flight schedule', 'INTERNAL_ERROR', undefined);
  }
};

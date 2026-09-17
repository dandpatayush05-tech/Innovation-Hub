import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const getFlights = async (req: Request, res: Response) => {
  try {
    const { 
      search,
      departureAirport,
      arrivalAirport,
      minPrice, 
      maxPrice,
      sort = 'created_at',
      order = 'desc',
      limit = 20,
      page = 1
    } = req.query;

    let query = supabase.from('flights').select('*', { count: 'exact' });

    if (search) {
      query = query.or(`airline.ilike.%${search}%,departure_airport.ilike.%${search}%,arrival_airport.ilike.%${search}%`);
    }
    
    if (departureAirport) {
      query = query.ilike('departure_airport', `%${departureAirport}%`);
    }
    if (arrivalAirport) {
      query = query.ilike('arrival_airport', `%${arrivalAirport}%`);
    }

    if (minPrice) query = query.gte('price', minPrice);
    if (maxPrice) query = query.lte('price', maxPrice);

    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;
    
    query = query
      .order(sort as string, { ascending: order === 'asc' })
      .range(from, to);

    const { data, count, error } = await query;

    if (error) throw error;

    res.json({
      data,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil((count || 0) / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch flights' });
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
    if (!data) return res.status(404).json({ error: 'Flight not found' });

    // Find booked seats
    const { data: bookings, error: bookingsError } = await supabase
      .from('flight_bookings')
      .select('passenger_details')
      .eq('flight_id', id)
      .neq('status', 'cancelled');

    if (bookingsError) throw bookingsError;

    let bookedSeats: string[] = [];
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
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch flight' });
  }
};

export const createFlightBooking = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { flight_id, passengers, passenger_details } = req.body;

    // Verify flight exists
    const { data: flight, error: flightError } = await supabase
      .from('flights')
      .select('*')
      .eq('id', flight_id)
      .single();

    if (flightError || !flight) {
      return res.status(404).json({ error: 'Flight not found' });
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
        return res.status(409).json({ error: 'One or more selected seats are already booked.' });
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
    res.status(500).json({ error: 'Failed to create flight booking' });
  }
};

import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const getBuses = async (req: Request, res: Response) => {
  try {
    const { 
      source,
      destination,
      minPrice, 
      maxPrice,
      sort = 'created_at',
      order = 'desc',
      limit = 20,
      page = 1
    } = req.query;

    let query = supabase.from('buses').select('*', { count: 'exact' });
    
    if (source) {
      query = query.ilike('route_source', `%${source}%`);
    }
    if (destination) {
      query = query.ilike('route_destination', `%${destination}%`);
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
    res.status(500).json({ error: 'Failed to fetch buses' });
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
    if (!bus) return res.status(404).json({ error: 'Bus not found' });

    // Find booked seats
    const { data: bookings, error: bookingsError } = await supabase
      .from('bus_bookings')
      .select('passenger_details')
      .eq('bus_id', id)
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

    res.json({ data: { ...bus, bookedSeats } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bus' });
  }
};

export const createBusBooking = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { bus_id, seats, passenger_details } = req.body;

    // Verify bus exists
    const { data: bus, error: busError } = await supabase
      .from('buses')
      .select('*')
      .eq('id', bus_id)
      .single();

    if (busError || !bus) {
      return res.status(404).json({ error: 'Bus not found' });
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
        return res.status(409).json({ error: 'One or more selected seats are already booked.' });
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
    res.status(500).json({ error: 'Failed to create bus booking' });
  }
};

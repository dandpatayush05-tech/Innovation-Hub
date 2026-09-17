import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middleware/authGuard';
import { createNotification } from './notificationController';

export const getUnifiedBookings = async (req: AuthRequest, res: Response) => {
  const { data: bookings, error } = await supabase
    .from('unified_bookings')
    .select('*')
    .eq('user_id', req.user?.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching unified bookings:', error);
    return res.status(500).json({ error: { message: 'Failed to fetch bookings' } });
  }

  res.json({ bookings: bookings || [] });
};

export const cancelBooking = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { type } = req.body; // 'hotel', 'flight', 'bus', 'auto', 'experience'

  let tableName = '';
  switch (type) {
    case 'hotel': tableName = 'bookings'; break;
    case 'flight': tableName = 'flight_bookings'; break;
    case 'bus': tableName = 'bus_bookings'; break;
    case 'auto': tableName = 'auto_bookings'; break;
    case 'experience': tableName = 'guide_bookings'; break;
    default: return res.status(400).json({ error: { message: 'Invalid booking type' } });
  }

  // Ensure the booking belongs to the user
  const { data: existing } = await supabase.from(tableName).select('user_id').eq('id', id).single();
  if (!existing || existing.user_id !== req.user?.id) {
    return res.status(403).json({ error: { message: 'Forbidden' } });
  }

  const { error } = await supabase
    .from(tableName)
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    return res.status(500).json({ error: { message: 'Failed to cancel booking' } });
  }

  // Trigger Notification
  if (req.user?.id) {
    await createNotification(
      req.user.id,
      'booking_cancelled',
      'Booking Cancelled',
      `Your ${type} booking has been cancelled successfully.`
    );
  }

  res.json({ message: 'Booking cancelled successfully' });
};

export const createBooking = async (req: AuthRequest, res: Response) => {
  const { hotel_id, check_in_date, check_out_date, guests, rooms, total_price, occasion } = req.body;

  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      user_id: req.user?.id,
      hotel_id,
      check_in: check_in_date,
      check_out: check_out_date,
      guests,
      occasion,
      status: 'pending'
    })
    .select()
    .single();

  if (error) {
    console.error('Supabase error inserting booking:', error);
    return res.status(500).json({ error: { message: 'Failed to create booking', details: error.message } });
  }

  res.status(201).json({ booking, message: 'Booking created successfully' });
};

export const createGuideBooking = async (req: AuthRequest, res: Response) => {
  const { tour_id, booking_date, participants, total_price, occasion } = req.body;

  const { data: booking, error } = await supabase
    .from('guide_bookings')
    .insert({
      user_id: req.user?.id,
      business_id: tour_id,
      date: booking_date,
      notes: `Participants: ${participants}. Total: $${total_price}`,
      occasion,
      status: 'pending'
    })
    .select()
    .single();

  if (error) {
    console.error('Supabase error inserting guide booking:', error);
    return res.status(500).json({ error: { message: 'Failed to create guide booking', details: error.message } });
  }

  res.status(201).json({ booking, message: 'Guide booking created successfully' });
};

export const getUserBookings = async (req: AuthRequest, res: Response) => {
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*, hotel:hotels(*)')
    .eq('user_id', req.user?.id)
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: { message: 'Failed to fetch bookings' } });
  }

  res.json({ bookings: bookings || [] });
};

export const getUserGuideBookings = async (req: AuthRequest, res: Response) => {
  const { data: bookings, error } = await supabase
    .from('guide_bookings')
    .select('*, guide:guides(*)')
    .eq('user_id', req.user?.id)
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: { message: 'Failed to fetch guide bookings' } });
  }

  res.json({ bookings: bookings || [] });
};

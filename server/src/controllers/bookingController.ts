import { Response } from 'express';
import * as bookingService from '../services/bookingService';
import { AuthRequest } from '../middleware/authGuard';
import { createNotification } from './notificationController';
import { ApiError, BadRequestError, ForbiddenError } from '../utils/ApiError';

export const getUnifiedBookings = async (req: AuthRequest, res: Response) => {
  const allBookings = await bookingService.getUnifiedBookingsByUser(req.user?.id as string);
  res.json({ bookings: allBookings });
};

export const cancelBooking = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { type } = req.body; 

  let tableName: string;
  switch (type) {
    case 'hotel': tableName = 'bookings'; break;
    case 'flight': tableName = 'flight_bookings'; break;
    case 'bus': tableName = 'bus_bookings'; break;
    case 'auto': tableName = 'auto_bookings'; break;
    case 'experience': tableName = 'guide_bookings'; break;
    default: throw new BadRequestError('Invalid booking type', undefined);
  }

  const { data: existing } = await bookingService.checkBookingOwnership(tableName, id as string);
  if (!existing || existing.user_id !== req.user?.id) {
    throw new ForbiddenError('Forbidden', undefined);
  }

  const { error } = await bookingService.cancelBookingRecord(tableName, id as string);

  if (error) {
    throw new ApiError(500, 'Failed to cancel booking', 'INTERNAL_ERROR', undefined);
  }

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
  const { hotel_id, check_in_date, check_out_date, guests, occasion } = req.body;

  const { data: booking, error } = await bookingService.createHotelBookingRecord({
    user_id: req.user?.id,
    hotel_id,
    check_in: check_in_date,
    check_out: check_out_date,
    guests,
    occasion,
    status: 'pending'
  });

  if (error) {
    console.error('Supabase error inserting booking:', error);
    throw new ApiError(500, 'Failed to create booking', 'INTERNAL_ERROR', error.message);
  }

  res.status(201).json({ booking, message: 'Booking created successfully' });
};

export const createGuideBooking = async (req: AuthRequest, res: Response) => {
  const { tour_id, booking_date, participants, total_price, occasion } = req.body;

  const { data: booking, error } = await bookingService.createGuideBookingRecord({
    user_id: req.user?.id,
    business_id: tour_id,
    date: booking_date,
    notes: `Participants: ${participants}. Total: $${total_price}`,
    occasion,
    status: 'pending'
  });

  if (error) {
    console.error('Supabase error inserting guide booking:', error);
    throw new ApiError(500, 'Failed to create guide booking', 'INTERNAL_ERROR', error.message);
  }

  res.status(201).json({ booking, message: 'Guide booking created successfully' });
};

export const getUserBookings = async (req: AuthRequest, res: Response) => {
  const { data: bookings, error } = await bookingService.getHotelBookingsByUser(req.user?.id as string);

  if (error) {
    throw new ApiError(500, 'Failed to fetch bookings', 'INTERNAL_ERROR', undefined);
  }

  res.json({ bookings: bookings || [] });
};

export const getUserGuideBookings = async (req: AuthRequest, res: Response) => {
  const { data: bookings, error } = await bookingService.getGuideBookingsByUser(req.user?.id as string);

  if (error) {
    throw new ApiError(500, 'Failed to fetch guide bookings', 'INTERNAL_ERROR', undefined);
  }

  res.json({ bookings: bookings || [] });
};

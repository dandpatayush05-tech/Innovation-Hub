import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authGuard';
import { supabase } from '../config/supabase';
import { ApiError } from '../utils/ApiError';

export const createAutoBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, 'Unauthorized');
    }

    const { start_date, pickup_location, dropoff_location, passenger_count, vehicle_type, additional_instructions } = req.body;

    const { data: booking, error } = await supabase
      .from('auto_bookings')
      .insert({
        user_id: userId,
        start_date,
        pickup_location,
        dropoff_location,
        passenger_count,
        vehicle_type,
        additional_instructions,
        status: 'requested'
      })
      .select()
      .single();

    if (error) {
      throw new ApiError(500, 'Failed to create auto transport request');
    }

    res.status(201).json({
      message: 'Transport request submitted successfully',
      booking
    });

  } catch (error) {
    next(error);
  }
};

export const getUserAutoBookings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    
    // Allow users to see their own bookings, or admin to see any
    if (req.user?.role !== 'admin' && req.user?.id !== userId) {
      throw new ApiError(403, 'Forbidden');
    }

    const { data: bookings, error } = await supabase
      .from('auto_bookings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new ApiError(500, 'Failed to fetch auto bookings');
    }

    res.json({ bookings });
  } catch (error) {
    next(error);
  }
};

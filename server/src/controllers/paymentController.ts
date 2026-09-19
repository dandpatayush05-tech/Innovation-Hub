import { Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middleware/authGuard';
import { createNotification } from './notificationController';
import { ApiError, BadRequestError, ForbiddenError, NotFoundError } from '../utils/ApiError';


// Initialize Razorpay (with dummy fallback keys so the app doesn't crash if env vars are missing)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret',
});

export const createRazorpayOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { booking_id, booking_type } = req.body;

    if (!booking_id || !booking_type) {
      throw new BadRequestError('booking_id and booking_type are required', undefined);
    }

    let calculatedAmount = 0;

    switch (booking_type) {
      case 'hotel': {
        const { data: booking } = await supabase.from('bookings').select('*, hotel:hotels(*)').eq('id', booking_id).single();
        if (!booking) throw new NotFoundError('Booking not found', undefined);
        if (booking.user_id !== req.user?.id) throw new ForbiddenError('Forbidden', undefined);
        
        // Calculate days
        const checkIn = new Date(booking.check_in).getTime();
        const checkOut = new Date(booking.check_out).getTime();
        const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)) || 1;
        calculatedAmount = booking.hotel.price_per_night * days;
        break;
      }
      case 'tour': {
        const { data: booking } = await supabase.from('guide_bookings').select('*').eq('id', booking_id).single();
        if (!booking) throw new NotFoundError('Booking not found', undefined);
        if (booking.user_id !== req.user?.id) throw new ForbiddenError('Forbidden', undefined);
        
        // Use total_price from the booking record
        if (booking.total_price) {
          calculatedAmount = Number(booking.total_price);
        } else {
          // Fallback parsing notes or default
          const notes = booking.notes || '';
          const match = notes.match(/Total:\s*\$([\d.]+)/);
          calculatedAmount = match ? parseFloat(match[1]) : 100 * booking.guest_count;
        }
        break;
      }
      case 'flight': {
        const { data: booking } = await supabase.from('flight_bookings').select('*, flight:flights(*)').eq('id', booking_id).single();
        if (!booking) throw new NotFoundError('Booking not found', undefined);
        if (booking.user_id !== req.user?.id) throw new ForbiddenError('Forbidden', undefined);
        calculatedAmount = booking.flight.price * booking.passengers;
        break;
      }
      case 'bus': {
        const { data: booking } = await supabase.from('bus_bookings').select('*, bus:buses(*)').eq('id', booking_id).single();
        if (!booking) throw new NotFoundError('Booking not found', undefined);
        if (booking.user_id !== req.user?.id) throw new ForbiddenError('Forbidden', undefined);
        calculatedAmount = booking.bus.price * booking.seats;
        break;
      }
      case 'auto': {
        const { data: booking } = await supabase.from('auto_bookings').select('*, auto:auto_vehicles(*)').eq('id', booking_id).single();
        if (!booking) throw new NotFoundError('Booking not found', undefined);
        if (booking.user_id !== req.user?.id) throw new ForbiddenError('Forbidden', undefined);
        
        let days = 1;
        if (booking.end_date) {
          const start = new Date(booking.start_date).getTime();
          const end = new Date(booking.end_date).getTime();
          days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;
        }

        if (booking.auto) {
          calculatedAmount = booking.auto.price_per_day * days;
        } else {
          // Fallback based on vehicle_type if no specific vehicle was selected
          const rates: Record<string, number> = {
            'car': 50,
            'suv': 75,
            'van': 100,
            'auto_rickshaw': 20
          };
          const dailyRate = rates[booking.vehicle_type || 'car'] || 50;
          calculatedAmount = dailyRate * days;
        }
        break;
      }
      default:
        throw new BadRequestError('Invalid booking_type', undefined);
    }

    if (calculatedAmount <= 0) {
      throw new BadRequestError('Invalid calculated amount', undefined);
    }

    const options = {
      amount: Math.round(calculatedAmount * 100), // amount in smallest currency unit (paise)
      currency: "INR", 
      receipt: `receipt_${booking_id.replace(/-/g, '').substring(0, 30)}`,
      notes: { booking_id, booking_type }
    };

    const order = await razorpay.orders.create(options);

    res.json({ orderId: order.id, amount: order.amount, currency: order.currency, calculatedAmount });
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    throw new ApiError(500, 'Failed to create payment order.', 'INTERNAL_ERROR', undefined);
  }
};

export const confirmBookingPayment = async (booking_id: string, booking_type: string, user_id?: string) => {
  let table = '';
  if (booking_type === 'hotel') table = 'bookings';
  else if (booking_type === 'tour') table = 'guide_bookings';
  else if (booking_type === 'flight') table = 'flight_bookings';
  else if (booking_type === 'bus') table = 'bus_bookings';
  else if (booking_type === 'auto') table = 'auto_bookings';

  if (!table) return false;

  // Idempotency check: fetch current status
  const { data: booking, error: fetchError } = await supabase.from(table).select('status, user_id').eq('id', booking_id).single();
  if (fetchError || !booking) {
    console.error(`Booking not found in ${table} for id ${booking_id}`);
    return false;
  }

  if (booking.status === 'confirmed') {
    return true; // Already confirmed
  }

  // Update booking status directly
  const { error: updateError } = await supabase.from(table).update({ status: 'confirmed' }).eq('id', booking_id);
  if (updateError) {
    console.error(`Failed to update booking status for ${booking_id}`, updateError);
    return false;
  }

  // Trigger Notifications
  const targetUserId = user_id || booking.user_id;
  if (targetUserId) {
    await createNotification(
      targetUserId,
      'payment_success',
      'Payment Successful',
      `Your payment has been successfully verified.`
    );
    
    await createNotification(
      targetUserId,
      'booking_confirmation',
      'Booking Confirmed',
      `Your ${booking_type} booking has been confirmed! You can view it in your dashboard.`
    );
  }
  return true;
};

export const verifyRazorpaySignature = async (req: AuthRequest, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_id, booking_type } = req.body;

    const secret = process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret';
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      const success = await confirmBookingPayment(booking_id, booking_type, req.user?.id);
      if (success) {
        return res.json({ success: true, message: 'Payment verified and booking confirmed' });
      } else {
        return res.status(500).json({ success: false, message: 'Failed to confirm booking' });
      }
    } else {
      res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
  } catch (error) {
    console.error('Error verifying Razorpay signature:', error);
    throw new ApiError(500, 'Failed to verify payment.', 'INTERNAL_ERROR', undefined);
  }
};

export const handleRazorpayWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'webhook_secret_fallback';
    const rawBody = req.body; // Needs express.raw middleware

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.warn('Invalid Razorpay webhook signature');
      return res.status(400).send('Invalid signature');
    }

    const payload = JSON.parse(rawBody.toString());

    if (payload.event === 'payment.captured' || payload.event === 'order.paid') {
      let entity;
      if (payload.event === 'payment.captured') entity = payload.payload.payment.entity;
      else if (payload.event === 'order.paid') entity = payload.payload.order.entity;

      if (entity && entity.notes) {
        const { booking_id, booking_type } = entity.notes;
        if (booking_id && booking_type) {
          const success = await confirmBookingPayment(booking_id, booking_type);
          if (!success) {
             console.error('Webhook: Failed to confirm booking via webhook for', booking_id);
             return res.status(500).send('Failed to process');
          }
        }
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Error processing Razorpay webhook:', error);
    res.status(500).send('Webhook Error');
  }
};

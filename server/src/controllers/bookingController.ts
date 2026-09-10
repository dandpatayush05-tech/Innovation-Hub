import { Request, Response } from 'express';
import Booking from '../models/Booking';
import GuideBooking from '../models/GuideBooking';
import Hotel from '../models/Hotel';
import Business from '../models/Business';
import { AuthRequest } from '../middleware/authGuard';

export const createBooking = async (req: AuthRequest, res: Response) => {
  const booking = new Booking({
    ...req.body,
    userId: req.user?.id
  });
  await booking.save();
  res.status(201).json({ message: 'Booking created successfully', booking });
};

export const getUserBookings = async (req: AuthRequest, res: Response) => {
  if (req.user?.id !== req.params.userId && req.user?.role !== 'admin') {
    return res.status(403).json({ error: { message: 'Forbidden' } });
  }

  const bookings = await Booking.find({ userId: req.params.userId }).populate('hotelId');
  res.json({ bookings });
};

export const updateBookingStatus = async (req: AuthRequest, res: Response) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ error: { message: 'Booking not found' } });

  // Verify the user owns the business that owns the hotel
  const hotel = await Hotel.findById(booking.hotelId);
  const business = await Business.findOne({ userId: req.user?.id });

  if (!business || !hotel || hotel.businessId.toString() !== business.id.toString()) {
    return res.status(403).json({ error: { message: 'Forbidden: You do not own this hotel' } });
  }

  booking.status = req.body.status;
  await booking.save();
  res.json({ message: 'Booking status updated', booking });
};

export const createGuideBooking = async (req: AuthRequest, res: Response) => {
  const guideBooking = new GuideBooking({
    ...req.body,
    userId: req.user?.id
  });
  await guideBooking.save();
  res.status(201).json({ message: 'Guide booking created successfully', guideBooking });
};

export const getUserGuideBookings = async (req: AuthRequest, res: Response) => {
  if (req.user?.id !== req.params.userId && req.user?.role !== 'admin') {
    return res.status(403).json({ error: { message: 'Forbidden' } });
  }

  const guideBookings = await GuideBooking.find({ userId: req.params.userId }).populate('businessId');
  res.json({ guideBookings });
};

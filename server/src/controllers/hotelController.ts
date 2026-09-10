import { Request, Response } from 'express';
import Hotel from '../models/Hotel';
import Business from '../models/Business';
import { AuthRequest } from '../middleware/authGuard';

export const getHotels = async (req: Request, res: Response) => {
  const filter: any = {};
  if (req.query.destinationId) {
    filter.destinationId = req.query.destinationId;
  }
  const hotels = await Hotel.find(filter);
  res.json({ hotels });
};

export const getHotel = async (req: Request, res: Response) => {
  const hotel = await Hotel.findById(req.params.id);
  if (!hotel) return res.status(404).json({ error: { message: 'Hotel not found' } });
  res.json({ hotel });
};

export const createHotel = async (req: AuthRequest, res: Response) => {
  // Verify the user owns a business
  const business = await Business.findOne({ userId: req.user?.id });
  if (!business) {
    return res.status(403).json({ error: { message: 'You must register a business before creating a hotel' } });
  }

  const hotel = new Hotel({
    ...req.body,
    businessId: business.id
  });
  
  await hotel.save();
  res.status(201).json({ message: 'Hotel created successfully', hotel });
};

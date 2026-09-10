import { Request, Response } from 'express';
import Business from '../models/Business';
import { AuthRequest } from '../middleware/authGuard';

export const registerBusiness = async (req: AuthRequest, res: Response) => {
  const business = new Business({
    ...req.body,
    userId: req.user?.id
  });
  await business.save();
  res.status(201).json({ message: 'Business registered successfully', business });
};

export const getBusiness = async (req: Request, res: Response) => {
  const business = await Business.findById(req.params.id);
  if (!business) return res.status(404).json({ error: { message: 'Business not found' } });
  res.json({ business });
};

export const getBusinesses = async (req: Request, res: Response) => {
  const filter: any = {};
  if (req.query.verified) {
    filter.verified = req.query.verified === 'true';
  }
  const businesses = await Business.find(filter);
  res.json({ businesses });
};

import { Request, Response } from 'express';
import Destination from '../models/Destination';

export const getDestinations = async (req: Request, res: Response) => {
  const filter: any = {};
  if (req.query.tag) {
    filter.tags = req.query.tag;
  }
  const destinations = await Destination.find(filter);
  res.json({ destinations });
};

export const getDestination = async (req: Request, res: Response) => {
  const destination = await Destination.findById(req.params.id);
  if (!destination) return res.status(404).json({ error: { message: 'Destination not found' } });
  res.json({ destination });
};

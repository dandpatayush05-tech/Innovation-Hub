import { Response, NextFunction } from 'express';

import { AuthRequest } from '../middleware/authGuard';



// FAQs Stubs
export const getFaqs = async (req: AuthRequest, res: Response, _next: NextFunction) => {
  res.json({ data: [] });
};
export const createFaq = async (req: AuthRequest, res: Response, _next: NextFunction) => {
  res.status(201).json({ data: {} });
};
export const updateFaq = async (req: AuthRequest, res: Response, _next: NextFunction) => {
  res.json({ data: {} });
};
export const deleteFaq = async (req: AuthRequest, res: Response, _next: NextFunction) => {
  res.status(204).send();
};

// Rules Stubs
export const getRules = async (req: AuthRequest, res: Response, _next: NextFunction) => {
  res.json({ data: [] });
};
export const createRule = async (req: AuthRequest, res: Response, _next: NextFunction) => {
  res.status(201).json({ data: {} });
};
export const updateRule = async (req: AuthRequest, res: Response, _next: NextFunction) => {
  res.json({ data: {} });
};
export const deleteRule = async (req: AuthRequest, res: Response, _next: NextFunction) => {
  res.status(204).send();
};

import { getTrips, getTripDetails, uploadTripPhoto } from '../services/tripService';
import { getRevisitSuggestion } from '../services/revisitService';
import { supabase } from '../config/supabase';

export const listTrips = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const trips = await getTrips(userId);
    res.json({ data: trips });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Server error' });
  }
};

export const getTrip = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const trip = await getTripDetails(id as string, userId);
    res.json({ data: trip });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Server error' });
  }
};

export const uploadPhoto = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const file = req.file;
    const caption = req.body.caption;

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const photo = await uploadTripPhoto(id as string, userId, file, caption);
    res.status(201).json({ data: photo });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Server error' });
  }
};

export const getRevisit = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const revisit = await getRevisitSuggestion(id as string, userId);
    res.json({ data: revisit });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Server error' });
  }
};

export const createTrip = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { destination, startDate, endDate, coverPhotoUrl } = req.body;
    
    const { data, error } = await supabase
      .from('trips')
      .insert({
        user_id: userId,
        destination,
        start_date: startDate,
        end_date: endDate,
        cover_photo_url: coverPhotoUrl
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ data });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

import { Request, Response } from 'express';
import { generateItineraryWithLLM } from '../services/llm';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middleware/authGuard';

export const generateItinerary = async (req: AuthRequest, res: Response) => {
  const { prompt } = req.body;

  try {
    const aiResponse = await generateItineraryWithLLM(prompt);

    const { data: itinerary, error } = await supabase
      .from('itineraries')
      .insert({
        user_id: req.user?.id || null, // allow anonymous
        prompt,
        destination: aiResponse.destination,
        days: aiResponse.days,
        estimated_budget: aiResponse.estimatedBudget,
        ai_recommendations: aiResponse.aiRecommendations
      })
      .select()
      .single();

    if (error || !itinerary) {
      throw error;
    }
    
    res.status(201).json({ message: 'Itinerary generated successfully', itinerary });
  } catch (error) {
    console.error('Itinerary generation error:', error);
    res.status(502).json({ error: { message: "Couldn't generate your trip — try again" } });
  }
};

export const createItinerary = async (req: AuthRequest, res: Response) => {
  const { data: itinerary, error } = await supabase
    .from('itineraries')
    .insert({
      ...req.body,
      user_id: req.user?.id
    })
    .select()
    .single();

  if (error || !itinerary) {
    return res.status(500).json({ error: { message: 'Failed to create itinerary' } });
  }

  res.status(201).json({ itinerary });
};

export const getItinerary = async (req: AuthRequest, res: Response) => {
  const { data: itinerary } = await supabase.from('itineraries').select('*').eq('id', req.params.id).single();
  
  if (!itinerary) {
    return res.status(404).json({ error: { message: 'Itinerary not found' } });
  }

  // If it's owned by a user, only that user or an admin can view it, unless it's public
  if (itinerary.user_id && req.user?.id !== itinerary.user_id && req.user?.role !== 'admin' && !itinerary.is_public) {
    return res.status(403).json({ error: { message: 'Forbidden' } });
  }

  res.json({ itinerary });
};

export const getUserItineraries = async (req: AuthRequest, res: Response) => {
  if (req.user?.id !== req.params.userId && req.user?.role !== 'admin') {
    return res.status(403).json({ error: { message: 'Forbidden' } });
  }

  const { data: itineraries } = await supabase
    .from('itineraries')
    .select('*')
    .eq('user_id', req.params.userId)
    .order('created_at', { ascending: false });

  res.json({ itineraries: itineraries || [] });
};

export const updateItinerary = async (req: AuthRequest, res: Response) => {
  const { data: existing } = await supabase.from('itineraries').select('user_id').eq('id', req.params.id).single();
  
  if (!existing) {
    return res.status(404).json({ error: { message: 'Itinerary not found' } });
  }

  if (existing.user_id !== req.user?.id && req.user?.role !== 'admin') {
    return res.status(403).json({ error: { message: 'Forbidden' } });
  }

  const { data: itinerary, error } = await supabase
    .from('itineraries')
    .update({ ...req.body, updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error || !itinerary) {
    return res.status(500).json({ error: { message: 'Failed to update itinerary' } });
  }

  res.json({ itinerary });
};

export const deleteItinerary = async (req: AuthRequest, res: Response) => {
  const { data: existing } = await supabase.from('itineraries').select('user_id').eq('id', req.params.id).single();
  
  if (!existing) {
    return res.status(404).json({ error: { message: 'Itinerary not found' } });
  }

  if (existing.user_id !== req.user?.id && req.user?.role !== 'admin') {
    return res.status(403).json({ error: { message: 'Forbidden' } });
  }

  await supabase.from('itineraries').delete().eq('id', req.params.id);

  res.json({ message: 'Itinerary deleted successfully' });
};

export const duplicateItinerary = async (req: AuthRequest, res: Response) => {
  const { data: existing } = await supabase.from('itineraries').select('*').eq('id', req.params.id).single();
  
  if (!existing) {
    return res.status(404).json({ error: { message: 'Itinerary not found' } });
  }

  // To duplicate, we strip out the id, created_at, updated_at, set user_id to current user, and clean up booking_ids
  // in the days array to make them purely "planned" again.
  const cleanedDays = (existing.days || []).map((day: any) => ({
    ...day,
    activities: (day.activities || []).map((act: any) => {
      const { booking_id, ...rest } = act;
      return { ...rest, booking_status: 'planned' };
    })
  }));

  const { data: duplicate, error } = await supabase
    .from('itineraries')
    .insert({
      user_id: req.user?.id,
      name: existing.name ? `${existing.name} (Copy)` : 'Copied Itinerary',
      prompt: existing.prompt,
      destination: existing.destination,
      start_date: existing.start_date,
      end_date: existing.end_date,
      travelers: existing.travelers,
      days: cleanedDays,
      estimated_budget: existing.estimated_budget,
      notes: existing.notes,
      cover_image: existing.cover_image,
      is_public: false, // Don't copy public status
      ai_recommendations: existing.ai_recommendations
    })
    .select()
    .single();

  if (error || !duplicate) {
    return res.status(500).json({ error: { message: 'Failed to duplicate itinerary' } });
  }

  res.status(201).json({ itinerary: duplicate });
};

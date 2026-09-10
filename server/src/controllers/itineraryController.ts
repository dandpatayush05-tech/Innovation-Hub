import { Request, Response } from 'express';
import { generateItineraryWithLLM } from '../services/llm';
import Itinerary from '../models/Itinerary';
import { AuthRequest } from '../middleware/authGuard';

export const generateItinerary = async (req: AuthRequest, res: Response) => {
  const { prompt } = req.body;

  try {
    const aiResponse = await generateItineraryWithLLM(prompt);

    const itinerary = new Itinerary({
      userId: req.user?.id || null, // allow anonymous
      prompt,
      destination: aiResponse.destination,
      days: aiResponse.days,
      estimatedBudget: aiResponse.estimatedBudget,
      aiRecommendations: aiResponse.aiRecommendations
    });

    await itinerary.save();
    
    res.status(201).json({ message: 'Itinerary generated successfully', itinerary });
  } catch (error) {
    console.error('Itinerary generation error:', error);
    res.status(502).json({ error: { message: "Couldn't generate your trip — try again" } });
  }
};

export const getItinerary = async (req: AuthRequest, res: Response) => {
  const itinerary = await Itinerary.findById(req.params.id);
  if (!itinerary) {
    return res.status(404).json({ error: { message: 'Itinerary not found' } });
  }

  // If it's owned by a user, only that user or an admin can view it
  if (itinerary.userId && req.user?.id !== itinerary.userId.toString() && req.user?.role !== 'admin') {
    return res.status(403).json({ error: { message: 'Forbidden' } });
  }

  res.json({ itinerary });
};

export const getUserItineraries = async (req: AuthRequest, res: Response) => {
  if (req.user?.id !== req.params.userId && req.user?.role !== 'admin') {
    return res.status(403).json({ error: { message: 'Forbidden' } });
  }

  const itineraries = await Itinerary.find({ userId: req.params.userId }).sort({ createdAt: -1 });
  res.json({ itineraries });
};

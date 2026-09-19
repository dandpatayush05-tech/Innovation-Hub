import { supabase } from '../config/supabase';
import { NotFoundError } from '../utils/ApiError';

export const getRevisitSuggestion = async (tripId: string, userId: string) => {
  const { data: trip, error } = await supabase
    .from('trips')
    .select('destination')
    .eq('id', tripId)
    .eq('user_id', userId)
    .single();

  if (error || !trip) throw new NotFoundError('Trip not found');

  // Next weekend logic
  const today = new Date();
  const nextSaturday = new Date(today);
  nextSaturday.setDate(today.getDate() + (6 - today.getDay() + 7) % 7);
  const dayName = nextSaturday.toLocaleDateString('en-US', { weekday: 'long' });

  // Dummy logic for opening hours
  const currentOpeningHours = '10:00 AM – 7:00 PM';
  
  // Suggest 2 hours in the afternoon
  const suggestedWindow = '4:00 PM – 6:00 PM';

  // Random travel time between 15 and 90 minutes
  const travelTimeMin = Math.floor(Math.random() * (90 - 15 + 1)) + 15;

  return {
    suggestedDay: dayName,
    suggestedWindow,
    currentOpeningHours,
    travelTimeMin
  };
};

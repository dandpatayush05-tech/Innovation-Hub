import { supabase } from '../config/supabase';
import { NotFoundError } from '../utils/ApiError';
import { v4 as uuidv4 } from 'uuid';

export const getTrips = async (userId: string) => {
  const { data: trips, error } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', userId)
    .order('start_date', { ascending: false });

  if (error) throw error;

  // Enhance trips with experienceCount
  const tripsWithCounts = await Promise.all(trips.map(async (trip) => {
    const counts = await Promise.all([
      supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('trip_id', trip.id),
      supabase.from('flight_bookings').select('id', { count: 'exact', head: true }).eq('trip_id', trip.id),
      supabase.from('bus_bookings').select('id', { count: 'exact', head: true }).eq('trip_id', trip.id),
      supabase.from('auto_bookings').select('id', { count: 'exact', head: true }).eq('trip_id', trip.id),
      supabase.from('guide_bookings').select('id', { count: 'exact', head: true }).eq('trip_id', trip.id)
    ]);
    
    const experienceCount = counts.reduce((acc, curr) => acc + (curr.count || 0), 0);
    return { ...trip, experienceCount };
  }));

  return tripsWithCounts;
};

export const getTripDetails = async (tripId: string, userId: string) => {
  const { data: trip, error } = await supabase
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .single();

  if (error || !trip) throw new NotFoundError('Trip not found');
  if (trip.user_id !== userId) throw new NotFoundError('Trip not found');

  // Fetch all related bookings (both unified and legacy)
  const [hotels, flights, buses, autos, tours, unified, payments, photos] = await Promise.all([
    supabase.from('bookings').select('*, hotel:hotels(name, destination:destinations(name))').eq('trip_id', tripId),
    supabase.from('flight_bookings').select('*, flight:flights(departure_airport, arrival_airport)').eq('trip_id', tripId),
    supabase.from('bus_bookings').select('*, bus:buses(origin, destination)').eq('trip_id', tripId),
    supabase.from('auto_bookings').select('*').eq('trip_id', tripId),
    supabase.from('guide_bookings').select('*, tour:tours(name)').eq('trip_id', tripId),
    supabase.from('unified_bookings').select('*').eq('trip_id', tripId).order('start_time', { ascending: true }),
    // Payments that map to these bookings
    supabase.from('payments').select('*').in('booking_id', [
      ...(await supabase.from('bookings').select('id').eq('trip_id', tripId)).data?.map(b => b.id) || [],
      ...(await supabase.from('flight_bookings').select('id').eq('trip_id', tripId)).data?.map(b => b.id) || [],
      ...(await supabase.from('bus_bookings').select('id').eq('trip_id', tripId)).data?.map(b => b.id) || [],
      ...(await supabase.from('auto_bookings').select('id').eq('trip_id', tripId)).data?.map(b => b.id) || [],
      ...(await supabase.from('guide_bookings').select('id').eq('trip_id', tripId)).data?.map(b => b.id) || []
    ]),
    supabase.from('trip_photos').select('*').eq('trip_id', tripId).order('uploaded_at', { ascending: false })
  ]);

  return {
    ...trip,
    hotels: hotels.data || [],
    flights: flights.data || [],
    buses: buses.data || [],
    autos: autos.data || [],
    tours: tours.data || [],
    unified_bookings: unified.data || [],
    payments: payments.data || [],
    photos: photos.data || []
  };
};

export const createUnifiedTrip = async (userId: string, tripData: {
  destination: string;
  start_date?: string;
  end_date?: string;
  budget?: number;
  status?: string;
  itinerary?: any;
  cover_photo_url?: string;
}) => {
  const { data, error } = await supabase
    .from('trips')
    .insert({
      user_id: userId,
      destination: tripData.destination,
      start_date: tripData.start_date || null,
      end_date: tripData.end_date || null,
      budget: tripData.budget || null,
      status: tripData.status || 'planned',
      itinerary: tripData.itinerary || {},
      cover_photo_url: tripData.cover_photo_url || null
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const createUnifiedBooking = async (bookingData: {
  trip_id: string;
  user_id: string;
  type: 'hotel' | 'flight' | 'bus' | 'cab' | 'experience';
  provider: string;
  booking_reference: string;
  amount: number;
  status?: string;
  start_time: string;
  end_time?: string;
  metadata?: any;
}) => {
  const { data, error } = await supabase
    .from('unified_bookings')
    .insert({
      trip_id: bookingData.trip_id,
      user_id: bookingData.user_id,
      type: bookingData.type,
      provider: bookingData.provider,
      booking_reference: bookingData.booking_reference,
      amount: bookingData.amount,
      status: bookingData.status || 'confirmed',
      start_time: bookingData.start_time,
      end_time: bookingData.end_time || null,
      metadata: bookingData.metadata || {}
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const uploadTripPhoto = async (tripId: string, userId: string, file: Express.Multer.File, caption?: string) => {
  // Ensure trip belongs to user
  const { data: trip, error: tripError } = await supabase
    .from('trips')
    .select('id')
    .eq('id', tripId)
    .eq('user_id', userId)
    .single();

  if (tripError || !trip) throw new NotFoundError('Trip not found');

  const fileExt = file.originalname.split('.').pop();
  const fileName = `${tripId}/${uuidv4()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('trip-photos')
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });

  if (uploadError) throw uploadError;

  const { data: publicUrlData } = supabase.storage
    .from('trip-photos')
    .getPublicUrl(fileName);

  const url = publicUrlData.publicUrl;

  const { data: photo, error: insertError } = await supabase
    .from('trip_photos')
    .insert({
      trip_id: tripId,
      url,
      caption
    })
    .select()
    .single();

  if (insertError) throw insertError;

  return photo;
};

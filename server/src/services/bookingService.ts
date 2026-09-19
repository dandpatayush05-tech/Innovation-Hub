import { supabase } from '../config/supabase';

export const getUnifiedBookingsByUser = async (userId: string) => {
  const [
    { data: hotels },
    { data: flights },
    { data: buses },
    { data: autos },
    { data: guides }
  ] = await Promise.all([
    supabase.from('bookings').select('id, user_id, status, created_at, hotel_id, check_in, check_out, guests').eq('user_id', userId),
    supabase.from('flight_bookings').select('id, user_id, status, created_at, flight_id, travel_date, seats').eq('user_id', userId),
    supabase.from('bus_bookings').select('id, user_id, status, created_at, bus_id, travel_date, seats').eq('user_id', userId),
    supabase.from('auto_bookings').select('id, user_id, status, created_at, auto_id, booking_date, pickup_location, dropoff_location').eq('user_id', userId),
    supabase.from('guide_bookings').select('id, user_id, status, created_at, business_id, date, notes').eq('user_id', userId)
  ]);

  const allBookings = [
    ...(hotels || []).map(b => ({ ...b, type: 'hotel', title: 'Hotel Booking', date: b.check_in })),
    ...(flights || []).map(b => ({ ...b, type: 'flight', title: 'Flight Booking', date: b.travel_date })),
    ...(buses || []).map(b => ({ ...b, type: 'bus', title: 'Bus Booking', date: b.travel_date })),
    ...(autos || []).map(b => ({ ...b, type: 'auto', title: 'Auto Booking', date: b.booking_date })),
    ...(guides || []).map(b => ({ ...b, type: 'experience', title: 'Experience Booking', date: b.date }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return allBookings;
};

export const checkBookingOwnership = async (tableName: string, bookingId: string) => {
  return await supabase.from(tableName).select('user_id').eq('id', bookingId).single();
};

export const cancelBookingRecord = async (tableName: string, bookingId: string) => {
  return await supabase
    .from(tableName)
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', bookingId);
};

export const createHotelBookingRecord = async (data: any) => {
  return await supabase
    .from('bookings')
    .insert(data)
    .select()
    .single();
};

export const createGuideBookingRecord = async (data: any) => {
  return await supabase
    .from('guide_bookings')
    .insert(data)
    .select()
    .single();
};

export const getHotelBookingsByUser = async (userId: string) => {
  return await supabase
    .from('bookings')
    .select('*, hotel:hotels(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
};

export const getGuideBookingsByUser = async (userId: string) => {
  return await supabase
    .from('guide_bookings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
};

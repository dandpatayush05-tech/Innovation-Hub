import { supabase } from '../config/supabase';
import { applyDiscount } from './discountService';

export const buildPaymentGroup = async (userId: string, bookingIds: string[], discountCode?: string) => {
  if (!bookingIds || bookingIds.length === 0) {
    throw new Error('No booking IDs provided');
  }

  const items = [];
  let subtotal = 0;
  let tripId: string | null = null;

  // We need to fetch each booking to determine its type and price.
  // We'll query all tables since we don't know the types upfront.
  const tables = [
    { name: 'bookings', type: 'hotel', priceCol: null }, 
    { name: 'guide_bookings', type: 'tour', priceCol: 'total_price' },
    { name: 'flight_bookings', type: 'flight', priceCol: null },
    { name: 'bus_bookings', type: 'bus_leg', priceCol: null },
    { name: 'auto_bookings', type: 'auto', priceCol: 'fare' }
  ];

  for (const table of tables) {
    const { data: bookings } = await supabase
      .from(table.name)
      .select('*')
      .in('id', bookingIds)
      .eq('user_id', userId);

    if (bookings) {
      for (const booking of bookings) {
        let amount = 0;
        let label = '';

        if (table.type === 'hotel') {
          const { data: hotel } = await supabase.from('hotels').select('*').eq('id', booking.hotel_id).single();
          const start = new Date(booking.check_in).getTime();
          const end = new Date(booking.check_out).getTime();
          const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;
          amount = (hotel?.price_per_night || 0) * days;
          label = hotel?.name || 'Hotel Stay';
        } else if (table.type === 'tour') {
          amount = Number(booking.total_price) || 0;
          const { data: tour } = await supabase.from('tours').select('*').eq('id', booking.tour_id).single();
          label = tour?.name || 'Experience/Tour';
        } else if (table.type === 'flight') {
          const { data: flight } = await supabase.from('flights').select('*').eq('id', booking.flight_id).single();
          amount = (flight?.price || 0) * booking.passengers;
          label = `Flight: ${flight?.departure_airport} to ${flight?.arrival_airport}`;
        } else if (table.type === 'bus_leg') {
          const { data: bus } = await supabase.from('buses').select('*').eq('id', booking.bus_id).single();
          amount = (bus?.price || 0) * booking.seats;
          label = `Bus: ${bus?.origin} to ${bus?.destination}`;
        } else if (table.type === 'auto') {
          let fare = 500; // Flat deposit in INR
          if (booking.vehicle_type === 'suv') fare = 800;
          if (booking.vehicle_type === 'van') fare = 1200;
          if (booking.vehicle_type === 'auto_rickshaw') fare = 150;
          
          amount = fare;
          label = `Local Transport (${(booking.vehicle_type || 'car').replace('_', ' ')})`;
        }

        subtotal += amount;
        if (booking.trip_id) {
          tripId = booking.trip_id; // Just grab one, assume they are part of the same trip
        }

        items.push({
          booking_id: booking.id,
          item_type: table.type,
          amount,
          label
        });
      }
    }
  }

  if (items.length === 0) {
    throw new Error('No valid bookings found');
  }

  // Determine group_type
  let groupType: 'whole_trip' | 'single_leg' | 'multi_leg' = 'multi_leg';
  
  if (items.length === 1) {
    groupType = 'single_leg';
  } else if (tripId) {
    // Check if these bookings cover the entire trip
    // Fetch all bookings for this trip across all tables
    let totalTripBookings = 0;
    for (const table of tables) {
      const { count } = await supabase
        .from(table.name)
        .select('*', { count: 'exact', head: true })
        .eq('trip_id', tripId)
        .eq('user_id', userId);
      totalTripBookings += (count || 0);
    }
    
    if (items.length === totalTripBookings) {
      groupType = 'whole_trip';
    }
  }

  const { discountAmount, discountLabel } = await applyDiscount(subtotal, groupType, discountCode);
  
  // Fixed service fee logic (using simple 2% or 50)
  const serviceFee = Math.round(subtotal * 0.02 * 100) / 100; // 2% service fee
  
  const total = subtotal - discountAmount + serviceFee;

  return {
    userId,
    tripId,
    groupType,
    items,
    subtotal,
    discountAmount,
    discountCode: discountCode || null,
    discountLabel,
    serviceFee,
    total
  };
};

export const createPaymentGroup = async (userId: string, bookingIds: string[], discountCode?: string) => {
  const group = await buildPaymentGroup(userId, bookingIds, discountCode);

  const { data: paymentGroupId, error: groupError } = await supabase.rpc('create_payment_group_txn', {
    p_user_id: group.userId,
    p_trip_id: group.tripId,
    p_group_type: group.groupType,
    p_subtotal: group.subtotal,
    p_discount_amount: group.discountAmount,
    p_discount_code: group.discountCode || null,
    p_service_fee: group.serviceFee,
    p_total: group.total,
    p_items: group.items
  });

  if (groupError || !paymentGroupId) {
    throw new Error(`Failed to create payment group: ${groupError?.message}`);
  }

  // Fetch the created group to match the previous return structure
  const { data: paymentGroup } = await supabase
    .from('payment_groups')
    .select('*')
    .eq('id', paymentGroupId)
    .single();

  return { paymentGroup, groupData: group };
};

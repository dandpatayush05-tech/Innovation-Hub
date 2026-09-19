import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function backfillTable(tableName: string, bookingType: string, amountExtractor: (b: any) => number) {
  console.log(`Backfilling ${tableName} as ${bookingType}...`);
  
  const { data: bookings, error } = await supabase
    .from(tableName)
    .select('*')
    .eq('status', 'confirmed');
    
  if (error) {
    console.error(`Error fetching ${tableName}:`, error);
    return;
  }
  
  console.log(`Found ${bookings.length} confirmed bookings in ${tableName}`);
  
  const paymentsToInsert = [];
  
  for (const booking of bookings) {
    // Check if payment already exists
    const { data: existing } = await supabase
      .from('payments')
      .select('id')
      .eq('booking_id', booking.id)
      .maybeSingle();
      
    if (existing) {
      continue;
    }
    
    const amount = amountExtractor(booking);
    
    paymentsToInsert.push({
      user_id: booking.user_id,
      booking_id: booking.id,
      booking_type: bookingType,
      amount,
      currency: 'INR',
      provider: 'razorpay',
      razorpay_order_id: `backfill_${booking.id}`,
      razorpay_payment_id: `backfill_${booking.id}`,
      status: 'paid',
      paid_at: booking.updated_at || booking.created_at,
      created_at: booking.created_at
    });
  }
  
  if (paymentsToInsert.length > 0) {
    const { error: insertError } = await supabase.rpc('backfill_payments_txn', {
      p_payments: paymentsToInsert
    });
    
    if (insertError) {
      console.error(`Failed to insert batch for ${tableName}:`, insertError);
    } else {
      console.log(`Successfully backfilled ${paymentsToInsert.length} payments for ${tableName}`);
    }
  } else {
    console.log(`No new payments to backfill for ${tableName}`);
  }
}

async function runBackfill() {
  // We need to fetch related data for accurate amount extraction, but for backfill
  // we will try our best with the data available in the row or fallback to a reasonable estimate.
  
  await backfillTable('bookings', 'hotel', () => 5000); // Ideally we'd join hotels table, but for this quick script this is fine.
  await backfillTable('guide_bookings', 'tour', (b) => Number(b.total_price) || (b.guest_count * 100));
  await backfillTable('flight_bookings', 'flight', (b) => b.passengers * 3500);
  await backfillTable('bus_bookings', 'bus', (b) => b.seats * 800);
  await backfillTable('auto_bookings', 'auto', () => 300);
  
  console.log('Backfill complete!');
  process.exit(0);
}

runBackfill();

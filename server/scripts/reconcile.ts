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

async function checkPaymentGroupTotals() {
  console.log('\n--- Checking Payment Group Totals ---');
  const { data: groups, error } = await supabase.from('payment_groups').select('id, subtotal');
  if (error) {
    console.error('Failed to fetch payment groups', error);
    return;
  }

  let drifts = 0;
  for (const group of groups) {
    const { data: items } = await supabase.from('payment_group_items').select('amount').eq('payment_group_id', group.id);
    const sum = items?.reduce((acc, i) => acc + Number(i.amount), 0) || 0;
    if (Math.abs(sum - Number(group.subtotal)) > 0.01) {
      console.warn(`[DRIFT] Group ${group.id}: subtotal=${group.subtotal}, sum of items=${sum}`);
      drifts++;
    }
  }
  console.log(`Payment Group Totals Check Complete. Drifts found: ${drifts}`);
}

async function checkPaidGroupPayments() {
  console.log('\n--- Checking Paid Groups have Payments ---');
  const { data: paidGroups, error } = await supabase.from('payment_groups').select('id').eq('status', 'paid');
  if (error) return console.error(error);

  let missing = 0;
  for (const group of paidGroups) {
    const { data: items } = await supabase.from('payment_group_items').select('booking_id').eq('payment_group_id', group.id);
    for (const item of (items || [])) {
      const { data: payment } = await supabase.from('payments').select('id').eq('booking_id', item.booking_id).maybeSingle();
      if (!payment) {
        console.warn(`[MISSING PAYMENT] Group ${group.id}, Item/Booking ${item.booking_id} has no payments row.`);
        missing++;
      }
    }
  }
  console.log(`Paid Groups Payments Check Complete. Missing rows: ${missing}`);
}

async function checkConfirmedBookingsHavePayments() {
  console.log('\n--- Checking Confirmed Bookings have Payments ---');
  let missing = 0;
  const tables = ['bookings', 'guide_bookings', 'flight_bookings', 'bus_bookings', 'auto_bookings'];

  for (const table of tables) {
    const { data: bookings } = await supabase.from(table).select('id').eq('status', 'confirmed');
    for (const b of (bookings || [])) {
      const { data: payment } = await supabase.from('payments').select('id').eq('booking_id', b.id).maybeSingle();
      if (!payment) {
        console.warn(`[UNPAID BOOKING] Confirmed booking in ${table} (id: ${b.id}) has no payment record.`);
        missing++;
      }
    }
  }
  console.log(`Confirmed Bookings Check Complete. Missing payments: ${missing}`);
}

async function checkOrphans() {
  console.log('\n--- Checking for Orphans ---');
  let orphans = 0;

  // Check trip photos
  const { data: photos } = await supabase.from('trip_photos').select('id, trip_id');
  for (const p of (photos || [])) {
    const { data: trip } = await supabase.from('trips').select('id').eq('id', p.trip_id).maybeSingle();
    if (!trip) {
      console.warn(`[ORPHAN] Trip Photo ${p.id} points to missing trip ${p.trip_id}`);
      orphans++;
    }
  }

  // Check payment group items
  const { data: items } = await supabase.from('payment_group_items').select('id, payment_group_id');
  for (const i of (items || [])) {
    const { data: group } = await supabase.from('payment_groups').select('id').eq('id', i.payment_group_id).maybeSingle();
    if (!group) {
      console.warn(`[ORPHAN] Payment Group Item ${i.id} points to missing group ${i.payment_group_id}`);
      orphans++;
    }
  }

  console.log(`Orphans Check Complete. Orphans found: ${orphans}`);
}

async function runReconciliation() {
  console.log('Starting Database Reconciliation...\n');
  await checkPaymentGroupTotals();
  await checkPaidGroupPayments();
  await checkConfirmedBookingsHavePayments();
  await checkOrphans();
  console.log('\nReconciliation Finished.');
}

runReconciliation().catch(console.error);

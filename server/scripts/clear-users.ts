import { supabase } from '../src/config/supabase';

async function clear() {
  console.log('Removing all accounts and their references...');
  
  const tables = [
    'password_history',
    'flight_bookings',
    'bus_bookings', 
    'auto_bookings',
    'guide_bookings',
    'bookings',
    'itineraries',
    'reviews',
    'contact_requests',
    'flights',
    'buses',
    'auto_vehicles',
    'tours',
    'hotels',
    'places',
    'businesses',
    'users'
  ];

  for (const table of tables) {
    console.log(`Clearing ${table}...`);
    const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) {
      console.error(`Failed to delete from ${table}:`, error);
    }
  }

  console.log('Successfully removed all user accounts and related data.');
  process.exit();
}
clear();

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function checkCounts() {
  const { count: destCount } = await supabase.from('destinations').select('*', { count: 'exact', head: true });
  const { count: placesCount } = await supabase.from('places').select('*', { count: 'exact', head: true });
  
  console.log(`Destinations count: ${destCount}`);
  console.log(`Places count: ${placesCount}`);
}

checkCounts();

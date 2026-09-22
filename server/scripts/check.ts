import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function checkCounts() {
  const { data: dests, error } = await supabase.from('destinations').select('id, name, country, latitude, longitude');
  console.log('Existing destinations:', dests);
}

checkCounts().catch(err => {
  console.error(err);
  process.exit(1);
});

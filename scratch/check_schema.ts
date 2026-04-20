import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkSchema() {
  const { data, error } = await supabase
    .from('rent_pins')
    .select('category, sub_type')
    .limit(1);

  if (error) {
    console.error('SCHEMA ERROR:', error.message);
  } else {
    console.log('SCHEMA SUCCESS: columns exist.');
  }
}

checkSchema();

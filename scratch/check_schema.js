const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

// Load .env.local manually
const envPath = '.env.local';
const envConfig = dotenv.parse(fs.readFileSync(envPath));
for (const k in envConfig) {
  process.env[k] = envConfig[k];
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
  const { data, error } = await supabase
    .from('rent_pins')
    .select('category, sub_type')
    .limit(1);

  if (error) {
    console.log('SCHEMA ERROR: ' + error.message);
  } else {
    console.log('SCHEMA SUCCESS: columns exist.');
  }
}

checkSchema();

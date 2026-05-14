const { createClient } = require('@supabase/supabase-client');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function setup() {
  console.log("Checking for enterprise_metrics table...");
  const { error } = await supabase.from('enterprise_metrics').select('*').limit(1);
  
  if (error && error.code === 'PGRST116') {
    console.log("Table doesn't exist. You need to create 'enterprise_metrics' table in Supabase UI with columns: id, title, subtitle, value, icon_name, to_link");
  } else if (error) {
     console.log("Error checking table:", error.message);
  } else {
    console.log("Table exists!");
  }
}

setup();

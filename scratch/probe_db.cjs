const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env manually
const envPath = path.join(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    env[match[1]] = value.trim();
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Supabase URL or Anon Key not found in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const tableNames = [
  'bas_circles', 'eb_contacts', 'cggb', 'customers_data', 'short_code', 
  'ill_data', 'mmvc_data', 'mpls_data', 'nmect_data', 'nregs', 
  'nregsdistricts', 'pri_data', 'sip_data', 'tobacco_board', 'tollfree',
  'BAs circles', 'EB contacts', 'CGGB', 'Customers data', 'Short code',
  'ILL data', 'MMVC data', 'MPLS Data', 'NMECT data', 'NREGS',
  'NREGSdistricts', 'PRIdata', 'SIPdata', 'Tobacco board', 'TollFree'
];

async function probe() {
  for (const table of tableNames) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.log(`Table "${table}": Error - ${error.message} (${error.code})`);
      } else {
        console.log(`Table "${table}": EXISTS (data rows: ${data.length})`);
      }
    } catch (e) {
      console.log(`Table "${table}": Exception - ${e.message}`);
    }
  }
}

probe();

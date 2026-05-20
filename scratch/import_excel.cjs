/**
 * BSNL Excel → Supabase Import Script
 * Run with: node scratch/import_excel.cjs
 *
 * Prerequisites:
 *   1. Run create_tables.sql in your Supabase SQL Editor first.
 *   2. npm install xlsx @supabase/supabase-js (already done)
 */

const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// ── Parse .env ──────────────────────────────────────────────
const envPath = path.join(__dirname, '../.env');
const env = {};
fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
  const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (m) {
    let v = (m[2] || '').trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    env[m[1]] = v;
  }
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

// ── Load workbook ────────────────────────────────────────────
const wb = XLSX.readFile(path.join(__dirname, '../Tables (1).xlsx'));

// Helper: clean whitespace from column keys
const clean = (v) => (typeof v === 'string' ? v.trim() : (v === null || v === undefined ? null : String(v)));

// ── Sheet → Table mapping ─────────────────────────────────────
async function importSheet(sheetName, tableName, mapFn) {
  const ws = wb.Sheets[sheetName];
  if (!ws) { console.log(`⚠  Sheet "${sheetName}" not found, skipping.`); return; }

  const rawRows = XLSX.utils.sheet_to_json(ws, { header: 1 });
  const dataRows = rawRows.slice(1).filter(r => r.some(c => c !== null && c !== undefined && String(c).trim() !== ''));

  console.log(`\n📋 Sheet: "${sheetName}" → table: "${tableName}" (${dataRows.length} rows)`);

  const records = dataRows.map(mapFn).filter(Boolean);
  if (records.length === 0) { console.log('   No data rows to import.'); return; }

  // Batch insert in chunks of 200
  const CHUNK = 200;
  let inserted = 0;
  for (let i = 0; i < records.length; i += CHUNK) {
    const chunk = records.slice(i, i + CHUNK);
    const { error } = await supabase.from(tableName).insert(chunk);
    if (error) {
      console.error(`   ❌ Error inserting rows ${i}–${i + chunk.length}: ${error.message}`);
    } else {
      inserted += chunk.length;
    }
  }
  console.log(`   ✅ Inserted ${inserted} / ${records.length} rows`);
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Starting BSNL Excel import...\n');

  // 1. BAs circles  [id, Circle, BA name]
  await importSheet('BAs circles', 'bas_circles', r => ({
    circle:  clean(r[1]),
    ba_name: clean(r[2]),
  }));

  // 2. EB contacts  [id, Circle, Designation, Name, Mobile, Mail id, BA Name]
  await importSheet('EB contacts', 'eb_contacts', r => ({
    circle:      clean(r[1]),
    designation: clean(r[2]),
    name:        clean(r[3]),
    mobile:      clean(r[4]),
    mail_id:     clean(r[5]),
    ba_name:     clean(r[6]),
  }));

  // 3. CGGB  [row_id, Circuit ID, Billing A/c, Name, BANDWIDTH, WAN IP, OA, Field incharge name, Field incharge number, NULL, PCM incharge number]
  await importSheet('CGGB', 'cggb', r => ({
    circuit_id:            clean(r[1]),
    billing_account:       clean(r[2]),
    name:                  clean(r[3]),
    bandwidth:             clean(r[4]),
    wan_ip:                clean(r[5]),
    oa:                    clean(r[6]),
    field_incharge_name:   clean(r[7]),
    field_incharge_number: clean(r[8]),
    pcm_incharge_number:   clean(r[10]),
  }));

  // 4. Customers data  [id, Company name, Location, Contact name, Designation, Contact no, mail id]
  await importSheet('Customers data', 'customers_data', r => ({
    company_name: clean(r[1]),
    location:     clean(r[2]),
    contact_name: clean(r[3]),
    designation:  clean(r[4]),
    contact_no:   clean(r[5]),
    mail_id:      clean(r[6]),
  }));

  // 5. Short code  [id, City name, Toll free no, Destination Name]
  await importSheet('Short code', 'short_code', r => ({
    city_name:        clean(r[1]),
    toll_free_no:     clean(r[2]),
    destination_name: clean(r[3]),
  }));

  // 6. ILL data  [ID, LC ID, Billing Account No, BandWidth, Customer Name, Adress, email Adress, Phone no, Billing SSA, service start date, last mile]
  await importSheet('ILL data', 'ill_data', r => ({
    lc_id:              clean(r[1]),
    billing_account_no: clean(r[2]),
    bandwidth:          clean(r[3]),
    customer_name:      clean(r[4]),
    address:            clean(r[5]),
    email_address:      clean(r[6]),
    phone_no:           clean(r[7]),
    billing_ssa:        clean(r[8]),
    service_start_date: clean(r[9]),
    last_mile:          clean(r[10]),
  }));

  // 7. MMVC data  [ID, TelephoneNo, BillingAccountNo, CustomerName, Adress, MMVPlan]
  await importSheet('MMVC data', 'mmvc_data', r => ({
    telephone_no:       clean(r[1]),
    billing_account_no: clean(r[2]),
    customer_name:      clean(r[3]),
    address:            clean(r[4]),
    mmv_plan:           clean(r[5]),
  }));

  // 8. MPLS Data  [id, TelephoneNo, Billing Account No, BandWidth, CustomerName, Adress]
  await importSheet('MPLS Data', 'mpls_data', r => ({
    telephone_no:       clean(r[1]),
    billing_account_no: clean(r[2]),
    bandwidth:          clean(r[3]),
    customer_name:      clean(r[4]),
    address:            clean(r[5]),
  }));

  // 9. NMECT data  [id, TelephoneNo, Billing Account No, BandWidth, CustomerName, Adress, NMECT plan]
  await importSheet('NMECT data', 'nmect_data', r => ({
    telephone_no:       clean(r[1]),
    billing_account_no: clean(r[2]),
    bandwidth:          clean(r[3]),
    customer_name:      clean(r[4]),
    address:            clean(r[5]),
    nmect_plan:         clean(r[6]),
  }));

  // 10. NREGS  [id, District, Mandal, Telephone no, Computer operator Name, Contact no, DRP contact no, BBM No, TIP No]
  await importSheet('NREGS', 'nregs', r => ({
    district:               clean(r[1]),
    mandal:                 clean(r[2]),
    telephone_no:           clean(r[3]),
    computer_operator_name: clean(r[4]),
    contact_no:             clean(r[5]),
    drp_contact_no:         clean(r[6]),
    bbm_no:                 clean(r[7]),
    tip_no:                 clean(r[8]),
  }));

  // 11. NREGSdistricts  [sno, DistName, Mandals]
  await importSheet('NREGSdistricts', 'nregs_districts', r => ({
    dist_name: clean(r[1]),
    mandals:   r[2] ? parseInt(r[2]) : null,
  }));

  // 12. PRIdata  [id, TelephoneNo, BillingAccountNo, CustomerName, Adress, PriPlan]
  await importSheet('PRIdata', 'pri_data', r => ({
    telephone_no:       clean(r[1]),
    billing_account_no: clean(r[2]),
    customer_name:      clean(r[3]),
    address:            clean(r[4]),
    pri_plan:           clean(r[5]),
  }));

  // 13. SIPdata  [id, TelephoneNo, BillingAccountNo, CustomerName, Adress, sipplan]
  await importSheet('SIPdata', 'sip_data', r => ({
    telephone_no:       clean(r[1]),
    billing_account_no: clean(r[2]),
    customer_name:      clean(r[3]),
    address:            clean(r[4]),
    sip_plan:           clean(r[5]),
  }));

  // 14. Tobacco board  [id, LOCATION, BILLING ACCOUNT, LC ID, Cct rent qly, Bandwidth, Circle, BA Name, EB incharge, Contact No, BBM Incharge, BBM Contact]
  await importSheet('Tobacco board', 'tobacco_board', r => ({
    location:        clean(r[1]),
    billing_account: clean(r[2]),
    lc_id:           clean(r[3]),
    cct_rent_qly:    clean(r[4]),
    bandwidth:       clean(r[5]),
    circle:          clean(r[6]),
    ba_name:         clean(r[7]),
    eb_incharge:     clean(r[8]),
    contact_no:      clean(r[9]),
    bbm_incharge:    clean(r[10]),
    bbm_contact:     clean(r[11]),
  }));

  // 15. TollFree  [id, Telephone No, Billing Account No, Customer Name, Adress]
  await importSheet('TollFree', 'toll_free', r => ({
    telephone_no:       clean(r[1]),
    billing_account_no: clean(r[2]),
    customer_name:      clean(r[3]),
    address:            clean(r[4]),
  }));

  console.log('\n🎉 Import complete!\n');
}

main().catch(console.error);

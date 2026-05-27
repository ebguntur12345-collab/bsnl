-- ============================================================
-- BSNL Guntur SSA – Database Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard
-- ============================================================

-- 1. BAs Circles
CREATE TABLE IF NOT EXISTS bas_circles (
  id          SERIAL PRIMARY KEY,
  circle      TEXT,
  ba_name     TEXT
);
ALTER TABLE bas_circles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON bas_circles FOR SELECT USING (true);
CREATE POLICY "Allow anon insert" ON bas_circles FOR INSERT WITH CHECK (true);

-- 2. EB Contacts
CREATE TABLE IF NOT EXISTS eb_contacts (
  id              SERIAL PRIMARY KEY,
  circle          TEXT,
  designation     TEXT,
  name            TEXT,
  enterprise_name TEXT,
  mobile          TEXT,
  mail_id         TEXT,
  ba_name         TEXT
);
ALTER TABLE eb_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON eb_contacts FOR SELECT USING (true);
CREATE POLICY "Allow anon insert" ON eb_contacts FOR INSERT WITH CHECK (true);

-- 3. CGGB
CREATE TABLE IF NOT EXISTS cggb (
  id                    SERIAL PRIMARY KEY,
  circuit_id            TEXT,
  billing_account       TEXT,
  name                  TEXT,
  bandwidth             TEXT,
  wan_ip                TEXT,
  oa                    TEXT,
  field_incharge_name   TEXT,
  field_incharge_number TEXT,
  pcm_incharge_number   TEXT
);
ALTER TABLE cggb ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON cggb FOR SELECT USING (true);
CREATE POLICY "Allow anon insert" ON cggb FOR INSERT WITH CHECK (true);

-- 4. Customers Data
CREATE TABLE IF NOT EXISTS customers_data (
  id            SERIAL PRIMARY KEY,
  company_name  TEXT,
  location      TEXT,
  contact_name  TEXT,
  designation   TEXT,
  contact_no    TEXT,
  mail_id       TEXT
);
ALTER TABLE customers_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON customers_data FOR SELECT USING (true);
CREATE POLICY "Allow anon insert" ON customers_data FOR INSERT WITH CHECK (true);

-- 5. Short Code
CREATE TABLE IF NOT EXISTS short_code (
  id               SERIAL PRIMARY KEY,
  city_name        TEXT,
  toll_free_no     TEXT,
  destination_name TEXT
);
ALTER TABLE short_code ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON short_code FOR SELECT USING (true);
CREATE POLICY "Allow anon insert" ON short_code FOR INSERT WITH CHECK (true);

-- 6. ILL Data
CREATE TABLE IF NOT EXISTS ill_data (
  id                  SERIAL PRIMARY KEY,
  lc_id               TEXT,
  billing_account_no  TEXT,
  bandwidth           TEXT,
  customer_name       TEXT,
  address             TEXT,
  email_address       TEXT,
  phone_no            TEXT,
  billing_ssa         TEXT,
  service_start_date  TEXT,
  last_mile           TEXT
);
ALTER TABLE ill_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON ill_data FOR SELECT USING (true);
CREATE POLICY "Allow anon insert" ON ill_data FOR INSERT WITH CHECK (true);

-- 7. MMVC Data
CREATE TABLE IF NOT EXISTS mmvc_data (
  id                  SERIAL PRIMARY KEY,
  telephone_no        TEXT,
  billing_account_no  TEXT,
  customer_name       TEXT,
  address             TEXT,
  mmv_plan            TEXT
);
ALTER TABLE mmvc_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON mmvc_data FOR SELECT USING (true);
CREATE POLICY "Allow anon insert" ON mmvc_data FOR INSERT WITH CHECK (true);

-- 8. MPLS Data
CREATE TABLE IF NOT EXISTS mpls_data (
  id                  SERIAL PRIMARY KEY,
  telephone_no        TEXT,
  billing_account_no  TEXT,
  bandwidth           TEXT,
  customer_name       TEXT,
  address             TEXT
);
ALTER TABLE mpls_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON mpls_data FOR SELECT USING (true);
CREATE POLICY "Allow anon insert" ON mpls_data FOR INSERT WITH CHECK (true);

-- 9. NMECT Data
CREATE TABLE IF NOT EXISTS nmect_data (
  id                  SERIAL PRIMARY KEY,
  telephone_no        TEXT,
  billing_account_no  TEXT,
  bandwidth           TEXT,
  customer_name       TEXT,
  address             TEXT,
  nmect_plan          TEXT
);
ALTER TABLE nmect_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON nmect_data FOR SELECT USING (true);
CREATE POLICY "Allow anon insert" ON nmect_data FOR INSERT WITH CHECK (true);

-- 10. NREGS
CREATE TABLE IF NOT EXISTS nregs (
  id                      SERIAL PRIMARY KEY,
  district                TEXT,
  mandal                  TEXT,
  telephone_no            TEXT,
  computer_operator_name  TEXT,
  contact_no              TEXT,
  drp_contact_no          TEXT,
  bbm_no                  TEXT,
  tip_no                  TEXT
);
ALTER TABLE nregs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON nregs FOR SELECT USING (true);
CREATE POLICY "Allow anon insert" ON nregs FOR INSERT WITH CHECK (true);

-- 11. NREGS Districts
CREATE TABLE IF NOT EXISTS nregs_districts (
  id        SERIAL PRIMARY KEY,
  dist_name TEXT,
  mandals   INTEGER
);
ALTER TABLE nregs_districts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON nregs_districts FOR SELECT USING (true);
CREATE POLICY "Allow anon insert" ON nregs_districts FOR INSERT WITH CHECK (true);

-- 12. PRI Data
CREATE TABLE IF NOT EXISTS pri_data (
  id                  SERIAL PRIMARY KEY,
  telephone_no        TEXT,
  billing_account_no  TEXT,
  customer_name       TEXT,
  address             TEXT,
  pri_plan            TEXT
);
ALTER TABLE pri_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON pri_data FOR SELECT USING (true);
CREATE POLICY "Allow anon insert" ON pri_data FOR INSERT WITH CHECK (true);

-- 13. SIP Data
CREATE TABLE IF NOT EXISTS sip_data (
  id                  SERIAL PRIMARY KEY,
  telephone_no        TEXT,
  billing_account_no  TEXT,
  customer_name       TEXT,
  address             TEXT,
  sip_plan            TEXT
);
ALTER TABLE sip_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON sip_data FOR SELECT USING (true);
CREATE POLICY "Allow anon insert" ON sip_data FOR INSERT WITH CHECK (true);

-- 14. Tobacco Board
CREATE TABLE IF NOT EXISTS tobacco_board (
  id              SERIAL PRIMARY KEY,
  location        TEXT,
  billing_account TEXT,
  lc_id           TEXT,
  cct_rent_qly    TEXT,
  bandwidth       TEXT,
  circle          TEXT,
  ba_name         TEXT,
  eb_incharge     TEXT,
  contact_no      TEXT,
  bbm_incharge    TEXT,
  bbm_contact     TEXT
);
ALTER TABLE tobacco_board ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON tobacco_board FOR SELECT USING (true);
CREATE POLICY "Allow anon insert" ON tobacco_board FOR INSERT WITH CHECK (true);

-- 15. Toll Free
CREATE TABLE IF NOT EXISTS toll_free (
  id                  SERIAL PRIMARY KEY,
  telephone_no        TEXT,
  billing_account_no  TEXT,
  customer_name       TEXT,
  address             TEXT
);
ALTER TABLE toll_free ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON toll_free FOR SELECT USING (true);
CREATE POLICY "Allow anon insert" ON toll_free FOR INSERT WITH CHECK (true);

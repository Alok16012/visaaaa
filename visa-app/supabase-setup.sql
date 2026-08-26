-- ============================================
-- VISA MANAGEMENT SYSTEM - SUPABASE SETUP
-- ============================================

-- 1. Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL DEFAULT 'admin',
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT 'Admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create agencies table
CREATE TABLE IF NOT EXISTS agencies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  contact_person TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id TEXT NOT NULL,
  client_name TEXT NOT NULL,
  agency_id UUID REFERENCES agencies(id),
  country TEXT DEFAULT '',
  citizenship TEXT DEFAULT '',
  passport_number TEXT DEFAULT '',
  mobile_number TEXT DEFAULT '',
  job_position TEXT DEFAULT '',
  application_status TEXT DEFAULT 'New',
  approval_status TEXT DEFAULT 'Pending',
  advance_payment NUMERIC DEFAULT 0,
  due_payment NUMERIC DEFAULT 0,
  total_payment NUMERIC DEFAULT 0,
  balance NUMERIC DEFAULT 0,
  follow_up_date DATE,
  remarks TEXT DEFAULT '',
  created_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create job_categories table
CREATE TABLE IF NOT EXISTS job_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create visa_types table
CREATE TABLE IF NOT EXISTS visa_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_application_id ON clients(application_id);
CREATE INDEX IF NOT EXISTS idx_clients_passport ON clients(passport_number);
CREATE INDEX IF NOT EXISTS idx_clients_agency ON clients(agency_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(application_status);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(client_name);

-- 7. Lock every table down.
--
-- The app never talks to Supabase from the browser: all reads and writes go
-- through /api/data/* on the server, which uses the service_role key and so
-- bypasses RLS. Enabling RLS with no policies therefore leaves the app fully
-- working while giving the public anon key access to nothing. Without this,
-- anyone could read every client's passport and mobile number.
ALTER TABLE admin_users     ENABLE ROW LEVEL SECURITY;
ALTER TABLE agencies        ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients         ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE visa_types      ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON admin_users, agencies, clients, job_categories, visa_types
  FROM anon, authenticated;

-- ============================================
-- SAMPLE DATA (Optional - remove if not needed)
-- ============================================

-- job_categories and visa_types declare name UNIQUE, so their ON CONFLICT
-- clauses below have something to catch. agencies did not, which meant
-- re-running this file silently inserted a second copy of every agency.
CREATE UNIQUE INDEX IF NOT EXISTS agencies_name_key ON agencies (name);

-- Insert sample agencies
INSERT INTO agencies (name, country, contact_person, phone, email) VALUES
  ('OPUS VIS', 'Croatia', 'John Smith', '+385-1-1234567', 'info@opusvis.hr'),
  ('ABC RECRUITMENT', 'Serbia', 'Milan Petrovic', '+381-11-1234567', 'contact@abcrecruitment.rs'),
  ('BALKAN HIRING', 'Slovenia', 'Ana Novak', '+386-1-2345678', 'info@balkanhiring.si'),
  ('EURO JOB CENTER', 'Romania', 'George Popescu', '+40-21-1234567', 'office@eurojobcenter.ro'),
  ('FUTURE EMPLOYMENT', 'Moldova', 'Ion Ivanov', '+373-22-123456', 'info@futureemployment.md')
ON CONFLICT DO NOTHING;

-- Insert sample job categories
INSERT INTO job_categories (name) VALUES
  ('Construction'), ('Factory Worker'), ('Healthcare'), ('Hospitality'),
  ('Engineering'), ('Agriculture'), ('Driver'), ('Security')
ON CONFLICT DO NOTHING;

-- Insert sample visa types
INSERT INTO visa_types (name) VALUES
  ('Work Visa'), ('Employment Visa'), ('Business Visa'), ('Tourist Visa')
ON CONFLICT DO NOTHING;

-- ============================================
-- IMPORTANT SETUP STEPS
-- ============================================
-- 1. Go to Supabase Dashboard → SQL Editor and run this whole file.
--    It is safe to re-run: every statement is idempotent.
-- 2. Set these environment variables on the host (Netlify → Project
--    configuration → Environment variables), both WITHOUT NEXT_PUBLIC_:
--      SUPABASE_URL
--      SUPABASE_SERVICE_ROLE_KEY
-- 3. Redeploy.
--
-- NOTE: admin_users is created but deliberately left empty. /api/auth/login
-- currently accepts any non-empty username and password, so anyone who finds
-- the site can sign in. Wiring login up to admin_users is still to do; seeding
-- a default admin/admin123 row now would just leave a weak account waiting.
-- ============================================

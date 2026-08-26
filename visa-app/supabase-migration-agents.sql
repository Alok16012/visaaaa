-- ============================================
-- MIGRATION: agents, plus visa_type / job_category on clients
-- ============================================
-- Run this once in Supabase Dashboard → SQL Editor on a database that already
-- has supabase-setup.sql applied. Safe to re-run.
--
-- The dashboard's client table shows Agent Name, Visa Type and Job Category as
-- separate columns. Agents had no table at all, and clients only carried
-- job_position, so those three columns had nothing to read from.

-- 1. agents
CREATE TABLE IF NOT EXISTS agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gives the seed inserts below a conflict target, so re-running is a no-op.
CREATE UNIQUE INDEX IF NOT EXISTS agents_name_key ON agents (name);

-- Same posture as every other table: reachable only via the service_role key
-- that /api/data/* uses on the server.
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON agents FROM anon, authenticated;

-- 2. New client columns
ALTER TABLE clients ADD COLUMN IF NOT EXISTS agent_id     UUID REFERENCES agents(id);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS visa_type    TEXT DEFAULT '';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS job_category TEXT DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_clients_agent ON clients(agent_id);

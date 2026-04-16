-- ============================================================
-- Migration 002 — Team Members, Vendors, Tenant Assignment
-- ============================================================
-- HOW TO USE:
-- 1. Go to https://app.supabase.com → your project
-- 2. SQL Editor → New Query
-- 3. Paste this file and click Run
-- ============================================================

-- ─── TEAM MEMBERS ────────────────────────────────────────────────────────────
CREATE TABLE team_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  manager_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─── VENDORS ─────────────────────────────────────────────────────────────────
CREATE TABLE vendors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  manager_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  specialty TEXT NOT NULL CHECK (specialty IN ('plumbing', 'electrical', 'hvac', 'landscaping', 'general', 'cleaning')),
  email TEXT NOT NULL,
  phone TEXT,
  rating NUMERIC(3,1) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─── LINK TENANTS TO A TEAM MEMBER ───────────────────────────────────────────
ALTER TABLE tenants ADD COLUMN team_member_id UUID REFERENCES team_members(id) ON DELETE SET NULL;

-- ─── INDEXES ─────────────────────────────────────────────────────────────────
CREATE INDEX idx_team_members_manager ON team_members(manager_id);
CREATE INDEX idx_vendors_manager ON vendors(manager_id);
CREATE INDEX idx_tenants_team_member ON tenants(team_member_id);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────────
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers CRUD own team members" ON team_members FOR ALL USING (auth.uid() = manager_id);
CREATE POLICY "Managers CRUD own vendors" ON vendors FOR ALL USING (auth.uid() = manager_id);

-- ─── TRIGGERS ────────────────────────────────────────────────────────────────
CREATE TRIGGER trg_team_members_updated
  BEFORE UPDATE ON team_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_vendors_updated
  BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

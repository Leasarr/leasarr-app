-- ============================================================
-- Migration 012 — Team Accounts (Phase 0: Schema)
-- ============================================================
-- Adds invite columns to team_members and auto-links profiles on signup.
-- Safe to run on existing data — new columns are nullable with sensible defaults.
-- ============================================================

-- Add new columns to team_members
ALTER TABLE team_members
  ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS invited_email TEXT,
  ADD COLUMN IF NOT EXISTS invite_token TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS invited_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ;

-- Expand status constraint to include 'pending'
ALTER TABLE team_members DROP CONSTRAINT IF EXISTS team_members_status_check;
ALTER TABLE team_members ADD CONSTRAINT team_members_status_check
  CHECK (status IN ('pending', 'active', 'inactive'));

-- Indexes for fast invite-token lookup and email matching
CREATE INDEX IF NOT EXISTS idx_team_members_invite_token ON team_members(invite_token);
CREATE INDEX IF NOT EXISTS idx_team_members_invited_email ON team_members(invited_email);
CREATE INDEX IF NOT EXISTS idx_team_members_profile_id ON team_members(profile_id);

-- ─── AUTO-LINK: when a new profile is created, link it to any pending invite ──
-- Mirrors the link_profile_to_tenant pattern from migration 009.
CREATE OR REPLACE FUNCTION link_profile_to_team_member()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE team_members
  SET
    profile_id  = NEW.id,
    status      = 'active',
    accepted_at = NOW(),
    invite_token = NULL
  WHERE LOWER(invited_email) = LOWER(NEW.email)
    AND profile_id IS NULL
    AND status = 'pending';
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_link_profile_to_team_member ON profiles;
CREATE TRIGGER trg_link_profile_to_team_member
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION link_profile_to_team_member();

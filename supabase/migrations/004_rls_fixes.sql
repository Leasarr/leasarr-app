-- Migration 004 — RLS Security Fixes
--
-- Fix 1: Prevent admin role injection via sign-up metadata
-- Fix 2: Restrict tenant maintenance policy — remove DELETE, restrict UPDATE to open requests only
--
-- Safe to run on an existing database — no data is modified.
-- Existing users, sessions, and records are unaffected.

-- ─── FIX 1: handle_new_user — whitelist allowed roles ────────────────────────
-- The original function accepted any role value from raw_user_meta_data,
-- including 'admin'. This replaces the function in-place (no trigger change needed).
-- Only 'manager' and 'tenant' are now accepted from sign-up metadata;
-- anything else (including 'admin') falls back to 'manager'.

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    CASE
      WHEN NEW.raw_user_meta_data->>'role' IN ('manager', 'tenant')
        THEN NEW.raw_user_meta_data->>'role'
      ELSE 'manager'
    END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── FIX 2: Tenant maintenance policies ──────────────────────────────────────
-- The original FOR ALL policy allowed tenants to DELETE maintenance requests,
-- including completed ones (removing the audit trail).
-- Replaced with explicit per-operation policies:
--   SELECT  — read own requests (unchanged behaviour)
--   INSERT  — submit new requests (unchanged behaviour)
--   UPDATE  — cancel own requests, but only while status is still 'open'
--   DELETE  — not granted

DROP POLICY "Tenants CRUD own maintenance" ON maintenance_requests;

CREATE POLICY "Tenants select own maintenance"
  ON maintenance_requests FOR SELECT
  USING (
    tenant_id IN (SELECT id FROM tenants WHERE profile_id = auth.uid())
  );

CREATE POLICY "Tenants insert own maintenance"
  ON maintenance_requests FOR INSERT
  WITH CHECK (
    tenant_id IN (SELECT id FROM tenants WHERE profile_id = auth.uid())
  );

-- USING restricts which rows can be targeted (must be currently 'open').
-- WITH CHECK validates the resulting row still belongs to this tenant.
CREATE POLICY "Tenants update own maintenance"
  ON maintenance_requests FOR UPDATE
  USING (
    tenant_id IN (SELECT id FROM tenants WHERE profile_id = auth.uid())
    AND status = 'open'
  )
  WITH CHECK (
    tenant_id IN (SELECT id FROM tenants WHERE profile_id = auth.uid())
  );

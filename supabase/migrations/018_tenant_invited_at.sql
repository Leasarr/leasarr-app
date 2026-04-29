-- Migration 018 — Add invited_at to tenants
-- Tracks when the manager last sent a portal invite to the tenant.
-- NULL = no invite sent yet. Non-null = invite sent, awaiting sign-up.
-- Once profile_id is set (tenant signed up), invited_at is no longer relevant.

ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS invited_at timestamptz;
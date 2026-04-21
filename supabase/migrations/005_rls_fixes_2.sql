-- Migration 005 — RLS Security Fixes (round 2)
--
-- Fix 1: profiles UPDATE — prevent users from changing their own role
-- Fix 2: notifications UPDATE — prevent redirecting a notification to another user
--
-- Safe to run on an existing database — no data is modified.
-- Existing users, sessions, and records are unaffected.

-- ─── FIX 1: profiles — lock the role column on UPDATE ────────────────────────
-- The original policy had no WITH CHECK, allowing any column to be updated
-- including role. A tenant could set role = 'manager' via direct API call.
-- The new WITH CHECK verifies the role value in the updated row matches
-- the current role stored in the database — role changes are blocked entirely.
-- The app only ever updates name/email/phone (AuthContext.updateProfile),
-- so this does not affect any existing functionality.

DROP POLICY "Users update own profile" ON profiles;

CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM profiles WHERE id = auth.uid())
  );

-- ─── FIX 2: notifications — prevent profile_id reassignment on UPDATE ────────
-- The original policy had no WITH CHECK. A user could update profile_id on
-- their own notification to another user's UUID, injecting it into that
-- user's notification feed. WITH CHECK ensures the row still belongs to
-- the same user after the update.
-- The app only marks notifications as read (updates the `read` boolean),
-- so this does not affect any existing functionality.

DROP POLICY "Users update own notifications" ON notifications;

CREATE POLICY "Users update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

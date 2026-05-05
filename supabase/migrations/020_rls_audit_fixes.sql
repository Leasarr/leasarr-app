-- Migration 020 — RLS audit fixes
--
-- Fix 1: Tenant messages — restrict from ALL to SELECT + INSERT.
--   Tenants were able to DELETE/UPDATE manager messages via direct API calls.
--
-- Fix 2: Avatar uploads — restrict INSERT to the user's own path folder.
--   Any authenticated user could upload files to arbitrary paths in the avatars bucket.

-- ─── Fix 1: Messages tenant policy ───────────────────────────────────────────

DROP POLICY IF EXISTS "Tenants CRUD own messages" ON messages;

CREATE POLICY "Tenants select own messages" ON messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT c.id FROM conversations c
      JOIN tenants t ON t.id = c.tenant_id
      WHERE t.profile_id = auth.uid()
    )
  );

CREATE POLICY "Tenants insert own messages" ON messages
  FOR INSERT WITH CHECK (
    conversation_id IN (
      SELECT c.id FROM conversations c
      JOIN tenants t ON t.id = c.tenant_id
      WHERE t.profile_id = auth.uid()
    )
  );

-- ─── Fix 2: Avatar upload path restriction ────────────────────────────────────

DROP POLICY IF EXISTS "avatars: authenticated upload" ON storage.objects;

CREATE POLICY "avatars: authenticated upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

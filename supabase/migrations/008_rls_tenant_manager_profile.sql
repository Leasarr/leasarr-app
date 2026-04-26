-- Migration 008 — RLS: allow tenants to read their manager's profile
--
-- The tenant portal queries the manager's name and email from the profiles table.
-- The existing "Users view own profile" policy only allows reading one's own row,
-- so the manager contact section in the portal always returned null.
-- This policy allows a tenant to SELECT the profile of the manager who owns
-- the property they are assigned to.

CREATE POLICY "Tenants view manager profile" ON profiles
  FOR SELECT USING (
    id IN (
      SELECT prop.manager_id
      FROM properties prop
      JOIN tenants t ON t.property_id = prop.id
      WHERE t.profile_id = auth.uid()
    )
  );

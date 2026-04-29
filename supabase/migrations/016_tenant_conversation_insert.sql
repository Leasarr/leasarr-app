-- Allow tenants to INSERT conversations where they are the tenant party.
-- The existing SELECT policy already ensures they can only read their own conversations.
CREATE POLICY "Tenants insert own conversations" ON conversations
  FOR INSERT WITH CHECK (
    tenant_id IN (SELECT id FROM tenants WHERE profile_id = auth.uid())
  );

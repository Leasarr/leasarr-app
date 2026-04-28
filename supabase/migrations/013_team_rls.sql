-- ============================================================
-- Migration 013 — Team Accounts (Phase 1: RLS Broadening)
-- ============================================================
-- Creates can_access_manager_data() helper and updates every
-- manager-owned table to allow active team members access.
--
-- SECURITY NOTE: This is the highest-risk migration.
-- One missed table = a team member could see another manager's data.
-- The helper function is SECURITY DEFINER so it bypasses RLS when
-- querying team_members — required for the sub-select to work correctly.
-- ============================================================

-- ─── HELPER FUNCTION ─────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION can_access_manager_data(target_manager_id UUID)
RETURNS BOOLEAN LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT
    auth.uid() = target_manager_id
    OR EXISTS (
      SELECT 1 FROM team_members
      WHERE manager_id  = target_manager_id
        AND profile_id  = auth.uid()
        AND status      = 'active'
    )
$$;

-- ─── PROPERTIES ──────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Managers CRUD own properties" ON properties;
CREATE POLICY "Managers CRUD own properties" ON properties FOR ALL
  USING (can_access_manager_data(manager_id));

-- ─── UNITS (via property) ─────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Managers CRUD own units" ON units;
CREATE POLICY "Managers CRUD own units" ON units FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = property_id
        AND can_access_manager_data(p.manager_id)
    )
  );

-- ─── TENANTS ─────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Managers CRUD own tenants" ON tenants;
CREATE POLICY "Managers CRUD own tenants" ON tenants FOR ALL
  USING (can_access_manager_data(manager_id));

-- ─── LEASES (via property) ────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Managers CRUD own leases" ON leases;
CREATE POLICY "Managers CRUD own leases" ON leases FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = property_id
        AND can_access_manager_data(p.manager_id)
    )
  );

-- ─── LEASE DOCUMENTS (via lease → property) ───────────────────────────────────

DROP POLICY IF EXISTS "Managers CRUD lease docs" ON lease_documents;
CREATE POLICY "Managers CRUD lease docs" ON lease_documents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM leases l
      JOIN properties p ON p.id = l.property_id
      WHERE l.id = lease_id
        AND can_access_manager_data(p.manager_id)
    )
  );

-- ─── PAYMENTS (via property) ──────────────────────────────────────────────────

DROP POLICY IF EXISTS "Managers CRUD own payments" ON payments;
CREATE POLICY "Managers CRUD own payments" ON payments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = property_id
        AND can_access_manager_data(p.manager_id)
    )
  );

-- ─── MAINTENANCE REQUESTS (via property) ─────────────────────────────────────
-- NOTE: Tenant-specific policies from migration 004 remain unchanged.
-- Multiple policies are OR-ed; tenant policies still grant tenant access.

DROP POLICY IF EXISTS "Managers CRUD own maintenance" ON maintenance_requests;
CREATE POLICY "Managers CRUD own maintenance" ON maintenance_requests FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = property_id
        AND can_access_manager_data(p.manager_id)
    )
  );

-- ─── TEAM MEMBERS ────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Managers CRUD own team members" ON team_members;
CREATE POLICY "Managers CRUD own team members" ON team_members FOR ALL
  USING (can_access_manager_data(manager_id));

-- ─── VENDORS ─────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Managers CRUD own vendors" ON vendors;
CREATE POLICY "Managers CRUD own vendors" ON vendors FOR ALL
  USING (can_access_manager_data(manager_id));

-- ─── CONVERSATIONS ────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Managers CRUD own conversations" ON conversations;
CREATE POLICY "Managers CRUD own conversations" ON conversations FOR ALL
  USING (can_access_manager_data(manager_id));

-- ─── MESSAGES (via conversation) ─────────────────────────────────────────────

DROP POLICY IF EXISTS "Managers CRUD own messages" ON messages;
CREATE POLICY "Managers CRUD own messages" ON messages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
        AND can_access_manager_data(c.manager_id)
    )
  );

-- ─── SUBSCRIPTIONS (read-only for team members; writes stay owner/service-role only) ───

DROP POLICY IF EXISTS "Manager reads own subscription" ON subscriptions;
CREATE POLICY "Manager reads own subscription" ON subscriptions FOR SELECT
  USING (can_access_manager_data(manager_id));

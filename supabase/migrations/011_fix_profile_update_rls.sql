-- Migration 011 — Fix profile UPDATE RLS
--
-- Migration 005's WITH CHECK used a self-referential subquery:
--   role = (SELECT role FROM profiles WHERE id = auth.uid())
-- During UPDATE evaluation this subquery can return NULL, making
-- `role = NULL` → unknown → WITH CHECK fails on every profile update
-- (name, email, phone, avatar_url), even though role is not changing.
--
-- Fix: simplify the RLS policy to just own-row gating, and enforce the
-- role-change lock via a BEFORE UPDATE trigger instead. The trigger
-- exempts the service_role user so /api/auth/set-role still works.

-- ─── Simplify UPDATE policy ───────────────────────────────────────────────────
DROP POLICY "Users update own profile" ON profiles;

CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ─── Role-change lock via trigger ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION prevent_role_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role != OLD.role AND current_user != 'service_role' THEN
    RAISE EXCEPTION 'Role changes must go through the /api/auth/set-role endpoint';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_role_change
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION prevent_role_change();

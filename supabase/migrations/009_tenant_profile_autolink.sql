-- Migration 009 — Auto-link new profiles to existing tenant records by email
--
-- When a manager adds a tenant (tenants.profile_id is NULL), and that tenant
-- later signs up, this trigger fires after their profiles row is created and
-- matches by email, setting tenants.profile_id to the new auth UUID.
-- Without this, the tenant portal returns empty — profile_id never gets set.

CREATE OR REPLACE FUNCTION link_profile_to_tenant()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.tenants
  SET profile_id = NEW.id
  WHERE email = NEW.email
    AND profile_id IS NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_link_profile_to_tenant
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION link_profile_to_tenant();

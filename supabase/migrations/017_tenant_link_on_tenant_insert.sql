-- Migration 017 — Auto-link tenant records to existing profiles on tenant INSERT
--
-- Migration 009 covers: tenant signs up AFTER manager adds their record
--   → trigger on profiles INSERT sets tenants.profile_id
--
-- This covers the reverse: manager adds a tenant record for someone who already
-- has a Leasarr account → profile_id would stay NULL forever without this.

CREATE OR REPLACE FUNCTION link_tenant_to_profile()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email IS NOT NULL AND NEW.profile_id IS NULL THEN
    UPDATE public.tenants
    SET profile_id = (
      SELECT id FROM public.profiles WHERE email = NEW.email LIMIT 1
    )
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_link_tenant_to_profile
  AFTER INSERT ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION link_tenant_to_profile();

-- Backfill: fix any existing tenant rows missing profile_id
UPDATE public.tenants t
SET profile_id = p.id
FROM public.profiles p
WHERE t.email = p.email
  AND t.profile_id IS NULL
  AND t.email IS NOT NULL;

-- Migration 007 — Payment & Lease Notification Triggers

-- ─── PAYMENT: recorded as paid ────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION notify_tenant_payment_received()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_profile_id UUID;
BEGIN
  IF NOT (
    (TG_OP = 'INSERT' AND NEW.status = 'paid') OR
    (TG_OP = 'UPDATE' AND NEW.status = 'paid' AND OLD.status != 'paid')
  ) THEN RETURN NEW; END IF;

  SELECT profile_id INTO v_profile_id FROM tenants WHERE id = NEW.tenant_id;
  IF v_profile_id IS NULL THEN RETURN NEW; END IF;

  INSERT INTO notifications (profile_id, type, title, body, linked_record_id)
  VALUES (
    v_profile_id,
    'payment',
    'Payment confirmed',
    'Your payment of $' || NEW.amount || ' has been received.',
    NEW.id
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_tenant_payment_received
  AFTER INSERT OR UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION notify_tenant_payment_received();

-- ─── PAYMENT: marked overdue ──────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION notify_tenant_payment_overdue()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_profile_id UUID;
BEGIN
  IF NEW.status != 'overdue' OR OLD.status = 'overdue' THEN RETURN NEW; END IF;

  SELECT profile_id INTO v_profile_id FROM tenants WHERE id = NEW.tenant_id;
  IF v_profile_id IS NULL THEN RETURN NEW; END IF;

  INSERT INTO notifications (profile_id, type, title, body, linked_record_id)
  VALUES (
    v_profile_id,
    'payment',
    'Payment overdue',
    'Your payment of $' || NEW.amount || ' was due on ' || TO_CHAR(NEW.due_date, 'Mon DD, YYYY') || '. Please contact your manager.',
    NEW.id
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_tenant_payment_overdue
  AFTER UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION notify_tenant_payment_overdue();

-- ─── LEASE: created ───────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION notify_tenant_lease_created()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_profile_id UUID;
BEGIN
  SELECT profile_id INTO v_profile_id FROM tenants WHERE id = NEW.tenant_id;
  IF v_profile_id IS NULL THEN RETURN NEW; END IF;

  INSERT INTO notifications (profile_id, type, title, body, linked_record_id)
  VALUES (
    v_profile_id,
    'lease',
    'Lease created',
    'Your lease runs from ' || TO_CHAR(NEW.start_date, 'Mon DD, YYYY') || ' to ' || TO_CHAR(NEW.end_date, 'Mon DD, YYYY') || '. Monthly rent: $' || NEW.rent_amount || '.',
    NEW.id
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_tenant_lease_created
  AFTER INSERT ON leases
  FOR EACH ROW EXECUTE FUNCTION notify_tenant_lease_created();

-- ─── LEASE: terminated ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION notify_tenant_lease_terminated()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_profile_id UUID;
BEGIN
  IF NEW.status != 'terminated' OR OLD.status = 'terminated' THEN RETURN NEW; END IF;

  SELECT profile_id INTO v_profile_id FROM tenants WHERE id = NEW.tenant_id;
  IF v_profile_id IS NULL THEN RETURN NEW; END IF;

  INSERT INTO notifications (profile_id, type, title, body, linked_record_id)
  VALUES (
    v_profile_id,
    'lease',
    'Lease terminated',
    'Your lease ending ' || TO_CHAR(OLD.end_date, 'Mon DD, YYYY') || ' has been terminated. Please contact your manager.',
    NEW.id
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_tenant_lease_terminated
  AFTER UPDATE ON leases
  FOR EACH ROW EXECUTE FUNCTION notify_tenant_lease_terminated();

-- Migration 003 — In-App Notifications

-- ─── NOTIFICATIONS TABLE ──────────────────────────────────────────────────────
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('maintenance', 'payment', 'lease')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  linked_record_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_notifications_profile ON notifications(profile_id);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own notifications"
  ON notifications FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users update own notifications"
  ON notifications FOR UPDATE USING (auth.uid() = profile_id);

-- ─── TRIGGER: tenant submits request → notify manager ─────────────────────────
CREATE OR REPLACE FUNCTION notify_manager_new_request()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_manager_id UUID;
  v_tenant_name TEXT;
BEGIN
  SELECT p.name INTO v_tenant_name
  FROM tenants t JOIN profiles p ON p.id = t.profile_id
  WHERE t.id = NEW.tenant_id;

  SELECT manager_id INTO v_manager_id
  FROM properties WHERE id = NEW.property_id;

  IF v_manager_id IS NOT NULL THEN
    INSERT INTO notifications (profile_id, type, title, body, linked_record_id)
    VALUES (
      v_manager_id,
      'maintenance',
      'New maintenance request',
      COALESCE(v_tenant_name, 'A tenant') || ' — ' || NEW.title,
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_manager_new_request
  AFTER INSERT ON maintenance_requests
  FOR EACH ROW EXECUTE FUNCTION notify_manager_new_request();

-- ─── TRIGGER: manager assigns/completes → notify tenant ───────────────────────
CREATE OR REPLACE FUNCTION notify_tenant_request_updated()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_profile_id UUID;
BEGIN
  IF OLD.status = NEW.status AND OLD.assigned_to IS NOT DISTINCT FROM NEW.assigned_to THEN
    RETURN NEW;
  END IF;

  SELECT profile_id INTO v_profile_id FROM tenants WHERE id = NEW.tenant_id;

  IF v_profile_id IS NULL THEN RETURN NEW; END IF;

  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    INSERT INTO notifications (profile_id, type, title, body, linked_record_id)
    VALUES (v_profile_id, 'maintenance', 'Request completed', NEW.title || ' has been marked as completed.', NEW.id);
  ELSIF NEW.assigned_to IS NOT NULL AND OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
    INSERT INTO notifications (profile_id, type, title, body, linked_record_id)
    VALUES (v_profile_id, 'maintenance', 'Technician assigned', NEW.title || ' has been assigned to ' || NEW.assigned_to || '.', NEW.id);
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_tenant_request_updated
  AFTER UPDATE ON maintenance_requests
  FOR EACH ROW EXECUTE FUNCTION notify_tenant_request_updated();

-- ─── REALTIME ─────────────────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

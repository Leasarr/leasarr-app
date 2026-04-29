-- ─── TRIAL SETUP ─────────────────────────────────────────────────────────────
-- Auto-create a 30-day trialing subscription row when a manager signs up.
-- Team members and tenants are skipped (only managers own subscriptions).

CREATE OR REPLACE FUNCTION handle_new_manager_trial()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.role = 'manager' THEN
    INSERT INTO subscriptions (manager_id, status, trial_end)
    VALUES (NEW.id, 'trialing', NOW() + INTERVAL '30 days')
    ON CONFLICT (manager_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_manager_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_new_manager_trial();

-- Backfill existing managers who don't have a subscription row yet
INSERT INTO subscriptions (manager_id, status, trial_end)
SELECT id, 'trialing', NOW() + INTERVAL '30 days'
FROM profiles
WHERE role = 'manager'
ON CONFLICT (manager_id) DO NOTHING;

-- ─── ANNOUNCEMENTS ───────────────────────────────────────────────────────────

CREATE TABLE announcements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  manager_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  channels TEXT[] NOT NULL DEFAULT '{}',
  property_ids UUID[] NOT NULL DEFAULT '{}',
  recipients INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('sent', 'scheduled', 'draft')),
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_announcements_manager ON announcements(manager_id);
CREATE INDEX idx_announcements_status ON announcements(status);

CREATE TRIGGER trg_announcements_updated
  BEFORE UPDATE ON announcements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Managers (and their team members) CRUD own announcements
CREATE POLICY "Managers CRUD own announcements" ON announcements FOR ALL
  USING (can_access_manager_data(manager_id));

-- ============================================================
-- Leasarr — Complete Database Schema for Supabase
-- ============================================================
-- HOW TO USE:
-- 1. Go to https://app.supabase.com
-- 2. Create a new project (takes ~2 minutes to provision)
-- 3. Go to SQL Editor → New Query
-- 4. Paste this entire file and click Run
-- 5. Copy your project URL and anon key into .env.local
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ─── PROFILES ────────────────────────────────────────────────────────────────
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'manager' CHECK (role IN ('admin', 'manager', 'tenant')),
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─── PROPERTIES ──────────────────────────────────────────────────────────────
CREATE TABLE properties (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  manager_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'apartment' CHECK (type IN ('apartment', 'house', 'condo', 'commercial')),
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─── UNITS ───────────────────────────────────────────────────────────────────
CREATE TABLE units (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  unit_number TEXT NOT NULL,
  floor INT,
  bedrooms INT NOT NULL DEFAULT 1,
  bathrooms NUMERIC(3,1) NOT NULL DEFAULT 1,
  sqft INT,
  rent_amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'vacant' CHECK (status IN ('occupied', 'vacant', 'maintenance')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(property_id, unit_number)
);

-- ─── TENANTS ─────────────────────────────────────────────────────────────────
CREATE TABLE tenants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  manager_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES profiles(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  avatar_url TEXT,
  unit_id UUID REFERENCES units(id),
  property_id UUID REFERENCES properties(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending')),
  move_in_date DATE,
  credit_score INT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─── LEASES ──────────────────────────────────────────────────────────────────
CREATE TABLE leases (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  unit_id UUID REFERENCES units(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  rent_amount NUMERIC(10,2) NOT NULL,
  security_deposit NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'expired', 'pending', 'terminated')),
  renewal_status TEXT CHECK (renewal_status IN ('offered', 'accepted', 'declined')),
  terms TEXT,
  signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT valid_dates CHECK (end_date > start_date)
);

-- ─── LEASE DOCUMENTS ─────────────────────────────────────────────────────────
CREATE TABLE lease_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lease_id UUID REFERENCES leases(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('lease', 'addendum', 'notice')),
  signed_at TIMESTAMPTZ,
  uploaded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─── PAYMENTS ────────────────────────────────────────────────────────────────
CREATE TABLE payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  lease_id UUID REFERENCES leases(id) ON DELETE CASCADE NOT NULL,
  unit_id UUID REFERENCES units(id) NOT NULL,
  property_id UUID REFERENCES properties(id) NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'overdue', 'partial', 'failed')),
  method TEXT CHECK (method IN ('ach', 'credit_card', 'check', 'cash', 'wire')),
  late_fee NUMERIC(10,2),
  transaction_id TEXT,
  stripe_payment_intent_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─── MAINTENANCE REQUESTS ────────────────────────────────────────────────────
CREATE TABLE maintenance_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  unit_id UUID REFERENCES units(id) NOT NULL,
  property_id UUID REFERENCES properties(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('plumbing', 'electrical', 'hvac', 'appliance', 'structural', 'other')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'emergency')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  assigned_to TEXT,
  scheduled_date DATE,
  completed_date DATE,
  estimated_cost NUMERIC(10,2),
  actual_cost NUMERIC(10,2),
  images TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─── CONVERSATIONS ───────────────────────────────────────────────────────────
CREATE TABLE conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  manager_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  unit_id UUID REFERENCES units(id),
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  unread_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(manager_id, tenant_id)
);

-- ─── MESSAGES ────────────────────────────────────────────────────────────────
CREATE TABLE messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('manager', 'tenant')),
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─── INDEXES ─────────────────────────────────────────────────────────────────
CREATE INDEX idx_properties_manager ON properties(manager_id);
CREATE INDEX idx_units_property ON units(property_id);
CREATE INDEX idx_units_status ON units(status);
CREATE INDEX idx_tenants_manager ON tenants(manager_id);
CREATE INDEX idx_tenants_unit ON tenants(unit_id);
CREATE INDEX idx_tenants_property ON tenants(property_id);
CREATE INDEX idx_tenants_name ON tenants USING GIN (to_tsvector('english', first_name || ' ' || last_name || ' ' || email));
CREATE INDEX idx_leases_tenant ON leases(tenant_id);
CREATE INDEX idx_leases_status ON leases(status);
CREATE INDEX idx_leases_end_date ON leases(end_date);
CREATE INDEX idx_leases_property ON leases(property_id);
CREATE INDEX idx_payments_tenant ON payments(tenant_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_due_date ON payments(due_date);
CREATE INDEX idx_payments_property ON payments(property_id);
CREATE INDEX idx_maintenance_property ON maintenance_requests(property_id);
CREATE INDEX idx_maintenance_status ON maintenance_requests(status);
CREATE INDEX idx_maintenance_priority ON maintenance_requests(priority);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created ON messages(created_at);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE lease_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Properties — managers own their properties
CREATE POLICY "Managers CRUD own properties" ON properties FOR ALL USING (auth.uid() = manager_id);

-- Units — managers who own the property
CREATE POLICY "Managers CRUD own units" ON units FOR ALL
  USING (property_id IN (SELECT id FROM properties WHERE manager_id = auth.uid()));

-- Tenants — managers who manage them
CREATE POLICY "Managers CRUD own tenants" ON tenants FOR ALL USING (auth.uid() = manager_id);

-- Leases — through property ownership
CREATE POLICY "Managers CRUD own leases" ON leases FOR ALL
  USING (property_id IN (SELECT id FROM properties WHERE manager_id = auth.uid()));

-- Lease Documents — through lease
CREATE POLICY "Managers CRUD lease docs" ON lease_documents FOR ALL
  USING (lease_id IN (
    SELECT l.id FROM leases l
    JOIN properties p ON p.id = l.property_id
    WHERE p.manager_id = auth.uid()
  ));

-- Payments — through property ownership
CREATE POLICY "Managers CRUD own payments" ON payments FOR ALL
  USING (property_id IN (SELECT id FROM properties WHERE manager_id = auth.uid()));

-- Maintenance — through property ownership
CREATE POLICY "Managers CRUD own maintenance" ON maintenance_requests FOR ALL
  USING (property_id IN (SELECT id FROM properties WHERE manager_id = auth.uid()));

-- Conversations — managers own their conversations
CREATE POLICY "Managers CRUD own conversations" ON conversations FOR ALL USING (auth.uid() = manager_id);

-- Messages — through conversation
CREATE POLICY "Managers CRUD own messages" ON messages FOR ALL
  USING (conversation_id IN (SELECT id FROM conversations WHERE manager_id = auth.uid()));

-- ─── FUNCTIONS & TRIGGERS ────────────────────────────────────────────────────
-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY['profiles','properties','units','tenants','leases','payments','maintenance_requests','conversations'])
  LOOP
    EXECUTE format('CREATE TRIGGER trg_%s_updated BEFORE UPDATE ON %s FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t, t);
  END LOOP;
END $$;

-- Auto-mark payments as overdue
CREATE OR REPLACE FUNCTION mark_overdue_payments()
RETURNS void AS $$
  UPDATE payments
  SET status = 'overdue'
  WHERE status = 'pending'
    AND due_date < CURRENT_DATE;
$$ LANGUAGE sql;

-- Auto-update conversation last_message
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET last_message = NEW.content,
      last_message_at = NEW.created_at,
      unread_count = CASE WHEN NEW.sender_role = 'tenant' THEN unread_count + 1 ELSE unread_count END,
      updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_message_update_conversation
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

-- Auto-handle auth user → profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'manager')
  )
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── TENANT RLS POLICIES ─────────────────────────────────────────────────────
-- Tenants can view and update their own tenant record
CREATE POLICY "Tenants view own record" ON tenants
  FOR SELECT USING (profile_id = auth.uid());

-- Tenants can view their own leases
CREATE POLICY "Tenants view own leases" ON leases
  FOR SELECT USING (
    tenant_id IN (SELECT id FROM tenants WHERE profile_id = auth.uid())
  );

-- Tenants can view their own lease documents
CREATE POLICY "Tenants view own lease docs" ON lease_documents
  FOR SELECT USING (
    lease_id IN (
      SELECT l.id FROM leases l
      JOIN tenants t ON t.id = l.tenant_id
      WHERE t.profile_id = auth.uid()
    )
  );

-- Tenants can view their own payments
CREATE POLICY "Tenants view own payments" ON payments
  FOR SELECT USING (
    tenant_id IN (SELECT id FROM tenants WHERE profile_id = auth.uid())
  );

-- Tenants can view their own unit
CREATE POLICY "Tenants view own unit" ON units
  FOR SELECT USING (
    id IN (SELECT unit_id FROM tenants WHERE profile_id = auth.uid())
  );

-- Tenants can view the property they live in
CREATE POLICY "Tenants view own property" ON properties
  FOR SELECT USING (
    id IN (SELECT property_id FROM tenants WHERE profile_id = auth.uid())
  );

-- Tenants can create and view their own maintenance requests
CREATE POLICY "Tenants CRUD own maintenance" ON maintenance_requests
  FOR ALL USING (
    tenant_id IN (SELECT id FROM tenants WHERE profile_id = auth.uid())
  );

-- Tenants can view conversations they are a party to
CREATE POLICY "Tenants view own conversations" ON conversations
  FOR SELECT USING (
    tenant_id IN (SELECT id FROM tenants WHERE profile_id = auth.uid())
  );

-- Tenants can read and write messages in their conversations
CREATE POLICY "Tenants CRUD own messages" ON messages
  FOR ALL USING (
    conversation_id IN (
      SELECT c.id FROM conversations c
      JOIN tenants t ON t.id = c.tenant_id
      WHERE t.profile_id = auth.uid()
    )
  );

-- ─── ENABLE REALTIME ─────────────────────────────────────────────────────────
-- Enable real-time for the messages table (for live chat)
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE payments;
ALTER PUBLICATION supabase_realtime ADD TABLE maintenance_requests;

-- ============================================================
-- DONE! Your Leasarr database is ready.
-- Next steps:
-- 1. Copy NEXT_PUBLIC_SUPABASE_URL from Settings > API
-- 2. Copy NEXT_PUBLIC_SUPABASE_ANON_KEY from Settings > API
-- 3. Paste both into .env.local
-- 4. Run: npm install && npm run dev
-- ============================================================

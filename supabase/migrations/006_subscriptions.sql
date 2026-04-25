-- ─── SUBSCRIPTIONS ───────────────────────────────────────────────────────────
CREATE TABLE subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  manager_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  plan TEXT CHECK (plan IN ('starter', 'growth', 'pro', 'enterprise')),
  billing_interval TEXT CHECK (billing_interval IN ('monthly', 'annual')),
  status TEXT NOT NULL DEFAULT 'trialing' CHECK (status IN ('trialing', 'active', 'past_due', 'canceled')),
  trial_end TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  extra_seats INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Managers can read their own subscription
CREATE POLICY "Manager reads own subscription"
  ON subscriptions FOR SELECT
  USING (manager_id = auth.uid());

-- Only service role (webhook handler) writes to subscriptions
-- No INSERT/UPDATE/DELETE policies for authenticated users

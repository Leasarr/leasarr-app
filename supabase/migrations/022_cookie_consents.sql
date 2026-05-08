-- Cookie consent audit log
-- Stores one row per consent decision per user/visitor.
-- anonymous_id is used for visitors who are not logged in.
-- profile_id is populated for authenticated users and synced on login.

create table if not exists cookie_consents (
  id              uuid primary key default gen_random_uuid(),
  profile_id      uuid references profiles(id) on delete cascade,
  anonymous_id    text,
  analytics       boolean not null default false,
  marketing       boolean not null default false,
  ip_country      text,
  policy_version  text not null default '1.0',
  decided_at      timestamptz not null default now(),

  constraint must_have_identity check (
    profile_id is not null or anonymous_id is not null
  )
);

-- Each profile has at most one consent record (supports upsert onConflict)
create unique index if not exists cookie_consents_profile_id_idx
  on cookie_consents (profile_id)
  where profile_id is not null;

-- Each anonymous visitor has at most one consent record (supports upsert onConflict)
create unique index if not exists cookie_consents_anonymous_id_idx
  on cookie_consents (anonymous_id)
  where anonymous_id is not null;

-- RLS
alter table cookie_consents enable row level security;

-- Authenticated users can read and write their own row only
create policy "Users manage own consent"
  on cookie_consents
  for all
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

-- Anonymous inserts go through the API route (service role), no direct anon access

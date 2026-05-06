-- Invite codes for private beta (25 spots)
create table if not exists public.invite_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  max_uses int not null default 1,
  uses_count int not null default 0,
  created_at timestamptz not null default now()
);

-- No public RLS policies = only service role can read/write
alter table public.invite_codes enable row level security;

-- Waitlist for people without a code
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text not null,
  property_count text,
  created_at timestamptz not null default now()
);

alter table public.waitlist enable row level security;

-- Allow anyone (including anon) to insert their own waitlist entry
create policy "Anyone can join waitlist"
  on public.waitlist for insert
  with check (true);

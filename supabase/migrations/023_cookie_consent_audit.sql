-- Migration: 023_cookie_consent_audit
-- Purpose: Convert cookie_consents to an append-only audit log with an action column

-- 1. Add action column (backfilled below before constraint is enforced)
alter table cookie_consents
  add column if not exists action text not null default 'accepted';

-- 2. Backfill existing rows: derive action from analytics value
update cookie_consents
  set action = case when analytics then 'accepted' else 'declined' end;

-- 3. Enforce allowed values
alter table cookie_consents
  add constraint cookie_consents_action_check
  check (action in ('accepted', 'declined', 'withdrawn'));

-- 4. Drop unique indexes — table is now append-only, multiple rows per identity are expected
drop index if exists cookie_consents_profile_id_idx;
drop index if exists cookie_consents_anonymous_id_idx;

-- 5. Add indexes for efficient latest-row queries
create index if not exists cookie_consents_profile_id_time_idx
  on cookie_consents (profile_id, decided_at desc)
  where profile_id is not null;

create index if not exists cookie_consents_anonymous_id_time_idx
  on cookie_consents (anonymous_id, decided_at desc)
  where anonymous_id is not null;

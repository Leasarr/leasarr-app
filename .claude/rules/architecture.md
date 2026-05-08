# Architecture

Next.js 14 App Router, TypeScript, Tailwind CSS, Supabase. Path alias: `@/*` → `src/*`

## Routes

### Marketing (open to all)

| Path | Notes |
|---|---|
| `/` | Marketing homepage; logged-in users redirected to their dashboard |
| `/pricing` | Pricing page — open to everyone including logged-in users |
| `/about` | About page — open to everyone (V2, not yet built) |
| `/waitlist` | Beta waitlist signup — open to everyone; collects name, email, property count |
| `/privacy` | Privacy policy page — open to everyone; covers data collection, retention, third-party processors, user rights (Law 25 / PIPEDA) |

### Auth

| Path | Notes |
|---|---|
| `/auth/login` | Public; demo banner in mock mode |
| `/auth/register` | Public; manager/tenant role selector |
| `/auth/callback` | Supabase OAuth callback |
| `/auth/accept-invite` | Public; team invite token exchange — invitee signs up and is auto-linked to the manager's account |

### App — manager

| Path | Notes |
|---|---|
| `/dashboard` | KPIs, occupancy, activity feed |
| `/properties` | List/detail grid; CRUD for properties and units; unit detail modal with images, lease insights, inline lease creation |
| `/people` | All/Tenants/Team/Vendors tabs; mobile: list hides when tenant selected |
| `/payments` | Full CRUD; auto-fills from active lease |
| `/maintenance` | Active/history; CRUD; real-time INSERT/UPDATE/DELETE |
| `/leases` | Full CRUD; smart form (tenant↔property↔unit auto-population; filters units without active lease) |
| `/settings` | Five sections (Profile, Billing, Team, Notifications, Beta); Beta section visible only to `ADMIN_EMAILS` list; profile name/email/phone/avatar/password + delete account; billing via Stripe checkout/portal; team invite/revoke gated by `useSeats`; email notification prefs; supports `?section=billing\|profile\|team\|notifications` deep-link |
| `/tenants` | Master-detail tenant list; add tenant form; per-tenant tabs for payments, lease, maintenance (not in sidebar nav) |
| `/communication` | Live Supabase data; sidebar toggles Messages/Broadcast; messages tab: ConversationList + ChatPanel with realtime; broadcast tab: BroadcastPanel + AnnouncementHistory; NewChatModal for starting conversations |
| `/reports` | Mock data — V2 |
| `/notifications` | Groups, per-row delete, mark read, real-time |

### App — tenant

| Path | Notes |
|---|---|
| `/portal` | Balance hero, quick actions, recent transactions |
| `/portal/maintenance` | Submit/cancel requests; real-time |
| `/portal/lease` | Lease details + expiry warning |
| `/portal/notifications` | Same UI as manager notifications |
| `/portal/messages` | Tenant ↔ manager direct messaging; single conversation per tenant; creates conversation on first send; realtime; optimistic UI |

## Key files

### App
- `src/components/layout/AppLayout.tsx` — Responsive shell. Desktop: collapsible sidebar (icon-only `w-16` collapsed, `w-64` pinned-open; pin state persisted to `localStorage`; hover temporarily expands) + top bar. Mobile: bottom nav + "More" sheet. Breakpoint `lg`. Realtime notifications; avatar resolves Google photo → uploaded → initials. "Profile & Settings" links to `/settings` page (no longer a modal). Trial pill + "Upgrade" button in top bar for trialing managers (desktop only); pill color: green > 14 days, amber ≤ 14, red ≤ 7 / expired. Trial expired paywall: fullscreen modal overlay when `isExpired && !isActive` (non-tenant only); blocks all app access; links to `/settings?section=billing`.
- `src/context/AuthContext.tsx` — `useAuth()` → `{ user, profile, session, loading, signOut, updateProfile }`
- `src/context/ThemeContext.tsx` — `useTheme()` → `{ theme, setTheme }`. `dark` class on `<html>`.
- `src/middleware.ts` — Three-tier route model: **open** (`/`, `/pricing`, `/about` — everyone including logged-in users, except `/` redirects logged-in users to their home); **auth** (`/auth/login`, `/auth/register` — unauthenticated only; logged-in users redirected); **protected** (manager + tenant routes). API routes open to authenticated users; webhook routes always unauthenticated. **Subdomain routing**: `app.leasarr.com` serves the app (marketing-only paths redirect to `leasarr.com`); `leasarr.com` serves marketing (app paths redirect to `app.leasarr.com`); localhost/127.0.0.1 treated as `dev` (no cross-domain redirects).
- `src/lib/supabase/client.ts` / `server.ts` — Browser and server Supabase clients.
- `src/lib/stripe/server.ts` / `plans.ts` — Stripe SDK + plan definitions (Starter/Growth/Pro).
- `src/lib/resend.ts` — Resend client (server-only).
- `src/lib/utils.ts` — Shared helpers (see conventions.md).
- `src/lib/notificationMeta.ts` — `NOTIFICATION_TYPE_META` — icon/color/href per type. Never redefine locally.
- `src/lib/schemas/` — Zod schemas per domain: `auth`, `people`, `property`, `payment`, `maintenance`, `lease`.
- `src/types/index.ts` — All domain interfaces. Never define DB-backed types inline in pages.
- `src/data/mock.ts` — Mock fallback; used by /reports only.
- `src/hooks/useSubscription.ts` — `useSubscription()` → `{ plan, status, trialEnd, daysLeft, isTrialing, isActive, isExpired, loading }`. Single source of truth for subscription state; used by AppLayout trial pill and any feature gating.
- `src/hooks/useSeats.ts` — Reads plan from `useSubscription`, returns `{ used, max, available, loading }`. Used to gate team-invite UI.
- `src/components/PostHogProvider.tsx` — PostHog analytics wrapper; sets `window.posthog` in the loaded callback for toolbar support; wraps `<body>` in `src/app/layout.tsx`.

### Marketing site
- `src/components/marketing/layout.tsx` — `<MarketingLayout>` wraps all marketing pages with `<Nav>` + `<Footer>`.
- `src/components/marketing/nav.tsx` — Fixed top nav; transparent on dark hero, frosted glass on scroll. Active link: "Pricing". Theme toggle dropdown. CTA: "Join waitlist →" → `/waitlist`.
- `src/components/marketing/footer.tsx` — Shared footer.
- `src/components/marketing/sections/` — Homepage sections: `hero`, `proof-bar`, `feature-overview`, `feature-deepdive`, `audience`, `testimonials`, `final-cta`. Hero and final-cta CTAs point to `/waitlist` (private beta mode).
- `src/components/marketing/sections/pricing/` — Pricing page sections: `intro` (hero band), `tier-grid` (4-card grid + billing toggle + unit recommender), `compare` (feature table), `addons` (add-on grid), `faq` (accordion), `context` (`PricingControlsProvider` + `usePricing()`).
- `src/components/marketing/ui/` — Shared marketing primitives: `fade-in`, `label-pill`, `section-header`, `mockup-panel`.
- `src/lib/marketing/pricing.ts` — Single source of truth for pricing: `PRICING_TIERS`, `COMPARE_ROWS`, `PRICING_ADDONS`, `PRICING_FAQ`, `recommendTier(units)`. Keep in sync with `src/lib/stripe/plans.ts` when numbers change (plans.ts drives billing logic; pricing.ts drives marketing copy).
- `src/app/waitlist/page.tsx` — Beta waitlist page; form submits to `/api/waitlist`; success state on submit.

## Migrations

| File | Purpose |
|---|---|
| `001_complete_schema.sql` | Full schema + RLS + `handle_new_user` trigger |
| `002_team_vendors.sql` | Team members, vendors |
| `003_notifications.sql` | Notifications table, RLS, triggers, Realtime |
| `004_rls_fixes.sql` | Blocks admin role injection; restricts tenant maintenance to open requests |
| `005_rls_fixes_2.sql` | Locks `profiles.role` self-update; locks notification `profile_id` reassignment |
| `006_subscriptions.sql` | `subscriptions` table + RLS |
| `007_notification_triggers.sql` | Payment and lease notification triggers |
| `008_rls_tenant_manager_profile.sql` | Tenants can SELECT their manager's profile row |
| `009_tenant_profile_autolink.sql` | Auto-links new profiles to existing tenant records by email on sign-up |
| `010_storage_policies.sql` | Creates `avatars`, `property-images`, `maintenance-images` buckets; storage RLS |
| `011_fix_profile_update_rls.sql` | Replaces broken `WITH CHECK` subquery with `BEFORE UPDATE` trigger for role-lock |
| `012_team_accounts.sql` | Adds `team_members.profile_id`, `invited_email`, `invite_token`, `accepted_at`; auto-link trigger on profile insert |
| `013_team_rls.sql` | `auth_manager_id()` helper; broadens RLS so linked team members read/write the owner's data |
| `014_unit_images.sql` | Adds `images` column to `units` table |
| `015_communications.sql` | `announcements` table + RLS; managers CRUD own announcements |
| `016_tenant_conversation_insert.sql` | Allows tenants to INSERT conversations (RLS was previously SELECT-only) |
| `017_tenant_link_on_tenant_insert.sql` | Trigger + backfill: links existing profiles to tenant records by email on tenant INSERT (reverse of 009) |
| `018_tenant_invited_at.sql` | Adds `invited_at timestamptz` to `tenants`; tracks when manager last sent portal invite |
| `019_trial_setup.sql` | Trigger: auto-creates `subscriptions` row (`status='trialing'`, `trial_end = now() + 30 days`) on manager profile INSERT; backfills existing managers |
| `020_rls_audit_fixes.sql` | RLS audit fixes |
| `021_invite_waitlist.sql` | `invite_codes` table (code, max_uses, uses_count); `waitlist` table (email, name, property_count); RLS: invite_codes service-role only, waitlist anon insert |
| `022_cookie_consents.sql` | `cookie_consents` table; stores consent per profile/anonymous visitor; RLS: users manage own row |
| `023_cookie_consent_audit.sql` | Converts `cookie_consents` to append-only audit log; adds `action` column (`accepted/declined/withdrawn`); drops unique indexes; adds time-ordered indexes for latest-row queries |

## API routes

| Route | Method | Purpose |
|---|---|---|
| `/api/auth/set-role` | POST | Updates `profiles.role` via service role (bypasses RLS); called after Google OAuth register |
| `/api/team/invite` | POST | Creates a `team_members` row with `invite_token`; sends invite email; gated by `useSeats` |
| `/api/team/resend-invite` | POST | Regenerates and resends invite email for a pending team member |
| `/api/team/revoke` | POST | Sets `status = 'inactive'` and clears `profile_id`; revokes login access |
| `/api/team/accept-invite` | POST | Token exchange after invitee signs up; links `profile_id` and flips status to `active` |
| `/api/stripe/checkout` | POST | Creates Stripe Checkout session |
| `/api/stripe/portal` | POST | Creates Stripe Billing Portal session |
| `/api/stripe/webhook` | POST | Handles Stripe events → updates `subscriptions`; sends billing emails |
| `/api/notifications/email` | POST | Supabase webhook on `notifications` INSERT → sends email |
| `/api/notifications/welcome` | POST | Supabase webhook on `profiles` INSERT → sends welcome email |
| `/api/tenant/invite` | POST | Sends portal invite email to tenant via Resend; stamps `tenants.invited_at`; accepts `tenant_id`, `tenant_email`, `tenant_first_name`, `tenant_last_name` |
| `/api/waitlist` | POST | Inserts into `waitlist` table; open to anyone (anon); dedupes by email |
| `/api/invite/validate` | POST | Checks if an invite code exists and has remaining uses; used by register page before account creation |
| `/api/invite/consume` | POST | Increments `uses_count` on an invite code; called after successful Supabase registration |
| `/api/admin/waitlist` | GET | Returns waitlist entries + available invite codes; restricted to `ADMIN_EMAILS` |
| `/api/admin/send-invite` | POST | Sends branded Resend invite email with code to an approved waitlist applicant; restricted to `ADMIN_EMAILS` |
| `/api/consent` | GET | Returns the most recent consent record for the logged-in user (used by `syncFromServer`) |
| `/api/consent` | POST | Inserts a new consent audit record; accepts `analytics`, `marketing`, `anonymous_id` |
| `/api/consent` | DELETE | Inserts a `withdrawn` record; triggers banner re-prompt on next load |

## Supabase

- **RLS** — `manager_id = auth_manager_id()` (helper from migration 013 — returns the owner's id for linked team members, own id for owners) or `profile_id = auth.uid()`. Role changes via `/api/auth/set-role` only (migration 011 trigger blocks direct updates). Storage: authenticated write, public read (migration 010).
- **Realtime** — `maintenance_requests`, `notifications`, `messages`, `conversations`
- **Triggers** — `handle_new_user` (profile on auth signup); `link_profile_to_tenant` (auto-links by email on profile INSERT — migration 009); `link_tenant_to_profile` (auto-links on tenant INSERT for existing accounts — migration 017); `link_profile_to_team_member` (auto-links team invites by email on signup); maintenance/payment/lease notification triggers; `prevent_role_change` (blocks role self-update)

## Stripe

- Webhook events: `checkout.session.completed`, `customer.subscription.updated/deleted`, `invoice.payment_failed/succeeded`
- `subscriptions` table is source of truth; written by webhook via service role

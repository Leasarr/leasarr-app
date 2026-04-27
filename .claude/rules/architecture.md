# Architecture

Next.js 14 App Router, TypeScript, Tailwind CSS, Supabase. Path alias: `@/*` → `src/*`

## Routes

### Marketing (open to all)

| Path | Notes |
|---|---|
| `/` | Marketing homepage; logged-in users redirected to their dashboard |
| `/pricing` | Pricing page — open to everyone including logged-in users |
| `/about` | About page — open to everyone (V2, not yet built) |

### Auth

| Path | Notes |
|---|---|
| `/auth/login` | Public; demo banner in mock mode |
| `/auth/register` | Public; manager/tenant role selector |
| `/auth/callback` | Supabase OAuth callback |

### App — manager

| Path | Notes |
|---|---|
| `/dashboard` | KPIs, occupancy, activity feed |
| `/properties` | List/detail grid; CRUD for properties and units; unit detail modal with images, lease insights, inline lease creation |
| `/people` | All/Tenants/Team/Vendors tabs; mobile: list hides when tenant selected |
| `/payments` | Full CRUD; auto-fills from active lease |
| `/maintenance` | Active/history; CRUD; real-time INSERT/UPDATE/DELETE |
| `/leases` | Full CRUD; smart form (tenant↔property↔unit auto-population; filters units without active lease) |
| `/settings` | Three sections (Profile, Billing, Notifications); profile name/email/phone/avatar/password; billing via Stripe checkout/portal; email notification prefs |
| `/tenants` | Master-detail tenant list; add tenant form; per-tenant tabs for payments, lease, maintenance (not in sidebar nav) |
| `/communication` | Mock data — V2 |
| `/reports` | Mock data — V2 |
| `/notifications` | Groups, per-row delete, mark read, real-time |

### App — tenant

| Path | Notes |
|---|---|
| `/portal` | Balance hero, quick actions, recent transactions |
| `/portal/maintenance` | Submit/cancel requests; real-time |
| `/portal/lease` | Lease details + expiry warning |
| `/portal/notifications` | Same UI as manager notifications |

## Key files

### App
- `src/components/layout/AppLayout.tsx` — Responsive shell. Desktop: collapsible sidebar (icon-only `w-16` collapsed, `w-64` pinned-open; pin state persisted to `localStorage`; hover temporarily expands) + top bar. Mobile: bottom nav + "More" sheet. Breakpoint `lg`. Realtime notifications; avatar resolves Google photo → uploaded → initials. "Profile & Settings" links to `/settings` page (no longer a modal).
- `src/context/AuthContext.tsx` — `useAuth()` → `{ user, profile, session, loading, signOut, updateProfile }`
- `src/context/ThemeContext.tsx` — `useTheme()` → `{ theme, setTheme }`. `dark` class on `<html>`.
- `src/middleware.ts` — Three-tier route model: **open** (`/`, `/pricing`, `/about` — everyone including logged-in users, except `/` redirects logged-in users to their home); **auth** (`/auth/login`, `/auth/register` — unauthenticated only; logged-in users redirected); **protected** (manager + tenant routes). API routes open to authenticated users; webhook routes always unauthenticated.
- `src/lib/supabase/client.ts` / `server.ts` — Browser and server Supabase clients.
- `src/lib/stripe/server.ts` / `plans.ts` — Stripe SDK + plan definitions (Starter/Growth/Pro).
- `src/lib/resend.ts` — Resend client (server-only).
- `src/lib/utils.ts` — Shared helpers (see conventions.md).
- `src/lib/notificationMeta.ts` — `NOTIFICATION_TYPE_META` — icon/color/href per type. Never redefine locally.
- `src/lib/schemas/` — Zod schemas per domain: `auth`, `people`, `property`, `payment`, `maintenance`, `lease`.
- `src/types/index.ts` — All domain interfaces. Never define DB-backed types inline in pages.
- `src/data/mock.ts` — Mock fallback; used by /communication and /reports only.

### Marketing site
- `src/components/marketing/layout.tsx` — `<MarketingLayout>` wraps all marketing pages with `<Nav>` + `<Footer>`.
- `src/components/marketing/nav.tsx` — Fixed top nav; transparent on dark hero, frosted glass on scroll. Active link: "Pricing". Theme toggle dropdown.
- `src/components/marketing/footer.tsx` — Shared footer.
- `src/components/marketing/sections/` — Homepage sections: `hero`, `proof-bar`, `feature-overview`, `feature-deepdive`, `audience`, `testimonials`, `final-cta`.
- `src/components/marketing/sections/pricing/` — Pricing page sections: `intro` (hero band), `tier-grid` (4-card grid + billing toggle + unit recommender), `compare` (feature table), `addons` (add-on grid), `faq` (accordion), `context` (`PricingControlsProvider` + `usePricing()`).
- `src/components/marketing/ui/` — Shared marketing primitives: `fade-in`, `label-pill`, `section-header`, `mockup-panel`.
- `src/lib/marketing/pricing.ts` — Single source of truth for pricing: `PRICING_TIERS`, `COMPARE_ROWS`, `PRICING_ADDONS`, `PRICING_FAQ`, `recommendTier(units)`. Keep in sync with `src/lib/stripe/plans.ts` when numbers change (plans.ts drives billing logic; pricing.ts drives marketing copy).

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

## API routes

| Route | Method | Purpose |
|---|---|---|
| `/api/auth/set-role` | POST | Updates `profiles.role` via service role (bypasses RLS); called after Google OAuth register |
| `/api/stripe/checkout` | POST | Creates Stripe Checkout session |
| `/api/stripe/portal` | POST | Creates Stripe Billing Portal session |
| `/api/stripe/webhook` | POST | Handles Stripe events → updates `subscriptions`; sends billing emails |
| `/api/notifications/email` | POST | Supabase webhook on `notifications` INSERT → sends email |
| `/api/notifications/welcome` | POST | Supabase webhook on `profiles` INSERT → sends welcome email |

## Supabase

- **RLS** — `manager_id = auth.uid()` or `profile_id = auth.uid()`. Role changes via `/api/auth/set-role` only (migration 011 trigger blocks direct updates). Storage: authenticated write, public read (migration 010).
- **Realtime** — `maintenance_requests`, `notifications`
- **Triggers** — `handle_new_user` (profile on auth signup); `link_profile_to_tenant` (auto-links by email); maintenance/payment/lease notification triggers; `prevent_role_change` (blocks role self-update)

## Stripe

- Webhook events: `checkout.session.completed`, `customer.subscription.updated/deleted`, `invoice.payment_failed/succeeded`
- `subscriptions` table is source of truth; written by webhook via service role

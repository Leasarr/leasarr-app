# Architecture

Next.js 14 App Router, TypeScript, Tailwind CSS, Supabase. Path alias: `@/*` → `src/*`

## Routes

| Path | Role | Notes |
|---|---|---|
| `/` | — | Redirects based on auth |
| `/auth/login` | public | Demo banner in mock mode |
| `/auth/register` | public | Manager/tenant role selector |
| `/auth/callback` | public | Supabase OAuth |
| `/dashboard` | manager | KPIs, occupancy, activity feed |
| `/properties` | manager | List/detail grid; CRUD for properties and units; unit detail modal with images, lease insights, inline lease creation |
| `/people` | manager | All/Tenants/Team/Vendors tabs; mobile: list hides when tenant selected |
| `/payments` | manager | Full CRUD; auto-fills from active lease |
| `/maintenance` | manager | Active/history; CRUD; real-time INSERT/UPDATE/DELETE |
| `/leases` | manager | Full CRUD; smart form (tenant↔property↔unit auto-population; filters units without active lease) |
| `/communication` | manager | Mock data — V2 |
| `/reports` | manager | Mock data — V2 |
| `/notifications` | manager | Groups, per-row delete, mark read, real-time |
| `/portal` | tenant | Balance hero, quick actions, recent transactions |
| `/portal/maintenance` | tenant | Submit/cancel requests; real-time |
| `/portal/lease` | tenant | Lease details + expiry warning |
| `/portal/notifications` | tenant | Same UI as manager notifications |

## Key files

- `src/components/layout/AppLayout.tsx` — Responsive shell. Desktop: sidebar + top bar. Mobile: bottom nav + "More" sheet. Breakpoint `lg`. Realtime notifications; avatar resolves Google photo → uploaded → initials.
- `src/context/AuthContext.tsx` — `useAuth()` → `{ user, profile, session, loading, signOut, updateProfile }`
- `src/context/ThemeContext.tsx` — `useTheme()` → `{ theme, setTheme }`. `dark` class on `<html>`.
- `src/middleware.ts` — Public: `/auth/*`. Manager: all manager routes. Tenant: `/portal`. API routes open to authenticated users; webhook routes always unauthenticated.
- `src/lib/supabase/client.ts` / `server.ts` — Browser and server Supabase clients.
- `src/lib/stripe/server.ts` / `plans.ts` — Stripe SDK + plan definitions (Starter/Growth/Pro).
- `src/lib/resend.ts` — Resend client (server-only).
- `src/lib/utils.ts` — Shared helpers (see conventions.md).
- `src/lib/notificationMeta.ts` — `NOTIFICATION_TYPE_META` — icon/color/href per type. Never redefine locally.
- `src/lib/schemas/` — Zod schemas per domain: `auth`, `people`, `property`, `payment`, `maintenance`, `lease`.
- `src/types/index.ts` — All domain interfaces. Never define DB-backed types inline in pages.
- `src/data/mock.ts` — Mock fallback; used by /communication and /reports only.

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

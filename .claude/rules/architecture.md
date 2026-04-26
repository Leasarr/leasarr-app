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
| `/properties` | manager | List/detail grid; CRUD for properties and units; unit detail modal with images, lease insights, and inline lease creation |
| `/people` | manager | All/Tenants/Team/Vendors tabs; mobile: list hides when tenant selected |
| `/payments` | manager | Full CRUD; auto-fills from active lease |
| `/maintenance` | manager | Active/history; CRUD; real-time INSERT/UPDATE/DELETE |
| `/leases` | manager | Full CRUD; smart form (tenant↔property↔unit auto-population) |
| `/communication` | manager | Mock data — V2 |
| `/reports` | manager | Mock data — V2 |
| `/notifications` | manager | Groups, per-row delete, mark read, real-time |
| `/portal` | tenant | Balance hero, quick actions, recent transactions |
| `/portal/maintenance` | tenant | Submit/cancel requests; real-time |
| `/portal/lease` | tenant | Lease details + expiry warning |
| `/portal/notifications` | tenant | Same UI as manager notifications |

## Key files

- `src/components/layout/AppLayout.tsx` — Responsive shell. Desktop: sidebar + top bar. Mobile: bottom nav (4 tabs + "More" sheet). Breakpoint `lg`. Realtime notifications per `profile_id`; bell shows unread only.
- `src/context/AuthContext.tsx` — `useAuth()` → `{ user, profile, session, loading, signOut }`
- `src/context/ThemeContext.tsx` — `useTheme()` → `{ theme, setTheme }`. `dark` class on `<html>`.
- `src/middleware.ts` — Public: `/auth/*`. Manager: all manager routes. Tenant: `/portal`. `/api/stripe`, `/api/notifications`, and `/api/auth/set-role` are accessible to authenticated users; `/api/stripe/webhook` and `/api/notifications/*` are always allowed unauthenticated (Stripe/Supabase webhooks).
- `src/lib/supabase/client.ts` — Browser client (stubs without env vars).
- `src/lib/supabase/server.ts` — Server client with cookies.
- `src/lib/stripe/server.ts` — Stripe SDK instance (server-only).
- `src/lib/stripe/plans.ts` — Plan definitions: Starter/Growth/Pro, monthly + annual price IDs, unit/seat limits.
- `src/lib/resend.ts` — Resend client singleton (server-only).
- `src/lib/utils.ts` — Shared helpers (see conventions.md).
- `src/lib/notificationMeta.ts` — `NOTIFICATION_TYPE_META` — icon/color/href per type. Never redefine locally.
- `src/lib/schemas/` — Zod schemas + inferred types for all forms. One file per domain: `auth`, `people`, `property`, `payment`, `maintenance`, `lease`. See conventions.md for full export list.
- `src/types/index.ts` — Domain interfaces: Property, Unit, Tenant, Lease, LeaseDocument, Payment, MaintenanceRequest, Conversation, Message, Profile, TeamMember, Vendor, Notification, Subscription. All DB-backed types live here — never define them inline in pages.
- `src/data/mock.ts` — Mock fallback; used by /communication and /reports only.
- `supabase/migrations/001_complete_schema.sql` — Full schema + RLS.
- `supabase/migrations/002_team_vendors.sql` — Team members, vendors.
- `supabase/migrations/003_notifications.sql` — Notifications, RLS, triggers, Realtime.
- `supabase/migrations/004_rls_fixes.sql` — Blocks admin role injection via sign-up metadata; restricts tenant maintenance to open requests only.
- `supabase/migrations/005_rls_fixes_2.sql` — Locks `profiles.role` column against self-update (role changes must go through `/api/auth/set-role`); locks notification `profile_id` against reassignment.
- `supabase/migrations/006_subscriptions.sql` — `subscriptions` table + RLS (service role writes, manager reads own row).
- `supabase/migrations/007_notification_triggers.sql` — Payment and lease notification triggers (payment confirmed, payment overdue, lease created, lease terminated).
- `supabase/migrations/008_rls_tenant_manager_profile.sql` — Allows tenants to SELECT their property manager's profile row (needed by tenant portal).
- `supabase/migrations/009_tenant_profile_autolink.sql` — `link_profile_to_tenant` trigger: fires after `profiles` INSERT, matches by email, sets `tenants.profile_id` so the portal loads the correct unit/lease on first login.
- `supabase/migrations/010_storage_policies.sql` — Creates `avatars`, `property-images`, `maintenance-images` buckets; sets storage.objects RLS (authenticated upload/update/delete, public read).
- `supabase/migrations/011_fix_profile_update_rls.sql` — Replaces migration 005's self-referential `WITH CHECK` subquery (caused profile updates to fail) with a simple own-row policy + `BEFORE UPDATE` trigger that blocks role changes except for `service_role`.

## API routes

| Route | Method | Auth | Purpose |
|---|---|---|---|
| `/api/auth/set-role` | POST | required | Updates `profiles.role` via service role client (bypasses RLS role-lock); called by `/auth/set-role` page after Google OAuth |
| `/api/stripe/checkout` | POST | required | Creates Stripe Checkout session; body: `{ plan, interval }` |
| `/api/stripe/portal` | POST | required | Creates Stripe Billing Portal session |
| `/api/stripe/webhook` | POST | none | Handles Stripe events → updates `subscriptions` table; sends plan/billing emails via Resend |
| `/api/notifications/email` | POST | none | Supabase webhook on `notifications` INSERT → sends email via Resend |
| `/api/notifications/welcome` | POST | none | Supabase webhook on `profiles` INSERT → sends welcome email via Resend |

## Supabase

- **RLS** — scoped by `manager_id = auth.uid()` or `profile_id = auth.uid()`. `profiles.role` is locked via a `BEFORE UPDATE` trigger (migration 011, replaces migration 005's broken `WITH CHECK`) — role changes must go through `/api/auth/set-role`. Storage buckets (`avatars`, `property-images`, `maintenance-images`) use authenticated-write / public-read policies (migration 010).
- **Realtime** — `maintenance_requests`, `notifications`
- **Triggers** — `handle_new_user` (creates `profiles` row on `auth.users` INSERT, `SET search_path = public` required); `link_profile_to_tenant` (links new profile to existing tenant record by email on `profiles` INSERT); manager notified on new maintenance request; tenant notified on request update, payment confirmed/overdue, lease created/terminated

## Stripe

- Webhook events handled: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`, `invoice.payment_succeeded`
- `subscriptions` table is the source of truth for plan/status in-app; written by webhook via service role client

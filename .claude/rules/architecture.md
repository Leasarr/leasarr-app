# Architecture

**Leasarr** is a property management SaaS app — Next.js 14 App Router, TypeScript, Tailwind CSS, Supabase.

## Routes

| Path | Role | Description |
|---|---|---|
| `/` | — | Redirects to dashboard or login based on auth |
| `/auth/login` | public | Login; shows demo banner in mock mode |
| `/auth/register` | public | Registration with manager/tenant role selector |
| `/auth/callback` | public | Supabase OAuth exchange |
| `/dashboard` | manager | Portfolio KPIs, occupancy, activity feed |
| `/properties` | manager | Asymmetric grid — list left, detail right; full create/edit for properties and units |
| `/people` | manager | All/Tenants/Team/Vendors tabs; full create/edit flows; All tab navigates to relevant sub-tab on click |
| `/payments` | manager | Full CRUD — record, edit, delete, mark paid; auto-fills from active lease |
| `/maintenance` | manager | Active/history views; create, assign vendor, mark completed, delete; real-time updates |
| `/leases` | manager | Expiration warnings, renewal status (create/edit not yet wired) |
| `/communication` | manager | Manager ↔ tenant messages (mock data — not yet wired) |
| `/reports` | manager | Financial analytics, recharts, monthly trends (mock data — not yet wired) |
| `/notifications` | manager | Full notifications page — New/Earlier groups, split-view detail, mark as read |
| `/portal` | tenant | Home: balance hero, quick actions, manager card, recent transactions |
| `/portal/maintenance` | tenant | Submit and cancel maintenance requests; real-time status updates |
| `/portal/lease` | tenant | Active lease details: rent, deposit, term dates, expiry warning |
| `/portal/notifications` | tenant | Notifications page — same layout as manager version |

## Key files

- `src/components/layout/AppLayout.tsx` — Responsive shell. Desktop: fixed sidebar + top bar (theme switcher + live notification bell). Mobile: top bar + bottom nav. Breakpoint at `lg` (1024px). Fetches notifications from Supabase with Realtime subscription per `profile_id`.
- `src/context/AuthContext.tsx` — Provides `user`, `profile`, `session`, `loading`, `signOut`. Use `useAuth()` hook.
- `src/context/ThemeContext.tsx` — Provides `theme` (`'light' | 'dark' | 'system'`) and `setTheme`. Persists to localStorage. Use `useTheme()` hook. Theme applied via `dark` class on `<html>`.
- `src/middleware.ts` — Route protection. Public: `/auth/*`. Manager routes: dashboard, people, payments, maintenance, leases, properties, communication, reports, notifications. Tenant routes: `/portal`.
- `src/lib/supabase/client.ts` — Browser Supabase client (stubs if env vars missing).
- `src/lib/supabase/server.ts` — Server-side client with cookie handling.
- `src/lib/utils.ts` — Shared helpers (see conventions rule).
- `src/types/index.ts` — All domain interfaces: Property, Unit, Tenant, Lease, Payment, MaintenanceRequest, Conversation, Vendor, etc.
- `src/data/mock.ts` — Mock data fallback. Still used by Communication and Reports pages.
- `supabase/migrations/001_complete_schema.sql` — Full DB schema with RLS.
- `supabase/migrations/002_team_vendors.sql` — Team members, vendors tables; tenant → team member link.
- `supabase/migrations/003_notifications.sql` — Notifications table, RLS, triggers, Realtime.

## Current state

All core pages are wired to **real Supabase data**. The following pages still use mock data and are deferred to V2:
- `/communication` — mock conversations
- `/reports` — mock charts

Mock auth fallback is still functional for environments without `.env.local`.

## Supabase features in use

- **RLS** — all tables scoped by `manager_id = auth.uid()` or `profile_id = auth.uid()`
- **Realtime** — `maintenance_requests` and `notifications` tables have Realtime enabled
- **Database triggers** — auto-link tenant profile on sign-up; notify manager on new request; notify tenant on assign/complete

## Path alias

`@/*` → `src/*`

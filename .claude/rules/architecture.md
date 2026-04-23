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
| `/properties` | manager | List/detail grid; CRUD for properties and units |
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
- `src/middleware.ts` — Public: `/auth/*`. Manager: all manager routes. Tenant: `/portal`.
- `src/lib/supabase/client.ts` — Browser client (stubs without env vars).
- `src/lib/supabase/server.ts` — Server client with cookies.
- `src/lib/utils.ts` — Shared helpers (see conventions.md).
- `src/lib/notificationMeta.ts` — `NOTIFICATION_TYPE_META` — icon/color/href per type. Never redefine locally.
- `src/types/index.ts` — Domain interfaces: Property, Unit, Tenant, Lease, Payment, MaintenanceRequest, Vendor, etc.
- `src/data/mock.ts` — Mock fallback; used by /communication and /reports only.
- `supabase/migrations/001_complete_schema.sql` — Full schema + RLS.
- `supabase/migrations/002_team_vendors.sql` — Team members, vendors.
- `supabase/migrations/003_notifications.sql` — Notifications, RLS, triggers, Realtime.

## Supabase

- **RLS** — scoped by `manager_id = auth.uid()` or `profile_id = auth.uid()`
- **Realtime** — `maintenance_requests`, `notifications`
- **Triggers** — tenant profile auto-link; manager/tenant notifications on request events

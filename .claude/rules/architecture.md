# Architecture

**Leasarr** is a property management SaaS app — Next.js 14 App Router, TypeScript, Tailwind CSS, Supabase.

## Routes

| Path | Role | Description |
|---|---|---|
| `/` | — | Redirects to dashboard or login based on auth |
| `/auth/login` | public | Login; shows demo banner in mock mode |
| `/auth/register` | public | Registration with manager/tenant role selector |
| `/auth/callback` | public | Supabase OAuth exchange |
| `/dashboard` | manager | Portfolio KPIs, occupancy, AI risk alerts |
| `/properties` | manager | Asymmetric grid — list left, detail right |
| `/tenants` | manager | Searchable directory with per-tenant history panel |
| `/payments` | manager | Collection analytics, status filters |
| `/maintenance` | manager | Active/history views, priority styling |
| `/leases` | manager | Expiration warnings, renewal status |
| `/communication` | manager | Manager ↔ tenant messages, conversation sidebar |
| `/reports` | manager | Financial analytics, recharts, monthly trends |
| `/portal` | tenant | Balance, quick actions (maintenance/lease/messages) |

## Key files

- `src/components/layout/AppLayout.tsx` — Responsive shell. Desktop: fixed sidebar (64px) + top bar (theme switcher + notification tray). Mobile: top bar + bottom nav. Breakpoint at `lg` (1024px).
- `src/context/AuthContext.tsx` — Provides `user`, `profile`, `session`, `loading`, `signOut`. Use `useAuth()` hook.
- `src/context/ThemeContext.tsx` — Provides `theme` (`'light' | 'dark' | 'system'`) and `setTheme`. Persists to localStorage. Use `useTheme()` hook. Theme applied via `dark` class on `<html>`.
- `src/middleware.ts` — Route protection. Public: `/auth/*`. Manager routes: dashboard, tenants, etc. Tenant routes: `/portal`.
- `src/lib/supabase/client.ts` — Browser Supabase client (stubs if env vars missing).
- `src/lib/supabase/server.ts` — Server-side client with cookie handling.
- `src/lib/utils.ts` — Shared helpers (see conventions rule).
- `src/types/index.ts` — All domain interfaces: Property, Unit, Tenant, Lease, Payment, MaintenanceRequest, Conversation, etc.
- `src/data/mock.ts` — Mock data for all pages. Exports: PROPERTIES, TENANTS, LEASES, PAYMENTS, MAINTENANCE_REQUESTS, CONVERSATIONS, DASHBOARD_STATS, REPORT_DATA.
- `supabase/migrations/001_complete_schema.sql` — Full DB schema with RLS.

## Current state

All pages use **mock data** from `src/data/mock.ts`. Supabase clients exist but pages do not call them yet. Mock auth is fully functional without Supabase — credentials: `manager@demo.com` / `password` or `tenant@demo.com` / `password`.

## Path alias

`@/*` → `src/*`

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
| `/people` | manager | All/Tenants/Team/Vendors tabs (grid-cols-4 tab bar); full create/edit flows; All tab navigates to relevant sub-tab on click; Tenants tab: list hides on mobile when a tenant is selected, back button returns to list |
| `/payments` | manager | Full CRUD — record, edit, delete, mark paid; auto-fills from active lease |
| `/maintenance` | manager | Active/history views; create, assign vendor, mark completed, delete; real-time INSERT/UPDATE/DELETE |
| `/leases` | manager | Expiration warnings, renewal status; full create/edit wired — smart cross-field form (tenant ↔ property ↔ unit auto-population, excludes already-leased tenants and occupied units) |
| `/communication` | manager | Manager ↔ tenant messages (mock data — not yet wired) |
| `/reports` | manager | Financial analytics, recharts, monthly trends (mock data — not yet wired) |
| `/notifications` | manager | New/Earlier groups; click navigates to related page; per-row delete on hover; mark all read; clear all; real-time |
| `/portal` | tenant | Home: balance hero, quick actions, manager card, recent transactions |
| `/portal/maintenance` | tenant | Submit and cancel maintenance requests; real-time INSERT/UPDATE |
| `/portal/lease` | tenant | Active lease details: rent, deposit, term dates, expiry warning |
| `/portal/notifications` | tenant | Same as manager notifications page |

## Key files

- `src/components/layout/AppLayout.tsx` — Responsive shell. Desktop: fixed sidebar + top bar (theme switcher + live notification bell). Mobile: top bar + 4-tab bottom nav (3 primary items + "More" sheet). Manager bottom nav: Dashboard, Payments, Maintenance, More. Tenant bottom nav: Home, Maintenance, Lease, More. "More" sheet slides up and shows all remaining nav items plus profile/settings. Breakpoint at `lg` (1024px). Fetches notifications from Supabase with Realtime subscription (INSERT/UPDATE/DELETE) per `profile_id`. Notification bell popup shows **unread only** — read notifications drop off automatically.
- `src/components/layout/PageHeader.tsx` — Page-level title block. Props: `title`, `eyebrow?`, `subtitle?`, `action?` (right-side slot). Used on all data pages.
- `src/components/ui/Button.tsx` — Unified button. Variants: `primary`, `secondary`, `ghost`, `chip`, `destructive`. Sizes: `sm`, `md`, `lg`. Enforces `min-h-[44px]` WCAG touch target (non-chip). See conventions rule for full usage guide.
- `src/components/ui/Badge.tsx` — Semantic status pill. Variants: `primary`, `secondary`, `tertiary`, `neutral`, `success`, `warning`, `error`.
- `src/components/ui/SegmentedControl.tsx` — Pill-container toggle for in-page view switching (e.g. Active/History, Units/Applications). Props: `options`, `value`, `onChange`, `className?`.
- `src/components/ui/TabBar.tsx` — Underline-indicator tab navigation for page-level tabs (e.g. People page). Props: `tabs` (with optional `count`), `value`, `onChange`, `className?`.
- `src/components/ui/StatusDot.tsx` — Semantic status dot using design tokens. Props: `status` (`occupied`/`vacant`/`maintenance`).
- `src/components/ui/ConfirmModal.tsx` — Confirmation dialog for destructive actions. Props: `open`, `onClose`, `title`, `body?`, `confirmLabel?`, `onConfirm`, `loading?`, `destructive?`.
- `src/components/patterns/EmptyState.tsx` — No-data UI. Props: `icon`, `title`, `description?`, `action?`, `size` (`page`/`panel`/`inline`).
- `src/components/patterns/LoadingState.tsx` — Loading placeholder. Props: `label?`, `size` (`page`/`panel`). Uses `progress_activity` + `animate-spin`.
- `src/lib/notificationMeta.ts` — `NOTIFICATION_TYPE_META` single source of truth for notification icon/color/href per type. Used by `AppLayout` and both notifications pages.
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
- `supabase/migrations/003_notifications.sql` — Notifications table, RLS (SELECT/UPDATE/DELETE for owner), triggers, Realtime.

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

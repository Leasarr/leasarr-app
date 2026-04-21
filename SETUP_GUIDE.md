# Leasarr Web App — Setup Guide

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Framework** | Next.js 14 (App Router) | SSR, file-based routing |
| **Language** | TypeScript | Full type safety |
| **Styling** | Tailwind CSS + Material You tokens | Design-system-driven utilities |
| **Database** | Supabase (PostgreSQL) | Real-time, auth, RLS — all in one |
| **Auth** | Supabase Auth | JWT sessions, email/password |
| **Real-time** | Supabase Realtime | Live maintenance updates + notifications |
| **Charts** | Recharts | Revenue trend + Reports charts |
| **Icons** | Material Symbols (Google) | Exact icons from designs |
| **Fonts** | Manrope + Inter | Exact fonts from designs |
| **Forms** | React Hook Form + Zod | Installed; migration from plain useState planned pre-MVP |
| **State** | Zustand (installed, unused) + React Context | AuthContext, ThemeContext |
| **Toasts** | Sonner | Elegant notifications |

---

## Quick Start (5 steps)

### Step 1 — Create your Supabase project (free)

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click **New Project**, set a name and database password, pick a region
3. Wait ~2 minutes for provisioning

### Step 2 — Run the database migrations

In your Supabase dashboard → **SQL Editor** → **New Query**, run each migration file in order:

1. `supabase/migrations/001_complete_schema.sql` — Full DB schema + RLS policies
2. `supabase/migrations/002_team_vendors.sql` — Team members + vendors tables
3. `supabase/migrations/003_notifications.sql` — Notifications table, triggers, Realtime

### Step 3 — Get your API keys

In Supabase dashboard → **Settings** → **API**, copy:
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (server-only, keep secret)

### Step 4 — Configure environment

Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe (V2 — not required for MVP)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

> **Note:** The app runs without `.env.local` using mock-auth fallback. Demo credentials: `manager@demo.com` / `password` or `tenant@demo.com` / `password`

### Step 5 — Install & run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — unauthenticated users see the marketing homepage; authenticated users are redirected to `/dashboard`.

---

## Project Structure

```
leasarr-app/
├── .env.local                        ← API keys (never commit)
├── next.config.js
├── tailwind.config.ts                ← Material You color tokens
├── supabase/
│   └── migrations/
│       ├── 001_complete_schema.sql   ← Full DB schema + RLS
│       ├── 002_team_vendors.sql      ← Team & vendor tables
│       └── 003_notifications.sql    ← Notifications + Realtime
└── src/
    ├── app/
    │   ├── layout.tsx                ← Root layout (fonts, toasts)
    │   ├── page.tsx                  ← Marketing homepage (public)
    │   ├── globals.css               ← Tailwind + custom utilities
    │   ├── auth/
    │   │   ├── login/page.tsx
    │   │   ├── register/page.tsx
    │   │   ├── callback/page.tsx
    │   │   ├── reset-password/page.tsx  ← sends reset email
    │   │   └── update-password/page.tsx ← sets new password (from email link)
    │   ├── dashboard/page.tsx        ← KPIs, occupancy, activity feed
    │   ├── properties/page.tsx       ← Asymmetric grid, full CRUD
    │   ├── people/page.tsx           ← Tenants / Team / Vendors tabs
    │   ├── payments/page.tsx         ← Full CRUD, auto-fill from lease
    │   ├── maintenance/page.tsx      ← Active/history, vendor assign
    │   ├── leases/page.tsx           ← Full CRUD, smart create form
    │   ├── communication/page.tsx    ← Mock — V2
    │   ├── reports/page.tsx          ← Mock charts — V2
    │   ├── notifications/page.tsx    ← New/Earlier groups, split-view
    │   └── portal/
    │       ├── page.tsx              ← Tenant home: balance, quick actions
    │       ├── maintenance/page.tsx  ← Submit/cancel requests
    │       ├── lease/page.tsx        ← Active lease details
    │       └── notifications/page.tsx
    ├── components/
    │   └── layout/
    │       └── AppLayout.tsx         ← Sidebar (desktop) + bottom nav (mobile)
    ├── context/
    │   ├── AuthContext.tsx           ← user, profile, session, signOut
    │   └── ThemeContext.tsx          ← light/dark/system theme
    ├── data/
    │   └── mock.ts                   ← Fallback data (Communication + Reports)
    ├── lib/
    │   ├── supabase/
    │   │   ├── client.ts
    │   │   └── server.ts
    │   └── utils.ts                  ← formatCurrency, formatDate, cn(), etc.
    └── types/
        └── index.ts                  ← All TypeScript interfaces
```

---

## Data Layer Status

All core pages are wired to **real Supabase data**. Two pages still use mock data (deferred to V2):

| Page | Status |
|---|---|
| Dashboard | ✅ Live Supabase — KPIs, occupancy, activity feed |
| Properties | ✅ Live Supabase — full CRUD with RLS |
| People (Tenants/Team/Vendors) | ✅ Live Supabase — full CRUD |
| Payments | ✅ Live Supabase — full CRUD, auto-fill from active lease |
| Maintenance | ✅ Live Supabase — full CRUD, real-time updates |
| Leases | ✅ Live Supabase — full CRUD; smart create form with cross-field auto-population |
| Tenant Portal | ✅ Live Supabase — all sub-pages |
| Notifications | ✅ Live Supabase — real-time delivery |
| Communication | 🔶 Mock data — V2 |
| Reports | 🔶 Mock charts — V2 |

---

## Database Tables

| Table | Purpose |
|---|---|
| `profiles` | User accounts (managers + tenants) |
| `properties` | Real estate assets |
| `units` | Individual units within properties |
| `tenants` | Tenant records |
| `leases` | Lease agreements |
| `lease_documents` | PDF attachments |
| `payments` | Rent payment records |
| `maintenance_requests` | Repair tickets |
| `team_members` | Property manager team |
| `vendors` | Maintenance vendors |
| `notifications` | In-app notification feed |
| `conversations` | Chat threads (V2) |
| `messages` | Individual chat messages (V2) |

All tables use Row Level Security (RLS) — managers only see their own data; tenants only see their own records.

---

## Deployment

### Vercel (recommended — free tier)

```bash
npm install -g vercel
vercel
```

Add your `.env.local` values as Environment Variables in the Vercel dashboard.

---

## Mobile Responsive

The app is fully responsive:
- **Desktop (lg+)**: Fixed sidebar, top bar with theme switcher + notification bell
- **Mobile (< lg)**: Top bar + 4-tab bottom nav (3 primary items + "More" sheet for all other nav items and profile/settings)

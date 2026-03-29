# PMSoft Web App — Setup Guide

## 🏗 Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Framework** | Next.js 14 (App Router) | Best-in-class React framework, SSR, file-based routing |
| **Language** | TypeScript | Full type safety across all 9 screens |
| **Styling** | Tailwind CSS | Utility-first, exact Material You tokens from your designs |
| **Database** | Supabase (PostgreSQL) | Real-time, auth, storage — all in one |
| **Auth** | Supabase Auth | JWT sessions, email/password, social login |
| **Real-time** | Supabase Realtime | Live chat in Communication screen |
| **Charts** | Recharts | Revenue trend + Reports charts |
| **Payments** | Stripe | ACH, credit card processing |
| **Icons** | Material Symbols (Google) | Exact icons from your designs |
| **Fonts** | Manrope + Inter | Exact fonts from your designs |
| **Animations** | Framer Motion | Page transitions, micro-interactions |
| **Forms** | React Hook Form + Zod | Tenant/Lease/Maintenance forms with validation |
| **State** | Zustand + React Query | Lightweight global state + data fetching |
| **Toasts** | Sonner | Elegant notifications |

---

## 🚀 Quick Start (5 steps)

### Step 1 — Create your Supabase project (free)

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click **New Project**
3. Choose a name (e.g. `pmsoft`), set a strong database password, pick a region
4. Wait ~2 minutes for provisioning

### Step 2 — Run the database migration

1. In your Supabase dashboard, go to **SQL Editor** → **New Query**
2. Open `supabase/migrations/001_complete_schema.sql` from this project
3. Paste the entire contents and click **Run**
4. ✅ You'll see "Success. No rows returned"

### Step 3 — Get your API keys

1. In Supabase dashboard → **Settings** → **API**
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (keep secret, server-only)

### Step 4 — Configure environment

Open `.env.local` and replace the placeholder values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe (optional for payments — get from stripe.com/dashboard)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### Step 5 — Install & run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to the dashboard.

---

## 📁 Project Structure

```
PMSoft_Web/
├── .env.local                    ← Your API keys (never commit this)
├── next.config.js
├── tailwind.config.ts            ← Material You color tokens
├── supabase/
│   └── migrations/
│       └── 001_complete_schema.sql  ← Full DB schema + RLS policies
└── src/
    ├── app/
    │   ├── layout.tsx            ← Root layout (fonts, toasts)
    │   ├── page.tsx              ← Redirects to /dashboard
    │   ├── globals.css           ← Tailwind + custom utilities
    │   ├── auth/login/page.tsx   ← Login screen
    │   ├── dashboard/page.tsx    ← Portfolio summary
    │   ├── tenants/page.tsx      ← Tenant list + detail split view
    │   ├── payments/page.tsx     ← Payments + record panel
    │   ├── maintenance/page.tsx  ← Requests + detail + create modal
    │   ├── leases/page.tsx       ← Lease list + AI predictor + detail
    │   ├── properties/page.tsx   ← Property list + unit portfolio
    │   ├── communication/page.tsx← Sidebar + live chat
    │   ├── reports/page.tsx      ← Charts + insights (Recharts)
    │   └── portal/page.tsx       ← Tenant self-service view
    ├── components/
    │   └── layout/
    │       └── AppLayout.tsx     ← Sidebar (desktop) + bottom nav (mobile)
    ├── data/
    │   └── mock.ts               ← Realistic mock data (all 9 screens)
    ├── lib/
    │   ├── supabase/
    │   │   ├── client.ts         ← Browser Supabase client
    │   │   └── server.ts         ← Server-side Supabase client
    │   └── utils.ts              ← formatCurrency, formatDate, cn(), etc.
    └── types/
        └── index.ts              ← All TypeScript interfaces
```

---

## 🔌 Switching from Mock Data to Real Supabase

Currently all pages use mock data from `src/data/mock.ts`. To connect to Supabase:

1. Replace mock imports with Supabase queries. Example for the dashboard:

```ts
// BEFORE (mock)
import { DASHBOARD_STATS } from '@/data/mock'

// AFTER (Supabase)
import { createClient } from '@/lib/supabase/server'
const supabase = createClient()
const { data: payments } = await supabase
  .from('payments')
  .select('amount, status')
  .eq('property_id', propertyId)
```

2. Add loading states with React Suspense or `useState`
3. Use `useEffect` + Supabase's `.subscribe()` for real-time features (chat)

---

## 🗄 Database Tables

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
| `conversations` | Chat threads |
| `messages` | Individual chat messages |

All tables have Row Level Security (RLS) — managers only see their own data.

---

## 🚢 Deployment

### Vercel (recommended — free tier)

```bash
npm install -g vercel
vercel
```

Add your `.env.local` values as Environment Variables in the Vercel dashboard.

### Other platforms
Next.js works on Netlify, Railway, Render, AWS Amplify, and more.

---

## 📱 Mobile Responsive

The app is fully responsive:
- **Desktop (lg+)**: Sidebar navigation, split-view layouts, editorial canvas
- **Tablet (md)**: Collapsed sidebar, stacked grids
- **Mobile (< md)**: Bottom navigation bar, single-column layouts, FAB button

---

## 💳 Stripe Integration (Payments)

To enable real payments:

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Add publishable + secret keys to `.env.local`
3. Create a webhook endpoint at `/api/stripe/webhook`
4. Use `stripe.paymentIntents.create()` for ACH/card payments
5. The `payments.stripe_payment_intent_id` column is already in the schema

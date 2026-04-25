---
paths:
  - "src/lib/**"
  - "src/data/**"
  - "src/types/**"
  - "supabase/**"
---

# Data Layer

## Mock data (`src/data/mock.ts`)

Mock data is retained as a fallback. Exports: PROPERTIES, TENANTS, LEASES, PAYMENTS, MAINTENANCE_REQUESTS, CONVERSATIONS, DASHBOARD_STATS, REPORT_DATA, PAYMENT_SUMMARY.

Pages still using mock data: `/communication`, `/reports`. Dashboard falls back to mock automatically when Supabase env vars are absent. All other pages query real Supabase data directly.

## Types (`src/types/index.ts`)

All domain interfaces live here. Key types: Property, Unit, Tenant, Lease, Payment, MaintenanceRequest, Conversation, Message, Profile. Most entities have optional joined relationships (e.g. `Tenant` has `unit?`, `property?`, `leases?`, `payments?`). Status fields are union types (e.g. `'active' | 'inactive' | 'pending'`).

Add new interfaces here, not inline in pages.

## Supabase clients

- `src/lib/supabase/client.ts` — browser; returns empty stub when env vars are absent (mock mode)
- `src/lib/supabase/server.ts` — server-side with cookie handling for middleware/Server Components

## Stripe clients

- `src/lib/stripe/server.ts` — Stripe SDK instance; server-only; never import in client components
- `src/lib/stripe/plans.ts` — `PLANS` record (Starter/Growth/Pro); price IDs read from env vars; `PlanKey` type

## Environment variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_STARTER_MONTHLY
STRIPE_PRICE_STARTER_ANNUAL
STRIPE_PRICE_GROWTH_MONTHLY
STRIPE_PRICE_GROWTH_ANNUAL
STRIPE_PRICE_PRO_MONTHLY
STRIPE_PRICE_PRO_ANNUAL
NEXT_PUBLIC_APP_URL
```
See `.env.example` for the full template. Local dev uses test Stripe keys; Vercel Production uses live keys.

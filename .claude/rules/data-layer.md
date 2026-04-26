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

All domain interfaces live here — never define DB-backed types inline in pages. Key types:

| Interface | Notes |
|---|---|
| `Profile` | Auth user profile; `role: 'admin' \| 'manager' \| 'tenant'` |
| `Property`, `Unit` | Core property objects; Unit includes `updated_at` and `images: string[]` |
| `Tenant` | Includes `profile_id` (auth link) and `team_member_id` |
| `Lease`, `LeaseDocument` | Lease lifecycle + document attachments |
| `Payment` | Includes `stripe_payment_intent_id` |
| `MaintenanceRequest` | Full request lifecycle with cost tracking |
| `Conversation`, `Message` | Messaging (V2 — mock only) |
| `TeamMember`, `Vendor` | Include `manager_id`, `created_at`, `updated_at`; no phantom fields |
| `Notification` | `type: 'maintenance' \| 'payment' \| 'lease'`; links to `profile_id` |
| `Subscription` | Stripe subscription state; mirrors `subscriptions` table |

Most entities have optional joined relationships (e.g. `Tenant` has `unit?`, `property?`, `leases?`, `payments?`). Status fields are union types.

## Form schemas (`src/lib/schemas/`)

Zod schemas for all forms — one file per domain. Always import both the schema and its inferred type. See conventions.md for the full pattern and all exports.

## Supabase clients

- `src/lib/supabase/client.ts` — browser; returns empty stub when env vars are absent (mock mode)
- `src/lib/supabase/server.ts` — server-side with cookie handling for middleware/Server Components

## Stripe clients

- `src/lib/stripe/server.ts` — Stripe SDK instance; server-only; never import in client components
- `src/lib/stripe/plans.ts` — `PLANS` record (Starter/Growth/Pro); price IDs read from env vars; `PlanKey` type

## Resend client

- `src/lib/resend.ts` — Resend SDK instance; server-only; never import in client components

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
RESEND_API_KEY
RESEND_FROM_EMAIL
SUPABASE_WEBHOOK_SECRET
```
See `.env.example` for the full template. Local dev uses test Stripe keys; Vercel Production uses live keys.

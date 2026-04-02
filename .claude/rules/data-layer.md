---
paths:
  - "src/lib/**"
  - "src/data/**"
  - "src/types/**"
  - "supabase/**"
---

# Data Layer

## Mock data (`src/data/mock.ts`)

All pages currently read from mock data. Exports: PROPERTIES (3), TENANTS (5), LEASES (5), PAYMENTS (5), MAINTENANCE_REQUESTS (5), CONVERSATIONS (3), DASHBOARD_STATS, REPORT_DATA, PAYMENT_SUMMARY.

When adding a new data-driven feature, add mock records here first.

## Types (`src/types/index.ts`)

All domain interfaces live here. Key types: Property, Unit, Tenant, Lease, Payment, MaintenanceRequest, Conversation, Message, Profile. Most entities have optional joined relationships (e.g. `Tenant` has `unit?`, `property?`, `leases?`, `payments?`). Status fields are union types (e.g. `'active' | 'inactive' | 'pending'`).

Add new interfaces here, not inline in pages.

## Supabase clients

- `src/lib/supabase/client.ts` — browser; returns empty stub when env vars are absent (mock mode)
- `src/lib/supabase/server.ts` — server-side with cookie handling for middleware/Server Components

## Environment variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```
Optional:
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
```

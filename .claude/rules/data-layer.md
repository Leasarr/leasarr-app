---
paths:
  - "src/lib/**"
  - "src/data/**"
  - "src/types/**"
  - "supabase/**"
---

# Data Layer

## Mock data (`src/data/mock.ts`)

Fallback for `/communication` and `/reports`. Dashboard auto-falls back when Supabase env vars are absent. All other pages use live Supabase data.

## Types (`src/types/index.ts`)

All domain interfaces live here — never define DB-backed types inline in pages.

| Interface | Notes |
|---|---|
| `Profile` | `role: 'admin' \| 'manager' \| 'tenant'` |
| `Property`, `Unit` | Unit includes `updated_at`, `images: string[]` |
| `Tenant` | Includes `profile_id`, `team_member_id` |
| `Lease`, `LeaseDocument` | Lease lifecycle + document attachments |
| `Payment` | Includes `stripe_payment_intent_id` |
| `MaintenanceRequest` | Full lifecycle with cost tracking |
| `Conversation`, `Message` | V2 — mock only |
| `TeamMember`, `Vendor` | Include `manager_id`, `created_at`, `updated_at` |
| `Notification` | `type: 'maintenance' \| 'payment' \| 'lease'`; links to `profile_id` |
| `Subscription` | Mirrors `subscriptions` table |

Most entities have optional joined relationships. Status fields are union types.

## Supabase clients

- `src/lib/supabase/client.ts` — browser; stubs in mock mode
- `src/lib/supabase/server.ts` — server-side with cookie handling

## Stripe / Resend

- `src/lib/stripe/server.ts` — server-only SDK instance
- `src/lib/stripe/plans.ts` — `PLANS` record (Starter/Growth/Pro); `PlanKey` type
- `src/lib/resend.ts` — server-only SDK instance

## Environment variables

See `.env.example` for the full list. Required groups: Supabase (URL, anon key, service role), Stripe (publishable, secret, webhook secret, 6 price IDs), app URL, Resend (API key, from email), Supabase webhook secret.

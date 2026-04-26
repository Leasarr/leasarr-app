---
paths:
  - "src/app/auth/**"
  - "src/context/AuthContext.tsx"
  - "src/middleware.ts"
---

# Auth

## Two modes

**Mock mode** (no Supabase env vars): auth state stored in `mock_role` cookie (`manager` or `tenant`). Credentials: `manager@demo.com` / `password` or `tenant@demo.com` / `password`. Login page shows a demo banner. Google OAuth button is hidden in mock mode.

**Real mode**: Supabase JWT auth. Profile fetched from `profiles` table after sign-in.

Both pages and middleware handle both modes — keep any new auth logic dual-path.

## Google OAuth

- Login page: "Continue with Google" → `signInWithOAuth({ provider: 'google' })` → callback → `/dashboard`
- Register page: user selects role first, then "Sign up with Google" → role encoded in `redirectTo` → callback → `/auth/set-role?role=<role>` → updates `profiles` table → correct home
- `/auth/set-role` is in `PUBLIC_ROUTES` and `ALWAYS_ALLOW` in middleware
- Callback decodes the `next` param (`decodeURIComponent`) to handle encoded query strings

## AuthContext

Use `useAuth()` in client components:

```tsx
const { user, profile, session, loading, signOut } = useAuth()
```

`profile` shape: `{ id, name, email, role: 'admin' | 'manager' | 'tenant', avatar_url, phone, created_at, updated_at }`

## Middleware route rules

- **Public** (no auth required): `/auth/login`, `/auth/register`, `/auth/callback`, `/auth/reset-password`, `/auth/update-password`, `/auth/set-role`
- **Manager routes**: `/dashboard`, `/people`, `/payments`, `/maintenance`, `/leases`, `/properties`, `/communication`, `/reports`, `/notifications`
- **Tenant routes**: `/portal`
- Unauthenticated → redirect to `/auth/login?redirectTo=<path>`
- Wrong role → redirect to role's home page

---
paths:
  - "src/app/auth/**"
  - "src/context/AuthContext.tsx"
  - "src/middleware.ts"
---

# Auth

## Two modes

**Mock mode** (no Supabase env vars): auth state in `mock_role` cookie. Credentials: `manager@demo.com` / `password` or `tenant@demo.com` / `password`. Google OAuth hidden in mock mode.

**Real mode**: Supabase JWT auth. Profile fetched from `profiles` table after sign-in.

Keep any new auth logic dual-path.

## Google OAuth

- Login: "Continue with Google" → `signInWithOAuth` → callback → `/dashboard`
- Register: role selected first → "Sign up with Google" → role encoded in `redirectTo` → callback → `/auth/set-role?role=<role>` → POST `/api/auth/set-role` → home
- `/auth/set-role` is in `PUBLIC_ROUTES` and `ALWAYS_ALLOW` in middleware
- Callback decodes the `next` param (`decodeURIComponent`) for encoded query strings

`/api/auth/set-role` uses the service role key to bypass RLS — direct client-side role updates are blocked (migration 011 trigger).

## AuthContext

```tsx
const { user, profile, session, loading, signOut, updateProfile } = useAuth()
```

`profile`: `{ id, name, email, role: 'admin' | 'manager' | 'tenant', avatar_url, phone, created_at, updated_at }`

## Avatar priority

1. `user.user_metadata.avatar_url` — Google OAuth photo
2. `profile.avatar_url` — uploaded via Profile Settings
3. Name initials

## Middleware route rules

Three distinct route tiers — defined by `OPEN_ROUTES`, `AUTH_ROUTES`, and `ALWAYS_ALLOW` in `src/middleware.ts`:

- **Open** (`/pricing`, `/about`) — anyone can visit, logged-in or not. No redirect.
- **Homepage** (`/`) — behaves like an auth route: logged-in users are redirected to their dashboard; logged-out users see the marketing homepage.
- **Auth routes** (`/auth/login`, `/auth/register`, `/auth/reset-password`) — logged-out only; logged-in users redirected to their home.
- **Always allow** (`/auth/callback`, `/auth/update-password`, `/auth/set-role`, `/api/stripe`, `/api/notifications`) — never redirected.
- **Manager routes** (`/dashboard`, `/people`, `/payments`, `/maintenance`, `/leases`, `/properties`, `/communication`, `/reports`, `/notifications`) — manager role only; tenant → `/portal`.
- **Tenant routes** (`/portal`) — tenant role only; manager → `/dashboard`.
- Unauthenticated on a protected route → `/auth/login?redirectTo=<path>`

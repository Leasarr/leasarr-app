Scaffold a new API route following Leasarr conventions.

## Arguments
`$ARGUMENTS` format: `<route> <METHOD> <type>`
- `<route>` — the API path, e.g. `/api/reports/export`
- `<METHOD>` — `GET`, `POST`, `PUT`, or `DELETE`
- `<type>` — one of:
  - `auth-gated` — requires a logged-in session (manager or tenant)
  - `webhook` — called by Supabase or Stripe; no user session, uses service role or raw body
  - `open` — unauthenticated, anon-safe (e.g. waitlist, invite validate)
  - `admin` — restricted to `ADMIN_EMAILS` list

Example: `/api/reports/export POST auth-gated`

If any argument is missing, ask before proceeding.

## Templates by type

### `auth-gated`
```ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function <METHOD>(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // TODO: implement
  return NextResponse.json({ ok: true })
}
```

### `webhook`
```ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const serviceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function <METHOD>(request: NextRequest) {
  // TODO: verify webhook secret if applicable
  const payload = await request.json()

  // TODO: implement
  return NextResponse.json({ ok: true })
}
```

### `open`
```ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const serviceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function <METHOD>(request: NextRequest) {
  const body = await request.json()

  // TODO: implement
  return NextResponse.json({ ok: true })
}
```

### `admin`
```ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceRole } from '@supabase/supabase-js'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim())

const serviceRole = createServiceRole(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function <METHOD>(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // TODO: implement
  return NextResponse.json({ ok: true })
}
```

## After creating the file

1. Create the file at `src/app<route>/route.ts` using the correct template with `<METHOD>` replaced by the actual HTTP method.
2. Tell the user the file path.
3. Add the route to the **API routes** table in `.claude/rules/architecture.md` with a `TODO` purpose — remind the user to fill it in.
4. If `type` is `webhook` or `open`, remind the user to add the route prefix to `ALWAYS_ALLOW` in `src/middleware.ts` if it isn't already covered.

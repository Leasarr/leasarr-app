import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

const MOCK = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY
const POLICY_VERSION = '1.0'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { analytics, marketing = false, anonymous_id } = body

  if (typeof analytics !== 'boolean') {
    return NextResponse.json({ error: 'analytics is required' }, { status: 400 })
  }

  if (MOCK) return NextResponse.json({ ok: true })

  const serviceRole = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Detect country from Vercel/Cloudflare header for jurisdiction tracking
  const ip_country = request.headers.get('x-vercel-ip-country') ?? null

  // Check if the request comes from an authenticated user
  const serverClient = createServerClient()
  const { data: { user } } = await serverClient.auth.getUser()

  if (user) {
    // Authenticated: upsert against profile_id
    const { error } = await serviceRole
      .from('cookie_consents')
      .upsert(
        {
          profile_id: user.id,
          analytics,
          marketing,
          ip_country,
          policy_version: POLICY_VERSION,
          decided_at: new Date().toISOString(),
        },
        { onConflict: 'profile_id', ignoreDuplicates: false }
      )

    if (error) return NextResponse.json({ error: 'Failed to save consent' }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  // Anonymous visitor: require an anonymous_id
  if (!anonymous_id || typeof anonymous_id !== 'string') {
    return NextResponse.json({ error: 'anonymous_id is required for unauthenticated requests' }, { status: 400 })
  }

  // For anonymous, delete-then-insert since partial unique indexes don't
  // support onConflict upsert reliably in all Supabase versions
  await serviceRole.from('cookie_consents').delete().eq('anonymous_id', anonymous_id)

  const { error } = await serviceRole
    .from('cookie_consents')
    .insert({
      anonymous_id,
      analytics,
      marketing,
      ip_country,
      policy_version: POLICY_VERSION,
      decided_at: new Date().toISOString(),
    })

  if (error) return NextResponse.json({ error: 'Failed to save consent' }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// Fetch stored consent for the current authenticated user (used on login to sync localStorage)
export async function GET() {
  if (MOCK) return NextResponse.json({ consent: null })

  const serverClient = createServerClient()
  const { data: { user } } = await serverClient.auth.getUser()
  if (!user) return NextResponse.json({ consent: null })

  const serviceRole = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data } = await serviceRole
    .from('cookie_consents')
    .select('analytics, marketing, policy_version, decided_at')
    .eq('profile_id', user.id)
    .maybeSingle()

  return NextResponse.json({ consent: data })
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

const MOCK = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY
const POLICY_VERSION = '1.0'

function serviceRoleClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { analytics, marketing = false, anonymous_id } = body

  if (typeof analytics !== 'boolean') {
    return NextResponse.json({ error: 'analytics is required' }, { status: 400 })
  }

  if (MOCK) return NextResponse.json({ ok: true })

  const ip_country = request.headers.get('x-vercel-ip-country') ?? null
  const action = analytics ? 'accepted' : 'declined'

  const serverClient = createServerClient()
  const { data: { user } } = await serverClient.auth.getUser()
  const serviceRole = serviceRoleClient()

  if (user) {
    const { error } = await serviceRole
      .from('cookie_consents')
      .insert({
        profile_id: user.id,
        analytics,
        marketing,
        ip_country,
        policy_version: POLICY_VERSION,
        decided_at: new Date().toISOString(),
        action,
      })

    if (error) return NextResponse.json({ error: 'Failed to save consent' }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  if (!anonymous_id || typeof anonymous_id !== 'string') {
    return NextResponse.json({ error: 'anonymous_id is required for unauthenticated requests' }, { status: 400 })
  }

  const { error } = await serviceRole
    .from('cookie_consents')
    .insert({
      anonymous_id,
      analytics,
      marketing,
      ip_country,
      policy_version: POLICY_VERSION,
      decided_at: new Date().toISOString(),
      action,
    })

  if (error) return NextResponse.json({ error: 'Failed to save consent' }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// Inserts a 'withdrawn' record — preserves full audit history
export async function DELETE(request: NextRequest) {
  if (MOCK) return NextResponse.json({ ok: true })

  const ip_country = request.headers.get('x-vercel-ip-country') ?? null
  const serverClient = createServerClient()
  const { data: { user } } = await serverClient.auth.getUser()

  if (!user) return NextResponse.json({ ok: true })

  const { error } = await serviceRoleClient()
    .from('cookie_consents')
    .insert({
      profile_id: user.id,
      analytics: false,
      marketing: false,
      ip_country,
      policy_version: POLICY_VERSION,
      decided_at: new Date().toISOString(),
      action: 'withdrawn',
    })

  if (error) return NextResponse.json({ error: 'Failed to withdraw consent' }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// Returns the most recent consent decision for the authenticated user.
// Returns null if no record exists or the latest action is 'withdrawn'.
export async function GET() {
  if (MOCK) return NextResponse.json({ consent: null })

  const serverClient = createServerClient()
  const { data: { user } } = await serverClient.auth.getUser()
  if (!user) return NextResponse.json({ consent: null })

  const { data } = await serviceRoleClient()
    .from('cookie_consents')
    .select('analytics, marketing, policy_version, decided_at, action')
    .eq('profile_id', user.id)
    .order('decided_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!data || data.action === 'withdrawn') return NextResponse.json({ consent: null })
  return NextResponse.json({ consent: data })
}

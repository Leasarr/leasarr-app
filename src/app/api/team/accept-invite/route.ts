import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

const serviceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { token?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { token } = body
  if (!token) return NextResponse.json({ error: 'token is required' }, { status: 400 })

  // Find the pending invite matching this token
  const { data: member } = await serviceRole
    .from('team_members')
    .select('id, invited_email, status')
    .eq('invite_token', token)
    .maybeSingle()

  if (!member) {
    return NextResponse.json({ error: 'Invalid or expired invite link.' }, { status: 404 })
  }

  if (member.status !== 'pending') {
    return NextResponse.json({ error: 'This invite has already been used or was revoked.' }, { status: 409 })
  }

  // The logged-in user's email must match the invited email
  if (member.invited_email && member.invited_email.toLowerCase() !== user.email?.toLowerCase()) {
    return NextResponse.json(
      { error: `This invitation was sent to ${member.invited_email}. Please sign in with that email address.` },
      { status: 403 }
    )
  }

  const { error } = await serviceRole
    .from('team_members')
    .update({
      profile_id: user.id,
      status: 'active',
      accepted_at: new Date().toISOString(),
      invite_token: null,
    })
    .eq('id', member.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}

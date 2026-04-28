import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { resend } from '@/lib/resend'
import { PLANS, type PlanKey } from '@/lib/stripe/plans'

const serviceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function buildInviteHtml(fromName: string, toName: string, inviteUrl: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden">
        <tr>
          <td style="background:#1a1a2e;padding:24px 32px">
            <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.5px">Leasarr</span>
          </td>
        </tr>
        <tr>
          <td style="padding:32px">
            <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111">You've been invited to Leasarr</h2>
            <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#444">
              Hi ${toName},<br><br>
              <strong>${fromName}</strong> has invited you to join their property management team on Leasarr.
              Click below to accept the invitation and set up your account.
            </p>
            <a href="${inviteUrl}" style="display:inline-block;padding:12px 24px;background:#1a1a2e;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600">Accept Invitation →</a>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px;border-top:1px solid #f0f0f0">
            <p style="margin:0;font-size:12px;color:#999">
              If you didn't expect this invitation, you can ignore this email.
              This link expires if revoked by the team owner.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function POST(request: NextRequest) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Block team members from inviting (only owners can invite)
  const { data: isMember } = await serviceRole
    .from('team_members')
    .select('id')
    .eq('profile_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  if (isMember) {
    return NextResponse.json({ error: 'Only the account owner can invite team members.' }, { status: 403 })
  }

  let body: { email?: string; role?: string; name?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { email, role, name } = body
  if (!email || !name) {
    return NextResponse.json({ error: 'email and name are required' }, { status: 400 })
  }

  const normalizedEmail = email.toLowerCase().trim()

  // Check seat limit
  const { data: subscription } = await serviceRole
    .from('subscriptions')
    .select('plan, extra_seats')
    .eq('manager_id', user.id)
    .maybeSingle()

  const planKey = subscription?.plan as PlanKey | undefined
  const planConfig = planKey ? PLANS[planKey] : null
  const seatLimit = planConfig ? planConfig.seatLimit : 1
  const extraSeats = subscription?.extra_seats ?? 0
  const maxSeats = seatLimit + extraSeats

  const { count: activeCount } = await serviceRole
    .from('team_members')
    .select('id', { count: 'exact', head: true })
    .eq('manager_id', user.id)
    .eq('status', 'active')

  const usedSeats = (activeCount ?? 0) + 1 // +1 for the owner

  if (usedSeats >= maxSeats) {
    return NextResponse.json(
      { error: 'Seat limit reached. Upgrade your plan to invite more team members.' },
      { status: 403 }
    )
  }

  const token = crypto.randomUUID()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const inviteUrl = `${appUrl}/auth/accept-invite?token=${token}&email=${encodeURIComponent(normalizedEmail)}`

  // Idempotent: if a pending invite exists for this email+manager, update it
  const { data: existing } = await serviceRole
    .from('team_members')
    .select('id')
    .eq('manager_id', user.id)
    .eq('invited_email', normalizedEmail)
    .in('status', ['pending', 'inactive'])
    .maybeSingle()

  if (existing) {
    const { error } = await serviceRole
      .from('team_members')
      .update({
        name,
        role: role || 'Team Member',
        invite_token: token,
        invited_at: new Date().toISOString(),
        status: 'pending',
        profile_id: null,
        accepted_at: null,
      })
      .eq('id', existing.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else {
    const { error } = await serviceRole
      .from('team_members')
      .insert({
        manager_id: user.id,
        name,
        role: role || 'Team Member',
        email: normalizedEmail,
        invited_email: normalizedEmail,
        invite_token: token,
        invited_at: new Date().toISOString(),
        status: 'pending',
      })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Get owner name for email
  const { data: ownerProfile } = await serviceRole
    .from('profiles')
    .select('name')
    .eq('id', user.id)
    .single()

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: normalizedEmail,
    subject: `${ownerProfile?.name ?? 'Your manager'} invited you to Leasarr`,
    html: buildInviteHtml(ownerProfile?.name ?? 'Your manager', name, inviteUrl),
  })

  return NextResponse.json({ success: true })
}

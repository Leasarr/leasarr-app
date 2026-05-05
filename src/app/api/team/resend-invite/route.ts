import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { resend } from '@/lib/resend'

const serviceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function buildInviteHtml(fromName: string, toName: string, inviteUrl: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden">
        <tr>
          <td style="background:#1a1a2e;padding:24px 32px">
            <span style="color:#ffffff;font-size:20px;font-weight:700;font-family:'Manrope',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;letter-spacing:-0.5px">Leasarr</span>
          </td>
        </tr>
        <tr>
          <td style="padding:32px">
            <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;font-family:'Manrope',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111">Invitation reminder</h2>
            <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#444">
              Hi ${toName},<br><br>
              <strong>${fromName}</strong> has re-sent you an invitation to join their property management team on Leasarr.
              Click below to accept.
            </p>
            <a href="${inviteUrl}" style="display:inline-block;padding:12px 24px;background:#1a1a2e;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;font-family:'Manrope',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">Accept Invitation →</a>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px;border-top:1px solid #f0f0f0">
            <p style="margin:0;font-size:12px;color:#999">If you didn't expect this, you can safely ignore this email.</p>
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

  // Only owners can resend invites
  const { data: isMember } = await serviceRole
    .from('team_members')
    .select('id')
    .eq('profile_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  if (isMember) {
    return NextResponse.json({ error: 'Only the account owner can manage invitations.' }, { status: 403 })
  }

  let body: { team_member_id?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { team_member_id } = body
  if (!team_member_id) {
    return NextResponse.json({ error: 'team_member_id is required' }, { status: 400 })
  }

  const { data: member } = await serviceRole
    .from('team_members')
    .select('id, name, invited_email, email, manager_id')
    .eq('id', team_member_id)
    .single()

  if (!member) return NextResponse.json({ error: 'Team member not found' }, { status: 404 })
  if (member.manager_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const token = crypto.randomUUID()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const emailTo = (member.invited_email ?? member.email).toLowerCase()
  const inviteUrl = `${appUrl}/auth/accept-invite?token=${token}&email=${encodeURIComponent(emailTo)}`

  const { error } = await serviceRole
    .from('team_members')
    .update({
      invite_token: token,
      invited_at: new Date().toISOString(),
      status: 'pending',
      profile_id: null,
      accepted_at: null,
    })
    .eq('id', team_member_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: ownerProfile } = await serviceRole
    .from('profiles')
    .select('name')
    .eq('id', user.id)
    .single()

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: emailTo,
    subject: `Reminder: ${ownerProfile?.name ?? 'Your manager'} invited you to Leasarr`,
    html: buildInviteHtml(ownerProfile?.name ?? 'Your manager', member.name, inviteUrl),
  })

  return NextResponse.json({ success: true })
}

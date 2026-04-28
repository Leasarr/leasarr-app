import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { resend } from '@/lib/resend'

const serviceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function buildRevokeHtml(ownerName: string, memberName: string, appUrl: string): string {
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
            <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111">Your access has been removed</h2>
            <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#444">
              Hi ${memberName},<br><br>
              <strong>${ownerName}</strong> has removed your access to their Leasarr account.
              You can no longer log in to their property management dashboard.
            </p>
            <p style="margin:0;font-size:14px;color:#666">
              Your personal Leasarr account still exists if you'd like to manage your own properties.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px;border-top:1px solid #f0f0f0">
            <p style="margin:0;font-size:12px;color:#999">
              If you believe this was a mistake, please contact ${ownerName} directly.
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

  // Only owners can revoke
  const { data: isMember } = await serviceRole
    .from('team_members')
    .select('id')
    .eq('profile_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  if (isMember) {
    return NextResponse.json({ error: 'Only the account owner can revoke access.' }, { status: 403 })
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

  // Fetch the team member to verify ownership and get their details for email
  const { data: member } = await serviceRole
    .from('team_members')
    .select('id, name, email, invited_email, manager_id')
    .eq('id', team_member_id)
    .single()

  if (!member) return NextResponse.json({ error: 'Team member not found' }, { status: 404 })
  if (member.manager_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await serviceRole
    .from('team_members')
    .update({ status: 'inactive', profile_id: null, invite_token: null })
    .eq('id', team_member_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Send removal email
  const emailTo = member.invited_email ?? member.email
  if (emailTo) {
    const { data: ownerProfile } = await serviceRole
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single()

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: emailTo,
      subject: `Your Leasarr access has been removed`,
      html: buildRevokeHtml(ownerProfile?.name ?? 'The account owner', member.name, appUrl),
    })
  }

  return NextResponse.json({ success: true })
}

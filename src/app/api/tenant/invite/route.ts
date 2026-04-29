import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { resend } from '@/lib/resend'

function buildTenantInviteHtml(managerName: string, tenantName: string, registerUrl: string): string {
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
            <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111">Your rental account is ready</h2>
            <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#444">
              Hi ${tenantName},<br><br>
              <strong>${managerName}</strong> has added you as a tenant on Leasarr.
              Create your account to view your lease, pay rent, and submit maintenance requests — all in one place.
            </p>
            <a href="${registerUrl}" style="display:inline-block;padding:12px 24px;background:#1a1a2e;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600">Set Up My Account →</a>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px;border-top:1px solid #f0f0f0">
            <p style="margin:0;font-size:12px;color:#999">
              If you weren't expecting this, you can safely ignore it.
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

  let body: { tenant_id?: string; tenant_email?: string; tenant_first_name?: string; tenant_last_name?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { tenant_id, tenant_email, tenant_first_name, tenant_last_name } = body
  if (!tenant_email || !tenant_first_name) {
    return NextResponse.json({ error: 'tenant_email and tenant_first_name are required' }, { status: 400 })
  }

  const { data: managerProfile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user.id)
    .single()

  const tenantName = [tenant_first_name, tenant_last_name].filter(Boolean).join(' ')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const registerUrl = `${appUrl}/auth/register?email=${encodeURIComponent(tenant_email)}&role=tenant`

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: tenant_email,
    subject: `${managerProfile?.name ?? 'Your manager'} added you to Leasarr`,
    html: buildTenantInviteHtml(managerProfile?.name ?? 'Your manager', tenantName, registerUrl),
  })

  if (tenant_id) {
    await supabase
      .from('tenants')
      .update({ invited_at: new Date().toISOString() })
      .eq('id', tenant_id)
  }

  return NextResponse.json({ success: true })
}

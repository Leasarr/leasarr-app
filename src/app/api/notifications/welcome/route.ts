import { NextRequest, NextResponse } from 'next/server'
import { resend } from '@/lib/resend'

type ProfileRow = {
  id: string
  name: string
  email: string
  role: 'manager' | 'tenant' | 'admin'
}

type WebhookPayload = {
  type: 'INSERT'
  table: string
  record: ProfileRow
}

function buildWelcomeHtml(name: string, role: 'manager' | 'tenant' | 'admin', appUrl: string): string {
  const isManager = role === 'manager'
  const ctaUrl = `${appUrl}${isManager ? '/dashboard' : '/portal'}`
  const ctaLabel = isManager ? 'Go to Dashboard' : 'Go to My Portal'
  const subtitle = isManager
    ? 'Start by adding your first property and inviting your tenants.'
    : 'View your lease, pay rent, and submit maintenance requests — all in one place.'

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
            <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111">Welcome, ${name}!</h2>
            <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#444">${subtitle}</p>
            <a href="${ctaUrl}" style="display:inline-block;padding:12px 24px;background:#1a1a2e;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600">${ctaLabel} →</a>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px;border-top:1px solid #f0f0f0">
            <p style="margin:0;font-size:12px;color:#999">You're receiving this because you just created a Leasarr account.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-webhook-secret')
  if (secret !== process.env.SUPABASE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let payload: WebhookPayload
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (payload.type !== 'INSERT' || payload.table !== 'profiles') {
    return NextResponse.json({ received: true })
  }

  const { name, email, role } = payload.record
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: email,
    subject: `Welcome to Leasarr, ${name}!`,
    html: buildWelcomeHtml(name, role, appUrl),
  })

  return NextResponse.json({ received: true })
}

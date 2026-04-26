import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { resend } from '@/lib/resend'
import { NOTIFICATION_TYPE_META } from '@/lib/notificationMeta'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type NotificationRow = {
  id: string
  profile_id: string
  type: string
  title: string
  body: string
  linked_record_id: string | null
  created_at: string
}

type WebhookPayload = {
  type: 'INSERT'
  table: string
  record: NotificationRow
}

function buildEmailHtml(notification: NotificationRow, ctaUrl: string): string {
  const meta = NOTIFICATION_TYPE_META[notification.type]
  const label = meta?.label ?? 'Leasarr'

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
            <span style="color:#8888aa;font-size:13px;margin-left:8px">${label}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:32px">
            <h2 style="margin:0 0 12px;font-size:18px;font-weight:600;color:#111">${notification.title}</h2>
            <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#444">${notification.body}</p>
            <a href="${ctaUrl}" style="display:inline-block;padding:12px 24px;background:#1a1a2e;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600">View in Leasarr →</a>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px;border-top:1px solid #f0f0f0">
            <p style="margin:0;font-size:12px;color:#999">You're receiving this because you have an account on Leasarr.</p>
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

  if (payload.type !== 'INSERT' || payload.table !== 'notifications') {
    return NextResponse.json({ received: true })
  }

  const notification = payload.record

  const { data: profile } = await supabase
    .from('profiles')
    .select('email, role')
    .eq('id', notification.profile_id)
    .single()

  if (!profile?.email) return NextResponse.json({ received: true })

  const meta = NOTIFICATION_TYPE_META[notification.type]
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const href = profile.role === 'tenant' ? meta?.portalHref : meta?.managerHref
  const ctaUrl = `${appUrl}${href ?? '/notifications'}`

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: profile.email,
    subject: notification.title,
    html: buildEmailHtml(notification, ctaUrl),
  })

  return NextResponse.json({ received: true })
}

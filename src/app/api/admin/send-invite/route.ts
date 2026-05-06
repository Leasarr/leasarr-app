import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { resend } from '@/lib/resend'

const ADMIN_EMAILS = ['bhasmangdixit@gmail.com', 'prashantgadhvi111@gmail.com']

const serviceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function buildInviteHtml(name: string, code: string, registerUrl: string): string {
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
            <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;font-family:'Manrope',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111">You're in, ${name}!</h2>
            <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#444">Your early access to Leasarr has been approved. Use the invite code below to create your account.</p>
            <div style="background:#f5f5f5;border-radius:8px;padding:16px 24px;text-align:center;margin-bottom:24px">
              <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#999;letter-spacing:0.05em;text-transform:uppercase">Your invite code</p>
              <p style="margin:0;font-size:28px;font-weight:700;font-family:'Manrope',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111;letter-spacing:0.1em">${code}</p>
            </div>
            <a href="${registerUrl}" style="display:inline-block;padding:12px 24px;background:#1a1a2e;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;font-family:'Manrope',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">Create your account →</a>
            <p style="margin:24px 0 0;font-size:13px;color:#999;line-height:1.6">This code is for your use only and can only be used once. If you have any questions, reply to this email.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px;border-top:1px solid #f0f0f0">
            <p style="margin:0;font-size:12px;color:#999">© ${new Date().getFullYear()} Leasarr. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name, email, code } = await request.json()
  if (!name || !email || !code) {
    return NextResponse.json({ error: 'name, email, and code are required' }, { status: 400 })
  }

  // Validate code is still available
  const { data: codeRow } = await serviceRole
    .from('invite_codes')
    .select('id, uses_count, max_uses')
    .eq('code', code)
    .single()

  if (!codeRow || codeRow.uses_count >= codeRow.max_uses) {
    return NextResponse.json({ error: 'This code is no longer available' }, { status: 400 })
  }

  const registerUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.leasarr.com'}/auth/register`

  const { error: emailError } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? 'Leasarr <hello@leasarr.com>',
    to: email,
    subject: `You're in — your Leasarr invite code`,
    html: buildInviteHtml(name, code, registerUrl),
  })

  if (emailError) {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

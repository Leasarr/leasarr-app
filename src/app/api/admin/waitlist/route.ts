import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAILS = ['bhasmangdixit@gmail.com', 'prashantgadhvi111@gmail.com']

const serviceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [{ data: waitlist }, { data: codes }] = await Promise.all([
    serviceRole
      .from('waitlist')
      .select('id, name, email, property_count, created_at')
      .order('created_at', { ascending: true }),
    serviceRole
      .from('invite_codes')
      .select('id, code, uses_count, max_uses')
      .order('created_at', { ascending: true }),
  ])

  return NextResponse.json({
    waitlist: waitlist ?? [],
    codes: (codes ?? []).filter(c => c.uses_count < c.max_uses),
  })
}

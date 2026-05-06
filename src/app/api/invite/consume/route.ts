import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const MOCK = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(request: NextRequest) {
  const { code } = await request.json()
  if (!code) return NextResponse.json({ ok: false }, { status: 400 })

  if (MOCK) return NextResponse.json({ ok: true })

  const serviceRole = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await serviceRole
    .from('invite_codes')
    .select('id, uses_count, max_uses')
    .eq('code', code.trim().toUpperCase())
    .single()

  if (error || !data || data.uses_count >= data.max_uses) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  await serviceRole
    .from('invite_codes')
    .update({ uses_count: data.uses_count + 1 })
    .eq('id', data.id)

  return NextResponse.json({ ok: true })
}

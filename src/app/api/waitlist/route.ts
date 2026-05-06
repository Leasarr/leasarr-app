import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const MOCK = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(request: NextRequest) {
  const { name, email, property_count } = await request.json()
  if (!name || !email) return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })

  if (MOCK) return NextResponse.json({ ok: true })

  const serviceRole = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await serviceRole
    .from('waitlist')
    .insert({ name, email: email.toLowerCase().trim(), property_count })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: "You're already on the waitlist! We'll be in touch soon." }, { status: 409 })
    }
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

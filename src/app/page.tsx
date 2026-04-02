import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const isMockMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export default async function RootPage() {
  if (isMockMode) {
    redirect('/auth/login')
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const role = user.user_metadata?.role as string
  redirect(role === 'tenant' ? '/portal' : '/dashboard')
}

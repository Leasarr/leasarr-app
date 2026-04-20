import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MarketingLayout } from '@/components/marketing/layout'

const isMockMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export default async function RootPage() {
  if (!isMockMode) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const role = user.user_metadata?.role as string
      redirect(role === 'tenant' ? '/portal' : '/dashboard')
    }
  }

  return (
    <MarketingLayout>
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <p className="text-on-surface-variant text-sm">Sections loading…</p>
      </div>
    </MarketingLayout>
  )
}

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MarketingLayout } from '@/components/marketing/layout'
import { Hero } from '@/components/marketing/sections/hero'
import { ProofBar } from '@/components/marketing/sections/proof-bar'
import { FeatureOverview } from '@/components/marketing/sections/feature-overview'

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
      <Hero />
      <ProofBar />
      <FeatureOverview />
    </MarketingLayout>
  )
}

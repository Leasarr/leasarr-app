import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MarketingLayout } from '@/components/marketing/layout'
import { Hero } from '@/components/marketing/sections/hero'
import { ProofBar } from '@/components/marketing/sections/proof-bar'
import { FeatureOverview } from '@/components/marketing/sections/feature-overview'
import { FeatureDeepDive } from '@/components/marketing/sections/feature-deepdive'

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
      <FeatureDeepDive
        label="Portfolio View"
        heading="See your entire portfolio at a glance."
        body="Get a live view of every property, unit, and tenant in your portfolio. Occupancy rates, upcoming renewals, and outstanding maintenance — surfaced on your dashboard before you even ask."
        bullets={[
          'Occupancy and vacancy rates by property',
          'Upcoming lease expirations with renewal status',
          'Outstanding maintenance at a glance',
          'Full property and unit detail in one click',
        ]}
        side="left"
        background="surface-container-low"
      />
      <FeatureDeepDive
        label="Maintenance"
        heading="From request to resolved, end to end."
        body="Tenants submit requests through their portal. You assign vendors, track status, and close jobs — without chasing anyone for updates. Every job has a full history."
        bullets={[
          'Tenant portal submission — no emails required',
          'Assign and notify vendors in one step',
          'Real-time status visible to everyone',
          'Full job history per unit',
        ]}
        side="right"
        background="surface"
      />
      <FeatureDeepDive
        label="Payments"
        heading="Track every dollar, on every unit."
        body="Record rent payments, log partial payments, and track balances per tenant. Every transaction is timestamped and tied to a lease — so your books are always clean."
        bullets={[
          'Record and categorise payments by type',
          'Auto-fill from active lease on every entry',
          'Outstanding balance visible per tenant',
          'Mark payments as paid with one action',
        ]}
        side="left"
        background="surface-container-low"
      />
    </MarketingLayout>
  )
}

import { MarketingLayout } from '@/components/marketing/layout'
import { FinalCTA } from '@/components/marketing/sections/final-cta'
import { PricingControlsProvider } from '@/components/marketing/sections/pricing/context'
import { PricingIntro } from '@/components/marketing/sections/pricing/intro'
import { TierGrid } from '@/components/marketing/sections/pricing/tier-grid'
import { CompareTable } from '@/components/marketing/sections/pricing/compare'
import { AddOns } from '@/components/marketing/sections/pricing/addons'
import { PricingFAQ } from '@/components/marketing/sections/pricing/faq'
import type { BillingInterval } from '@/lib/marketing/pricing'

export default function PricingPage({
  searchParams,
}: {
  searchParams: { billing?: string }
}) {
  const initialBillingInterval: BillingInterval =
    searchParams.billing === 'annual' ? 'annual' : 'monthly'

  return (
    <MarketingLayout>
      <PricingControlsProvider initialBillingInterval={initialBillingInterval}>
        <PricingIntro />
        <TierGrid />
        <CompareTable />
        <AddOns />
        <PricingFAQ />
        <FinalCTA />
      </PricingControlsProvider>
    </MarketingLayout>
  )
}

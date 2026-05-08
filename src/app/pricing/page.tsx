import type { Metadata } from 'next'
import { MarketingLayout } from '@/components/marketing/layout'
import { FinalCTA } from '@/components/marketing/sections/final-cta'
import { PricingControlsProvider } from '@/components/marketing/sections/pricing/context'
import { PricingIntro } from '@/components/marketing/sections/pricing/intro'
import { TierGrid } from '@/components/marketing/sections/pricing/tier-grid'
import { CompareTable } from '@/components/marketing/sections/pricing/compare'
import { AddOns } from '@/components/marketing/sections/pricing/addons'
import { PricingFAQ } from '@/components/marketing/sections/pricing/faq'
import { PRICING_FAQ, type BillingInterval } from '@/lib/marketing/pricing'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://leasarr.com'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Simple, transparent pricing for property management software. Free trial, no credit card required. Plans that scale with your portfolio.',
  openGraph: {
    title: 'Leasarr Pricing — Property Management Software',
    description: 'Free trial, no credit card required. Plans that scale with your portfolio.',
    url: `${BASE_URL}/pricing`,
    images: [{ url: `${BASE_URL}/og-image.png`, width: 1200, height: 630, alt: 'Leasarr Pricing' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Leasarr Pricing',
    description: 'Free trial, no credit card required. Plans that scale with your portfolio.',
    images: [`${BASE_URL}/og-image.png`],
  },
  alternates: {
    canonical: `${BASE_URL}/pricing`,
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: PRICING_FAQ.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
}

export default function PricingPage({
  searchParams,
}: {
  searchParams: { billing?: string }
}) {
  const initialBillingInterval: BillingInterval =
    searchParams.billing === 'annual' ? 'annual' : 'monthly'

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
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
    </>
  )
}

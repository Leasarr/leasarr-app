import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MarketingLayout } from '@/components/marketing/layout'
import { Hero } from '@/components/marketing/sections/hero'
import { ProofBar } from '@/components/marketing/sections/proof-bar'
import { FeatureOverview } from '@/components/marketing/sections/feature-overview'
import { FeatureDeepDive } from '@/components/marketing/sections/feature-deepdive'
import { Audience } from '@/components/marketing/sections/audience'
import { Testimonials } from '@/components/marketing/sections/testimonials'
import { HomepageFAQ } from '@/components/marketing/sections/faq'
import { FinalCTA } from '@/components/marketing/sections/final-cta'

const isMockMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://leasarr.com'

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Leasarr',
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  description: 'Property management software for landlords and property managers in Canada.',
  foundingDate: '2024',
  areaServed: 'Canada',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Support',
    email: 'hello@leasarr.com',
  },
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Leasarr',
  url: BASE_URL,
  description: 'Manage properties, tenants, leases, maintenance, and rent payments in one unified platform.',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    priceCurrency: 'CAD',
    price: '0',
    description: 'Free trial available. Paid plans scale with your portfolio.',
  },
}

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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <MarketingLayout>
      <Hero />
      <ProofBar />
      <FeatureOverview />
      <FeatureDeepDive
        label="Portfolio View"
        heading="See occupancy rates, lease renewals, and open vacancies in one place."
        body="Get a live view of every property, unit, and tenant in your portfolio. Occupancy rates, upcoming renewals, and outstanding maintenance, all surfaced on your dashboard before you even ask."
        bullets={[
          'Occupancy and vacancy rates by property',
          'Upcoming lease expirations with renewal status',
          'Outstanding maintenance at a glance',
          'Full property and unit detail in one click',
        ]}
        imageSrc="/mockups/properties.png"
        imageAlt="Leasarr portfolio and properties view"
        side="left"
        background="surface-container-low"
      />
      <FeatureDeepDive
        label="Maintenance"
        heading="End-to-end maintenance tracking, from first request to resolved."
        body="Tenants submit requests through their portal. You assign vendors, track status, and close jobs without chasing anyone for updates. Every job has a full history."
        bullets={[
          'Tenant portal submission, no email required',
          'Assign and notify vendors in one step',
          'Real-time status visible to everyone',
          'Full job history per unit',
        ]}
        imageSrc="/mockups/maintenance.png"
        imageAlt="Leasarr maintenance request tracking"
        side="right"
        background="surface"
      />
      <FeatureDeepDive
        label="Payments"
        heading="Rent collection and payment tracking across every unit."
        body="Record rent payments, log partial payments, and track balances per tenant. Every transaction is timestamped and tied to a lease, so your books are always clean."
        bullets={[
          'Record and categorise payments by type',
          'Auto-fill from active lease on every entry',
          'Outstanding balance visible per tenant',
          'Mark payments as paid with one action',
        ]}
        imageSrc="/mockups/payments.png"
        imageAlt="Leasarr payments and rent tracking"
        side="left"
        background="surface-container-low"
      />
      <Audience />
      <Testimonials />
      <HomepageFAQ />
      <FinalCTA />
      </MarketingLayout>
    </>
  )
}

import { MarketingLayout } from '@/components/marketing/layout'
import type { Metadata } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://leasarr.com'

export const metadata: Metadata = {
  title: 'About',
  description: 'Leasarr is property management software built for landlords and property managers in Canada. Learn why we built it and who is behind it.',
  openGraph: {
    title: 'About Leasarr',
    description: 'Leasarr is property management software built for landlords and property managers in Canada.',
    url: `${BASE_URL}/about`,
    siteName: 'Leasarr',
  },
  alternates: {
    canonical: `${BASE_URL}/about`,
  },
}

export default function AboutPage() {
  return (
    <MarketingLayout>
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-20 md:py-28">
        <h1 className="font-headline text-4xl font-bold text-on-surface mb-6">About Leasarr</h1>

        <div className="text-on-surface-variant leading-relaxed text-base space-y-6">
          <p>
            Leasarr is property management software built for independent landlords and property managers in Canada.
            We built it because managing a rental portfolio across spreadsheets, email threads, and disconnected tools
            is genuinely painful, and the existing software options were either too complex or not built for how
            Canadian operators actually work.
          </p>
          <p>
            Our goal is to give every landlord, regardless of portfolio size, the tools that professional property
            management firms take for granted: a single view of every unit, lease, tenant, payment, and maintenance
            request, without the enterprise price tag.
          </p>
          <p>
            Leasarr is currently in private beta. We are onboarding a small group of early users and building
            the product around their feedback.
          </p>
          <p>
            Questions or feedback:{' '}
            <a href="mailto:hello@leasarr.com" className="text-primary underline hover:opacity-80">
              hello@leasarr.com
            </a>
          </p>
        </div>
      </div>
    </MarketingLayout>
  )
}

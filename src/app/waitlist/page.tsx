import type { Metadata } from 'next'
import { MarketingLayout } from '@/components/marketing/layout'
import { WaitlistForm } from './WaitlistForm'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://leasarr.com'

export const metadata: Metadata = {
  title: 'Join the Waitlist',
  description: "Get early access to Leasarr. We're onboarding our first 25 property managers by invite only.",
  openGraph: {
    title: 'Get Early Access to Leasarr',
    description: "We're onboarding our first 25 property managers by invite only. Join the list.",
    url: `${BASE_URL}/waitlist`,
    siteName: 'Leasarr',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Get Early Access to Leasarr',
    description: "We're onboarding our first 25 property managers by invite only.",
  },
  alternates: {
    canonical: `${BASE_URL}/waitlist`,
  },
}

export default function WaitlistPage() {
  return (
    <MarketingLayout>
      <section
        className="min-h-screen flex flex-col items-center justify-center px-6 py-24"
        style={{ background: 'linear-gradient(135deg, #001E5A 0%, #003D9B 100%)' }}
      >
        {/* Dot grid */}
        <div
          className="fixed inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative w-full max-w-lg">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-white/10 text-white border border-white/20">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Private beta · 25 spots
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-white text-center leading-tight tracking-tight mb-4">
            Get early access to Leasarr
          </h1>
          <p className="text-white/70 text-center text-lg mb-10 max-w-sm mx-auto">
            We&apos;re onboarding our first 25 property managers by invite only. Join the list and we&apos;ll reach out when a spot opens.
          </p>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
            <WaitlistForm />
          </div>

          <p className="text-center text-white/40 text-sm mt-6">
            Already have an invite code?{' '}
            <a href="/auth/register" className="text-white/70 font-semibold hover:text-white transition-colors">
              Create your account →
            </a>
          </p>
        </div>
      </section>
    </MarketingLayout>
  )
}

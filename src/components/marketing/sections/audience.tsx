import Link from 'next/link'
import { SectionHeader } from '../ui/section-header'
import { FadeIn } from '../ui/fade-in'

const AUDIENCE_CARDS = [
  {
    icon: 'person',
    title: 'Independent Landlord',
    positioning: 'Run your units like a pro — without an office full of staff.',
    painPoints: [
      'Juggling payments, maintenance, and leases across spreadsheets',
      'Missing renewal dates because nothing reminds you',
      'Tenants emailing and texting with no single thread',
      'No clear view of what each unit is actually costing you',
    ],
    cta: 'Start free',
    ctaHref: '/auth/register',
  },
  {
    icon: 'business',
    title: 'Property Manager / Team',
    positioning: 'One platform your whole team works from — not a stack of separate tools.',
    painPoints: [
      'No single view across your managed portfolio',
      'Vendor coordination happening outside any system',
      'Owner reporting is manual and time-consuming',
      'Tenant communication scattered across tools and people',
    ],
    cta: 'Talk to us',
    ctaHref: 'mailto:hello@leasarr.com',
  },
]

export function Audience() {
  return (
    <section className="bg-surface py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16">
        <FadeIn>
          <SectionHeader
            heading="Built for how you operate."
            subtext="Whether you manage 5 units or 500, Leasarr fits how you work."
            align="center"
            className="mb-14"
          />
        </FadeIn>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {AUDIENCE_CARDS.map((card, i) => (
            <FadeIn key={card.title} delay={i * 120}>
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 p-8 flex flex-col gap-6 hover:-translate-y-1 transition-all duration-200 hover:shadow-lg h-full">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-rounded text-3xl text-primary">{card.icon}</span>
                  <h3 className="text-xl font-bold text-on-surface">{card.title}</h3>
                </div>
                <p className="text-base font-medium text-on-surface-variant leading-relaxed">
                  {card.positioning}
                </p>
                <ul className="flex flex-col gap-2.5 flex-1">
                  {card.painPoints.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-sm text-on-surface-variant">
                      <span className="material-symbols-rounded text-tertiary text-base mt-0.5 flex-shrink-0">
                        arrow_right
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
                <Link href={card.ctaHref} className="btn-primary text-center mt-auto">
                  {card.cta}
                </Link>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

'use client'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { SectionHeader } from '@/components/marketing/ui/section-header'
import { FadeIn } from '@/components/marketing/ui/fade-in'
import { PRICING_FAQ } from '@/lib/marketing/pricing'

export function PricingFAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="bg-surface-container-low py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16">
        <FadeIn>
          <SectionHeader heading="Frequently asked questions" align="center" className="mb-12" />
        </FadeIn>
        <div className="max-w-3xl mx-auto">
          {PRICING_FAQ.map((item, i) => (
            <FadeIn key={i} delay={i * 40}>
              <div className="border-b border-outline-variant/40">
                <button
                  type="button"
                  onClick={() => setOpen(open === i ? null : i)}
                  aria-expanded={open === i}
                  className="w-full flex items-center justify-between py-5 text-left gap-4 group"
                >
                  <span
                    className={cn(
                      'font-headline font-semibold text-lg transition-colors',
                      open === i ? 'text-primary' : 'text-on-surface group-hover:text-on-surface'
                    )}
                  >
                    {item.q}
                  </span>
                  <span
                    className={cn(
                      'material-symbols-outlined text-on-surface-variant flex-shrink-0 transition-transform duration-200',
                      open === i ? 'rotate-180' : ''
                    )}
                  >
                    expand_more
                  </span>
                </button>
                {open === i && (
                  <div className="pb-5 text-base text-on-surface-variant leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

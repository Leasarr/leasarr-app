'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { FadeIn } from '@/components/marketing/ui/fade-in'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { PRICING_TIERS } from '@/lib/marketing/pricing'
import { usePricing } from './context'

const BILLING_OPTIONS = [
  { key: 'monthly', label: 'Monthly' },
  { key: 'annual', label: 'Annual — Save 2 months' },
]

function formatPrice(price: number): string {
  return price % 1 === 0 ? `${price}` : price.toFixed(2)
}

export function TierGrid() {
  const { billingInterval, setBillingInterval, unitsHint, setUnitsHint, recommendedTier } = usePricing()
  const isAnnual = billingInterval === 'annual'
  const router = useRouter()

  function handleBillingChange(v: string) {
    const interval = v as 'monthly' | 'annual'
    setBillingInterval(interval)
    const params = new URLSearchParams(window.location.search)
    if (interval === 'annual') {
      params.set('billing', 'annual')
    } else {
      params.delete('billing')
    }
    const qs = params.toString()
    router.replace(`/pricing${qs ? `?${qs}` : ''}`, { scroll: false })
  }

  return (
    <section className="bg-surface py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16">

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-12">
          <SegmentedControl
            options={BILLING_OPTIONS}
            value={billingInterval}
            onChange={handleBillingChange}
          />
          <div className="flex items-center gap-3">
            <label htmlFor="units-hint" className="text-sm font-medium text-on-surface-variant whitespace-nowrap">
              How many units do you manage?
            </label>
            <input
              id="units-hint"
              type="number"
              min={1}
              placeholder="e.g. 25"
              value={unitsHint ?? ''}
              onChange={e => {
                const v = parseInt(e.target.value, 10)
                setUnitsHint(isNaN(v) || v < 1 ? null : v)
              }}
              className="input-base max-w-[120px] py-1.5 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {PRICING_TIERS.map((tier, i) => {
            const isRecommended = recommendedTier !== null && recommendedTier === tier.key
            const isPopular = recommendedTier === null && !!tier.popular
            const isHighlighted = isRecommended || isPopular
            const chipLabel = isRecommended ? 'Recommended for you' : isPopular ? 'Most popular' : null

            const displayPrice = tier.monthly !== null
              ? isAnnual ? tier.annualMonthly : tier.monthly
              : null

            return (
              <FadeIn key={tier.key} delay={i * 80}>
                <div
                  className={cn(
                    'relative bg-surface-container-lowest rounded-2xl border p-6 lg:p-8 shadow-sm flex flex-col h-full',
                    isHighlighted
                      ? 'border-primary ring-2 ring-primary/30 shadow-modal lg:scale-[1.02]'
                      : 'border-outline-variant/40'
                  )}
                >
                  {chipLabel && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-on-primary text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap shadow-sm">
                      {chipLabel}
                    </div>
                  )}

                  <div className="mb-4">
                    <div className="font-headline font-bold text-xl text-on-surface">{tier.name}</div>
                    <div className="text-sm font-medium text-on-surface-variant mt-0.5">{tier.unitCapLabel}</div>
                  </div>

                  <div className="mb-6 min-h-[80px]">
                    {displayPrice !== null ? (
                      <>
                        <div className="flex items-baseline gap-1">
                          <span className="font-headline font-extrabold text-5xl text-on-surface">
                            ${formatPrice(displayPrice)}
                          </span>
                          <span className="text-base text-on-surface-variant">/mo</span>
                        </div>
                        {isAnnual && tier.annual !== null && (
                          <div className="text-sm text-on-surface-variant mt-1">
                            Billed ${tier.annual}/yr — save ${tier.annualSavings}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex items-baseline">
                        <span className="font-headline font-extrabold text-4xl text-on-surface">Custom</span>
                      </div>
                    )}
                  </div>

                  {tier.key === 'enterprise' ? (
                    <a
                      href={tier.ctaHref}
                      className="flex items-center justify-center w-full min-h-[44px] py-3 rounded-xl border border-outline-variant/60 text-on-surface font-semibold text-sm hover:bg-surface-container-low transition-colors"
                    >
                      {tier.ctaLabel}
                    </a>
                  ) : (
                    <Link
                      href={`${tier.ctaHref}&billing=${billingInterval}`}
                      className={cn(
                        'flex items-center justify-center w-full min-h-[44px] py-3 rounded-xl font-semibold text-sm transition-all duration-200',
                        tier.key === 'growth'
                          ? 'btn-primary'
                          : 'border border-primary text-primary hover:bg-primary/5'
                      )}
                    >
                      {tier.ctaLabel}
                    </Link>
                  )}

                  <div className="border-t border-outline-variant/40 my-6" />

                  <ul className="flex flex-col gap-3 flex-1">
                    {tier.highlights.map(h => (
                      <li key={h} className="flex items-start gap-2 text-sm text-on-surface">
                        <span className="material-symbols-outlined text-base text-primary mt-0.5 flex-shrink-0">check</span>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            )
          })}
        </div>

        <div className="text-center mt-10 flex flex-col gap-1">
          <p className="text-sm font-medium text-on-surface-variant">No credit card required.</p>
          <p className="text-xs text-on-surface-variant">Cancel anytime before day 30.</p>
        </div>
      </div>
    </section>
  )
}

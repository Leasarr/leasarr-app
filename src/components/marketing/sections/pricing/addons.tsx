import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { SectionHeader } from '@/components/marketing/ui/section-header'
import { FadeIn } from '@/components/marketing/ui/fade-in'
import { PRICING_ADDONS } from '@/lib/marketing/pricing'

export function AddOns() {
  return (
    <section className="bg-surface py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16">
        <FadeIn>
          <SectionHeader
            heading="Pay only for what you use"
            subtext="Add capabilities à la carte. Billed monthly with your subscription."
            align="center"
            className="mb-12"
          />
        </FadeIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRICING_ADDONS.map((addon, i) => (
            <FadeIn key={addon.key} delay={i * 60}>
              <Card padding="lg" radius="md" surface="lowest" className="flex flex-col gap-4 h-full">
                <span className="material-symbols-outlined text-primary text-[32px] leading-none">
                  {addon.icon}
                </span>
                <div>
                  <div className="font-headline font-semibold text-lg text-on-surface">{addon.name}</div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-headline font-bold text-2xl text-on-surface">{addon.price}</span>
                    <span className="text-sm text-on-surface-variant">{addon.unit}</span>
                  </div>
                </div>
                <p className="text-sm text-on-surface-variant flex-1 leading-relaxed">{addon.description}</p>
                {addon.includedOn && (
                  <div>
                    <Badge variant="success">Included on {addon.includedOn}</Badge>
                  </div>
                )}
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

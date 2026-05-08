'use client'
import { useRef, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { SectionHeader } from '@/components/marketing/ui/section-header'
import { FadeIn } from '@/components/marketing/ui/fade-in'
import { PRICING_ADDONS } from '@/lib/marketing/pricing'

gsap.registerPlugin(ScrollTrigger)

export function AddOns() {
  const sectionRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      const priceEls = Array.from(
        sectionRef.current?.querySelectorAll<HTMLElement>('.addon-price') ?? []
      )

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          priceEls.forEach((el) => {
            const countTo = parseInt(el.dataset.count ?? '0', 10)
            const prefix  = el.dataset.prefix ?? ''
            const obj     = { val: 0 }
            gsap.to(obj, {
              val: countTo,
              duration: 1.2,
              ease: 'power2.out',
              onUpdate() {
                el.textContent = `${prefix}${Math.round(obj.val)}`
              },
            })
          })
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="bg-surface py-20 lg:py-28">
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
          {PRICING_ADDONS.map((addon, i) => {
            const numeric = parseInt(addon.price.replace(/[^0-9]/g, ''), 10)
            const prefix  = addon.price.replace(/[0-9]/g, '')
            return (
              <FadeIn key={addon.key} delay={i * 60}>
                <Card padding="lg" radius="md" surface="lowest" className="flex flex-col gap-4 h-full">
                  <span className="material-symbols-outlined text-primary text-[32px] leading-none">
                    {addon.icon}
                  </span>
                  <div>
                    <div className="font-headline font-semibold text-lg text-on-surface">{addon.name}</div>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span
                        className="addon-price font-headline font-bold text-2xl text-on-surface"
                        data-count={numeric}
                        data-prefix={prefix}
                      >
                        {addon.price}
                      </span>
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
            )
          })}
        </div>
      </div>
    </section>
  )
}

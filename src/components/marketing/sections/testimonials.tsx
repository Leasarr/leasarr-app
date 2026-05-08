'use client'
import { useRef, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const TESTIMONIALS = [
  {
    quote:
      'We were managing 40 units across three spreadsheets and a shared Gmail inbox. Leasarr replaced all of it in a weekend.',
    name: 'Jamie R.',
    role: 'Independent Landlord',
    units: 42,
  },
  {
    quote:
      'The maintenance tracking alone is worth it. Tenants submit, I assign, vendors get notified. Nothing falls through the cracks anymore.',
    name: 'Priya M.',
    role: 'Property Manager',
    units: 110,
  },
  {
    quote:
      "I can see every unit's status from one dashboard. Occupancy, payments, maintenance: everything in one place instead of chasing it down.",
    name: 'Carlos T.',
    role: 'Portfolio Manager',
    units: 230,
  },
]

// countTo: undefined = non-numeric stat, just fades in without counting
const STATS = [
  { display: '25',    countTo: 25, prefix: '',  suffix: '',   label: 'Beta spots available' },
  { display: 'Free',  countTo: 0,               label: 'To get started' },
  { display: '<24hr', countTo: 24, prefix: '<', suffix: 'hr', label: 'Support response' },
]

export function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      const cards = Array.from(
        sectionRef.current?.querySelectorAll<HTMLElement>('.testimonial-card') ?? []
      )
      const statItems = Array.from(
        sectionRef.current?.querySelectorAll<HTMLElement>('.stat-item') ?? []
      )
      const statValues = Array.from(
        sectionRef.current?.querySelectorAll<HTMLElement>('.stat-value') ?? []
      )

      gsap.set(headingRef.current, { y: 40 })
      gsap.set(cards, { y: 48 })
      gsap.set(statItems, { y: 32 })

      // Heading
      gsap.to(headingRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.65,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: headingRef.current,
          start: 'top 85%',
          once: true,
        },
      })

      // Testimonial cards — batch stagger
      ScrollTrigger.batch(cards, {
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            stagger: 0.12,
            duration: 0.65,
            ease: 'power2.out',
          }),
        start: 'top 88%',
      })

      // Stats row: fade items up, then count numeric values
      // Using onEnter so the counter runs at natural speed regardless of scroll.
      ScrollTrigger.create({
        trigger: statItems[0],
        start: 'top 88%',
        once: true,
        onEnter: () => {
          gsap.to(statItems, {
            opacity: 1,
            y: 0,
            stagger: 0.12,
            duration: 0.55,
            ease: 'power2.out',
          })

          statValues.forEach((el) => {
            const countTo = el.dataset.count ? parseInt(el.dataset.count) : 0
            if (!countTo) return

            const prefix = el.dataset.prefix ?? ''
            const suffix = el.dataset.suffix ?? ''
            const obj = { val: 0 }

            gsap.to(obj, {
              val: countTo,
              duration: 1.5,
              ease: 'power2.out',
              onUpdate() {
                el.textContent = `${prefix}${Math.round(obj.val)}${suffix}`
              },
            })
          })
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} style={{ backgroundColor: '#2E3132' }} className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16">

        <h2
          ref={headingRef}
          data-anim
          className="text-4xl md:text-5xl font-bold tracking-tight text-white text-center mb-14"
        >
          Trusted by property operators.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              data-anim
              className="testimonial-card bg-surface-container-low rounded-2xl p-6 flex flex-col gap-4 h-full"
            >
              <blockquote className="text-base text-on-surface italic leading-relaxed flex-1">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-on-surface">{t.name}</div>
                  <div className="text-xs text-on-surface-variant">{t.role}</div>
                </div>
                <span className="text-xs font-semibold text-on-primary-fixed bg-primary-fixed px-2 py-0.5 rounded-full">
                  {t.units} units
                </span>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center divide-y sm:divide-y-0 sm:divide-x divide-white/10">
          {STATS.map((stat) => (
            <div key={stat.label} data-anim className="stat-item px-10 py-5 text-center">
              <div
                className="stat-value text-4xl md:text-5xl font-extrabold text-white"
                data-count={stat.countTo || undefined}
                data-prefix={stat.prefix}
                data-suffix={stat.suffix}
              >
                {stat.display}
              </div>
              <div className="text-sm text-white/50 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

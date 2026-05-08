'use client'
import { useRef, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SectionHeader } from '../ui/section-header'

gsap.registerPlugin(ScrollTrigger)

const FEATURES = [
  {
    icon: 'home_work',
    name: 'Properties',
    description:
      'Track every unit across your portfolio. Occupancy rates, property details, and unit-level data, all in one place.',
  },
  {
    icon: 'people',
    name: 'Tenants',
    description:
      'Manage tenant profiles, contact info, lease history, and communication from a single view.',
  },
  {
    icon: 'description',
    name: 'Leases',
    description:
      'Monitor lease terms, expiration dates, and renewal status. Get ahead of vacancies before they happen.',
  },
  {
    icon: 'build',
    name: 'Maintenance',
    description:
      'Tenants submit requests. You assign vendors, track progress, and close jobs, fully end to end.',
  },
  {
    icon: 'payments',
    name: 'Payments',
    description:
      'Record rent, track balances, and log every transaction. Never lose track of who owes what.',
  },
  {
    icon: 'chat',
    name: 'Communication',
    description:
      'Manage conversations with tenants in one place. No more scattered emails and texts.',
  },
]

// Module-level tilt handlers — defined once, not re-allocated per render
function tiltCard(e: React.MouseEvent<HTMLDivElement>) {
  const el = e.currentTarget
  const r  = el.getBoundingClientRect()
  gsap.to(el, {
    rotateX: -((e.clientY - r.top  - r.height / 2) / r.height) * 10,
    rotateY:  ((e.clientX - r.left - r.width  / 2) / r.width)  * 10,
    transformPerspective: 800,
    duration: 0.3,
    ease: 'power1.out',
    overwrite: 'auto',
  })
}

function resetTilt(e: React.MouseEvent<HTMLDivElement>) {
  gsap.to(e.currentTarget, {
    rotateX: 0,
    rotateY: 0,
    duration: 0.55,
    ease: 'power2.out',
    overwrite: 'auto',
  })
}

export function FeatureOverview() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef  = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      const cards = Array.from(
        sectionRef.current?.querySelectorAll<HTMLElement>('.feature-card') ?? []
      )

      gsap.set(headerRef.current, { y: 32 })
      gsap.set(cards, { y: 44 })

      gsap.to(headerRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.65,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: headerRef.current,
          start: 'top 85%',
          once: true,
        },
      })

      // Batch fires the stagger only when cards actually enter the viewport,
      // grouping cards that enter together (desktop grid) vs individually (mobile stack).
      ScrollTrigger.batch(cards, {
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            stagger: 0.09,
            duration: 0.6,
            ease: 'power2.out',
          }),
        start: 'top 88%',
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="features" className="bg-surface py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16">
        <div ref={headerRef} data-anim>
          <SectionHeader
            label="Platform"
            heading="Everything your portfolio needs."
            subtext="Six core modules. One property management platform. No integrations, no workarounds."
            align="center"
            className="mb-14"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {FEATURES.map((feature) => (
            <div
              key={feature.name}
              data-anim
              className="feature-card bg-surface-container-lowest rounded-2xl border border-outline-variant/40 p-6 lg:p-8 h-full cursor-default"
              style={{ transformStyle: 'preserve-3d' }}
              onMouseMove={tiltCard}
              onMouseLeave={resetTilt}
            >
              <span
                className="material-symbols-outlined text-3xl text-primary mb-4 block"
                aria-hidden="true"
              >
                {feature.icon}
              </span>
              <h3 className="text-lg font-semibold text-on-surface mb-2">{feature.name}</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

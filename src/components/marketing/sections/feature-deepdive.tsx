'use client'
import { useRef, useLayoutEffect } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { cn } from '@/lib/utils'
import { SectionHeader } from '../ui/section-header'
import { MockupPanel } from '../ui/mockup-panel'

gsap.registerPlugin(ScrollTrigger)

interface FeatureDeepDiveProps {
  label: string
  heading: string
  body: string
  bullets: string[]
  imageSrc?: string
  imageAlt?: string
  side: 'left' | 'right'
  background: 'surface' | 'surface-container-low'
}

export function FeatureDeepDive({
  label,
  heading,
  body,
  bullets,
  imageSrc,
  imageAlt,
  side,
  background,
}: FeatureDeepDiveProps) {
  const bgClass   = background === 'surface' ? 'bg-surface' : 'bg-surface-container-low'
  const copyFirst = side === 'left'

  const sectionRef = useRef<HTMLElement>(null)
  const copyRef    = useRef<HTMLDivElement>(null)
  const mockupRef  = useRef<HTMLDivElement>(null)
  const bulletsRef = useRef<HTMLUListElement>(null)

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const copyX   = copyFirst ? -56 : 56
    const mockupX = copyFirst ? 56 : -56

    const ctx = gsap.context(() => {
      // gsap.set fires in the same frame as hydration (useLayoutEffect is
      // synchronous before repaint), so deep-dive sections are hidden before
      // the user has scrolled near them.
      const bulletEls = gsap.utils.toArray<HTMLElement>(
        bulletsRef.current?.querySelectorAll('li') ?? []
      )

      gsap.set(copyRef.current,   { x: copyX })
      gsap.set(mockupRef.current, { x: mockupX, scale: 1.02 })
      gsap.set(bulletEls,         { opacity: 0, x: -12 })

      // Paused timeline driven entirely by ScrollTrigger scrub — the animation
      // speed always matches the user's scroll speed, so it never feels rushed
      // or disconnected.
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })
        .to(copyRef.current,   { opacity: 1, x: 0, duration: 0.45 },                0)
        .to(mockupRef.current, { opacity: 1, x: 0, scale: 1, duration: 0.50 },      0.12)
        .to(bulletEls,         { opacity: 1, x: 0, duration: 0.28, stagger: 0.07 }, 0.30)

      // invalidateOnRefresh + the LenisProvider's rAF ScrollTrigger.refresh()
      // ensure all three sections' pinSpacing stacks correctly on every resize.
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top+=64',
        end: '+=380',
        pin: true,
        pinSpacing: true,
        scrub: 0.8,
        animation: tl,
        invalidateOnRefresh: true,
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [copyFirst])

  return (
    <section
      ref={sectionRef}
      className={cn(bgClass, 'py-20 lg:py-28 overflow-hidden')}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16">
        <div
          className={cn(
            'flex flex-col gap-12 lg:gap-16 lg:items-center',
            copyFirst ? 'lg:flex-row' : 'lg:flex-row-reverse'
          )}
        >
          <div ref={copyRef} data-anim className="flex-1">
            <div className="flex flex-col gap-6">
              <SectionHeader label={label} heading={heading} />
              <p className="text-base text-on-surface-variant leading-relaxed">{body}</p>
              <ul ref={bulletsRef} className="flex flex-col gap-2">
                {bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary text-base mt-0.5 flex-shrink-0" aria-hidden="true">
                      check_circle
                    </span>
                    {bullet}
                  </li>
                ))}
              </ul>
              <Link
                href="/#features"
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-all"
              >
                Learn more{' '}
                <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_forward</span>
              </Link>
            </div>
          </div>

          <div ref={mockupRef} data-anim className="flex-1">
            <MockupPanel imageSrc={imageSrc} imageAlt={imageAlt ?? heading} />
          </div>
        </div>
      </div>
    </section>
  )
}

'use client'
import { useState, useRef, useLayoutEffect, useEffect } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { cn } from '@/lib/utils'
import { SectionHeader } from '../ui/section-header'
import { HOMEPAGE_FAQ } from '@/lib/marketing/pricing'

gsap.registerPlugin(ScrollTrigger)

export function HomepageFAQ() {
  const [open, setOpen] = useState<number | null>(null)

  const sectionRef  = useRef<HTMLElement>(null)
  const headerRef   = useRef<HTMLDivElement>(null)
  const footerRef   = useRef<HTMLParagraphElement>(null)
  const contentRefs = useRef<(HTMLDivElement | null)[]>([])

  // Collapse all answer panels and set up scroll-triggered row entrance
  useLayoutEffect(() => {
    // Always collapse panels — the useEffect below handles open/close.
    // This runs before paint so there's no visible "all answers open" flash.
    contentRefs.current.forEach((el) => {
      if (el) gsap.set(el, { height: 0, overflow: 'hidden' })
    })

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      const rows = Array.from(
        sectionRef.current?.querySelectorAll<HTMLElement>('.faq-row') ?? []
      )

      gsap.set(headerRef.current, { y: 32 })
      gsap.set(rows, { y: 20 })
      gsap.set(footerRef.current, { y: 16 })

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

      ScrollTrigger.batch(rows, {
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            stagger: 0.07,
            duration: 0.5,
            ease: 'power2.out',
          }),
        start: 'top 88%',
      })

      gsap.to(footerRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top 92%',
          once: true,
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  // Smooth height animation when a panel opens or closes
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    contentRefs.current.forEach((el, i) => {
      if (!el) return
      const isOpen = i === open

      if (prefersReduced) {
        gsap.set(el, { height: isOpen ? 'auto' : 0 })
      } else {
        gsap.to(el, {
          height: isOpen ? 'auto' : 0,
          duration: isOpen ? 0.38 : 0.28,
          ease: isOpen ? 'power2.out' : 'power2.in',
          overwrite: true,
        })
      }
    })
  }, [open])

  return (
    <section ref={sectionRef} className="bg-surface py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16">

        <div ref={headerRef} data-anim>
          <SectionHeader
            heading="Frequently asked questions"
            subtext="Everything you need to know before joining."
            align="center"
            className="mb-12"
          />
        </div>

        <div className="max-w-3xl mx-auto">
          {HOMEPAGE_FAQ.map((item, i) => (
            <div key={i} data-anim className="faq-row border-b border-outline-variant/40">
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
                className="w-full flex items-center justify-between py-5 text-left gap-4 group"
              >
                <span
                  className={cn(
                    'font-headline font-semibold text-lg transition-colors',
                    open === i ? 'text-primary' : 'text-on-surface'
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

              {/* Always in DOM — GSAP controls height so content clips cleanly */}
              <div ref={(el) => { contentRefs.current[i] = el }}>
                <div className="pb-5 text-base text-on-surface-variant leading-relaxed">
                  {item.a}
                </div>
              </div>
            </div>
          ))}
        </div>

        <p ref={footerRef} data-anim className="text-center text-on-surface-variant text-sm mt-10">
          More questions?{' '}
          <a href="mailto:hello@leasarr.com" className="text-primary font-semibold hover:underline">
            Email us
          </a>{' '}
          or check the{' '}
          <Link href="/pricing#faq" className="text-primary font-semibold hover:underline">
            full FAQ on the pricing page
          </Link>
          .
        </p>

      </div>
    </section>
  )
}

'use client'
import { useRef, useLayoutEffect } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function magnetMove(e: React.MouseEvent<HTMLAnchorElement>) {
  const el = e.currentTarget
  const r  = el.getBoundingClientRect()
  gsap.to(el, {
    x: (e.clientX - r.left - r.width  / 2) * 0.35,
    y: (e.clientY - r.top  - r.height / 2) * 0.35,
    duration: 0.3,
    ease: 'power2.out',
    overwrite: 'auto',
  })
}

function magnetLeave(e: React.MouseEvent<HTMLAnchorElement>) {
  gsap.to(e.currentTarget, {
    x: 0,
    y: 0,
    duration: 0.6,
    ease: 'elastic.out(1, 0.4)',
    overwrite: 'auto',
  })
}

export function FinalCTA() {
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const subtextRef = useRef<HTMLParagraphElement>(null)
  const ctasRef    = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      gsap.set(headingRef.current, { y: 40 })
      gsap.set(subtextRef.current, { y: 24 })
      gsap.set(ctasRef.current,    { y: 20 })

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          once: true,
        },
      })

      tl.to(headingRef.current, { opacity: 1, y: 0, duration: 0.65 })
        .to(subtextRef.current, { opacity: 1, y: 0, duration: 0.55 }, '-=0.35')
        .to(ctasRef.current,    { opacity: 1, y: 0, duration: 0.50 }, '-=0.30')
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="py-20 lg:py-28"
      style={{ background: 'linear-gradient(135deg, #001E5A 0%, #003D9B 100%)' }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16 text-center">

        <h2 ref={headingRef} data-anim className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
          Ready to run your portfolio smarter?
        </h2>

        <p ref={subtextRef} data-anim className="text-lg text-white/70 mb-10 max-w-xl mx-auto">
          We're onboarding our first 25 property managers. Join the waitlist for early access.
        </p>

        <div ref={ctasRef} data-anim className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/waitlist"
            className="px-7 py-3.5 rounded-lg bg-white text-[#003D9B] font-semibold text-base hover:bg-white/90 transition-colors duration-200 shadow-lg"
            onMouseMove={magnetMove}
            onMouseLeave={magnetLeave}
          >
            Join the waitlist →
          </Link>
          <a
            href="mailto:hello@leasarr.com"
            className="px-7 py-3.5 rounded-lg border border-white/30 text-white font-semibold text-base hover:bg-white/10 transition-all duration-200"
          >
            Talk to us
          </a>
        </div>

      </div>
    </section>
  )
}

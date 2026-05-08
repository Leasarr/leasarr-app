'use client'
import { useRef, useLayoutEffect } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MockupPanel } from '../ui/mockup-panel'

gsap.registerPlugin(ScrollTrigger)

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const pillRef    = useRef<HTMLSpanElement>(null)
  const line1Ref   = useRef<HTMLSpanElement>(null)
  const line2Ref   = useRef<HTMLSpanElement>(null)
  const subtextRef = useRef<HTMLParagraphElement>(null)
  const ctasRef    = useRef<HTMLDivElement>(null)
  const mockupRef  = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    // useLayoutEffect fires synchronously before the browser repaints after
    // hydration. gsap.set() here hides elements in the same frame as hydration,
    // so there is no visible flash — the SSR HTML shows content until JS is ready,
    // then GSAP takes over without a perceptible gap.

    const allEls = [pillRef.current, line1Ref.current, line2Ref.current,
                    subtextRef.current, ctasRef.current, mockupRef.current]

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      gsap.set(pillRef.current,    { y: 16 })
      gsap.set([line1Ref.current, line2Ref.current], { y: 48 })
      gsap.set(subtextRef.current, { y: 28 })
      gsap.set(ctasRef.current,    { y: 20 })
      gsap.set(mockupRef.current,  { y: 44, scale: 1.04 })

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.1 })

      tl.to(pillRef.current,    { opacity: 1, y: 0, duration: 0.55 })
        .to(line1Ref.current,   { opacity: 1, y: 0, duration: 0.72 }, '-=0.30')
        .to(line2Ref.current,   { opacity: 1, y: 0, duration: 0.72 }, '-=0.58')
        .to(subtextRef.current, { opacity: 1, y: 0, duration: 0.60 }, '-=0.40')
        .to(ctasRef.current,    { opacity: 1, y: 0, duration: 0.50 }, '-=0.34')
        .to(mockupRef.current,  { opacity: 1, y: 0, scale: 1, duration: 0.85, ease: 'power2.out' }, '-=0.30')

      gsap.to(mockupRef.current, {
        y: -72,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.5,
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col justify-center overflow-x-hidden pt-16"
      style={{ background: 'linear-gradient(135deg, #001E5A 0%, #003D9B 100%)' }}
    >
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 md:px-10 lg:px-16 py-20 lg:py-28">
        <div className="flex flex-col items-center text-center gap-8 lg:gap-10">

          <span
            ref={pillRef}
            data-anim
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-white/10 text-white border border-white/20"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Private beta · 25 spots available
          </span>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.05] max-w-4xl">
            <span ref={line1Ref} data-anim className="block">Your portfolio,</span>
            <span ref={line2Ref} data-anim className="block text-white/90">running like a business.</span>
          </h1>

          <p ref={subtextRef} data-anim className="text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed">
            Leasarr is property management software that brings properties, tenants, leases, maintenance, and payments into one unified platform. Built for landlords and property managers who operate at scale.
          </p>

          <div ref={ctasRef} data-anim className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/waitlist"
              className="px-6 py-3 rounded-lg bg-white text-[#003D9B] font-semibold text-base hover:bg-white/90 hover:scale-[1.02] transition-all duration-200 shadow-lg"
            >
              Request early access →
            </Link>
            <Link
              href="/#features"
              className="px-6 py-3 rounded-lg border border-white/30 text-white font-semibold text-base hover:bg-white/10 transition-all duration-200"
            >
              See how it works
            </Link>
          </div>

          <div ref={mockupRef} data-anim className="w-full max-w-5xl mt-4 relative">
            <MockupPanel
              imageSrc="/mockups/dashboard.png"
              imageAlt="Leasarr dashboard overview"
              priority
              className="w-full"
            />
            <div className="absolute -bottom-4 -right-4 w-2/5 hidden lg:block">
              <MockupPanel
                imageSrc="/mockups/properties.png"
                imageAlt="Property detail panel"
                className="w-full"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

'use client'
import { useRef, useEffect } from 'react'
import gsap from 'gsap'

const ITEMS = [
  { value: '25 spots', label: 'Private beta access', icon: 'rocket_launch' },
  { value: 'Free trial', label: 'No credit card needed', icon: 'credit_card_off' },
  { value: '<24 hr', label: 'Support response time', icon: 'support_agent' },
  { value: 'All-in-one', label: 'Properties · Leases · Payments', icon: 'dashboard' },
  { value: 'Real-time', label: 'Live updates for your team', icon: 'bolt' },
  { value: 'Secure', label: 'Bank-grade data protection', icon: 'lock' },
]

export function ProofBar() {
  const trackRef = useRef<HTMLDivElement>(null)
  const tweenRef = useRef<gsap.core.Tween | null>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!trackRef.current) return

    tweenRef.current = gsap.to(trackRef.current, {
      xPercent: -50,
      duration: 28,
      ease: 'none',
      repeat: -1,
    })

    return () => { tweenRef.current?.kill() }
  }, [])

  const items = [...ITEMS, ...ITEMS]

  return (
    <section
      className="bg-surface-container-low border-y border-outline-variant/30 py-5 overflow-hidden"
      onMouseEnter={() => tweenRef.current?.pause()}
      onMouseLeave={() => tweenRef.current?.resume()}
    >
      <div
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
        }}
      >
        <div ref={trackRef} className="flex items-center w-max">
          {items.map((item, i) => (
            <div key={i} className="flex items-center flex-shrink-0">
              <div className="flex items-center gap-2 px-8 lg:px-10">
                <span className="material-symbols-outlined text-[17px] text-primary leading-none">{item.icon}</span>
                <span className="text-sm font-bold text-on-surface whitespace-nowrap">{item.value}</span>
                <span className="text-sm text-on-surface-variant whitespace-nowrap">{item.label}</span>
              </div>
              <span className="w-1 h-1 rounded-full bg-outline-variant/60 flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

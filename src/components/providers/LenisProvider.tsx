'use client'
import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })

    function rafHandler(time: number) {
      lenis.raf(time * 1000)
    }

    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add(rafHandler)
    gsap.ticker.lagSmoothing(0)

    // After all components' useLayoutEffect have run and created their ScrollTriggers,
    // refresh so pin spacers from sequential sections don't corrupt each other's positions.
    requestAnimationFrame(() => ScrollTrigger.refresh())

    return () => {
      lenis.destroy()
      gsap.ticker.remove(rafHandler)
    }
  }, [])

  return <>{children}</>
}

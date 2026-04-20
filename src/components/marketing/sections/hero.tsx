import Link from 'next/link'
import { MockupPanel } from '../ui/mockup-panel'

export function Hero() {
  return (
    <section
      className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-16"
      style={{ background: 'linear-gradient(135deg, #001E5A 0%, #003D9B 100%)' }}
    >
      {/* Dot grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 md:px-10 lg:px-16 py-20 lg:py-28">
        <div className="flex flex-col items-center text-center gap-8 lg:gap-10">
          {/* Label pill */}
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-white/10 text-white border border-white/20">
            Property Management Platform
          </span>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.05] max-w-4xl">
            Your portfolio,{' '}
            <span className="text-white/90">running like a business.</span>
          </h1>

          {/* Subtext */}
          <p className="text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed">
            Leasarr brings properties, tenants, leases, maintenance, and payments into one unified platform. Built for operators who manage at scale.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/auth/register"
              className="px-6 py-3 rounded-lg bg-white text-[#003D9B] font-semibold text-base hover:bg-white/90 hover:scale-[1.02] transition-all duration-200 shadow-lg"
            >
              Start free — no card needed
            </Link>
            <Link
              href="/#features"
              className="px-6 py-3 rounded-lg border border-white/30 text-white font-semibold text-base hover:bg-white/10 transition-all duration-200"
            >
              See how it works →
            </Link>
          </div>

          {/* Composite mockup */}
          <div className="w-full max-w-5xl mt-4 relative">
            <MockupPanel
              imageAlt="Leasarr dashboard overview"
              className="w-full"
            />
            {/* Overlapping detail panel */}
            <div className="absolute -bottom-4 -right-4 w-2/5 hidden lg:block">
              <MockupPanel
                imageAlt="Property detail"
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

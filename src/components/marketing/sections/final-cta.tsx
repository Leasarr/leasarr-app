import Link from 'next/link'
import { FadeIn } from '../ui/fade-in'

export function FinalCTA() {
  return (
    <section
      className="py-20 lg:py-28"
      style={{ background: 'linear-gradient(135deg, #001E5A 0%, #003D9B 100%)' }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16 text-center">
        <FadeIn>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Ready to run your portfolio smarter?
          </h2>
          <p className="text-lg text-white/70 mb-10 max-w-xl mx-auto">
            Free to start. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="px-7 py-3.5 rounded-lg bg-white text-[#003D9B] font-semibold text-base hover:bg-white/90 hover:scale-[1.02] transition-all duration-200 shadow-lg"
            >
              Start free →
            </Link>
            <a
              href="mailto:hello@leasarr.com"
              className="px-7 py-3.5 rounded-lg border border-white/30 text-white font-semibold text-base hover:bg-white/10 transition-all duration-200"
            >
              Talk to us
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

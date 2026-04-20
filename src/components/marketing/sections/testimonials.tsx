import { FadeIn } from '../ui/fade-in'

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
      "I can see every unit's status from one dashboard. My owners stopped asking for manual reports because they trust the numbers.",
    name: 'Carlos T.',
    role: 'Portfolio Manager',
    units: 230,
  },
]

const STATS = [
  { value: '500+', label: 'Early adopters' },
  { value: 'Free', label: 'To get started' },
  { value: '<24hr', label: 'Support response' },
]

export function Testimonials() {
  return (
    <section style={{ backgroundColor: '#2E3132' }} className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16">
        <FadeIn>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white text-center mb-14">
            Trusted by property operators.
          </h2>
        </FadeIn>

        {/* Testimonial cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {TESTIMONIALS.map((t, i) => (
            <FadeIn key={t.name} delay={i * 80}>
              <div className="bg-surface-container-low rounded-2xl p-6 flex flex-col gap-4 h-full">
                <p className="text-base text-on-surface italic leading-relaxed flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-on-surface">{t.name}</div>
                    <div className="text-xs text-on-surface-variant">{t.role}</div>
                  </div>
                  <span className="text-xs font-semibold text-primary bg-primary-fixed px-2 py-0.5 rounded-full">
                    {t.units} units
                  </span>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Stats row */}
        <FadeIn>
          <div className="flex flex-col sm:flex-row items-center justify-center divide-y sm:divide-y-0 sm:divide-x divide-white/10">
            {STATS.map((stat) => (
              <div key={stat.label} className="px-10 py-5 text-center">
                <div className="text-4xl md:text-5xl font-extrabold text-white">{stat.value}</div>
                <div className="text-sm text-white/50 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

import { SectionHeader } from '../ui/section-header'
import { FadeIn } from '../ui/fade-in'

const FEATURES = [
  {
    icon: 'home_work',
    name: 'Properties',
    description:
      'Track every unit across your portfolio. Occupancy rates, property details, and unit-level data — all in one place.',
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
      'Tenants submit requests. You assign vendors, track progress, and close jobs — fully end to end.',
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

export function FeatureOverview() {
  return (
    <section id="features" className="bg-surface py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16">
        <FadeIn>
          <SectionHeader
            label="Platform"
            heading="Everything your portfolio needs."
            subtext="Six core modules, one unified platform. No integrations, no workarounds."
            align="center"
            className="mb-14"
          />
        </FadeIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {FEATURES.map((feature, i) => (
            <FadeIn key={feature.name} delay={i * 80}>
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 p-6 lg:p-8 hover:-translate-y-1 transition-all duration-200 hover:shadow-lg h-full">
                <span className="material-symbols-outlined text-3xl text-primary mb-4 block">
                  {feature.icon}
                </span>
                <h3 className="text-lg font-semibold text-on-surface mb-2">{feature.name}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{feature.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

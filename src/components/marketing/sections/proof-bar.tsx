const METRICS = [
  { value: 'Early access', label: 'Join the first wave' },
  { value: 'Free', label: 'No credit card required' },
  { value: '<24hr', label: 'Support response time' },
]

export function ProofBar() {
  return (
    <section className="bg-surface-container-low border-y border-outline-variant/30 py-5">
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <p className="text-sm font-medium text-on-surface-variant text-center lg:text-left">
            Be among the first 500 property managers running on Leasarr.
          </p>
          <div className="flex items-center gap-8 lg:gap-12">
            {METRICS.map((metric, i) => (
              <div key={i} className="text-center">
                <div className="text-lg font-extrabold text-on-surface">{metric.value}</div>
                <div className="text-xs text-on-surface-variant mt-0.5">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

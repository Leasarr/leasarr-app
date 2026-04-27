export function PricingIntro() {
  return (
    <section
      className="relative overflow-hidden pt-32 pb-16 lg:pt-40 lg:pb-20"
      style={{ background: 'linear-gradient(135deg, #001E5A 0%, #003D9B 100%)' }}
    >
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <div className="relative max-w-7xl mx-auto px-6 md:px-10 lg:px-16 flex flex-col items-center text-center gap-6">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-white/10 text-white border border-white/20">
          Pricing
        </span>
        <h1 className="font-headline font-extrabold text-5xl lg:text-6xl tracking-tight text-white max-w-3xl leading-tight">
          Simple pricing that scales with your portfolio.
        </h1>
        <p className="font-body text-lg lg:text-xl text-white/70 max-w-2xl">
          Start with a 30-day Growth trial. No credit card.
        </p>
      </div>
    </section>
  )
}

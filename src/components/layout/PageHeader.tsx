export function PageHeader({ title, eyebrow, subtitle, action }: {
  title: string
  eyebrow?: string
  subtitle?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        {eyebrow && <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-1">{eyebrow}</p>}
        <h1 className="text-2xl md:text-3xl font-headline font-extrabold text-on-surface tracking-tight">{title}</h1>
        {subtitle && <p className="text-on-surface-variant font-medium text-sm mt-1">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}

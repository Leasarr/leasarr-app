import { cn } from '@/lib/utils'

interface StatCardProps {
  icon: string
  iconColor?: string
  label: string
  value: React.ReactNode
  valueColor?: string
  badge?: React.ReactNode
  subtitle?: string
  progress?: { value: number | string; color?: string }
  className?: string
}

export function StatCard({
  icon,
  iconColor = 'text-on-surface-variant',
  label,
  value,
  valueColor = 'text-on-surface',
  badge,
  subtitle,
  progress,
  className,
}: StatCardProps) {
  return (
    <div className={cn('bg-surface-container-lowest rounded-xl p-6 shadow-card hover:shadow-md transition-all', className)}>
      <div className="flex items-center justify-between mb-4">
        <span className={cn('material-symbols-outlined text-2xl', iconColor)}>{icon}</span>
        {badge}
      </div>
      <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1">{label}</p>
      <p className={cn('text-2xl font-headline font-bold', valueColor)}>{value}</p>
      {subtitle && <p className="mt-2 text-[10px] text-on-surface-variant">{subtitle}</p>}
      {progress !== undefined && (
        <div className="mt-4 h-1 w-full bg-surface-container-high rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full', progress.color ?? 'bg-primary')}
            style={{ width: typeof progress.value === 'number' ? `${progress.value}%` : progress.value }}
          />
        </div>
      )}
    </div>
  )
}

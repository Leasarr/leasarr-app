import { cn } from '@/lib/utils'

const sizeStyles = {
  page:   'min-h-[60vh]',
  panel:  'min-h-[40vh]',
  inline: 'py-12',
}

export function EmptyState({ icon, title, description, action, size = 'panel', className }: {
  icon: string
  title: string
  description?: string
  action?: React.ReactNode
  size?: 'page' | 'panel' | 'inline'
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center text-on-surface-variant', sizeStyles[size], className)}>
      <span className="material-symbols-outlined text-4xl mb-3 block text-outline">{icon}</span>
      <p className="font-bold text-on-surface text-lg">{title}</p>
      {description && <p className="text-sm mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

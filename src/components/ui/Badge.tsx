import { cn } from '@/lib/utils'

type BadgeVariant = 'primary' | 'secondary' | 'tertiary' | 'neutral' | 'success' | 'warning' | 'error'

const variantStyles: Record<BadgeVariant, string> = {
  primary:   'bg-primary-fixed text-on-primary-fixed',
  secondary: 'bg-secondary-container text-on-secondary-container',
  tertiary:  'bg-tertiary-container/20 text-on-tertiary-fixed-variant',
  neutral:   'bg-surface-container text-on-surface-variant',
  success:   'bg-success-container text-on-success-container',
  warning:   'bg-warning-container text-on-warning-container',
  error:     'bg-error-container text-on-error-container',
}

export function Badge({ variant, className, children }: {
  variant?: BadgeVariant
  className?: string
  children: React.ReactNode
}) {
  return (
    <span className={cn('badge', variant && variantStyles[variant], className)}>
      {children}
    </span>
  )
}

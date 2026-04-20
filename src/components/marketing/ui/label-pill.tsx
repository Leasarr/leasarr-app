import { cn } from '@/lib/utils'

interface LabelPillProps {
  children: React.ReactNode
  className?: string
}

export function LabelPill({ children, className }: LabelPillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full',
        'text-xs font-semibold tracking-wide uppercase',
        'text-primary bg-primary-fixed',
        className
      )}
    >
      {children}
    </span>
  )
}

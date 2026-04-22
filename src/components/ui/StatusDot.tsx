import { cn } from '@/lib/utils'

const STATUS_CLASSES: Record<'occupied' | 'vacant' | 'maintenance', string> = {
  occupied: 'bg-success',
  maintenance: 'bg-warning',
  vacant: 'bg-outline',
}

export function StatusDot({
  status,
  className,
}: {
  status: 'occupied' | 'vacant' | 'maintenance'
  className?: string
}) {
  return (
    <span
      className={cn('inline-block w-1.5 h-1.5 rounded-full flex-shrink-0', STATUS_CLASSES[status], className)}
    />
  )
}

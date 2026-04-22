import { cn } from '@/lib/utils'

export function LoadingState({ label, size = 'page' }: {
  label?: string
  size?: 'page' | 'panel'
}) {
  return (
    <div className={cn('flex items-center justify-center', size === 'page' ? 'min-h-[60vh]' : 'min-h-[40vh]')}>
      <div className="text-center">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin block">progress_activity</span>
        {label && <p className="text-on-surface-variant mt-2">{label}</p>}
      </div>
    </div>
  )
}

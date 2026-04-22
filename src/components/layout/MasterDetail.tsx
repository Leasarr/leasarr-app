import { cn } from '@/lib/utils'

interface MasterDetailProps {
  list: React.ReactNode
  detail?: React.ReactNode
  mobileBackLabel?: string
  onBack?: () => void
  align?: 'start' | 'stretch'
  className?: string
}

export function MasterDetail({ list, detail, mobileBackLabel, onBack, align = 'stretch', className }: MasterDetailProps) {
  const hideList = mobileBackLabel && detail
  return (
    <div className={cn('grid grid-cols-1 lg:grid-cols-12 gap-8', align === 'start' && 'items-start', className)}>
      <div className={cn('lg:col-span-5', hideList && 'hidden lg:block')}>
        {list}
      </div>
      {detail && (
        <div className="lg:col-span-7">
          {mobileBackLabel && (
            <button
              className="lg:hidden flex items-center gap-1.5 text-primary text-sm font-semibold mb-2"
              onClick={onBack}
            >
              <span className="material-symbols-outlined text-base">arrow_back</span> {mobileBackLabel}
            </button>
          )}
          {detail}
        </div>
      )}
    </div>
  )
}

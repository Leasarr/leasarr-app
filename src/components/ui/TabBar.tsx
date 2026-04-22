'use client'

import { cn } from '@/lib/utils'

type Tab = { key: string; label: string; count?: number }

const GRID_COLS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
}

export function TabBar({
  tabs,
  value,
  onChange,
  className,
}: {
  tabs: Tab[]
  value: string
  onChange: (v: string) => void
  className?: string
}) {
  return (
    <div className={cn('grid border-b border-outline-variant/30', GRID_COLS[tabs.length], className)}>
      {tabs.map(tab => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={cn(
            'py-3 text-sm font-bold transition-all border-b-2 -mb-px flex items-center justify-center gap-1.5 whitespace-nowrap',
            value === tab.key
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={cn(
              'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
              value === tab.key
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-high text-on-surface-variant'
            )}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

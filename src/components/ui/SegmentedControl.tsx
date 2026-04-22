'use client'

import { cn } from '@/lib/utils'

type Option = { key: string; label: string; icon?: string }

export function SegmentedControl({
  options,
  value,
  onChange,
  className,
}: {
  options: Option[]
  value: string
  onChange: (v: string) => void
  className?: string
}) {
  return (
    <div className={cn('flex gap-1 bg-surface-container-low p-1 rounded-xl', className)}>
      {options.map(opt => (
        <button
          key={opt.key}
          type="button"
          onClick={() => onChange(opt.key)}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap',
            value === opt.key
              ? 'bg-surface-container-lowest text-primary shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
          )}
        >
          {opt.icon && <span className="material-symbols-outlined text-base">{opt.icon}</span>}
          {opt.label}
        </button>
      ))}
    </div>
  )
}

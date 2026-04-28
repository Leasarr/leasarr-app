import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface TooltipProps {
  content: ReactNode
  children: ReactNode
  side?: 'top' | 'bottom'
  className?: string
  /** Disable the tooltip without unmounting children. */
  disabled?: boolean
}

/**
 * CSS-only tooltip. Wraps a single trigger; renders a hint bubble on hover/focus-within.
 * Trigger must be focusable (button, link, input). For disabled buttons, wrap in a span
 * so the disabled element doesn't swallow pointer events on some browsers — but our
 * disabled buttons keep `pointer-events-none`, which means the tooltip's `:hover` fires
 * on the wrapper here.
 */
export function Tooltip({ content, children, side = 'top', className, disabled = false }: TooltipProps) {
  if (disabled) return <>{children}</>

  return (
    <span className={cn('relative inline-flex group/tooltip', className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute left-1/2 -translate-x-1/2 z-50',
          'whitespace-nowrap rounded-lg bg-inverse-surface text-inverse-on-surface',
          'px-2.5 py-1.5 text-xs font-medium shadow-modal',
          'opacity-0 transition-opacity duration-150',
          'group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100',
          side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
        )}
      >
        {content}
      </span>
    </span>
  )
}

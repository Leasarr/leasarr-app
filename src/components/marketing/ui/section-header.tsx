import { cn } from '@/lib/utils'
import { LabelPill } from './label-pill'

interface SectionHeaderProps {
  label?: string
  heading: string
  subtext?: string
  align?: 'left' | 'center'
  dark?: boolean
  className?: string
}

export function SectionHeader({
  label,
  heading,
  subtext,
  align = 'left',
  dark = false,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        align === 'center' && 'items-center text-center',
        className
      )}
    >
      {label && <LabelPill className={align === 'center' ? 'self-center' : undefined}>{label}</LabelPill>}
      <h2
        className={cn(
          'font-bold tracking-tight text-4xl md:text-[2.75rem] lg:text-5xl leading-tight',
          dark ? 'text-white' : 'text-on-surface'
        )}
      >
        {heading}
      </h2>
      {subtext && (
        <p
          className={cn(
            'text-lg md:text-xl leading-relaxed max-w-2xl',
            dark ? 'text-white/70' : 'text-on-surface-variant'
          )}
        >
          {subtext}
        </p>
      )}
    </div>
  )
}

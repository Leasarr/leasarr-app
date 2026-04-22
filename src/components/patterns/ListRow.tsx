import { cn } from '@/lib/utils'

interface ListRowProps {
  avatar: React.ReactNode
  title: string
  subtitle?: string
  meta?: React.ReactNode
  titleBadges?: React.ReactNode
  trailing?: React.ReactNode
  selected?: boolean
  onClick?: () => void
  padding?: 'sm' | 'md'
  className?: string
}

export function ListRow({ avatar, title, subtitle, meta, titleBadges, trailing, selected, onClick, padding = 'md', className }: ListRowProps) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      onClick={onClick}
      className={cn(
        'w-full bg-surface-container-lowest rounded-2xl flex items-center justify-between hover:shadow-card transition-all text-left',
        padding === 'sm' ? 'px-4 py-4' : 'p-5',
        selected && 'ring-2 ring-primary/20 shadow-md',
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex-shrink-0">{avatar}</div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
            <p className="font-bold text-sm text-on-surface">{title}</p>
            {titleBadges}
          </div>
          {subtitle && <p className="text-xs text-on-surface-variant">{subtitle}</p>}
          {meta}
        </div>
      </div>
      {trailing && <div className="flex-shrink-0 ml-2">{trailing}</div>}
    </Tag>
  )
}

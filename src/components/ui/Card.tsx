import { cn } from '@/lib/utils'

interface CardProps {
  padding?: 'sm' | 'md' | 'lg'
  radius?: 'sm' | 'md'
  surface?: 'lowest' | 'low'
  shadow?: boolean
  className?: string
  children: React.ReactNode
}

const paddingMap = { sm: 'p-4', md: 'p-6', lg: 'p-8' }
const radiusMap = { sm: 'rounded-xl', md: 'rounded-2xl' }
const surfaceMap = { lowest: 'bg-surface-container-lowest', low: 'bg-surface-container-low' }

export function Card({ padding = 'md', radius = 'sm', surface = 'lowest', shadow = true, className, children }: CardProps) {
  return (
    <div className={cn(surfaceMap[surface], radiusMap[radius], paddingMap[padding], shadow && 'shadow-card', className)}>
      {children}
    </div>
  )
}

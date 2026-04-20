import Image from 'next/image'
import { cn } from '@/lib/utils'

interface MockupPanelProps {
  imageSrc?: string
  imageAlt?: string
  width?: number
  height?: number
  className?: string
}

export function MockupPanel({
  imageSrc,
  imageAlt = 'Product screenshot',
  width = 1200,
  height = 750,
  className,
}: MockupPanelProps) {
  return (
    <div
      className={cn(
        'rounded-2xl overflow-hidden border border-outline-variant/30 shadow-2xl',
        className
      )}
    >
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={imageAlt}
          width={width}
          height={height}
          className="w-full h-auto"
        />
      ) : (
        <div className="w-full aspect-video bg-surface-container flex items-center justify-center">
          <div className="text-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">
              screenshot_monitor
            </span>
            <p className="text-sm text-on-surface-variant/40 mt-2">Screenshot coming soon</p>
          </div>
        </div>
      )}
    </div>
  )
}

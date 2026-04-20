import Link from 'next/link'
import { cn } from '@/lib/utils'
import { SectionHeader } from '../ui/section-header'
import { MockupPanel } from '../ui/mockup-panel'
import { FadeIn } from '../ui/fade-in'

interface FeatureDeepDiveProps {
  label: string
  heading: string
  body: string
  bullets: string[]
  imageSrc?: string
  imageAlt?: string
  side: 'left' | 'right'
  background: 'surface' | 'surface-container-low'
}

export function FeatureDeepDive({
  label,
  heading,
  body,
  bullets,
  imageSrc,
  imageAlt,
  side,
  background,
}: FeatureDeepDiveProps) {
  const bgClass = background === 'surface' ? 'bg-surface' : 'bg-surface-container-low'
  const copyFirst = side === 'left'

  return (
    <section className={cn(bgClass, 'py-20 lg:py-28')}>
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16">
        <div
          className={cn(
            'flex flex-col gap-12 lg:gap-16 lg:items-center',
            copyFirst ? 'lg:flex-row' : 'lg:flex-row-reverse'
          )}
        >
          {/* Copy */}
          <FadeIn className="flex-1">
            <div className="flex flex-col gap-6">
              <SectionHeader label={label} heading={heading} />
              <p className="text-base text-on-surface-variant leading-relaxed">{body}</p>
              <ul className="flex flex-col gap-2">
                {bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2 text-sm text-on-surface-variant">
                    <span className="material-symbols-rounded text-primary text-base mt-0.5 flex-shrink-0">
                      check_circle
                    </span>
                    {bullet}
                  </li>
                ))}
              </ul>
              <Link
                href="/#features"
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-all"
              >
                Learn more{' '}
                <span className="material-symbols-rounded text-base">arrow_forward</span>
              </Link>
            </div>
          </FadeIn>

          {/* Mockup */}
          <FadeIn delay={100} className="flex-1">
            <MockupPanel imageSrc={imageSrc} imageAlt={imageAlt ?? heading} />
          </FadeIn>
        </div>
      </div>
    </section>
  )
}

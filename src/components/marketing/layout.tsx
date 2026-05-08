import { Nav } from './nav'
import { Footer } from './footer'
import { LenisProvider } from '@/components/providers/LenisProvider'

interface MarketingLayoutProps {
  children: React.ReactNode
}

export function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <LenisProvider>
      <div className="min-h-screen bg-surface">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-surface focus:text-primary focus:rounded-lg focus:font-semibold focus:shadow-modal"
        >
          Skip to main content
        </a>
        <Nav />
        <main id="main-content">{children}</main>
        <Footer />
      </div>
    </LenisProvider>
  )
}

import { Nav } from './nav'
import { Footer } from './footer'

interface MarketingLayoutProps {
  children: React.ReactNode
}

export function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="min-h-screen bg-surface">
      <Nav />
      <main>{children}</main>
      <Footer />
    </div>
  )
}

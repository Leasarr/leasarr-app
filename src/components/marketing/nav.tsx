'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useAuth } from '@/context/AuthContext'
import { useTheme, type Theme } from '@/context/ThemeContext'
import { cn } from '@/lib/utils'

const THEME_OPTIONS: { value: Theme; icon: string; label: string }[] = [
  { value: 'light', icon: 'light_mode', label: 'Light' },
  { value: 'dark', icon: 'dark_mode', label: 'Dark' },
  { value: 'system', icon: 'brightness_auto', label: 'System' },
]

const FEATURES_ITEMS = [
  { name: 'Properties', href: '/#features', description: 'Manage your entire portfolio in one place' },
  { name: 'Tenants & Leases', href: '/#features', description: 'Track leases, renewals, and tenant records' },
  { name: 'Maintenance', href: '/#features', description: 'From request to resolved, end to end' },
  { name: 'Payments', href: '/#features', description: 'Collect rent and track every dollar' },
  { name: 'Tenant Portal', href: '/#features', description: 'Self-service access for your tenants' },
]

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [featuresOpen, setFeaturesOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, profile } = useAuth()
  const { theme, setTheme } = useTheme()

  const dashboardHref = profile?.role === 'tenant' ? '/portal' : '/dashboard'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinkClass = cn(
    'text-sm font-medium transition-colors',
    scrolled ? 'text-on-surface-variant hover:text-on-surface' : 'text-white/80 hover:text-white'
  )

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-150',
          scrolled
            ? 'bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/30'
            : 'bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16">
          <div className="flex items-center justify-between h-16">
            {/* Wordmark */}
            <Link
              href="/"
              className={cn(
                'font-extrabold text-xl tracking-tight transition-colors',
                scrolled ? 'text-on-surface' : 'text-white'
              )}
            >
              Leasarr
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-8">
              <div
                className="relative"
                onMouseEnter={() => setFeaturesOpen(true)}
                onMouseLeave={() => setFeaturesOpen(false)}
              >
                <button className={cn(navLinkClass, 'flex items-center gap-0.5')}>
                  Features
                  <span className="material-symbols-outlined text-[18px] leading-none">expand_more</span>
                </button>
                {featuresOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 w-72">
                    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-lg overflow-hidden">
                      {FEATURES_ITEMS.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="block px-4 py-3 hover:bg-surface-container-low group transition-colors"
                        >
                          <div className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">
                            {item.name}
                          </div>
                          <div className="text-xs text-on-surface-variant mt-0.5">{item.description}</div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <Link href="/pricing" className={navLinkClass}>Pricing</Link>
              <Link href="/about" className={navLinkClass}>About</Link>
            </nav>

            {/* Desktop CTAs */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Theme toggle */}
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className={cn(
                    'w-9 h-9 flex items-center justify-center rounded-full transition-colors',
                    scrolled ? 'hover:bg-surface-container' : 'hover:bg-white/10'
                  )}>
                    <span className={cn(
                      'material-symbols-outlined text-xl',
                      scrolled ? 'text-on-surface-variant' : 'text-white/70'
                    )}>
                      {theme === 'dark' ? 'dark_mode' : theme === 'light' ? 'light_mode' : 'brightness_auto'}
                    </span>
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl shadow-modal p-1.5 w-44 z-50"
                    sideOffset={8}
                    align="end"
                  >
                    {THEME_OPTIONS.map(opt => (
                      <DropdownMenu.Item
                        key={opt.value}
                        onSelect={() => setTheme(opt.value)}
                        className={cn(
                          'flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold cursor-pointer outline-none transition-colors',
                          theme === opt.value
                            ? 'bg-primary-fixed text-on-primary-fixed'
                            : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                        )}
                      >
                        <span className="material-symbols-outlined text-base">{opt.icon}</span>
                        {opt.label}
                        {theme === opt.value && (
                          <span className="material-symbols-outlined text-sm ml-auto">check</span>
                        )}
                      </DropdownMenu.Item>
                    ))}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
              {user ? (
                <Link href={dashboardHref} className="btn-primary text-sm py-2">
                  Dashboard →
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className={cn(navLinkClass, 'opacity-80')}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/auth/register"
                    className={cn(
                      'text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200',
                      scrolled
                        ? 'btn-primary'
                        : 'bg-white text-[#003D9B] hover:bg-white/90 hover:scale-[1.02]'
                    )}
                  >
                    Start free →
                  </Link>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-1"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <span
                className={cn(
                  'material-symbols-outlined text-2xl',
                  scrolled ? 'text-on-surface' : 'text-white'
                )}
              >
                menu
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] bg-surface-container-lowest">
          <div className="flex items-center justify-between h-16 px-6 border-b border-outline-variant/30">
            <span className="font-extrabold text-xl text-on-surface">Leasarr</span>
            <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
              <span className="material-symbols-outlined text-2xl text-on-surface">close</span>
            </button>
          </div>
          <nav className="p-6 flex flex-col gap-1">
            {/* Theme row in mobile menu */}
            <div className="flex items-center justify-between px-3 py-3 mb-2 border-b border-outline-variant/20">
              <span className="text-sm font-medium text-on-surface-variant">Theme</span>
              <div className="flex items-center gap-1">
                {THEME_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setTheme(opt.value)}
                    className={cn(
                      'w-8 h-8 flex items-center justify-center rounded-lg transition-colors',
                      theme === opt.value
                        ? 'bg-primary-fixed text-on-primary-fixed'
                        : 'text-on-surface-variant hover:bg-surface-container'
                    )}
                    aria-label={opt.label}
                  >
                    <span className="material-symbols-outlined text-base">{opt.icon}</span>
                  </button>
                ))}
              </div>
            </div>
            {FEATURES_ITEMS.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="px-3 py-3 rounded-lg text-base font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Link href="/pricing" className="px-3 py-3 rounded-lg text-base font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors" onClick={() => setMobileOpen(false)}>Pricing</Link>
            <Link href="/about" className="px-3 py-3 rounded-lg text-base font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors" onClick={() => setMobileOpen(false)}>About</Link>
            <div className="mt-4 pt-4 border-t border-outline-variant/30 flex flex-col gap-3">
              {user ? (
                <Link href={dashboardHref} className="btn-primary text-center py-3">
                  Dashboard →
                </Link>
              ) : (
                <>
                  <Link href="/auth/register" className="btn-primary text-center py-3" onClick={() => setMobileOpen(false)}>Start free →</Link>
                  <Link href="/auth/login" className="text-center text-on-surface-variant font-medium py-2" onClick={() => setMobileOpen(false)}>Sign in</Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  )
}

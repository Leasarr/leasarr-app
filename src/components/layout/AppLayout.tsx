'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { href: '/properties', icon: 'domain', label: 'Properties' },
  { href: '/tenants', icon: 'group', label: 'Tenants' },
  { href: '/payments', icon: 'payments', label: 'Payments' },
  { href: '/maintenance', icon: 'build', label: 'Maintenance' },
  { href: '/leases', icon: 'description', label: 'Leases' },
  { href: '/communication', icon: 'chat', label: 'Messages' },
  { href: '/reports', icon: 'bar_chart', label: 'Reports' },
  { href: '/portal', icon: 'person', label: 'Tenant Portal' },
]

const BOTTOM_NAV = [
  { href: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { href: '/properties', icon: 'domain', label: 'Properties' },
  { href: '/tenants', icon: 'group', label: 'Tenants' },
  { href: '/payments', icon: 'payments', label: 'Payments' },
  { href: '/maintenance', icon: 'build', label: 'More' },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen flex bg-surface">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-64 bg-surface-container-lowest border-r border-outline-variant/20 fixed left-0 top-0 h-screen z-40">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-outline-variant/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl primary-gradient flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-lg">domain</span>
            </div>
            <span className="text-xl font-headline font-extrabold text-primary tracking-tight">PMSoft</span>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150',
                  isActive
                    ? 'bg-primary-fixed text-primary'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                )}
              >
                <span className={cn('material-symbols-outlined text-xl', isActive && 'material-symbols-filled')}>
                  {item.icon}
                </span>
                {item.label}
                {item.href === '/communication' && (
                  <span className="ml-auto bg-primary text-on-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">3</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User Profile */}
        <div className="px-4 py-4 border-t border-outline-variant/20">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-surface-container cursor-pointer transition-colors">
            <div className="w-8 h-8 rounded-full primary-gradient flex items-center justify-center">
              <span className="text-on-primary text-xs font-bold">AM</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-on-surface truncate">Alexander Morgan</p>
              <p className="text-[10px] text-on-surface-variant">Property Manager</p>
            </div>
            <span className="material-symbols-outlined text-outline text-base">settings</span>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        {/* Mobile Top Bar */}
        <header className="lg:hidden fixed top-0 left-0 right-0 z-50 glass-dark border-b border-outline-variant/20 h-16 flex items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl primary-gradient flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-base">domain</span>
            </div>
            <span className="text-lg font-headline font-extrabold text-primary">PMSoft</span>
          </div>
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors relative">
            <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
          </button>
        </header>

        {/* Desktop Top Bar */}
        <header className="hidden lg:flex fixed top-0 left-64 right-0 z-30 glass-dark border-b border-outline-variant/20 h-14 items-center justify-between px-8">
          <div className="flex items-center gap-2 text-on-surface-variant text-sm">
            <span className="material-symbols-outlined text-base">home</span>
            <span>/</span>
            <span className="font-semibold text-on-surface capitalize">{pathname.split('/')[1] || 'Dashboard'}</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors relative">
              <span className="material-symbols-outlined text-on-surface-variant text-xl">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border border-white"></span>
            </button>
            <div className="w-8 h-8 rounded-full primary-gradient flex items-center justify-center">
              <span className="text-on-primary text-xs font-bold">AM</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="pt-16 lg:pt-14 pb-24 lg:pb-8 min-h-screen">
          {children}
        </div>
      </main>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-outline-variant/20 rounded-t-3xl shadow-nav">
        <div className="flex justify-around items-center h-20 px-2 pb-safe">
          {BOTTOM_NAV.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 px-4 py-1.5 rounded-2xl transition-all duration-150 active:scale-90',
                  isActive ? 'bg-primary-fixed text-primary' : 'text-on-surface-variant hover:text-on-surface'
                )}
              >
                <span className={cn('material-symbols-outlined text-[22px]', isActive && 'material-symbols-filled')}>
                  {item.icon}
                </span>
                <span className="font-headline font-semibold text-[10px] tracking-wide">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

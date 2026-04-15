'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn, getInitials, formatRelative } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

const NOTIFICATIONS = [
  {
    id: '1',
    icon: 'payments',
    iconBg: 'bg-primary-container/20',
    iconColor: 'text-primary',
    title: 'Rent payment received',
    body: 'Jane Doe paid $2,400 for November',
    time: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    unread: true,
  },
  {
    id: '2',
    icon: 'build',
    iconBg: 'bg-tertiary-container/20',
    iconColor: 'text-tertiary',
    title: 'New maintenance request',
    body: 'Marcus Thorne — Leaking kitchen faucet',
    time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    unread: true,
  },
  {
    id: '3',
    icon: 'description',
    iconBg: 'bg-error-container/20',
    iconColor: 'text-error',
    title: 'Lease expiring soon',
    body: 'Elena Rodriguez — expires in 18 days',
    time: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    unread: false,
  },
]

function NotificationContent() {
  const unreadCount = NOTIFICATIONS.filter(n => n.unread).length
  return (
    <DropdownMenu.Content
      className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl shadow-modal w-80 z-50 overflow-hidden"
      sideOffset={8}
      align="end"
    >
      <div className="px-4 py-3 border-b border-outline-variant/10 flex items-center justify-between">
        <p className="font-bold text-sm text-on-surface">Notifications</p>
        {unreadCount > 0 && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-on-primary">{unreadCount} new</span>
        )}
      </div>
      <div className="divide-y divide-outline-variant/10">
        {NOTIFICATIONS.map(n => (
          <DropdownMenu.Item
            key={n.id}
            className={cn(
              'flex items-start gap-3 px-4 py-3 cursor-pointer outline-none transition-colors hover:bg-surface-container-low',
              n.unread && 'bg-primary-fixed/30'
            )}
          >
            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5', n.iconBg)}>
              <span className={cn('material-symbols-outlined text-sm', n.iconColor)}>{n.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-on-surface leading-tight">{n.title}</p>
              <p className="text-[11px] text-on-surface-variant mt-0.5 leading-tight truncate">{n.body}</p>
              <p className="text-[10px] text-outline mt-1">{formatRelative(n.time)}</p>
            </div>
            {n.unread && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />}
          </DropdownMenu.Item>
        ))}
      </div>
      <div className="px-4 py-2.5 border-t border-outline-variant/10">
        <button className="w-full text-xs font-bold text-primary hover:underline text-center">Mark all as read</button>
      </div>
    </DropdownMenu.Content>
  )
}

const MANAGER_NAV_ITEMS = [
  { href: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { href: '/properties', icon: 'domain', label: 'Properties' },
  { href: '/people', icon: 'group', label: 'People' },
  { href: '/payments', icon: 'payments', label: 'Payments' },
  { href: '/maintenance', icon: 'build', label: 'Maintenance' },
  { href: '/leases', icon: 'description', label: 'Leases' },
  { href: '/communication', icon: 'chat', label: 'Messages' },
  { href: '/reports', icon: 'bar_chart', label: 'Reports' },
]

const TENANT_NAV_ITEMS = [
  { href: '/portal', icon: 'person', label: 'My Portal' },
]

const MANAGER_BOTTOM_NAV = [
  { href: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { href: '/properties', icon: 'domain', label: 'Properties' },
  { href: '/people', icon: 'group', label: 'People' },
  { href: '/payments', icon: 'payments', label: 'Payments' },
  { href: '/maintenance', icon: 'build', label: 'More' },
]

const TENANT_BOTTOM_NAV = [
  { href: '/portal', icon: 'person', label: 'My Portal' },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { profile, signOut } = useAuth()

  const isTenant = profile?.role === 'tenant'
  const navItems = isTenant ? TENANT_NAV_ITEMS : MANAGER_NAV_ITEMS
  const bottomNav = isTenant ? TENANT_BOTTOM_NAV : MANAGER_BOTTOM_NAV

  const displayName = profile?.name ?? profile?.email ?? '...'
  const initials = profile?.name ? getInitials(profile.name) : '?'
  const roleLabel = isTenant ? 'Tenant' : 'Property Manager'

  const handleLogout = async () => {
    await signOut()
    router.push('/auth/login')
  }

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
            <span className="text-xl font-headline font-extrabold text-primary tracking-tight">Leasarr</span>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(item => {
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
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-surface-container cursor-pointer transition-colors text-left">
                <div className="w-8 h-8 rounded-full primary-gradient flex items-center justify-center shrink-0">
                  <span className="text-on-primary text-xs font-bold">{initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-on-surface truncate">{displayName}</p>
                  <p className="text-[10px] text-on-surface-variant">{roleLabel}</p>
                </div>
                <span className="material-symbols-outlined text-outline text-base">expand_more</span>
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl shadow-modal p-1.5 w-52 z-50"
                sideOffset={8}
                align="start"
              >
                <DropdownMenu.Item
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-error hover:bg-error-container cursor-pointer outline-none transition-colors"
                  onSelect={handleLogout}
                >
                  <span className="material-symbols-outlined text-base">logout</span>
                  Sign Out
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
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
            <span className="text-lg font-headline font-extrabold text-primary">Leasarr</span>
          </div>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors relative">
                <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
                <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <NotificationContent />
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </header>

        {/* Desktop Top Bar */}
        <header className="hidden lg:flex fixed top-0 left-64 right-0 z-30 glass-dark border-b border-outline-variant/20 h-14 items-center justify-between px-8">
          <div className="flex items-center gap-2 text-on-surface-variant text-sm">
            <span className="material-symbols-outlined text-base">home</span>
            <span>/</span>
            <span className="font-semibold text-on-surface capitalize">{pathname.split('/')[1] || 'Dashboard'}</span>
          </div>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors relative">
                <span className="material-symbols-outlined text-on-surface-variant text-xl">notifications</span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border border-white"></span>
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <NotificationContent />
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </header>

        {/* Page Content */}
        <div className="pt-16 lg:pt-14 pb-24 lg:pb-8 min-h-screen animate-slide-up">
          {children}
        </div>
      </main>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-outline-variant/20 rounded-t-3xl shadow-nav">
        <div className="flex justify-around items-center h-20 px-2 pb-safe">
          {bottomNav.map(item => {
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

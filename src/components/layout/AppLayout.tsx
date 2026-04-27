'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { cn, getInitials, formatRelative } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useTheme, type Theme } from '@/context/ThemeContext'
import { NOTIFICATION_TYPE_META } from '@/lib/notificationMeta'

const THEME_OPTIONS: { value: Theme; icon: string; label: string }[] = [
  { value: 'light', icon: 'light_mode', label: 'Light' },
  { value: 'dark', icon: 'dark_mode', label: 'Dark' },
  { value: 'system', icon: 'brightness_auto', label: 'System' },
]

type NotificationRow = {
  id: string
  type: 'maintenance' | 'payment' | 'lease'
  title: string
  body: string
  read: boolean
  created_at: string
}

function NotificationContent({
  notifications,
  onMarkAllRead,
  allHref,
}: {
  notifications: NotificationRow[]
  onMarkAllRead: () => void
  allHref: string
}) {
  const unread = notifications.filter(n => !n.read)
  return (
    <DropdownMenu.Content
      className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl shadow-modal w-80 z-50 overflow-hidden"
      sideOffset={8}
      align="end"
    >
      <div className="px-4 py-3 border-b border-outline-variant/10 flex items-center justify-between">
        <p className="font-bold text-sm text-on-surface">New</p>
        {unread.length > 0 && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-on-primary">{unread.length} new</span>
        )}
      </div>
      {unread.length === 0 ? (
        <div className="px-4 py-10 text-center text-on-surface-variant">
          <span className="material-symbols-outlined text-3xl mb-2 block">notifications_none</span>
          <p className="text-sm font-semibold">You&apos;re all caught up</p>
        </div>
      ) : (
        <div className="divide-y divide-outline-variant/10 max-h-96 overflow-y-auto no-scrollbar">
          {unread.map(n => {
            const meta = NOTIFICATION_TYPE_META[n.type] ?? NOTIFICATION_TYPE_META.maintenance
            return (
              <DropdownMenu.Item
                key={n.id}
                className="flex items-start gap-3 px-4 py-3 cursor-pointer outline-none transition-colors bg-primary-fixed/10 hover:bg-primary-fixed/20"
              >
                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5', meta.iconBg)}>
                  <span className={cn('material-symbols-outlined text-sm', meta.iconColor)}>{meta.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-on-surface leading-tight">{n.title}</p>
                  <p className="text-[11px] text-on-surface-variant mt-0.5 leading-tight truncate">{n.body}</p>
                  <p className="text-[10px] text-outline mt-1">{formatRelative(n.created_at)}</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
              </DropdownMenu.Item>
            )
          })}
        </div>
      )}
      <div className="px-4 py-2.5 border-t border-outline-variant/10 flex items-center justify-between">
        {unread.length > 0 ? (
          <button onClick={onMarkAllRead} className="text-xs font-bold text-primary hover:underline">Mark all as read</button>
        ) : <span />}
        <Link href={allHref} className="text-xs font-bold text-on-surface-variant hover:text-on-surface transition-colors">See all</Link>
      </div>
    </DropdownMenu.Content>
  )
}

type NavItem = { href?: string; icon: string; label: string; exact?: boolean; action?: () => void }

const MANAGER_NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { href: '/properties', icon: 'domain', label: 'Properties' },
  { href: '/people', icon: 'group', label: 'People' },
  { href: '/payments', icon: 'payments', label: 'Payments' },
  { href: '/maintenance', icon: 'build', label: 'Maintenance' },
  { href: '/leases', icon: 'description', label: 'Leases' },
  { href: '/communication', icon: 'chat', label: 'Messages' },
  { href: '/reports', icon: 'bar_chart', label: 'Reports' },
  { href: '/notifications', icon: 'notifications', label: 'Notifications' },
]

const TENANT_NAV_ITEMS: NavItem[] = [
  { href: '/portal', icon: 'home', label: 'Home', exact: true },
  { href: '/portal/maintenance', icon: 'build', label: 'Maintenance' },
  { href: '/portal/lease', icon: 'description', label: 'Lease' },
  { href: '/portal/notifications', icon: 'notifications', label: 'Notifications' },
]

const MANAGER_BOTTOM_NAV: NavItem[] = [
  { href: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { href: '/payments', icon: 'payments', label: 'Payments' },
  { href: '/maintenance', icon: 'build', label: 'Maintenance' },
]

const TENANT_BOTTOM_NAV: NavItem[] = [
  { href: '/portal', icon: 'home', label: 'Home', exact: true },
  { href: '/portal/maintenance', icon: 'build', label: 'Maintenance' },
  { href: '/portal/lease', icon: 'description', label: 'Lease' },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, profile, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const supabase = createClient()

  const [notifications, setNotifications] = useState<NotificationRow[]>([])
  const [moreOpen, setMoreOpen] = useState(false)
  // pinned = user locked sidebar open; hovered = temporary hover expansion
  const [pinned, setPinned] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('sidebar_pinned') === 'true'
  })
  const [hovered, setHovered] = useState(false)
  const isExpanded = pinned || hovered

  function togglePin() {
    setPinned(p => {
      const next = !p
      localStorage.setItem('sidebar_pinned', String(next))
      return next
    })
  }

  useEffect(() => {
    if (!profile) return

    async function fetchNotifications() {
      const { data } = await supabase
        .from('notifications')
        .select('id, type, title, body, read, created_at')
        .eq('profile_id', profile!.id)
        .order('created_at', { ascending: false })
        .limit(20)
      setNotifications((data as NotificationRow[]) ?? [])
    }

    fetchNotifications()

    const channel = supabase
      .channel('user-notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `profile_id=eq.${profile.id}` },
        (payload: { new: NotificationRow }) => setNotifications(prev => [payload.new, ...prev])
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `profile_id=eq.${profile.id}` },
        (payload: { new: NotificationRow }) => setNotifications(prev => prev.map(n => n.id === payload.new.id ? payload.new : n))
      )
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'notifications', filter: `profile_id=eq.${profile.id}` },
        (payload: { old: { id: string } }) => setNotifications(prev => prev.filter(n => n.id !== payload.old.id))
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [profile])

  async function handleMarkAllRead() {
    if (!profile) return
    await supabase.from('notifications').update({ read: true }).eq('profile_id', profile.id).eq('read', false)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const unreadCount = notifications.filter(n => !n.read).length
  const isTenant = profile?.role === 'tenant'
  const navItems = isTenant ? TENANT_NAV_ITEMS : MANAGER_NAV_ITEMS
  const baseBottomNav = isTenant ? TENANT_BOTTOM_NAV : MANAGER_BOTTOM_NAV
  const moreNavItems = navItems.filter(item => !baseBottomNav.some(b => b.href === item.href))
  const bottomNav = [...baseBottomNav, { icon: 'grid_view', label: 'More', action: () => setMoreOpen(true) }]

  const displayName = profile?.name ?? profile?.email ?? '...'
  const initials = profile?.name ? getInitials(profile.name) : '?'
  const roleLabel = isTenant ? 'Tenant' : 'Property Manager'
  const avatarUrl = (user?.user_metadata?.avatar_url as string | undefined) ?? profile?.avatar_url ?? null

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  const AvatarBubble = ({ size = 8 }: { size?: number }) => avatarUrl ? (
    <img src={avatarUrl} alt="" className={cn(`w-${size} h-${size}`, 'rounded-full object-cover')} />
  ) : (
    <div className={cn(`w-${size} h-${size}`, 'rounded-full primary-gradient flex items-center justify-center flex-shrink-0')}>
      <span className="text-on-primary text-xs font-bold">{initials}</span>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-surface overflow-x-hidden">

      {/* ── Full-width Top Bar ── */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 glass-dark border-b border-outline-variant/20 flex items-center justify-between px-4 lg:px-5">
        {/* Logo */}
        <Link href={isTenant ? '/portal' : '/dashboard'} className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-xl primary-gradient flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-base">domain</span>
          </div>
          <span className="text-lg font-headline font-extrabold text-primary tracking-tight">Leasarr</span>
        </Link>

        {/* Right controls */}
        <div className="flex items-center gap-1">
          {/* Theme switcher — desktop only */}
          <div className="hidden lg:block">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors">
                  <span className="material-symbols-outlined text-on-surface-variant text-xl">
                    {theme === 'dark' ? 'dark_mode' : theme === 'light' ? 'light_mode' : 'brightness_auto'}
                  </span>
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl shadow-modal p-1.5 w-44 z-50" sideOffset={8} align="end">
                  {THEME_OPTIONS.map(opt => (
                    <DropdownMenu.Item
                      key={opt.value}
                      onSelect={() => setTheme(opt.value)}
                      className={cn(
                        'flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold cursor-pointer outline-none transition-colors',
                        theme === opt.value ? 'bg-primary-fixed text-on-primary-fixed' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                      )}
                    >
                      <span className="material-symbols-outlined text-base">{opt.icon}</span>
                      {opt.label}
                      {theme === opt.value && <span className="material-symbols-outlined text-sm ml-auto material-symbols-filled">check</span>}
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>

          {/* Notifications */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors relative">
                <span className="material-symbols-outlined text-on-surface-variant text-xl">notifications</span>
                {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border border-surface" />}
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <NotificationContent notifications={notifications} onMarkAllRead={handleMarkAllRead} allHref={isTenant ? '/portal/notifications' : '/notifications'} />
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          {/* Profile avatar dropdown */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="ml-1 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <AvatarBubble size={8} />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl shadow-modal p-1.5 w-56 z-50" sideOffset={10} align="end">
                <div className="px-3 py-2.5 mb-1">
                  <p className="text-sm font-semibold text-on-surface truncate">{displayName}</p>
                  <p className="text-[11px] text-on-surface-variant">{roleLabel}</p>
                </div>
                <DropdownMenu.Separator className="h-px bg-outline-variant/20 mx-1.5 mb-1" />
                <DropdownMenu.Item asChild>
                  <Link href="/settings" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container hover:text-on-surface cursor-pointer outline-none transition-colors">
                    <span className="material-symbols-outlined text-base">manage_accounts</span>
                    Profile &amp; Settings
                  </Link>
                </DropdownMenu.Item>
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
      </header>

      <div className="flex flex-1 pt-14">
        {/* ── Desktop Sidebar ── */}
        <aside
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className={cn(
            'hidden lg:flex flex-col fixed left-0 top-14 z-40 h-[calc(100vh-3.5rem)]',
            'bg-surface-container-lowest border-r border-outline-variant/20',
            'transition-[width] duration-200 ease-in-out overflow-hidden',
            isExpanded ? 'w-64' : 'w-16',
            // overlay shadow when hover-expanded but not pinned
            isExpanded && !pinned && 'shadow-[4px_0_24px_rgba(0,0,0,0.08)]'
          )}
        >
          {/* Nav items */}
          <nav className="flex-1 px-2 pt-8 pb-3 space-y-0.5 overflow-y-auto">
            {navItems.map(item => {
              const isActive = item.exact
                ? pathname === item.href
                : (pathname === item.href || pathname.startsWith((item.href ?? '') + '/'))
              if (!item.href) return null
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={!isExpanded ? item.label : undefined}
                  className={cn(
                    'flex items-center rounded-xl text-sm font-semibold transition-all duration-150',
                    isExpanded ? 'gap-3 px-3 py-2.5' : 'justify-center py-2.5',
                    isActive
                      ? 'bg-primary-fixed text-on-primary-fixed'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  )}
                >
                  <span className={cn('material-symbols-outlined text-xl flex-shrink-0', isActive && 'material-symbols-filled')}>
                    {item.icon}
                  </span>
                  <span className={cn(
                    'whitespace-nowrap transition-[opacity,max-width] duration-200 overflow-hidden',
                    isExpanded ? 'opacity-100 max-w-[200px]' : 'opacity-0 max-w-0'
                  )}>
                    {item.label}
                  </span>
                  {item.href === '/communication' && isExpanded && (
                    <span className="ml-auto bg-primary text-on-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">3</span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Collapse / expand toggle */}
          <div className={cn('flex items-center py-2.5 border-t border-outline-variant/10 shrink-0', isExpanded ? 'px-3 justify-end' : 'justify-center')}>
            <button
              onClick={togglePin}
              title={pinned ? 'Collapse sidebar' : 'Pin sidebar open'}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-surface-container text-on-surface-variant transition-colors"
            >
              <span className="material-symbols-outlined text-xl">
                {pinned ? 'left_panel_close' : 'left_panel_open'}
              </span>
            </button>
          </div>
        </aside>

        {/* ── Page Content ── */}
        <main className={cn(
          'flex-1 pb-24 lg:pb-8 min-h-[calc(100vh-3.5rem)] animate-slide-up transition-[margin] duration-200',
          pinned ? 'lg:ml-64' : 'lg:ml-16'
        )}>
          {children}
        </main>
      </div>

      {/* ── Mobile Bottom Nav — icons only ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface-container-lowest/90 backdrop-blur-xl border-t border-outline-variant/20 rounded-t-3xl shadow-nav">
        <div className="grid pb-safe" style={{ gridTemplateColumns: `repeat(${bottomNav.length}, 1fr)` }}>
          {bottomNav.map(item => {
            const isActive = item.action
              ? moreOpen
              : item.exact
                ? pathname === item.href
                : (pathname === item.href || pathname.startsWith((item.href ?? '') + '/'))

            const className = cn(
              'flex flex-col items-center justify-center gap-0.5 h-16 w-full transition-all duration-150 active:scale-90',
              isActive ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
            )

            const content = (
              <>
                <span className={cn('material-symbols-outlined text-[22px]', isActive && 'material-symbols-filled')}>{item.icon}</span>
                <span className="font-semibold text-[10px] tracking-wide">{item.label}</span>
              </>
            )

            if (item.action) return <button key={item.label} onClick={item.action} className={className}>{content}</button>
            if (!item.href) return null
            return <Link key={item.href} href={item.href} className={className}>{content}</Link>
          })}
        </div>
      </nav>

      {/* ── Mobile More Sheet ── */}
      {moreOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMoreOpen(false)} />
          <div className="relative bg-surface-container-lowest rounded-t-3xl shadow-modal pb-safe">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-outline-variant/40" />
            </div>

            {/* User info */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-outline-variant/10">
              <AvatarBubble size={10} />
              <div>
                <p className="text-sm font-semibold text-on-surface">{displayName}</p>
                <p className="text-[10px] text-on-surface-variant">{roleLabel}</p>
              </div>
            </div>

            {/* Nav grid — icons only */}
            <div className="grid gap-2 px-4 py-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(7.5rem, 1fr))' }}>
              {moreNavItems.map(item => {
                if (!item.href) return null
                const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    title={item.label}
                    className={cn(
                      'flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-2xl transition-colors',
                      isActive ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                    )}
                  >
                    <span className={cn('material-symbols-outlined text-2xl', isActive && 'material-symbols-filled')}>{item.icon}</span>
                    <span className="text-[10px] font-semibold tracking-wide">{item.label}</span>
                  </Link>
                )
              })}
            </div>

            {/* Actions — keep labels */}
            <div className="px-4 pb-6 space-y-1 border-t border-outline-variant/10 pt-3">
              <Link
                href="/settings"
                onClick={() => setMoreOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-base">manage_accounts</span>
                Profile &amp; Settings
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-error hover:bg-error-container transition-colors"
              >
                <span className="material-symbols-outlined text-base">logout</span>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

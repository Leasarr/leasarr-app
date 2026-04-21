'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { cn, getInitials, formatRelative } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useTheme, type Theme } from '@/context/ThemeContext'
import ProfileSettingsModal from '@/components/profile/ProfileSettingsModal'

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

const TYPE_META: Record<string, { icon: string; iconBg: string; iconColor: string }> = {
  maintenance: { icon: 'build', iconBg: 'bg-tertiary-container/20', iconColor: 'text-tertiary' },
  payment: { icon: 'payments', iconBg: 'bg-primary-container/20', iconColor: 'text-primary' },
  lease: { icon: 'description', iconBg: 'bg-error-container/20', iconColor: 'text-error' },
}

type NotificationContentProps = {
  notifications: NotificationRow[]
  onMarkAllRead: () => void
  allHref: string
}

function NotificationContent({ notifications, onMarkAllRead, allHref }: NotificationContentProps) {
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
            const meta = TYPE_META[n.type] ?? TYPE_META.maintenance
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
  const { profile, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const supabase = createClient()

  const [notifications, setNotifications] = useState<NotificationRow[]>([])
  const [profileSettingsOpen, setProfileSettingsOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)

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
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `profile_id=eq.${profile.id}` },
        (payload: { new: NotificationRow }) => {
          setNotifications(prev => [payload.new, ...prev])
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `profile_id=eq.${profile.id}` },
        (payload: { new: NotificationRow }) => {
          setNotifications(prev => prev.map(n => n.id === payload.new.id ? payload.new : n))
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'notifications', filter: `profile_id=eq.${profile.id}` },
        (payload: { old: { id: string } }) => {
          setNotifications(prev => prev.filter(n => n.id !== payload.old.id))
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [profile])

  async function handleMarkAllRead() {
    if (!profile) return
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('profile_id', profile.id)
      .eq('read', false)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const isTenant = profile?.role === 'tenant'
  const navItems = isTenant ? TENANT_NAV_ITEMS : MANAGER_NAV_ITEMS
  const baseBottomNav = isTenant ? TENANT_BOTTOM_NAV : MANAGER_BOTTOM_NAV
  const moreNavItems = navItems.filter(item => !baseBottomNav.some(b => b.href === item.href))
  const bottomNav = [
    ...baseBottomNav,
    { icon: 'grid_view', label: 'More', action: () => setMoreOpen(true) },
  ]

  const displayName = profile?.name ?? profile?.email ?? '...'
  const initials = profile?.name ? getInitials(profile.name) : '?'
  const roleLabel = isTenant ? 'Tenant' : 'Property Manager'

  const handleLogout = async () => {
    await signOut()
    router.push('/')
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
            const isActive = item.exact
              ? pathname === item.href
              : (pathname === item.href || pathname.startsWith((item.href ?? '') + '/'))
            if (!item.href) return null
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150',
                  isActive
                    ? 'bg-primary-fixed text-on-primary-fixed'
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
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container hover:text-on-surface cursor-pointer outline-none transition-colors"
                  onSelect={() => setProfileSettingsOpen(true)}
                >
                  <span className="material-symbols-outlined text-base">manage_accounts</span>
                  Profile & Settings
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
                {unreadCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" />}
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <NotificationContent notifications={notifications} onMarkAllRead={handleMarkAllRead} allHref={isTenant ? '/portal/notifications' : '/notifications'} />
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </header>

        {/* Desktop Top Bar */}
        <header className="hidden lg:flex fixed top-0 left-64 right-0 z-30 glass-dark border-b border-outline-variant/20 h-14 items-center justify-between px-8">
          <div className="flex items-center gap-2 text-on-surface-variant text-sm">
            <span className="material-symbols-outlined text-base">home</span>
            <span>/</span>
            <span className="font-semibold text-on-surface capitalize">
              {pathname === '/portal' ? 'Home' : pathname.split('/').filter(Boolean).map(s => s === 'portal' ? null : s).filter(Boolean).join(' / ') || pathname.split('/')[1] || 'Dashboard'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Theme switcher */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors">
                  <span className="material-symbols-outlined text-on-surface-variant text-xl">
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
                        <span className="material-symbols-outlined text-sm ml-auto material-symbols-filled">check</span>
                      )}
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>

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
          </div>
        </header>

        {/* Page Content */}
        <div className="pt-16 lg:pt-14 pb-24 lg:pb-8 min-h-screen animate-slide-up">
          {children}
        </div>
      </main>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface-container-lowest/90 backdrop-blur-xl border-t border-outline-variant/20 rounded-t-3xl shadow-nav">
        <div className="flex justify-around items-center h-20 px-2 pb-safe">
          {bottomNav.map(item => {
            const isActive = item.action
              ? moreOpen
              : item.exact
                ? pathname === item.href
                : (pathname === item.href || pathname.startsWith((item.href ?? '') + '/'))

            const className = cn(
              'flex flex-col items-center justify-center gap-0.5 px-4 py-1.5 rounded-2xl transition-all duration-150 active:scale-90',
              isActive ? 'bg-primary-fixed text-on-primary-fixed' : 'text-on-surface-variant hover:text-on-surface'
            )

            const content = (
              <>
                <span className={cn('material-symbols-outlined text-[22px]', isActive && 'material-symbols-filled')}>
                  {item.icon}
                </span>
                <span className="font-headline font-semibold text-[10px] tracking-wide">{item.label}</span>
              </>
            )

            if (item.action) {
              return (
                <button key={item.label} onClick={item.action} className={className}>
                  {content}
                </button>
              )
            }

            if (!item.href) return null

            return (
              <Link key={item.href} href={item.href} className={className}>
                {content}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* ── Mobile More Sheet ── */}
      {moreOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMoreOpen(false)} />
          <div className="relative bg-surface-container-lowest rounded-t-3xl shadow-modal pb-safe">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-outline-variant/40" />
            </div>

            {/* User info */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-outline-variant/10">
              <div className="w-10 h-10 rounded-full primary-gradient flex items-center justify-center shrink-0">
                <span className="text-on-primary text-sm font-bold">{initials}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">{displayName}</p>
                <p className="text-[10px] text-on-surface-variant">{roleLabel}</p>
              </div>
            </div>

            {/* Nav grid */}
            <div className="grid grid-cols-3 gap-2 px-4 py-4">
              {moreNavItems.map(item => {
                if (!item.href) return null
                const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl transition-colors',
                      isActive ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                    )}
                  >
                    <span className={cn('material-symbols-outlined text-2xl', isActive && 'material-symbols-filled')}>{item.icon}</span>
                    <span className="text-[10px] font-semibold tracking-wide">{item.label}</span>
                  </Link>
                )
              })}
            </div>

            {/* Actions */}
            <div className="px-4 pb-6 space-y-1 border-t border-outline-variant/10 pt-3">
              <button
                onClick={() => { setMoreOpen(false); setProfileSettingsOpen(true) }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-base">manage_accounts</span>
                Profile &amp; Settings
              </button>
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

      <ProfileSettingsModal
        open={profileSettingsOpen}
        onClose={() => setProfileSettingsOpen(false)}
        onSignOut={handleLogout}
      />
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AppLayout from '@/components/layout/AppLayout'
import { formatRelative, formatDate, cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'

type NotificationRow = {
  id: string
  type: 'maintenance' | 'payment' | 'lease'
  title: string
  body: string
  read: boolean
  created_at: string
}

const TYPE_META: Record<string, { icon: string; iconBg: string; iconColor: string; label: string; href: string }> = {
  maintenance: { icon: 'build', iconBg: 'bg-tertiary-container/20', iconColor: 'text-tertiary', label: 'Maintenance', href: '/maintenance' },
  payment: { icon: 'payments', iconBg: 'bg-primary-container/20', iconColor: 'text-primary', label: 'Payments', href: '/payments' },
  lease: { icon: 'description', iconBg: 'bg-error-container/20', iconColor: 'text-error', label: 'Leases', href: '/leases' },
}

function NotificationRow({ n, selected, onSelect }: { n: NotificationRow; selected: boolean; onSelect: () => void }) {
  const meta = TYPE_META[n.type] ?? TYPE_META.maintenance
  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full flex items-start gap-4 px-5 py-4 transition-all text-left',
        selected ? 'bg-primary-fixed/30' : !n.read ? 'bg-primary-fixed/10 hover:bg-primary-fixed/20' : 'hover:bg-surface-container-low/50'
      )}
    >
      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5', meta.iconBg)}>
        <span className={cn('material-symbols-outlined text-sm', meta.iconColor)}>{meta.icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-on-surface leading-tight">{n.title}</p>
        <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-1">{n.body}</p>
        <p className="text-[10px] text-outline mt-1">{formatRelative(n.created_at)}</p>
      </div>
      {!n.read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />}
    </button>
  )
}

export default function NotificationsPage() {
  const { profile, loading: authLoading } = useAuth()
  const supabase = createClient()

  const [notifications, setNotifications] = useState<NotificationRow[]>([])
  const [selected, setSelected] = useState<NotificationRow | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!profile) return
    setLoading(true)
    async function fetch() {
      const { data } = await supabase
        .from('notifications')
        .select('id, type, title, body, read, created_at')
        .eq('profile_id', profile!.id)
        .order('created_at', { ascending: false })
      setNotifications((data as NotificationRow[]) ?? [])
      setLoading(false)
    }
    fetch()
  }, [profile])

  async function handleSelect(n: NotificationRow) {
    setSelected(n)
    if (!n.read) {
      await supabase.from('notifications').update({ read: true }).eq('id', n.id)
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))
      setSelected({ ...n, read: true })
    }
  }

  async function handleMarkAllRead() {
    if (!profile) return
    await supabase.from('notifications').update({ read: true }).eq('profile_id', profile.id).eq('read', false)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    if (selected) setSelected(prev => prev ? { ...prev, read: true } : null)
  }

  const unreadCount = notifications.filter(n => !n.read).length
  const unread = notifications.filter(n => !n.read)
  const read = notifications.filter(n => n.read)

  if (authLoading || loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <span className="material-symbols-outlined text-4xl text-primary animate-pulse">notifications</span>
            <p className="text-on-surface-variant mt-2">Loading...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  const renderList = (items: NotificationRow[]) => (
    <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-card divide-y divide-outline-variant/10">
      {items.map(n => (
        <NotificationRow key={n.id} n={n} selected={selected?.id === n.id} onSelect={() => handleSelect(n)} />
      ))}
    </div>
  )

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">

        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-1">Activity</p>
            <h1 className="text-3xl font-headline font-extrabold tracking-tight text-on-surface">Notifications</h1>
          </div>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} className="btn-secondary h-10 px-4 text-sm">
              Mark all as read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl mb-3">notifications_none</span>
            <p className="font-bold text-on-surface text-lg">No notifications yet</p>
            <p className="text-sm mt-1">Activity from tenants and requests will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left: grouped list */}
            <section className={cn('flex flex-col gap-6', selected ? 'lg:col-span-5' : 'lg:col-span-12')}>
              {unread.length > 0 && (
                <div>
                  <h2 className="text-xs font-bold text-outline uppercase tracking-widest mb-3 px-1">New ({unread.length})</h2>
                  {renderList(unread)}
                </div>
              )}
              {read.length > 0 && (
                <div>
                  <h2 className="text-xs font-bold text-outline uppercase tracking-widest mb-3 px-1">Earlier</h2>
                  {renderList(read)}
                </div>
              )}
            </section>

            {/* Right: detail — only when selected */}
            {selected && (() => {
              const meta = TYPE_META[selected.type] ?? TYPE_META.maintenance
              return (
                <section className="lg:col-span-7 bg-surface-container-lowest rounded-2xl overflow-hidden shadow-card">
                  <div className="p-8 bg-surface-container-low border-b border-outline-variant/10 flex items-start justify-between gap-4">
                    <div>
                      <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center mb-4', meta.iconBg)}>
                        <span className={cn('material-symbols-outlined text-xl', meta.iconColor)}>{meta.icon}</span>
                      </div>
                      <span className="badge bg-surface-container text-on-surface-variant capitalize text-xs mb-3 inline-block">{meta.label}</span>
                      <h2 className="text-2xl font-headline font-extrabold text-on-surface leading-tight">{selected.title}</h2>
                      <p className="text-sm text-on-surface-variant mt-1">{formatDate(selected.created_at, "MMM d, yyyy 'at' h:mm a")}</p>
                    </div>
                    <button onClick={() => setSelected(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors flex-shrink-0">
                      <span className="material-symbols-outlined text-base text-on-surface-variant">close</span>
                    </button>
                  </div>
                  <div className="p-8 space-y-6">
                    <p className="text-base text-on-surface leading-relaxed">{selected.body}</p>
                    <Link href={meta.href} className="btn-primary inline-flex items-center gap-2 h-11 px-5">
                      <span className="material-symbols-outlined text-sm">open_in_new</span>
                      View in {meta.label}
                    </Link>
                  </div>
                </section>
              )
            })()}
          </div>
        )}
      </div>
    </AppLayout>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'
import { formatRelative, cn } from '@/lib/utils'
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
  maintenance: { icon: 'build', iconBg: 'bg-tertiary-container/20', iconColor: 'text-tertiary', label: 'Maintenance', href: '/portal/maintenance' },
  payment: { icon: 'payments', iconBg: 'bg-primary-container/20', iconColor: 'text-primary', label: 'Payments', href: '/portal' },
  lease: { icon: 'description', iconBg: 'bg-error-container/20', iconColor: 'text-error', label: 'Lease', href: '/portal/lease' },
}

function NotificationItem({ n, onSelect, onDelete }: { n: NotificationRow; onSelect: () => void; onDelete: () => void }) {
  const meta = TYPE_META[n.type] ?? TYPE_META.maintenance
  return (
    <div className="group relative">
      <button
        onClick={onSelect}
        className={cn(
          'w-full flex items-start gap-4 px-5 py-4 transition-all text-left pr-10',
          !n.read ? 'bg-primary-fixed/10 hover:bg-primary-fixed/20' : 'hover:bg-surface-container-low/50'
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
      <button
        onClick={e => { e.stopPropagation(); onDelete() }}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full opacity-100 lg:opacity-0 lg:group-hover:opacity-100 hover:bg-surface-container transition-all text-on-surface-variant"
        aria-label="Delete notification"
      >
        <span className="material-symbols-outlined text-xs">close</span>
      </button>
    </div>
  )
}

export default function TenantNotificationsPage() {
  const { profile, loading: authLoading } = useAuth()
  const supabase = createClient()
  const router = useRouter()

  const [notifications, setNotifications] = useState<NotificationRow[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!profile) return
    setLoading(true)
    async function load() {
      const { data } = await supabase
        .from('notifications')
        .select('id, type, title, body, read, created_at')
        .eq('profile_id', profile!.id)
        .order('created_at', { ascending: false })
      setNotifications((data as NotificationRow[]) ?? [])
      setLoading(false)
    }
    load()

    const channel = supabase
      .channel('portal-notifications-page')
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

  async function handleSelect(n: NotificationRow) {
    if (!n.read) {
      await supabase.from('notifications').update({ read: true }).eq('id', n.id)
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))
    }
    const meta = TYPE_META[n.type] ?? TYPE_META.maintenance
    router.push(meta.href)
  }

  async function handleDelete(id: string) {
    await supabase.from('notifications').delete().eq('id', id)
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  async function handleMarkAllRead() {
    if (!profile) return
    await supabase.from('notifications').update({ read: true }).eq('profile_id', profile.id).eq('read', false)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  async function handleClearAll() {
    if (!profile) return
    await supabase.from('notifications').delete().eq('profile_id', profile.id)
    setNotifications([])
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
        <NotificationItem key={n.id} n={n} onSelect={() => handleSelect(n)} onDelete={() => handleDelete(n.id)} />
      ))}
    </div>
  )

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">

        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-headline font-extrabold text-on-surface tracking-tight">Notifications</h1>
            <p className="text-on-surface-variant mt-1 text-sm">Updates on your requests and lease</p>
          </div>
          {notifications.length > 0 && (
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button onClick={handleMarkAllRead} className="btn-secondary h-10 px-4 text-sm">
                  Mark all as read
                </button>
              )}
              <button onClick={handleClearAll} className="btn-secondary h-10 px-4 text-sm text-error hover:bg-error-container/20">
                Clear all
              </button>
            </div>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl mb-3">notifications_none</span>
            <p className="font-bold text-on-surface text-lg">No notifications yet</p>
            <p className="text-sm mt-1">Updates about your maintenance requests and lease will appear here.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
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
          </div>
        )}
      </div>
    </AppLayout>
  )
}

'use client'

import { cn, formatRelative } from '@/lib/utils'
import type { Announcement } from '@/types'

const CHANNEL_META = {
  email:  { label: 'Email',   icon: 'mail' },
  sms:    { label: 'SMS',     icon: 'sms' },
  push:   { label: 'Push',    icon: 'notifications' },
  in_app: { label: 'In-App', icon: 'phone_iphone' },
} as const

const STATUS_STYLE: Record<string, string> = {
  sent:      'bg-secondary-container text-on-secondary-container',
  scheduled: 'bg-tertiary-fixed/40 text-tertiary',
  draft:     'bg-surface-container-high text-on-surface-variant',
}

interface Props {
  announcements: Announcement[]
  loading: boolean
}

export default function AnnouncementHistory({ announcements, loading }: Props) {
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-4 space-y-3">
      <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest px-1 mb-3">Sent &amp; Scheduled</p>
      {loading && (
        <p className="text-sm text-on-surface-variant text-center py-8">Loading...</p>
      )}
      {!loading && announcements.length === 0 && (
        <p className="text-sm text-on-surface-variant text-center py-8">No announcements yet</p>
      )}
      {announcements.map(ann => (
        <div key={ann.id} className="bg-surface-container-lowest rounded-2xl p-4 hover:bg-surface-container-low transition-colors cursor-pointer">
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="font-bold text-on-surface text-sm leading-tight">{ann.title}</p>
            <span className={cn('badge flex-shrink-0', STATUS_STYLE[ann.status])}>{ann.status}</span>
          </div>
          <p className="text-xs text-on-surface-variant line-clamp-2 mb-3">{ann.message}</p>
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {ann.channels.map(ch => (
                <span key={ch} className="w-5 h-5 rounded bg-surface-container-high flex items-center justify-center" title={CHANNEL_META[ch as keyof typeof CHANNEL_META]?.label}>
                  <span className="material-symbols-outlined text-[11px] text-on-surface-variant">
                    {CHANNEL_META[ch as keyof typeof CHANNEL_META]?.icon}
                  </span>
                </span>
              ))}
            </div>
            <p className="text-[10px] text-on-surface-variant">
              {ann.recipients} recipients · {ann.sent_at ? formatRelative(ann.sent_at) : '—'}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

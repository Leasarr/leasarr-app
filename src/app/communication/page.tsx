'use client'

import { useState, useRef, useEffect } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { CONVERSATIONS, TENANTS, ANNOUNCEMENTS, PROPERTIES } from '@/data/mock'
import { formatRelative, formatDate, getInitials, cn } from '@/lib/utils'
import type { Conversation, Message } from '@/types'

type Mode = 'messages' | 'announcements'

const CHANNEL_META = {
  email:  { label: 'Email',       icon: 'mail' },
  sms:    { label: 'SMS',         icon: 'sms' },
  push:   { label: 'Push',        icon: 'notifications' },
  in_app: { label: 'In-App',      icon: 'phone_iphone' },
} as const

type Channel = keyof typeof CHANNEL_META

const ANN_STATUS_STYLE: Record<string, string> = {
  sent:      'bg-secondary-container text-on-secondary-container',
  scheduled: 'bg-tertiary-fixed/40 text-tertiary',
  draft:     'bg-surface-container-high text-on-surface-variant',
}

export default function CommunicationPage() {
  const [mode, setMode] = useState<Mode>('messages')

  // ── Messages state ────────────────────────────────────────────────────────
  const [active, setActive] = useState<Conversation>(CONVERSATIONS[0])
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>(CONVERSATIONS[0].messages ?? [])
  const [search, setSearch] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMessages(active.messages ?? [])
    messagesEndRef.current?.scrollIntoView()
  }, [active])

  const handleSend = () => {
    if (!message.trim()) return
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      conversation_id: active.id,
      sender_id: 'mgr1',
      sender_role: 'manager',
      content: message.trim(),
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, newMsg])
    setMessage('')
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  const totalUnread = CONVERSATIONS.reduce((s, c) => s + c.unread_count, 0)
  const filteredConvs = CONVERSATIONS.filter(c => {
    const tenant = TENANTS.find(t => t.id === c.tenant_id)
    const name = `${tenant?.first_name} ${tenant?.last_name}`.toLowerCase()
    return search === '' || name.includes(search.toLowerCase())
  })

  // ── Announcement compose state ────────────────────────────────────────────
  const [annTitle, setAnnTitle] = useState('')
  const [annMessage, setAnnMessage] = useState('')
  const [annChannels, setAnnChannels] = useState<Channel[]>(['email', 'in_app'])
  const [annPropertyIds, setAnnPropertyIds] = useState<string[]>([])

  const toggleChannel = (ch: Channel) => {
    setAnnChannels(prev => prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch])
  }
  const toggleProperty = (id: string) => {
    setAnnPropertyIds(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])
  }

  return (
    <AppLayout>
      <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] max-w-7xl mx-auto overflow-hidden">

        {/* ── Sidebar ── */}
        <aside className="w-full md:w-96 flex flex-col bg-surface md:bg-surface-container-low border-r border-outline-variant/20 overflow-hidden flex-shrink-0">

          {/* Mode Toggle */}
          <div className="px-4 pt-5 pb-3">
            <div className="flex gap-1 bg-surface-container rounded-xl p-1">
              <button
                onClick={() => setMode('messages')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-bold transition-all',
                  mode === 'messages' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                )}
              >
                <span className="material-symbols-outlined text-base">chat</span>
                Messages
                {totalUnread > 0 && (
                  <span className="bg-primary text-on-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">{totalUnread}</span>
                )}
              </button>
              <button
                onClick={() => setMode('announcements')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-bold transition-all',
                  mode === 'announcements' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                )}
              >
                <span className="material-symbols-outlined text-base">campaign</span>
                Broadcast
              </button>
            </div>
          </div>

          {/* ── Messages Sidebar Content ── */}
          {mode === 'messages' && (
            <>
              <div className="px-6 pb-4">
                <input
                  className="input-base"
                  placeholder="Search tenants or units..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              <div className="px-6 mb-4 flex gap-3 overflow-x-auto no-scrollbar">
                <div className="flex-shrink-0 flex flex-col items-center gap-1">
                  <div className="w-14 h-14 rounded-2xl bg-primary-container flex items-center justify-center text-on-primary-container cursor-pointer hover:opacity-90 transition-opacity">
                    <span className="material-symbols-outlined">add</span>
                  </div>
                  <span className="text-[10px] font-semibold text-secondary">New Chat</span>
                </div>
                {TENANTS.slice(0, 3).map(tenant => (
                  <div key={tenant.id} className="flex-shrink-0 flex flex-col items-center gap-1">
                    <div className="w-14 h-14 rounded-2xl bg-secondary-container flex items-center justify-center font-bold text-primary text-lg cursor-pointer hover:opacity-90 transition-opacity">
                      {getInitials(`${tenant.first_name} ${tenant.last_name}`)}
                    </div>
                    <span className="text-[10px] font-semibold text-secondary">{tenant.first_name}</span>
                  </div>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar px-2">
                {filteredConvs.map(conv => {
                  const tenant = TENANTS.find(t => t.id === conv.tenant_id)
                  const isActive = active.id === conv.id
                  const hasUnread = conv.unread_count > 0
                  return (
                    <div
                      key={conv.id}
                      onClick={() => setActive(conv)}
                      className={cn(
                        'mx-2 mb-1 p-4 rounded-2xl flex items-center gap-4 cursor-pointer transition-all',
                        isActive ? 'bg-surface-container-lowest shadow-sm' : 'hover:bg-surface-container/50'
                      )}
                    >
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center font-bold text-primary">
                          {getInitials(`${tenant?.first_name} ${tenant?.last_name}`)}
                        </div>
                        {hasUnread && (
                          <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-surface rounded-full" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <h3 className={cn('text-sm truncate', hasUnread ? 'font-bold text-on-surface' : 'font-semibold text-on-surface')}>
                            {tenant?.first_name} {tenant?.last_name}
                          </h3>
                          <span className={cn('text-[10px] font-medium flex-shrink-0 ml-2', isActive ? 'text-primary' : 'text-outline')}>
                            {conv.last_message_at ? formatRelative(conv.last_message_at) : ''}
                          </span>
                        </div>
                        <p className={cn('text-xs truncate', hasUnread ? 'text-on-surface font-medium' : 'text-outline')}>
                          {conv.last_message ?? 'No messages yet'}
                        </p>
                      </div>
                      {hasUnread && <div className="w-2.5 h-2.5 bg-primary rounded-full flex-shrink-0" />}
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {/* ── Announcements Sidebar Content (History) ── */}
          {mode === 'announcements' && (
            <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-4 space-y-3">
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest px-1 mb-3">Sent & Scheduled</p>
              {ANNOUNCEMENTS.map(ann => (
                <div key={ann.id} className="bg-surface-container-lowest rounded-2xl p-4 hover:bg-white transition-colors cursor-pointer">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="font-bold text-on-surface text-sm leading-tight">{ann.title}</p>
                    <span className={cn('badge text-[10px] flex-shrink-0', ANN_STATUS_STYLE[ann.status])}>{ann.status}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant line-clamp-2 mb-3">{ann.message}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {ann.channels.map(ch => (
                        <span key={ch} className="w-5 h-5 rounded bg-surface-container-high flex items-center justify-center" title={CHANNEL_META[ch].label}>
                          <span className="material-symbols-outlined text-[11px] text-on-surface-variant">{CHANNEL_META[ch].icon}</span>
                        </span>
                      ))}
                    </div>
                    <p className="text-[10px] text-on-surface-variant">
                      {ann.recipients} recipients · {formatRelative(ann.sent_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* ── Main Panel ── */}
        {mode === 'messages' ? (
          <section className="flex-1 flex flex-col bg-surface h-full overflow-hidden">

            {/* Chat Header */}
            {(() => {
              const tenant = TENANTS.find(t => t.id === active.tenant_id)
              return (
                <div className="px-6 py-4 flex items-center justify-between border-b border-outline-variant/20 bg-surface-container-low/30 backdrop-blur-sm flex-shrink-0">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center font-bold text-primary">
                      {getInitials(`${tenant?.first_name} ${tenant?.last_name}`)}
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-on-surface">{tenant?.first_name} {tenant?.last_name}</h2>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">Active Now</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-outline hover:text-primary transition-colors rounded-full hover:bg-surface-container">
                      <span className="material-symbols-outlined">call</span>
                    </button>
                    <button className="p-2 text-outline hover:text-primary transition-colors rounded-full hover:bg-surface-container">
                      <span className="material-symbols-outlined">info</span>
                    </button>
                  </div>
                </div>
              )
            })()}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-6 no-scrollbar">
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-surface-container-highest" />
                <span className="text-[10px] font-bold text-outline uppercase tracking-widest">Today</span>
                <div className="flex-1 h-px bg-surface-container-highest" />
              </div>

              {messages.map(msg => {
                const isManager = msg.sender_role === 'manager'
                return (
                  <div key={msg.id} className={cn('flex gap-3 max-w-[85%]', isManager && 'self-end flex-row-reverse')}>
                    {!isManager && (
                      <div className="w-8 h-8 rounded-lg flex-shrink-0 bg-secondary-container flex items-center justify-center text-xs font-bold text-primary">
                        T
                      </div>
                    )}
                    <div className={cn('flex flex-col gap-1', isManager && 'items-end')}>
                      <div className={cn(
                        'px-4 py-3 rounded-2xl text-sm leading-relaxed',
                        isManager
                          ? 'primary-gradient text-white rounded-tr-none shadow-sm'
                          : 'bg-surface-container-high text-on-surface rounded-tl-none'
                      )}>
                        {msg.content}
                      </div>
                      <div className={cn('flex items-center gap-1', isManager && 'flex-row-reverse')}>
                        <span className="text-[10px] font-medium text-outline">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isManager && <span className="material-symbols-outlined text-[14px] text-primary material-symbols-filled">done_all</span>}
                      </div>
                    </div>
                  </div>
                )
              })}

              <div className="flex gap-3 items-center max-w-[85%]">
                <div className="w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">T</div>
                <div className="bg-surface-container-low px-3 py-2 rounded-full flex gap-1">
                  <div className="bounce-dot w-1.5 h-1.5 bg-outline-variant rounded-full" />
                  <div className="bounce-dot w-1.5 h-1.5 bg-outline-variant rounded-full" style={{ animationDelay: '-0.32s' }} />
                  <div className="bounce-dot w-1.5 h-1.5 bg-outline-variant rounded-full" style={{ animationDelay: '-0.16s' }} />
                </div>
              </div>

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-5 bg-surface-container-lowest/50 backdrop-blur-md border-t border-outline-variant/10 flex-shrink-0">
              <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
                {['Yes, perfect.', 'Let me check.', 'Confirmed.', 'No problem!'].map(r => (
                  <button
                    key={r}
                    onClick={() => setMessage(r)}
                    className="flex-shrink-0 px-4 py-1.5 rounded-full border border-outline-variant text-xs font-semibold hover:bg-primary hover:text-on-primary hover:border-primary transition-all"
                  >
                    {r}
                  </button>
                ))}
              </div>
              <div className="flex items-end gap-3 bg-surface-container-low p-2 rounded-[2rem] shadow-inner">
                <button className="w-10 h-10 flex items-center justify-center rounded-full text-outline hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">add_circle</span>
                </button>
                <textarea
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-1 resize-none placeholder:text-outline/70 text-on-surface outline-none"
                  placeholder="Type your message..."
                  rows={1}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }}}
                />
                <button className="w-10 h-10 flex items-center justify-center rounded-full text-outline hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">mood</span>
                </button>
                <button
                  onClick={handleSend}
                  className="w-10 h-10 flex items-center justify-center rounded-full primary-gradient text-white shadow-lg active:scale-90 transition-transform"
                >
                  <span className="material-symbols-outlined">send</span>
                </button>
              </div>
            </div>
          </section>
        ) : (
          /* ── Announcements Compose Panel ── */
          <section className="flex-1 flex flex-col bg-surface h-full overflow-y-auto">
            <div className="px-8 py-6 border-b border-outline-variant/20 bg-surface-container-low/30 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">campaign</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold font-headline text-on-surface">New Announcement</h2>
                  <p className="text-xs text-on-surface-variant">Broadcast to tenants across one or all properties</p>
                </div>
              </div>
            </div>

            <div className="flex-1 px-8 py-6 space-y-6 max-w-2xl">

              {/* Title */}
              <div>
                <label className="block text-sm font-bold text-on-surface mb-2">Announcement Title</label>
                <input
                  className="input-base"
                  placeholder="e.g. Scheduled Water Shutdown — July 15"
                  value={annTitle}
                  onChange={e => setAnnTitle(e.target.value)}
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-bold text-on-surface mb-2">Message</label>
                <textarea
                  className="input-base min-h-[120px] resize-none"
                  placeholder="Write your announcement here..."
                  value={annMessage}
                  onChange={e => setAnnMessage(e.target.value)}
                  rows={5}
                />
                <p className="text-xs text-on-surface-variant mt-1 text-right">{annMessage.length} / 500</p>
              </div>

              {/* Channels */}
              <div>
                <label className="block text-sm font-bold text-on-surface mb-3">Delivery Channels</label>
                <div className="grid grid-cols-2 gap-3">
                  {(Object.entries(CHANNEL_META) as [Channel, typeof CHANNEL_META[Channel]][]).map(([key, meta]) => {
                    const selected = annChannels.includes(key)
                    return (
                      <button
                        key={key}
                        onClick={() => toggleChannel(key)}
                        className={cn(
                          'flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left',
                          selected
                            ? 'border-primary bg-primary-container/20 text-primary'
                            : 'border-outline-variant bg-surface-container-low text-on-surface-variant hover:border-primary/40'
                        )}
                      >
                        <span className={cn(
                          'w-9 h-9 rounded-lg flex items-center justify-center',
                          selected ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'
                        )}>
                          <span className="material-symbols-outlined text-lg">{meta.icon}</span>
                        </span>
                        <div>
                          <p className="font-bold text-sm">{meta.label}</p>
                          <p className="text-[10px] opacity-70">{selected ? 'Enabled' : 'Disabled'}</p>
                        </div>
                        {selected && (
                          <span className="material-symbols-outlined text-primary ml-auto text-base material-symbols-filled">check_circle</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Properties */}
              <div>
                <label className="block text-sm font-bold text-on-surface mb-1">Send To</label>
                <p className="text-xs text-on-surface-variant mb-3">Leave all unselected to broadcast to all properties</p>
                <div className="flex flex-wrap gap-2">
                  {PROPERTIES.map(p => {
                    const sel = annPropertyIds.includes(p.id)
                    return (
                      <button
                        key={p.id}
                        onClick={() => toggleProperty(p.id)}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-semibold transition-all',
                          sel ? 'border-primary bg-primary-container/20 text-primary' : 'border-outline-variant text-on-surface-variant hover:border-primary/40'
                        )}
                      >
                        <span className="material-symbols-outlined text-sm">{p.type === 'commercial' ? 'business' : 'apartment'}</span>
                        {p.name}
                      </button>
                    )
                  })}
                </div>
                {annPropertyIds.length === 0 && (
                  <p className="text-xs text-primary font-medium mt-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">info</span>
                    Will send to all {PROPERTIES.length} properties
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button className="btn-secondary flex items-center gap-2 px-6">
                  <span className="material-symbols-outlined text-base">schedule_send</span>
                  Schedule
                </button>
                <button
                  className={cn(
                    'btn-primary flex items-center gap-2 px-8',
                    (!annTitle.trim() || !annMessage.trim() || annChannels.length === 0) && 'opacity-50 cursor-not-allowed'
                  )}
                  disabled={!annTitle.trim() || !annMessage.trim() || annChannels.length === 0}
                >
                  <span className="material-symbols-outlined text-base">send</span>
                  Send Now
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </AppLayout>
  )
}

'use client'

import { useState, useRef, useEffect } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { CONVERSATIONS, TENANTS } from '@/data/mock'
import { formatRelative, getInitials, cn } from '@/lib/utils'
import type { Conversation, Message } from '@/types'

export default function CommunicationPage() {
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

  return (
    <AppLayout>
      {/* Full-height layout */}
      <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] max-w-7xl mx-auto overflow-hidden">

        {/* ── Sidebar ── */}
        <aside className="w-full md:w-96 flex flex-col bg-surface md:bg-surface-container-low border-r border-outline-variant/20 overflow-hidden flex-shrink-0">

          <div className="px-6 py-6">
            <div className="flex items-center justify-between mb-5">
              <h1 className="text-2xl font-headline font-extrabold tracking-tight">Messages</h1>
              {totalUnread > 0 && (
                <span className="bg-primary text-on-primary text-xs font-bold px-2 py-1 rounded-full">{totalUnread} New</span>
              )}
            </div>

            {/* Search */}
            <input
              className="input-base"
              placeholder="Search tenants or units..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Horizontal Quick Access */}
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

          {/* Conversation List */}
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
        </aside>

        {/* ── Chat View ── */}
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
          <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-6 no-scrollbar scrollbar-thin">

            {/* Date Separator */}
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

            {/* Typing Indicator */}
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

          {/* Message Input Area */}
          <div className="p-5 bg-surface-container-lowest/50 backdrop-blur-md border-t border-outline-variant/10 flex-shrink-0">
            {/* Quick Replies */}
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

            {/* Input Field */}
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
      </div>
    </AppLayout>
  )
}

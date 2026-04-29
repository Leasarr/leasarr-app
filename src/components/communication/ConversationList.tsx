'use client'

import { cn, formatRelative, getInitials } from '@/lib/utils'
import type { Conversation, Tenant } from '@/types'

interface Props {
  conversations: Conversation[]
  activeId: string | null
  onSelect: (conv: Conversation) => void
  search: string
  onSearchChange: (v: string) => void
  onNewChat: () => void
  tenants: Tenant[]
}

export default function ConversationList({
  conversations,
  activeId,
  onSelect,
  search,
  onSearchChange,
  onNewChat,
  tenants,
}: Props) {
  const filtered = conversations.filter(c => {
    if (!search) return true
    const tenant = tenants.find(t => t.id === c.tenant_id)
    const name = `${tenant?.first_name ?? ''} ${tenant?.last_name ?? ''}`.toLowerCase()
    return name.includes(search.toLowerCase())
  })

  const totalUnread = conversations.reduce((s, c) => s + c.unread_count, 0)
  const recentTenants = tenants.slice(0, 5)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 pt-5 pb-3 flex-shrink-0">
        <input
          className="input-base"
          placeholder="Search tenants or units..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>

      <div className="px-6 mb-4 flex gap-3 overflow-x-auto no-scrollbar flex-shrink-0">
        <div className="flex-shrink-0 flex flex-col items-center gap-1">
          <button
            onClick={onNewChat}
            className="w-14 h-14 rounded-2xl bg-primary-container flex items-center justify-center text-on-primary-container hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
          <span className="text-[10px] font-semibold text-secondary">New Chat</span>
        </div>
        {recentTenants.map(tenant => (
          <div key={tenant.id} className="flex-shrink-0 flex flex-col items-center gap-1">
            <div className="w-14 h-14 rounded-2xl bg-secondary-container flex items-center justify-center font-bold text-primary text-lg cursor-pointer hover:opacity-90 transition-opacity">
              {getInitials(`${tenant.first_name} ${tenant.last_name}`)}
            </div>
            <span className="text-[10px] font-semibold text-secondary">{tenant.first_name}</span>
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-2">
        {filtered.length === 0 && (
          <p className="text-center text-sm text-on-surface-variant py-8">No conversations found</p>
        )}
        {filtered.map(conv => {
          const tenant = tenants.find(t => t.id === conv.tenant_id)
          const isActive = activeId === conv.id
          const hasUnread = conv.unread_count > 0
          return (
            <div
              key={conv.id}
              onClick={() => onSelect(conv)}
              className={cn(
                'mx-2 mb-1 p-4 rounded-2xl flex items-center gap-4 cursor-pointer transition-all',
                isActive ? 'bg-surface-container-lowest shadow-sm' : 'hover:bg-surface-container/50'
              )}
            >
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center font-bold text-primary">
                  {getInitials(`${tenant?.first_name ?? '?'} ${tenant?.last_name ?? ''}`)}
                </div>
                {hasUnread && (
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-success border-2 border-surface rounded-full" />
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
    </div>
  )
}

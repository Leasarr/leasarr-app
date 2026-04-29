'use client'

import { useRef, useEffect } from 'react'
import { getInitials } from '@/lib/utils'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'
import { LoadingState } from '@/components/patterns/LoadingState'
import type { Conversation, Message, Tenant } from '@/types'

interface Props {
  conversation: Conversation
  tenant: Tenant | undefined
  messages: Message[]
  loading: boolean
  onSend: (content: string) => void
}

export default function ChatPanel({ conversation, tenant, messages, loading, onSend }: Props) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const tenantInitial = tenant ? getInitials(`${tenant.first_name} ${tenant.last_name}`).charAt(0) : '?'

  return (
    <section className="flex-1 flex flex-col bg-surface h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-outline-variant/20 bg-surface-container-low/30 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center font-bold text-primary">
            {tenant ? getInitials(`${tenant.first_name} ${tenant.last_name}`) : '?'}
          </div>
          <div>
            <h2 className="text-sm font-bold text-on-surface">
              {tenant ? `${tenant.first_name} ${tenant.last_name}` : 'Unknown Tenant'}
            </h2>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-success rounded-full" />
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-6 no-scrollbar">
        {loading ? (
          <LoadingState label="Loading messages..." size="panel" />
        ) : (
          <>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-surface-container-highest" />
              <span className="text-[10px] font-bold text-outline uppercase tracking-widest">Today</span>
              <div className="flex-1 h-px bg-surface-container-highest" />
            </div>

            {messages.map(msg => (
              <MessageBubble key={msg.id} message={msg} tenantInitial={tenantInitial} />
            ))}

            <div ref={endRef} />
          </>
        )}
      </div>

      <MessageInput onSend={onSend} />
    </section>
  )
}

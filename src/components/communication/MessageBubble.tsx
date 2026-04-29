'use client'

import { cn } from '@/lib/utils'
import type { Message } from '@/types'

interface Props {
  message: Message
  tenantInitial: string
  perspective?: 'manager' | 'tenant'
}

export default function MessageBubble({ message, tenantInitial, perspective = 'manager' }: Props) {
  const isSelf = perspective === 'manager'
    ? message.sender_role === 'manager'
    : message.sender_role === 'tenant'
  return (
    <div className={cn('flex gap-3 max-w-[85%]', isSelf && 'self-end flex-row-reverse')}>
      {!isSelf && (
        <div className="w-8 h-8 rounded-lg flex-shrink-0 bg-secondary-container flex items-center justify-center text-xs font-bold text-primary">
          {tenantInitial}
        </div>
      )}
      <div className={cn('flex flex-col gap-1', isSelf && 'items-end')}>
        <div className={cn(
          'px-4 py-3 rounded-2xl text-sm leading-relaxed',
          isSelf
            ? 'primary-gradient text-white rounded-tr-none shadow-sm'
            : 'bg-surface-container-high text-on-surface rounded-tl-none'
        )}>
          {message.content}
        </div>
        <div className={cn('flex items-center gap-1', isSelf && 'flex-row-reverse')}>
          <span className="text-[10px] font-medium text-outline">
            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isSelf && (
            <span className="material-symbols-outlined text-[14px] text-primary material-symbols-filled">
              {message.read_at ? 'done_all' : 'done'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

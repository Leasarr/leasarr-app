'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { LoadingState } from '@/components/patterns/LoadingState'
import { EmptyState } from '@/components/patterns/EmptyState'
import MessageBubble from '@/components/communication/MessageBubble'
import MessageInput from '@/components/communication/MessageInput'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { getInitials } from '@/lib/utils'
import type { Conversation, Message } from '@/types'

type ManagerInfo = { id: string; name: string; email: string }

export default function PortalMessagesPage() {
  const { profile, loading: authLoading } = useAuth()
  const supabase = createClient()

  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [manager, setManager] = useState<ManagerInfo | null>(null)
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [managerId, setManagerId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const endRef = useRef<HTMLDivElement>(null)
  const unreadRef = useRef(0)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Fetch tenant's conversation and manager info
  useEffect(() => {
    if (!profile?.id) return

    async function load() {
      setLoading(true)

      // Get tenant record to find manager
      const { data: tenantData } = await supabase
        .from('tenants')
        .select('id, property:properties(manager_id)')
        .eq('profile_id', profile!.id)
        .maybeSingle()

      if (!tenantData) { setLoading(false); return }
      const t = tenantData as unknown as { id: string; property: { manager_id: string } | null }

      const mgrId = t.property?.manager_id
      if (!mgrId) { setLoading(false); return }

      setTenantId(t.id)
      setManagerId(mgrId)

      const [convRes, managerRes] = await Promise.all([
        supabase
          .from('conversations')
          .select('*')
          .eq('tenant_id', t.id)
          .eq('manager_id', mgrId)
          .maybeSingle(),
        supabase
          .from('profiles')
          .select('id, name, email')
          .eq('id', mgrId)
          .maybeSingle(),
      ])

      if (managerRes.data) setManager(managerRes.data as ManagerInfo)

      if (convRes.data) {
        setConversation(convRes.data as Conversation)

        const { data: msgs } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', convRes.data.id)
          .order('created_at')

        if (msgs) setMessages(msgs as Message[])

        // Mark as read
        await supabase
          .from('conversations')
          .update({ unread_count: 0 })
          .eq('id', convRes.data.id)
      }

      setLoading(false)
    }

    load()
  }, [profile?.id])

  // Realtime subscription
  useEffect(() => {
    if (!conversation) return

    const channel = supabase
      .channel(`portal-messages:${conversation.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversation.id}`,
      }, (payload: { new: Message }) => {
        setMessages(prev => {
          const exists = prev.find(m => m.id === payload.new.id)
          return exists ? prev : [...prev, payload.new]
        })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [conversation?.id])

  const handleSend = useCallback(async (content: string) => {
    if (!profile?.id || !tenantId || !managerId) return

    let conv = conversation

    if (!conv) {
      const { data: newConv } = await supabase
        .from('conversations')
        .insert({ tenant_id: tenantId, manager_id: managerId, unread_count: 0 })
        .select()
        .single()
      if (!newConv) return
      conv = newConv as Conversation
      setConversation(conv)
    }

    const optimistic: Message = {
      id: `opt-${Date.now()}`,
      conversation_id: conv.id,
      sender_id: profile.id,
      sender_role: 'tenant',
      content,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, optimistic])

    const { data } = await supabase
      .from('messages')
      .insert({
        conversation_id: conv.id,
        sender_id: profile.id,
        sender_role: 'tenant',
        content,
      })
      .select()
      .single()

    if (data) {
      setMessages(prev => prev.map(m => m.id === optimistic.id ? data as Message : m))
      unreadRef.current += 1
      const snippet = content.length > 60 ? content.slice(0, 60) + '…' : content
      await supabase
        .from('conversations')
        .update({
          unread_count: unreadRef.current,
          last_message: snippet,
          last_message_at: (data as Message).created_at,
        })
        .eq('id', conv.id)
    }
  }, [conversation, profile?.id, tenantId, managerId])

  if (authLoading || loading) {
    return (
      <AppLayout>
        <LoadingState label="Loading messages..." size="page" />
      </AppLayout>
    )
  }

  const managerInitial = manager ? getInitials(manager.name).charAt(0) : 'M'

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100dvh-10rem)] lg:h-[calc(100dvh-3.5rem)] lg:-mb-8 overflow-hidden bg-surface">

        {/* Header */}
        <div className="px-6 py-4 flex items-center gap-4 border-b border-outline-variant/20 bg-surface-container-low/30 flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center font-bold text-primary">
            {manager ? getInitials(manager.name) : 'PM'}
          </div>
          <div>
            <h2 className="text-sm font-bold text-on-surface">
              {manager?.name ?? 'Property Manager'}
            </h2>
            <p className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">Your Manager</p>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-6 no-scrollbar">
          {!conversation ? (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState
                icon="chat_bubble"
                title="Start a conversation"
                description="Send a message below to start chatting with your property manager."
                size="panel"
              />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState
                icon="chat_bubble_outline"
                title="No messages yet"
                description="Send your first message to your property manager."
                size="panel"
              />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-surface-container-highest" />
                <span className="text-[10px] font-bold text-outline uppercase tracking-widest">Conversation</span>
                <div className="flex-1 h-px bg-surface-container-highest" />
              </div>
              {messages.map(msg => (
                <MessageBubble key={msg.id} message={msg} tenantInitial={managerInitial} perspective="tenant" />
              ))}
              <div ref={endRef} />
            </>
          )}
        </div>

        {manager && <MessageInput onSend={handleSend} />}
      </div>
    </AppLayout>
  )
}

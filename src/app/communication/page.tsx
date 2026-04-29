'use client'

import { useState, useEffect, useCallback } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import ConversationList from '@/components/communication/ConversationList'
import ChatPanel from '@/components/communication/ChatPanel'
import AnnouncementHistory from '@/components/communication/AnnouncementHistory'
import BroadcastPanel from '@/components/communication/BroadcastPanel'
import NewChatModal from '@/components/communication/NewChatModal'
import type { Conversation, Message, Tenant, Property, Announcement } from '@/types'
import type { CreateAnnouncementInput } from '@/lib/schemas/communication'

type Mode = 'messages' | 'announcements'

export default function CommunicationPage() {
  const { profile } = useAuth()
  const supabase = createClient()

  const [mode, setMode] = useState<Mode>('messages')

  // ── Data ──────────────────────────────────────────────────────────────────
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])

  const [activeConv, setActiveConv] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [announcementsLoading, setAnnouncementsLoading] = useState(false)

  const [search, setSearch] = useState('')
  const [showNewChat, setShowNewChat] = useState(false)

  // ── Fetch conversations + tenants + properties ────────────────────────────
  useEffect(() => {
    if (!profile?.id) return

    async function load() {
      const [{ data: convRows }, { data: tenantRows }, { data: propRows }] = await Promise.all([
        supabase
          .from('conversations')
          .select('*')
          .order('last_message_at', { ascending: false, nullsFirst: false }),
        supabase.from('tenants').select('*').order('first_name'),
        supabase.from('properties').select('*').order('name'),
      ])
      if (convRows) {
        setConversations(convRows)
        if (!activeConv && convRows.length > 0) setActiveConv(convRows[0])
      }
      if (tenantRows) setTenants(tenantRows)
      if (propRows) setProperties(propRows)
    }

    load()
  }, [profile?.id])

  // ── Fetch messages for active conversation ────────────────────────────────
  useEffect(() => {
    if (!activeConv) return
    setMessagesLoading(true)

    const now = new Date().toISOString()

    supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', activeConv.id)
      .order('created_at')
      .then(({ data }: { data: Message[] | null }) => {
        if (data) {
          setMessages(data.map(m =>
            m.sender_role === 'tenant' && !m.read_at ? { ...m, read_at: now } : m
          ))
        }
        setMessagesLoading(false)
      })

    // Mark conversation read + individual tenant messages read
    supabase
      .from('conversations')
      .update({ unread_count: 0 })
      .eq('id', activeConv.id)
      .then(() => {
        setConversations(prev =>
          prev.map(c => c.id === activeConv.id ? { ...c, unread_count: 0 } : c)
        )
      })

    supabase
      .from('messages')
      .update({ read_at: now })
      .eq('conversation_id', activeConv.id)
      .eq('sender_role', 'tenant')
      .is('read_at', null)
      .then(() => {})
  }, [activeConv?.id])

  // ── Realtime: new messages ────────────────────────────────────────────────
  useEffect(() => {
    if (!activeConv) return

    const channel = supabase
      .channel(`messages:${activeConv.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${activeConv.id}`,
      }, (payload: { new: Message }) => {
        setMessages(prev => {
          const exists = prev.find(m => m.id === payload.new.id)
          return exists ? prev : [...prev, payload.new]
        })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [activeConv?.id])

  // ── Realtime: conversation list updates ───────────────────────────────────
  useEffect(() => {
    if (!profile?.id) return

    const channel = supabase
      .channel('conversations-list')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'conversations',
      }, (payload: { new: Conversation }) => {
        setConversations(prev =>
          prev.map(c => c.id === payload.new.id ? { ...c, ...payload.new } : c)
        )
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [profile?.id])

  // ── Fetch announcements ───────────────────────────────────────────────────
  useEffect(() => {
    if (mode !== 'announcements' || !profile?.id) return
    setAnnouncementsLoading(true)

    supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }: { data: Announcement[] | null }) => {
        if (data) setAnnouncements(data)
        setAnnouncementsLoading(false)
      })
  }, [mode, profile?.id])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSend = useCallback(async (content: string) => {
    if (!activeConv || !profile?.id) return

    const optimistic: Message = {
      id: `opt-${Date.now()}`,
      conversation_id: activeConv.id,
      sender_id: profile.id,
      sender_role: 'manager',
      content,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, optimistic])

    const { data } = await supabase
      .from('messages')
      .insert({
        conversation_id: activeConv.id,
        sender_id: profile.id,
        sender_role: 'manager',
        content,
      })
      .select()
      .single()

    if (data) {
      setMessages(prev => prev.map(m => m.id === optimistic.id ? data : m))
      const snippet = content.length > 60 ? content.slice(0, 60) + '…' : content
      await supabase
        .from('conversations')
        .update({ last_message: snippet, last_message_at: data.created_at })
        .eq('id', activeConv.id)
      setConversations(prev =>
        prev.map(c => c.id === activeConv.id
          ? { ...c, last_message: snippet, last_message_at: data.created_at }
          : c
        )
      )
    }
  }, [activeConv, profile?.id])

  const handleAnnouncement = useCallback(async (data: CreateAnnouncementInput): Promise<string | null> => {
    if (!profile?.id) return 'Not authenticated'

    const { error } = await supabase.from('announcements').insert({
      manager_id: profile.id,
      title: data.title,
      message: data.message,
      channels: data.channels,
      property_ids: data.property_ids,
      status: 'sent',
      sent_at: new Date().toISOString(),
      recipients: data.property_ids.length === 0
        ? tenants.length
        : tenants.filter(t => data.property_ids.includes(t.property_id ?? '')).length,
    })

    if (error) return error.message

    // Refresh list
    const { data: rows } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })
    if (rows) setAnnouncements(rows)

    return null
  }, [profile?.id, tenants])

  const totalUnread = conversations.reduce((s, c) => s + c.unread_count, 0)
  const activeTenant = tenants.find(t => t.id === activeConv?.tenant_id)

  return (
    <AppLayout>
      <div className="flex flex-col md:flex-row h-[calc(100dvh-10rem)] lg:h-[calc(100dvh-3.5rem)] lg:-mb-8 overflow-hidden">

        {/* ── Sidebar ── */}
        <aside className="w-full md:w-96 flex flex-col bg-surface md:bg-surface-container-low border-r border-outline-variant/20 overflow-hidden flex-shrink-0">

          {/* Mode toggle */}
          <div className="px-4 pt-5 pb-3 flex-shrink-0">
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

          {mode === 'messages' ? (
            <ConversationList
              conversations={conversations}
              activeId={activeConv?.id ?? null}
              onSelect={conv => setActiveConv(conv)}
              search={search}
              onSearchChange={setSearch}
              onNewChat={() => setShowNewChat(true)}
              tenants={tenants}
            />
          ) : (
            <AnnouncementHistory
              announcements={announcements}
              loading={announcementsLoading}
            />
          )}
        </aside>

        {/* ── Main Panel ── */}
        {mode === 'messages' ? (
          activeConv ? (
            <ChatPanel
              conversation={activeConv}
              tenant={activeTenant}
              messages={messages}
              loading={messagesLoading}
              onSend={handleSend}
            />
          ) : (
            <section className="flex-1 flex items-center justify-center bg-surface">
              <p className="text-on-surface-variant text-sm">Select a conversation to start messaging</p>
            </section>
          )
        ) : (
          <BroadcastPanel
            properties={properties}
            onSubmit={handleAnnouncement}
          />
        )}
      </div>
      <NewChatModal
        open={showNewChat}
        onClose={() => setShowNewChat(false)}
        tenants={tenants}
        onCreated={conv => {
          setConversations(prev => {
            const exists = prev.find(c => c.id === conv.id)
            return exists ? prev : [conv, ...prev]
          })
          setActiveConv(conv)
          setMode('messages')
        }}
      />
    </AppLayout>
  )
}

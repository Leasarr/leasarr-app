'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { getInitials } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import type { Tenant, Conversation } from '@/types'

interface Props {
  open: boolean
  onClose: () => void
  tenants: Tenant[]
  onCreated: (conv: Conversation) => void
}

export default function NewChatModal({ open, onClose, tenants, onCreated }: Props) {
  const { profile } = useAuth()
  const supabase = createClient()

  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const filtered = tenants.filter(t =>
    `${t.first_name} ${t.last_name}`.toLowerCase().includes(search.toLowerCase())
  )

  async function handleSelect(tenant: Tenant) {
    if (!profile?.id) return
    setLoading(true)
    setError('')

    const { data, error: err } = await supabase
      .from('conversations')
      .upsert(
        { manager_id: profile.id, tenant_id: tenant.id },
        { onConflict: 'manager_id,tenant_id', ignoreDuplicates: false }
      )
      .select()
      .single()

    setLoading(false)

    if (err) { setError(err.message); return }
    if (data) {
      onCreated(data as Conversation)
      setSearch('')
      onClose()
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="New Conversation" size="sm">
      <div className="space-y-4">
        <input
          className="input-base"
          placeholder="Search tenants..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoFocus
        />

        <div className="max-h-72 overflow-y-auto space-y-1 no-scrollbar">
          {filtered.length === 0 && (
            <p className="text-sm text-on-surface-variant text-center py-6">No tenants found</p>
          )}
          {filtered.map(t => (
            <button
              key={t.id}
              onClick={() => handleSelect(t)}
              disabled={loading}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container-low transition-colors text-left disabled:opacity-50"
            >
              <div className="w-9 h-9 rounded-lg bg-secondary-container flex items-center justify-center font-bold text-sm text-primary flex-shrink-0">
                {getInitials(`${t.first_name} ${t.last_name}`)}
              </div>
              <div>
                <p className="font-semibold text-sm text-on-surface">{t.first_name} {t.last_name}</p>
                <p className="text-xs text-on-surface-variant">{t.email}</p>
              </div>
            </button>
          ))}
        </div>

        {error && <p className="text-error text-xs">{error}</p>}

        <div className="flex justify-end pt-1">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </Modal>
  )
}

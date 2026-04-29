'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createAnnouncementSchema, type CreateAnnouncementInput } from '@/lib/schemas/communication'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { Property } from '@/types'

const CHANNEL_META = {
  email:  { label: 'Email',   icon: 'mail' },
  sms:    { label: 'SMS',     icon: 'sms' },
  push:   { label: 'Push',    icon: 'notifications' },
  in_app: { label: 'In-App', icon: 'phone_iphone' },
} as const

type Channel = keyof typeof CHANNEL_META

interface Props {
  properties: Property[]
  onSubmit: (data: CreateAnnouncementInput) => Promise<string | null>
}

export default function BroadcastPanel({ properties, onSubmit }: Props) {
  const [serverError, setServerError] = useState('')

  const form = useForm<CreateAnnouncementInput>({
    resolver: zodResolver(createAnnouncementSchema),
    defaultValues: {
      title: '',
      message: '',
      channels: ['email', 'in_app'],
      property_ids: [],
    },
  })

  const channels = form.watch('channels')
  const propertyIds = form.watch('property_ids')
  const message = form.watch('message')

  const toggleChannel = (ch: Channel) => {
    const next = channels.includes(ch) ? channels.filter(c => c !== ch) : [...channels, ch]
    form.setValue('channels', next, { shouldValidate: true })
  }

  const toggleProperty = (id: string) => {
    const next = propertyIds.includes(id) ? propertyIds.filter(p => p !== id) : [...propertyIds, id]
    form.setValue('property_ids', next)
  }

  const handleSubmit = form.handleSubmit(async data => {
    setServerError('')
    const err = await onSubmit(data)
    if (err) { setServerError(err); return }
    form.reset()
  })

  return (
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

      <form onSubmit={handleSubmit} className="flex-1 px-8 py-6 space-y-6 max-w-2xl">

        <div>
          <label className="block text-sm font-bold text-on-surface mb-2">Announcement Title</label>
          <input
            {...form.register('title')}
            className="input-base"
            placeholder="e.g. Scheduled Water Shutdown — July 15"
          />
          {form.formState.errors.title && (
            <p className="text-error text-xs mt-1">{form.formState.errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-on-surface mb-2">Message</label>
          <textarea
            {...form.register('message')}
            className="input-base min-h-[120px] resize-none"
            placeholder="Write your announcement here..."
            rows={5}
          />
          <p className="text-xs text-on-surface-variant mt-1 text-right">{message?.length ?? 0} / 500</p>
          {form.formState.errors.message && (
            <p className="text-error text-xs mt-1">{form.formState.errors.message.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-on-surface mb-3">Delivery Channels</label>
          {form.formState.errors.channels && (
            <p className="text-error text-xs mb-2">{form.formState.errors.channels.message}</p>
          )}
          <div className="grid grid-cols-2 gap-3">
            {(Object.entries(CHANNEL_META) as [Channel, typeof CHANNEL_META[Channel]][]).map(([key, meta]) => {
              const selected = channels.includes(key)
              return (
                <button
                  type="button"
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

        <div>
          <label className="block text-sm font-bold text-on-surface mb-1">Send To</label>
          <p className="text-xs text-on-surface-variant mb-3">Leave all unselected to broadcast to all properties</p>
          <div className="flex flex-wrap gap-2">
            {properties.map(p => {
              const sel = propertyIds.includes(p.id)
              return (
                <button
                  type="button"
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
          {propertyIds.length === 0 && (
            <p className="text-xs text-primary font-medium mt-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">info</span>
              Will send to all {properties.length} properties
            </p>
          )}
        </div>

        {serverError && (
          <p className="text-error text-sm">{serverError}</p>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" iconLeft="schedule_send">
            Schedule
          </Button>
          <Button type="submit" loading={form.formState.isSubmitting} iconLeft="send">
            {form.formState.isSubmitting ? 'Sending...' : 'Send Now'}
          </Button>
        </div>
      </form>
    </section>
  )
}

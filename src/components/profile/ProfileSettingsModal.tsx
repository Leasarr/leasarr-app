'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { getInitials, cn } from '@/lib/utils'
import Modal from '@/components/ui/Modal'

const MOCK_AUTH = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
}).refine(
  data => !(data.newPassword && !data.currentPassword),
  { message: 'Current password is required to set a new password', path: ['currentPassword'] }
).refine(
  data => !(data.newPassword && data.newPassword.length < 8),
  { message: 'New password must be at least 8 characters', path: ['newPassword'] }
)

type FormData = z.infer<typeof schema>

type Props = {
  open: boolean
  onClose: () => void
  onSignOut: () => void
}

export default function ProfileSettingsModal({ open, onClose, onSignOut }: Props) {
  const { profile, updateProfile } = useAuth()
  const supabase = createClient()
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [saveError, setSaveError] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  useEffect(() => {
    if (!open) {
      setSaveState('idle')
      setSaveError('')
    }
  }, [open])

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: {
      name: profile?.name ?? '',
      email: profile?.email ?? '',
      phone: profile?.phone ?? '',
      currentPassword: '',
      newPassword: '',
    },
  })

  async function onSubmit(data: FormData) {
    setSaveState('saving')
    setSaveError('')
    try {
      await updateProfile({ name: data.name, email: data.email, phone: data.phone || undefined })

      if (!MOCK_AUTH && data.email !== profile?.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email: data.email })
        if (emailError) throw emailError
      }

      if (!MOCK_AUTH && data.newPassword) {
        const { error } = await supabase.auth.updateUser({ password: data.newPassword })
        if (error) throw error
      }

      setSaveState('saved')
      timerRef.current = setTimeout(() => setSaveState('idle'), 2000)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Something went wrong')
      setSaveState('error')
    }
  }

  const initials = profile?.name ? getInitials(profile.name) : '?'
  const roleLabel = profile?.role === 'tenant' ? 'Tenant' : 'Property Manager'

  return (
    <Modal open={open} onClose={onClose} title="Profile & Settings" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        {/* Avatar + identity */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full primary-gradient flex items-center justify-center shrink-0">
            <span className="text-on-primary font-bold text-base">{initials}</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-on-surface">{profile?.name}</p>
            <p className="text-xs text-on-surface-variant">{roleLabel}</p>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-1.5">Full Name</label>
          <input type="text" className="input-base" {...register('name')} />
          {errors.name && <p className="text-xs text-error mt-1">{errors.name.message}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-1.5">Email</label>
          <input type="email" className="input-base" {...register('email')} />
          {errors.email && <p className="text-xs text-error mt-1">{errors.email.message}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-1.5">
            Phone <span className="text-on-surface-variant font-normal">(optional)</span>
          </label>
          <input type="tel" className="input-base" placeholder="+1 (555) 000-0000" {...register('phone')} />
        </div>

        {/* Password section */}
        <div className="border-t border-outline-variant/30 pt-4 space-y-4">
          <p className="text-sm font-bold text-on-surface">Change Password</p>

          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">Current Password</label>
            <input
              type="password"
              className={cn('input-base', MOCK_AUTH && 'opacity-50 cursor-not-allowed')}
              disabled={MOCK_AUTH}
              {...register('currentPassword')}
            />
            {errors.currentPassword && <p className="text-xs text-error mt-1">{errors.currentPassword.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">New Password</label>
            <input
              type="password"
              className={cn('input-base', MOCK_AUTH && 'opacity-50 cursor-not-allowed')}
              disabled={MOCK_AUTH}
              {...register('newPassword')}
            />
            {errors.newPassword && <p className="text-xs text-error mt-1">{errors.newPassword.message}</p>}
          </div>

          {MOCK_AUTH && (
            <div className="flex items-start gap-2.5 bg-tertiary-container/20 border border-outline-variant/20 rounded-xl px-3 py-2.5">
              <span className="material-symbols-outlined text-tertiary text-base shrink-0 mt-0.5">warning</span>
              <p className="text-xs text-on-surface-variant">Password changes are not available in demo mode.</p>
            </div>
          )}
        </div>

        {/* Save error */}
        {saveError && <p className="text-sm text-error">{saveError}</p>}

        {/* Save button */}
        <button
          type="submit"
          disabled={saveState === 'saving'}
          className="btn-primary w-full disabled:opacity-60"
        >
          {saveState === 'saving' && <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>}
          {saveState === 'saved' ? 'Saved ✓' : saveState === 'saving' ? 'Saving...' : 'Save Changes'}
        </button>

        {/* Sign Out — mobile only */}
        <div className="lg:hidden border-t border-outline-variant/30 pt-4">
          <button
            type="button"
            onClick={onSignOut}
            className="w-full py-3 rounded-xl bg-error-container text-error font-semibold text-sm transition-colors hover:bg-error-container/80"
          >
            Sign Out
          </button>
        </div>

      </form>
    </Modal>
  )
}

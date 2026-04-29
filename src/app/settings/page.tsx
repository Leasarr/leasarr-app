'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import Modal from '@/components/ui/Modal'
import { Tooltip } from '@/components/ui/Tooltip'
import { LoadingState } from '@/components/patterns/LoadingState'
import { EmptyState } from '@/components/patterns/EmptyState'
import { FormField } from '@/components/patterns/FormField'
import { cn, formatDate, formatCurrency, getInitials } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { PLANS, type PlanKey } from '@/lib/stripe/plans'
import { useSeats } from '@/hooks/useSeats'
import { inviteTeamMemberSchema, type InviteTeamMemberForm } from '@/lib/schemas/people'
import type { Subscription } from '@/types'

const MOCK_AUTH = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

type Section = 'profile' | 'billing' | 'team' | 'notifications'

// ─── Schemas ──────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
})
type ProfileForm = z.infer<typeof profileSchema>

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'At least 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})
type PasswordForm = z.infer<typeof passwordSchema>

// ─── Nav config ───────────────────────────────────────────────────────────────

const ALL_SECTIONS: { key: Section; icon: string; label: string; description: string; managerOnly?: boolean }[] = [
  { key: 'profile', icon: 'person', label: 'Profile', description: 'Name, email, avatar, password' },
  { key: 'billing', icon: 'credit_card', label: 'Billing', description: 'Subscription and plan', managerOnly: true },
  { key: 'team', icon: 'group', label: 'Team', description: 'Invite and manage team members', managerOnly: true },
  { key: 'notifications', icon: 'notifications', label: 'Notifications', description: 'Email notification preferences' },
]

// ─── Plan config ──────────────────────────────────────────────────────────────

const PLAN_FEATURES: Record<PlanKey, string[]> = {
  starter: ['Up to 10 units', '1 team seat', 'Core property management', 'Tenant portal', 'Email notifications'],
  growth: ['Up to 50 units', '3 team seats', 'Everything in Starter', 'Advanced analytics', 'Priority email support'],
  pro: ['Up to 200 units', '10 team seats', 'Everything in Growth', 'API access', 'Dedicated account support'],
}

// ─── Notification preferences ─────────────────────────────────────────────────

interface NotificationPrefs {
  email_maintenance: boolean
  email_payment: boolean
  email_lease: boolean
}

const PREFS_KEY = 'leasarr_notification_prefs'
const DEFAULT_PREFS: NotificationPrefs = {
  email_maintenance: true,
  email_payment: true,
  email_lease: true,
}

// ─── Sub-sections ─────────────────────────────────────────────────────────────

function ProfileSection() {
  const { user, profile, updateProfile, signOut } = useAuth()
  const supabase = createClient()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  const [profileState, setProfileState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [profileError, setProfileError] = useState('')
  const [passwordState, setPasswordState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [passwordError, setPasswordError] = useState('')
  const [removingPhoto, setRemovingPhoto] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: {
      name: profile?.name ?? '',
      email: profile?.email ?? '',
      phone: profile?.phone ?? '',
    },
  })

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  async function saveProfile(data: ProfileForm) {
    setProfileState('saving')
    setProfileError('')
    try {
      await updateProfile({ name: data.name, email: data.email, phone: data.phone || undefined })
      if (!MOCK_AUTH && data.email !== profile?.email) {
        const { error } = await supabase.auth.updateUser({ email: data.email })
        if (error) throw error
      }
      setProfileState('saved')
      timerRef.current = setTimeout(() => setProfileState('idle'), 2000)
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Something went wrong')
      setProfileState('error')
    }
  }

  async function savePassword(data: PasswordForm) {
    setPasswordState('saving')
    setPasswordError('')
    try {
      if (!MOCK_AUTH) {
        const { error } = await supabase.auth.updateUser({ password: data.newPassword })
        if (error) throw error
      }
      setPasswordState('saved')
      passwordForm.reset()
      timerRef.current = setTimeout(() => setPasswordState('idle'), 2000)
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Something went wrong')
      setPasswordState('error')
    }
  }

  const avatarUrl = (user?.user_metadata?.avatar_url as string | undefined) ?? profile?.avatar_url ?? null
  const roleLabel = profile?.role === 'tenant' ? 'Tenant' : 'Property Manager'

  async function removePhoto() {
    setRemovingPhoto(true)
    try {
      await updateProfile({ avatar_url: undefined })
    } finally {
      setRemovingPhoto(false)
    }
  }

  async function deleteAccount() {
    setDeleteLoading(true)
    setDeleteError('')
    try {
      const res = await fetch('/api/account/delete', { method: 'POST' })
      if (!res.ok) {
        const { error } = await res.json()
        setDeleteError(error ?? 'Something went wrong')
        setDeleteLoading(false)
        return
      }
      await signOut()
    } catch {
      setDeleteError('Something went wrong')
      setDeleteLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Avatar card */}
      <Card padding="md">
        <p className="text-sm font-bold text-on-surface mb-4">Photo</p>
        <div className="flex items-center gap-5">
          <ImageUpload
            value={avatarUrl}
            onChange={async url => { if (url) await updateProfile({ avatar_url: url }) }}
            bucket="avatars"
            path={profile?.id ?? 'uploads'}
            shape="circle"
            className="w-20 h-20 flex-shrink-0"
          />
          <div>
            <p className="font-semibold text-on-surface">{profile?.name}</p>
            <p className="text-sm text-on-surface-variant">{roleLabel}</p>
            <p className="text-xs text-primary mt-1">Click photo to change</p>
            {avatarUrl && (
              <button
                onClick={removePhoto}
                disabled={removingPhoto}
                className="text-xs text-error mt-1.5 hover:underline disabled:opacity-50"
              >
                {removingPhoto ? 'Removing...' : 'Remove photo'}
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Profile info card */}
      <Card padding="md">
        <p className="text-sm font-bold text-on-surface mb-4">Personal Information</p>
        <form onSubmit={profileForm.handleSubmit(saveProfile)} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">Full Name</label>
            <input type="text" className="input-base" {...profileForm.register('name')} />
            {profileForm.formState.errors.name && (
              <p className="text-xs text-error mt-1">{profileForm.formState.errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">Email</label>
            <input type="email" className="input-base" {...profileForm.register('email')} />
            {profileForm.formState.errors.email && (
              <p className="text-xs text-error mt-1">{profileForm.formState.errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">
              Phone <span className="text-on-surface-variant font-normal">(optional)</span>
            </label>
            <input type="tel" className="input-base" placeholder="+1 (555) 000-0000" {...profileForm.register('phone')} />
          </div>
          {profileError && <p className="text-sm text-error">{profileError}</p>}
          <div className="flex justify-end">
            <Button type="submit" variant="primary" size="md" loading={profileState === 'saving'}>
              {profileState === 'saved' ? 'Saved ✓' : profileState === 'saving' ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Password card */}
      <Card padding="md">
        <p className="text-sm font-bold text-on-surface mb-1">Change Password</p>

        {MOCK_AUTH ? (
          <div className="flex items-start gap-2.5 bg-tertiary-container/20 border border-outline-variant/20 rounded-xl px-3 py-2.5 mt-3">
            <span className="material-symbols-outlined text-tertiary text-base shrink-0 mt-0.5">info</span>
            <p className="text-xs text-on-surface-variant">Password changes are not available in demo mode.</p>
          </div>
        ) : (
          <form onSubmit={passwordForm.handleSubmit(savePassword)} className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Current Password</label>
              <input type="password" className="input-base" {...passwordForm.register('currentPassword')} />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-xs text-error mt-1">{passwordForm.formState.errors.currentPassword.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">New Password</label>
              <input type="password" className="input-base" {...passwordForm.register('newPassword')} />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-xs text-error mt-1">{passwordForm.formState.errors.newPassword.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Confirm New Password</label>
              <input type="password" className="input-base" {...passwordForm.register('confirmPassword')} />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-xs text-error mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>
            {passwordError && <p className="text-sm text-error">{passwordError}</p>}
            <div className="flex justify-end">
              <Button type="submit" variant="primary" size="md" loading={passwordState === 'saving'}>
                {passwordState === 'saved' ? 'Updated ✓' : passwordState === 'saving' ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </form>
        )}
      </Card>

      {/* Danger Zone */}
      <div className="border border-error/30 rounded-2xl p-6 bg-error-container/5">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-error text-xl">warning</span>
          <p className="text-sm font-bold text-error">Danger Zone</p>
        </div>

        {profile?.role === 'manager' ? (
          <>
            <p className="text-sm text-on-surface-variant mb-4">
              Manager accounts cannot be self-deleted — your account is linked to properties, tenants, leases, and payments. Contact support to close your account.
            </p>
            <Button variant="destructive" size="md" disabled iconLeft="delete_forever">
              Delete Account
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-on-surface-variant mb-4">
              Permanently delete your login access. Your lease and payment history will remain visible to your manager. You can re-register with the same email at any time to restore portal access.
            </p>
            {deleteError && <p className="text-sm text-error mb-3">{deleteError}</p>}
            <Button
              variant="destructive"
              size="md"
              onClick={() => setShowDeleteConfirm(true)}
              iconLeft="delete_forever"
            >
              Delete Account
            </Button>
          </>
        )}
      </div>

      <ConfirmModal
        open={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setDeleteError('') }}
        title="Delete your account?"
        body="This will remove your login access. Your lease and payment history stays with your manager. Re-register with the same email at any time to restore access."
        confirmLabel="Yes, delete my account"
        onConfirm={deleteAccount}
        loading={deleteLoading}
        destructive
      />
    </div>
  )
}

function BillingSection() {
  const { profile } = useAuth()
  const supabase = createClient()
  const seats = useSeats()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly')
  const [checkoutLoading, setCheckoutLoading] = useState<PlanKey | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)

  useEffect(() => {
    if (!profile || MOCK_AUTH) { setLoading(false); return }
    supabase
      .from('subscriptions')
      .select('*')
      .eq('manager_id', profile.id)
      .single()
      .then(({ data }: { data: Subscription | null }) => {
        setSubscription(data)
        if (data?.billing_interval) setBillingInterval(data.billing_interval)
        setLoading(false)
      })
  }, [profile])

  async function handleUpgrade(plan: PlanKey) {
    setCheckoutLoading(plan)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, interval: billingInterval }),
      })
      const { url } = await res.json()
      if (url) window.location.href = url
    } finally {
      setCheckoutLoading(null)
    }
  }

  async function handleManageBilling() {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const { url } = await res.json()
      if (url) window.location.href = url
    } finally {
      setPortalLoading(false)
    }
  }

  const statusVariant: Record<string, 'success' | 'warning' | 'error' | 'secondary'> = {
    active: 'success',
    trialing: 'secondary',
    past_due: 'error',
    canceled: 'neutral' as 'secondary',
  }

  if (MOCK_AUTH) {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-2.5 bg-tertiary-container/20 border border-outline-variant/20 rounded-xl px-4 py-3">
          <span className="material-symbols-outlined text-tertiary text-base shrink-0 mt-0.5">info</span>
          <p className="text-sm text-on-surface-variant">Billing is not available in demo mode. Connect Stripe to manage subscriptions.</p>
        </div>
        <BillingPlansDisplay interval={billingInterval} onIntervalChange={setBillingInterval} currentPlan={null} onUpgrade={() => {}} checkoutLoading={null} />
      </div>
    )
  }

  if (loading) return <LoadingState size="panel" />

  return (
    <div className="space-y-6">
      {/* Current plan */}
      {subscription ? (
        <Card padding="md">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Current Plan</p>
              <p className="text-2xl font-headline font-extrabold text-on-surface capitalize">
                {subscription.plan ?? 'Free'}
              </p>
              {subscription.billing_interval && (
                <p className="text-sm text-on-surface-variant mt-0.5 capitalize">{subscription.billing_interval} billing</p>
              )}
              {subscription.current_period_end && (
                <p className="text-xs text-on-surface-variant mt-1">
                  Renews {formatDate(subscription.current_period_end)}
                </p>
              )}
              {!seats.loading && (
                <p className="text-xs text-on-surface-variant mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">group</span>
                  {seats.used} of {seats.max} seat{seats.max !== 1 ? 's' : ''} used
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-3">
              <Badge variant={statusVariant[subscription.status] ?? 'secondary'} className="capitalize">
                {subscription.status.replace('_', ' ')}
              </Badge>
              {subscription.stripe_customer_id && (
                <Button variant="secondary" size="sm" onClick={handleManageBilling} disabled={portalLoading}>
                  {portalLoading ? 'Loading...' : 'Manage Billing'}
                </Button>
              )}
            </div>
          </div>
          {subscription.status === 'past_due' && (
            <div className="mt-4 flex items-start gap-2.5 bg-error-container/30 border border-error/20 rounded-xl px-3 py-2.5">
              <span className="material-symbols-outlined text-error text-base shrink-0 mt-0.5">warning</span>
              <p className="text-xs text-on-surface-variant">Your payment is past due. Update your payment method to avoid service interruption.</p>
            </div>
          )}
        </Card>
      ) : (
        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-primary text-xl">rocket_launch</span>
            </div>
            <div>
              <p className="font-bold text-on-surface">You&apos;re on the free tier</p>
              <p className="text-sm text-on-surface-variant">Choose a plan to unlock all features</p>
            </div>
          </div>
        </Card>
      )}

      {/* Plans */}
      <BillingPlansDisplay
        interval={billingInterval}
        onIntervalChange={setBillingInterval}
        currentPlan={subscription?.plan ?? null}
        onUpgrade={handleUpgrade}
        checkoutLoading={checkoutLoading}
      />
    </div>
  )
}

function BillingPlansDisplay({
  interval,
  onIntervalChange,
  currentPlan,
  onUpgrade,
  checkoutLoading,
}: {
  interval: 'monthly' | 'annual'
  onIntervalChange: (v: 'monthly' | 'annual') => void
  currentPlan: string | null
  onUpgrade: (plan: PlanKey) => void
  checkoutLoading: PlanKey | null
}) {
  const planOrder: PlanKey[] = ['starter', 'growth', 'pro']

  return (
    <div>
      {/* Interval toggle */}
      <div className="flex items-center gap-3 mb-5">
        <p className="text-sm font-bold text-on-surface">Plans</p>
        <div className="flex items-center gap-1 bg-surface-container rounded-xl p-0.5 ml-auto">
          {(['monthly', 'annual'] as const).map(v => (
            <button
              key={v}
              onClick={() => onIntervalChange(v)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-semibold transition-all capitalize',
                interval === v ? 'bg-primary-fixed text-on-primary-fixed' : 'text-on-surface-variant hover:text-on-surface'
              )}
            >
              {v}
              {v === 'annual' && <span className="ml-1 text-[10px] text-primary font-bold">-17%</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {planOrder.map(planKey => {
          const plan = PLANS[planKey]
          const price = interval === 'annual' ? Math.round(plan.annualTotal / 12) : plan.monthlyPrice
          const isCurrent = currentPlan === planKey
          const isLoading = checkoutLoading === planKey
          const isPopular = planKey === 'growth'

          return (
            <div
              key={planKey}
              className={cn(
                'relative rounded-2xl border p-5 flex flex-col gap-4 transition-all',
                isCurrent
                  ? 'border-primary bg-primary-container/10'
                  : isPopular
                    ? 'border-primary/40 bg-surface-container-lowest shadow-card'
                    : 'border-outline-variant/30 bg-surface-container-lowest'
              )}
            >
              {isPopular && !isCurrent && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-on-primary text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  Most Popular
                </span>
              )}
              {isCurrent && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary-fixed text-on-primary-fixed text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  Current Plan
                </span>
              )}

              <div>
                <p className="font-headline font-extrabold text-on-surface">{plan.name}</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold text-on-surface">{formatCurrency(price)}</span>
                  <span className="text-xs text-on-surface-variant">/mo</span>
                </div>
                {interval === 'annual' && (
                  <p className="text-[11px] text-on-surface-variant">Billed {formatCurrency(plan.annualTotal)}/yr</p>
                )}
              </div>

              <ul className="space-y-1.5 flex-1">
                {PLAN_FEATURES[planKey].map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm text-primary material-symbols-filled">check_circle</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                variant={isCurrent ? 'secondary' : isPopular ? 'primary' : 'secondary'}
                size="sm"
                disabled={isCurrent}
                loading={isLoading}
                onClick={() => !isCurrent && onUpgrade(planKey)}
                className="w-full"
              >
                {isCurrent ? 'Current Plan' : isLoading ? 'Loading...' : 'Upgrade'}
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

type TeamMemberRow = {
  id: string
  name: string
  role: string
  email: string
  status: 'pending' | 'active' | 'inactive'
  profile_id: string | null
  invited_email: string | null
  invited_at: string | null
}

function TeamSection() {
  const { profile } = useAuth()
  const supabase = createClient()
  const seats = useSeats()

  const [members, setMembers] = useState<TeamMemberRow[]>([])
  const [loading, setLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(true)
  const [ownerName, setOwnerName] = useState('')
  const [inviteError, setInviteError] = useState('')
  const [showInvite, setShowInvite] = useState(false)
  const [revokeTarget, setRevokeTarget] = useState<TeamMemberRow | null>(null)
  const [revoking, setRevoking] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const inviteForm = useForm<InviteTeamMemberForm>({
    resolver: zodResolver(inviteTeamMemberSchema),
  })

  useEffect(() => {
    if (!profile) return
    async function load() {
      setLoading(true)

      // Check if current user is a team member (not an owner)
      const { data: memberOf } = await supabase
        .from('team_members')
        .select('manager_id')
        .eq('profile_id', profile!.id)
        .eq('status', 'active')
        .maybeSingle()

      if (memberOf?.manager_id) {
        const { data: owner } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', memberOf.manager_id)
          .single()
        setIsOwner(false)
        setOwnerName(owner?.name ?? 'your manager')
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('team_members')
        .select('id, name, role, email, status, profile_id, invited_email, invited_at')
        .eq('manager_id', profile!.id)
        .order('created_at', { ascending: false })

      setMembers((data ?? []) as TeamMemberRow[])
      setLoading(false)
    }
    load()
  }, [profile?.id])

  async function onInvite(data: InviteTeamMemberForm) {
    setInviteError('')
    // Name is filled in by the invitee on signup (or pulled from their auth provider).
    // Send a placeholder derived from the email so the row has a non-null display value.
    const placeholderName = data.email.split('@')[0]
    const res = await fetch('/api/team/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: data.email, role: data.role, name: placeholderName }),
    })
    const json = await res.json()
    if (!res.ok) { setInviteError(json.error ?? 'Failed to send invite'); return }
    inviteForm.reset()
    setShowInvite(false)
    const { data: updated } = await supabase
      .from('team_members')
      .select('id, name, role, email, status, profile_id, invited_email, invited_at')
      .eq('manager_id', profile!.id)
      .order('created_at', { ascending: false })
    setMembers((updated ?? []) as TeamMemberRow[])
  }

  async function handleRevoke() {
    if (!revokeTarget) return
    setRevoking(true)
    const res = await fetch('/api/team/revoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ team_member_id: revokeTarget.id }),
    })
    setRevoking(false)
    if (res.ok) {
      setMembers(prev => prev.map(m => m.id === revokeTarget.id ? { ...m, status: 'inactive', profile_id: null } : m))
    }
    setRevokeTarget(null)
  }

  async function handleResend(member: TeamMemberRow) {
    setActionLoading(member.id)
    await fetch('/api/team/resend-invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ team_member_id: member.id }),
    })
    setActionLoading(null)
  }

  async function handleReInvite(member: TeamMemberRow) {
    setActionLoading(member.id)
    const res = await fetch('/api/team/resend-invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ team_member_id: member.id }),
    })
    if (res.ok) {
      setMembers(prev => prev.map(m => m.id === member.id ? { ...m, status: 'pending' } : m))
    }
    setActionLoading(null)
  }

  if (loading) return <LoadingState size="panel" />

  // Team member view — they can't manage the team
  if (!isOwner) {
    return (
      <Card padding="md">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary-container/30 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-primary text-xl">group</span>
          </div>
          <div>
            <p className="font-bold text-on-surface">You&apos;re a team member</p>
            <p className="text-sm text-on-surface-variant">You&apos;re operating under <strong>{ownerName}</strong>&apos;s account</p>
          </div>
        </div>
        <p className="text-xs text-on-surface-variant">Team management is handled by the account owner. Contact {ownerName} to update team access.</p>
      </Card>
    )
  }

  const statusPill = {
    pending:  'bg-warning-container text-on-warning-container',
    active:   'bg-secondary-container text-on-secondary-container',
    inactive: 'bg-surface-container-high text-on-surface-variant',
  }

  return (
    <div className="space-y-6">

      {/* Seat usage */}
      <Card padding="md">
        <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
          <p className="text-sm font-bold text-on-surface">Seat usage</p>
          <div className="flex items-center gap-3 ml-auto">
            {!seats.loading && (
              <span className="text-sm font-semibold text-on-surface-variant">
                {seats.used} / {seats.max} seat{seats.max !== 1 ? 's' : ''}
              </span>
            )}
            {!seats.loading && (
              <Tooltip
                content="No seats available — upgrade your plan to invite more"
                disabled={seats.available > 0}
              >
                <Button
                  variant="primary"
                  size="sm"
                  iconLeft="person_add"
                  onClick={() => setShowInvite(true)}
                  disabled={seats.available === 0}
                >
                  Invite
                </Button>
              </Tooltip>
            )}
          </div>
        </div>
        {!seats.loading && (
          <>
            <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all', seats.available === 0 ? 'bg-error' : 'bg-primary')}
                style={{ width: `${Math.min(100, (seats.used / seats.max) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-on-surface-variant mt-2">
              {seats.available === 0
                ? <>No seats available — <Link href="#" onClick={() => {}} className="text-primary font-semibold hover:underline">upgrade your plan</Link> to invite more</>
                : `${seats.available} seat${seats.available !== 1 ? 's' : ''} available`}
            </p>
          </>
        )}
      </Card>

      {/* Member list */}
      <Card padding="md">
        <p className="text-sm font-bold text-on-surface mb-4">
          Team members
          <span className="ml-2 text-xs font-normal text-on-surface-variant">
            ({members.filter(m => m.status === 'active').length} active)
          </span>
        </p>

        {members.length === 0 ? (
          <EmptyState
            icon="group_add"
            title="No team members yet"
            description="Invite your first team member above."
            size="inline"
          />
        ) : (
          <div className="divide-y divide-outline-variant/10 -mx-1">
            {members.map(member => {
              const isLoading = actionLoading === member.id
              return (
                <div key={member.id} className="flex items-center gap-3 py-3 px-1">
                  <div className="w-9 h-9 rounded-xl bg-primary-container/30 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {getInitials(member.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-on-surface truncate">{member.name}</p>
                    <p className="text-xs text-on-surface-variant truncate">{member.role} · {member.invited_email ?? member.email}</p>
                  </div>
                  <span className={cn('badge flex-shrink-0', statusPill[member.status])}>
                    {member.status === 'pending' ? 'Pending' : member.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                  <div className="flex-shrink-0">
                    {member.status === 'pending' && (
                      <button
                        disabled={isLoading}
                        onClick={() => handleResend(member)}
                        className="text-xs font-semibold text-primary hover:underline disabled:opacity-50"
                      >
                        {isLoading ? 'Sending...' : 'Resend'}
                      </button>
                    )}
                    {member.status === 'active' && (
                      <button
                        onClick={() => setRevokeTarget(member)}
                        className="text-xs font-semibold text-error hover:underline"
                      >
                        Revoke
                      </button>
                    )}
                    {member.status === 'inactive' && (
                      <button
                        disabled={isLoading || seats.available === 0}
                        onClick={() => handleReInvite(member)}
                        className="text-xs font-semibold text-primary hover:underline disabled:opacity-50"
                      >
                        {isLoading ? 'Sending...' : 'Re-invite'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      <Modal
        open={showInvite}
        onClose={() => { setShowInvite(false); setInviteError(''); inviteForm.reset() }}
        title="Invite team member"
        size="md"
      >
        <form onSubmit={inviteForm.handleSubmit(onInvite)} className="space-y-4">
          <FormField label="Email" hint="An invite link will be sent to this address. They'll set their name on signup.">
            <input
              {...inviteForm.register('email')}
              type="email"
              className="input-base"
              placeholder="alex@yourcompany.com"
              autoFocus
            />
            {inviteForm.formState.errors.email && (
              <p className="text-error text-xs mt-1">{inviteForm.formState.errors.email.message}</p>
            )}
          </FormField>
          <FormField label="Role">
            <input
              {...inviteForm.register('role')}
              className="input-base"
              placeholder="e.g. Property Manager"
            />
            {inviteForm.formState.errors.role && (
              <p className="text-error text-xs mt-1">{inviteForm.formState.errors.role.message}</p>
            )}
          </FormField>
          {inviteError && <p className="text-sm text-error">{inviteError}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" size="md" onClick={() => { setShowInvite(false); setInviteError(''); inviteForm.reset() }}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" loading={inviteForm.formState.isSubmitting}>
              {inviteForm.formState.isSubmitting ? 'Sending...' : 'Send Invite'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={Boolean(revokeTarget)}
        onClose={() => setRevokeTarget(null)}
        title="Revoke access"
        body={`Remove ${revokeTarget?.name ?? 'this team member'}'s access? They can be re-invited later.`}
        confirmLabel="Revoke"
        onConfirm={handleRevoke}
        loading={revoking}
        destructive
      />
    </div>
  )
}

function NotificationsSection() {
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS)
  const [saved, setSaved] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PREFS_KEY)
      if (stored) setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(stored) })
    } catch {}
  }, [])

  function toggle(key: keyof NotificationPrefs) {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }))
    setSaved(false)
  }

  function save() {
    try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)) } catch {}
    setSaved(true)
    timerRef.current = setTimeout(() => setSaved(false), 2000)
  }

  const rows: { key: keyof NotificationPrefs; icon: string; label: string; description: string }[] = [
    { key: 'email_maintenance', icon: 'build', label: 'Maintenance requests', description: 'New requests and status updates' },
    { key: 'email_payment', icon: 'payments', label: 'Payments', description: 'Rent due, received, and overdue alerts' },
    { key: 'email_lease', icon: 'description', label: 'Leases', description: 'Expiring leases and new agreements' },
  ]

  return (
    <div className="space-y-6">
      <Card padding="md">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-primary text-xl">email</span>
          <p className="text-sm font-bold text-on-surface">Email Notifications</p>
        </div>
        <p className="text-xs text-on-surface-variant mb-5">Choose which events trigger email notifications.</p>
        <div className="space-y-4">
          {rows.map(row => (
            <div key={row.key} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-on-surface-variant text-base">{row.icon}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-on-surface">{row.label}</p>
                  <p className="text-xs text-on-surface-variant">{row.description}</p>
                </div>
              </div>
              <button
                onClick={() => toggle(row.key)}
                className={cn(
                  'w-11 h-6 rounded-full transition-colors flex-shrink-0 relative',
                  prefs[row.key] ? 'bg-primary' : 'bg-outline-variant/50'
                )}
              >
                <span className={cn(
                  'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                  prefs[row.key] ? 'translate-x-5' : 'translate-x-0'
                )} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-xs text-on-surface-variant">Preferences are saved locally on this device.</p>
        <Button variant="primary" size="md" onClick={save}>
          {saved ? 'Saved ✓' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { profile, loading } = useAuth()
  const [activeSection, setActiveSection] = useState<Section | null>(null)

  useEffect(() => {
    if (window.innerWidth >= 1024) setActiveSection('profile')
  }, [])

  const isTenant = profile?.role === 'tenant'
  const backHref = isTenant ? '/portal' : '/dashboard'
  const backLabel = isTenant ? 'Back to Portal' : 'Back to Dashboard'
  const navItems = isTenant
    ? ALL_SECTIONS.filter(s => !s.managerOnly)
    : ALL_SECTIONS

  const activeMeta = navItems.find(n => n.key === activeSection)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <LoadingState size="page" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-surface overflow-x-hidden">

      {/* ── Settings Sidebar (desktop) ── */}
      <aside className="hidden lg:flex flex-col w-56 bg-surface-container-lowest border-r border-outline-variant/20 fixed left-0 top-0 h-screen z-40 shrink-0">
        {/* Back link */}
        <div className="px-5 py-5 border-b border-outline-variant/20">
          <Link
            href={backHref}
            className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            {backLabel}
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-3 mb-3">
            Account Settings
          </p>
          {navItems.map(item => {
            const isActive = activeSection === item.key
            return (
              <button
                key={item.key}
                onClick={() => setActiveSection(item.key)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 text-left',
                  isActive
                    ? 'bg-primary-fixed text-on-primary-fixed'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                )}
              >
                <span className={cn('material-symbols-outlined text-xl flex-shrink-0', isActive && 'material-symbols-filled')}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            )
          })}
        </nav>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 lg:ml-56 min-h-screen flex flex-col">

        {/* Mobile top bar */}
        <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/90 backdrop-blur-xl border-b border-outline-variant/20 h-14 flex items-center px-4 gap-3">
          {activeSection ? (
            <button
              onClick={() => setActiveSection(null)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
            </button>
          ) : (
            <Link
              href={backHref}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
            </Link>
          )}
          <p className="font-bold text-on-surface">
            {activeMeta ? activeMeta.label : 'Settings'}
          </p>
        </header>

        <div className="pt-14 lg:pt-0 pb-8 flex-1">
          {/* Mobile: section list */}
          {activeSection === null && (
            <div className="lg:hidden px-4 py-4 space-y-1">
              {navItems.map(item => (
                <button
                  key={item.key}
                  onClick={() => setActiveSection(item.key)}
                  className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 text-left hover:bg-surface-container transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-on-surface-variant text-xl">{item.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-on-surface">{item.label}</p>
                    <p className="text-xs text-on-surface-variant">{item.description}</p>
                  </div>
                  <span className="material-symbols-outlined text-outline text-base">chevron_right</span>
                </button>
              ))}
            </div>
          )}

          {/* Section content */}
          {activeSection !== null && (
            <div className="px-6 md:px-12 py-8 max-w-3xl mx-auto">
              <div className="mb-6">
                <h1 className="text-2xl font-headline font-extrabold text-on-surface">{activeMeta?.label}</h1>
                <p className="text-sm text-on-surface-variant mt-1">{activeMeta?.description}</p>
              </div>
              {activeSection === 'profile' && <ProfileSection />}
              {activeSection === 'billing' && <BillingSection />}
              {activeSection === 'team' && <TeamSection />}
              {activeSection === 'notifications' && <NotificationsSection />}
            </div>
          )}

          {/* Desktop: nothing selected fallback */}
          {activeSection === null && (
            <div className="hidden lg:flex flex-col items-center justify-center h-full py-32 text-center">
              <span className="material-symbols-outlined text-4xl text-outline mb-3">settings</span>
              <p className="text-on-surface-variant font-semibold">Select a section</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

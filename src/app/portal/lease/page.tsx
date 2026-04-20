'use client'

import { useEffect, useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { formatCurrency, formatDate, getDaysUntil, cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'

type LeaseData = {
  id: string
  rent_amount: number
  security_deposit: number | null
  start_date: string
  end_date: string
  status: 'active' | 'expired' | 'terminated' | 'pending'
  property: { name: string } | null
  unit: { unit_number: string } | null
}

export default function TenantLeasePage() {
  const { profile, loading: authLoading } = useAuth()
  const supabase = createClient()

  const [lease, setLease] = useState<LeaseData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!profile) return
    setLoading(true)
    async function fetchLease() {
      const { data: tenantData } = await supabase
        .from('tenants')
        .select('id')
        .eq('profile_id', profile!.id)
        .maybeSingle()

      if (!tenantData) { setLoading(false); return }

      const { data } = await supabase
        .from('leases')
        .select('id, rent_amount, security_deposit, start_date, end_date, status, property:properties(name), unit:units(unit_number)')
        .eq('tenant_id', tenantData.id)
        .eq('status', 'active')
        .maybeSingle()

      setLease(data as unknown as LeaseData ?? null)
      setLoading(false)
    }
    fetchLease()
  }, [profile])

  if (authLoading || loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <span className="material-symbols-outlined text-4xl text-primary animate-pulse">description</span>
            <p className="text-on-surface-variant mt-2">Loading...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (!lease) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight">Lease</h1>
            <p className="text-on-surface-variant mt-1 text-sm">Your lease details</p>
          </div>
          <div className="flex flex-col items-center justify-center py-20 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl mb-3">description</span>
            <p className="font-bold text-on-surface text-lg">No active lease</p>
            <p className="text-sm mt-1">Contact your property manager for lease details.</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  const daysLeft = getDaysUntil(lease.end_date)
  const isExpiringSoon = daysLeft <= 30 && daysLeft >= 0

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-6">

        <div>
          <h1 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight">Lease</h1>
          <p className="text-on-surface-variant mt-1 text-sm">Your lease details</p>
        </div>

        {/* Property header */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl primary-gradient flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-white">domain</span>
            </div>
            <div>
              <p className="font-bold text-on-surface">{lease.property?.name ?? 'Property'}</p>
              {lease.unit && <p className="text-sm text-on-surface-variant">Unit {lease.unit.unit_number}</p>}
            </div>
            <span className="ml-auto badge bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">Active</span>
          </div>

          {isExpiringSoon && (
            <div className="flex items-center gap-2 bg-error-container/30 text-error rounded-xl px-4 py-2.5 text-sm font-semibold">
              <span className="material-symbols-outlined text-base">warning</span>
              Expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Rent */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-card space-y-4">
          <h2 className="text-xs font-bold text-outline uppercase tracking-widest">Financials</h2>
          <div className="flex items-center justify-between">
            <p className="text-sm text-on-surface-variant">Monthly Rent</p>
            <p className="font-bold text-on-surface">{formatCurrency(lease.rent_amount)}</p>
          </div>
          {lease.security_deposit != null && (
            <div className="flex items-center justify-between border-t border-outline-variant/10 pt-4">
              <p className="text-sm text-on-surface-variant">Security Deposit</p>
              <p className="font-bold text-on-surface">{formatCurrency(lease.security_deposit)}</p>
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-card space-y-4">
          <h2 className="text-xs font-bold text-outline uppercase tracking-widest">Lease Term</h2>
          <div className="flex items-center justify-between">
            <p className="text-sm text-on-surface-variant">Start Date</p>
            <p className="font-semibold text-on-surface">{formatDate(lease.start_date)}</p>
          </div>
          <div className="flex items-center justify-between border-t border-outline-variant/10 pt-4">
            <p className="text-sm text-on-surface-variant">End Date</p>
            <div className="text-right">
              <p className={cn('font-semibold', isExpiringSoon ? 'text-error' : 'text-on-surface')}>{formatDate(lease.end_date)}</p>
              {daysLeft >= 0 && <p className="text-xs text-on-surface-variant mt-0.5">{daysLeft} days remaining</p>}
            </div>
          </div>
        </div>

      </div>
    </AppLayout>
  )
}

'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { formatCurrency, formatDate, getDaysUntil, cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'

type LeaseRow = {
  id: string
  rent_amount: number
  security_deposit: number
  start_date: string
  end_date: string
  status: 'active' | 'expired' | 'pending' | 'terminated'
  renewal_status: 'offered' | 'accepted' | 'declined' | null
  tenant: {
    first_name: string
    last_name: string
  } | null
  property: {
    name: string
  } | null
}

export default function LeasesPage() {
  const { profile, loading: authLoading } = useAuth()
  const supabase = createClient()
  const [leases, setLeases] = useState<LeaseRow[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!profile) return
    setLoading(true)
    async function fetchLeases() {
      const { data } = await supabase
        .from('leases')
        .select(`
          id, rent_amount, security_deposit, start_date, end_date, status, renewal_status,
          tenant:tenants(first_name, last_name),
          property:properties(name)
        `)
        .in('status', ['active', 'expired'])
        .order('end_date', { ascending: true })
      setLeases((data as unknown as LeaseRow[]) ?? [])
      setLoading(false)
    }
    fetchLeases()
  }, [profile])

  if (authLoading || loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <span className="material-symbols-outlined text-4xl text-primary animate-pulse">description</span>
            <p className="text-on-surface-variant mt-2">Loading leases...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">

        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight mb-2">Lease Management</h1>
            <p className="text-on-surface-variant">Review expiring contracts and renewal insights.</p>
          </div>
          <button className="btn-primary h-12 px-6 w-fit">
            <span className="material-symbols-outlined">add</span> New Lease
          </button>
        </div>

        {leases.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl mb-3">description</span>
            <p className="font-bold text-on-surface text-lg">No leases yet</p>
            <p className="text-sm mt-1">Active and expired leases will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold font-headline">Active Leases</h2>
              <span className="text-sm text-primary font-semibold">{leases.length} Total Leases</span>
            </div>

            {leases.map(lease => {
              const days = getDaysUntil(lease.end_date)
              const isExpired = days < 0
              const isUrgent = !isExpired && days <= 30
              const tenantName = lease.tenant
                ? `${lease.tenant.first_name} ${lease.tenant.last_name}`
                : 'Unknown Tenant'
              const initials = lease.tenant
                ? `${lease.tenant.first_name[0]}${lease.tenant.last_name[0]}`
                : '??'

              return (
                <div
                  key={lease.id}
                  className={cn(
                    'bg-surface-container-lowest rounded-xl p-5 flex items-center justify-between group cursor-pointer hover:bg-surface-container-low transition-all',
                    (isExpired || isUrgent) && 'border-l-4 border-error'
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-lg bg-surface-container-high flex items-center justify-center text-xl font-bold text-primary">
                      {initials}
                    </div>
                    <div>
                      <p className="font-bold text-on-surface">{lease.property?.name ?? '—'}</p>
                      <p className="text-sm text-on-surface-variant">Tenant: {tenantName}</p>
                    </div>
                  </div>
                  <div className="hidden md:block text-right px-6">
                    <p className="text-sm text-on-surface-variant">Monthly Rent</p>
                    <p className="font-bold text-on-surface">{formatCurrency(lease.rent_amount)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-on-surface-variant">Expires</p>
                    <p className={cn('font-bold', isExpired || isUrgent ? 'text-error' : 'text-on-surface')}>
                      {formatDate(lease.end_date, 'MMM dd, yyyy')}
                    </p>
                    {(isExpired || isUrgent) && (
                      <p className="text-[10px] text-error font-semibold mt-0.5">
                        {isExpired ? `${Math.abs(days)}d overdue` : `${days}d left`}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Quick Action Bar */}
        <div className="mt-10 flex justify-center">
          <div className="bg-surface-container-lowest/90 backdrop-blur-2xl rounded-3xl p-4 shadow-modal border border-white/20 flex justify-around items-center gap-4">
            {[
              { icon: 'add_box', label: 'New Lease' },
              { icon: 'history', label: 'History' },
              { icon: 'mail', label: 'Notify All' },
              { icon: 'analytics', label: 'Reports' },
            ].map(a => (
              <button key={a.label} className="flex flex-col items-center gap-1 p-2 group">
                <div className="w-12 h-12 bg-surface-container-high rounded-2xl flex items-center justify-center group-hover:bg-primary-fixed group-active:scale-90 transition-all">
                  <span className="material-symbols-outlined text-primary">{a.icon}</span>
                </div>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">{a.label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </AppLayout>
  )
}

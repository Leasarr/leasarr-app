'use client'

import { useEffect, useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { formatCurrency, formatDate, getInitials, cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

type TenantData = {
  id: string
  first_name: string
  last_name: string
  unit: { unit_number: string } | null
  property: { name: string; manager_id: string } | null
}

type LeaseData = {
  id: string
  rent_amount: number
  end_date: string
  status: string
}

type PaymentData = {
  id: string
  amount: number
  due_date: string
  paid_date: string | null
  status: 'paid' | 'pending' | 'overdue' | 'partial' | 'failed'
}

type ManagerData = { name: string; email: string }

export default function TenantPortalPage() {
  const { profile, loading: authLoading } = useAuth()
  const supabase = createClient()

  const [tenant, setTenant] = useState<TenantData | null>(null)
  const [lease, setLease] = useState<LeaseData | null>(null)
  const [payments, setPayments] = useState<PaymentData[]>([])
  const [manager, setManager] = useState<ManagerData | null>(null)
  const [openRequests, setOpenRequests] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!profile) return
    setLoading(true)
    async function fetchPortalData() {
      const { data: tenantData } = await supabase
        .from('tenants')
        .select('id, first_name, last_name, unit:units(unit_number), property:properties(name, manager_id)')
        .eq('profile_id', profile!.id)
        .maybeSingle()

      if (!tenantData) { setLoading(false); return }
      const t = tenantData as unknown as TenantData
      setTenant(t)

      const [leaseRes, paymentsRes, maintRes] = await Promise.all([
        supabase.from('leases').select('id, rent_amount, end_date, status').eq('tenant_id', t.id).eq('status', 'active').maybeSingle(),
        supabase.from('payments').select('id, amount, due_date, paid_date, status').eq('tenant_id', t.id).order('due_date', { ascending: false }).limit(5),
        supabase.from('maintenance_requests').select('id', { count: 'exact' }).eq('tenant_id', t.id).in('status', ['open', 'in_progress']),
      ])

      setLease(leaseRes.data ?? null)
      setPayments(paymentsRes.data ?? [])
      setOpenRequests(maintRes.count ?? 0)

      if (t.property?.manager_id) {
        const { data: managerData } = await supabase.from('profiles').select('name, email').eq('id', t.property.manager_id).maybeSingle()
        setManager(managerData ?? null)
      }

      setLoading(false)
    }
    fetchPortalData()
  }, [profile])

  const pendingPayment = payments.find(p => p.status === 'pending' || p.status === 'overdue')
  const balance = pendingPayment?.amount ?? 0
  const isOverdue = pendingPayment?.status === 'overdue'

  if (authLoading || loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <span className="material-symbols-outlined text-4xl text-primary animate-pulse">home</span>
            <p className="text-on-surface-variant mt-2">Loading your portal...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (!tenant) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
          <div className="w-20 h-20 bg-surface-container rounded-3xl flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-4xl text-outline">person_off</span>
          </div>
          <h2 className="text-2xl font-headline font-bold text-on-surface">No tenant record found</h2>
          <p className="text-on-surface-variant mt-2 text-sm">Your account hasn't been linked to a tenant record yet. Contact your property manager.</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">

        {/* Welcome */}
        <section className="space-y-1">
          <p className="text-on-surface-variant font-medium text-sm">Welcome back, {tenant.first_name}</p>
          <h1 className="text-3xl font-headline font-extrabold tracking-tight text-on-surface">
            {tenant.property?.name ?? 'Your Home'}{tenant.unit ? `, ${tenant.unit.unit_number}` : ''}
          </h1>
        </section>

        {/* Balance Hero */}
        <section className="relative overflow-hidden rounded-[2rem] p-8 text-white shadow-2xl" style={{ background: 'linear-gradient(135deg, #003d9b 0%, #0052cc 100%)' }}>
          <div className="relative z-10">
            <p className="text-white/80 font-medium text-sm mb-1">
              {balance === 0 ? 'All Paid Up' : isOverdue ? 'Overdue Balance' : 'Current Balance'}
            </p>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-4xl font-headline font-extrabold tracking-tighter">
                {formatCurrency(balance).replace('.00', '')}
              </span>
              <span className="text-white/90 font-semibold">.00</span>
            </div>
            <button className="w-full py-4 bg-white text-on-primary-fixed font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg hover:bg-white/95">
              <span className="material-symbols-outlined">payments</span>
              Pay Rent
            </button>
            {pendingPayment && (
              <p className="text-center mt-4 text-xs text-white/70">
                Due by {formatDate(pendingPayment.due_date)}{isOverdue && ' — Overdue'}
              </p>
            )}
          </div>
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-2 gap-4">
          <Link href="/portal/maintenance" className="col-span-2 bg-surface-container-low p-5 rounded-[1.5rem] flex items-center justify-between group active:bg-surface-container transition-colors hover:shadow-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-tertiary-fixed flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined">build</span>
              </div>
              <div>
                <h3 className="font-bold text-on-surface">Maintenance</h3>
                <p className="text-xs text-on-surface-variant">
                  {openRequests > 0 ? `${openRequests} active request${openRequests > 1 ? 's' : ''}` : 'Request a repair'}
                </p>
              </div>
            </div>
            <span className="material-symbols-outlined text-outline">chevron_right</span>
          </Link>

          <Link href="/portal/lease" className="bg-surface-container-low p-5 rounded-[1.5rem] space-y-3 active:bg-surface-container transition-colors hover:shadow-card">
            <div className="w-10 h-10 rounded-lg bg-secondary-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined">description</span>
            </div>
            <div>
              <h3 className="font-bold text-on-surface text-sm">Lease</h3>
              <p className="text-[10px] text-on-surface-variant">
                {lease ? `Ends ${formatDate(lease.end_date, 'MMM yyyy')}` : 'View details'}
              </p>
            </div>
          </Link>

          <div className="bg-surface-container-low p-5 rounded-[1.5rem] space-y-3 transition-colors hover:shadow-card cursor-pointer">
            <div className="w-10 h-10 rounded-lg bg-secondary-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined">receipt_long</span>
            </div>
            <div>
              <h3 className="font-bold text-on-surface text-sm">Receipts</h3>
              <p className="text-[10px] text-on-surface-variant">History & Tax</p>
            </div>
          </div>
        </section>

        {/* Manager Card */}
        {manager && (
          <section className="flex items-center gap-4 p-4 bg-surface-container-lowest rounded-2xl shadow-card">
            <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-primary font-bold flex-shrink-0">
              {getInitials(manager.name)}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm text-on-surface">Property Manager</h4>
              <p className="text-xs text-on-surface-variant">{manager.name} • Available</p>
            </div>
            <button className="w-10 h-10 rounded-full bg-blue-50 text-primary flex items-center justify-center active:scale-90 transition-transform hover:bg-primary-fixed">
              <span className="material-symbols-outlined text-sm material-symbols-filled">chat_bubble</span>
            </button>
          </section>
        )}

        {/* Recent Transactions */}
        <section>
          <h2 className="text-lg font-bold text-on-surface mb-4">Recent Transactions</h2>
          {payments.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-2xl p-8 text-center text-on-surface-variant shadow-card">
              <span className="material-symbols-outlined text-3xl mb-2 block">receipt_long</span>
              <p className="text-sm font-semibold">No transactions yet</p>
            </div>
          ) : (
            <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-card">
              {payments.map((tx, i) => (
                <div key={tx.id} className={cn('p-4 flex items-center justify-between hover:bg-surface-container-low/30 transition-colors', i < payments.length - 1 && 'border-b border-surface-container')}>
                  <div>
                    <p className="font-semibold text-sm text-on-surface">{formatDate(tx.due_date, 'MMMM yyyy')} Rent</p>
                    <p className="text-xs text-on-surface-variant">{formatDate(tx.due_date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-on-surface">{formatCurrency(tx.amount)}</p>
                    <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full',
                      tx.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                      tx.status === 'overdue' ? 'bg-error-container text-error' :
                      'bg-surface-container-high text-on-surface-variant'
                    )}>
                      {tx.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </AppLayout>
  )
}

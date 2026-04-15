'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { formatCurrency, formatDate, getStatusColor, cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'

type PaymentRow = {
  id: string
  amount: number
  due_date: string
  paid_date: string | null
  status: 'paid' | 'pending' | 'overdue' | 'partial' | 'failed'
  method: string | null
  late_fee: number | null
  tenant: { first_name: string; last_name: string } | null
}

const methodIcon: Record<string, string> = {
  credit_card: 'credit_card',
  ach: 'account_balance',
  wire: 'send_to_mobile',
  check: 'receipt_long',
  cash: 'payments',
}

export default function PaymentsPage() {
  const { profile, loading: authLoading } = useAuth()
  const supabase = createClient()

  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all')

  useEffect(() => {
    if (!profile) return
    setLoading(true)
    async function fetchPayments() {
      const { data } = await supabase
        .from('payments')
        .select(`
          id, amount, due_date, paid_date, status, method, late_fee,
          tenant:tenants(first_name, last_name)
        `)
        .order('due_date', { ascending: false })
      setPayments((data as unknown as PaymentRow[]) ?? [])
      setLoading(false)
    }
    fetchPayments()
  }, [profile])

  const filtered = filter === 'all' ? payments : payments.filter(p => p.status === filter)

  const totalCollected = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0)
  const outstanding = payments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0)
  const overdue = payments.filter(p => p.status === 'overdue').reduce((s, p) => s + p.amount, 0)
  const collectionRate = payments.length > 0
    ? Math.round((payments.filter(p => p.status === 'paid').length / payments.length) * 100)
    : 0

  if (authLoading || loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <span className="material-symbols-outlined text-4xl text-primary animate-pulse">payments</span>
            <p className="text-on-surface-variant mt-2">Loading payments...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">

        {/* Hero Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-surface-container-lowest rounded-xl p-8 flex flex-col justify-between min-h-[200px] shadow-card">
            <div>
              <span className="text-sm font-semibold text-on-surface-variant uppercase tracking-widest font-headline">Total Collections</span>
              <h1 className="text-5xl font-headline font-extrabold text-primary mt-2 tracking-tight">
                {formatCurrency(totalCollected)}
              </h1>
            </div>
            <div className="flex items-center gap-6 mt-8 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-on-surface-variant">{collectionRate}% collection rate</span>
              </div>
              <a href="/reports" className="flex items-center gap-1 text-primary font-semibold text-sm hover:underline">
                View Report <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-surface-container-low rounded-xl p-6 flex items-center justify-between shadow-card">
              <div>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest font-headline">Pending</p>
                <p className="text-2xl font-bold font-headline text-on-surface">{formatCurrency(outstanding)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-tertiary-fixed flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined">schedule</span>
              </div>
            </div>
            <div className="bg-error-container/30 rounded-xl p-6 flex items-center justify-between shadow-card">
              <div>
                <p className="text-xs font-bold text-error uppercase tracking-widest font-headline">Overdue</p>
                <p className="text-2xl font-bold font-headline text-error">{formatCurrency(overdue)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center text-error">
                <span className="material-symbols-outlined">warning</span>
              </div>
            </div>
          </div>
        </section>

        {/* Payment History */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold font-headline px-1">Payment History</h2>

          {/* Filter Pills */}
          <div className="flex gap-2 flex-wrap">
            {(['all', 'paid', 'pending', 'overdue'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-colors',
                  filter === f ? 'primary-gradient text-on-primary' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                )}
              >
                {f}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant text-center">
              <span className="material-symbols-outlined text-5xl mb-3">receipt_long</span>
              <p className="font-bold text-on-surface">No payments yet</p>
              <p className="text-sm mt-1">Payment records will appear here once added.</p>
            </div>
          ) : (
            <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-card">
              <div className="divide-y divide-surface-container-high/50">
                {filtered.map(payment => {
                  const tenantName = payment.tenant
                    ? `${payment.tenant.first_name} ${payment.tenant.last_name}`
                    : 'Unknown Tenant'
                  const icon = methodIcon[payment.method ?? ''] ?? 'payments'
                  return (
                    <div key={payment.id} className="p-5 flex items-center justify-between hover:bg-surface-container-low/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center',
                          payment.status === 'overdue' ? 'bg-error-container/20 text-error' :
                          payment.status === 'pending' ? 'bg-surface-container text-on-surface-variant' :
                          'bg-secondary-container text-on-secondary-container'
                        )}>
                          <span className="material-symbols-outlined">{icon}</span>
                        </div>
                        <div>
                          <p className="font-bold text-on-surface text-sm">{tenantName}</p>
                          <p className="text-xs text-on-surface-variant">
                            {formatDate(payment.due_date)}{payment.method ? ` • ${payment.method.replace('_', ' ').toUpperCase()}` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-on-surface">{formatCurrency(payment.amount)}</p>
                        {payment.late_fee && <p className="text-xs text-error">+{formatCurrency(payment.late_fee)} late fee</p>}
                        <span className={cn('badge mt-1', getStatusColor(payment.status))}>{payment.status}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </section>

      </div>
    </AppLayout>
  )
}

'use client'

import { useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { PAYMENTS, TENANTS, PAYMENT_SUMMARY } from '@/data/mock'
import { formatCurrency, formatDate, getStatusColor, cn } from '@/lib/utils'
import type { Payment } from '@/types'

export default function PaymentsPage() {
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all')
  const summary = PAYMENT_SUMMARY

  const filtered = filter === 'all' ? PAYMENTS : PAYMENTS.filter(p => p.status === filter)
  const getTenant = (id: string) => TENANTS.find(t => t.id === id)

  const methodIcon: Record<string, string> = {
    credit_card: 'credit_card',
    ach: 'account_balance',
    wire: 'send_to_mobile',
    check: 'receipt_long',
    cash: 'payments',
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-10">

        {/* Hero Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Balance */}
          <div className="md:col-span-2 bg-surface-container-lowest rounded-xl p-8 flex flex-col justify-between min-h-[200px] shadow-card">
            <div>
              <span className="text-sm font-semibold text-on-surface-variant uppercase tracking-widest font-headline">Total Collections</span>
              <h1 className="text-5xl font-headline font-extrabold text-primary mt-2 tracking-tight">
                {formatCurrency(summary.total_collected)}
              </h1>
            </div>
            <div className="flex items-center gap-6 mt-8 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-on-surface-variant">{summary.collection_rate}% Collected this month</span>
              </div>
              <a href="/reports" className="flex items-center gap-1 text-primary font-semibold text-sm hover:underline">
                View Report <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </a>
            </div>
          </div>

          {/* Pending + Overdue */}
          <div className="space-y-4">
            <div className="bg-surface-container-low rounded-xl p-6 flex items-center justify-between shadow-card">
              <div>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest font-headline">Pending</p>
                <p className="text-2xl font-bold font-headline text-on-surface">{formatCurrency(summary.outstanding)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-tertiary-fixed flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined">schedule</span>
              </div>
            </div>
            <div className="bg-error-container/30 rounded-xl p-6 flex items-center justify-between shadow-card">
              <div>
                <p className="text-xs font-bold text-error uppercase tracking-widest font-headline">Overdue</p>
                <p className="text-2xl font-bold font-headline text-error">{formatCurrency(summary.overdue)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center text-error">
                <span className="material-symbols-outlined">warning</span>
              </div>
            </div>
          </div>
        </section>

        {/* History + Record Panel */}
        <section className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-full md:w-2/3 space-y-4">
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

            <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-card">
              <div className="divide-y divide-surface-container-high/50">
                {filtered.map(payment => {
                  const tenant = getTenant(payment.tenant_id)
                  const icon = methodIcon[payment.method ?? 'credit_card'] ?? 'payments'
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
                          <p className="font-bold text-on-surface text-sm">
                            {tenant ? `${tenant.first_name} ${tenant.last_name}` : 'Unknown Tenant'}
                          </p>
                          <p className="text-xs text-on-surface-variant">
                            {formatDate(payment.due_date)} {payment.method && `• ${payment.method.replace('_', ' ').toUpperCase()}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-on-surface">{formatCurrency(payment.amount)}</p>
                        {payment.late_fee && <p className="text-xs text-error">+{formatCurrency(payment.late_fee)} late</p>}
                        <span className={cn('badge mt-1', getStatusColor(payment.status))}>{payment.status}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Record Payment Panel */}
          <div className="w-full md:w-1/3 space-y-4 md:sticky md:top-20">
            <div className="bg-primary-container p-8 rounded-2xl shadow-primary relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <svg width="100%" height="100%">
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#grid)"/>
                </svg>
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold font-headline text-on-primary-container mb-2">Record a Payment</h3>
                <p className="text-sm opacity-90 mb-6 text-on-primary-container/80">Manually log a transaction for offline payments or external transfers.</p>
                <button className="w-full py-4 bg-white text-primary font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-white/95 transition-all active:scale-95">
                  <span className="material-symbols-outlined">add_card</span>
                  New Entry
                </button>
              </div>
            </div>

            <div className="bg-surface-container-low rounded-xl p-5 shadow-card">
              <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4">Accepted Methods</h4>
              <div className="grid grid-cols-3 gap-3">
                {[{ icon: 'credit_card', label: 'Card' }, { icon: 'account_balance', label: 'ACH' }, { icon: 'send_to_mobile', label: 'E-Trans' }].map(m => (
                  <div key={m.label} className="flex flex-col items-center gap-2 p-3 bg-surface-container-lowest rounded-xl">
                    <span className="material-symbols-outlined text-primary">{m.icon}</span>
                    <span className="text-[10px] font-bold text-on-surface">{m.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Success Card */}
            <div className="bg-white rounded-2xl shadow-modal border border-surface-container p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-green-500" />
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
                  <span className="material-symbols-outlined text-3xl material-symbols-filled">check_circle</span>
                </div>
                <h3 className="text-lg font-bold font-headline text-on-surface">Payment Successful</h3>
                <p className="text-on-surface-variant mt-1 text-sm">Receipt #REC-2023-0842</p>
                <div className="w-full mt-5 p-4 bg-surface-container-low rounded-xl text-left space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Amount Paid</span>
                    <span className="font-bold">{formatCurrency(2450)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Date</span>
                    <span className="font-medium">Oct 12, 2023</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Property</span>
                    <span className="font-medium">Modern Loft #402</span>
                  </div>
                </div>
                <div className="flex w-full gap-3 mt-5">
                  <button className="flex-1 py-2.5 text-sm font-bold text-primary border border-primary/20 rounded-xl hover:bg-primary/5">Download PDF</button>
                  <button className="flex-1 py-2.5 text-sm font-bold primary-gradient text-on-primary rounded-xl hover:opacity-90">Done</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  )
}

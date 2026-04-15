'use client'

import { useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { PAYMENTS, TENANTS, PAYMENT_SUMMARY, RECURRING_PAYMENTS, BANK_ACCOUNTS, PROPERTIES } from '@/data/mock'
import { formatCurrency, formatDate, getStatusColor, getDaysUntil, cn } from '@/lib/utils'

type Tab = 'history' | 'recurring' | 'accounts'

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('history')
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all')
  const summary = PAYMENT_SUMMARY

  const filtered = filter === 'all' ? PAYMENTS : PAYMENTS.filter(p => p.status === filter)
  const getTenant = (id: string) => TENANTS.find(t => t.id === id)
  const getProperty = (id: string) => PROPERTIES.find(p => p.id === id)

  const methodIcon: Record<string, string> = {
    credit_card: 'credit_card',
    ach: 'account_balance',
    wire: 'send_to_mobile',
    check: 'receipt_long',
    cash: 'payments',
  }

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: 'history', label: 'Payment History', icon: 'receipt_long' },
    { id: 'recurring', label: 'Recurring', icon: 'autorenew' },
    { id: 'accounts', label: 'Bank Accounts', icon: 'account_balance' },
  ]

  const recurringStatusColor: Record<string, string> = {
    active: 'bg-secondary-container text-on-secondary-container',
    paused: 'bg-surface-container-high text-on-surface-variant',
    cancelled: 'bg-error-container/30 text-error',
  }

  const frequencyLabel: Record<string, string> = {
    monthly: 'Monthly',
    weekly: 'Weekly',
    'bi-weekly': 'Bi-Weekly',
    quarterly: 'Quarterly',
  }

  const bankStatusColor: Record<string, string> = {
    connected: 'bg-secondary-container text-on-secondary-container',
    pending: 'bg-tertiary-fixed/40 text-tertiary',
    disconnected: 'bg-error-container/30 text-error',
  }

  const bankIcon: Record<string, string> = {
    checking: 'account_balance_wallet',
    savings: 'savings',
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {/* Hero Stats — always visible */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-surface-container-low rounded-xl p-1 w-fit">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all',
                activeTab === tab.id
                  ? 'bg-surface-container-lowest text-primary shadow-card'
                  : 'text-on-surface-variant hover:text-on-surface'
              )}
            >
              <span className="material-symbols-outlined text-base">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── History Tab ─────────────────────────────────────────────────────── */}
        {activeTab === 'history' && (
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

            {/* Record Payment Panel — hidden for MVP */}
            {/* <div className="w-full md:w-1/3 space-y-4 md:sticky md:top-20">
              <div className="bg-primary-container p-8 rounded-2xl shadow-primary relative overflow-hidden">
                ...Record a Payment...
              </div>
              <div className="bg-surface-container-low rounded-xl p-5 shadow-card">
                ...Accepted Methods...
              </div>
              <div className="bg-white rounded-2xl shadow-modal border border-surface-container p-6 relative overflow-hidden">
                ...Payment Successful receipt...
              </div>
            </div> */}
          </section>
        )}

        {/* ── Recurring Tab ────────────────────────────────────────────────────── */}
        {activeTab === 'recurring' && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-headline">Recurring Payments</h2>
                <p className="text-sm text-on-surface-variant mt-1">Scheduled auto-pay rules for all active tenants</p>
              </div>
              <button className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm">
                <span className="material-symbols-outlined text-base">add</span>
                New Rule
              </button>
            </div>

            {/* Summary Chips */}
            <div className="flex gap-3 flex-wrap">
              {[
                { label: 'Active', count: RECURRING_PAYMENTS.filter(r => r.status === 'active').length, color: 'bg-secondary-container text-on-secondary-container' },
                { label: 'Paused', count: RECURRING_PAYMENTS.filter(r => r.status === 'paused').length, color: 'bg-surface-container-high text-on-surface-variant' },
                { label: 'Cancelled', count: RECURRING_PAYMENTS.filter(r => r.status === 'cancelled').length, color: 'bg-error-container/30 text-error' },
              ].map(chip => (
                <div key={chip.label} className={cn('flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold', chip.color)}>
                  <span>{chip.count}</span>
                  <span>{chip.label}</span>
                </div>
              ))}
            </div>

            <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-card">
              <div className="divide-y divide-surface-container-high/50">
                {RECURRING_PAYMENTS.map(rp => {
                  const tenant = getTenant(rp.tenant_id)
                  const daysUntil = getDaysUntil(rp.next_due)
                  const isOverdue = daysUntil < 0
                  return (
                    <div key={rp.id} className="p-5 flex items-center justify-between hover:bg-surface-container-low/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center',
                          rp.status === 'active' ? 'bg-secondary-container text-on-secondary-container' :
                          rp.status === 'paused' ? 'bg-surface-container text-on-surface-variant' :
                          'bg-error-container/20 text-error'
                        )}>
                          <span className="material-symbols-outlined">autorenew</span>
                        </div>
                        <div>
                          <p className="font-bold text-on-surface text-sm">
                            {tenant ? `${tenant.first_name} ${tenant.last_name}` : 'Unknown Tenant'}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-on-surface-variant">{frequencyLabel[rp.frequency]}</span>
                            <span className="text-on-surface-variant/40">·</span>
                            <span className="text-xs text-on-surface-variant">{rp.method.replace('_', ' ').toUpperCase()}</span>
                            <span className="text-on-surface-variant/40">·</span>
                            <span className={cn('text-xs font-medium', isOverdue ? 'text-error' : daysUntil <= 3 ? 'text-tertiary' : 'text-on-surface-variant')}>
                              {isOverdue ? `${Math.abs(daysUntil)}d overdue` : daysUntil === 0 ? 'Due today' : `Due in ${daysUntil}d`}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-on-surface">{formatCurrency(rp.amount)}</p>
                          <p className="text-xs text-on-surface-variant">Next: {formatDate(rp.next_due)}</p>
                        </div>
                        <span className={cn('badge', recurringStatusColor[rp.status])}>{rp.status}</span>
                        <div className="flex gap-1">
                          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors">
                            <span className="material-symbols-outlined text-base">{rp.status === 'active' ? 'pause' : 'play_arrow'}</span>
                          </button>
                          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors">
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Next Run Summary */}
            <div className="bg-primary-container/20 rounded-xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-primary flex-shrink-0">
                <span className="material-symbols-outlined">info</span>
              </div>
              <div>
                <p className="font-bold text-on-surface text-sm">Next Batch Run</p>
                <p className="text-sm text-on-surface-variant mt-0.5">
                  {RECURRING_PAYMENTS.filter(r => r.status === 'active').length} active rules will process on Nov 1, 2024, totalling{' '}
                  <span className="font-bold text-on-surface">
                    {formatCurrency(RECURRING_PAYMENTS.filter(r => r.status === 'active').reduce((s, r) => s + r.amount, 0))}
                  </span>
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ── Bank Accounts Tab ────────────────────────────────────────────────── */}
        {activeTab === 'accounts' && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-headline">Bank Accounts</h2>
                <p className="text-sm text-on-surface-variant mt-1">Linked accounts for receiving rent and disbursements</p>
              </div>
              <button className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm">
                <span className="material-symbols-outlined text-base">add</span>
                Link Account
              </button>
            </div>

            {/* Total Balance */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-card flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest font-headline">Total Balance Across Accounts</p>
                <p className="text-4xl font-extrabold font-headline text-primary mt-1">
                  {formatCurrency(BANK_ACCOUNTS.reduce((s, a) => s + a.balance, 0))}
                </p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-primary-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-3xl">account_balance</span>
              </div>
            </div>

            {/* Account Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {BANK_ACCOUNTS.map(account => {
                const linkedProperties = account.property_ids.map(id => getProperty(id)?.name).filter(Boolean)
                return (
                  <div key={account.id} className="bg-surface-container-lowest rounded-xl p-6 shadow-card space-y-4 hover:shadow-modal transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-xl bg-primary-container/30 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-2xl">{bankIcon[account.account_type]}</span>
                      </div>
                      <span className={cn('badge text-xs', bankStatusColor[account.status])}>{account.status}</span>
                    </div>

                    <div>
                      <p className="font-bold text-on-surface">{account.account_name}</p>
                      <p className="text-sm text-on-surface-variant">{account.bank_name}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-on-surface tracking-widest">•••• •••• {account.last_four}</span>
                      <span className="badge bg-surface-container text-on-surface-variant text-[10px]">{account.account_type}</span>
                    </div>

                    <div className="pt-2 border-t border-surface-container">
                      <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wide">Balance</p>
                      <p className="text-2xl font-bold font-headline text-on-surface mt-0.5">{formatCurrency(account.balance)}</p>
                    </div>

                    {linkedProperties.length > 0 && (
                      <div>
                        <p className="text-xs text-on-surface-variant mb-1.5">Linked to</p>
                        <div className="flex flex-wrap gap-1.5">
                          {linkedProperties.map(name => (
                            <span key={name} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant">
                              {name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-1">
                      <button className="flex-1 py-2 text-xs font-bold text-primary border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors">
                        Transactions
                      </button>
                      <button className="flex-1 py-2 text-xs font-bold text-on-surface-variant border border-outline-variant rounded-lg hover:bg-surface-container transition-colors">
                        Settings
                      </button>
                    </div>
                  </div>
                )
              })}

              {/* Add Account CTA Card */}
              <button className="bg-surface-container-low border-2 border-dashed border-outline-variant rounded-xl p-6 flex flex-col items-center justify-center gap-3 hover:border-primary hover:bg-primary/5 transition-colors min-h-[280px] text-on-surface-variant hover:text-primary">
                <div className="w-12 h-12 rounded-xl border-2 border-current flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">add</span>
                </div>
                <div className="text-center">
                  <p className="font-bold text-sm">Link New Account</p>
                  <p className="text-xs mt-1 opacity-70">Connect a bank via Plaid</p>
                </div>
              </button>
            </div>

            {/* Security Note */}
            <div className="bg-surface-container-low rounded-xl p-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary">lock</span>
              <p className="text-sm text-on-surface-variant">
                Bank connections are secured with 256-bit encryption. Account numbers are never stored — only the last four digits are shown.
              </p>
            </div>
          </section>
        )}

      </div>
    </AppLayout>
  )
}

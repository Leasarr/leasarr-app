'use client'

import { useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { TENANTS, PAYMENTS } from '@/data/mock'
import { formatCurrency, formatDate, getInitials, getStatusColor, cn } from '@/lib/utils'
import type { Tenant } from '@/types'

export default function TenantsPage() {
  const [selected, setSelected] = useState<Tenant>(TENANTS[0])
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'payments' | 'lease' | 'maintenance'>('payments')

  const filtered = TENANTS.filter(t =>
    search === '' ||
    `${t.first_name} ${t.last_name} ${t.email}`.toLowerCase().includes(search.toLowerCase())
  )

  const tenantPayments = PAYMENTS.filter(p => p.tenant_id === selected.id)

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">

        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight mb-2">Tenants Directory</h1>
            <p className="text-on-surface-variant font-medium">Manage {TENANTS.length} active leases across your portfolio.</p>
            {/* Search */}
            <div className="relative w-full max-w-xl mt-4">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
              <input
                className="input-base pl-12"
                placeholder="Search by name, property, or unit..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-secondary">
              <span className="material-symbols-outlined text-xl">filter_list</span> Filters
            </button>
            <button className="btn-primary">
              <span className="material-symbols-outlined text-xl">add</span> New Tenant
            </button>
          </div>
        </div>

        {/* Asymmetric Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left: Tenant List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-bold uppercase tracking-widest text-outline">Recent Activity</span>
              <span className="text-xs font-bold text-primary">View All</span>
            </div>
            {filtered.map(tenant => (
              <button
                key={tenant.id}
                onClick={() => setSelected(tenant)}
                className={cn(
                  'w-full bg-surface-container-lowest p-5 rounded-2xl flex items-center justify-between transition-all text-left',
                  'hover:shadow-xl hover:shadow-black/5',
                  tenant.payment_status === 'overdue' && 'border-l-4 border-error',
                  selected.id === tenant.id && 'ring-2 ring-primary/20 shadow-md'
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg',
                    tenant.payment_status === 'overdue' ? 'bg-error-container text-error' : 'bg-secondary-fixed text-primary'
                  )}>
                    {getInitials(`${tenant.first_name} ${tenant.last_name}`)}
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface text-sm">{tenant.first_name} {tenant.last_name}</h3>
                    <p className="text-xs text-on-surface-variant font-medium">{tenant.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={cn('badge', getStatusColor(tenant.payment_status ?? 'current'))}>
                    {tenant.payment_status === 'overdue' ? 'Late' : tenant.status}
                  </span>
                  {tenant.payment_status === 'overdue'
                    ? <p className="text-xs mt-1 font-bold text-error">5 Days Overdue</p>
                    : <p className="text-xs mt-1 font-bold text-on-surface">{formatCurrency(2450)}/mo</p>
                  }
                </div>
              </button>
            ))}
          </div>

          {/* Right: Profile Detail */}
          <div className="lg:col-span-7 space-y-5">
            {/* Profile Header */}
            <div className="bg-white rounded-3xl p-8 shadow-card">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="relative flex-shrink-0">
                  <div className={cn(
                    'w-32 h-32 rounded-2xl flex items-center justify-center text-4xl font-bold ring-4 ring-surface-container-low',
                    selected.payment_status === 'overdue' ? 'bg-error-container text-error' : 'bg-secondary-container text-primary'
                  )}>
                    {getInitials(`${selected.first_name} ${selected.last_name}`)}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-primary text-white p-2 rounded-xl shadow-lg">
                    <span className="material-symbols-outlined text-sm material-symbols-filled">verified</span>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-3xl font-headline font-extrabold tracking-tight text-on-surface">
                        {selected.first_name} {selected.last_name}
                      </h2>
                      <p className="text-primary font-bold flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        Unit • {selected.property_id}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-3 bg-surface-container-low rounded-xl text-primary hover:bg-surface-container-high transition-colors">
                        <span className="material-symbols-outlined">mail</span>
                      </button>
                      <button className="p-3 bg-surface-container-low rounded-xl text-primary hover:bg-surface-container-high transition-colors">
                        <span className="material-symbols-outlined">call</span>
                      </button>
                    </div>
                  </div>

                  {/* AI Renewal Badge */}
                  <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary flex-shrink-0">
                      <span className="material-symbols-outlined material-symbols-filled">auto_awesome</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-primary uppercase tracking-widest">AI Renewal Insight</p>
                      <p className="text-sm font-medium text-on-surface-variant leading-tight">
                        High likelihood of renewal (92%). Consider 3% rent adjustment.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                {[
                  { label: 'Rent', value: formatCurrency(2450) },
                  { label: 'Lease Ends', value: 'May 2025' },
                  { label: 'Deposit', value: formatCurrency(3000) },
                  { label: 'Credit Score', value: selected.credit_score?.toString() ?? 'N/A' },
                ].map(item => (
                  <div key={item.label} className="bg-surface-container-low rounded-2xl p-4">
                    <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1">{item.label}</p>
                    <p className="text-xl font-extrabold text-on-surface">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-3">
              {(['payments', 'lease', 'maintenance'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'px-6 py-3 rounded-xl text-sm font-bold transition-all',
                    activeTab === tab ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                  )}
                >
                  {tab === 'payments' ? 'Payment History' : tab === 'lease' ? 'Lease Documents' : 'Maintenance'}
                </button>
              ))}
            </div>

            {/* Payment Table */}
            {activeTab === 'payments' && (
              <div className="bg-surface-container-lowest rounded-3xl p-6 overflow-hidden shadow-card">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-surface-container">
                      <th className="pb-4 text-xs font-bold text-outline uppercase tracking-widest">Date</th>
                      <th className="pb-4 text-xs font-bold text-outline uppercase tracking-widest">Description</th>
                      <th className="pb-4 text-xs font-bold text-outline uppercase tracking-widest text-right">Amount</th>
                      <th className="pb-4 text-xs font-bold text-outline uppercase tracking-widest text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container">
                    {tenantPayments.length > 0 ? tenantPayments.map(p => (
                      <tr key={p.id}>
                        <td className="py-5 text-sm font-semibold">{formatDate(p.due_date)}</td>
                        <td className="py-5 text-sm text-on-surface-variant">Monthly Rent</td>
                        <td className="py-5 text-sm font-bold text-on-surface text-right">{formatCurrency(p.amount)}</td>
                        <td className="py-5 text-right">
                          <span className={cn('badge', getStatusColor(p.status))}>{p.status}</span>
                        </td>
                      </tr>
                    )) : (
                      [
                        { date: 'Sep 01, 2023', desc: 'Monthly Rent - September', amount: formatCurrency(2450), status: 'paid', statusColor: 'bg-emerald-100 text-emerald-700' },
                        { date: 'Aug 01, 2023', desc: 'Monthly Rent - August', amount: formatCurrency(2450), status: 'paid', statusColor: 'bg-emerald-100 text-emerald-700' },
                        { date: 'Jul 12, 2023', desc: 'Plumbing Repair Reimb.', amount: '-$125.00', status: 'credit', statusColor: 'bg-blue-100 text-blue-700' },
                      ].map((row, i) => (
                        <tr key={i}>
                          <td className="py-5 text-sm font-semibold">{row.date}</td>
                          <td className="py-5 text-sm text-on-surface-variant">{row.desc}</td>
                          <td className="py-5 text-sm font-bold text-on-surface text-right">{row.amount}</td>
                          <td className="py-5 text-right"><span className={cn('badge', row.statusColor)}>{row.status.toUpperCase()}</span></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab !== 'payments' && (
              <div className="bg-surface-container-lowest rounded-3xl p-8 text-center text-on-surface-variant shadow-card">
                <span className="material-symbols-outlined text-4xl mb-3 block">description</span>
                <p className="font-semibold">Coming soon</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

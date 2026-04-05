'use client'

import { useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { TENANTS, PAYMENTS, TEAM_MEMBERS, VENDORS, PROPERTIES } from '@/data/mock'
import { formatCurrency, formatDate, getInitials, getStatusColor, cn } from '@/lib/utils'
import type { Tenant } from '@/types'

type PeopleTab = 'all' | 'tenants' | 'team' | 'vendors'
type TenantDetailTab = 'payments' | 'lease' | 'maintenance'

const SPECIALTY_STYLE = {
  plumbing:    { icon: 'plumbing',             label: 'Plumbing',    bg: 'bg-blue-100',   text: 'text-blue-700' },
  electrical:  { icon: 'electrical_services',  label: 'Electrical',  bg: 'bg-yellow-100', text: 'text-yellow-700' },
  hvac:        { icon: 'ac_unit',              label: 'HVAC',        bg: 'bg-cyan-100',   text: 'text-cyan-700' },
  landscaping: { icon: 'yard',                 label: 'Landscaping', bg: 'bg-green-100',  text: 'text-green-700' },
  general:     { icon: 'handyman',             label: 'General',     bg: 'bg-surface-container-high', text: 'text-on-surface-variant' },
  cleaning:    { icon: 'cleaning_services',    label: 'Cleaning',    bg: 'bg-purple-100', text: 'text-purple-700' },
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <span
          key={i}
          className={cn(
            'material-symbols-outlined text-sm',
            i <= Math.round(rating) ? 'material-symbols-filled text-amber-400' : 'text-outline-variant'
          )}
        >
          star
        </span>
      ))}
      <span className="text-xs font-bold text-on-surface ml-1">{rating}</span>
    </div>
  )
}

export default function PeoplePage() {
  const [activeTab, setActiveTab] = useState<PeopleTab>('all')
  const [search, setSearch] = useState('')
  const [selectedTenant, setSelectedTenant] = useState<Tenant>(TENANTS[0])
  const [tenantDetailTab, setTenantDetailTab] = useState<TenantDetailTab>('payments')

  const matchesSearch = (text: string) =>
    search === '' || text.toLowerCase().includes(search.toLowerCase())

  const filteredTenants = TENANTS.filter(t =>
    matchesSearch(`${t.first_name} ${t.last_name} ${t.email}`)
  )
  const filteredTeam = TEAM_MEMBERS.filter(m =>
    matchesSearch(`${m.name} ${m.role} ${m.email}`)
  )
  const filteredVendors = VENDORS.filter(v =>
    matchesSearch(`${v.name} ${v.company} ${v.specialty}`)
  )

  const tenantPayments = PAYMENTS.filter(p => p.tenant_id === selectedTenant.id)

  const TABS: { key: PeopleTab; label: string; count: number }[] = [
    { key: 'all',     label: 'All People', count: TENANTS.length + TEAM_MEMBERS.length + VENDORS.length },
    { key: 'tenants', label: 'Tenants',    count: TENANTS.length },
    { key: 'team',    label: 'Team',       count: TEAM_MEMBERS.length },
    { key: 'vendors', label: 'Vendors',    count: VENDORS.length },
  ]

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">

        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight mb-1">People</h1>
            <p className="text-on-surface-variant font-medium">
              Manage everyone connected to your portfolio
            </p>
            <div className="flex gap-2 mt-3">
              {[
                { label: `${TENANTS.length} Tenants`,      bg: 'bg-secondary-container text-on-secondary-container' },
                { label: `${TEAM_MEMBERS.length} Team`,    bg: 'bg-primary-container/30 text-primary' },
                { label: `${VENDORS.length} Vendors`,      bg: 'bg-tertiary-container/20 text-on-tertiary-fixed-variant' },
              ].map(b => (
                <span key={b.label} className={cn('badge text-[10px]', b.bg)}>{b.label}</span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-secondary">
              <span className="material-symbols-outlined text-xl">filter_list</span> Filters
            </button>
            <button className="btn-primary">
              <span className="material-symbols-outlined text-xl">person_add</span> Add Person
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="w-full max-w-xl mb-6">
          <input
            className="input-base"
            placeholder="Search by name, email, role, or specialty..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b border-outline-variant/30">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setSearch('') }}
              className={cn(
                'px-5 py-3 text-sm font-bold transition-all border-b-2 -mb-px flex items-center gap-2',
                activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              )}
            >
              {tab.label}
              <span className={cn(
                'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                activeTab === tab.key ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* ── ALL PEOPLE TAB ── */}
        {activeTab === 'all' && (
          <div className="space-y-3">
            {/* Tenants */}
            {filteredTenants.map(t => (
              <div key={t.id} className="bg-surface-container-lowest rounded-2xl p-4 flex items-center gap-4 hover:shadow-card transition-all">
                <div className={cn(
                  'w-11 h-11 rounded-full flex items-center justify-center font-bold text-base flex-shrink-0',
                  t.payment_status === 'overdue' ? 'bg-error-container text-error' : 'bg-secondary-fixed text-primary'
                )}>
                  {getInitials(`${t.first_name} ${t.last_name}`)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-on-surface">{t.first_name} {t.last_name}</p>
                    <span className="badge bg-secondary-container text-on-secondary-container text-[10px]">Tenant</span>
                    {t.payment_status === 'overdue' && (
                      <span className="badge bg-error-container text-error text-[10px]">Overdue</span>
                    )}
                  </div>
                  <p className="text-xs text-on-surface-variant truncate">{t.email}</p>
                </div>
                <div className="text-right hidden sm:block flex-shrink-0">
                  <p className="text-xs text-on-surface-variant">
                    {PROPERTIES.find(p => p.id === t.property_id)?.name ?? '—'}
                  </p>
                  <p className="text-xs font-semibold text-on-surface">{t.phone}</p>
                </div>
              </div>
            ))}

            {/* Team */}
            {filteredTeam.map(m => (
              <div key={m.id} className="bg-surface-container-lowest rounded-2xl p-4 flex items-center gap-4 hover:shadow-card transition-all">
                <div className="w-11 h-11 rounded-full bg-primary-container/30 text-primary flex items-center justify-center font-bold text-base flex-shrink-0">
                  {getInitials(m.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-on-surface">{m.name}</p>
                    <span className="badge bg-primary-container/30 text-primary text-[10px]">Team</span>
                  </div>
                  <p className="text-xs text-on-surface-variant">{m.role} · {m.email}</p>
                </div>
                <div className="text-right hidden sm:block flex-shrink-0">
                  <p className="text-xs text-on-surface-variant">{m.assigned_properties.length} properties</p>
                  <p className="text-xs font-semibold text-on-surface">{m.phone}</p>
                </div>
              </div>
            ))}

            {/* Vendors */}
            {filteredVendors.map(v => {
              const sp = SPECIALTY_STYLE[v.specialty]
              return (
                <div key={v.id} className="bg-surface-container-lowest rounded-2xl p-4 flex items-center gap-4 hover:shadow-card transition-all">
                  <div className="w-11 h-11 rounded-full bg-tertiary-container/20 text-on-tertiary-fixed-variant flex items-center justify-center font-bold text-base flex-shrink-0">
                    {getInitials(v.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-on-surface">{v.name}</p>
                      <span className="badge bg-tertiary-container/20 text-on-tertiary-fixed-variant text-[10px]">Vendor</span>
                      <span className={cn('badge text-[10px]', sp.bg, sp.text)}>{sp.label}</span>
                    </div>
                    <p className="text-xs text-on-surface-variant truncate">{v.company} · {v.email}</p>
                  </div>
                  <div className="text-right hidden sm:block flex-shrink-0">
                    <StarRating rating={v.rating} />
                    <p className="text-xs font-semibold text-on-surface mt-0.5">{v.phone}</p>
                  </div>
                </div>
              )
            })}

            {filteredTenants.length + filteredTeam.length + filteredVendors.length === 0 && (
              <div className="text-center py-16 text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-2 block">search_off</span>
                <p className="font-semibold">No results for "{search}"</p>
              </div>
            )}
          </div>
        )}

        {/* ── TENANTS TAB ── */}
        {activeTab === 'tenants' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Left: Tenant List */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-bold uppercase tracking-widest text-outline">{filteredTenants.length} tenants</span>
                <span className="text-xs font-bold text-primary">View All</span>
              </div>
              {filteredTenants.map(tenant => (
                <button
                  key={tenant.id}
                  onClick={() => setSelectedTenant(tenant)}
                  className={cn(
                    'w-full bg-surface-container-lowest p-5 rounded-2xl flex items-center justify-between transition-all text-left',
                    'hover:shadow-xl hover:shadow-black/5',
                    tenant.payment_status === 'overdue' && 'border-l-4 border-error',
                    selectedTenant.id === tenant.id && 'ring-2 ring-primary/20 shadow-md'
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
              {filteredTenants.length === 0 && (
                <div className="text-center py-16 text-on-surface-variant">
                  <span className="material-symbols-outlined text-4xl mb-2 block">search_off</span>
                  <p className="font-semibold">No tenants match "{search}"</p>
                </div>
              )}
            </div>

            {/* Right: Tenant Detail */}
            <div className="lg:col-span-7 space-y-5">
              <div className="bg-white rounded-3xl p-8 shadow-card">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="relative flex-shrink-0">
                    <div className={cn(
                      'w-32 h-32 rounded-2xl flex items-center justify-center text-4xl font-bold ring-4 ring-surface-container-low',
                      selectedTenant.payment_status === 'overdue' ? 'bg-error-container text-error' : 'bg-secondary-container text-primary'
                    )}>
                      {getInitials(`${selectedTenant.first_name} ${selectedTenant.last_name}`)}
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-primary text-white p-2 rounded-xl shadow-lg">
                      <span className="material-symbols-outlined text-sm material-symbols-filled">verified</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-3xl font-headline font-extrabold tracking-tight text-on-surface">
                          {selectedTenant.first_name} {selectedTenant.last_name}
                        </h2>
                        <p className="text-primary font-bold flex items-center gap-1 mt-1">
                          <span className="material-symbols-outlined text-sm">location_on</span>
                          {PROPERTIES.find(p => p.id === selectedTenant.property_id)?.name ?? 'Unknown Property'}
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                  {[
                    { label: 'Rent',       value: formatCurrency(2450) },
                    { label: 'Lease Ends', value: 'May 2025' },
                    { label: 'Deposit',    value: formatCurrency(3000) },
                    { label: 'Credit Score', value: selectedTenant.credit_score?.toString() ?? 'N/A' },
                  ].map(item => (
                    <div key={item.label} className="bg-surface-container-low rounded-2xl p-4">
                      <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1">{item.label}</p>
                      <p className="text-xl font-extrabold text-on-surface">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detail Tabs */}
              <div className="flex gap-3">
                {(['payments', 'lease', 'maintenance'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setTenantDetailTab(tab)}
                    className={cn(
                      'px-6 py-3 rounded-xl text-sm font-bold transition-all',
                      tenantDetailTab === tab ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                    )}
                  >
                    {tab === 'payments' ? 'Payment History' : tab === 'lease' ? 'Lease Documents' : 'Maintenance'}
                  </button>
                ))}
              </div>

              {tenantDetailTab === 'payments' && (
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
                        <tr>
                          <td colSpan={4} className="py-10 text-center text-on-surface-variant text-sm">No payment records found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {tenantDetailTab !== 'payments' && (
                <div className="bg-surface-container-lowest rounded-3xl p-8 text-center text-on-surface-variant shadow-card">
                  <span className="material-symbols-outlined text-4xl mb-3 block">description</span>
                  <p className="font-semibold">Coming soon</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TEAM TAB ── */}
        {activeTab === 'team' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTeam.map(member => (
              <div key={member.id} className="bg-surface-container-lowest rounded-2xl p-6 shadow-card hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary-container/30 text-primary flex items-center justify-center font-bold text-xl">
                    {getInitials(member.name)}
                  </div>
                  <span className={cn(
                    'badge text-[10px]',
                    member.status === 'active' ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-high text-on-surface-variant'
                  )}>
                    {member.status}
                  </span>
                </div>
                <h3 className="font-bold text-on-surface text-base mb-0.5">{member.name}</h3>
                <p className="text-xs font-semibold text-primary mb-4">{member.role}</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm text-outline">mail</span>
                    {member.email}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm text-outline">call</span>
                    {member.phone}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm text-outline">domain</span>
                    {member.assigned_properties.length} {member.assigned_properties.length === 1 ? 'property' : 'properties'} assigned
                  </div>
                </div>
                <div className="mt-5 flex gap-2">
                  <button className="flex-1 py-2.5 rounded-xl bg-primary-container/20 text-primary text-xs font-bold hover:bg-primary-container/40 transition-colors">
                    Message
                  </button>
                  <button className="flex-1 py-2.5 rounded-xl bg-surface-container text-on-surface-variant text-xs font-bold hover:bg-surface-container-high transition-colors">
                    View Profile
                  </button>
                </div>
              </div>
            ))}
            {filteredTeam.length === 0 && (
              <div className="col-span-3 text-center py-16 text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-2 block">group_off</span>
                <p className="font-semibold">No team members match "{search}"</p>
              </div>
            )}
          </div>
        )}

        {/* ── VENDORS TAB ── */}
        {activeTab === 'vendors' && (
          <div className="space-y-4">
            {filteredVendors.map(vendor => {
              const sp = SPECIALTY_STYLE[vendor.specialty]
              return (
                <div key={vendor.id} className="bg-surface-container-lowest rounded-2xl p-5 shadow-card hover:shadow-md transition-all flex items-center gap-5">
                  <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0', sp.bg)}>
                    <span className={cn('material-symbols-outlined text-2xl', sp.text)}>{sp.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-bold text-on-surface">{vendor.name}</h3>
                      <span className={cn('badge text-[10px]', sp.bg, sp.text)}>{sp.label}</span>
                    </div>
                    <p className="text-xs font-semibold text-on-surface-variant mb-2">{vendor.company}</p>
                    <StarRating rating={vendor.rating} />
                    {vendor.last_job && (
                      <p className="text-xs text-on-surface-variant mt-1 truncate">
                        Last job: {vendor.last_job}
                      </p>
                    )}
                  </div>
                  <div className="hidden md:flex flex-col items-end gap-2 flex-shrink-0">
                    <p className="text-xs text-on-surface-variant">{vendor.phone}</p>
                    <p className="text-xs text-on-surface-variant">{vendor.email}</p>
                    <div className="flex gap-2 mt-1">
                      <button className="px-4 py-2 rounded-xl bg-primary-container/20 text-primary text-xs font-bold hover:bg-primary-container/40 transition-colors">
                        Contact
                      </button>
                      <button className="px-4 py-2 rounded-xl bg-surface-container text-on-surface-variant text-xs font-bold hover:bg-surface-container-high transition-colors">
                        Job History
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
            {filteredVendors.length === 0 && (
              <div className="text-center py-16 text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-2 block">search_off</span>
                <p className="font-semibold">No vendors match "{search}"</p>
              </div>
            )}
          </div>
        )}

      </div>
    </AppLayout>
  )
}

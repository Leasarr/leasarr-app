'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import Modal from '@/components/ui/Modal'
import { formatCurrency, formatDate, getDaysUntil, cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'

type TenantOption = { id: string; first_name: string; last_name: string }
type PropertyOption = { id: string; name: string }
type UnitOption = { id: string; unit_number: string; property_id: string; rent_amount: number; status: string }

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

  const [showCreate, setShowCreate] = useState(false)
  const [tenantOptions, setTenantOptions] = useState<TenantOption[]>([])
  const [propertyOptions, setPropertyOptions] = useState<PropertyOption[]>([])
  const [unitOptions, setUnitOptions] = useState<UnitOption[]>([])
  const [form, setForm] = useState({ tenant_id: '', property_id: '', unit_id: '', start_date: '', end_date: '', rent_amount: '', security_deposit: '' })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

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

  async function openCreate() {
    setShowCreate(true)
    setFormError('')
    const [tenantsRes, propsRes, unitsRes] = await Promise.all([
      supabase.from('tenants').select('id, first_name, last_name').eq('manager_id', profile!.id).eq('status', 'active').order('first_name'),
      supabase.from('properties').select('id, name').eq('manager_id', profile!.id).order('name'),
      supabase.from('units').select('id, unit_number, property_id, rent_amount, status').order('unit_number'),
    ])
    setTenantOptions((tenantsRes.data ?? []) as TenantOption[])
    setPropertyOptions((propsRes.data ?? []) as PropertyOption[])
    setUnitOptions((unitsRes.data ?? []) as UnitOption[])
  }

  function closeCreate() {
    setShowCreate(false)
    setFormError('')
    setSubmitting(false)
    setForm({ tenant_id: '', property_id: '', unit_id: '', start_date: '', end_date: '', rent_amount: '', security_deposit: '' })
  }

  async function handleCreateLease(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setFormError('')

    const { error: leaseError } = await supabase.from('leases').insert({
      tenant_id: form.tenant_id,
      unit_id: form.unit_id,
      property_id: form.property_id,
      start_date: form.start_date,
      end_date: form.end_date,
      rent_amount: parseFloat(form.rent_amount),
      security_deposit: parseFloat(form.security_deposit),
      status: 'active',
    })

    if (leaseError) { setFormError(leaseError.message); setSubmitting(false); return }

    await supabase.from('units').update({ status: 'occupied' }).eq('id', form.unit_id)

    // Refetch leases to get joined tenant/property names
    const { data } = await supabase
      .from('leases')
      .select('id, rent_amount, security_deposit, start_date, end_date, status, renewal_status, tenant:tenants(first_name, last_name), property:properties(name)')
      .in('status', ['active', 'expired'])
      .order('end_date', { ascending: true })
    setLeases((data as unknown as LeaseRow[]) ?? [])
    closeCreate()
  }

  const filteredUnits = unitOptions.filter(u => !form.property_id || u.property_id === form.property_id)

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
            <h1 className="text-2xl md:text-3xl font-headline font-extrabold text-on-surface tracking-tight mb-2">Lease Management</h1>
            <p className="text-sm text-on-surface-variant font-medium">Review expiring contracts and renewal insights.</p>
          </div>
          <button onClick={openCreate} className="btn-primary h-12 px-6 w-fit">
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
              <h2 className="text-base md:text-lg font-bold text-on-surface">Active Leases</h2>
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
              { icon: 'add_box', label: 'New Lease', action: openCreate },
              { icon: 'history', label: 'History', action: undefined },
              { icon: 'mail', label: 'Notify All', action: undefined },
              { icon: 'analytics', label: 'Reports', action: undefined },
            ].map(a => (
              <button key={a.label} onClick={a.action} className="flex flex-col items-center gap-1 p-2 group">
                <div className="w-12 h-12 bg-surface-container-high rounded-2xl flex items-center justify-center group-hover:bg-primary-fixed group-active:scale-90 transition-all">
                  <span className="material-symbols-outlined text-primary">{a.icon}</span>
                </div>
                <span className="text-[10px] font-bold text-outline uppercase tracking-wider">{a.label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>

      <Modal open={showCreate} onClose={closeCreate} title="Create Lease" size="md">
        <form onSubmit={handleCreateLease} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">Tenant</label>
            <select required className="input-base" value={form.tenant_id} onChange={e => setForm(f => ({ ...f, tenant_id: e.target.value }))}>
              <option value="">— Select tenant —</option>
              {tenantOptions.map(t => <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>)}
            </select>
            {tenantOptions.length === 0 && <p className="text-xs text-on-surface-variant mt-1">No active tenants. Add a tenant first.</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">Property</label>
            <select required className="input-base" value={form.property_id} onChange={e => setForm(f => ({ ...f, property_id: e.target.value, unit_id: '', rent_amount: '' }))}>
              <option value="">— Select property —</option>
              {propertyOptions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">Unit</label>
            <select
              required
              className="input-base"
              value={form.unit_id}
              disabled={!form.property_id}
              onChange={e => {
                const unit = unitOptions.find(u => u.id === e.target.value)
                setForm(f => ({ ...f, unit_id: e.target.value, rent_amount: unit ? String(unit.rent_amount) : f.rent_amount }))
              }}
            >
              <option value="">— Select unit —</option>
              {filteredUnits.map(u => (
                <option key={u.id} value={u.id}>Unit {u.unit_number} {u.status !== 'vacant' ? `(${u.status})` : ''}</option>
              ))}
            </select>
            {form.property_id && filteredUnits.length === 0 && <p className="text-xs text-on-surface-variant mt-1">No units in this property.</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Start Date</label>
              <input required type="date" className="input-base" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">End Date</label>
              <input required type="date" className="input-base" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Monthly Rent ($)</label>
              <input required type="number" min="0" step="0.01" className="input-base" placeholder="2500" value={form.rent_amount} onChange={e => setForm(f => ({ ...f, rent_amount: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Security Deposit ($)</label>
              <input required type="number" min="0" step="0.01" className="input-base" placeholder="5000" value={form.security_deposit} onChange={e => setForm(f => ({ ...f, security_deposit: e.target.value }))} />
            </div>
          </div>

          {formError && <p className="text-sm text-error">{formError}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={closeCreate} className="btn-secondary flex-1 h-11">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 h-11">{submitting ? 'Creating...' : 'Create Lease'}</button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  )
}

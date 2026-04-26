'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import Modal from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/patterns/EmptyState'
import { LoadingState } from '@/components/patterns/LoadingState'
import { FormField } from '@/components/patterns/FormField'
import { PageHeader } from '@/components/layout/PageHeader'
import { formatCurrency, formatDate, getDaysUntil, cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createLeaseSchema, editLeaseSchema, type CreateLeaseForm, type EditLeaseForm } from '@/lib/schemas/lease'

type TenantOption = { id: string; first_name: string; last_name: string; unit_id: string | null; property_id: string | null }
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
  const [createServerError, setCreateServerError] = useState('')

  const createLeaseForm = useForm<CreateLeaseForm>({
    resolver: zodResolver(createLeaseSchema),
    defaultValues: { tenant_id: '', property_id: '', unit_id: '', start_date: '', end_date: '', rent_amount: '', security_deposit: '' },
  })
  const tenantId = createLeaseForm.watch('tenant_id')
  const propertyId = createLeaseForm.watch('property_id')

  const [editingLease, setEditingLease] = useState<LeaseRow | null>(null)
  const [editServerError, setEditServerError] = useState('')

  const editLeaseForm = useForm<EditLeaseForm>({
    resolver: zodResolver(editLeaseSchema),
  })

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
    setCreateServerError('')
    createLeaseForm.reset()
    const [tenantsRes, propsRes, unitsRes, activeLeasesRes] = await Promise.all([
      supabase.from('tenants').select('id, first_name, last_name, unit_id, property_id').eq('manager_id', profile!.id).eq('status', 'active').order('first_name'),
      supabase.from('properties').select('id, name').eq('manager_id', profile!.id).order('name'),
      supabase.from('units').select('id, unit_number, property_id, rent_amount, status').eq('status', 'vacant').order('unit_number'),
      supabase.from('leases').select('tenant_id').eq('status', 'active'),
    ])
    const leasedTenantIds = new Set((activeLeasesRes.data ?? []).map((l: { tenant_id: string }) => l.tenant_id))
    setTenantOptions(((tenantsRes.data ?? []) as TenantOption[]).filter(t => !leasedTenantIds.has(t.id)))
    setPropertyOptions((propsRes.data ?? []) as PropertyOption[])
    setUnitOptions((unitsRes.data ?? []) as UnitOption[])
  }

  function closeCreate() {
    setShowCreate(false)
    setCreateServerError('')
    createLeaseForm.reset()
  }

  function openEdit(lease: LeaseRow) {
    setEditingLease(lease)
    editLeaseForm.reset({
      end_date: lease.end_date,
      rent_amount: String(lease.rent_amount),
      security_deposit: String(lease.security_deposit),
      status: lease.status,
      renewal_status: lease.renewal_status ?? '',
    })
    setEditServerError('')
  }

  function closeEdit() {
    setEditingLease(null)
    setEditServerError('')
    editLeaseForm.reset()
  }

  async function onEditLease(data: EditLeaseForm) {
    if (!editingLease) return
    setEditServerError('')

    const { error } = await supabase.from('leases').update({
      end_date: data.end_date,
      rent_amount: parseFloat(data.rent_amount),
      security_deposit: parseFloat(data.security_deposit),
      status: data.status,
      renewal_status: data.renewal_status || null,
    }).eq('id', editingLease.id)

    if (error) { setEditServerError(error.message); return }

    const { data: rows } = await supabase
      .from('leases')
      .select('id, rent_amount, security_deposit, start_date, end_date, status, renewal_status, tenant:tenants(first_name, last_name), property:properties(name)')
      .in('status', ['active', 'expired'])
      .order('end_date', { ascending: true })
    setLeases((rows as unknown as LeaseRow[]) ?? [])
    closeEdit()
  }

  async function onCreateLease(data: CreateLeaseForm) {
    setCreateServerError('')

    const { error: leaseError } = await supabase.from('leases').insert({
      tenant_id: data.tenant_id,
      unit_id: data.unit_id,
      property_id: data.property_id,
      start_date: data.start_date,
      end_date: data.end_date,
      rent_amount: parseFloat(data.rent_amount),
      security_deposit: parseFloat(data.security_deposit),
      status: 'active',
    })

    if (leaseError) { setCreateServerError(leaseError.message); return }

    await supabase.from('units').update({ status: 'occupied' }).eq('id', data.unit_id)

    const { data: rows } = await supabase
      .from('leases')
      .select('id, rent_amount, security_deposit, start_date, end_date, status, renewal_status, tenant:tenants(first_name, last_name), property:properties(name)')
      .in('status', ['active', 'expired'])
      .order('end_date', { ascending: true })
    setLeases((rows as unknown as LeaseRow[]) ?? [])
    closeCreate()
  }

  const selectedTenant = tenantOptions.find(t => t.id === tenantId) ?? null

  const filteredProperties = selectedTenant?.property_id
    ? propertyOptions.filter(p => p.id === selectedTenant.property_id)
    : propertyOptions

  const filteredUnits = unitOptions.filter(u => !propertyId || u.property_id === propertyId)

  const filteredTenants = (!tenantId && propertyId)
    ? tenantOptions.filter(t => t.property_id === propertyId)
    : tenantOptions

  function handleTenantChange(tid: string) {
    const tenant = tenantOptions.find(t => t.id === tid) ?? null
    const unit = tenant?.unit_id ? unitOptions.find(u => u.id === tenant.unit_id) ?? null : null
    createLeaseForm.setValue('tenant_id', tid)
    createLeaseForm.setValue('property_id', tenant?.property_id ?? '')
    createLeaseForm.setValue('unit_id', tenant?.unit_id ?? '')
    if (unit) createLeaseForm.setValue('rent_amount', String(unit.rent_amount))
  }

  function handlePropertyChange(pid: string) {
    const tenantStillValid = tenantOptions.find(t => t.id === tenantId)?.property_id === pid
    createLeaseForm.setValue('property_id', pid)
    createLeaseForm.setValue('unit_id', '')
    createLeaseForm.setValue('rent_amount', '')
    if (!tenantStillValid) createLeaseForm.setValue('tenant_id', '')
  }

  function handleUnitChange(uid: string) {
    const unit = unitOptions.find(u => u.id === uid) ?? null
    const linkedTenant = uid ? (tenantOptions.find(t => t.unit_id === uid) ?? null) : null
    createLeaseForm.setValue('unit_id', uid)
    if (unit) createLeaseForm.setValue('property_id', unit.property_id)
    if (linkedTenant) createLeaseForm.setValue('tenant_id', linkedTenant.id)
    if (unit) createLeaseForm.setValue('rent_amount', String(unit.rent_amount))
  }

  if (authLoading || loading) {
    return (
      <AppLayout>
        <LoadingState label="Loading leases..." />
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">

        <PageHeader
          title="Lease Management"
          subtitle="Review expiring contracts and renewal insights."
          action={
            <Button onClick={openCreate} className="px-6 w-fit">
              <span className="material-symbols-outlined">add</span> New Lease
            </Button>
          }
        />

        {leases.length === 0 ? (
          <EmptyState
            icon="description"
            title="No leases yet"
            description="Active and expired leases will appear here."
          />
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
                    'bg-surface-container-lowest rounded-xl p-5 flex items-center justify-between group hover:bg-surface-container-low transition-all',
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
                  <div className="flex items-center gap-3">
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
                    <button
                      onClick={() => openEdit(lease)}
                      className="ml-2 w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors"
                      title="Edit lease"
                    >
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
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

      <Modal open={!!editingLease} onClose={closeEdit} title="Edit Lease" size="md">
        {editingLease && (
          <form onSubmit={editLeaseForm.handleSubmit(onEditLease)} className="space-y-4">
            <div className="bg-surface-container-low rounded-xl p-3 mb-2">
              <p className="text-sm font-semibold text-on-surface">
                {editingLease.property?.name ?? '—'} — {editingLease.tenant ? `${editingLease.tenant.first_name} ${editingLease.tenant.last_name}` : 'Unknown Tenant'}
              </p>
              <p className="text-xs text-on-surface-variant mt-0.5">Started {formatDate(editingLease.start_date)}</p>
            </div>

            <FormField label="End Date">
              <input {...editLeaseForm.register('end_date')} type="date" className="input-base" />
              {editLeaseForm.formState.errors.end_date && <p className="text-error text-xs mt-1">{editLeaseForm.formState.errors.end_date.message}</p>}
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Monthly Rent ($)">
                <input {...editLeaseForm.register('rent_amount')} type="number" min="0" step="0.01" className="input-base" />
                {editLeaseForm.formState.errors.rent_amount && <p className="text-error text-xs mt-1">{editLeaseForm.formState.errors.rent_amount.message}</p>}
              </FormField>
              <FormField label="Security Deposit ($)">
                <input {...editLeaseForm.register('security_deposit')} type="number" min="0" step="0.01" className="input-base" />
                {editLeaseForm.formState.errors.security_deposit && <p className="text-error text-xs mt-1">{editLeaseForm.formState.errors.security_deposit.message}</p>}
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Status">
                <select {...editLeaseForm.register('status')} className="input-base">
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="expired">Expired</option>
                  <option value="terminated">Terminated</option>
                </select>
              </FormField>
              <FormField label="Renewal Status">
                <select {...editLeaseForm.register('renewal_status')} className="input-base">
                  <option value="">— None —</option>
                  <option value="offered">Offered</option>
                  <option value="accepted">Accepted</option>
                  <option value="declined">Declined</option>
                </select>
              </FormField>
            </div>

            {editServerError && <p className="text-sm text-error">{editServerError}</p>}
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" type="button" onClick={closeEdit} className="flex-1">Cancel</Button>
              <Button type="submit" disabled={editLeaseForm.formState.isSubmitting} className="flex-1">{editLeaseForm.formState.isSubmitting ? 'Saving...' : 'Save Changes'}</Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal open={showCreate} onClose={closeCreate} title="Create Lease" size="md">
        <form onSubmit={createLeaseForm.handleSubmit(onCreateLease)} className="space-y-4">
          <FormField label="Tenant" hint={tenantOptions.length === 0 ? 'No active tenants. Add a tenant first.' : undefined}>
            <select
              className="input-base"
              value={tenantId}
              onChange={e => handleTenantChange(e.target.value)}
            >
              <option value="">— Select tenant —</option>
              {filteredTenants.map(t => <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>)}
            </select>
            {createLeaseForm.formState.errors.tenant_id && <p className="text-error text-xs mt-1">{createLeaseForm.formState.errors.tenant_id.message}</p>}
          </FormField>

          <FormField label="Property">
            <select
              className="input-base"
              value={propertyId}
              onChange={e => handlePropertyChange(e.target.value)}
            >
              <option value="">— Select property —</option>
              {filteredProperties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            {createLeaseForm.formState.errors.property_id && <p className="text-error text-xs mt-1">{createLeaseForm.formState.errors.property_id.message}</p>}
          </FormField>

          <FormField label="Unit" hint={propertyId && filteredUnits.length === 0 ? 'No units in this property.' : undefined}>
            <select
              className="input-base"
              value={createLeaseForm.watch('unit_id')}
              disabled={!propertyId}
              onChange={e => handleUnitChange(e.target.value)}
            >
              <option value="">— Select unit —</option>
              {filteredUnits.map(u => (
                <option key={u.id} value={u.id}>Unit {u.unit_number} {u.status !== 'vacant' ? `(${u.status})` : ''}</option>
              ))}
            </select>
            {createLeaseForm.formState.errors.unit_id && <p className="text-error text-xs mt-1">{createLeaseForm.formState.errors.unit_id.message}</p>}
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Start Date">
              <input {...createLeaseForm.register('start_date')} type="date" className="input-base" />
              {createLeaseForm.formState.errors.start_date && <p className="text-error text-xs mt-1">{createLeaseForm.formState.errors.start_date.message}</p>}
            </FormField>
            <FormField label="End Date">
              <input {...createLeaseForm.register('end_date')} type="date" className="input-base" />
              {createLeaseForm.formState.errors.end_date && <p className="text-error text-xs mt-1">{createLeaseForm.formState.errors.end_date.message}</p>}
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Monthly Rent ($)">
              <input {...createLeaseForm.register('rent_amount')} type="number" min="0" step="0.01" className="input-base" placeholder="2500" />
              {createLeaseForm.formState.errors.rent_amount && <p className="text-error text-xs mt-1">{createLeaseForm.formState.errors.rent_amount.message}</p>}
            </FormField>
            <FormField label="Security Deposit ($)">
              <input {...createLeaseForm.register('security_deposit')} type="number" min="0" step="0.01" className="input-base" placeholder="5000" />
              {createLeaseForm.formState.errors.security_deposit && <p className="text-error text-xs mt-1">{createLeaseForm.formState.errors.security_deposit.message}</p>}
            </FormField>
          </div>

          {createServerError && <p className="text-sm text-error">{createServerError}</p>}
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={closeCreate} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={createLeaseForm.formState.isSubmitting} className="flex-1">{createLeaseForm.formState.isSubmitting ? 'Creating...' : 'Create Lease'}</Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  )
}

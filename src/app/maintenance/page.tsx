'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import Modal from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { EmptyState } from '@/components/patterns/EmptyState'
import { LoadingState } from '@/components/patterns/LoadingState'
import { FormField } from '@/components/patterns/FormField'
import { formatDate, formatCurrency, getPriorityColor, getStatusColor, cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'

type VendorRow = {
  id: string
  name: string
  company: string
  specialty: string
  rating: number
}

type MaintenanceRow = {
  id: string
  title: string
  description: string
  category: 'plumbing' | 'electrical' | 'hvac' | 'appliance' | 'structural' | 'other'
  priority: 'low' | 'medium' | 'high' | 'emergency'
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  assigned_to: string | null
  estimated_cost: number | null
  actual_cost: number | null
  created_at: string
  tenant: { first_name: string; last_name: string } | null
  unit: { unit_number: string } | null
}


export default function MaintenancePage() {
  const { profile, loading: authLoading } = useAuth()
  const supabase = createClient()

  const [requests, setRequests] = useState<MaintenanceRow[]>([])
  const [selected, setSelected] = useState<MaintenanceRow | null>(null)
  const [view, setView] = useState<'active' | 'history'>('active')
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [tenants, setTenants] = useState<{ id: string; first_name: string; last_name: string; unit_id: string | null; property_id: string | null }[]>([])
  const [form, setForm] = useState({ tenant_id: '', title: '', category: '', priority: 'medium', description: '' })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [vendors, setVendors] = useState<VendorRow[]>([])
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!profile) return
    setLoading(true)
    async function fetchRequests() {
      const { data } = await supabase
        .from('maintenance_requests')
        .select(`
          id, title, description, category, priority, status,
          assigned_to, estimated_cost, actual_cost, created_at,
          tenant:tenants(first_name, last_name),
          unit:units(unit_number)
        `)
        .order('created_at', { ascending: false })
      const rows = (data as unknown as MaintenanceRow[]) ?? []
      setRequests(rows)
      if (rows.length > 0) setSelected(rows[0])
      setLoading(false)
    }

    async function fetchTenants() {
      const { data } = await supabase
        .from('tenants')
        .select('id, first_name, last_name, unit_id, unit:units(property_id)')
        .eq('manager_id', profile!.id)
        .eq('status', 'active')
      setTenants(((data ?? []) as unknown as { id: string; first_name: string; last_name: string; unit_id: string | null; unit: { property_id: string } | null }[]).map(t => ({
        id: t.id,
        first_name: t.first_name,
        last_name: t.last_name,
        unit_id: t.unit_id,
        property_id: t.unit?.property_id ?? null,
      })))
    }

    async function fetchVendors() {
      const { data } = await supabase
        .from('vendors')
        .select('id, name, company, specialty, rating')
        .eq('manager_id', profile!.id)
        .eq('status', 'active')
        .order('name')
      setVendors((data as VendorRow[]) ?? [])
    }

    fetchRequests()
    fetchTenants()
    fetchVendors()

    const channel = supabase
      .channel('manager-maintenance-updates')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'maintenance_requests' },
        async () => {
          // Refetch on new request so we get the joined tenant/unit data
          const { data } = await supabase
            .from('maintenance_requests')
            .select(`id, title, description, category, priority, status, assigned_to, estimated_cost, actual_cost, created_at, tenant:tenants(first_name, last_name), unit:units(unit_number)`)
            .order('created_at', { ascending: false })
          setRequests((data as unknown as MaintenanceRow[]) ?? [])
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'maintenance_requests' },
        (payload: { new: MaintenanceRow }) => {
          const updated = payload.new
          setRequests(rs => rs.map(r => r.id === updated.id ? { ...r, ...updated } : r))
          setSelected(prev => prev?.id === updated.id ? { ...prev, ...updated } : prev)
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'maintenance_requests' },
        (payload: { old: { id: string } }) => {
          setRequests(rs => rs.filter(r => r.id !== payload.old.id))
          setSelected(prev => prev?.id === payload.old.id ? null : prev)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [profile])

  async function handleSubmit() {
    if (!form.tenant_id || !form.title || !form.category) { setFormError('Tenant, title, and category are required.'); return }
    const tenant = tenants.find(t => t.id === form.tenant_id)
    if (!tenant?.unit_id || !tenant?.property_id) { setFormError('This tenant has no unit assigned. Assign a unit first.'); return }
    setSubmitting(true)
    setFormError('')
    const { error } = await supabase.from('maintenance_requests').insert({
      tenant_id: form.tenant_id,
      unit_id: tenant.unit_id,
      property_id: tenant.property_id,
      title: form.title,
      category: form.category,
      priority: form.priority,
      description: form.description,
      status: 'open',
    })
    if (error) { setFormError(error.message); setSubmitting(false); return }
    const { data } = await supabase
      .from('maintenance_requests')
      .select('id, title, description, category, priority, status, assigned_to, estimated_cost, actual_cost, created_at, tenant:tenants(first_name, last_name), unit:units(unit_number)')
      .order('created_at', { ascending: false })
    const rows = (data as unknown as MaintenanceRow[]) ?? []
    setRequests(rows)
    if (rows.length > 0) setSelected(rows[0])
    setShowModal(false)
    setForm({ tenant_id: '', title: '', category: '', priority: 'medium', description: '' })
    setSubmitting(false)
  }

  async function handleAssign(vendor: VendorRow) {
    if (!selected) return
    setAssigning(true)
    const label = `${vendor.name} (${vendor.company})`
    await supabase.from('maintenance_requests').update({ assigned_to: label, status: 'in_progress' }).eq('id', selected.id)
    const updated = { ...selected, assigned_to: label, status: 'in_progress' as const }
    setRequests(rs => rs.map(r => r.id === selected.id ? updated : r))
    setSelected(updated)
    setShowAssignModal(false)
    setAssigning(false)
  }

  async function handleDelete() {
    if (!selected) return
    setDeleting(true)
    await supabase.from('maintenance_requests').delete().eq('id', selected.id)
    const remaining = requests.filter(r => r.id !== selected.id)
    setRequests(remaining)
    setSelected(remaining.length > 0 ? remaining[0] : null)
    setConfirmDelete(false)
    setDeleting(false)
  }

  async function handleMarkCompleted() {
    if (!selected) return
    await supabase.from('maintenance_requests').update({ status: 'completed' }).eq('id', selected.id)
    const updated = { ...selected, status: 'completed' as const }
    setRequests(rs => rs.map(r => r.id === selected.id ? updated : r))
    setSelected(updated)
  }

  const displayed = view === 'active'
    ? requests.filter(r => r.status !== 'completed' && r.status !== 'cancelled')
    : requests.filter(r => r.status === 'completed' || r.status === 'cancelled')

  if (authLoading || loading) {
    return (
      <AppLayout>
        <LoadingState label="Loading maintenance requests..." />
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">

        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-1">Operations</p>
            <h1 className="text-2xl md:text-3xl font-headline font-extrabold text-on-surface tracking-tight">Maintenance</h1>
          </div>
          <SegmentedControl
            options={[
              { key: 'active', label: 'Active' },
              { key: 'history', label: 'History' },
            ]}
            value={view}
            onChange={v => setView(v as 'active' | 'history')}
          />
        </div>

        {requests.length === 0 ? (
          <EmptyState
            icon="build"
            title="No maintenance requests yet"
            description="Requests submitted by tenants will appear here."
            size="panel"
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left: List */}
            <section className="lg:col-span-5 flex flex-col gap-4">
              <h3 className="text-xs font-bold text-outline uppercase tracking-widest px-1">
                {view === 'active' ? 'Open' : 'Completed'} Requests ({displayed.length})
              </h3>

              {displayed.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant text-center">
                  <span className="material-symbols-outlined text-4xl mb-2">check_circle</span>
                  <p className="font-semibold">No {view === 'active' ? 'active' : 'completed'} requests</p>
                </div>
              ) : (
                displayed.map(req => (
                  <button
                    key={req.id}
                    onClick={() => { setSelected(req); setConfirmDelete(false) }}
                    className={cn(
                      'w-full group bg-surface-container-lowest p-5 rounded-xl hover:bg-surface-container-low transition-all cursor-pointer relative overflow-hidden text-left',
                      selected?.id === req.id && 'ring-2 ring-primary/20',
                      req.priority === 'emergency' && 'border-l-4 border-l-error'
                    )}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className={cn('badge', getPriorityColor(req.priority))}>
                        {req.status === 'open' ? `New${req.priority === 'emergency' ? ' • Urgent' : ''}` : req.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-on-surface-variant font-medium">{formatDate(req.created_at, 'MMM d')}</span>
                    </div>
                    <h4 className="text-sm font-bold text-on-surface mb-1 leading-tight group-hover:text-primary transition-colors line-clamp-1">
                      {req.title}
                    </h4>
                    <p className="text-sm text-on-surface-variant mb-4 line-clamp-2">{req.description}</p>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center text-[10px] font-bold text-on-surface">
                        {req.tenant?.first_name[0] ?? '?'}
                      </div>
                      <span className="text-xs font-semibold text-on-surface">
                        {req.tenant ? `${req.tenant.first_name} ${req.tenant.last_name}` : 'Unknown'}
                        {req.unit ? ` • Unit ${req.unit.unit_number}` : ''}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </section>

            {/* Right: Detail */}
            {selected && (
              <section className="lg:col-span-7 bg-surface-container-lowest rounded-2xl overflow-hidden min-h-[600px] flex flex-col shadow-card">
                <div className="p-8 bg-surface-container-low">
                  <div className="flex flex-wrap gap-3 mb-5">
                    <span className={cn('badge', getPriorityColor(selected.priority))}>{selected.priority.toUpperCase()}</span>
                    <span className="badge bg-primary-fixed text-on-primary-fixed">{selected.category.toUpperCase()}</span>
                    <span className={cn('badge', getStatusColor(selected.status))}>{selected.status.replace('_', ' ')}</span>
                  </div>
                  <h3 className="text-3xl font-headline font-extrabold leading-tight mb-3">{selected.title}</h3>
                  <div className="flex items-center gap-6 text-on-surface-variant text-sm flex-wrap">
                    {selected.unit && (
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        <span className="font-semibold text-on-surface">Unit {selected.unit.unit_number}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      <span>Reported {formatDate(selected.created_at, "MMM d 'at' h:mm a")}</span>
                    </div>
                  </div>
                </div>

                <div className="p-8 flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h5 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">Tenant Description</h5>
                      <p className="text-base text-on-surface leading-relaxed mb-6">{selected.description}</p>

                      <h5 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">Tracking History</h5>
                      <div className="space-y-5">
                        <div className="flex gap-4">
                          <div className="relative">
                            <div className="w-3 h-3 rounded-full bg-primary ring-4 ring-primary/20" />
                            <div className="absolute top-3 left-1.5 w-0.5 h-full bg-surface-container-highest" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">Request Created</p>
                            <p className="text-xs text-on-surface-variant">
                              {formatDate(selected.created_at, "MMM d 'at' h:mm a")}
                              {selected.tenant ? ` by ${selected.tenant.first_name} ${selected.tenant.last_name}` : ''}
                            </p>
                          </div>
                        </div>
                        {selected.assigned_to && (
                          <div className="flex gap-4">
                            <div className="w-3 h-3 rounded-full bg-primary-container" />
                            <div>
                              <p className="text-sm font-bold">Assigned to {selected.assigned_to}</p>
                              <p className="text-xs text-on-surface-variant">In Progress</p>
                            </div>
                          </div>
                        )}
                        <div className={cn('flex gap-4', selected.status !== 'completed' && 'opacity-50')}>
                          <div className={cn('w-3 h-3 rounded-full', selected.status === 'completed' ? 'bg-primary' : 'bg-outline-variant')} />
                          <div>
                            <p className="text-sm font-bold text-on-surface-variant">Completion & Invoice</p>
                            <p className="text-xs text-on-surface-variant italic">
                              {selected.status === 'completed' ? 'Completed' : 'Pending'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-5">
                      {selected.estimated_cost && (
                        <div>
                          <h5 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">Cost Estimate</h5>
                          <p className="text-2xl font-bold text-on-surface">{formatCurrency(selected.estimated_cost)}</p>
                          {selected.actual_cost && (
                            <p className="text-sm text-on-surface-variant mt-1">Actual: {formatCurrency(selected.actual_cost)}</p>
                          )}
                        </div>
                      )}

                      <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/15">
                        <h5 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">Action Center</h5>
                        <div className="space-y-3">
                          <button onClick={() => setShowAssignModal(true)} disabled={selected.status === 'completed'} className="w-full h-12 primary-gradient text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-primary active:scale-95 transition-all disabled:opacity-50">
                            <span className="material-symbols-outlined text-sm">person_add</span>
                            {selected.assigned_to ? 'Reassign Vendor' : 'Assign Vendor'}
                          </button>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setConfirmDelete(true)}
                            className="w-full text-error border border-error/20 hover:bg-error-container/20"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                            Delete Request
                          </Button>
                          <button
                            onClick={handleMarkCompleted}
                            disabled={selected.status === 'completed'}
                            className="w-full h-12 bg-success-container/30 text-on-success-container border border-success-container rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-success-container/50 transition-colors disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            {selected.status === 'completed' ? 'Completed' : 'Mark Completed'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {/* Assign Vendor Modal */}
      <Modal open={showAssignModal} onClose={() => setShowAssignModal(false)} title="Assign Vendor" size="md">
        {vendors.length === 0 ? (
          <EmptyState icon="handyman" title="No vendors yet" description="Add vendors in the People page first." size="inline" />
        ) : (
          <div className="space-y-2">
            {vendors.map(v => (
              <button
                key={v.id}
                onClick={() => handleAssign(v)}
                disabled={assigning}
                className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-surface-container-low transition-colors text-left disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-bold text-sm flex-shrink-0">
                  {v.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-on-surface text-sm">{v.name}</p>
                  <p className="text-xs text-on-surface-variant truncate">{v.company}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="badge bg-surface-container text-on-surface-variant capitalize text-[10px]">{v.specialty}</span>
                  {v.rating > 0 && (
                    <span className="flex items-center gap-0.5 text-xs font-semibold text-on-surface-variant">
                      <span className="material-symbols-outlined text-sm text-yellow-500 material-symbols-filled">star</span>
                      {v.rating}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </Modal>

      {/* FAB */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-24 lg:bottom-8 right-6 lg:right-8 w-16 h-16 primary-gradient text-white rounded-2xl shadow-fab flex items-center justify-center group active:scale-95 transition-all z-40"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete Request"
        body="This will permanently remove the maintenance request. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        loading={deleting}
        destructive
      />

      {/* Create Modal */}
      <Modal open={showModal} onClose={() => { setShowModal(false); setFormError('') }} title="New Request" size="lg">
        <div className="space-y-5">
          <FormField label="Tenant">
            <select
              className="input-base"
              value={form.tenant_id}
              onChange={e => setForm(f => ({ ...f, tenant_id: e.target.value }))}
            >
              <option value="">Select tenant...</option>
              {tenants.map(t => (
                <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Title">
            <input
              className="input-base"
              placeholder="e.g. Leaking kitchen faucet"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
          </FormField>
          <FormField label="Category">
            <div className="flex flex-wrap gap-2">
              {['plumbing', 'electrical', 'hvac', 'structural', 'appliance', 'other'].map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, category: cat }))}
                  className={cn(
                    'px-4 py-2 rounded-full border text-sm font-semibold capitalize transition-colors',
                    form.category === cat
                      ? 'border-primary bg-primary-fixed text-on-primary-fixed'
                      : 'border-outline-variant/30 text-on-surface-variant hover:border-primary hover:bg-primary-fixed hover:text-on-primary-fixed'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </FormField>
          <FormField label="Priority">
            <div className="flex gap-2">
              {['low', 'medium', 'high', 'emergency'].map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, priority: p }))}
                  className={cn(
                    'flex-1 py-2 rounded-xl border text-xs font-bold capitalize transition-colors',
                    form.priority === p
                      ? 'border-primary bg-primary-fixed text-on-primary-fixed'
                      : 'border-outline-variant/30 text-on-surface-variant hover:border-primary'
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </FormField>
          <FormField label="Description">
            <textarea
              className="input-base resize-none"
              placeholder="Describe the issue in detail..."
              rows={4}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </FormField>
          {formError && <p className="text-sm text-error">{formError}</p>}
          <div className="pt-2 flex gap-4">
            <Button type="button" variant="secondary" onClick={() => { setShowModal(false); setFormError('') }} className="flex-1">Cancel</Button>
            <Button type="button" onClick={handleSubmit} disabled={submitting} className="flex-[2]">{submitting ? 'Submitting...' : 'Submit Request'}</Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  )
}

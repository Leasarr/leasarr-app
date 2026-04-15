'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { formatDate, formatCurrency, getPriorityColor, getStatusColor, cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'

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
  const [tenants, setTenants] = useState<{ id: string; first_name: string; last_name: string; unit_id: string | null }[]>([])
  const [form, setForm] = useState({ tenant_id: '', title: '', category: '', priority: 'medium', description: '' })

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
        .select('id, first_name, last_name, unit_id')
        .eq('manager_id', profile!.id)
        .eq('status', 'active')
      setTenants(data ?? [])
    }

    fetchRequests()
    fetchTenants()
  }, [profile])

  const displayed = view === 'active'
    ? requests.filter(r => r.status !== 'completed' && r.status !== 'cancelled')
    : requests.filter(r => r.status === 'completed' || r.status === 'cancelled')

  if (authLoading || loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <span className="material-symbols-outlined text-4xl text-primary animate-pulse">build</span>
            <p className="text-on-surface-variant mt-2">Loading maintenance requests...</p>
          </div>
        </div>
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
            <h2 className="text-4xl font-headline font-extrabold tracking-tight">Maintenance</h2>
          </div>
          <div className="flex gap-3 items-center">
            <div className="flex gap-2 bg-surface-container-low p-1.5 rounded-xl">
              <button
                onClick={() => setView('active')}
                className={cn('px-4 py-2 text-sm font-semibold rounded-lg transition-colors', view === 'active' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high')}
              >Active</button>
              <button
                onClick={() => setView('history')}
                className={cn('px-4 py-2 text-sm font-semibold rounded-lg transition-colors', view === 'history' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high')}
              >History</button>
            </div>
          </div>
        </div>

        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl mb-3">build</span>
            <p className="font-bold text-on-surface text-lg">No maintenance requests yet</p>
            <p className="text-sm mt-1">Requests submitted by tenants will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left: List */}
            <section className="lg:col-span-5 flex flex-col gap-4">
              <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-tight px-1">
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
                    onClick={() => setSelected(req)}
                    className={cn(
                      'w-full group bg-surface-container-lowest p-5 rounded-xl hover:bg-white transition-all cursor-pointer relative overflow-hidden text-left',
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
                    <h4 className="text-lg font-bold font-headline mb-1 leading-tight group-hover:text-primary transition-colors line-clamp-1">
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
              <section className="lg:col-span-7 bg-white rounded-2xl overflow-hidden min-h-[600px] flex flex-col shadow-card">
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
                          <button className="w-full h-12 primary-gradient text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-primary active:scale-95 transition-all">
                            <span className="material-symbols-outlined text-sm">person_add</span>
                            Assign Technician
                          </button>
                          <button className="w-full h-12 bg-white text-on-surface border border-outline-variant/30 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-surface transition-colors">
                            <span className="material-symbols-outlined text-sm">chat_bubble</span>
                            Message Tenant
                          </button>
                          <button className="w-full h-12 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            Mark Completed
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

      {/* FAB */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-24 lg:bottom-8 right-6 lg:right-8 w-16 h-16 primary-gradient text-white rounded-2xl shadow-fab flex items-center justify-center group active:scale-95 transition-all z-40"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-surface rounded-3xl w-full max-w-xl shadow-modal overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-8 border-b border-outline-variant/10 flex justify-between items-center">
              <h3 className="text-2xl font-headline font-extrabold">New Request</h3>
              <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-full hover:bg-surface-container-high flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-8 space-y-5">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Tenant</label>
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
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Title</label>
                <input
                  className="input-base"
                  placeholder="e.g. Leaking kitchen faucet"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Category</label>
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
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Priority</label>
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
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Description</label>
                <textarea
                  className="input-base resize-none"
                  placeholder="Describe the issue in detail..."
                  rows={4}
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="pt-2 flex gap-4">
                <button onClick={() => setShowModal(false)} className="flex-1 h-14 bg-surface-container-high rounded-xl font-bold transition-colors hover:bg-surface-container-highest">Cancel</button>
                <button className="flex-[2] h-14 primary-gradient text-on-primary rounded-xl font-bold shadow-primary">Submit Request</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}

'use client'

import { useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { MAINTENANCE_REQUESTS, TENANTS } from '@/data/mock'
import { formatDate, formatCurrency, getPriorityColor, getPriorityBorderColor, getStatusColor, cn } from '@/lib/utils'
import type { MaintenanceRequest } from '@/types'

const CATEGORY_ICONS: Record<string, string> = {
  plumbing: 'plumbing', electrical: 'electrical_services',
  hvac: 'ac_unit', appliance: 'kitchen', structural: 'foundation', other: 'build',
}

export default function MaintenancePage() {
  const [selected, setSelected] = useState<MaintenanceRequest>(MAINTENANCE_REQUESTS[0])
  const [view, setView] = useState<'active' | 'history'>('active')
  const [showModal, setShowModal] = useState(false)

  const displayed = view === 'active'
    ? MAINTENANCE_REQUESTS.filter(r => r.status !== 'completed')
    : MAINTENANCE_REQUESTS.filter(r => r.status === 'completed')

  const tenant = TENANTS.find(t => t.id === selected.tenant_id)

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">

        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-1">Operations</p>
            <h2 className="text-4xl font-headline font-extrabold tracking-tight">Maintenance</h2>
          </div>
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

        {/* Asymmetric Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left: List */}
          <section className="lg:col-span-5 flex flex-col gap-4">
            <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-tight px-1">
              Open Requests ({displayed.length})
            </h3>
            {displayed.map(req => (
              <button
                key={req.id}
                onClick={() => setSelected(req)}
                className={cn(
                  'w-full group bg-surface-container-lowest p-5 rounded-xl hover:bg-white transition-all cursor-pointer relative overflow-hidden text-left',
                  selected.id === req.id && 'ring-2 ring-primary/20',
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
                    {TENANTS.find(t => t.id === req.tenant_id)?.first_name[0] ?? '?'}
                  </div>
                  <span className="text-xs font-semibold text-on-surface">Unit • {req.unit_id.slice(-3).toUpperCase()}</span>
                </div>
              </button>
            ))}
          </section>

          {/* Right: Detail */}
          <section className="lg:col-span-7 bg-white rounded-2xl overflow-hidden min-h-[600px] flex flex-col shadow-card">
            {/* Detail Header */}
            <div className="p-8 bg-surface-container-low">
              <div className="flex flex-wrap gap-3 mb-5">
                <span className={cn('badge', getPriorityColor(selected.priority))}>{selected.priority.toUpperCase()}</span>
                <span className="badge bg-primary-fixed text-primary">{selected.category.toUpperCase()}</span>
                <span className={cn('badge', getStatusColor(selected.status))}>{selected.status.replace('_', ' ')}</span>
              </div>
              <h3 className="text-3xl font-headline font-extrabold leading-tight mb-3">{selected.title}</h3>
              <div className="flex items-center gap-6 text-on-surface-variant text-sm flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  <span className="font-semibold text-on-surface">Unit {selected.unit_id.slice(-3).toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  <span>Reported {formatDate(selected.created_at, "MMM d 'at' h:mm a")}</span>
                </div>
              </div>
            </div>

            {/* Detail Body */}
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
                        <p className="text-xs text-on-surface-variant">{formatDate(selected.created_at, "MMM d 'at' h:mm a")} by {tenant?.first_name} {tenant?.last_name}</p>
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
                    <div className="flex gap-4 opacity-50">
                      <div className="w-3 h-3 rounded-full bg-outline-variant" />
                      <div>
                        <p className="text-sm font-bold text-on-surface-variant">Completion & Invoice</p>
                        <p className="text-xs text-on-surface-variant italic">Pending</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  {selected.estimated_cost && (
                    <div>
                      <h5 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">Cost Estimate</h5>
                      <p className="text-2xl font-bold text-on-surface">{formatCurrency(selected.estimated_cost)}</p>
                    </div>
                  )}

                  {/* Action Center */}
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
        </div>
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
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Property & Unit</label>
                <select className="input-base">
                  <option>Select location...</option>
                  <option>Azure Heights - Unit 4A</option>
                  <option>Pacific View - Unit 12</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Issue Category</label>
                <div className="flex flex-wrap gap-2">
                  {['Plumbing', 'Electrical', 'HVAC', 'Structural', 'Appliance', 'Other'].map(cat => (
                    <button key={cat} className="px-4 py-2 rounded-full border border-outline-variant/30 text-sm font-semibold hover:border-primary hover:bg-primary-fixed hover:text-primary transition-colors">
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Description</label>
                <textarea className="input-base resize-none" placeholder="What needs attention?" rows={4} />
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

'use client'

import { useEffect, useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import Modal from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/patterns/EmptyState'
import { LoadingState } from '@/components/patterns/LoadingState'
import { PageHeader } from '@/components/layout/PageHeader'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { formatDate, getPriorityColor, getStatusColor, cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { tenantMaintenanceSchema, type TenantMaintenanceForm } from '@/lib/schemas/maintenance'

type MaintenanceRow = {
  id: string
  title: string
  description: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'emergency'
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  assigned_to: string | null
  created_at: string
}

type TenantInfo = { id: string; unit_id: string | null; property_id: string | null }

export default function TenantMaintenancePage() {
  const { profile, loading: authLoading } = useAuth()
  const supabase = createClient()

  const [tenant, setTenant] = useState<TenantInfo | null>(null)
  const [requests, setRequests] = useState<MaintenanceRow[]>([])
  const [loading, setLoading] = useState(false)

  const [showForm, setShowForm] = useState(false)
  const [formServerError, setFormServerError] = useState('')
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)

  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm<TenantMaintenanceForm>({
    resolver: zodResolver(tenantMaintenanceSchema),
    defaultValues: { title: '', category: '', priority: 'medium', description: '' },
  })

  const category = watch('category')
  const priority = watch('priority')

  useEffect(() => {
    if (!profile) return
    setLoading(true)
    let tenantId: string | null = null

    async function fetchData() {
      const { data: tenantData } = await supabase
        .from('tenants')
        .select('id, unit_id, property_id')
        .eq('profile_id', profile!.id)
        .maybeSingle()
      if (!tenantData) { setLoading(false); return }
      setTenant(tenantData as TenantInfo)
      tenantId = tenantData.id
      const { data } = await supabase
        .from('maintenance_requests')
        .select('id, title, description, category, priority, status, assigned_to, created_at')
        .eq('tenant_id', tenantData.id)
        .order('created_at', { ascending: false })
      setRequests((data as MaintenanceRow[]) ?? [])
      setLoading(false)
    }

    fetchData()

    const channel = supabase
      .channel('tenant-maintenance-updates')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'maintenance_requests', filter: `tenant_id=eq.${tenantId}` },
        (payload: { new: MaintenanceRow }) => {
          setRequests(prev => [payload.new, ...prev])
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'maintenance_requests' },
        (payload: { new: unknown }) => {
          const updated = payload.new as MaintenanceRow
          if (updated.id && tenantId) {
            setRequests(prev => prev.map(r => r.id === updated.id ? { ...r, ...updated } : r))
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [profile])

  async function handleCancel(id: string) {
    setCancelling(true)
    await supabase.from('maintenance_requests').update({ status: 'cancelled' }).eq('id', id)
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'cancelled' } : r))
    setConfirmCancelId(null)
    setCancelling(false)
  }

  async function onSubmit(data: TenantMaintenanceForm) {
    if (!tenant?.unit_id || !tenant?.property_id) { setFormServerError('No unit assigned to your account yet.'); return }
    setFormServerError('')
    const { data: row, error } = await supabase.from('maintenance_requests').insert({
      tenant_id: tenant.id,
      unit_id: tenant.unit_id,
      property_id: tenant.property_id,
      title: data.title,
      category: data.category,
      priority: data.priority,
      description: data.description,
      status: 'open',
    }).select('id, title, description, category, priority, status, assigned_to, created_at').single()
    if (error) { setFormServerError(error.message); return }
    setRequests(prev => [row as MaintenanceRow, ...prev])
    reset()
    setShowForm(false)
  }

  if (authLoading || loading) {
    return (
      <AppLayout>
        <LoadingState label="Loading..." />
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">

        <PageHeader
          title="Maintenance"
          subtitle="Your repair requests"
          action={
            <Button onClick={() => { reset(); setShowForm(true); setFormServerError('') }} size="sm">
              <span className="material-symbols-outlined text-base">add</span> New Request
            </Button>
          }
        />

        {requests.length === 0 ? (
          <EmptyState
            icon="build"
            title="No requests yet"
            description="Submit a request and your manager will be notified."
            size="page"
            action={<Button onClick={() => setShowForm(true)} size="sm">Submit Request</Button>}
          />
        ) : (
          <div className="space-y-3">
            {requests.map(req => (
              <div key={req.id} className="bg-surface-container-lowest rounded-2xl p-5 shadow-card">
                <div className="flex items-start justify-between mb-2">
                  <span className={cn('badge', getPriorityColor(req.priority))}>{req.priority}</span>
                  <span className="text-xs text-on-surface-variant">{formatDate(req.created_at, 'MMM d, yyyy')}</span>
                </div>
                <p className="font-bold text-on-surface mb-1">{req.title}</p>
                <p className="text-sm text-on-surface-variant mb-3 line-clamp-2">{req.description}</p>
                <div className="flex items-center justify-between">
                  <span className={cn('badge', getStatusColor(req.status))}>{req.status.replace('_', ' ')}</span>
                  <div className="flex items-center gap-2">
                    {req.assigned_to && <p className="text-xs text-on-surface-variant">Assigned to {req.assigned_to}</p>}
                    {req.status === 'open' && (
                      confirmCancelId === req.id ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-on-surface-variant">Cancel request?</span>
                          <button onClick={() => handleCancel(req.id)} disabled={cancelling} className="text-xs font-bold text-error hover:underline">{cancelling ? '...' : 'Yes'}</button>
                          <button onClick={() => setConfirmCancelId(null)} className="text-xs font-bold text-on-surface-variant hover:underline">No</button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmCancelId(req.id)} className="text-xs text-on-surface-variant hover:text-error transition-colors">
                          <span className="material-symbols-outlined text-base">cancel</span>
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={showForm} onClose={() => { reset(); setShowForm(false) }} title="New Maintenance Request" size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">Title</label>
            <input {...register('title')} className="input-base" placeholder="e.g. Leaking kitchen faucet" />
            {errors.title && <p className="text-error text-xs mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">Category</label>
            <div className="flex flex-wrap gap-2">
              {['plumbing', 'electrical', 'hvac', 'structural', 'appliance', 'other'].map(cat => (
                <button key={cat} type="button" onClick={() => setValue('category', cat)}
                  className={cn('px-4 py-2 rounded-full border text-sm font-semibold capitalize transition-colors',
                    category === cat ? 'border-primary bg-primary-fixed text-on-primary-fixed' : 'border-outline-variant/30 text-on-surface-variant hover:border-primary'
                  )}
                >{cat}</button>
              ))}
            </div>
            {errors.category && <p className="text-error text-xs mt-1">{errors.category.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">Priority</label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high', 'emergency'] as const).map(p => (
                <button key={p} type="button" onClick={() => setValue('priority', p)}
                  className={cn('flex-1 py-2 rounded-xl border text-xs font-bold capitalize transition-colors',
                    priority === p ? 'border-primary bg-primary-fixed text-on-primary-fixed' : 'border-outline-variant/30 text-on-surface-variant hover:border-primary'
                  )}
                >{p}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">Description</label>
            <textarea {...register('description')} className="input-base resize-none" rows={4} placeholder="Describe the issue in detail..." />
            {errors.description && <p className="text-error text-xs mt-1">{errors.description.message}</p>}
          </div>
          {formServerError && <p className="text-sm text-error">{formServerError}</p>}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => { reset(); setShowForm(false) }} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">{isSubmitting ? 'Submitting...' : 'Submit Request'}</Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  )
}

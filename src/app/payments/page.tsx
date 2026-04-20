'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import Modal from '@/components/ui/Modal'
import { formatCurrency, formatDate, getStatusColor, cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'

type PaymentRow = {
  id: string
  amount: number
  due_date: string
  paid_date: string | null
  status: 'paid' | 'pending' | 'overdue' | 'partial' | 'failed'
  method: string | null
  late_fee: number | null
  notes: string | null
  tenant: { first_name: string; last_name: string } | null
}

type LeaseOption = {
  id: string
  tenant_id: string
  unit_id: string
  property_id: string
  rent_amount: number
  tenant: { id: string; first_name: string; last_name: string } | null
}

const EMPTY_FORM = { tenant_id: '', amount: '', due_date: '', status: 'pending' as PaymentRow['status'], method: '', late_fee: '', notes: '' }

const methodIcon: Record<string, string> = {
  credit_card: 'credit_card',
  ach: 'account_balance',
  wire: 'send_to_mobile',
  check: 'receipt_long',
  cash: 'payments',
}

export default function PaymentsPage() {
  const { profile, loading: authLoading } = useAuth()
  const supabase = createClient()

  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all')
  const [markingPaid, setMarkingPaid] = useState<string | null>(null)

  const [showRecord, setShowRecord] = useState(false)
  const [leaseOptions, setLeaseOptions] = useState<LeaseOption[]>([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const [showEdit, setShowEdit] = useState(false)
  const [editingPayment, setEditingPayment] = useState<PaymentRow | null>(null)
  const [editForm, setEditForm] = useState(EMPTY_FORM)
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editError, setEditError] = useState('')

  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!profile) return
    setLoading(true)
    async function fetchPayments() {
      const { data } = await supabase
        .from('payments')
        .select('id, amount, due_date, paid_date, status, method, late_fee, notes, tenant:tenants(first_name, last_name)')
        .order('due_date', { ascending: false })
      setPayments((data as unknown as PaymentRow[]) ?? [])
      setLoading(false)
    }
    fetchPayments()
  }, [profile])

  async function openRecord() {
    setForm(EMPTY_FORM)
    setFormError('')
    const { data } = await supabase
      .from('leases')
      .select('id, tenant_id, unit_id, property_id, rent_amount, tenant:tenants(id, first_name, last_name)')
      .eq('status', 'active')
    setLeaseOptions((data as unknown as LeaseOption[]) ?? [])
    setShowRecord(true)
  }

  async function handleRecord(e: React.FormEvent) {
    e.preventDefault()
    const lease = leaseOptions.find(l => l.tenant_id === form.tenant_id)
    if (!lease) { setFormError('No active lease found for this tenant.'); return }
    setSubmitting(true)
    setFormError('')
    const { data, error } = await supabase.from('payments').insert({
      tenant_id: form.tenant_id,
      lease_id: lease.id,
      unit_id: lease.unit_id,
      property_id: lease.property_id,
      amount: parseFloat(form.amount),
      due_date: form.due_date,
      status: form.status,
      method: form.method || null,
      late_fee: form.late_fee ? parseFloat(form.late_fee) : null,
      notes: form.notes || null,
      paid_date: form.status === 'paid' ? new Date().toISOString().split('T')[0] : null,
    }).select('id, amount, due_date, paid_date, status, method, late_fee, notes, tenant:tenants(first_name, last_name)').single()
    if (error) { setFormError(error.message); setSubmitting(false); return }
    setPayments(prev => [data as unknown as PaymentRow, ...prev])
    setShowRecord(false)
    setSubmitting(false)
  }

  function openEdit(payment: PaymentRow) {
    setEditingPayment(payment)
    setEditForm({
      tenant_id: '',
      amount: String(payment.amount),
      due_date: payment.due_date,
      status: payment.status,
      method: payment.method ?? '',
      late_fee: payment.late_fee ? String(payment.late_fee) : '',
      notes: payment.notes ?? '',
    })
    setEditError('')
    setShowEdit(true)
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingPayment) return
    setEditSubmitting(true)
    setEditError('')
    const { error } = await supabase.from('payments').update({
      amount: parseFloat(editForm.amount),
      due_date: editForm.due_date,
      status: editForm.status,
      method: editForm.method || null,
      late_fee: editForm.late_fee ? parseFloat(editForm.late_fee) : null,
      notes: editForm.notes || null,
      paid_date: editForm.status === 'paid' && !editingPayment.paid_date ? new Date().toISOString().split('T')[0] : editingPayment.paid_date,
    }).eq('id', editingPayment.id)
    if (error) { setEditError(error.message); setEditSubmitting(false); return }
    setPayments(prev => prev.map(p => p.id === editingPayment.id ? {
      ...p,
      amount: parseFloat(editForm.amount),
      due_date: editForm.due_date,
      status: editForm.status,
      method: editForm.method || null,
      late_fee: editForm.late_fee ? parseFloat(editForm.late_fee) : null,
      notes: editForm.notes || null,
    } : p))
    setShowEdit(false)
    setEditSubmitting(false)
  }

  async function handleDelete(id: string) {
    setDeleting(true)
    await supabase.from('payments').delete().eq('id', id)
    setPayments(prev => prev.filter(p => p.id !== id))
    setConfirmDelete(null)
    setDeleting(false)
  }

  async function handleMarkPaid(id: string) {
    setMarkingPaid(id)
    const today = new Date().toISOString().split('T')[0]
    await supabase.from('payments').update({ status: 'paid', paid_date: today }).eq('id', id)
    setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'paid', paid_date: today } : p))
    setMarkingPaid(null)
  }

  const filtered = filter === 'all' ? payments : payments.filter(p => p.status === filter)
  const totalCollected = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0)
  const outstanding = payments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0)
  const overdue = payments.filter(p => p.status === 'overdue').reduce((s, p) => s + p.amount, 0)
  const collectionRate = payments.length > 0
    ? Math.round((payments.filter(p => p.status === 'paid').length / payments.length) * 100)
    : 0

  if (authLoading || loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <span className="material-symbols-outlined text-4xl text-primary animate-pulse">payments</span>
            <p className="text-on-surface-variant mt-2">Loading payments...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight">Payments</h1>
            <p className="text-on-surface-variant mt-1">Track rent collection across your portfolio</p>
          </div>
          <button onClick={openRecord} className="btn-primary h-12 px-6">
            <span className="material-symbols-outlined">add</span> Record Payment
          </button>
        </div>

        {/* Hero Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-surface-container-lowest rounded-xl p-8 flex flex-col justify-between min-h-[200px] shadow-card">
            <div>
              <span className="text-sm font-semibold text-on-surface-variant uppercase tracking-widest font-headline">Total Collections</span>
              <h1 className="text-5xl font-headline font-extrabold text-primary mt-2 tracking-tight">
                {formatCurrency(totalCollected)}
              </h1>
            </div>
            <div className="flex items-center gap-6 mt-8 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-on-surface-variant">{collectionRate}% collection rate</span>
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
                <p className="text-2xl font-bold font-headline text-on-surface">{formatCurrency(outstanding)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-tertiary-fixed flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined">schedule</span>
              </div>
            </div>
            <div className="bg-error-container/30 rounded-xl p-6 flex items-center justify-between shadow-card">
              <div>
                <p className="text-xs font-bold text-error uppercase tracking-widest font-headline">Overdue</p>
                <p className="text-2xl font-bold font-headline text-error">{formatCurrency(overdue)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center text-error">
                <span className="material-symbols-outlined">warning</span>
              </div>
            </div>
          </div>
        </section>

        {/* Payment History */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold font-headline px-1">Payment History</h2>

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

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant text-center">
              <span className="material-symbols-outlined text-5xl mb-3">receipt_long</span>
              <p className="font-bold text-on-surface">No payments yet</p>
              <p className="text-sm mt-1">Record a payment to get started.</p>
              <button onClick={openRecord} className="btn-primary mt-4">Record Payment</button>
            </div>
          ) : (
            <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-card">
              <div className="divide-y divide-surface-container-high/50">
                {filtered.map(payment => {
                  const tenantName = payment.tenant
                    ? `${payment.tenant.first_name} ${payment.tenant.last_name}`
                    : 'Unknown Tenant'
                  const icon = methodIcon[payment.method ?? ''] ?? 'payments'
                  const isConfirmingDelete = confirmDelete === payment.id
                  return (
                    <div key={payment.id} className="p-5 flex items-center justify-between hover:bg-surface-container-low/30 transition-colors group">
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
                          <p className="font-bold text-on-surface text-sm">{tenantName}</p>
                          <p className="text-xs text-on-surface-variant">
                            {formatDate(payment.due_date)}{payment.method ? ` • ${payment.method.replace('_', ' ').toUpperCase()}` : ''}
                          </p>
                          {payment.notes && <p className="text-xs text-on-surface-variant italic mt-0.5">{payment.notes}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {(payment.status === 'pending' || payment.status === 'overdue') && (
                          <button
                            onClick={() => handleMarkPaid(payment.id)}
                            disabled={markingPaid === payment.id}
                            className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold hover:bg-emerald-500/20 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                          >
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            {markingPaid === payment.id ? 'Saving...' : 'Mark Paid'}
                          </button>
                        )}
                        <div className="text-right">
                          <p className="font-bold text-on-surface">{formatCurrency(payment.amount)}</p>
                          {payment.late_fee && <p className="text-xs text-error">+{formatCurrency(payment.late_fee)} late fee</p>}
                          <span className={cn('badge mt-1', getStatusColor(payment.status))}>{payment.status}</span>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEdit(payment)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-primary transition-all"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          {isConfirmingDelete ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(payment.id)}
                                disabled={deleting}
                                className="px-2 py-1 rounded-lg bg-error text-on-error text-xs font-bold"
                              >
                                {deleting ? '...' : 'Delete'}
                              </button>
                              <button
                                onClick={() => setConfirmDelete(null)}
                                className="px-2 py-1 rounded-lg bg-surface-container text-on-surface-variant text-xs font-bold"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDelete(payment.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-error-container/20 hover:text-error transition-all"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </section>

      </div>

      {/* Record Payment Modal */}
      <Modal open={showRecord} onClose={() => setShowRecord(false)} title="Record Payment" size="md">
        <form onSubmit={handleRecord} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">Tenant</label>
            <select required className="input-base" value={form.tenant_id} onChange={e => {
              const lease = leaseOptions.find(l => l.tenant_id === e.target.value)
              setForm(f => ({ ...f, tenant_id: e.target.value, amount: lease ? String(lease.rent_amount) : f.amount }))
            }}>
              <option value="">— Select tenant —</option>
              {leaseOptions.map(l => (
                <option key={l.tenant_id} value={l.tenant_id}>
                  {l.tenant?.first_name} {l.tenant?.last_name}
                </option>
              ))}
            </select>
            {leaseOptions.length === 0 && <p className="text-xs text-on-surface-variant mt-1">No active leases found.</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Amount ($)</label>
              <input required type="number" min="0" step="0.01" className="input-base" placeholder="2500" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Due Date</label>
              <input required type="date" className="input-base" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Status</label>
              <select className="input-base" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as PaymentRow['status'] }))}>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="partial">Partial</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Method <span className="text-on-surface-variant font-normal">(optional)</span></label>
              <select className="input-base" value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value }))}>
                <option value="">— None —</option>
                <option value="ach">ACH</option>
                <option value="credit_card">Credit Card</option>
                <option value="check">Check</option>
                <option value="cash">Cash</option>
                <option value="wire">Wire</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">Late Fee ($) <span className="text-on-surface-variant font-normal">(optional)</span></label>
            <input type="number" min="0" step="0.01" className="input-base" placeholder="0" value={form.late_fee} onChange={e => setForm(f => ({ ...f, late_fee: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">Notes <span className="text-on-surface-variant font-normal">(optional)</span></label>
            <input type="text" className="input-base" placeholder="e.g. Paid via bank transfer" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          {formError && <p className="text-sm text-error">{formError}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowRecord(false)} className="btn-secondary flex-1 h-11">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 h-11">{submitting ? 'Saving...' : 'Record Payment'}</button>
          </div>
        </form>
      </Modal>

      {/* Edit Payment Modal */}
      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Payment" size="md">
        <form onSubmit={handleEdit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Amount ($)</label>
              <input required type="number" min="0" step="0.01" className="input-base" value={editForm.amount} onChange={e => setEditForm(f => ({ ...f, amount: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Due Date</label>
              <input required type="date" className="input-base" value={editForm.due_date} onChange={e => setEditForm(f => ({ ...f, due_date: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Status</label>
              <select className="input-base" value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value as PaymentRow['status'] }))}>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="partial">Partial</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Method</label>
              <select className="input-base" value={editForm.method} onChange={e => setEditForm(f => ({ ...f, method: e.target.value }))}>
                <option value="">— None —</option>
                <option value="ach">ACH</option>
                <option value="credit_card">Credit Card</option>
                <option value="check">Check</option>
                <option value="cash">Cash</option>
                <option value="wire">Wire</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">Late Fee ($)</label>
            <input type="number" min="0" step="0.01" className="input-base" placeholder="0" value={editForm.late_fee} onChange={e => setEditForm(f => ({ ...f, late_fee: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">Notes</label>
            <input type="text" className="input-base" value={editForm.notes} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          {editError && <p className="text-sm text-error">{editError}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowEdit(false)} className="btn-secondary flex-1 h-11">Cancel</button>
            <button type="submit" disabled={editSubmitting} className="btn-primary flex-1 h-11">{editSubmitting ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </Modal>

    </AppLayout>
  )
}

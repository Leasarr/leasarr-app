'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import Modal from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { EmptyState } from '@/components/patterns/EmptyState'
import { LoadingState } from '@/components/patterns/LoadingState'
import { FormField } from '@/components/patterns/FormField'
import { PageHeader } from '@/components/layout/PageHeader'
import { formatCurrency, formatDate, getStatusColor, cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { editPaymentSchema, recordPaymentSchema, type EditPaymentForm, type RecordPaymentForm } from '@/lib/schemas/payment'

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
  const [recordServerError, setRecordServerError] = useState('')

  const recordPaymentForm = useForm<RecordPaymentForm>({
    resolver: zodResolver(recordPaymentSchema),
    defaultValues: { tenant_id: '', amount: '', due_date: '', status: 'pending', method: '', late_fee: '', notes: '' },
  })
  const recordTenantId = recordPaymentForm.watch('tenant_id')

  const [showEdit, setShowEdit] = useState(false)
  const [editingPayment, setEditingPayment] = useState<PaymentRow | null>(null)
  const editPaymentForm = useForm<EditPaymentForm>({ resolver: zodResolver(editPaymentSchema) })
  const [editServerError, setEditServerError] = useState('')

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
    recordPaymentForm.reset()
    setRecordServerError('')
    const { data } = await supabase
      .from('leases')
      .select('id, tenant_id, unit_id, property_id, rent_amount, tenant:tenants(id, first_name, last_name)')
      .eq('status', 'active')
    setLeaseOptions((data as unknown as LeaseOption[]) ?? [])
    setShowRecord(true)
  }

  async function onRecordPayment(data: RecordPaymentForm) {
    const lease = leaseOptions.find(l => l.tenant_id === data.tenant_id)
    if (!lease) { setRecordServerError('No active lease found for this tenant.'); return }
    setRecordServerError('')
    const { data: row, error } = await supabase.from('payments').insert({
      tenant_id: data.tenant_id,
      lease_id: lease.id,
      unit_id: lease.unit_id,
      property_id: lease.property_id,
      amount: parseFloat(data.amount),
      due_date: data.due_date,
      status: data.status,
      method: data.method || null,
      late_fee: data.late_fee ? parseFloat(data.late_fee) : null,
      notes: data.notes || null,
      paid_date: data.status === 'paid' ? new Date().toISOString().split('T')[0] : null,
    }).select('id, amount, due_date, paid_date, status, method, late_fee, notes, tenant:tenants(first_name, last_name)').single()
    if (error) { setRecordServerError(error.message); return }
    setPayments(prev => [row as unknown as PaymentRow, ...prev])
    setShowRecord(false)
  }

  function openEdit(payment: PaymentRow) {
    setEditingPayment(payment)
    editPaymentForm.reset({
      amount: String(payment.amount),
      due_date: payment.due_date,
      status: payment.status,
      method: payment.method ?? '',
      late_fee: payment.late_fee ? String(payment.late_fee) : '',
      notes: payment.notes ?? '',
    })
    setEditServerError('')
    setShowEdit(true)
  }

  async function onEditPayment(data: EditPaymentForm) {
    if (!editingPayment) return
    setEditServerError('')
    const { error } = await supabase.from('payments').update({
      amount: parseFloat(data.amount),
      due_date: data.due_date,
      status: data.status,
      method: data.method || null,
      late_fee: data.late_fee ? parseFloat(data.late_fee) : null,
      notes: data.notes || null,
      paid_date: data.status === 'paid' && !editingPayment.paid_date ? new Date().toISOString().split('T')[0] : editingPayment.paid_date,
    }).eq('id', editingPayment.id)
    if (error) { setEditServerError(error.message); return }
    setPayments(prev => prev.map(p => p.id === editingPayment.id ? {
      ...p,
      amount: parseFloat(data.amount),
      due_date: data.due_date,
      status: data.status,
      method: data.method || null,
      late_fee: data.late_fee ? parseFloat(data.late_fee) : null,
      notes: data.notes || null,
    } : p))
    setShowEdit(false)
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
        <LoadingState label="Loading payments..." />
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">

        <PageHeader
          title="Payments"
          subtitle="Track rent collection across your portfolio"
          action={
            <button onClick={openRecord} className="btn-primary h-11 w-11 md:w-auto md:px-5 flex items-center justify-center gap-2 flex-shrink-0">
              <span className="material-symbols-outlined text-xl">add</span>
              <span className="hidden md:inline">Record Payment</span>
            </button>
          }
        />

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
                <span className="w-2 h-2 rounded-full bg-success" />
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
                <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Pending</p>
                <p className="text-2xl font-bold font-headline text-on-surface">{formatCurrency(outstanding)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-tertiary-fixed flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined">schedule</span>
              </div>
            </div>
            <div className="bg-error-container/30 rounded-xl p-6 flex items-center justify-between shadow-card">
              <div>
                <p className="text-[10px] font-bold text-error uppercase tracking-wider">Overdue</p>
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
          <h2 className="text-base md:text-lg font-bold text-on-surface px-1">Payment History</h2>

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
            <EmptyState
              icon="receipt_long"
              title="No payments yet"
              description="Record a payment to get started."
              action={<Button onClick={openRecord}>Record Payment</Button>}
            />
          ) : (
            <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-card">
              <div className="divide-y divide-surface-container-high/50">
                {filtered.map(payment => {
                  const tenantName = payment.tenant
                    ? `${payment.tenant.first_name} ${payment.tenant.last_name}`
                    : 'Unknown Tenant'
                  const icon = methodIcon[payment.method ?? ''] ?? 'payments'
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
                            className="px-4 py-2 rounded-xl bg-success-container/30 text-on-success-container border border-success-container text-xs font-bold hover:bg-success-container/50 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                          >
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            {markingPaid === payment.id ? 'Saving...' : 'Mark Paid'}
                          </button>
                        )}
                        <div className="text-right">
                          <p className="font-bold text-on-surface">{formatCurrency(payment.amount)}</p>
                          {payment.late_fee && <p className="text-xs text-error">+{formatCurrency(payment.late_fee)} late fee</p>}
                          <Badge className={cn('mt-1', getStatusColor(payment.status))}>{payment.status}</Badge>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEdit(payment)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-primary transition-all"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button
                            onClick={() => setConfirmDelete(payment.id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-error-container/20 hover:text-error transition-all"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
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
        <form onSubmit={recordPaymentForm.handleSubmit(onRecordPayment)} className="space-y-4">
          <FormField label="Tenant" hint={leaseOptions.length === 0 ? 'No active leases found.' : undefined}>
            <select
              className="input-base"
              value={recordTenantId}
              onChange={e => {
                const lease = leaseOptions.find(l => l.tenant_id === e.target.value)
                recordPaymentForm.setValue('tenant_id', e.target.value)
                if (lease) recordPaymentForm.setValue('amount', String(lease.rent_amount))
              }}
            >
              <option value="">— Select tenant —</option>
              {leaseOptions.map(l => (
                <option key={l.tenant_id} value={l.tenant_id}>
                  {l.tenant?.first_name} {l.tenant?.last_name}
                </option>
              ))}
            </select>
            {recordPaymentForm.formState.errors.tenant_id && <p className="text-error text-xs mt-1">{recordPaymentForm.formState.errors.tenant_id.message}</p>}
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Amount ($)">
              <input {...recordPaymentForm.register('amount')} type="number" min="0" step="0.01" className="input-base" placeholder="2500" />
              {recordPaymentForm.formState.errors.amount && <p className="text-error text-xs mt-1">{recordPaymentForm.formState.errors.amount.message}</p>}
            </FormField>
            <FormField label="Due Date">
              <input {...recordPaymentForm.register('due_date')} type="date" className="input-base" />
              {recordPaymentForm.formState.errors.due_date && <p className="text-error text-xs mt-1">{recordPaymentForm.formState.errors.due_date.message}</p>}
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Status">
              <select {...recordPaymentForm.register('status')} className="input-base">
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="partial">Partial</option>
                <option value="failed">Failed</option>
              </select>
            </FormField>
            <FormField label="Method" optional>
              <select {...recordPaymentForm.register('method')} className="input-base">
                <option value="">— None —</option>
                <option value="ach">ACH</option>
                <option value="credit_card">Credit Card</option>
                <option value="check">Check</option>
                <option value="cash">Cash</option>
                <option value="wire">Wire</option>
              </select>
            </FormField>
          </div>
          <FormField label="Late Fee ($)" optional>
            <input {...recordPaymentForm.register('late_fee')} type="number" min="0" step="0.01" className="input-base" placeholder="0" />
          </FormField>
          <FormField label="Notes" optional>
            <input {...recordPaymentForm.register('notes')} type="text" className="input-base" placeholder="e.g. Paid via bank transfer" />
          </FormField>
          {recordServerError && <p className="text-sm text-error">{recordServerError}</p>}
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowRecord(false)} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={recordPaymentForm.formState.isSubmitting} className="flex-1">{recordPaymentForm.formState.isSubmitting ? 'Saving...' : 'Record Payment'}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        open={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        title="Delete Payment"
        body="This will permanently remove the payment record. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        loading={deleting}
        destructive
      />

      {/* Edit Payment Modal */}
      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Payment" size="md">
        <form onSubmit={editPaymentForm.handleSubmit(onEditPayment)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Amount ($)">
              <input {...editPaymentForm.register('amount')} type="number" min="0" step="0.01" className="input-base" />
              {editPaymentForm.formState.errors.amount && <p className="text-error text-xs mt-1">{editPaymentForm.formState.errors.amount.message}</p>}
            </FormField>
            <FormField label="Due Date">
              <input {...editPaymentForm.register('due_date')} type="date" className="input-base" />
              {editPaymentForm.formState.errors.due_date && <p className="text-error text-xs mt-1">{editPaymentForm.formState.errors.due_date.message}</p>}
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Status">
              <select {...editPaymentForm.register('status')} className="input-base">
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="partial">Partial</option>
                <option value="failed">Failed</option>
              </select>
            </FormField>
            <FormField label="Method" optional>
              <select {...editPaymentForm.register('method')} className="input-base">
                <option value="">— None —</option>
                <option value="ach">ACH</option>
                <option value="credit_card">Credit Card</option>
                <option value="check">Check</option>
                <option value="cash">Cash</option>
                <option value="wire">Wire</option>
              </select>
            </FormField>
          </div>
          <FormField label="Late Fee ($)" optional>
            <input {...editPaymentForm.register('late_fee')} type="number" min="0" step="0.01" className="input-base" placeholder="0" />
          </FormField>
          <FormField label="Notes" optional>
            <input {...editPaymentForm.register('notes')} type="text" className="input-base" />
          </FormField>
          {editServerError && <p className="text-sm text-error">{editServerError}</p>}
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowEdit(false)} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={editPaymentForm.formState.isSubmitting} className="flex-1">{editPaymentForm.formState.isSubmitting ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        </form>
      </Modal>

    </AppLayout>
  )
}

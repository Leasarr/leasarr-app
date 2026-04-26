import { z } from 'zod'

export const editPaymentSchema = z.object({
  amount: z.string().min(1, 'Amount is required'),
  due_date: z.string().min(1, 'Due date is required'),
  status: z.enum(['paid', 'pending', 'overdue', 'partial', 'failed']),
  method: z.string().optional(),
  late_fee: z.string().optional(),
  notes: z.string().optional(),
})

export const recordPaymentSchema = z.object({
  tenant_id: z.string().min(1, 'Please select a tenant'),
  amount: z.string().min(1, 'Amount is required'),
  due_date: z.string().min(1, 'Due date is required'),
  status: z.enum(['paid', 'pending', 'overdue', 'partial', 'failed']),
  method: z.string().optional(),
  late_fee: z.string().optional(),
  notes: z.string().optional(),
})

export type EditPaymentForm = z.infer<typeof editPaymentSchema>
export type RecordPaymentForm = z.infer<typeof recordPaymentSchema>

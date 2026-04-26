import { z } from 'zod'

export const createLeaseSchema = z.object({
  tenant_id: z.string().min(1, 'Please select a tenant'),
  property_id: z.string().min(1, 'Please select a property'),
  unit_id: z.string().min(1, 'Please select a unit'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  rent_amount: z.string().min(1, 'Rent amount is required'),
  security_deposit: z.string().min(1, 'Security deposit is required'),
})

export const editLeaseSchema = z.object({
  end_date: z.string().min(1, 'End date is required'),
  rent_amount: z.string().min(1, 'Rent amount is required'),
  security_deposit: z.string().min(1, 'Security deposit is required'),
  status: z.enum(['active', 'expired', 'pending', 'terminated']),
  renewal_status: z.string().optional(),
})

export type CreateLeaseForm = z.infer<typeof createLeaseSchema>
export type EditLeaseForm = z.infer<typeof editLeaseSchema>

import { z } from 'zod'

export const tenantMaintenanceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  category: z.string().min(1, 'Please select a category'),
  priority: z.enum(['low', 'medium', 'high', 'emergency']),
  description: z.string().min(1, 'Description is required'),
})

export const managerMaintenanceSchema = z.object({
  tenant_id: z.string().min(1, 'Please select a tenant'),
  title: z.string().min(1, 'Title is required'),
  category: z.string().min(1, 'Please select a category'),
  priority: z.enum(['low', 'medium', 'high', 'emergency']),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
})

export type TenantMaintenanceForm = z.infer<typeof tenantMaintenanceSchema>
export type ManagerMaintenanceForm = z.infer<typeof managerMaintenanceSchema>

import { z } from 'zod'

export const teamMemberSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  role: z.string().min(1, 'Role is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
})

export const vendorSchema = z.object({
  name: z.string().min(1, 'Contact name is required'),
  company: z.string().min(1, 'Company is required'),
  specialty: z.enum(['plumbing', 'electrical', 'hvac', 'landscaping', 'general', 'cleaning']),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
})

export const tenantSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  avatar_url: z.string().nullable().optional(),
  move_in_date: z.string().optional(),
  property_id: z.string().optional(),
  unit_id: z.string().optional(),
  team_member_id: z.string().optional(),
})

export const editTenantSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  avatar_url: z.string().nullable().optional(),
  property_id: z.string().optional(),
  unit_id: z.string().optional(),
  team_member_id: z.string().optional(),
  status: z.enum(['active', 'inactive', 'pending']),
})

export type TeamMemberForm = z.infer<typeof teamMemberSchema>
export type VendorForm = z.infer<typeof vendorSchema>
export type TenantForm = z.infer<typeof tenantSchema>
export type EditTenantForm = z.infer<typeof editTenantSchema>

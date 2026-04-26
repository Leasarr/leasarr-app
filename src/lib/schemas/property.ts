import { z } from 'zod'

export const unitSchema = z.object({
  unit_number: z.string().min(1, 'Unit number is required'),
  bedrooms: z.string().min(1, 'Required'),
  bathrooms: z.string().min(1, 'Required'),
  sqft: z.string().optional(),
  rent_amount: z.string().min(1, 'Rent amount is required'),
  status: z.enum(['vacant', 'occupied', 'maintenance']),
})

export const propertySchema = z.object({
  name: z.string().min(1, 'Property name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required').max(2),
  zip: z.string().min(1, 'ZIP code is required'),
  type: z.enum(['apartment', 'house', 'condo', 'commercial']),
  image_url: z.string().nullable().optional(),
})

export type UnitForm = z.infer<typeof unitSchema>
export type PropertyForm = z.infer<typeof propertySchema>

import { z } from 'zod'

export const sendMessageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(2000),
})

export const createAnnouncementSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  message: z.string().min(1, 'Message is required').max(500),
  channels: z.array(z.enum(['email', 'sms', 'push', 'in_app'])).min(1, 'Select at least one channel'),
  property_ids: z.array(z.string()).default([]),
  scheduled_for: z.string().optional(),
})

export type SendMessageInput = z.infer<typeof sendMessageSchema>
export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>

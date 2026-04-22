import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, differenceInDays, parseISO, isValid } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, compact = false): string {
  if (compact && amount >= 1000) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(amount)
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)
}

export function formatDate(dateStr: string, fmt = 'MMM d, yyyy'): string {
  try {
    const d = parseISO(dateStr)
    return isValid(d) ? format(d, fmt) : dateStr
  } catch { return dateStr }
}

export function formatRelative(dateStr: string): string {
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true })
  } catch { return dateStr }
}

export function getDaysUntil(dateStr: string): number {
  try { return differenceInDays(parseISO(dateStr), new Date()) } catch { return 0 }
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    paid: 'bg-success-container text-on-success-container',
    active: 'bg-secondary-container text-on-secondary-container',
    completed: 'bg-success-container text-on-success-container',
    pending: 'bg-warning-container text-on-warning-container',
    in_progress: 'bg-primary-fixed text-on-primary-fixed',
    partial: 'bg-warning-container text-on-warning-container',
    overdue: 'bg-error-container text-on-error-container',
    expired: 'bg-error-container text-on-error-container',
    failed: 'bg-error-container text-on-error-container',
    open: 'bg-warning-container text-on-warning-container',
    vacant: 'bg-warning-container text-on-warning-container',
    occupied: 'bg-success-container text-on-success-container',
    maintenance: 'bg-error-container text-on-error-container',
    inactive: 'bg-surface-container-high text-on-surface-variant',
    current: 'bg-success-container text-on-success-container',
    notice: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
    late: 'bg-error-container text-on-error-container',
  }
  return map[status] ?? 'bg-surface-container-high text-on-surface-variant'
}

export function getPriorityColor(priority: string): string {
  const map: Record<string, string> = {
    low: 'bg-success-container text-on-success-container',
    medium: 'bg-warning-container text-on-warning-container',
    high: 'bg-error-container text-on-error-container',
    emergency: 'bg-error text-on-error',
  }
  return map[priority] ?? 'bg-surface-container text-on-surface-variant'
}

export function getPriorityBorderColor(priority: string): string {
  const map: Record<string, string> = {
    emergency: 'border-l-error',
    high: 'border-l-error',
    medium: 'border-l-on-warning-container',
    low: 'border-l-success',
  }
  return map[priority] ?? ''
}

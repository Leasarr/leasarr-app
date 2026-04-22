export const NOTIFICATION_TYPE_META: Record<string, {
  icon: string
  iconBg: string
  iconColor: string
  label: string
  managerHref: string
  portalHref: string
}> = {
  maintenance: { icon: 'build', iconBg: 'bg-tertiary-container/20', iconColor: 'text-tertiary', label: 'Maintenance', managerHref: '/maintenance', portalHref: '/portal/maintenance' },
  payment:     { icon: 'payments', iconBg: 'bg-primary-container/20', iconColor: 'text-primary', label: 'Payments', managerHref: '/payments', portalHref: '/portal' },
  lease:       { icon: 'description', iconBg: 'bg-error-container/20', iconColor: 'text-error', label: 'Leases', managerHref: '/leases', portalHref: '/portal/lease' },
}

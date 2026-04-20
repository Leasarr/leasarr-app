'use client'

import { useEffect, useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { formatCurrency, formatDate, getDaysUntil, cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { DASHBOARD_STATS, PAYMENTS, MAINTENANCE_REQUESTS, LEASES, TENANTS, PROPERTIES } from '@/data/mock'

const isMockMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

type LeaseExpiration = {
  id: string
  end_date: string
  tenant: { first_name: string; last_name: string } | null
  property: { name: string } | null
}

type ActivityItem = {
  id: string
  type: 'payment' | 'maintenance'
  title: string
  description: string
  created_at: string
}

type Stats = {
  totalCollected: number
  outstanding: number
  overdueCount: number
  occupancyRate: number
  totalUnits: number
  occupiedUnits: number
}

export default function DashboardPage() {
  const { profile, loading: authLoading } = useAuth()
  const supabase = createClient()

  const [stats, setStats] = useState<Stats>({
    totalCollected: 0,
    outstanding: 0,
    overdueCount: 0,
    occupancyRate: 0,
    totalUnits: 0,
    occupiedUnits: 0,
  })
  const [expirations, setExpirations] = useState<LeaseExpiration[]>([])
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!profile) return
    setLoading(true)

    async function fetchDashboard() {
      if (isMockMode) {
        const s = DASHBOARD_STATS
        const totalUnits = PROPERTIES.reduce((sum, p) => sum + (p.total_units ?? 0), 0)
        const occupiedUnits = PROPERTIES.reduce((sum, p) => sum + (p.occupied_units ?? 0), 0)
        setStats({
          totalCollected: s.total_rent_collected,
          outstanding: s.outstanding_balance,
          overdueCount: s.overdue_tenants,
          occupancyRate: s.occupancy_rate,
          totalUnits,
          occupiedUnits,
        })
        const upcoming = LEASES.filter(l => {
          const days = getDaysUntil(l.end_date)
          return days <= 60
        }).slice(0, 5).map(l => {
          const tenant = TENANTS.find(t => t.id === l.tenant_id) ?? null
          const property = PROPERTIES.find(p => p.id === l.property_id) ?? null
          return {
            id: l.id,
            end_date: l.end_date,
            tenant: tenant ? { first_name: tenant.first_name, last_name: tenant.last_name } : null,
            property: property ? { name: property.name } : null,
          }
        })
        setExpirations(upcoming)
        const paymentActivity: ActivityItem[] = PAYMENTS
          .filter(p => p.status === 'paid')
          .slice(0, 4)
          .map(p => {
            const tenant = TENANTS.find(t => t.id === p.tenant_id)
            return {
              id: `pay-${p.id}`,
              type: 'payment',
              title: 'Rent Payment Received',
              description: `${tenant ? `${tenant.first_name} ${tenant.last_name}` : 'Tenant'} — ${formatCurrency(p.amount)}`,
              created_at: p.due_date,
            }
          })
        const maintenanceActivity: ActivityItem[] = MAINTENANCE_REQUESTS.slice(0, 3).map(m => {
          const tenant = TENANTS.find(t => t.id === m.tenant_id)
          return {
            id: `maint-${m.id}`,
            type: 'maintenance',
            title: m.title,
            description: `${tenant ? `${tenant.first_name} ${tenant.last_name}` : 'Tenant'} — ${m.status.replace('_', ' ')}`,
            created_at: m.created_at,
          }
        })
        const combined = [...paymentActivity, ...maintenanceActivity]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 6)
        setActivity(combined)
        setLoading(false)
        return
      }

      const [paymentsRes, unitsRes, leasesRes, maintenanceRes] = await Promise.all([
        supabase
          .from('payments')
          .select('id, amount, status, due_date, tenant:tenants(first_name, last_name)'),
        supabase
          .from('units')
          .select('id, status, property:properties!inner(manager_id)')
          .eq('property.manager_id', profile!.id),
        supabase
          .from('leases')
          .select('id, end_date, tenant:tenants(first_name, last_name), property:properties(name)')
          .eq('status', 'active')
          .order('end_date', { ascending: true })
          .limit(5),
        supabase
          .from('maintenance_requests')
          .select('id, title, status, created_at, tenant:tenants(first_name, last_name)')
          .order('created_at', { ascending: false })
          .limit(5),
      ])

      type PaymentData = { id: string; amount: number; status: string; due_date: string; tenant: { first_name: string; last_name: string } | null }
      const payments = (paymentsRes.data ?? []) as PaymentData[]
      const units = unitsRes.data ?? []
      const leases = (leasesRes.data ?? []) as unknown as LeaseExpiration[]
      const maintenance = maintenanceRes.data ?? []

      // Compute stats
      const totalCollected = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0)
      const outstanding = payments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0)
      const overdueCount = payments.filter(p => p.status === 'overdue').length
      const totalUnits = units.length
      const occupiedUnits = units.filter((u: any) => u.status === 'occupied').length
      const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 1000) / 10 : 0

      setStats({ totalCollected, outstanding, overdueCount, occupancyRate, totalUnits, occupiedUnits })

      // Upcoming expirations (within 60 days)
      const upcoming = leases.filter(l => {
        const days = getDaysUntil(l.end_date)
        return days <= 60
      })
      setExpirations(upcoming)

      // Build activity feed from payments + maintenance
      const paymentActivity: ActivityItem[] = payments
        .filter(p => p.status === 'paid')
        .slice(0, 4)
        .map((p: any) => ({
          id: `pay-${p.id}`,
          type: 'payment',
          title: 'Rent Payment Received',
          description: `${p.tenant ? `${p.tenant.first_name} ${p.tenant.last_name}` : 'Tenant'} — ${formatCurrency(p.amount)}`,
          created_at: p.due_date,
        }))

      const maintenanceActivity: ActivityItem[] = maintenance.slice(0, 3).map((m: any) => ({
        id: `maint-${m.id}`,
        type: 'maintenance',
        title: m.title,
        description: `${m.tenant ? `${m.tenant.first_name} ${m.tenant.last_name}` : 'Tenant'} — ${m.status.replace('_', ' ')}`,
        created_at: m.created_at,
      }))

      const combined = [...paymentActivity, ...maintenanceActivity]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 6)

      setActivity(combined)
      setLoading(false)
    }

    fetchDashboard()
  }, [profile])

  const iconMap = {
    payment: { icon: 'payments', color: 'text-primary', bg: 'bg-primary-container/20' },
    maintenance: { icon: 'engineering', color: 'text-tertiary', bg: 'bg-tertiary-container/20' },
  }

  if (authLoading || loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <span className="material-symbols-outlined text-4xl text-primary animate-pulse">dashboard</span>
            <p className="text-on-surface-variant mt-2">Loading dashboard...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">

        {/* Welcome */}
        <section className="space-y-1">
          <p className="text-sm text-on-surface-variant font-medium">Good day, {profile?.name?.split(' ')[0] ?? 'there'}</p>
          <h1 className="text-3xl font-headline font-extrabold tracking-tight text-on-surface">Portfolio Summary</h1>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-card hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="material-symbols-outlined text-primary text-2xl">payments</span>
              <span className="badge bg-secondary-container text-on-secondary-container">Collected</span>
            </div>
            <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1">Total Rent Collected</p>
            <p className="text-2xl font-headline font-bold text-on-surface">{formatCurrency(stats.totalCollected)}</p>
            <div className="mt-4 h-1 w-full bg-surface-container-high rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: stats.totalCollected > 0 ? '85%' : '0%' }} />
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-card hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="material-symbols-outlined text-error text-2xl">pending_actions</span>
              <span className={cn('badge', stats.overdueCount > 0 ? 'bg-error-container text-on-error-container' : 'bg-secondary-container text-on-secondary-container')}>
                {stats.overdueCount > 0 ? 'Critical' : 'Clear'}
              </span>
            </div>
            <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1">Outstanding Balance</p>
            <p className={cn('text-2xl font-headline font-bold', stats.outstanding > 0 ? 'text-error' : 'text-on-surface')}>{formatCurrency(stats.outstanding)}</p>
            <p className="mt-2 text-[10px] text-on-surface-variant">{stats.overdueCount} {stats.overdueCount === 1 ? 'tenant' : 'tenants'} currently overdue</p>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-card hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="material-symbols-outlined text-tertiary text-2xl">domain</span>
              <span className="badge bg-tertiary-fixed text-on-tertiary-fixed-variant">
                {stats.occupiedUnits}/{stats.totalUnits} units
              </span>
            </div>
            <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1">Portfolio Occupancy</p>
            <p className="text-2xl font-headline font-bold text-on-surface">{stats.occupancyRate}%</p>
            <div className="mt-4 h-1 w-full bg-surface-container-high rounded-full overflow-hidden">
              <div className="h-full bg-tertiary-container rounded-full" style={{ width: `${stats.occupancyRate}%` }} />
            </div>
          </div>
        </section>

        {/* Upcoming Expirations */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-bold text-on-surface">Upcoming Lease Expirations</h3>
            <a href="/leases" className="text-[10px] font-bold text-primary hover:underline">View All</a>
          </div>

          {expirations.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-xl p-6 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-3xl mb-2 block">check_circle</span>
              <p className="text-sm font-semibold">No leases expiring in the next 60 days</p>
            </div>
          ) : (
            <div className="space-y-3">
              {expirations.map(lease => {
                const days = getDaysUntil(lease.end_date)
                const isExpired = days < 0
                return (
                  <div
                    key={lease.id}
                    className={cn(
                      'bg-surface-container-lowest rounded-xl p-4 flex items-center justify-between hover:shadow-card transition-all cursor-pointer',
                      isExpired && 'border-l-4 border-error/50'
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', isExpired ? 'bg-error-container/30' : 'bg-surface-container-high')}>
                        <span className={cn('material-symbols-outlined text-lg', isExpired ? 'text-error' : 'text-secondary')}>
                          {isExpired ? 'history_edu' : 'meeting_room'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-on-surface">
                          {lease.tenant ? `${lease.tenant.first_name} ${lease.tenant.last_name}` : 'Unknown'} — {lease.property?.name ?? '—'}
                        </p>
                        <p className={cn('text-[10px]', isExpired ? 'text-error font-medium' : 'text-on-surface-variant')}>
                          {isExpired ? `Expired ${Math.abs(days)} days ago` : `Expires in ${days} days`}
                        </p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-outline-variant text-lg">chevron_right</span>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-on-surface px-1">Quick Actions</h3>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {[
              { icon: 'add_home', label: 'New Lease', href: '/leases' },
              { icon: 'engineering', label: 'Maintenance', href: '/maintenance' },
              { icon: 'description', label: 'Reports', href: '/reports' },
              { icon: 'group', label: 'Tenants', href: '/people' },
              { icon: 'payments', label: 'Payments', href: '/payments' },
            ].map(a => (
              <a key={a.label} href={a.href} className="flex-shrink-0 flex flex-col items-center gap-2 group">
                <div className="w-14 h-14 bg-surface-container-highest rounded-full flex items-center justify-center group-hover:bg-primary-fixed transition-colors">
                  <span className="material-symbols-outlined text-primary">{a.icon}</span>
                </div>
                <span className="text-[10px] font-semibold text-on-surface">{a.label}</span>
              </a>
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="bg-surface-container-low rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-on-surface">Recent Activity</h3>
          </div>

          {activity.length === 0 ? (
            <div className="text-center py-6 text-on-surface-variant">
              <span className="material-symbols-outlined text-3xl mb-2 block">inbox</span>
              <p className="text-sm font-semibold">No recent activity</p>
              <p className="text-xs mt-1">Activity will appear here as payments and maintenance requests come in.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {activity.map((item, i) => {
                const style = iconMap[item.type]
                return (
                  <div key={item.id} className={cn('flex items-start gap-3 py-2.5', i < activity.length - 1 && 'border-b border-outline-variant/30')}>
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5', style.bg)}>
                      <span className={cn('material-symbols-outlined text-sm', style.color)}>{style.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-on-surface leading-tight">{item.title}</p>
                      <p className="text-[10px] text-on-surface-variant mt-0.5 leading-tight truncate">{item.description}</p>
                    </div>
                    <span className="text-[10px] text-on-surface-variant font-medium flex-shrink-0">{formatDate(item.created_at, 'MMM d')}</span>
                  </div>
                )
              })}
            </div>
          )}
        </section>

      </div>
    </AppLayout>
  )
}

import AppLayout from '@/components/layout/AppLayout'
import { DASHBOARD_STATS, LEASES, TENANTS, PROPERTIES, ACTIVITY_FEED } from '@/data/mock'
import { formatCurrency, formatDate, getDaysUntil, cn } from '@/lib/utils'

export default function DashboardPage() {
  const stats = DASHBOARD_STATS

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {/* Welcome */}
        <section className="space-y-1">
          <p className="text-sm text-on-surface-variant font-medium">Good Morning, Alexander</p>
          <h1 className="text-3xl font-headline font-extrabold tracking-tight text-on-surface">Portfolio Summary</h1>
        </section>

        {/* Financial Bento Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Rent */}
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-card hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="material-symbols-outlined text-primary text-2xl">payments</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container">+12%</span>
            </div>
            <p className="text-xs text-on-surface-variant mb-1">Total Rent Collected</p>
            <p className="text-2xl font-headline font-bold text-on-surface">{formatCurrency(stats.total_rent_collected)}</p>
            <div className="mt-4 h-1 w-full bg-surface-container-high rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: '85%' }} />
            </div>
          </div>

          {/* Outstanding */}
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-card hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="material-symbols-outlined text-error text-2xl">pending_actions</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-error-container text-on-error-container">Critical</span>
            </div>
            <p className="text-xs text-on-surface-variant mb-1">Outstanding Balance</p>
            <p className="text-2xl font-headline font-bold text-error">{formatCurrency(stats.outstanding_balance)}</p>
            <p className="mt-2 text-[10px] text-on-surface-variant">{stats.overdue_tenants} tenants currently overdue</p>
          </div>

          {/* Occupancy */}
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-card hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="material-symbols-outlined text-tertiary text-2xl">domain</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed-variant">Stable</span>
            </div>
            <p className="text-xs text-on-surface-variant mb-1">Portfolio Occupancy</p>
            <p className="text-2xl font-headline font-bold text-on-surface">{stats.occupancy_rate}%</p>
            <div className="mt-4 flex gap-1 h-1">
              <div className="h-full bg-tertiary-container rounded-l-full" style={{ width: `${stats.occupancy_rate * 0.73}%` }} />
              <div className="h-full bg-tertiary-container/30" style={{ width: '20%' }} />
              <div className="h-full bg-surface-container-high rounded-r-full flex-1" />
            </div>
          </div>
        </section>

        {/* AI Risk Indicator */}
        <section className="bg-surface-container-low rounded-xl p-1 overflow-hidden">
          <div className="primary-gradient p-6 rounded-lg text-on-primary">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined material-symbols-filled text-sm text-on-primary/90">auto_awesome</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">AI Insights</span>
                </div>
                <h2 className="text-xl font-headline font-bold">Predictive Risk Alert</h2>
                <p className="text-sm opacity-80 max-w-xs">
                  {stats.ai_risk_alerts.length} units show a high probability of late payment for next month based on historical behavior.
                </p>
              </div>
              <div className="w-16 h-16 rounded-full border-4 border-white/20 flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold">{stats.ai_risk_alerts[0]?.risk_score}%</span>
              </div>
            </div>
            <button className="mt-6 w-full bg-white text-primary py-3 rounded-xl font-bold text-sm shadow-sm active:scale-95 transition-transform hover:bg-white/90">
              Review At-Risk Tenants
            </button>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="space-y-4">
          <h3 className="text-sm font-headline font-bold px-1">Quick Actions</h3>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {[
              { icon: 'add_home', label: 'New Lease' },
              { icon: 'engineering', label: 'Maintenance' },
              { icon: 'description', label: 'Reports' },
              { icon: 'account_balance', label: 'Bank Sync' },
              { icon: 'settings', label: 'Settings' },
            ].map(a => (
              <button key={a.label} className="flex-shrink-0 flex flex-col items-center gap-2 group">
                <div className="w-14 h-14 bg-surface-container-highest rounded-full flex items-center justify-center group-hover:bg-primary-fixed transition-colors">
                  <span className="material-symbols-outlined text-primary">{a.icon}</span>
                </div>
                <span className="text-[10px] font-semibold text-on-surface">{a.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Upcoming Expirations */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-headline font-bold">Upcoming Expirations</h3>
            <a href="/leases" className="text-[10px] font-bold text-primary hover:underline">View All</a>
          </div>
          <div className="space-y-3">
            {stats.upcoming_expirations.slice(0, 3).map(lease => {
              const days = getDaysUntil(lease.end_date)
              const isExpired = days < 0
              const tenant = TENANTS.find(t => t.id === lease.tenant_id)
              const property = PROPERTIES.find(p => p.id === lease.property_id)
              return (
                <div
                  key={lease.id}
                  className={cn(
                    'bg-surface-container-lowest rounded-xl p-4 flex items-center justify-between hover:shadow-card transition-all cursor-pointer',
                    isExpired && 'border-l-4 border-error/50'
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      isExpired ? 'bg-error-container/30' : 'bg-surface-container-high'
                    )}>
                      <span className={cn('material-symbols-outlined text-lg', isExpired ? 'text-error' : 'text-secondary')}>
                        {isExpired ? 'history_edu' : 'meeting_room'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-on-surface">
                        {tenant?.first_name} {tenant?.last_name} — {property?.name}
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
        </section>

        {/* Revenue Trend + Activity Feed */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Revenue Trend Chart */}
          <div className="bg-surface-container-low rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-headline font-bold">Revenue Trend</h3>
              <div className="flex gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span className="w-2 h-2 rounded-full bg-surface-container-highest" />
              </div>
            </div>
            <div className="flex items-end justify-between h-32 gap-2">
              {stats.revenue_trend.map((item, i) => {
                const maxVal = Math.max(...stats.revenue_trend.map(r => r.amount))
                const heightPct = (item.amount / maxVal) * 100
                const isRecent = i >= 3
                return (
                  <div key={item.day} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={cn('w-full rounded-t-sm transition-all', isRecent ? 'bg-primary' : 'bg-surface-container-high')}
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className="text-[8px] text-on-surface-variant font-medium">{item.day}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="bg-surface-container-low rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-headline font-bold">Recent Activity</h3>
              <span className="text-[10px] font-bold text-primary hover:underline cursor-pointer">View All</span>
            </div>
            <div className="space-y-1">
              {ACTIVITY_FEED.map((item, i) => {
                const iconMap = {
                  maintenance: { icon: 'engineering', color: 'text-tertiary', bg: 'bg-tertiary-container/20' },
                  payment: { icon: 'payments', color: 'text-primary', bg: 'bg-primary-container/20' },
                  message: { icon: 'chat', color: 'text-secondary', bg: 'bg-secondary-container/30' },
                  lease: { icon: 'description', color: 'text-primary', bg: 'bg-primary-container/10' },
                  announcement: { icon: 'campaign', color: 'text-tertiary', bg: 'bg-tertiary-container/20' },
                }
                const style = iconMap[item.type]
                return (
                  <div key={item.id} className={cn('flex items-start gap-3 py-2.5', i < ACTIVITY_FEED.length - 1 && 'border-b border-outline-variant/30')}>
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5', style.bg)}>
                      <span className={cn('material-symbols-outlined text-sm', style.color)}>{style.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-on-surface leading-tight">{item.title}</p>
                      <p className="text-[10px] text-on-surface-variant mt-0.5 leading-tight truncate">{item.description}</p>
                    </div>
                    <span className="text-[10px] text-on-surface-variant font-medium flex-shrink-0">{item.time_label}</span>
                  </div>
                )
              })}
            </div>
          </div>

        </section>

      </div>
    </AppLayout>
  )
}

import AppLayout from '@/components/layout/AppLayout'
import { LEASES, TENANTS, PROPERTIES } from '@/data/mock'
import { formatCurrency, formatDate, getDaysUntil, getStatusColor, cn } from '@/lib/utils'

export default function LeasesPage() {
  const activeLeases = LEASES.filter(l => l.status === 'active' || l.status === 'expired')
  const featured = LEASES[0]
  const featuredTenant = TENANTS.find(t => t.id === featured.tenant_id)

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 md:px-12 py-8">

        <div className="mb-8">
          <h1 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight mb-2">Lease Management</h1>
          <p className="text-on-surface-variant">Review expiring contracts and AI-driven renewal insights.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">

          {/* Lease List */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold font-headline">Active Leases</h2>
              <span className="text-sm text-primary font-semibold">{activeLeases.length} Total Leases</span>
            </div>
            {activeLeases.map(lease => {
              const tenant = TENANTS.find(t => t.id === lease.tenant_id)
              const property = PROPERTIES.find(p => p.id === lease.property_id)
              const days = getDaysUntil(lease.end_date)
              const isExpired = days < 0
              const isUrgent = !isExpired && days <= 30
              return (
                <div key={lease.id} className="bg-surface-container-lowest rounded-xl p-5 flex items-center justify-between group cursor-pointer hover:bg-surface-container-low transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-lg bg-surface-container-high flex items-center justify-center text-xl font-bold text-primary">
                      {tenant?.first_name[0]}{tenant?.last_name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-on-surface">{property?.name}, Unit ••</p>
                      <p className="text-sm text-on-surface-variant">Tenant: {tenant?.first_name} {tenant?.last_name}</p>
                    </div>
                  </div>
                  <div className="hidden md:block text-right px-6">
                    <p className="text-sm text-on-surface-variant">Monthly Rent</p>
                    <p className="font-bold text-on-surface">{formatCurrency(lease.rent_amount)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-on-surface-variant">Expires</p>
                    <p className={cn('font-bold', isExpired || isUrgent ? 'text-error' : 'text-on-surface')}>
                      {formatDate(lease.end_date, 'MMM dd, yyyy')}
                    </p>
                    {(isExpired || isUrgent) && (
                      <p className="text-[10px] text-error font-semibold mt-0.5">
                        {isExpired ? `${Math.abs(days)}d overdue` : `${days}d left`}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* AI Renewal Predictor */}
          <div className="lg:col-span-4">
            <div className="bg-primary-container/10 rounded-2xl p-6 h-full">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-primary material-symbols-filled">auto_awesome</span>
                <h3 className="font-bold font-headline text-primary">Renewal Predictor</h3>
              </div>
              <div className="space-y-5">
                {[
                  { name: 'Skyline Tower 402', likelihood: 28, tag: 'Low Likelihood', tagColor: 'bg-tertiary-container/30 text-on-tertiary-fixed-variant', barColor: 'bg-tertiary', note: 'AI detected inquiries about local competitors.' },
                  { name: 'Vila Rosa Unit B', likelihood: 92, tag: 'High Likelihood', tagColor: 'bg-secondary-container text-on-secondary-container', barColor: 'bg-primary', note: 'Consistent early payments and positive feedback.' },
                ].map(item => (
                  <div key={item.name} className="bg-surface-container-lowest p-4 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-on-surface">{item.name}</span>
                      <span className={cn('text-xs px-2 py-0.5 rounded-full font-semibold', item.tagColor)}>{item.tag}</span>
                    </div>
                    <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                      <div className={cn('h-full rounded-full transition-all', item.barColor)} style={{ width: `${item.likelihood}%` }} />
                    </div>
                    <p className="text-[11px] text-on-surface-variant mt-2 leading-relaxed">{item.note}</p>
                  </div>
                ))}
                <button className="w-full py-3 primary-gradient text-on-primary rounded-xl font-bold text-sm shadow-primary">
                  Bulk Renewal Campaign
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lease Detail View */}
        <div className="bg-surface-container-low rounded-3xl p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Document Preview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold font-headline text-lg">Lease Document Preview</h3>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-surface-container-high rounded-lg transition-colors">
                    <span className="material-symbols-outlined text-on-surface-variant">download</span>
                  </button>
                  <button className="p-2 hover:bg-surface-container-high rounded-lg transition-colors">
                    <span className="material-symbols-outlined text-on-surface-variant">print</span>
                  </button>
                </div>
              </div>
              <div className="aspect-[3/4] bg-white rounded-xl shadow-sm p-10 relative overflow-hidden">
                <div className="space-y-6">
                  <div className="flex justify-between border-b border-slate-100 pb-4">
                    <div className="w-24 h-4 bg-slate-200 rounded" />
                    <div className="w-32 h-4 bg-slate-100 rounded" />
                  </div>
                  <div className="w-3/4 h-8 bg-slate-200 rounded mb-8" />
                  <div className="space-y-2">
                    {[1,2,3,4].map(i => <div key={i} className={cn('h-3 bg-slate-100 rounded', i === 4 ? 'w-5/6' : 'w-full')} />)}
                  </div>
                  <div className="pt-6 space-y-2">
                    <div className="w-1/3 h-4 bg-slate-200 rounded" />
                    <div className="w-full h-3 bg-slate-100 rounded" />
                    <div className="w-full h-3 bg-slate-100 rounded" />
                  </div>
                </div>
                {/* AI Detected Clause Overlay */}
                <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 py-4 bg-blue-50/90 backdrop-blur-sm border-y border-blue-100 px-10">
                  <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-1">AI Detected Clause</p>
                  <p className="text-sm font-semibold text-primary">Rent escalation clause: 3.5% annual increase on Jan 1st.</p>
                </div>
              </div>
            </div>

            {/* Key Dates & Renewal Roadmap */}
            <div className="flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-primary">description</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface">L-88290 Contract Details</h4>
                    <p className="text-sm text-on-surface-variant">Residential Lease Agreement</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  {[
                    { label: 'Execution Date', value: 'Oct 01, 2023' },
                    { label: 'Term Length', value: '12 Months' },
                    { label: 'Security Deposit', value: formatCurrency(featured.security_deposit) },
                    { label: 'Status', value: '🟢 Active' },
                  ].map(item => (
                    <div key={item.label} className="p-4 bg-white rounded-2xl shadow-sm">
                      <p className="text-xs text-on-surface-variant font-medium mb-1">{item.label}</p>
                      <p className="font-bold text-on-surface">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h5 className="font-bold text-xs uppercase tracking-wider text-on-surface-variant">Renewal Roadmap</h5>
                  <div className="relative pl-6 space-y-5 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:bg-outline-variant">
                    {[
                      { label: '90-Day Notice Window', date: 'July 12, 2024 (Completed)', active: true },
                      { label: '60-Day Offer Generation', date: 'Aug 12, 2024 (In Progress)', active: true, dim: false },
                      { label: '30-Day Final Execution', date: 'Sept 12, 2024', active: false, dim: true },
                    ].map((step, i) => (
                      <div key={i} className={cn('relative', step.dim && 'opacity-50')}>
                        <div className={cn('absolute -left-[27px] top-1.5 w-3 h-3 rounded-full border-2 border-white shadow-sm', step.active ? 'bg-primary' : 'bg-outline-variant')} />
                        <p className="font-bold text-sm text-on-surface">{step.label}</p>
                        <p className="text-xs text-on-surface-variant">{step.date}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-outline-variant/20 flex gap-4">
                <button className="flex-1 py-4 bg-white text-on-surface rounded-2xl font-bold text-sm hover:bg-surface-container-high transition-colors">Edit Terms</button>
                <button className="flex-1 py-4 primary-gradient text-on-primary rounded-2xl font-bold text-sm shadow-primary">Renew Now</button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action Bar */}
        <div className="mt-6 flex justify-center">
          <div className="bg-surface-container-lowest/90 backdrop-blur-2xl rounded-3xl p-4 shadow-modal border border-white/20 flex justify-around items-center gap-4">
            {[
              { icon: 'add_box', label: 'New Lease' },
              { icon: 'history', label: 'History' },
              { icon: 'mail', label: 'Notify All' },
              { icon: 'analytics', label: 'Reports' },
            ].map(a => (
              <button key={a.label} className="flex flex-col items-center gap-1 p-2 group">
                <div className="w-12 h-12 bg-surface-container-high rounded-2xl flex items-center justify-center group-hover:bg-primary-fixed group-active:scale-90 transition-all">
                  <span className="material-symbols-outlined text-primary">{a.icon}</span>
                </div>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">{a.label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </AppLayout>
  )
}

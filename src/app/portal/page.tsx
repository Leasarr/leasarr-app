import AppLayout from '@/components/layout/AppLayout'
import { formatCurrency } from '@/lib/utils'

export default function TenantPortalPage() {
  return (
    <AppLayout>
      <div className="max-w-md mx-auto px-6 py-8 space-y-8">

        {/* Welcome */}
        <section className="space-y-1">
          <p className="text-on-surface-variant font-medium text-sm">Welcome back, Alex</p>
          <h1 className="text-3xl font-headline font-extrabold tracking-tight text-on-surface">Skyline Heights, 4B</h1>
        </section>

        {/* Balance Hero Card */}
        <section className="relative overflow-hidden rounded-[2rem] p-8 text-white shadow-2xl" style={{ background: 'linear-gradient(135deg, #003d9b 0%, #0052cc 100%)' }}>
          <div className="relative z-10">
            <p className="text-white/80 font-medium text-sm mb-1">Current Balance</p>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-4xl font-headline font-extrabold tracking-tighter">$2,450</span>
              <span className="text-white/90 font-semibold">.00</span>
            </div>
            <button className="w-full py-4 bg-white text-primary font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg hover:bg-white/95">
              <span className="material-symbols-outlined">payments</span>
              Pay Rent
            </button>
            <p className="text-center mt-4 text-xs text-white/70">Due by October 1st, 2024</p>
          </div>
          {/* Decorative */}
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        </section>

        {/* Quick Actions Bento */}
        <section className="grid grid-cols-2 gap-4">
          {/* Maintenance - full width */}
          <div className="col-span-2 bg-surface-container-low p-5 rounded-[1.5rem] flex items-center justify-between group active:bg-surface-container transition-colors cursor-pointer hover:shadow-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-tertiary-fixed flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined">build</span>
              </div>
              <div>
                <h3 className="font-bold text-on-surface">Maintenance</h3>
                <p className="text-xs text-on-surface-variant">Request a repair</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-outline">chevron_right</span>
          </div>

          {/* Lease */}
          <div className="bg-surface-container-low p-5 rounded-[1.5rem] space-y-3 active:bg-surface-container transition-colors cursor-pointer hover:shadow-card">
            <div className="w-10 h-10 rounded-lg bg-secondary-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined">description</span>
            </div>
            <div>
              <h3 className="font-bold text-on-surface text-sm">Lease</h3>
              <p className="text-[10px] text-on-surface-variant">View documents</p>
            </div>
          </div>

          {/* Receipts */}
          <div className="bg-surface-container-low p-5 rounded-[1.5rem] space-y-3 active:bg-surface-container transition-colors cursor-pointer hover:shadow-card">
            <div className="w-10 h-10 rounded-lg bg-secondary-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined">receipt_long</span>
            </div>
            <div>
              <h3 className="font-bold text-on-surface text-sm">Receipts</h3>
              <p className="text-[10px] text-on-surface-variant">History & Tax</p>
            </div>
          </div>
        </section>

        {/* AI Smart Insight */}
        <section className="bg-white p-6 rounded-[1.5rem] shadow-card border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">AI Smart Insight</span>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <h3 className="text-lg font-bold text-on-surface leading-tight">Renewal Likelihood</h3>
              <span className="text-2xl font-headline font-black text-primary">94%</span>
            </div>
            <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: '94%' }} />
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Based on your on-time payments and low maintenance volume, you're eligible for a{' '}
              <span className="font-bold text-on-surface">Priority Rate Lock</span> for 2025.
            </p>
            <button className="text-primary font-bold text-sm flex items-center gap-1 group hover:underline">
              Learn more
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </div>
        </section>

        {/* Building Manager Card */}
        <section className="flex items-center gap-4 p-4 bg-surface-container-lowest rounded-2xl shadow-card">
          <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-primary font-bold flex-shrink-0">
            AM
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-sm text-on-surface">Building Manager</h4>
            <p className="text-xs text-on-surface-variant">Alexander Morgan • Available</p>
          </div>
          <button className="w-10 h-10 rounded-full bg-blue-50 text-primary flex items-center justify-center active:scale-90 transition-transform hover:bg-primary-fixed">
            <span className="material-symbols-outlined text-sm material-symbols-filled">chat_bubble</span>
          </button>
        </section>

        {/* Recent Transactions */}
        <section>
          <h2 className="text-lg font-bold text-on-surface mb-4">Recent Transactions</h2>
          <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-card">
            {[
              { desc: 'October 2024 Rent', amount: 2450, status: 'paid', date: 'Oct 1, 2024' },
              { desc: 'September 2024 Rent', amount: 2450, status: 'paid', date: 'Sep 1, 2024' },
              { desc: 'Plumbing Repair Credit', amount: -125, status: 'credit', date: 'Aug 12, 2024' },
            ].map((tx, i) => (
              <div key={i} className="p-4 flex items-center justify-between border-b last:border-b-0 border-surface-container hover:bg-surface-container-low/30 transition-colors">
                <div>
                  <p className="font-semibold text-sm text-on-surface">{tx.desc}</p>
                  <p className="text-xs text-on-surface-variant">{tx.date}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-sm ${tx.amount < 0 ? 'text-primary' : 'text-on-surface'}`}>
                    {tx.amount < 0 ? `-${formatCurrency(Math.abs(tx.amount))}` : formatCurrency(tx.amount)}
                  </p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    tx.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {tx.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </AppLayout>
  )
}

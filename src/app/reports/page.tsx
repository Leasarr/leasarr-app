'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { REPORT_DATA } from '@/data/mock'
import { formatCurrency, cn } from '@/lib/utils'
import { useTheme } from '@/context/ThemeContext'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function ReportsPage() {
  const data = REPORT_DATA
  const { theme } = useTheme()

  const [chartColors, setChartColors] = useState({
    primary: '#003d9b',
    primaryContainer: '#0052cc',
    primaryFixed: '#dae2ff',
    outlineVariant: '#c3c6d6',
    onSurfaceVariant: '#434654',
    surfaceContainerLowest: '#ffffff',
    successContainer: '#d1fae5',
    onSuccessContainer: '#047857',
  })

  useEffect(() => {
    const s = getComputedStyle(document.documentElement)
    const rgb = (name: string) => `rgb(${s.getPropertyValue(`--color-${name}`).trim()})`
    setChartColors({
      primary: rgb('primary'),
      primaryContainer: rgb('primary-container'),
      primaryFixed: rgb('primary-fixed'),
      outlineVariant: rgb('outline-variant'),
      onSurfaceVariant: rgb('on-surface-variant'),
      surfaceContainerLowest: rgb('surface-container-lowest'),
      successContainer: rgb('success-container'),
      onSuccessContainer: rgb('on-success-container'),
    })
  }, [theme])

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">

        {/* Header */}
        <header className="mb-2">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl md:text-3xl font-headline font-extrabold text-on-surface tracking-tight">Performance</h1>
            <span className="text-sm font-semibold text-primary px-3 py-1 bg-primary/10 rounded-full">{data.period}</span>
          </div>
          <p className="text-on-surface-variant text-sm">Detailed portfolio yield and occupancy insights.</p>
        </header>

        {/* Bento Grid Stats */}
        <div className="grid grid-cols-2 gap-4">

          {/* Monthly Income - Spans full */}
          <div className="col-span-2 bg-surface-container-lowest p-6 rounded-xl shadow-card flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Monthly Income</span>
              <div className="text-4xl font-headline font-extrabold text-primary mt-1">{formatCurrency(data.monthly_income)}</div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="badge bg-success-container text-on-success-container flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">trending_up</span>
                +{data.income_growth}%
              </span>
              <span className="text-on-surface-variant text-[10px] font-medium">vs last month</span>
            </div>
            {/* Mini Area Chart */}
            <div className="h-16 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.monthly_trend} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.25}/>
                      <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="income" stroke={chartColors.primary} strokeWidth={2} fill="url(#incomeGrad)" dot={false}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Occupancy */}
          <div className="bg-surface-container-low p-5 rounded-xl flex flex-col gap-2 shadow-card">
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Occupancy</span>
            <div className="text-2xl font-bold font-headline text-on-surface">{data.occupancy_rate}%</div>
            <div className="w-full bg-outline-variant/30 h-1.5 rounded-full mt-2">
              <div className="bg-primary h-full rounded-full" style={{ width: `${data.occupancy_rate}%` }} />
            </div>
          </div>

          {/* Yield */}
          <div className="bg-surface-container-low p-5 rounded-xl flex flex-col gap-2 shadow-card">
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Yield</span>
            <div className="text-2xl font-bold font-headline text-on-surface">{data.portfolio_yield}%</div>
            <div className="flex items-center gap-1 mt-auto">
              <span className="material-symbols-outlined text-sm text-primary material-symbols-filled">stars</span>
              <span className="text-[10px] font-semibold text-on-surface-variant">Top 5% Market</span>
            </div>
          </div>

          {/* NOI */}
          <div className="bg-surface-container-low p-5 rounded-xl flex flex-col gap-2 shadow-card">
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Net Operating Income</span>
            <div className="text-2xl font-bold font-headline text-on-surface">{formatCurrency(data.net_operating_income)}</div>
            <span className="text-[10px] text-on-success-container font-semibold">After {formatCurrency(data.maintenance_costs)} expenses</span>
          </div>

          {/* Vacancy */}
          <div className="bg-surface-container-low p-5 rounded-xl flex flex-col gap-2 shadow-card">
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Vacant Units</span>
            <div className="text-2xl font-bold font-headline text-on-surface">{data.vacant_units}</div>
            <span className="text-[10px] text-on-surface-variant">of {data.total_units} total units</span>
          </div>
        </div>

        {/* Revenue vs Expenses Trend */}
        <section>
          <h2 className="text-base md:text-lg font-bold mb-4 text-on-surface">Revenue & Expense Trends</h2>
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-card">
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthly_trend} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.outlineVariant} vertical={false}/>
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: chartColors.onSurfaceVariant }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fontSize: 11, fill: chartColors.onSurfaceVariant }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`}/>
                  <Tooltip
                    contentStyle={{ background: chartColors.surfaceContainerLowest, border: `1px solid ${chartColors.outlineVariant}`, borderRadius: 12, fontSize: 12 }}
                    formatter={(val: number) => [formatCurrency(val), '']}
                  />
                  <Bar dataKey="income" fill={chartColors.primary} radius={[4,4,0,0]} name="Revenue"/>
                  <Bar dataKey="expenses" fill={chartColors.primaryFixed} radius={[4,4,0,0]} name="Expenses"/>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 mt-3 justify-center">
              <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                <div className="w-3 h-3 rounded-sm bg-primary" /> Revenue
              </div>
              <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                <div className="w-3 h-3 rounded-sm bg-primary-fixed" /> Expenses
              </div>
            </div>
          </div>
        </section>

        {/* Revenue by Property */}
        <section>
          <h2 className="text-base md:text-lg font-bold mb-4 text-on-surface">Revenue by Property</h2>
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-card">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="h-48 w-full md:w-48 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.revenue_by_property} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="amount" paddingAngle={2}>
                      {data.revenue_by_property.map((_entry, i) => {
                        const pieColors = [chartColors.primary, chartColors.primaryContainer, chartColors.primaryFixed]
                        return <Cell key={i} fill={pieColors[i % pieColors.length]} />
                      })}
                    </Pie>
                    <Tooltip formatter={(val: number) => [formatCurrency(val), '']} contentStyle={{ borderRadius: 8, fontSize: 12 }}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-3 w-full">
                {data.revenue_by_property.map((p, i) => {
                  const pieColors = [chartColors.primary, chartColors.primaryContainer, chartColors.primaryFixed]
                  const total = data.revenue_by_property.reduce((s, x) => s + x.amount, 0)
                  const pct = Math.round((p.amount / total) * 100)
                  return (
                    <div key={p.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold text-on-surface">{p.name}</span>
                        <span className="font-bold text-on-surface">{formatCurrency(p.amount)}</span>
                      </div>
                      <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: pieColors[i % pieColors.length] }} />
                      </div>
                      <span className="text-[10px] text-on-surface-variant">{pct}% of total</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Key Insights */}
        <section>
          <h2 className="text-base md:text-lg font-bold mb-4 text-on-surface">Key Insights</h2>
          <div className="space-y-4">
            {data.key_insights.map((insight, i) => (
              <div key={i} className={cn(
                'p-4 rounded-xl flex gap-4 items-start',
                insight.type === 'positive' ? 'bg-tertiary-container/10' : 'bg-secondary-container'
              )}>
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                  insight.type === 'positive' ? 'bg-tertiary-container text-white' : 'bg-secondary text-white'
                )}>
                  <span className="material-symbols-outlined text-sm">
                    {insight.type === 'positive' ? 'trending_up' : 'warning'}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-on-surface">{insight.title}</h3>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{insight.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </AppLayout>
  )
}

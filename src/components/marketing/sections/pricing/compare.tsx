'use client'
import React from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { SectionHeader } from '@/components/marketing/ui/section-header'
import { FadeIn } from '@/components/marketing/ui/fade-in'
import { COMPARE_ROWS, PRICING_TIERS } from '@/lib/marketing/pricing'
import { usePricing } from './context'
import type { CellValue } from '@/lib/marketing/pricing'

function Cell({ value }: { value: CellValue }) {
  if (value === true) {
    return <span className="material-symbols-outlined text-xl text-primary">check</span>
  }
  if (value === false || value === '—') {
    return <span className="text-on-surface-variant text-lg leading-none">—</span>
  }
  if (value === 'Add-on') {
    return <Badge variant="neutral">Add-on</Badge>
  }
  return <span className="text-sm font-medium text-on-surface">{value}</span>
}

export function CompareTable() {
  const { billingInterval } = usePricing()

  const groups = COMPARE_ROWS.reduce<Record<string, typeof COMPARE_ROWS>>((acc, row) => {
    if (!acc[row.group]) acc[row.group] = []
    acc[row.group].push(row)
    return acc
  }, {})

  return (
    <section className="bg-surface-container-low py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16">
        <FadeIn>
          <SectionHeader heading="Compare every feature" align="center" className="mb-12" />
        </FadeIn>
        <FadeIn delay={80}>
          <div className="overflow-x-auto rounded-2xl border border-outline-variant/40 bg-surface-container-lowest">
            <table className="w-full min-w-[640px] border-collapse">
              <thead>
                <tr className="sticky top-16 z-10 bg-surface-container-lowest">
                  <th className="text-left p-4 lg:p-6 border-b border-outline-variant/40 w-[34%]" />
                  {PRICING_TIERS.map(tier => (
                    <th key={tier.key} className="p-4 lg:p-6 text-center border-b border-outline-variant/40">
                      <div className="font-headline font-bold text-on-surface">{tier.name}</div>
                      {tier.monthly !== null ? (
                        <div className="text-xs text-on-surface-variant mt-0.5">
                          ${billingInterval === 'annual' && tier.annualMonthly
                            ? tier.annualMonthly.toFixed(2)
                            : tier.monthly}/mo
                        </div>
                      ) : (
                        <div className="text-xs text-on-surface-variant mt-0.5">Custom</div>
                      )}
                      {tier.key !== 'enterprise' ? (
                        <Link
                          href={`${tier.ctaHref}&billing=${billingInterval}`}
                          className="mt-2 inline-block text-xs font-semibold text-primary hover:underline"
                        >
                          Start free →
                        </Link>
                      ) : (
                        <a
                          href={tier.ctaHref}
                          className="mt-2 inline-block text-xs font-semibold text-primary hover:underline"
                        >
                          Talk to sales →
                        </a>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(groups).map(([group, rows]) => (
                  <React.Fragment key={group}>
                    <tr className="bg-surface-container-low/60">
                      <td
                        colSpan={5}
                        className="px-4 lg:px-6 py-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant"
                      >
                        {group}
                      </td>
                    </tr>
                    {rows.map(row => (
                      <tr
                        key={row.label}
                        className="border-t border-outline-variant/20 hover:bg-surface-container-low/30 transition-colors"
                      >
                        <td className="px-4 lg:px-6 py-4 text-sm text-on-surface">{row.label}</td>
                        {row.values.map((v, ci) => (
                          <td key={ci} className="px-4 lg:px-6 py-4 text-center">
                            <div className="flex justify-center items-center">
                              <Cell value={v} />
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

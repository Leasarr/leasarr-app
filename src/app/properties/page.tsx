'use client'

import { useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { PROPERTIES } from '@/data/mock'
import { formatCurrency, cn } from '@/lib/utils'
import type { Property } from '@/types'

const UNITS = [
  { id: 'u1', number: '4A', type: '2 Bed • 2 Bath', tenant: 'Alexander Graham', rent: 4250, status: 'occupied' },
  { id: 'u2', number: '4B', type: '1 Bed • 1 Bath', tenant: 'Sarah J. Miller', rent: 3100, status: 'occupied' },
  { id: 'u3', number: '5A', type: 'Penthouse • 3 Bed', tenant: 'Ready for Showing', rent: 8900, status: 'vacant' },
  { id: 'u4', number: '5B', type: 'Studio Loft', tenant: 'Marcus Chen', rent: 2450, status: 'occupied' },
]

export default function PropertiesPage() {
  const [selected, setSelected] = useState<Property>(PROPERTIES[0])

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-headline font-extrabold tracking-tight text-on-surface">Properties</h1>
            <p className="text-on-surface-variant mt-2 font-medium">Manage {PROPERTIES.length} active real estate assets</p>
            <div className="flex gap-2 mt-2">
              <span className="badge bg-surface-container-high text-on-surface-variant text-[10px]">
                {PROPERTIES.filter(p => p.type !== 'commercial').length} Residential
              </span>
              <span className="badge bg-primary-container/30 text-primary text-[10px]">
                <span className="material-symbols-outlined text-[10px] mr-0.5">business</span>
                {PROPERTIES.filter(p => p.type === 'commercial').length} Commercial
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="btn-secondary h-14 px-6">
              <span className="material-symbols-outlined">filter_list</span> Filter
            </button>
            <button className="btn-primary h-14 px-8">
              <span className="material-symbols-outlined">add</span> Add Property
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left: Property List */}
          <div className="lg:col-span-5 space-y-4">
            {PROPERTIES.map(property => (
              <button
                key={property.id}
                onClick={() => setSelected(property)}
                className={cn(
                  'w-full bg-surface-container-lowest rounded-xl p-3 group cursor-pointer hover:bg-white transition-all text-left',
                  selected.id === property.id && 'ring-2 ring-primary/30 shadow-md'
                )}
              >
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container-high">
                    {property.image_url ? (
                      <img
                        src={property.image_url}
                        alt={property.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-outline text-3xl">domain</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-grow flex flex-col justify-center py-1">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-lg text-on-surface leading-tight">{property.name}</h3>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className={cn(
                          'badge',
                          property.occupancy_rate === 100 ? 'bg-tertiary-container/20 text-on-tertiary-fixed-variant' : 'bg-secondary-container text-on-secondary-container'
                        )}>
                          {property.occupancy_rate === 100 ? 'Full' : 'Active'}
                        </span>
                        <span className={cn(
                          'badge capitalize',
                          property.type === 'commercial' ? 'bg-primary-container/30 text-primary' : 'bg-surface-container-high text-on-surface-variant'
                        )}>
                          {property.type === 'commercial' ? (
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[10px]">business</span>
                              Commercial
                            </span>
                          ) : property.type}
                        </span>
                      </div>
                    </div>
                    <p className="text-on-surface-variant text-sm">{property.total_units} Units • {property.occupancy_rate}% Occupied</p>
                    <div className="mt-2 flex items-center gap-1 text-primary font-semibold text-xs">
                      <span className="material-symbols-outlined text-sm">location_on</span>
                      {property.city}, {property.state}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Right: Detail Canvas */}
          <div className="lg:col-span-7">
            <div className="bg-surface-container-low rounded-[2rem] p-8 min-h-[600px] flex flex-col">

              {/* Detail Header */}
              <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-primary font-bold tracking-widest text-xs uppercase">Detail View</span>
                    <span className={cn(
                      'badge capitalize',
                      selected.type === 'commercial' ? 'bg-primary-container/30 text-primary' : 'bg-surface-container-high text-on-surface-variant'
                    )}>
                      {selected.type === 'commercial' && (
                        <span className="material-symbols-outlined text-[10px] mr-0.5">business</span>
                      )}
                      {selected.type}
                    </span>
                  </div>
                  <h2 className="text-3xl font-headline font-extrabold text-on-surface">{selected.name}</h2>
                  <p className="text-on-surface-variant">{selected.address}, {selected.city}, {selected.state} {selected.zip}</p>
                </div>
                <div className="flex gap-2">
                  <button className="w-12 h-12 rounded-full bg-surface-container-lowest text-on-surface flex items-center justify-center hover:bg-white transition-colors shadow-sm">
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                  <button className="w-12 h-12 rounded-full bg-surface-container-lowest text-on-surface flex items-center justify-center hover:bg-white transition-colors shadow-sm">
                    <span className="material-symbols-outlined">share</span>
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Monthly Rent', value: formatCurrency(selected.monthly_revenue ?? 0) },
                  { label: 'Occupancy', value: `${selected.occupancy_rate}%` },
                  { label: 'Units Total', value: String(selected.total_units) },
                  { label: 'Yield (YoY)', value: '+4.8%' },
                ].map(stat => (
                  <div key={stat.label} className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">{stat.label}</p>
                    <p className="text-xl font-extrabold text-primary">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Units Portfolio */}
              <div className="flex-grow bg-surface-container-lowest rounded-3xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-on-surface">Units Portfolio</h3>
                  <button className="text-sm font-bold text-primary flex items-center gap-1 hover:underline">
                    View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {UNITS.map(unit => (
                    <div
                      key={unit.id}
                      className="flex items-center justify-between py-3 hover:bg-surface-container-low rounded-xl px-4 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm',
                          unit.status === 'vacant' ? 'bg-tertiary-container/10 text-tertiary' : 'bg-primary-container/10 text-primary'
                        )}>
                          {unit.number}
                        </div>
                        <div>
                          <p className="font-bold text-on-surface text-sm">{unit.type}</p>
                          <p className={cn('text-xs', unit.status === 'vacant' ? 'text-tertiary font-medium' : 'text-on-surface-variant')}>
                            {unit.status === 'vacant' ? 'Ready for Showing' : `Tenant: ${unit.tenant}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-on-surface text-sm">{formatCurrency(unit.rent)}</p>
                        <span className="text-[10px] font-bold text-secondary flex items-center justify-end gap-1">
                          <span className={cn(
                            'w-1.5 h-1.5 rounded-full',
                            unit.status === 'occupied' ? 'bg-emerald-500' : 'bg-amber-500'
                          )} />
                          {unit.status === 'occupied' ? 'Occupied' : 'Vacant'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAB */}
      <button className="fixed bottom-24 lg:bottom-8 right-6 lg:right-8 w-16 h-16 rounded-full primary-gradient text-on-primary shadow-fab flex items-center justify-center active:scale-90 transition-transform z-40">
        <span className="material-symbols-outlined text-3xl">add_home</span>
      </button>
    </AppLayout>
  )
}

'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { formatCurrency, cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'

type DbUnit = {
  id: string
  unit_number: string
  bedrooms: number
  bathrooms: number
  sqft: number | null
  rent_amount: number
  status: 'occupied' | 'vacant' | 'maintenance'
}

type PropertyRow = {
  id: string
  name: string
  address: string
  city: string
  state: string
  zip: string
  type: 'apartment' | 'house' | 'condo' | 'commercial'
  image_url: string | null
  manager_id: string
  created_at: string
  updated_at: string
  units: DbUnit[]
}

function getStats(p: PropertyRow) {
  const total = p.units.length
  const occupied = p.units.filter(u => u.status === 'occupied').length
  const revenue = p.units.filter(u => u.status === 'occupied').reduce((sum, u) => sum + u.rent_amount, 0)
  const occupancy = total > 0 ? Math.round((occupied / total) * 1000) / 10 : 0
  return { total, occupied, revenue, occupancy }
}

export default function PropertiesPage() {
  const { profile } = useAuth()
  const supabase = createClient()
  const [properties, setProperties] = useState<PropertyRow[]>([])
  const [selected, setSelected] = useState<PropertyRow | null>(null)
  const [detailTab, setDetailTab] = useState<'units' | 'applications'>('units')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    async function fetchProperties() {
      const { data } = await supabase
        .from('properties')
        .select('*, units(*)')
        .eq('manager_id', profile!.id)
        .order('created_at', { ascending: false })
      if (data && data.length > 0) {
        setProperties(data)
        setSelected(data[0])
      }
      setLoading(false)
    }
    fetchProperties()
  }, [profile])

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <span className="material-symbols-outlined text-4xl text-primary animate-pulse">domain</span>
            <p className="text-on-surface-variant mt-2">Loading properties...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (!selected) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-20 h-20 bg-surface-container rounded-3xl flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-4xl text-outline">domain_add</span>
          </div>
          <h2 className="text-2xl font-headline font-bold text-on-surface">No properties yet</h2>
          <p className="text-on-surface-variant mt-2">Add your first property to get started.</p>
          <button className="btn-primary mt-6 px-8 h-12">
            <span className="material-symbols-outlined">add</span> Add Property
          </button>
        </div>
      </AppLayout>
    )
  }

  const selectedStats = getStats(selected)
  const residentialCount = properties.filter(p => p.type !== 'commercial').length
  const commercialCount = properties.filter(p => p.type === 'commercial').length

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-headline font-extrabold tracking-tight text-on-surface">Properties</h1>
            <p className="text-on-surface-variant mt-2 font-medium">Manage {properties.length} active real estate assets</p>
            <div className="flex gap-2 mt-2">
              <span className="badge bg-surface-container-high text-on-surface-variant text-[10px]">
                {residentialCount} Residential
              </span>
              <span className="badge bg-primary-container/30 text-primary text-[10px]">
                <span className="material-symbols-outlined text-[10px] mr-0.5">business</span>
                {commercialCount} Commercial
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
            {properties.map(property => {
              const stats = getStats(property)
              return (
                <button
                  key={property.id}
                  onClick={() => { setSelected(property); setDetailTab('units') }}
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
                            stats.occupancy === 100 ? 'bg-tertiary-container/20 text-on-tertiary-fixed-variant' : 'bg-secondary-container text-on-secondary-container'
                          )}>
                            {stats.occupancy === 100 ? 'Full' : 'Active'}
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
                      <p className="text-on-surface-variant text-sm">{stats.total} Units • {stats.occupancy}% Occupied</p>
                      <div className="flex items-center mt-2">
                        <div className="flex items-center gap-1 text-primary font-semibold text-xs">
                          <span className="material-symbols-outlined text-sm">location_on</span>
                          {property.city}, {property.state}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Right: Detail Canvas */}
          <div className="lg:col-span-7">
            <div className="bg-surface-container-low rounded-[2rem] p-8 min-h-[600px] flex flex-col">

              {/* Detail Header */}
              <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Monthly Rent', value: formatCurrency(selectedStats.revenue) },
                  { label: 'Occupancy', value: `${selectedStats.occupancy}%` },
                  { label: 'Units Total', value: String(selectedStats.total) },
                  { label: 'Occupied', value: String(selectedStats.occupied) },
                ].map(stat => (
                  <div key={stat.label} className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">{stat.label}</p>
                    <p className="text-xl font-extrabold text-primary">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Tab Switcher */}
              <div className="flex gap-1 bg-surface-container rounded-xl p-1 w-fit mb-6">
                <button
                  onClick={() => setDetailTab('units')}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all',
                    detailTab === 'units'
                      ? 'bg-surface-container-lowest text-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  )}
                >
                  <span className="material-symbols-outlined text-base">apartment</span>
                  Units
                </button>
                <button
                  onClick={() => setDetailTab('applications')}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all',
                    detailTab === 'applications'
                      ? 'bg-surface-container-lowest text-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  )}
                >
                  <span className="material-symbols-outlined text-base">assignment_ind</span>
                  Applications
                </button>
              </div>

              {/* Units Tab */}
              {detailTab === 'units' && (
                <div className="flex-grow bg-surface-container-lowest rounded-3xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-on-surface mb-6">Units Portfolio</h3>
                  {selected.units.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-16 h-16 bg-surface-container rounded-2xl flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-3xl text-outline">apartment</span>
                      </div>
                      <p className="font-bold text-on-surface">No units added yet</p>
                      <p className="text-sm text-on-surface-variant mt-1">Add units to this property in Supabase to see them here.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selected.units.map(unit => (
                        <div
                          key={unit.id}
                          className="flex items-center justify-between py-3 hover:bg-surface-container-low rounded-xl px-4 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              'w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm',
                              unit.status === 'vacant' ? 'bg-tertiary-container/10 text-tertiary' : 'bg-primary-container/10 text-primary'
                            )}>
                              {unit.unit_number}
                            </div>
                            <div>
                              <p className="font-bold text-on-surface text-sm">
                                {unit.bedrooms} Bed • {unit.bathrooms} Bath{unit.sqft ? ` • ${unit.sqft} sqft` : ''}
                              </p>
                              <p className={cn('text-xs', unit.status === 'vacant' ? 'text-tertiary font-medium' : 'text-on-surface-variant')}>
                                {unit.status === 'vacant' ? 'Ready for Showing' : unit.status === 'maintenance' ? 'Under Maintenance' : 'Occupied'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-on-surface text-sm">{formatCurrency(unit.rent_amount)}</p>
                            <span className="text-[10px] font-bold text-secondary flex items-center justify-end gap-1">
                              <span className={cn(
                                'w-1.5 h-1.5 rounded-full',
                                unit.status === 'occupied' ? 'bg-emerald-500' : unit.status === 'maintenance' ? 'bg-amber-500' : 'bg-outline'
                              )} />
                              {unit.status === 'occupied' ? 'Occupied' : unit.status === 'maintenance' ? 'Maintenance' : 'Vacant'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Applications Tab */}
              {detailTab === 'applications' && (
                <div className="flex-grow bg-surface-container-lowest rounded-3xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-on-surface">Rental Applications</h3>
                    <button className="flex items-center gap-1.5 px-4 py-2 primary-gradient text-on-primary rounded-xl text-sm font-bold">
                      <span className="material-symbols-outlined text-base">add</span>
                      New Application
                    </button>
                  </div>
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-surface-container rounded-2xl flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-3xl text-outline">assignment_ind</span>
                    </div>
                    <p className="font-bold text-on-surface">No applications yet</p>
                    <p className="text-sm text-on-surface-variant mt-1">Applications for this property will appear here.</p>
                  </div>
                </div>
              )}

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

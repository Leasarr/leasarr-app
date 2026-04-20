'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import Modal from '@/components/ui/Modal'
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

const EMPTY_PROPERTY_FORM = { name: '', address: '', city: '', state: '', zip: '', type: 'apartment' as PropertyRow['type'], image_url: '' }
const EMPTY_UNIT_FORM = { unit_number: '', bedrooms: '1', bathrooms: '1', sqft: '', rent_amount: '', status: 'vacant' as DbUnit['status'] }

export default function PropertiesPage() {
  const { profile, loading: authLoading } = useAuth()
  const supabase = createClient()
  const [properties, setProperties] = useState<PropertyRow[]>([])
  const [selected, setSelected] = useState<PropertyRow | null>(null)
  const [detailTab, setDetailTab] = useState<'units' | 'applications'>('units')
  const [loading, setLoading] = useState(false)

  const [showAddProperty, setShowAddProperty] = useState(false)
  const [propertyForm, setPropertyForm] = useState(EMPTY_PROPERTY_FORM)
  const [propertySubmitting, setPropertySubmitting] = useState(false)
  const [propertyError, setPropertyError] = useState('')

  const [showAddUnit, setShowAddUnit] = useState(false)
  const [unitForm, setUnitForm] = useState(EMPTY_UNIT_FORM)
  const [unitSubmitting, setUnitSubmitting] = useState(false)
  const [unitError, setUnitError] = useState('')

  const [showEditProperty, setShowEditProperty] = useState(false)
  const [editPropertyForm, setEditPropertyForm] = useState(EMPTY_PROPERTY_FORM)
  const [editPropertySubmitting, setEditPropertySubmitting] = useState(false)
  const [editPropertyError, setEditPropertyError] = useState('')

  const [showEditUnit, setShowEditUnit] = useState(false)
  const [editingUnit, setEditingUnit] = useState<DbUnit | null>(null)
  const [editUnitForm, setEditUnitForm] = useState(EMPTY_UNIT_FORM)
  const [editUnitSubmitting, setEditUnitSubmitting] = useState(false)
  const [editUnitError, setEditUnitError] = useState('')

  useEffect(() => {
    if (!profile) return
    setLoading(true)
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

  async function handleAddProperty(e: React.FormEvent) {
    e.preventDefault()
    setPropertySubmitting(true)
    setPropertyError('')
    const { data, error } = await supabase
      .from('properties')
      .insert({
        name: propertyForm.name,
        address: propertyForm.address,
        city: propertyForm.city,
        state: propertyForm.state,
        zip: propertyForm.zip,
        type: propertyForm.type,
        image_url: propertyForm.image_url || null,
        manager_id: profile!.id,
      })
      .select('*, units(*)')
      .single()

    if (error) {
      setPropertyError(error.message)
      setPropertySubmitting(false)
      return
    }

    const newProperty = data as PropertyRow
    setProperties(prev => [newProperty, ...prev])
    setSelected(newProperty)
    setPropertyForm(EMPTY_PROPERTY_FORM)
    setShowAddProperty(false)
    setPropertySubmitting(false)
  }

  async function handleAddUnit(e: React.FormEvent) {
    e.preventDefault()
    if (!selected) return
    setUnitSubmitting(true)
    setUnitError('')
    const { data, error } = await supabase
      .from('units')
      .insert({
        property_id: selected.id,
        unit_number: unitForm.unit_number,
        bedrooms: parseInt(unitForm.bedrooms),
        bathrooms: parseInt(unitForm.bathrooms),
        sqft: unitForm.sqft ? parseInt(unitForm.sqft) : null,
        rent_amount: parseFloat(unitForm.rent_amount),
        status: unitForm.status,
      })
      .select()
      .single()

    if (error) {
      setUnitError(error.message)
      setUnitSubmitting(false)
      return
    }

    const newUnit = data as DbUnit
    const updatedProperty = { ...selected, units: [...selected.units, newUnit] }
    setSelected(updatedProperty)
    setProperties(prev => prev.map(p => p.id === selected.id ? updatedProperty : p))
    setUnitForm(EMPTY_UNIT_FORM)
    setShowAddUnit(false)
    setUnitSubmitting(false)
  }

  function openEditProperty() {
    if (!selected) return
    setEditPropertyForm({
      name: selected.name,
      address: selected.address,
      city: selected.city,
      state: selected.state,
      zip: selected.zip,
      type: selected.type,
      image_url: selected.image_url ?? '',
    })
    setEditPropertyError('')
    setShowEditProperty(true)
  }

  async function handleEditProperty(e: React.FormEvent) {
    e.preventDefault()
    if (!selected) return
    setEditPropertySubmitting(true)
    setEditPropertyError('')
    const { data, error } = await supabase
      .from('properties')
      .update({
        name: editPropertyForm.name,
        address: editPropertyForm.address,
        city: editPropertyForm.city,
        state: editPropertyForm.state,
        zip: editPropertyForm.zip,
        type: editPropertyForm.type,
        image_url: editPropertyForm.image_url || null,
      })
      .eq('id', selected.id)
      .select('*, units(*)')
      .single()
    if (error) { setEditPropertyError(error.message); setEditPropertySubmitting(false); return }
    const updated = data as PropertyRow
    setProperties(prev => prev.map(p => p.id === selected.id ? updated : p))
    setSelected(updated)
    setShowEditProperty(false)
    setEditPropertySubmitting(false)
  }

  function openEditUnit(unit: DbUnit) {
    setEditingUnit(unit)
    setEditUnitForm({
      unit_number: unit.unit_number,
      bedrooms: String(unit.bedrooms),
      bathrooms: String(unit.bathrooms),
      sqft: unit.sqft ? String(unit.sqft) : '',
      rent_amount: String(unit.rent_amount),
      status: unit.status,
    })
    setEditUnitError('')
    setShowEditUnit(true)
  }

  async function handleEditUnit(e: React.FormEvent) {
    e.preventDefault()
    if (!selected || !editingUnit) return
    setEditUnitSubmitting(true)
    setEditUnitError('')
    const { data, error } = await supabase
      .from('units')
      .update({
        unit_number: editUnitForm.unit_number,
        bedrooms: parseInt(editUnitForm.bedrooms),
        bathrooms: parseFloat(editUnitForm.bathrooms),
        sqft: editUnitForm.sqft ? parseInt(editUnitForm.sqft) : null,
        rent_amount: parseFloat(editUnitForm.rent_amount),
        status: editUnitForm.status,
      })
      .eq('id', editingUnit.id)
      .select()
      .single()
    if (error) { setEditUnitError(error.message); setEditUnitSubmitting(false); return }
    const updatedUnit = data as DbUnit
    const updatedProperty = { ...selected, units: selected.units.map(u => u.id === editingUnit.id ? updatedUnit : u) }
    setSelected(updatedProperty)
    setProperties(prev => prev.map(p => p.id === selected.id ? updatedProperty : p))
    setShowEditUnit(false)
    setEditUnitSubmitting(false)
  }

  if (authLoading || loading) {
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
          <button onClick={() => setShowAddProperty(true)} className="btn-primary mt-6 px-8 h-12">
            <span className="material-symbols-outlined">add</span> Add Property
          </button>
        </div>

        <AddPropertyModal
          open={showAddProperty}
          onClose={() => { setShowAddProperty(false); setPropertyError('') }}
          form={propertyForm}
          onChange={setPropertyForm}
          onSubmit={handleAddProperty}
          submitting={propertySubmitting}
          error={propertyError}
        />
      </AppLayout>
    )
  }

  const selectedStats = getStats(selected)
  const residentialCount = properties.filter(p => p.type !== 'commercial').length
  const commercialCount = properties.filter(p => p.type === 'commercial').length

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">

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
            <button onClick={() => setShowAddProperty(true)} className="btn-primary h-14 px-8">
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
                    'w-full bg-surface-container-lowest rounded-xl p-3 group cursor-pointer hover:bg-surface-container-low transition-all text-left',
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
                  <button onClick={openEditProperty} className="w-12 h-12 rounded-full bg-surface-container-lowest text-on-surface flex items-center justify-center hover:bg-surface-container-high transition-colors shadow-sm">
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                  <button className="w-12 h-12 rounded-full bg-surface-container-lowest text-on-surface flex items-center justify-center hover:bg-surface-container-high transition-colors shadow-sm">
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
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-on-surface">Units Portfolio</h3>
                    <button
                      onClick={() => setShowAddUnit(true)}
                      className="flex items-center gap-1.5 px-4 py-2 primary-gradient text-on-primary rounded-xl text-sm font-bold"
                    >
                      <span className="material-symbols-outlined text-base">add</span>
                      Add Unit
                    </button>
                  </div>
                  {selected.units.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-16 h-16 bg-surface-container rounded-2xl flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-3xl text-outline">apartment</span>
                      </div>
                      <p className="font-bold text-on-surface">No units added yet</p>
                      <p className="text-sm text-on-surface-variant mt-1">Add the first unit to this property.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selected.units.map(unit => (
                        <div
                          key={unit.id}
                          className="flex items-center justify-between py-3 hover:bg-surface-container-low rounded-xl px-4 transition-colors group"
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
                          <div className="flex items-center gap-3">
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
                            <button
                              onClick={() => openEditUnit(unit)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-primary opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <span className="material-symbols-outlined text-sm">edit</span>
                            </button>
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
      <button
        onClick={() => setShowAddProperty(true)}
        className="fixed bottom-24 lg:bottom-8 right-6 lg:right-8 w-16 h-16 rounded-full primary-gradient text-on-primary shadow-fab flex items-center justify-center active:scale-90 transition-transform z-40"
      >
        <span className="material-symbols-outlined text-3xl">add_home</span>
      </button>

      {/* Add Property Modal */}
      <AddPropertyModal
        open={showAddProperty}
        onClose={() => { setShowAddProperty(false); setPropertyError('') }}
        form={propertyForm}
        onChange={setPropertyForm}
        onSubmit={handleAddProperty}
        submitting={propertySubmitting}
        error={propertyError}
      />

      {/* Edit Property Modal */}
      <AddPropertyModal
        open={showEditProperty}
        onClose={() => setShowEditProperty(false)}
        form={editPropertyForm}
        onChange={setEditPropertyForm}
        onSubmit={handleEditProperty}
        submitting={editPropertySubmitting}
        error={editPropertyError}
        title="Edit Property"
        submitLabel="Save Changes"
      />

      {/* Edit Unit Modal */}
      <Modal
        open={showEditUnit}
        onClose={() => setShowEditUnit(false)}
        title={`Edit Unit ${editingUnit?.unit_number ?? ''}`}
      >
        <form onSubmit={handleEditUnit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Unit Number</label>
              <input required className="input-base" value={editUnitForm.unit_number} onChange={e => setEditUnitForm(f => ({ ...f, unit_number: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Bedrooms</label>
              <input required type="number" min="0" className="input-base" value={editUnitForm.bedrooms} onChange={e => setEditUnitForm(f => ({ ...f, bedrooms: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Bathrooms</label>
              <input required type="number" min="0" step="0.5" className="input-base" value={editUnitForm.bathrooms} onChange={e => setEditUnitForm(f => ({ ...f, bathrooms: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Sqft <span className="text-on-surface-variant font-normal">(optional)</span></label>
              <input type="number" min="0" className="input-base" value={editUnitForm.sqft} onChange={e => setEditUnitForm(f => ({ ...f, sqft: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Monthly Rent ($)</label>
              <input required type="number" min="0" step="0.01" className="input-base" value={editUnitForm.rent_amount} onChange={e => setEditUnitForm(f => ({ ...f, rent_amount: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Status</label>
              <select className="input-base" value={editUnitForm.status} onChange={e => setEditUnitForm(f => ({ ...f, status: e.target.value as DbUnit['status'] }))}>
                <option value="vacant">Vacant</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Under Maintenance</option>
              </select>
            </div>
          </div>
          {editUnitError && <p className="text-sm text-error">{editUnitError}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowEditUnit(false)} className="btn-secondary flex-1 h-11">Cancel</button>
            <button type="submit" disabled={editUnitSubmitting} className="btn-primary flex-1 h-11">{editUnitSubmitting ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </Modal>

      {/* Add Unit Modal */}
      <Modal
        open={showAddUnit}
        onClose={() => { setShowAddUnit(false); setUnitError('') }}
        title={`Add Unit — ${selected?.name ?? ''}`}
      >
        <form onSubmit={handleAddUnit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Unit Number</label>
              <input
                required
                className="input-base"
                placeholder="e.g. 1A, 204, G1"
                value={unitForm.unit_number}
                onChange={e => setUnitForm(f => ({ ...f, unit_number: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Bedrooms</label>
              <input
                required
                type="number"
                min="0"
                className="input-base"
                value={unitForm.bedrooms}
                onChange={e => setUnitForm(f => ({ ...f, bedrooms: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Bathrooms</label>
              <input
                required
                type="number"
                min="0"
                step="0.5"
                className="input-base"
                value={unitForm.bathrooms}
                onChange={e => setUnitForm(f => ({ ...f, bathrooms: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Sqft <span className="text-on-surface-variant font-normal">(optional)</span></label>
              <input
                type="number"
                min="0"
                className="input-base"
                placeholder="e.g. 850"
                value={unitForm.sqft}
                onChange={e => setUnitForm(f => ({ ...f, sqft: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Monthly Rent ($)</label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                className="input-base"
                placeholder="e.g. 2500"
                value={unitForm.rent_amount}
                onChange={e => setUnitForm(f => ({ ...f, rent_amount: e.target.value }))}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Status</label>
              <select
                className="input-base"
                value={unitForm.status}
                onChange={e => setUnitForm(f => ({ ...f, status: e.target.value as DbUnit['status'] }))}
              >
                <option value="vacant">Vacant</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Under Maintenance</option>
              </select>
            </div>
          </div>
          {unitError && <p className="text-sm text-error">{unitError}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setShowAddUnit(false); setUnitError('') }} className="btn-secondary flex-1 h-11">
              Cancel
            </button>
            <button type="submit" disabled={unitSubmitting} className="btn-primary flex-1 h-11">
              {unitSubmitting ? 'Adding...' : 'Add Unit'}
            </button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  )
}

// ── Add Property Modal ─────────────────────────────────────────────────────────

type PropertyForm = typeof EMPTY_PROPERTY_FORM

function AddPropertyModal({
  open, onClose, form, onChange, onSubmit, submitting, error, title = 'Add Property', submitLabel = 'Create Property',
}: {
  open: boolean
  onClose: () => void
  form: PropertyForm
  onChange: React.Dispatch<React.SetStateAction<PropertyForm>>
  onSubmit: (e: React.FormEvent) => void
  submitting: boolean
  error: string
  title?: string
  submitLabel?: string
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="lg">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-1.5">Property Name</label>
          <input
            required
            className="input-base"
            placeholder="e.g. The Azure Heights"
            value={form.name}
            onChange={e => onChange(f => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-1.5">Street Address</label>
          <input
            required
            className="input-base"
            placeholder="e.g. 1244 East 86th St"
            value={form.address}
            onChange={e => onChange(f => ({ ...f, address: e.target.value }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">City</label>
            <input
              required
              className="input-base"
              placeholder="e.g. New York"
              value={form.city}
              onChange={e => onChange(f => ({ ...f, city: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">State</label>
            <input
              required
              className="input-base"
              placeholder="e.g. NY"
              maxLength={2}
              value={form.state}
              onChange={e => onChange(f => ({ ...f, state: e.target.value.toUpperCase() }))}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">ZIP Code</label>
            <input
              required
              className="input-base"
              placeholder="e.g. 10028"
              value={form.zip}
              onChange={e => onChange(f => ({ ...f, zip: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">Type</label>
            <select
              className="input-base"
              value={form.type}
              onChange={e => onChange(f => ({ ...f, type: e.target.value as PropertyForm['type'] }))}
            >
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="condo">Condo</option>
              <option value="commercial">Commercial</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-on-surface mb-1.5">Image URL <span className="text-on-surface-variant font-normal">(optional)</span></label>
          <input
            className="input-base"
            placeholder="https://..."
            value={form.image_url}
            onChange={e => onChange(f => ({ ...f, image_url: e.target.value }))}
          />
        </div>
        {error && <p className="text-sm text-error">{error}</p>}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1 h-11">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn-primary flex-1 h-11">
            {submitting ? 'Saving...' : submitLabel}
          </button>
        </div>
      </form>
    </Modal>
  )
}

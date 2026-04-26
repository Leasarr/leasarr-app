'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import Modal from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { MasterDetail } from '@/components/layout/MasterDetail'
import { SectionHeader } from '@/components/layout/SectionHeader'
import { StatusDot } from '@/components/ui/StatusDot'
import { EmptyState } from '@/components/patterns/EmptyState'
import { LoadingState } from '@/components/patterns/LoadingState'
import { FormField } from '@/components/patterns/FormField'
import { formatCurrency, cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { unitSchema, propertySchema, type UnitForm, type PropertyForm } from '@/lib/schemas/property'

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
  const { profile, loading: authLoading } = useAuth()
  const supabase = createClient()
  const [properties, setProperties] = useState<PropertyRow[]>([])
  const [selected, setSelected] = useState<PropertyRow | null>(null)
  const [detailTab, setDetailTab] = useState<'units' | 'applications'>('units')
  const [loading, setLoading] = useState(false)

  const [showAddProperty, setShowAddProperty] = useState(false)
  const [showEditProperty, setShowEditProperty] = useState(false)
  const [editPropertyDefaults, setEditPropertyDefaults] = useState<PropertyForm | undefined>()

  const [showAddUnit, setShowAddUnit] = useState(false)
  const [unitServerError, setUnitServerError] = useState('')
  const addUnitForm = useForm<UnitForm>({ resolver: zodResolver(unitSchema), defaultValues: { bedrooms: '1', bathrooms: '1', status: 'vacant' } })

  const [showEditUnit, setShowEditUnit] = useState(false)
  const [editingUnit, setEditingUnit] = useState<DbUnit | null>(null)
  const [editUnitServerError, setEditUnitServerError] = useState('')
  const editUnitForm = useForm<UnitForm>({ resolver: zodResolver(unitSchema) })

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

  async function handleAddProperty(data: PropertyForm): Promise<string | null> {
    const { data: row, error } = await supabase
      .from('properties')
      .insert({
        name: data.name,
        address: data.address,
        city: data.city,
        state: data.state,
        zip: data.zip,
        type: data.type,
        image_url: data.image_url || null,
        manager_id: profile!.id,
      })
      .select('*, units(*)')
      .single()
    if (error) return error.message
    const newProperty = row as PropertyRow
    setProperties(prev => [newProperty, ...prev])
    setSelected(newProperty)
    setShowAddProperty(false)
    return null
  }

  async function onAddUnit(data: UnitForm) {
    if (!selected) return
    setUnitServerError('')
    const { data: row, error } = await supabase
      .from('units')
      .insert({
        property_id: selected.id,
        unit_number: data.unit_number,
        bedrooms: parseInt(data.bedrooms),
        bathrooms: parseFloat(data.bathrooms),
        sqft: data.sqft ? parseInt(data.sqft) : null,
        rent_amount: parseFloat(data.rent_amount),
        status: data.status,
      })
      .select()
      .single()

    if (error) {
      setUnitServerError(error.message)
      return
    }

    const newUnit = row as DbUnit
    const updatedProperty = { ...selected, units: [...selected.units, newUnit] }
    setSelected(updatedProperty)
    setProperties(prev => prev.map(p => p.id === selected.id ? updatedProperty : p))
    addUnitForm.reset()
    setShowAddUnit(false)
  }

  function openEditProperty() {
    if (!selected) return
    setEditPropertyDefaults({
      name: selected.name,
      address: selected.address,
      city: selected.city,
      state: selected.state,
      zip: selected.zip,
      type: selected.type,
      image_url: selected.image_url ?? null,
    })
    setShowEditProperty(true)
  }

  async function handleEditProperty(data: PropertyForm): Promise<string | null> {
    if (!selected) return null
    const { data: row, error } = await supabase
      .from('properties')
      .update({
        name: data.name,
        address: data.address,
        city: data.city,
        state: data.state,
        zip: data.zip,
        type: data.type,
        image_url: data.image_url || null,
      })
      .eq('id', selected.id)
      .select('*, units(*)')
      .single()
    if (error) return error.message
    const updated = row as PropertyRow
    setProperties(prev => prev.map(p => p.id === selected.id ? updated : p))
    setSelected(updated)
    setShowEditProperty(false)
    return null
  }

  function openEditUnit(unit: DbUnit) {
    setEditingUnit(unit)
    editUnitForm.reset({
      unit_number: unit.unit_number,
      bedrooms: String(unit.bedrooms),
      bathrooms: String(unit.bathrooms),
      sqft: unit.sqft ? String(unit.sqft) : '',
      rent_amount: String(unit.rent_amount),
      status: unit.status,
    })
    setEditUnitServerError('')
    setShowEditUnit(true)
  }

  async function onEditUnit(data: UnitForm) {
    if (!selected || !editingUnit) return
    setEditUnitServerError('')
    const { data: row, error } = await supabase
      .from('units')
      .update({
        unit_number: data.unit_number,
        bedrooms: parseInt(data.bedrooms),
        bathrooms: parseFloat(data.bathrooms),
        sqft: data.sqft ? parseInt(data.sqft) : null,
        rent_amount: parseFloat(data.rent_amount),
        status: data.status,
      })
      .eq('id', editingUnit.id)
      .select()
      .single()
    if (error) { setEditUnitServerError(error.message); return }
    const updatedUnit = row as DbUnit
    const updatedProperty = { ...selected, units: selected.units.map(u => u.id === editingUnit.id ? updatedUnit : u) }
    setSelected(updatedProperty)
    setProperties(prev => prev.map(p => p.id === selected.id ? updatedProperty : p))
    setShowEditUnit(false)
  }

  if (authLoading || loading) {
    return (
      <AppLayout>
        <LoadingState label="Loading properties..." />
      </AppLayout>
    )
  }

  if (!selected) {
    return (
      <AppLayout>
        <EmptyState
          icon="domain_add"
          title="No properties yet"
          description="Add your first property to get started."
          size="page"
          action={
            <Button onClick={() => setShowAddProperty(true)}>
              <span className="material-symbols-outlined text-base">add</span> Add Property
            </Button>
          }
        />

        <AddPropertyModal
          open={showAddProperty}
          onClose={() => setShowAddProperty(false)}
          onSubmit={handleAddProperty}
        />
      </AppLayout>
    )
  }

  const selectedStats = getStats(selected)
  const propertyTypes = Array.from(new Set(properties.map(p => p.type)))

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-2xl md:text-3xl font-headline font-extrabold tracking-tight text-on-surface">Properties</h1>
            <p className="text-on-surface-variant mt-2 font-medium">Manage {properties.length} active real estate assets</p>
            <div className="flex gap-2 mt-2 flex-wrap">
              {propertyTypes.map(type => (
                <span key={type} className={cn(
                  'badge capitalize',
                  type === 'commercial' ? 'bg-primary-container/30 text-primary' : 'bg-surface-container-high text-on-surface-variant'
                )}>
                  {type}
                </span>
              ))}
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

        <MasterDetail
          list={
            <div className="space-y-4">
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
                        <h3 className="font-bold text-sm text-on-surface leading-tight">{property.name}</h3>
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
                            {property.type}
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
          }
          detail={
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
                    <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1">{stat.label}</p>
                    <p className="text-xl font-extrabold text-on-surface">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Tab Switcher */}
              <SegmentedControl
                options={[
                  { key: 'units', label: 'Units', icon: 'apartment' },
                  { key: 'applications', label: 'Applications', icon: 'assignment_ind' },
                ]}
                value={detailTab}
                onChange={v => setDetailTab(v as 'units' | 'applications')}
                className="w-fit mb-6"
              />

              {/* Units Tab */}
              {detailTab === 'units' && (
                <div className="flex-grow bg-surface-container-lowest rounded-3xl p-6 shadow-sm">
                  <SectionHeader
                    className="mb-6"
                    title="Units Portfolio"
                    action={
                      <Button size="sm" onClick={() => setShowAddUnit(true)}>
                        <span className="material-symbols-outlined text-base">add</span>
                        Add Unit
                      </Button>
                    }
                  />
                  {selected.units.length === 0 ? (
                    <EmptyState icon="apartment" title="No units added yet" description="Add the first unit to this property." size="inline" />
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
                                <StatusDot status={unit.status} />
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
                  <SectionHeader
                    className="mb-6"
                    title="Rental Applications"
                    action={
                      <Button size="sm">
                        <span className="material-symbols-outlined text-base">add</span>
                        New Application
                      </Button>
                    }
                  />
                  <EmptyState icon="assignment_ind" title="No applications yet" description="Applications for this property will appear here." size="inline" />
                </div>
              )}

            </div>
          }
        />
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
        onClose={() => setShowAddProperty(false)}
        onSubmit={handleAddProperty}
      />

      {/* Edit Property Modal */}
      <AddPropertyModal
        open={showEditProperty}
        onClose={() => setShowEditProperty(false)}
        onSubmit={handleEditProperty}
        defaultValues={editPropertyDefaults}
        title="Edit Property"
        submitLabel="Save Changes"
      />

      {/* Edit Unit Modal */}
      <Modal
        open={showEditUnit}
        onClose={() => setShowEditUnit(false)}
        title={`Edit Unit ${editingUnit?.unit_number ?? ''}`}
      >
        <form onSubmit={editUnitForm.handleSubmit(onEditUnit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Unit Number" className="col-span-2">
              <input {...editUnitForm.register('unit_number')} className="input-base" />
              {editUnitForm.formState.errors.unit_number && <p className="text-error text-xs mt-1">{editUnitForm.formState.errors.unit_number.message}</p>}
            </FormField>
            <FormField label="Bedrooms">
              <input {...editUnitForm.register('bedrooms')} type="number" min="0" className="input-base" />
              {editUnitForm.formState.errors.bedrooms && <p className="text-error text-xs mt-1">{editUnitForm.formState.errors.bedrooms.message}</p>}
            </FormField>
            <FormField label="Bathrooms">
              <input {...editUnitForm.register('bathrooms')} type="number" min="0" step="0.5" className="input-base" />
              {editUnitForm.formState.errors.bathrooms && <p className="text-error text-xs mt-1">{editUnitForm.formState.errors.bathrooms.message}</p>}
            </FormField>
            <FormField label="Sqft" optional>
              <input {...editUnitForm.register('sqft')} type="number" min="0" className="input-base" />
            </FormField>
            <FormField label="Monthly Rent ($)">
              <input {...editUnitForm.register('rent_amount')} type="number" min="0" step="0.01" className="input-base" />
              {editUnitForm.formState.errors.rent_amount && <p className="text-error text-xs mt-1">{editUnitForm.formState.errors.rent_amount.message}</p>}
            </FormField>
            <FormField label="Status" className="col-span-2">
              <select {...editUnitForm.register('status')} className="input-base">
                <option value="vacant">Vacant</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Under Maintenance</option>
              </select>
            </FormField>
          </div>
          {editUnitServerError && <p className="text-sm text-error">{editUnitServerError}</p>}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowEditUnit(false)} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={editUnitForm.formState.isSubmitting} className="flex-1">{editUnitForm.formState.isSubmitting ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        </form>
      </Modal>

      {/* Add Unit Modal */}
      <Modal
        open={showAddUnit}
        onClose={() => { addUnitForm.reset(); setShowAddUnit(false) }}
        title={`Add Unit — ${selected?.name ?? ''}`}
      >
        <form onSubmit={addUnitForm.handleSubmit(onAddUnit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Unit Number" className="col-span-2">
              <input
                {...addUnitForm.register('unit_number')}
                className="input-base"
                placeholder="e.g. 1A, 204, G1"
              />
              {addUnitForm.formState.errors.unit_number && <p className="text-error text-xs mt-1">{addUnitForm.formState.errors.unit_number.message}</p>}
            </FormField>
            <FormField label="Bedrooms">
              <input
                {...addUnitForm.register('bedrooms')}
                type="number"
                min="0"
                className="input-base"
              />
              {addUnitForm.formState.errors.bedrooms && <p className="text-error text-xs mt-1">{addUnitForm.formState.errors.bedrooms.message}</p>}
            </FormField>
            <FormField label="Bathrooms">
              <input
                {...addUnitForm.register('bathrooms')}
                type="number"
                min="0"
                step="0.5"
                className="input-base"
              />
              {addUnitForm.formState.errors.bathrooms && <p className="text-error text-xs mt-1">{addUnitForm.formState.errors.bathrooms.message}</p>}
            </FormField>
            <FormField label="Sqft" optional>
              <input
                {...addUnitForm.register('sqft')}
                type="number"
                min="0"
                className="input-base"
                placeholder="e.g. 850"
              />
            </FormField>
            <FormField label="Monthly Rent ($)">
              <input
                {...addUnitForm.register('rent_amount')}
                type="number"
                min="0"
                step="0.01"
                className="input-base"
                placeholder="e.g. 2500"
              />
              {addUnitForm.formState.errors.rent_amount && <p className="text-error text-xs mt-1">{addUnitForm.formState.errors.rent_amount.message}</p>}
            </FormField>
            <FormField label="Status" className="col-span-2">
              <select
                {...addUnitForm.register('status')}
                className="input-base"
              >
                <option value="vacant">Vacant</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Under Maintenance</option>
              </select>
            </FormField>
          </div>
          {unitServerError && <p className="text-sm text-error">{unitServerError}</p>}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => { addUnitForm.reset(); setShowAddUnit(false) }} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={addUnitForm.formState.isSubmitting} className="flex-1">{addUnitForm.formState.isSubmitting ? 'Adding...' : 'Add Unit'}</Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  )
}

// ── Add / Edit Property Modal ──────────────────────────────────────────────────

const EMPTY_PROPERTY_DEFAULTS: PropertyForm = { name: '', address: '', city: '', state: '', zip: '', type: 'apartment', image_url: null }

function AddPropertyModal({
  open, onClose, onSubmit, defaultValues, title = 'Add Property', submitLabel = 'Create Property',
}: {
  open: boolean
  onClose: () => void
  onSubmit: (data: PropertyForm) => Promise<string | null>
  defaultValues?: PropertyForm
  title?: string
  submitLabel?: string
}) {
  const form = useForm<PropertyForm>({ resolver: zodResolver(propertySchema), defaultValues: EMPTY_PROPERTY_DEFAULTS })
  const [serverError, setServerError] = useState('')

  useEffect(() => {
    if (open) {
      setServerError('')
      form.reset(defaultValues ?? EMPTY_PROPERTY_DEFAULTS)
    }
  }, [open])

  async function handleSubmit(data: PropertyForm) {
    const err = await onSubmit(data)
    if (err) setServerError(err)
  }

  return (
    <Modal open={open} onClose={onClose} title={title} size="lg">
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField label="Property Name">
          <input
            {...form.register('name')}
            className="input-base"
            placeholder="e.g. The Azure Heights"
          />
          {form.formState.errors.name && <p className="text-error text-xs mt-1">{form.formState.errors.name.message}</p>}
        </FormField>
        <FormField label="Street Address">
          <input
            {...form.register('address')}
            className="input-base"
            placeholder="e.g. 1244 East 86th St"
          />
          {form.formState.errors.address && <p className="text-error text-xs mt-1">{form.formState.errors.address.message}</p>}
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="City">
            <input
              {...form.register('city')}
              className="input-base"
              placeholder="e.g. New York"
            />
            {form.formState.errors.city && <p className="text-error text-xs mt-1">{form.formState.errors.city.message}</p>}
          </FormField>
          <FormField label="State">
            <input
              {...form.register('state')}
              className="input-base"
              placeholder="e.g. NY"
              maxLength={2}
              onChange={e => form.setValue('state', e.target.value.toUpperCase())}
            />
            {form.formState.errors.state && <p className="text-error text-xs mt-1">{form.formState.errors.state.message}</p>}
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="ZIP Code">
            <input
              {...form.register('zip')}
              className="input-base"
              placeholder="e.g. 10028"
            />
            {form.formState.errors.zip && <p className="text-error text-xs mt-1">{form.formState.errors.zip.message}</p>}
          </FormField>
          <FormField label="Type">
            <select {...form.register('type')} className="input-base">
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="condo">Condo</option>
              <option value="commercial">Commercial</option>
            </select>
          </FormField>
        </div>
        <FormField label="Property Photo" optional>
          <Controller
            control={form.control}
            name="image_url"
            render={({ field }) => (
              <ImageUpload
                value={field.value ?? null}
                onChange={field.onChange}
                bucket="property-images"
                path="uploads"
                height="h-40"
              />
            )}
          />
        </FormField>
        {serverError && <p className="text-sm text-error">{serverError}</p>}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
          <Button type="submit" disabled={form.formState.isSubmitting} className="flex-1">{form.formState.isSubmitting ? 'Saving...' : submitLabel}</Button>
        </div>
      </form>
    </Modal>
  )
}

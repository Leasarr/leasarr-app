'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import Modal from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { TabBar } from '@/components/ui/TabBar'
import { EmptyState } from '@/components/patterns/EmptyState'
import { LoadingState } from '@/components/patterns/LoadingState'
import { FormField } from '@/components/patterns/FormField'
import { formatCurrency, formatDate, getInitials, getStatusColor, cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'

// ── DB row types ───────────────────────────────────────────────────────────────

type TenantRow = {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  unit_id: string | null
  property_id: string | null
  team_member_id: string | null
  status: 'active' | 'inactive' | 'pending'
  credit_score: number | null
  created_at: string
  property: { name: string } | null
  unit: { unit_number: string } | null
}

type TeamMemberRow = {
  id: string
  name: string
  role: string
  email: string
  phone: string | null
  status: 'active' | 'inactive'
  created_at: string
}

type VendorRow = {
  id: string
  name: string
  company: string
  specialty: 'plumbing' | 'electrical' | 'hvac' | 'landscaping' | 'general' | 'cleaning'
  email: string
  phone: string | null
  rating: number
  status: 'active' | 'inactive'
  created_at: string
}

type PaymentRow = { id: string; amount: number; due_date: string; status: 'paid' | 'pending' | 'overdue' | 'partial' | 'failed' }
type LeaseRow = { id: string; rent_amount: number; end_date: string; security_deposit: number }
type VacantUnit = { id: string; unit_number: string; property_id: string; property: { id: string; name: string } | null }

type PeopleTab = 'all' | 'tenants' | 'team' | 'vendors'
type TenantDetailTab = 'payments' | 'maintenance'
type PersonType = 'tenant' | 'team_member' | 'vendor'

// ── Specialty styles ───────────────────────────────────────────────────────────

const SPECIALTY_STYLE: Record<string, { icon: string; label: string; bg: string; text: string }> = {
  plumbing:    { icon: 'plumbing',            label: 'Plumbing',    bg: 'bg-primary-container/30',             text: 'text-primary' },
  electrical:  { icon: 'electrical_services', label: 'Electrical',  bg: 'bg-tertiary-fixed',                   text: 'text-on-tertiary-fixed-variant' },
  hvac:        { icon: 'ac_unit',             label: 'HVAC',        bg: 'bg-secondary-container/60',           text: 'text-on-secondary-container' },
  landscaping: { icon: 'yard',                label: 'Landscaping', bg: 'bg-secondary-container',              text: 'text-on-secondary-container' },
  general:     { icon: 'handyman',            label: 'General',     bg: 'bg-surface-container-high',           text: 'text-on-surface-variant' },
  cleaning:    { icon: 'cleaning_services',   label: 'Cleaning',    bg: 'bg-error-container/30',               text: 'text-error' },
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={cn('material-symbols-outlined text-sm', i <= Math.round(rating) ? 'material-symbols-filled text-warning' : 'text-outline-variant')}>star</span>
      ))}
      <span className="text-xs font-bold text-on-surface ml-1">{rating}</span>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function PeoplePage() {
  const { profile, loading: authLoading } = useAuth()
  const supabase = createClient()

  const [tenants, setTenants] = useState<TenantRow[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMemberRow[]>([])
  const [vendors, setVendors] = useState<VendorRow[]>([])
  const [selectedTenant, setSelectedTenant] = useState<TenantRow | null>(null)
  const [tenantPayments, setTenantPayments] = useState<PaymentRow[]>([])
  const [activeLease, setActiveLease] = useState<LeaseRow | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<PeopleTab>('all')
  const [tenantDetailTab, setTenantDetailTab] = useState<TenantDetailTab>('payments')
  const [search, setSearch] = useState('')

  // ── Edit Tenant modal state
  const [showEditTenant, setShowEditTenant] = useState(false)
  const [editUnits, setEditUnits] = useState<VacantUnit[]>([])
  const [editForm, setEditForm] = useState({ first_name: '', last_name: '', email: '', phone: '', property_id: '', unit_id: '', team_member_id: '', status: 'active' as TenantRow['status'] })
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editError, setEditError] = useState('')

  // ── Add Person modal state
  const [showAddPerson, setShowAddPerson] = useState(false)
  const [modalStep, setModalStep] = useState<1 | 2>(1)
  const [personType, setPersonType] = useState<PersonType | null>(null)
  const [vacantUnits, setVacantUnits] = useState<VacantUnit[]>([])
  const [properties, setProperties] = useState<{ id: string; name: string }[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const [tenantForm, setTenantForm] = useState({ first_name: '', last_name: '', email: '', phone: '', move_in_date: '', property_id: '', unit_id: '', team_member_id: '' })
  const [teamForm, setTeamForm] = useState({ name: '', role: '', email: '', phone: '' })
  const [vendorForm, setVendorForm] = useState({ name: '', company: '', specialty: 'general' as VendorRow['specialty'], email: '', phone: '' })

  // ── Fetch all people
  useEffect(() => {
    if (!profile) return
    setLoading(true)
    async function fetchAll() {
      const [tenantsRes, teamRes, vendorsRes, propsRes] = await Promise.all([
        supabase.from('tenants').select('*, property:properties(name), unit:units(unit_number)').eq('manager_id', profile!.id).order('created_at', { ascending: false }),
        supabase.from('team_members').select('*').eq('manager_id', profile!.id).order('created_at', { ascending: false }),
        supabase.from('vendors').select('*').eq('manager_id', profile!.id).order('created_at', { ascending: false }),
        supabase.from('properties').select('id, name').eq('manager_id', profile!.id).order('name'),
      ])
      setProperties((propsRes.data ?? []) as { id: string; name: string }[])
      const rows = (tenantsRes.data ?? []) as TenantRow[]
      const teamRows = (teamRes.data ?? []) as TeamMemberRow[]
      const vendorRows = (vendorsRes.data ?? []) as VendorRow[]
      setTenants(rows)
      if (rows.length > 0) setSelectedTenant(rows[0])
      setTeamMembers(teamRows)
      setVendors(vendorRows)
      setLoading(false)
    }
    fetchAll()
  }, [profile])

  // ── Fetch tenant detail data
  useEffect(() => {
    if (!selectedTenant) return
    async function fetchTenantData() {
      const [paymentsRes, leaseRes] = await Promise.all([
        supabase.from('payments').select('id, amount, due_date, status').eq('tenant_id', selectedTenant!.id).order('due_date', { ascending: false }).limit(10),
        supabase.from('leases').select('id, rent_amount, end_date, security_deposit').eq('tenant_id', selectedTenant!.id).eq('status', 'active').maybeSingle(),
      ])
      setTenantPayments(paymentsRes.data ?? [])
      setActiveLease(leaseRes.data ?? null)
    }
    fetchTenantData()
  }, [selectedTenant])

  // ── Open modal helpers
  async function openAddPerson() {
    setShowAddPerson(true)
    setModalStep(1)
    setPersonType(null)
    setFormError('')
    const [unitsRes, propsRes] = await Promise.all([
      supabase.from('units').select('id, unit_number, property_id, property:properties(id, name)').eq('status', 'vacant'),
      supabase.from('properties').select('id, name').eq('manager_id', profile!.id).order('name'),
    ])
    setVacantUnits((unitsRes.data as unknown as VacantUnit[]) ?? [])
    setProperties((propsRes.data ?? []) as { id: string; name: string }[])
  }

  function selectType(type: PersonType) {
    setPersonType(type)
    setModalStep(2)
    setFormError('')
  }

  function closeModal() {
    setShowAddPerson(false)
    setModalStep(1)
    setPersonType(null)
    setFormError('')
    setSubmitting(false)
    setTenantForm({ first_name: '', last_name: '', email: '', phone: '', move_in_date: '', property_id: '', unit_id: '', team_member_id: '' })
    setTeamForm({ name: '', role: '', email: '', phone: '' })
    setVendorForm({ name: '', company: '', specialty: 'general', email: '', phone: '' })
  }

  // ── Edit Tenant
  async function openEditTenant(tenant: TenantRow) {
    setEditForm({
      first_name: tenant.first_name,
      last_name: tenant.last_name,
      email: tenant.email,
      phone: tenant.phone ?? '',
      property_id: tenant.property_id ?? '',
      unit_id: tenant.unit_id ?? '',
      team_member_id: tenant.team_member_id ?? '',
      status: tenant.status,
    })
    setEditError('')
    // Fetch vacant units + the tenant's current unit (so it shows in the dropdown)
    const { data } = await supabase
      .from('units')
      .select('id, unit_number, property_id, property:properties(id, name)')
      .or(`status.eq.vacant${tenant.unit_id ? `,id.eq.${tenant.unit_id}` : ''}`)
    setEditUnits((data as unknown as VacantUnit[]) ?? [])
    setShowEditTenant(true)
  }

  async function handleEditTenant(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedTenant) return
    setEditSubmitting(true)
    setEditError('')

    const prevUnitId = selectedTenant.unit_id
    const nextUnitId = editForm.unit_id || null

    const { data, error } = await supabase
      .from('tenants')
      .update({
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        email: editForm.email,
        phone: editForm.phone,
        property_id: editForm.property_id || null,
        unit_id: nextUnitId,
        team_member_id: editForm.team_member_id || null,
        status: editForm.status,
      })
      .eq('id', selectedTenant.id)
      .select('*, property:properties(name), unit:units(unit_number)')
      .single()

    if (error) { setEditError(error.message); setEditSubmitting(false); return }

    // Always sync unit status to reflect tenant state
    if (prevUnitId && prevUnitId !== nextUnitId) {
      await supabase.from('units').update({ status: 'vacant' }).eq('id', prevUnitId)
    }
    if (nextUnitId) {
      const unitStatus = editForm.status === 'active' ? 'occupied' : 'vacant'
      await supabase.from('units').update({ status: unitStatus }).eq('id', nextUnitId)
    }

    const updated = data as TenantRow
    setTenants(prev => prev.map(t => t.id === selectedTenant.id ? updated : t))
    setSelectedTenant(updated)
    setShowEditTenant(false)
    setEditSubmitting(false)
  }

  // ── Submit handlers
  async function handleAddTenant(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setFormError('')
    const { data, error } = await supabase.from('tenants').insert({
      first_name: tenantForm.first_name,
      last_name: tenantForm.last_name,
      email: tenantForm.email,
      phone: tenantForm.phone,
      move_in_date: tenantForm.move_in_date || null,
      unit_id: tenantForm.unit_id || null,
      property_id: tenantForm.property_id || null,
      team_member_id: tenantForm.team_member_id || null,
      manager_id: profile!.id,
      status: 'active',
    }).select('*, property:properties(name), unit:units(unit_number)').single()
    if (error) { setFormError(error.message); setSubmitting(false); return }
    if (tenantForm.unit_id) {
      await supabase.from('units').update({ status: 'occupied' }).eq('id', tenantForm.unit_id)
    }
    setTenants(prev => [data as TenantRow, ...prev])
    setSelectedTenant(data as TenantRow)
    setActiveTab('tenants')
    closeModal()
  }

  async function handleAddTeamMember(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setFormError('')
    const { data, error } = await supabase.from('team_members').insert({
      name: teamForm.name,
      role: teamForm.role,
      email: teamForm.email,
      phone: teamForm.phone || null,
      manager_id: profile!.id,
      status: 'active',
    }).select('*').single()
    if (error) { setFormError(error.message); setSubmitting(false); return }
    setTeamMembers(prev => [data as TeamMemberRow, ...prev])
    setActiveTab('team')
    closeModal()
  }

  async function handleAddVendor(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setFormError('')
    const { data, error } = await supabase.from('vendors').insert({
      name: vendorForm.name,
      company: vendorForm.company,
      specialty: vendorForm.specialty,
      email: vendorForm.email,
      phone: vendorForm.phone || null,
      manager_id: profile!.id,
      status: 'active',
    }).select('*').single()
    if (error) { setFormError(error.message); setSubmitting(false); return }
    setVendors(prev => [data as VendorRow, ...prev])
    setActiveTab('vendors')
    closeModal()
  }

  // ── Search filter
  const matchesSearch = (text: string) => search === '' || text.toLowerCase().includes(search.toLowerCase())
  const filteredTenants = tenants.filter(t => matchesSearch(`${t.first_name} ${t.last_name} ${t.email}`))
  const filteredTeam = teamMembers.filter(m => matchesSearch(`${m.name} ${m.role} ${m.email}`))
  const filteredVendors = vendors.filter(v => matchesSearch(`${v.name} ${v.company} ${v.specialty}`))

  const TABS: { key: PeopleTab; label: string; count: number }[] = [
    { key: 'all',     label: 'All', count: tenants.length + teamMembers.length + vendors.length },
    { key: 'tenants', label: 'Tenants',    count: tenants.length },
    { key: 'team',    label: 'Team',       count: teamMembers.length },
    { key: 'vendors', label: 'Vendors',    count: vendors.length },
  ]

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">

        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-headline font-extrabold text-on-surface tracking-tight mb-1">People</h1>
            <p className="text-on-surface-variant font-medium">Manage everyone connected to your portfolio</p>
            <div className="flex gap-2 mt-3">
              <span className="badge bg-secondary-container text-on-secondary-container">{tenants.length} Tenants</span>
              <span className="badge bg-primary-container/30 text-primary">{teamMembers.length} Team</span>
              <span className="badge bg-tertiary-container/20 text-on-tertiary-fixed-variant">{vendors.length} Vendors</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-secondary">
              <span className="material-symbols-outlined text-xl">filter_list</span> Filters
            </button>
            <button onClick={openAddPerson} className="btn-primary">
              <span className="material-symbols-outlined text-xl">person_add</span> Add Person
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="w-full max-w-xl mb-6">
          <input className="input-base" placeholder="Search by name, email, role, or specialty..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Tabs */}
        <TabBar
          tabs={TABS}
          value={activeTab}
          onChange={key => { setActiveTab(key as PeopleTab); setSearch('') }}
          className="mb-8"
        />

        {/* ── ALL TAB ── */}
        {activeTab === 'all' && (
          <div className="space-y-3">
            {(authLoading || loading) ? (
              <LoadingState label="Loading..." size="panel" />
            ) : (
              <>
                {filteredTenants.map(t => (
                  <button
                    key={t.id}
                    onClick={() => { setSelectedTenant(t); setActiveTab('tenants'); setTenantDetailTab('payments') }}
                    className="w-full bg-surface-container-lowest rounded-2xl px-4 py-4 flex items-center gap-3 hover:shadow-card transition-all text-left"
                  >
                    <div className="w-11 h-11 rounded-full bg-secondary-fixed text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">{getInitials(`${t.first_name} ${t.last_name}`)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                        <p className="font-bold text-sm text-on-surface">{t.first_name} {t.last_name}</p>
                        <span className="badge bg-secondary-container text-on-secondary-container">Tenant</span>
                      </div>
                      <p className="text-xs text-on-surface-variant">{t.property ? `${t.property.name}${t.unit ? ` · Unit ${t.unit.unit_number}` : ''}` : t.email}</p>
                    </div>
                    <span className="material-symbols-outlined text-outline-variant text-lg flex-shrink-0">chevron_right</span>
                  </button>
                ))}
                {filteredTeam.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setActiveTab('team')}
                    className="w-full bg-surface-container-lowest rounded-2xl px-4 py-4 flex items-center gap-3 hover:shadow-card transition-all text-left"
                  >
                    <div className="w-11 h-11 rounded-full bg-primary-container/30 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">{getInitials(m.name)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                        <p className="font-bold text-sm text-on-surface">{m.name}</p>
                        <span className="badge bg-primary-container/30 text-primary">Team</span>
                      </div>
                      <p className="text-xs text-on-surface-variant">{m.role} · {m.email}</p>
                    </div>
                    <span className="material-symbols-outlined text-outline-variant text-lg flex-shrink-0">chevron_right</span>
                  </button>
                ))}
                {filteredVendors.map(v => {
                  const sp = SPECIALTY_STYLE[v.specialty]
                  return (
                    <button
                      key={v.id}
                      onClick={() => setActiveTab('vendors')}
                      className="w-full bg-surface-container-lowest rounded-2xl px-4 py-4 flex items-center gap-3 hover:shadow-card transition-all text-left"
                    >
                      <div className="w-11 h-11 rounded-full bg-tertiary-container/20 text-on-tertiary-fixed-variant flex items-center justify-center font-bold text-sm flex-shrink-0">{getInitials(v.name)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                          <p className="font-bold text-sm text-on-surface">{v.name}</p>
                          <span className="badge bg-tertiary-container/20 text-on-tertiary-fixed-variant">Vendor</span>
                          <span className={cn('badge', sp.bg, sp.text)}>{sp.label}</span>
                        </div>
                        <p className="text-xs text-on-surface-variant">{v.company} · {v.email}</p>
                      </div>
                      <span className="material-symbols-outlined text-outline-variant text-lg flex-shrink-0">chevron_right</span>
                    </button>
                  )
                })}
                {filteredTenants.length + filteredTeam.length + filteredVendors.length === 0 && (
                  <EmptyState
                    icon={search ? 'search_off' : 'group_add'}
                    title={search ? `No results for "${search}"` : 'No people added yet'}
                    size="panel"
                  />
                )}
              </>
            )}
          </div>
        )}

        {/* ── TENANTS TAB ── */}
        {activeTab === 'tenants' && (
          loading ? (
            <LoadingState size="panel" />
          ) : filteredTenants.length === 0 ? (
            <EmptyState
              icon="group_add"
              title={search ? `No tenants match "${search}"` : 'No tenants yet'}
              size="panel"
              action={!search ? <Button onClick={openAddPerson} size="sm">Add First Tenant</Button> : undefined}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className={cn('lg:col-span-5 space-y-3', selectedTenant && 'hidden lg:block')}>
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-outline">{filteredTenants.length} tenants</span>
                </div>
                {filteredTenants.map(tenant => (
                  <button
                    key={tenant.id}
                    onClick={() => { setSelectedTenant(tenant); setTenantDetailTab('payments') }}
                    className={cn('w-full bg-surface-container-lowest p-5 rounded-2xl flex items-center justify-between transition-all text-left hover:shadow-xl hover:shadow-black/5', selectedTenant?.id === tenant.id && 'ring-2 ring-primary/20 shadow-md')}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-full bg-secondary-fixed text-primary flex items-center justify-center font-bold text-lg flex-shrink-0">{getInitials(`${tenant.first_name} ${tenant.last_name}`)}</div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-on-surface text-sm truncate">{tenant.first_name} {tenant.last_name}</h3>
                        <p className="text-xs text-on-surface-variant font-medium truncate">{tenant.email}</p>
                        {tenant.property && (
                          <p className="text-[10px] text-primary font-semibold mt-0.5 flex items-center gap-1 truncate">
                            <span className="material-symbols-outlined text-[10px] flex-shrink-0">location_on</span>
                            <span className="truncate">{tenant.property.name}{tenant.unit ? ` · Unit ${tenant.unit.unit_number}` : ''}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <span className={cn('badge flex-shrink-0', getStatusColor(tenant.status))}>{tenant.status}</span>
                  </button>
                ))}
              </div>

              {selectedTenant && (
                <div className="lg:col-span-7 space-y-5">
                  <button
                    className="lg:hidden flex items-center gap-1.5 text-primary text-sm font-semibold mb-2"
                    onClick={() => setSelectedTenant(null)}
                  >
                    <span className="material-symbols-outlined text-base">arrow_back</span> All Tenants
                  </button>
                  <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-card">
                    <div className="flex items-start justify-between gap-4 mb-6">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="relative flex-shrink-0">
                          <div className="w-16 h-16 rounded-2xl bg-secondary-container text-primary flex items-center justify-center text-2xl font-bold">{getInitials(`${selectedTenant.first_name} ${selectedTenant.last_name}`)}</div>
                          <div className="absolute -bottom-1 -right-1 bg-primary text-white p-1 rounded-lg shadow-lg">
                            <span className="material-symbols-outlined text-xs material-symbols-filled">verified</span>
                          </div>
                        </div>
                        <div className="min-w-0">
                          <h2 className="text-xl font-headline font-extrabold tracking-tight text-on-surface truncate">{selectedTenant.first_name} {selectedTenant.last_name}</h2>
                          <p className="text-primary text-sm font-semibold flex items-center gap-1 mt-0.5 truncate">
                            <span className="material-symbols-outlined text-xs flex-shrink-0">mail</span><span className="truncate">{selectedTenant.email}</span>
                          </p>
                          {selectedTenant.property && (
                            <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5 truncate">
                              <span className="material-symbols-outlined text-xs flex-shrink-0">apartment</span>
                              <span className="truncate">{selectedTenant.property.name}{selectedTenant.unit ? ` · Unit ${selectedTenant.unit.unit_number}` : ''}</span>
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => openEditTenant(selectedTenant)} className="p-2.5 bg-surface-container-low rounded-xl text-primary hover:bg-surface-container-high transition-colors"><span className="material-symbols-outlined text-base">edit</span></button>
                        <button className="p-2.5 bg-surface-container-low rounded-xl text-primary hover:bg-surface-container-high transition-colors"><span className="material-symbols-outlined text-base">mail</span></button>
                        <button className="p-2.5 bg-surface-container-low rounded-xl text-primary hover:bg-surface-container-high transition-colors"><span className="material-symbols-outlined text-base">call</span></button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                      {[
                        { label: 'Rent',        value: activeLease ? formatCurrency(activeLease.rent_amount) : '—' },
                        { label: 'Lease Ends',  value: activeLease ? formatDate(activeLease.end_date, 'MMM yyyy') : '—' },
                        { label: 'Deposit',     value: activeLease ? formatCurrency(activeLease.security_deposit) : '—' },
                        { label: 'Credit Score',value: selectedTenant.credit_score?.toString() ?? 'N/A' },
                      ].map(item => (
                        <div key={item.label} className="bg-surface-container-low rounded-2xl p-4">
                          <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1">{item.label}</p>
                          <p className="text-xl font-extrabold text-on-surface">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    {(['payments', 'maintenance'] as const).map(tab => (
                      <button key={tab} onClick={() => setTenantDetailTab(tab)} className={cn('px-6 py-3 rounded-xl text-sm font-bold transition-all', tenantDetailTab === tab ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high')}>
                        {tab === 'payments' ? 'Payment History' : 'Maintenance'}
                      </button>
                    ))}
                  </div>
                  {tenantDetailTab === 'payments' && (
                    <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-card">
                      {tenantPayments.length === 0 ? (
                        <div className="text-center py-8"><span className="material-symbols-outlined text-3xl text-outline block mb-2">receipt_long</span><p className="text-on-surface-variant text-sm">No payment history yet.</p></div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left min-w-[320px]">
                            <thead><tr className="border-b border-surface-container">
                              <th className="pb-4 text-xs font-bold text-outline uppercase tracking-widest">Date</th>
                              <th className="pb-4 text-xs font-bold text-outline uppercase tracking-widest hidden sm:table-cell">Description</th>
                              <th className="pb-4 text-xs font-bold text-outline uppercase tracking-widest text-right">Amount</th>
                              <th className="pb-4 text-xs font-bold text-outline uppercase tracking-widest text-right">Status</th>
                            </tr></thead>
                            <tbody className="divide-y divide-surface-container">
                              {tenantPayments.map(p => (
                                <tr key={p.id}>
                                  <td className="py-5 text-sm font-semibold">{formatDate(p.due_date)}</td>
                                  <td className="py-5 text-sm text-on-surface-variant hidden sm:table-cell">Monthly Rent</td>
                                  <td className="py-5 text-sm font-bold text-on-surface text-right">{formatCurrency(p.amount)}</td>
                                  <td className="py-5 text-right"><span className={cn('badge', getStatusColor(p.status))}>{p.status}</span></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                  {tenantDetailTab === 'maintenance' && (
                    <div className="bg-surface-container-lowest rounded-3xl p-8 text-center text-on-surface-variant shadow-card">
                      <span className="material-symbols-outlined text-4xl mb-3 block">build</span>
                      <p className="font-semibold">Coming soon</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        )}

        {/* ── TEAM TAB ── */}
        {activeTab === 'team' && (
          loading ? (
            <LoadingState size="panel" />
          ) : filteredTeam.length === 0 ? (
            <EmptyState
              icon="badge"
              title={search ? `No team members match "${search}"` : 'No team members yet'}
              size="panel"
              action={!search ? <Button onClick={openAddPerson} size="sm">Add Team Member</Button> : undefined}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTeam.map(member => (
                <div key={member.id} className="bg-surface-container-lowest rounded-2xl p-6 shadow-card hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary-container/30 text-primary flex items-center justify-center font-bold text-xl">{getInitials(member.name)}</div>
                    <span className={cn('badge', member.status === 'active' ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-high text-on-surface-variant')}>{member.status}</span>
                  </div>
                  <h3 className="font-bold text-on-surface text-base mb-0.5">{member.name}</h3>
                  <p className="text-xs font-semibold text-primary mb-4">{member.role}</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-on-surface-variant"><span className="material-symbols-outlined text-sm text-outline">mail</span>{member.email}</div>
                    {member.phone && <div className="flex items-center gap-2 text-xs text-on-surface-variant"><span className="material-symbols-outlined text-sm text-outline">call</span>{member.phone}</div>}
                  </div>
                  <div className="mt-5 flex gap-2">
                    <button className="flex-1 py-2.5 rounded-xl bg-primary-container/20 text-primary text-xs font-bold hover:bg-primary-container/40 transition-colors">Message</button>
                    <button className="flex-1 py-2.5 rounded-xl bg-surface-container text-on-surface-variant text-xs font-bold hover:bg-surface-container-high transition-colors">View Profile</button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* ── VENDORS TAB ── */}
        {activeTab === 'vendors' && (
          loading ? (
            <LoadingState size="panel" />
          ) : filteredVendors.length === 0 ? (
            <EmptyState
              icon="handyman"
              title={search ? `No vendors match "${search}"` : 'No vendors yet'}
              size="panel"
              action={!search ? <Button onClick={openAddPerson} size="sm">Add Vendor</Button> : undefined}
            />
          ) : (
            <div className="space-y-4">
              {filteredVendors.map(vendor => {
                const sp = SPECIALTY_STYLE[vendor.specialty]
                return (
                  <div key={vendor.id} className="bg-surface-container-lowest rounded-2xl p-5 shadow-card hover:shadow-md transition-all flex items-center gap-5">
                    <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0', sp.bg)}>
                      <span className={cn('material-symbols-outlined text-2xl', sp.text)}>{sp.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-bold text-on-surface">{vendor.name}</h3>
                        <span className={cn('badge', sp.bg, sp.text)}>{sp.label}</span>
                      </div>
                      <p className="text-xs font-semibold text-on-surface-variant mb-2">{vendor.company}</p>
                      <StarRating rating={vendor.rating} />
                    </div>
                    <div className="hidden md:flex flex-col items-end gap-2 flex-shrink-0">
                      <p className="text-xs text-on-surface-variant">{vendor.phone}</p>
                      <div className="flex gap-2 mt-1">
                        <button className="px-4 py-2 rounded-xl bg-primary-container/20 text-primary text-xs font-bold hover:bg-primary-container/40 transition-colors">Contact</button>
                        <button className="px-4 py-2 rounded-xl bg-surface-container text-on-surface-variant text-xs font-bold hover:bg-surface-container-high transition-colors">Job History</button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}
      </div>

      {/* ── Edit Tenant Modal ── */}
      <Modal open={showEditTenant} onClose={() => setShowEditTenant(false)} title="Edit Tenant" size="md">
        <form onSubmit={handleEditTenant} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="First Name">
              <input required className="input-base" value={editForm.first_name} onChange={e => setEditForm(f => ({ ...f, first_name: e.target.value }))} />
            </FormField>
            <FormField label="Last Name">
              <input required className="input-base" value={editForm.last_name} onChange={e => setEditForm(f => ({ ...f, last_name: e.target.value }))} />
            </FormField>
          </div>
          <FormField label="Email">
            <input required type="email" className="input-base" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
          </FormField>
          <FormField label="Phone">
            <input className="input-base" value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} />
          </FormField>
          <FormField label="Property">
            <select className="input-base" value={editForm.property_id} onChange={e => setEditForm(f => ({ ...f, property_id: e.target.value, unit_id: '' }))}>
              <option value="">— None —</option>
              {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </FormField>
          <FormField label="Unit">
            <select className="input-base" value={editForm.unit_id} onChange={e => {
              const unit = editUnits.find(u => u.id === e.target.value)
              setEditForm(f => ({ ...f, unit_id: e.target.value, property_id: unit?.property_id ?? f.property_id }))
            }}>
              <option value="">— Unassigned —</option>
              {editUnits.filter(u => !editForm.property_id || u.property_id === editForm.property_id).map(u => (
                <option key={u.id} value={u.id}>Unit {u.unit_number}{u.id === selectedTenant?.unit_id ? ' (current)' : ''}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Assign Team Member">
            <select className="input-base" value={editForm.team_member_id} onChange={e => setEditForm(f => ({ ...f, team_member_id: e.target.value }))}>
              <option value="">— None —</option>
              {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name} — {m.role}</option>)}
            </select>
          </FormField>
          <FormField label="Status">
            <select className="input-base" value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value as TenantRow['status'] }))}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </FormField>
          {editError && <p className="text-sm text-error">{editError}</p>}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowEditTenant(false)} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={editSubmitting} className="flex-1">{editSubmitting ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        </form>
      </Modal>

      {/* ── Add Person Modal ── */}
      <Modal open={showAddPerson} onClose={closeModal} title={modalStep === 1 ? 'Add Person' : personType === 'tenant' ? 'New Tenant' : personType === 'team_member' ? 'New Team Member' : 'New Vendor'} size="md">

        {/* Step 1 — Type selection */}
        {modalStep === 1 && (
          <div className="space-y-3">
            <p className="text-sm text-on-surface-variant mb-4">Who would you like to add?</p>
            {([
              { type: 'tenant' as PersonType,      icon: 'person',    label: 'Tenant',       desc: 'A renter living in one of your properties' },
              { type: 'team_member' as PersonType, icon: 'badge',     label: 'Team Member',  desc: 'Staff who help manage your portfolio' },
              { type: 'vendor' as PersonType,      icon: 'handyman',  label: 'Vendor',       desc: 'Contractors and service providers' },
            ]).map(opt => (
              <button
                key={opt.type}
                onClick={() => selectType(opt.type)}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-outline-variant/30 hover:border-primary/30 hover:bg-primary/5 transition-all text-left group"
              >
                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center group-hover:bg-primary-container/20 transition-colors flex-shrink-0">
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary">{opt.icon}</span>
                </div>
                <div>
                  <p className="font-bold text-on-surface">{opt.label}</p>
                  <p className="text-xs text-on-surface-variant">{opt.desc}</p>
                </div>
                <span className="material-symbols-outlined text-outline-variant ml-auto">chevron_right</span>
              </button>
            ))}
          </div>
        )}

        {/* Step 2 — Tenant form */}
        {modalStep === 2 && personType === 'tenant' && (
          <form onSubmit={handleAddTenant} className="space-y-4">
            <button type="button" onClick={() => setModalStep(1)} className="flex items-center gap-1 text-xs font-semibold text-primary mb-2 hover:underline">
              <span className="material-symbols-outlined text-sm">arrow_back</span> Back
            </button>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="First Name">
                <input required className="input-base" placeholder="Jane" value={tenantForm.first_name} onChange={e => setTenantForm(f => ({ ...f, first_name: e.target.value }))} />
              </FormField>
              <FormField label="Last Name">
                <input required className="input-base" placeholder="Smith" value={tenantForm.last_name} onChange={e => setTenantForm(f => ({ ...f, last_name: e.target.value }))} />
              </FormField>
            </div>
            <FormField label="Email">
              <input required type="email" className="input-base" placeholder="jane@email.com" value={tenantForm.email} onChange={e => setTenantForm(f => ({ ...f, email: e.target.value }))} />
            </FormField>
            <FormField label="Phone">
              <input className="input-base" placeholder="+1 (555) 000-0000" value={tenantForm.phone} onChange={e => setTenantForm(f => ({ ...f, phone: e.target.value }))} />
            </FormField>
            <FormField label="Move-in Date" optional>
              <input type="date" className="input-base" value={tenantForm.move_in_date} onChange={e => setTenantForm(f => ({ ...f, move_in_date: e.target.value }))} />
            </FormField>
            <FormField label="Property" optional hint={properties.length === 0 ? 'No properties yet. Add a property first.' : undefined}>
              <select
                className="input-base"
                value={tenantForm.property_id}
                onChange={e => setTenantForm(f => ({ ...f, property_id: e.target.value, unit_id: '' }))}
              >
                <option value="">— Select property —</option>
                {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </FormField>
            <FormField
              label="Unit"
              optional
              hint={tenantForm.property_id && vacantUnits.filter(u => u.property_id === tenantForm.property_id).length === 0 ? 'No vacant units in this property.' : undefined}
            >
              <select
                className="input-base"
                value={tenantForm.unit_id}
                onChange={e => {
                  const unit = vacantUnits.find(u => u.id === e.target.value)
                  setTenantForm(f => ({ ...f, unit_id: e.target.value, property_id: unit?.property_id ?? f.property_id }))
                }}
              >
                <option value="">— Unassigned —</option>
                {vacantUnits
                  .filter(u => !tenantForm.property_id || u.property_id === tenantForm.property_id)
                  .map(u => <option key={u.id} value={u.id}>Unit {u.unit_number}</option>)}
              </select>
            </FormField>
            <FormField label="Assign Team Member" optional hint={teamMembers.length === 0 ? 'No team members yet. Add a team member first.' : undefined}>
              <select className="input-base" value={tenantForm.team_member_id} onChange={e => setTenantForm(f => ({ ...f, team_member_id: e.target.value }))}>
                <option value="">— None —</option>
                {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name} — {m.role}</option>)}
              </select>
            </FormField>
            {formError && <p className="text-sm text-error">{formError}</p>}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={closeModal} className="flex-1">Cancel</Button>
              <Button type="submit" disabled={submitting} className="flex-1">{submitting ? 'Adding...' : 'Add Tenant'}</Button>
            </div>
          </form>
        )}

        {/* Step 2 — Team Member form */}
        {modalStep === 2 && personType === 'team_member' && (
          <form onSubmit={handleAddTeamMember} className="space-y-4">
            <button type="button" onClick={() => setModalStep(1)} className="flex items-center gap-1 text-xs font-semibold text-primary mb-2 hover:underline">
              <span className="material-symbols-outlined text-sm">arrow_back</span> Back
            </button>
            <FormField label="Full Name">
              <input required className="input-base" placeholder="Alex Johnson" value={teamForm.name} onChange={e => setTeamForm(f => ({ ...f, name: e.target.value }))} />
            </FormField>
            <FormField label="Role">
              <input required className="input-base" placeholder="e.g. Property Manager, Leasing Agent" value={teamForm.role} onChange={e => setTeamForm(f => ({ ...f, role: e.target.value }))} />
            </FormField>
            <FormField label="Email">
              <input required type="email" className="input-base" placeholder="alex@yourcompany.com" value={teamForm.email} onChange={e => setTeamForm(f => ({ ...f, email: e.target.value }))} />
            </FormField>
            <FormField label="Phone" optional>
              <input className="input-base" placeholder="+1 (555) 000-0000" value={teamForm.phone} onChange={e => setTeamForm(f => ({ ...f, phone: e.target.value }))} />
            </FormField>
            {formError && <p className="text-sm text-error">{formError}</p>}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={closeModal} className="flex-1">Cancel</Button>
              <Button type="submit" disabled={submitting} className="flex-1">{submitting ? 'Adding...' : 'Add Team Member'}</Button>
            </div>
          </form>
        )}

        {/* Step 2 — Vendor form */}
        {modalStep === 2 && personType === 'vendor' && (
          <form onSubmit={handleAddVendor} className="space-y-4">
            <button type="button" onClick={() => setModalStep(1)} className="flex items-center gap-1 text-xs font-semibold text-primary mb-2 hover:underline">
              <span className="material-symbols-outlined text-sm">arrow_back</span> Back
            </button>
            <FormField label="Contact Name">
              <input required className="input-base" placeholder="Mike Torres" value={vendorForm.name} onChange={e => setVendorForm(f => ({ ...f, name: e.target.value }))} />
            </FormField>
            <FormField label="Company">
              <input required className="input-base" placeholder="Torres HVAC & Plumbing" value={vendorForm.company} onChange={e => setVendorForm(f => ({ ...f, company: e.target.value }))} />
            </FormField>
            <FormField label="Specialty">
              <select className="input-base" value={vendorForm.specialty} onChange={e => setVendorForm(f => ({ ...f, specialty: e.target.value as VendorRow['specialty'] }))}>
                <option value="plumbing">Plumbing</option>
                <option value="electrical">Electrical</option>
                <option value="hvac">HVAC</option>
                <option value="landscaping">Landscaping</option>
                <option value="general">General</option>
                <option value="cleaning">Cleaning</option>
              </select>
            </FormField>
            <FormField label="Email">
              <input required type="email" className="input-base" placeholder="mike@company.com" value={vendorForm.email} onChange={e => setVendorForm(f => ({ ...f, email: e.target.value }))} />
            </FormField>
            <FormField label="Phone" optional>
              <input className="input-base" placeholder="+1 (555) 000-0000" value={vendorForm.phone} onChange={e => setVendorForm(f => ({ ...f, phone: e.target.value }))} />
            </FormField>
            {formError && <p className="text-sm text-error">{formError}</p>}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={closeModal} className="flex-1">Cancel</Button>
              <Button type="submit" disabled={submitting} className="flex-1">{submitting ? 'Adding...' : 'Add Vendor'}</Button>
            </div>
          </form>
        )}
      </Modal>
    </AppLayout>
  )
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface Profile {
  id: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'tenant'
  avatar_url?: string
  phone?: string
  created_at: string
  updated_at: string
}

// ─── Properties ──────────────────────────────────────────────────────────────
export interface Property {
  id: string
  manager_id: string
  name: string
  address: string
  city: string
  state: string
  zip: string
  type: 'apartment' | 'house' | 'condo' | 'commercial'
  image_url?: string
  description?: string
  created_at: string
  updated_at: string
  // Computed from joins
  total_units?: number
  occupied_units?: number
  monthly_revenue?: number
  occupancy_rate?: number
  units?: Unit[]
}

// ─── Units ────────────────────────────────────────────────────────────────────
export interface Unit {
  id: string
  property_id: string
  unit_number: string
  floor?: number
  bedrooms: number
  bathrooms: number
  sqft?: number
  rent_amount: number
  status: 'occupied' | 'vacant' | 'maintenance'
  created_at: string
  property?: Property
  tenant?: Tenant
}

// ─── Tenants ──────────────────────────────────────────────────────────────────
export interface Tenant {
  id: string
  manager_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  avatar_url?: string
  unit_id?: string
  property_id?: string
  status: 'active' | 'inactive' | 'pending'
  move_in_date?: string
  credit_score?: number
  emergency_contact_name?: string
  emergency_contact_phone?: string
  emergency_contact_relationship?: string
  notes?: string
  created_at: string
  updated_at: string
  // Computed / joined
  unit?: Unit
  property?: Property
  leases?: Lease[]
  payments?: Payment[]
  payment_status?: 'current' | 'overdue' | 'partial'
}

// ─── Leases ───────────────────────────────────────────────────────────────────
export interface Lease {
  id: string
  tenant_id: string
  unit_id: string
  property_id: string
  start_date: string
  end_date: string
  rent_amount: number
  security_deposit: number
  status: 'active' | 'expired' | 'pending' | 'terminated'
  renewal_status?: 'offered' | 'accepted' | 'declined' | null
  terms?: string
  signed_at?: string
  created_at: string
  updated_at: string
  // Joined
  tenant?: Tenant
  unit?: Unit
  property?: Property
  documents?: LeaseDocument[]
}

export interface LeaseDocument {
  id: string
  lease_id: string
  name: string
  url: string
  type: 'lease' | 'addendum' | 'notice'
  signed_at?: string
  uploaded_at: string
}

// ─── Payments ─────────────────────────────────────────────────────────────────
export interface Payment {
  id: string
  tenant_id: string
  lease_id: string
  unit_id: string
  property_id: string
  amount: number
  due_date: string
  paid_date?: string
  status: 'paid' | 'pending' | 'overdue' | 'partial' | 'failed'
  method?: 'ach' | 'credit_card' | 'check' | 'cash' | 'wire'
  late_fee?: number
  transaction_id?: string
  notes?: string
  created_at: string
  updated_at: string
  // Joined
  tenant?: Tenant
  unit?: Unit
  property?: Property
}

export interface PaymentSummary {
  total_collected: number
  outstanding: number
  overdue_count: number
  pending_amount: number
  collection_rate: number
  monthly_trend: { month: string; amount: number }[]
}

// ─── Maintenance ──────────────────────────────────────────────────────────────
export interface MaintenanceRequest {
  id: string
  tenant_id: string
  unit_id: string
  property_id: string
  title: string
  description: string
  category: 'plumbing' | 'electrical' | 'hvac' | 'appliance' | 'structural' | 'other'
  priority: 'low' | 'medium' | 'high' | 'emergency'
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  assigned_to?: string
  scheduled_date?: string
  completed_date?: string
  estimated_cost?: number
  actual_cost?: number
  images?: string[]
  notes?: string
  created_at: string
  updated_at: string
  // Joined
  tenant?: Tenant
  unit?: Unit
  property?: Property
}

// ─── Communication ────────────────────────────────────────────────────────────
export interface Conversation {
  id: string
  manager_id: string
  tenant_id: string
  unit_id?: string
  last_message?: string
  last_message_at?: string
  unread_count: number
  created_at: string
  updated_at: string
  tenant?: Tenant
  unit?: Unit
  messages?: Message[]
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  sender_role: 'manager' | 'tenant'
  content: string
  read_at?: string
  created_at: string
  sender?: Profile
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export interface DashboardStats {
  total_rent_collected: number
  outstanding_balance: number
  overdue_tenants: number
  occupancy_rate: number
  upcoming_expirations: Lease[]
  revenue_trend: { day: string; amount: number }[]
  ai_risk_alerts: AiRiskAlert[]
}

export interface AiRiskAlert {
  tenant_id: string
  tenant_name: string
  unit_id: string
  risk_score: number
  reason: string
}

// ─── Reports ──────────────────────────────────────────────────────────────────
export interface ReportData {
  period: string
  monthly_income: number
  income_growth: number
  occupancy_rate: number
  portfolio_yield: number
  maintenance_costs: number
  net_operating_income: number
  total_units: number
  vacant_units: number
  revenue_by_property: { name: string; amount: number; color: string }[]
  monthly_trend: { month: string; income: number; expenses: number }[]
  key_insights: { title: string; description: string; type: 'positive' | 'warning' | 'neutral' }[]
}

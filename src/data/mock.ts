import type {
  Property, Tenant, Lease, Payment, MaintenanceRequest,
  Conversation, DashboardStats, ReportData,
} from '@/types'

export const PROPERTIES: Property[] = [
  {
    id: 'p1', manager_id: 'mgr1', name: 'The Azure Heights',
    address: '1244 East 86th St', city: 'New York', state: 'NY', zip: '10028',
    type: 'apartment', image_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
    total_units: 48, occupied_units: 45, monthly_revenue: 184200, occupancy_rate: 94.2,
    created_at: '2021-01-15', updated_at: '2024-07-01',
  },
  {
    id: 'p2', manager_id: 'mgr1', name: 'Willow Creek Loft',
    address: '220 Riverside Dr', city: 'Austin', state: 'TX', zip: '78701',
    type: 'apartment', image_url: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800',
    total_units: 12, occupied_units: 12, monthly_revenue: 42000, occupancy_rate: 100,
    created_at: '2021-06-20', updated_at: '2024-07-01',
  },
  {
    id: 'p3', manager_id: 'mgr1', name: 'Pacific View',
    address: '88 Ocean Blvd', city: 'Santa Monica', state: 'CA', zip: '90401',
    type: 'condo', image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
    total_units: 24, occupied_units: 21, monthly_revenue: 97650, occupancy_rate: 87.5,
    created_at: '2022-03-10', updated_at: '2024-07-01',
  },
]

export const TENANTS: Tenant[] = [
  {
    id: 't1', manager_id: 'mgr1', first_name: 'Sarah', last_name: 'Jenkins',
    email: 'sarah.jenkins@email.com', phone: '+1 (555) 234-5678',
    unit_id: 'u1', property_id: 'p1', status: 'active', payment_status: 'current',
    move_in_date: '2022-03-01', credit_score: 780, created_at: '2022-03-01', updated_at: '2024-07-01',
    emergency_contact_name: 'Tom Jenkins', emergency_contact_phone: '+1 (555) 999-0001', emergency_contact_relationship: 'Spouse',
  },
  {
    id: 't2', manager_id: 'mgr1', first_name: 'Marcus', last_name: 'Thorne',
    email: 'marcus.thorne@email.com', phone: '+1 (555) 876-5432',
    unit_id: 'u2', property_id: 'p1', status: 'active', payment_status: 'overdue',
    move_in_date: '2021-09-15', credit_score: 610, created_at: '2021-09-15', updated_at: '2024-07-01',
  },
  {
    id: 't3', manager_id: 'mgr1', first_name: 'Elena', last_name: 'Rodriguez',
    email: 'elena.r@email.com', phone: '+1 (555) 345-6789',
    unit_id: 'u3', property_id: 'p3', status: 'active', payment_status: 'current',
    move_in_date: '2023-01-20', credit_score: 820, created_at: '2023-01-20', updated_at: '2024-07-01',
  },
  {
    id: 't4', manager_id: 'mgr1', first_name: 'David', last_name: 'Chen',
    email: 'david.chen@email.com', phone: '+1 (555) 567-8901',
    unit_id: 'u4', property_id: 'p1', status: 'active', payment_status: 'current',
    move_in_date: '2023-05-01', credit_score: 755, created_at: '2023-05-01', updated_at: '2024-07-01',
  },
  {
    id: 't5', manager_id: 'mgr1', first_name: 'Jane', last_name: 'Doe',
    email: 'jane.doe@email.com', phone: '+1 (555) 456-7890',
    unit_id: 'u5', property_id: 'p2', status: 'active', payment_status: 'current',
    move_in_date: '2022-07-10', credit_score: 700, created_at: '2022-07-10', updated_at: '2024-07-01',
  },
]

export const LEASES: Lease[] = [
  {
    id: 'l1', tenant_id: 't1', unit_id: 'u1', property_id: 'p1',
    start_date: '2023-03-01', end_date: '2024-10-12', rent_amount: 2450,
    security_deposit: 5000, status: 'active', renewal_status: 'offered',
    created_at: '2023-02-15', updated_at: '2024-07-01',
  },
  {
    id: 'l2', tenant_id: 't2', unit_id: 'u2', property_id: 'p1',
    start_date: '2021-09-15', end_date: '2024-09-14', rent_amount: 3450,
    security_deposit: 6900, status: 'active',
    created_at: '2021-09-01', updated_at: '2024-07-01',
  },
  {
    id: 'l3', tenant_id: 't3', unit_id: 'u3', property_id: 'p3',
    start_date: '2023-01-20', end_date: '2024-11-30', rent_amount: 2100,
    security_deposit: 4200, status: 'active', renewal_status: 'accepted',
    created_at: '2023-01-05', updated_at: '2024-07-01',
  },
  {
    id: 'l4', tenant_id: 't4', unit_id: 'u4', property_id: 'p1',
    start_date: '2023-05-01', end_date: '2025-01-05', rent_amount: 12800,
    security_deposit: 25600, status: 'active',
    created_at: '2023-04-15', updated_at: '2024-07-01',
  },
  {
    id: 'l5', tenant_id: 't5', unit_id: 'u5', property_id: 'p2',
    start_date: '2022-07-10', end_date: '2023-10-31', rent_amount: 2800,
    security_deposit: 5600, status: 'expired',
    created_at: '2022-06-25', updated_at: '2024-07-01',
  },
]

export const PAYMENTS: Payment[] = [
  {
    id: 'pay1', tenant_id: 't1', lease_id: 'l1', unit_id: 'u1', property_id: 'p1',
    amount: 2450, due_date: '2024-10-12', paid_date: '2024-10-01',
    status: 'paid', method: 'credit_card', transaction_id: 'TXN-2023-0842',
    created_at: '2024-09-01', updated_at: '2024-10-01',
  },
  {
    id: 'pay2', tenant_id: 't1', lease_id: 'l1', unit_id: 'u1', property_id: 'p1',
    amount: 2450, due_date: '2024-09-01', paid_date: '2024-09-01',
    status: 'paid', method: 'credit_card',
    created_at: '2024-08-01', updated_at: '2024-09-01',
  },
  {
    id: 'pay3', tenant_id: 't2', lease_id: 'l2', unit_id: 'u2', property_id: 'p1',
    amount: 4100, due_date: '2024-10-10', status: 'overdue', late_fee: 205,
    created_at: '2024-09-01', updated_at: '2024-10-10',
  },
  {
    id: 'pay4', tenant_id: 't3', lease_id: 'l3', unit_id: 'u3', property_id: 'p3',
    amount: 1850, due_date: '2024-10-01', status: 'pending', method: 'ach',
    created_at: '2024-09-01', updated_at: '2024-09-01',
  },
  {
    id: 'pay5', tenant_id: 't1', lease_id: 'l1', unit_id: 'u1', property_id: 'p1',
    amount: 2450, due_date: '2024-08-01', paid_date: '2024-08-01',
    status: 'paid', method: 'credit_card',
    created_at: '2024-07-01', updated_at: '2024-08-01',
  },
]

export const MAINTENANCE_REQUESTS: MaintenanceRequest[] = [
  {
    id: 'm1', tenant_id: 't5', unit_id: 'u5', property_id: 'p2',
    title: 'Leaking Kitchen Sink',
    description: 'Water is pooling under the cabinet and starting to reach the hardwood floors. The pipe underneath the kitchen sink has a steady drip from the main U-bend connection. We\'ve placed a bucket underneath, but it\'s filling up every few hours.',
    category: 'plumbing', priority: 'emergency', status: 'open',
    images: ['https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400'],
    created_at: '2024-07-09T10:15:00Z', updated_at: '2024-07-09T10:15:00Z',
  },
  {
    id: 'm2', tenant_id: 't1', unit_id: 'u1', property_id: 'p1',
    title: 'HVAC Filter Replacement',
    description: 'Regular seasonal maintenance check and filter swap for all units in Block B.',
    category: 'hvac', priority: 'medium', status: 'in_progress',
    assigned_to: 'Mike Torres', scheduled_date: '2024-07-10',
    estimated_cost: 250,
    created_at: '2024-07-08T09:00:00Z', updated_at: '2024-07-08T14:00:00Z',
  },
  {
    id: 'm3', tenant_id: 't4', unit_id: 'u4', property_id: 'p1',
    title: 'Loose Door Handle',
    description: 'Bedroom door handle is loose and occasionally gets stuck from the inside.',
    category: 'structural', priority: 'low', status: 'open',
    estimated_cost: 75,
    created_at: '2024-07-06T11:00:00Z', updated_at: '2024-07-06T11:00:00Z',
  },
  {
    id: 'm4', tenant_id: 't3', unit_id: 'u3', property_id: 'p3',
    title: 'AC Not Cooling Properly',
    description: 'Air conditioner runs but apartment stays warm. Possible refrigerant issue.',
    category: 'hvac', priority: 'high', status: 'in_progress',
    assigned_to: 'Jake Wilson', scheduled_date: '2024-07-11', estimated_cost: 400,
    created_at: '2024-07-07T15:00:00Z', updated_at: '2024-07-09T09:00:00Z',
  },
  {
    id: 'm5', tenant_id: 't2', unit_id: 'u2', property_id: 'p1',
    title: 'Broken Dishwasher Door Latch',
    description: 'Dishwasher door latch is broken. Unit does not start.',
    category: 'appliance', priority: 'medium', status: 'completed',
    assigned_to: 'Mike Torres', completed_date: '2024-07-03', actual_cost: 180,
    created_at: '2024-07-01T08:00:00Z', updated_at: '2024-07-03T16:00:00Z',
  },
]

export const CONVERSATIONS: Conversation[] = [
  {
    id: 'c1', manager_id: 'mgr1', tenant_id: 't5',
    last_message: "I've attached the repair photos for the kitchen sink.",
    last_message_at: '2024-07-09T12:45:00Z', unread_count: 1,
    created_at: '2024-07-09T12:00:00Z', updated_at: '2024-07-09T12:45:00Z',
    messages: [
      { id: 'msg1', conversation_id: 'c1', sender_id: 't5', sender_role: 'tenant', content: "Hi! I noticed a small leak under the kitchen sink this morning. Could you send someone to check it out?", created_at: '2024-07-09T12:30:00Z' },
      { id: 'msg2', conversation_id: 'c1', sender_id: 't5', sender_role: 'tenant', content: "I've attached a photo for reference. It's just a slow drip for now.", created_at: '2024-07-09T12:31:00Z' },
      { id: 'msg3', conversation_id: 'c1', sender_id: 'mgr1', sender_role: 'manager', content: "Thanks for letting me know, Sarah! I'll dispatch a plumber right away. They should be there between 2 PM and 4 PM today. Does that work?", created_at: '2024-07-09T12:40:00Z' },
      { id: 'msg4', conversation_id: 'c1', sender_id: 't5', sender_role: 'tenant', content: "I've attached the repair photos for the kitchen sink.", created_at: '2024-07-09T12:45:00Z' },
    ],
  },
  {
    id: 'c2', manager_id: 'mgr1', tenant_id: 't2',
    last_message: "Great, thanks for the update!",
    last_message_at: '2024-07-09T10:20:00Z', unread_count: 0,
    created_at: '2024-07-08T09:00:00Z', updated_at: '2024-07-09T10:20:00Z',
    messages: [
      { id: 'msg5', conversation_id: 'c2', sender_id: 'mgr1', sender_role: 'manager', content: "Marcus, your rent was due on the 1st. Please remit payment as soon as possible to avoid additional late fees.", created_at: '2024-07-08T09:00:00Z' },
      { id: 'msg6', conversation_id: 'c2', sender_id: 't2', sender_role: 'tenant', content: "Great, thanks for the update!", created_at: '2024-07-09T10:20:00Z' },
    ],
  },
  {
    id: 'c3', manager_id: 'mgr1', tenant_id: 't3',
    last_message: "Payment confirmed for October.",
    last_message_at: '2024-07-08T18:00:00Z', unread_count: 0,
    created_at: '2024-07-07T10:00:00Z', updated_at: '2024-07-08T18:00:00Z',
    messages: [
      { id: 'msg7', conversation_id: 'c3', sender_id: 't3', sender_role: 'tenant', content: "Payment confirmed for October.", created_at: '2024-07-08T18:00:00Z' },
    ],
  },
]

export const DASHBOARD_STATS: DashboardStats = {
  total_rent_collected: 142850,
  outstanding_balance: 4210,
  overdue_tenants: 8,
  occupancy_rate: 96.4,
  revenue_trend: [
    { day: 'MON', amount: 18400 },
    { day: 'TUE', amount: 22100 },
    { day: 'WED', amount: 19800 },
    { day: 'THU', amount: 31200 },
    { day: 'FRI', amount: 38500 },
    { day: 'SAT', amount: 35400 },
    { day: 'SUN', amount: 24200 },
  ],
  upcoming_expirations: LEASES.filter(l => ['active', 'expired'].includes(l.status)),
  ai_risk_alerts: [
    { tenant_id: 't2', tenant_name: 'Marcus Thorne', unit_id: 'u2', risk_score: 88, reason: '2 late payments in last 3 months' },
    { tenant_id: 't3', tenant_name: 'Elena Rodriguez', unit_id: 'u3', risk_score: 72, reason: 'Recent inquiry patterns detected' },
    { tenant_id: 't4', tenant_name: 'David Chen', unit_id: 'u4', risk_score: 61, reason: 'Lease nearing expiration, no renewal' },
  ],
}

export const REPORT_DATA: ReportData = {
  period: 'August 2024',
  monthly_income: 42850,
  income_growth: 12.4,
  occupancy_rate: 94.2,
  portfolio_yield: 6.8,
  maintenance_costs: 8400,
  net_operating_income: 34450,
  total_units: 84,
  vacant_units: 5,
  revenue_by_property: [
    { name: 'Azure Heights', amount: 184200, color: '#003d9b' },
    { name: 'Pacific View', amount: 97650, color: '#0052cc' },
    { name: 'Willow Creek', amount: 42000, color: '#dae2ff' },
  ],
  monthly_trend: [
    { month: 'Mar', income: 121000, expenses: 9200 },
    { month: 'Apr', income: 128500, expenses: 7800 },
    { month: 'May', income: 131200, expenses: 11200 },
    { month: 'Jun', income: 135000, expenses: 8900 },
    { month: 'Jul', income: 138400, expenses: 8100 },
    { month: 'Aug', income: 142850, expenses: 8400 },
  ],
  key_insights: [
    { title: 'Optimize Rents', description: 'Three properties are 15% below market rate. Potential $2.4k/month increase.', type: 'positive' },
    { title: 'Operational Efficiency', description: 'Maintenance costs dropped 8% this quarter due to vendor renegotiation.', type: 'positive' },
    { title: 'Lease Renewals Due', description: '5 leases expire within 60 days. Start renewal campaigns now.', type: 'warning' },
  ],
}

export const PAYMENT_SUMMARY = {
  total_collected: 142850,
  outstanding: 12400,
  overdue: 3250,
  pending: 9150,
  collection_rate: 92,
  monthly_trend: REPORT_DATA.monthly_trend.map(m => ({ month: m.month, amount: m.income })),
}

import type {
  Property, Tenant, Lease, Payment, MaintenanceRequest,
  Conversation, DashboardStats, ReportData, ActivityFeedItem,
  TeamMember, Vendor, RecurringPayment, BankAccount,
  RentalApplication, Announcement,
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
  {
    id: 'p4', manager_id: 'mgr1', name: 'Metro Business Hub',
    address: '450 Commerce St', city: 'Chicago', state: 'IL', zip: '60601',
    type: 'commercial', image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
    total_units: 8, occupied_units: 7, monthly_revenue: 68000, occupancy_rate: 87.5,
    created_at: '2022-09-01', updated_at: '2024-07-01',
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

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'tm1', manager_id: 'mock', name: 'Alexander Graham', role: 'Property Manager',
    email: 'alexander@leasarr.com', phone: '+1 (555) 100-2000',
    status: 'active', created_at: '', updated_at: '',
  },
  {
    id: 'tm2', manager_id: 'mock', name: 'Rachel Moore', role: 'Assistant Manager',
    email: 'rachel@leasarr.com', phone: '+1 (555) 100-2001',
    status: 'active', created_at: '', updated_at: '',
  },
  {
    id: 'tm3', manager_id: 'mock', name: 'James Park', role: 'Leasing Agent',
    email: 'james@leasarr.com', phone: '+1 (555) 100-2002',
    status: 'active', created_at: '', updated_at: '',
  },
]

export const VENDORS: Vendor[] = [
  {
    id: 'v1', manager_id: 'mock', name: 'Mike Torres', company: 'Torres HVAC & Plumbing',
    specialty: 'plumbing', email: 'mike@torresplumbing.com', phone: '+1 (555) 300-1001',
    rating: 4.8, status: 'active', created_at: '', updated_at: '',
  },
  {
    id: 'v2', manager_id: 'mock', name: 'Jake Wilson', company: 'Wilson Electrical Solutions',
    specialty: 'electrical', email: 'jake@wilsonelec.com', phone: '+1 (555) 300-1002',
    rating: 4.6, status: 'active', created_at: '', updated_at: '',
  },
  {
    id: 'v3', manager_id: 'mock', name: 'Linda Park', company: 'GreenScape Landscaping',
    specialty: 'landscaping', email: 'linda@greenscape.com', phone: '+1 (555) 300-1003',
    rating: 4.9, status: 'active', created_at: '', updated_at: '',
  },
  {
    id: 'v4', manager_id: 'mock', name: 'Bob Hanson', company: 'Hanson General Contracting',
    specialty: 'general', email: 'bob@hansoncontracting.com', phone: '+1 (555) 300-1004',
    rating: 4.4, status: 'active', created_at: '', updated_at: '',
  },
]

export const ACTIVITY_FEED: ActivityFeedItem[] = [
  {
    id: 'a1', type: 'maintenance', time_label: '2h ago',
    title: 'New Maintenance Request',
    description: 'Leaking Kitchen Sink — Willow Creek Loft',
    property_name: 'Willow Creek Loft',
  },
  {
    id: 'a2', type: 'payment', time_label: '3h ago',
    title: 'Rent Overdue',
    description: 'Marcus Thorne — $4,100 overdue on Unit 4B',
    property_name: 'The Azure Heights',
  },
  {
    id: 'a3', type: 'message', time_label: '5h ago',
    title: 'New Tenant Message',
    description: 'Elena Rodriguez: "Payment confirmed for October."',
    property_name: 'Pacific View',
  },
  {
    id: 'a4', type: 'lease', time_label: '8h ago',
    title: 'Lease Expiring Soon',
    description: 'Sarah Jenkins — expires in 7 days, renewal offered',
    property_name: 'The Azure Heights',
  },
  {
    id: 'a5', type: 'payment', time_label: '1d ago',
    title: 'Rent Payment Received',
    description: 'David Chen — $12,800 paid via credit card',
    property_name: 'The Azure Heights',
  },
  {
    id: 'a6', type: 'maintenance', time_label: '2d ago',
    title: 'Maintenance Completed',
    description: 'Broken Dishwasher Door Latch — resolved by Mike Torres',
    property_name: 'The Azure Heights',
  },
]

export const RENTAL_APPLICATIONS: RentalApplication[] = [
  {
    id: 'app1', property_id: 'p1', unit_id: 'u3',
    applicant_name: 'Jordan Lee', email: 'jordan.lee@email.com', phone: '+1 (555) 400-1001',
    submitted_at: '2024-07-08T09:00:00Z', desired_move_in: '2024-08-01',
    monthly_income: 14000, credit_score: 740, status: 'reviewing',
  },
  {
    id: 'app2', property_id: 'p1',
    applicant_name: 'Priya Patel', email: 'priya.p@email.com', phone: '+1 (555) 400-1002',
    submitted_at: '2024-07-07T14:30:00Z', desired_move_in: '2024-08-15',
    monthly_income: 9500, credit_score: 710, status: 'pending',
  },
  {
    id: 'app3', property_id: 'p3',
    applicant_name: 'Carlos Ruiz', email: 'c.ruiz@email.com', phone: '+1 (555) 400-1003',
    submitted_at: '2024-07-05T11:00:00Z', desired_move_in: '2024-09-01',
    monthly_income: 12000, credit_score: 760, status: 'approved',
  },
  {
    id: 'app4', property_id: 'p1',
    applicant_name: 'Aisha Williams', email: 'aisha.w@email.com', phone: '+1 (555) 400-1004',
    submitted_at: '2024-07-03T10:00:00Z', desired_move_in: '2024-08-01',
    monthly_income: 7200, credit_score: 580, status: 'declined',
    notes: 'Credit score below threshold',
  },
  {
    id: 'app5', property_id: 'p4',
    applicant_name: 'TechFlow Inc.', email: 'leasing@techflow.com', phone: '+1 (555) 400-1005',
    submitted_at: '2024-07-09T15:00:00Z', desired_move_in: '2024-09-01',
    monthly_income: 85000, status: 'reviewing',
    notes: 'Commercial tenant — request for Suite 3B',
  },
]

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann1', title: 'Scheduled Water Shutdown — July 15',
    message: 'Due to routine maintenance, water will be shut off from 9 AM to 1 PM on July 15. We apologize for any inconvenience.',
    channels: ['email', 'sms', 'push'],
    property_ids: ['p1'],
    sent_at: '2024-07-10T08:00:00Z', recipients: 45, status: 'sent',
  },
  {
    id: 'ann2', title: 'Welcome New Residents — August Move-Ins',
    message: 'Please join us in welcoming new tenants moving in this August! Community orientation will be held August 2nd at 6 PM in the lobby.',
    channels: ['email', 'in_app'],
    property_ids: [],
    sent_at: '2024-07-09T10:00:00Z', recipients: 84, status: 'sent',
  },
  {
    id: 'ann3', title: 'Parking Lot Repaving — July 20–22',
    message: 'The main parking lot will be closed for repaving July 20–22. Temporary parking available on Commerce Street.',
    channels: ['push', 'sms'],
    property_ids: ['p2'],
    sent_at: '2024-07-08T09:00:00Z', recipients: 12, status: 'sent',
  },
  {
    id: 'ann4', title: 'Q3 Rent Statement Available',
    message: 'Your Q3 rent statement is now available in the tenant portal. Please review and contact us with any questions.',
    channels: ['email', 'in_app', 'push'],
    property_ids: [],
    sent_at: '2024-07-12T09:00:00Z', recipients: 84, status: 'scheduled',
  },
]

export const RECURRING_PAYMENTS: RecurringPayment[] = [
  {
    id: 'rp1', tenant_id: 't1', property_id: 'p1', unit_id: 'u1',
    amount: 2450, frequency: 'monthly', next_due: '2024-11-01',
    method: 'credit_card', status: 'active', created_at: '2023-03-01',
  },
  {
    id: 'rp2', tenant_id: 't2', property_id: 'p1', unit_id: 'u2',
    amount: 3450, frequency: 'monthly', next_due: '2024-11-01',
    method: 'ach', status: 'paused', created_at: '2021-09-15',
  },
  {
    id: 'rp3', tenant_id: 't3', property_id: 'p3', unit_id: 'u3',
    amount: 2100, frequency: 'monthly', next_due: '2024-11-01',
    method: 'ach', status: 'active', created_at: '2023-01-20',
  },
  {
    id: 'rp4', tenant_id: 't4', property_id: 'p1', unit_id: 'u4',
    amount: 12800, frequency: 'monthly', next_due: '2024-11-01',
    method: 'credit_card', status: 'active', created_at: '2023-05-01',
  },
  {
    id: 'rp5', tenant_id: 't5', property_id: 'p2', unit_id: 'u5',
    amount: 2800, frequency: 'monthly', next_due: '2024-11-10',
    method: 'check', status: 'cancelled', created_at: '2022-07-10',
  },
]

export const BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 'ba1', bank_name: 'Chase Bank', account_name: 'Operations Account',
    account_type: 'checking', last_four: '4821', balance: 287340,
    status: 'connected', connected_at: '2023-01-15',
    property_ids: ['p1', 'p2'],
  },
  {
    id: 'ba2', bank_name: 'Wells Fargo', account_name: 'Reserve Account',
    account_type: 'savings', last_four: '9034', balance: 145000,
    status: 'connected', connected_at: '2023-01-15',
    property_ids: ['p3'],
  },
  {
    id: 'ba3', bank_name: 'Bank of America', account_name: 'Commercial Receipts',
    account_type: 'checking', last_four: '2267', balance: 94810,
    status: 'pending', connected_at: '2024-07-01',
    property_ids: ['p4'],
  },
]

export const PAYMENT_SUMMARY = {
  total_collected: 142850,
  outstanding: 12400,
  overdue: 3250,
  pending: 9150,
  collection_rate: 92,
  monthly_trend: REPORT_DATA.monthly_trend.map(m => ({ month: m.month, amount: m.income })),
}

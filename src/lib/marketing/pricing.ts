export type TierKey = 'starter' | 'growth' | 'pro' | 'enterprise'
export type BillingInterval = 'monthly' | 'annual'

export interface PricingTier {
  key: TierKey
  name: string
  unitCap: number | null
  unitCapLabel: string
  monthly: number | null
  annual: number | null
  annualMonthly: number | null
  annualSavings: number | null
  seats: number | string
  storageGb: number | string
  ctaLabel: string
  ctaHref: string
  highlights: string[]
  popular?: boolean
}

export const PRICING_TIERS: PricingTier[] = [
  {
    key: 'starter',
    name: 'Starter',
    unitCap: 10,
    unitCapLabel: 'For up to 10 units',
    monthly: 29,
    annual: 290,
    annualMonthly: 24.17,
    annualSavings: 58,
    seats: 1,
    storageGb: 1,
    ctaLabel: 'Start free trial',
    ctaHref: '/auth/register?plan=starter',
    highlights: [
      '1 manager seat',
      '1 GB document storage',
      'Properties, tenants, leases, payments & maintenance',
      'Tenant portal',
      'Real-time notifications',
    ],
  },
  {
    key: 'growth',
    name: 'Growth',
    unitCap: 50,
    unitCapLabel: 'For up to 50 units',
    monthly: 79,
    annual: 790,
    annualMonthly: 65.83,
    annualSavings: 158,
    seats: 3,
    storageGb: 10,
    ctaLabel: 'Start free trial',
    ctaHref: '/auth/register?plan=growth',
    highlights: [
      '3 manager seats',
      '10 GB document storage',
      'Everything in Starter',
      'Reports & analytics + CSV export',
      'In-app messaging',
    ],
    popular: true,
  },
  {
    key: 'pro',
    name: 'Pro',
    unitCap: 200,
    unitCapLabel: 'For up to 200 units',
    monthly: 199,
    annual: 1990,
    annualMonthly: 165.83,
    annualSavings: 398,
    seats: 10,
    storageGb: 50,
    ctaLabel: 'Start free trial',
    ctaHref: '/auth/register?plan=pro',
    highlights: [
      '10 manager seats',
      '50 GB document storage',
      'Everything in Growth',
      'ACH payments & e-Sign (included)',
      'API access',
    ],
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    unitCap: null,
    unitCapLabel: 'For 200+ units',
    monthly: null,
    annual: null,
    annualMonthly: null,
    annualSavings: null,
    seats: 'Unlimited',
    storageGb: 'Unlimited',
    ctaLabel: 'Talk to sales',
    ctaHref: 'mailto:sales@leasarr.com?subject=Enterprise%20inquiry',
    highlights: [
      'Unlimited seats & storage',
      'Everything in Pro',
      'White-label branding',
      'Listing syndication (included)',
      'Dedicated CSM',
    ],
  },
]

export type CellValue = true | false | string

export interface CompareRow {
  group: string
  label: string
  values: [CellValue, CellValue, CellValue, CellValue]
}

export const COMPARE_ROWS: CompareRow[] = [
  { group: 'Core management', label: 'Properties & units', values: [true, true, true, true] },
  { group: 'Core management', label: 'Tenants & leases', values: [true, true, true, true] },
  { group: 'Core management', label: 'Payments tracking', values: [true, true, true, true] },
  { group: 'Core management', label: 'Maintenance requests', values: [true, true, true, true] },
  { group: 'Core management', label: 'Vendor management', values: [true, true, true, true] },
  { group: 'Core management', label: 'Tenant portal', values: [true, true, true, true] },
  { group: 'Team & limits', label: 'Manager seats', values: ['1', '3', '10', 'Unlimited'] },
  { group: 'Team & limits', label: 'Document storage', values: ['1 GB', '10 GB', '50 GB', 'Unlimited'] },
  { group: 'Reporting & data', label: 'Reports & analytics', values: [false, true, true, true] },
  { group: 'Reporting & data', label: 'CSV export', values: [false, true, true, true] },
  { group: 'Reporting & data', label: 'In-app messaging', values: [false, true, true, true] },
  { group: 'Add-ons included', label: 'ACH payments', values: ['Add-on', 'Add-on', true, true] },
  { group: 'Add-ons included', label: 'e-Sign documents', values: ['Add-on', 'Add-on', true, true] },
  { group: 'Add-ons included', label: 'Listing syndication', values: ['Add-on', 'Add-on', 'Add-on', true] },
  { group: 'Platform', label: 'API access', values: [false, false, true, true] },
  { group: 'Platform', label: 'White-label branding', values: [false, false, false, true] },
  { group: 'Support', label: 'Support channel', values: ['—', 'Email', 'Email + chat', 'Dedicated CSM'] },
]

export interface Addon {
  key: string
  icon: string
  name: string
  price: string
  unit: string
  description: string
  includedOn?: string
}

export const PRICING_ADDONS: Addon[] = [
  {
    key: 'ach',
    icon: 'account_balance',
    name: 'ACH Payments',
    price: '$2',
    unit: '/transaction',
    description: 'Accept bank transfers directly. Funds land in your account in 2–3 business days.',
    includedOn: 'Pro+',
  },
  {
    key: 'screening',
    icon: 'person_search',
    name: 'Tenant Screening',
    price: '$20',
    unit: '/report',
    description: 'Credit, criminal, and eviction checks — all from a single request.',
  },
  {
    key: 'esign',
    icon: 'draw',
    name: 'e-Sign Documents',
    price: '$5',
    unit: '/document',
    description: 'Send leases and addenda for signature — no printing required.',
    includedOn: 'Pro+',
  },
  {
    key: 'syndication',
    icon: 'broadcast_on_home',
    name: 'Listing Syndication',
    price: '$10',
    unit: '/listing/mo',
    description: 'Push vacant units to major listing platforms automatically.',
  },
  {
    key: 'seat',
    icon: 'manage_accounts',
    name: 'Extra Manager Seat',
    price: '$12',
    unit: '/seat/mo',
    description: "Add team members beyond your plan's included seats.",
  },
  {
    key: 'storage',
    icon: 'folder_open',
    name: 'Extra Storage',
    price: '$5',
    unit: '/10 GB/mo',
    description: "Expand document storage beyond your plan's included limit.",
  },
]

export interface FAQItem {
  q: string
  a: string
}

export const PRICING_FAQ: FAQItem[] = [
  {
    q: 'What happens after the 30-day trial?',
    a: 'Your trial gives you full access to Growth features for 30 days. At the end, choose a plan to continue — or stay on the free tier with limited access. No automatic charges.',
  },
  {
    q: 'Do I need a credit card to start?',
    a: "No. You can start your 30-day Growth trial without entering any payment information. We'll remind you a few days before it ends.",
  },
  {
    q: 'What counts as a unit?',
    a: 'Any rentable space tracked in Leasarr — an apartment, a house, a commercial suite, or a storage unit. A property with 5 units counts as 5 toward your plan limit.',
  },
  {
    q: 'Can I switch plans later?',
    a: 'Yes. Upgrade or downgrade at any time from the Billing section in Settings. Upgrades take effect immediately; downgrades take effect at the next billing cycle.',
  },
  {
    q: 'How does the seat add-on work?',
    a: "Each plan includes a set number of manager seats. Add extra seats at $12/seat/mo. Seats can be removed at any time — you'll be credited for the unused portion.",
  },
  {
    q: 'Are early customers grandfathered?',
    a: "Yes. If you subscribe during our early-access period, your rate is locked in for the life of your subscription. We will never raise prices on existing subscribers without at least 90 days' notice.",
  },
]

export function recommendTier(units: number): TierKey {
  if (units <= 10) return 'starter'
  if (units <= 50) return 'growth'
  if (units <= 200) return 'pro'
  return 'enterprise'
}

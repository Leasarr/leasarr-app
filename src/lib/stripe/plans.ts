export type PlanKey = 'starter' | 'growth' | 'pro'

export interface PlanConfig {
  key: PlanKey
  name: string
  monthlyPrice: number
  annualTotal: number
  unitLimit: number
  seatLimit: number
  monthlyPriceId: string
  annualPriceId: string
}

export const PLANS: Record<PlanKey, PlanConfig> = {
  starter: {
    key: 'starter',
    name: 'Starter',
    monthlyPrice: 29,
    annualTotal: 290,
    unitLimit: 10,
    seatLimit: 1,
    monthlyPriceId: process.env.STRIPE_PRICE_STARTER_MONTHLY!,
    annualPriceId: process.env.STRIPE_PRICE_STARTER_ANNUAL!,
  },
  growth: {
    key: 'growth',
    name: 'Growth',
    monthlyPrice: 79,
    annualTotal: 790,
    unitLimit: 50,
    seatLimit: 3,
    monthlyPriceId: process.env.STRIPE_PRICE_GROWTH_MONTHLY!,
    annualPriceId: process.env.STRIPE_PRICE_GROWTH_ANNUAL!,
  },
  pro: {
    key: 'pro',
    name: 'Pro',
    monthlyPrice: 199,
    annualTotal: 1990,
    unitLimit: 200,
    seatLimit: 10,
    monthlyPriceId: process.env.STRIPE_PRICE_PRO_MONTHLY!,
    annualPriceId: process.env.STRIPE_PRICE_PRO_ANNUAL!,
  },
}

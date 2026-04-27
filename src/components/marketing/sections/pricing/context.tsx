'use client'
import { createContext, useContext, useState } from 'react'
import { recommendTier } from '@/lib/marketing/pricing'
import type { BillingInterval, TierKey } from '@/lib/marketing/pricing'

interface PricingControls {
  billingInterval: BillingInterval
  setBillingInterval: (v: BillingInterval) => void
  unitsHint: number | null
  setUnitsHint: (v: number | null) => void
  recommendedTier: TierKey | null
}

const PricingContext = createContext<PricingControls | null>(null)

export function usePricing() {
  const ctx = useContext(PricingContext)
  if (!ctx) throw new Error('usePricing must be inside PricingControlsProvider')
  return ctx
}

export function PricingControlsProvider({
  initialBillingInterval = 'monthly',
  children,
}: {
  initialBillingInterval?: BillingInterval
  children: React.ReactNode
}) {
  const [billingInterval, setBillingInterval] = useState<BillingInterval>(initialBillingInterval)
  const [unitsHint, setUnitsHint] = useState<number | null>(null)

  const recommendedTier = unitsHint !== null ? recommendTier(unitsHint) : null

  return (
    <PricingContext.Provider value={{ billingInterval, setBillingInterval, unitsHint, setUnitsHint, recommendedTier }}>
      {children}
    </PricingContext.Provider>
  )
}

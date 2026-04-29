'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { type PlanKey } from '@/lib/stripe/plans'

export interface SubscriptionInfo {
  plan: PlanKey | null
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | null
  trialEnd: Date | null
  daysLeft: number | null
  isTrialing: boolean
  isActive: boolean
  isExpired: boolean
  loading: boolean
}

export function useSubscription(): SubscriptionInfo {
  const { profile } = useAuth()
  const supabase = createClient()
  const [data, setData] = useState<Omit<SubscriptionInfo, 'loading'>>({
    plan: null,
    status: null,
    trialEnd: null,
    daysLeft: null,
    isTrialing: false,
    isActive: false,
    isExpired: false,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return

    async function fetch() {
      setLoading(true)
      const { data: row } = await supabase
        .from('subscriptions')
        .select('plan, status, trial_end')
        .eq('manager_id', profile!.id)
        .maybeSingle()

      if (!row) {
        setLoading(false)
        return
      }

      const status = row.status as SubscriptionInfo['status']
      const trialEnd = row.trial_end ? new Date(row.trial_end) : null
      const now = new Date()
      const daysLeft = trialEnd
        ? Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : null
      const isTrialing = status === 'trialing' && !!trialEnd && trialEnd > now
      const isActive = status === 'active'
      const isExpired = status === 'trialing' && !!trialEnd && trialEnd <= now

      setData({
        plan: row.plan as PlanKey | null,
        status,
        trialEnd,
        daysLeft,
        isTrialing,
        isActive,
        isExpired,
      })
      setLoading(false)
    }

    fetch()
  }, [profile?.id])

  return { ...data, loading }
}

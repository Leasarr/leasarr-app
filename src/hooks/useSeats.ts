'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { PLANS } from '@/lib/stripe/plans'
import { useSubscription } from '@/hooks/useSubscription'

export interface SeatInfo {
  used: number
  max: number
  available: number
  loading: boolean
}

export function useSeats(): SeatInfo {
  const { profile } = useAuth()
  const supabase = createClient()
  const { plan, loading: subLoading } = useSubscription()
  const [used, setUsed] = useState(0)
  const [max, setMax] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile || subLoading) return

    async function fetchSeats() {
      setLoading(true)

      const [subRes, teamRes] = await Promise.all([
        supabase
          .from('subscriptions')
          .select('extra_seats')
          .eq('manager_id', profile!.id)
          .maybeSingle(),
        supabase
          .from('team_members')
          .select('id', { count: 'exact', head: true })
          .eq('manager_id', profile!.id)
          .eq('status', 'active'),
      ])

      const planConfig = plan ? PLANS[plan] : null
      const seatLimit = planConfig ? planConfig.seatLimit : 1
      const extraSeats = subRes.data?.extra_seats ?? 0
      const maxSeats = seatLimit + extraSeats

      const activeTeamMembers = teamRes.count ?? 0
      const usedSeats = activeTeamMembers + 1 // +1 for the owner

      setMax(maxSeats)
      setUsed(usedSeats)
      setLoading(false)
    }

    fetchSeats()
  }, [profile?.id, plan, subLoading])

  return { used, max, available: Math.max(0, max - used), loading }
}

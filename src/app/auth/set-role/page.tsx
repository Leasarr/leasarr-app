'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SetRolePage() {
  return <Suspense><SetRole /></Suspense>
}

function SetRole() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = searchParams.get('role') ?? 'manager'
  const supabase = createClient()

  useEffect(() => {
    async function applyRole() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const res = await fetch('/api/auth/set-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })

      if (!res.ok) { router.push('/auth/login'); return }

      router.push(role === 'tenant' ? '/portal' : '/dashboard')
    }
    applyRole()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-3">
        <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        <p className="text-on-surface-variant text-sm">Setting up your account...</p>
      </div>
    </div>
  )
}

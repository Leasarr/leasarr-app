'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

interface AuthContextValue {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  updateProfile: (data: Partial<Pick<Profile, 'name' | 'email' | 'phone'>>) => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  session: null,
  loading: true,
  signOut: async () => {},
  updateProfile: async () => {},
})

const MOCK_AUTH = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function getMockRole(): Profile['role'] {
  if (typeof document === 'undefined') return 'manager'
  const match = document.cookie.match(/mock_role=([^;]+)/)
  return (match?.[1] as Profile['role']) ?? 'manager'
}

function buildMockProfile(role: Profile['role']): Profile {
  return role === 'tenant'
    ? { id: 'mock-tenant', name: 'Jane Tenant', email: 'tenant@demo.com', role: 'tenant', created_at: '', updated_at: '' }
    : { id: 'mock-manager', name: 'Alexander Morgan', email: 'manager@demo.com', role: 'manager', created_at: '', updated_at: '' }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data)
    setLoading(false)
  }

  useEffect(() => {
    if (MOCK_AUTH) {
      const role = getMockRole()
      setProfile(buildMockProfile(role))
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }: { data: { session: import('@supabase/supabase-js').Session | null } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: import('@supabase/supabase-js').AuthChangeEvent, session: import('@supabase/supabase-js').Session | null) => {
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          fetchProfile(session.user.id)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function signOut() {
    if (MOCK_AUTH) {
      document.cookie = 'mock_role=; path=/; max-age=0'
      window.location.href = '/'
      return
    }
    await supabase.auth.signOut()
  }

  async function updateProfile(data: Partial<Pick<Profile, 'name' | 'email' | 'phone'>>) {
    if (MOCK_AUTH) {
      setProfile(prev => (prev ? { ...prev, ...data } : prev))
      return
    }
    if (!user) throw new Error('Not authenticated')
    const { data: updated, error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', user.id)
      .select()
      .single()
    if (error) throw error
    if (updated) setProfile(updated as Profile)
  }

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

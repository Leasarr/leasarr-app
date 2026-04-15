'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const MOCK_AUTH = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Mock credentials for testing without Supabase
const MOCK_USERS = {
  'manager@demo.com': { password: 'password', role: 'manager' },
  'tenant@demo.com':  { password: 'password', role: 'tenant'  },
} as const

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo')
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (MOCK_AUTH) {
      await new Promise(r => setTimeout(r, 600))
      const match = MOCK_USERS[email as keyof typeof MOCK_USERS]
      if (!match || match.password !== password) {
        setError('Invalid email or password.')
        setLoading(false)
        return
      }
      document.cookie = `mock_role=${match.role}; path=/; max-age=86400`
      const destination = (redirectTo && !redirectTo.startsWith('/auth'))
        ? redirectTo
        : match.role === 'tenant' ? '/portal' : '/dashboard'
      router.push(destination)
      return
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    const role = data.user?.user_metadata?.role as string
    const destination = (redirectTo && !redirectTo.startsWith('/auth'))
      ? redirectTo
      : role === 'tenant' ? '/portal' : '/dashboard'

    router.push(destination)
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 primary-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-primary">
            <span className="material-symbols-outlined text-white text-3xl">domain</span>
          </div>
          <h1 className="text-3xl font-headline font-extrabold text-primary tracking-tight">Leasarr</h1>
          <p className="text-on-surface-variant mt-1 text-sm">Property Management, Simplified</p>
        </div>

        {/* Card */}
        <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-modal">
          <h2 className="text-2xl font-headline font-extrabold text-on-surface mb-1">Welcome back</h2>
          <p className="text-on-surface-variant text-sm mb-8">Sign in to your portfolio</p>

          {error && (
            <div className="mb-5 p-3 bg-error-container rounded-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-error text-base leading-none">error</span>
              <p className="text-error text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Email address</label>
              <input
                type="email" required className="input-base"
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Password</label>
              <input
                type="password" required className="input-base"
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="flex justify-end">
              <a href="/auth/reset-password" className="text-sm font-semibold text-primary hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit" disabled={loading}
              className="btn-primary w-full py-4 text-base rounded-xl disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          {MOCK_AUTH && (
            <div className="mt-6 bg-primary-fixed rounded-2xl p-4 space-y-1.5">
              <p className="text-primary text-xs font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base leading-none">info</span>
                Demo mode — no Supabase needed
              </p>
              <p className="text-primary/70 text-xs">manager@demo.com / password → Manager dashboard</p>
              <p className="text-primary/70 text-xs">tenant@demo.com / password → Tenant portal</p>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-on-surface-variant mt-6">
          Don&apos;t have an account?{' '}
          <a href="/auth/register" className="font-bold text-primary hover:underline">Create one</a>
        </p>
      </div>
    </div>
  )
}

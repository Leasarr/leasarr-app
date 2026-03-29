'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('demo@pmsoft.com')
  const [password, setPassword] = useState('password')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    // Simulate auth — replace with: await supabase.auth.signInWithPassword(...)
    await new Promise(r => setTimeout(r, 1000))
    if (email === 'demo@pmsoft.com' && password === 'password') {
      router.push('/dashboard')
    } else {
      setError('Invalid email or password.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 primary-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-primary">
            <span className="material-symbols-outlined text-white text-3xl">domain</span>
          </div>
          <h1 className="text-3xl font-headline font-extrabold text-primary tracking-tight">PMSoft</h1>
          <p className="text-on-surface-variant mt-1 text-sm">Property Management, Simplified</p>
        </div>

        {/* Card */}
        <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-modal">
          <h2 className="text-2xl font-headline font-extrabold text-on-surface mb-1">Welcome back</h2>
          <p className="text-on-surface-variant text-sm mb-8">Sign in to your portfolio</p>

          {error && (
            <div className="mb-5 p-3 bg-error-container rounded-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-error text-base">error_outline</span>
              <p className="text-error text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Email address</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-lg">email</span>
                <input
                  type="email" required className="input-base pl-11"
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-lg">lock_outline</span>
                <input
                  type="password" required className="input-base pl-11"
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button type="button" className="text-sm font-semibold text-primary hover:underline">
                Forgot password?
              </button>
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

          {/* Demo Hint */}
          <div className="mt-6 flex items-center gap-2 bg-primary-fixed rounded-xl p-3">
            <span className="material-symbols-outlined text-primary text-base">info_outline</span>
            <p className="text-primary text-xs font-semibold">Demo: demo@pmsoft.com / password</p>
          </div>
        </div>

        <p className="text-center text-sm text-on-surface-variant mt-6">
          Don't have an account?{' '}
          <a href="/auth/register" className="font-bold text-primary hover:underline">Create one</a>
        </p>
      </div>
    </div>
  )
}

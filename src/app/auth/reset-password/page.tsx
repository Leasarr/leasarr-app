'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const MOCK_AUTH = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export default function ResetPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const origin = window.location.origin
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/auth/update-password`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-10">
          <div className="w-16 h-16 primary-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-primary">
            <span className="material-symbols-outlined text-white text-3xl">domain</span>
          </div>
          <h1 className="text-3xl font-headline font-extrabold text-primary tracking-tight">Leasarr</h1>
          <p className="text-on-surface-variant mt-1 text-sm">Property Management, Simplified</p>
        </div>

        <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-modal">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-primary-container rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-on-primary-container text-3xl">mark_email_read</span>
              </div>
              <h2 className="text-xl font-headline font-extrabold text-on-surface mb-2">Check your inbox</h2>
              <p className="text-on-surface-variant text-sm">
                We&apos;ve sent a password reset link to <span className="font-semibold text-on-surface">{email}</span>.
                Follow the link in the email to set a new password.
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-headline font-extrabold text-on-surface mb-1">Reset password</h2>
              <p className="text-on-surface-variant text-sm mb-8">
                Enter your email and we&apos;ll send you a reset link.
              </p>

              {MOCK_AUTH && (
                <div className="mb-5 bg-primary-fixed rounded-2xl p-4">
                  <p className="text-primary text-xs font-bold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base leading-none">info</span>
                    Demo mode — email sending is disabled
                  </p>
                </div>
              )}

              {error && (
                <div className="mb-5 p-3 bg-error-container rounded-xl flex items-center gap-2">
                  <span className="material-symbols-outlined text-error text-base leading-none">error</span>
                  <p className="text-error text-sm font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1.5">Email address</label>
                  <input
                    type="email" required className="input-base"
                    value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>

                <button
                  type="submit" disabled={loading || MOCK_AUTH}
                  className="btn-primary w-full py-4 text-base rounded-xl disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center gap-2 justify-center">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Sending...
                    </span>
                  ) : 'Send reset link'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-on-surface-variant mt-6">
          Remember your password?{' '}
          <a href="/auth/login" className="font-bold text-primary hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

type State = 'loading' | 'accepting' | 'success' | 'error' | 'needs-signup'

function AcceptInviteInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()

  const token = searchParams.get('token') ?? ''
  const email = searchParams.get('email') ?? ''

  const [state, setState] = useState<State>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!token) {
      setState('error')
      setErrorMessage('Invalid invite link — missing token.')
      return
    }

    if (user) {
      // User is already logged in — try to accept the invite
      setState('accepting')
      fetch('/api/team/accept-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setState('success')
            setTimeout(() => router.push('/dashboard'), 1500)
          } else {
            setState('error')
            setErrorMessage(data.error ?? 'Something went wrong.')
          }
        })
        .catch(() => {
          setState('error')
          setErrorMessage('Network error — please try again.')
        })
    } else {
      // Not logged in — send them to sign up
      setState('needs-signup')
    }
  }, [authLoading, user])

  const goToRegister = () => {
    const params = new URLSearchParams()
    if (email) params.set('email', email)
    params.set('invite', token)
    router.push(`/auth/register?${params.toString()}`)
  }

  const goToLogin = () => {
    const params = new URLSearchParams()
    if (email) params.set('email', email)
    params.set('invite', token)
    router.push(`/auth/login?${params.toString()}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-md">

        <div className="text-center mb-10">
          <div className="w-16 h-16 primary-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-primary">
            <span className="material-symbols-outlined text-white text-3xl">domain</span>
          </div>
          <h1 className="text-3xl font-headline font-extrabold text-primary tracking-tight">Leasarr</h1>
        </div>

        <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-modal text-center">

          {(state === 'loading' || state === 'accepting') && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-primary-container/30 flex items-center justify-center mx-auto mb-5">
                <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              </div>
              <h2 className="text-xl font-headline font-extrabold text-on-surface mb-2">
                {state === 'accepting' ? 'Accepting invite...' : 'Checking invite...'}
              </h2>
              <p className="text-sm text-on-surface-variant">Just a moment</p>
            </>
          )}

          {state === 'success' && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-secondary-container flex items-center justify-center mx-auto mb-5">
                <span className="material-symbols-outlined text-3xl text-on-secondary-container material-symbols-filled">check_circle</span>
              </div>
              <h2 className="text-xl font-headline font-extrabold text-on-surface mb-2">You&apos;re in!</h2>
              <p className="text-sm text-on-surface-variant">Redirecting to the dashboard...</p>
            </>
          )}

          {state === 'error' && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-error-container/50 flex items-center justify-center mx-auto mb-5">
                <span className="material-symbols-outlined text-3xl text-error">error</span>
              </div>
              <h2 className="text-xl font-headline font-extrabold text-on-surface mb-2">Invalid invite</h2>
              <p className="text-sm text-on-surface-variant mb-6">{errorMessage}</p>
              <button
                onClick={() => router.push('/')}
                className="btn-secondary w-full"
              >
                Go to Homepage
              </button>
            </>
          )}

          {state === 'needs-signup' && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-primary-container/30 flex items-center justify-center mx-auto mb-5">
                <span className="material-symbols-outlined text-3xl text-primary">mail</span>
              </div>
              <h2 className="text-xl font-headline font-extrabold text-on-surface mb-2">
                You&apos;ve been invited
              </h2>
              <p className="text-sm text-on-surface-variant mb-6">
                {email
                  ? <>Accept the invitation sent to <strong>{email}</strong> by creating an account or signing in.</>
                  : 'Accept the invitation by creating an account or signing in.'}
              </p>
              <div className="space-y-3">
                <button
                  onClick={goToRegister}
                  className="btn-primary w-full"
                >
                  Create account &amp; accept
                </button>
                <button
                  onClick={goToLogin}
                  className="btn-secondary w-full"
                >
                  Sign in to existing account
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AcceptInvitePage() {
  return (
    <Suspense>
      <AcceptInviteInner />
    </Suspense>
  )
}

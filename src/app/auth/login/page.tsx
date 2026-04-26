'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { loginSchema, type LoginForm } from '@/lib/schemas/auth'

const MOCK_AUTH = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

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
  const message = searchParams.get('message')

  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setServerError('')

    if (MOCK_AUTH) {
      await new Promise(r => setTimeout(r, 600))
      const match = MOCK_USERS[data.email as keyof typeof MOCK_USERS]
      if (!match || match.password !== data.password) {
        setServerError('Invalid email or password.')
        return
      }
      document.cookie = `mock_role=${match.role}; path=/; max-age=86400`
      const destination = (redirectTo && !redirectTo.startsWith('/auth'))
        ? redirectTo
        : match.role === 'tenant' ? '/portal' : '/dashboard'
      router.push(destination)
      return
    }

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      setServerError(error.message)
      return
    }

    const role = authData.user?.user_metadata?.role as string
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

          {message === 'password_updated' && (
            <div className="mb-5 p-3 bg-primary-container rounded-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-on-primary-container text-base leading-none">check_circle</span>
              <p className="text-on-primary-container text-sm font-medium">Password updated — sign in with your new password.</p>
            </div>
          )}

          {serverError && (
            <div className="mb-5 p-3 bg-error-container rounded-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-error text-base leading-none">error</span>
              <p className="text-error text-sm font-medium">{serverError}</p>
            </div>
          )}

          {!MOCK_AUTH && (
            <>
              <button
                type="button"
                onClick={async () => {
                  const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
                  })
                  if (error) setServerError(error.message)
                }}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-sm font-semibold hover:bg-surface-container-high transition-colors min-h-[44px] mb-6"
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-outline-variant" />
                <span className="text-xs text-on-surface-variant">or sign in with email</span>
                <div className="flex-1 h-px bg-outline-variant" />
              </div>
            </>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Email address</label>
              <input
                {...register('email')}
                type="email" className="input-base"
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-error text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Password</label>
              <input
                {...register('password')}
                type="password" className="input-base"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-error text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex justify-end">
              <a href="/auth/reset-password" className="text-sm font-semibold text-primary hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit" disabled={isSubmitting}
              className="btn-primary w-full py-4 text-base rounded-xl disabled:opacity-60"
            >
              {isSubmitting ? (
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

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { registerSchema, type RegisterForm } from '@/lib/schemas/auth'

type Role = 'manager' | 'tenant'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const [role, setRole] = useState<Role>('manager')
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterForm) => {
    setServerError('')

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { name: data.name, role },
      },
    })

    if (error) {
      setServerError(error.message)
      return
    }

    router.push(role === 'tenant' ? '/portal' : '/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4 py-12">
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
          <h2 className="text-2xl font-headline font-extrabold text-on-surface mb-1">Create account</h2>
          <p className="text-on-surface-variant text-sm mb-6">Choose your account type to get started</p>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {([
              { value: 'manager', icon: 'domain', label: 'Property Manager', sub: 'Manage properties & tenants' },
              { value: 'tenant', icon: 'person', label: 'Tenant', sub: 'View your lease & pay rent' },
            ] as const).map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRole(opt.value)}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-2xl border-2 text-center transition-all duration-150',
                  role === opt.value
                    ? 'border-primary bg-primary-fixed text-on-primary-fixed'
                    : 'border-outline-variant text-on-surface-variant hover:border-primary/40 hover:bg-surface-container'
                )}
              >
                <span className={cn(
                  'material-symbols-outlined text-3xl',
                  role === opt.value && 'material-symbols-filled'
                )}>
                  {opt.icon}
                </span>
                <div>
                  <p className="text-sm font-bold">{opt.label}</p>
                  <p className="text-[10px] opacity-70 leading-tight mt-0.5">{opt.sub}</p>
                </div>
              </button>
            ))}
          </div>

          {serverError && (
            <div className="mb-5 p-3 bg-error-container rounded-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-error text-base leading-none">error</span>
              <p className="text-error text-sm font-medium">{serverError}</p>
            </div>
          )}

          <button
            type="button"
            onClick={async () => {
              const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                  redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(`/auth/set-role?role=${role}`)}`,
                },
              })
              if (error) setServerError(error.message)
            }}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-outline-variant bg-surface-container text-on-surface text-sm font-semibold hover:bg-surface-container-high transition-colors min-h-[44px] mb-4"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign up with Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-outline-variant" />
            <span className="text-xs text-on-surface-variant">or sign up with email</span>
            <div className="flex-1 h-px bg-outline-variant" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Full name</label>
              <input
                {...register('name')}
                type="text" className="input-base"
                placeholder="Your full name"
              />
              {errors.name && <p className="text-error text-xs mt-1">{errors.name.message}</p>}
            </div>
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
                placeholder="Min. 6 characters"
              />
              {errors.password && <p className="text-error text-xs mt-1">{errors.password.message}</p>}
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
                  Creating account...
                </span>
              ) : `Create ${role === 'tenant' ? 'Tenant' : 'Manager'} Account`}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-on-surface-variant mt-6">
          Already have an account?{' '}
          <a href="/auth/login" className="font-bold text-primary hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  )
}

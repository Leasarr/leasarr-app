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

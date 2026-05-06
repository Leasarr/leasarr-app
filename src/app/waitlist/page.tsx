'use client'

import { useState } from 'react'
import { MarketingLayout } from '@/components/marketing/layout'

const PROPERTY_OPTIONS = [
  { value: '1-5', label: '1–5 units' },
  { value: '6-20', label: '6–20 units' },
  { value: '21-50', label: '21–50 units' },
  { value: '51+', label: '51+ units' },
]

export default function WaitlistPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [propertyCount, setPropertyCount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !propertyCount) {
      setError('Please fill in all fields.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), property_count: propertyCount }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
      } else {
        setDone(true)
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <MarketingLayout>
      <section
        className="min-h-screen flex flex-col items-center justify-center px-6 py-24"
        style={{ background: 'linear-gradient(135deg, #001E5A 0%, #003D9B 100%)' }}
      >
        {/* Dot grid */}
        <div
          className="fixed inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative w-full max-w-lg">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-white/10 text-white border border-white/20">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Private beta · 25 spots
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-white text-center leading-tight tracking-tight mb-4">
            Get early access to Leasarr
          </h1>
          <p className="text-white/70 text-center text-lg mb-10 max-w-sm mx-auto">
            We&apos;re onboarding our first 25 property managers by invite only. Join the list and we&apos;ll reach out when a spot opens.
          </p>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
            {done ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-5">
                  <span className="material-symbols-outlined text-3xl text-white">check_circle</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">You&apos;re on the list!</h2>
                <p className="text-white/70">
                  We&apos;ll email you at <span className="font-semibold text-white">{email}</span> when your spot is ready.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-500/20 border border-red-400/30 rounded-xl text-sm text-red-200 font-medium">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-1.5">Full name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-1.5">Work email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-1.5">How many units do you manage?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PROPERTY_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setPropertyCount(opt.value)}
                        className={`py-2.5 px-3 rounded-xl border text-sm font-semibold transition-all ${
                          propertyCount === opt.value
                            ? 'bg-white text-[#003D9B] border-white'
                            : 'bg-white/10 text-white/80 border-white/20 hover:bg-white/20'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-white text-[#003D9B] font-bold text-base hover:bg-white/90 transition-all disabled:opacity-60 mt-2"
                >
                  {loading ? 'Joining...' : 'Request early access →'}
                </button>

                <p className="text-center text-xs text-white/40 pt-1">
                  No spam. We&apos;ll only email you about your spot.
                </p>
              </form>
            )}
          </div>

          <p className="text-center text-white/40 text-sm mt-6">
            Already have an invite code?{' '}
            <a href="/auth/register" className="text-white/70 font-semibold hover:text-white transition-colors">
              Create your account →
            </a>
          </p>
        </div>
      </section>
    </MarketingLayout>
  )
}

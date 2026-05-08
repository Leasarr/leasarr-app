'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import posthog from 'posthog-js'

const STORAGE_KEY = 'leasarr_cookie_consent'
const ANON_ID_KEY  = 'leasarr_anon_id'

interface ConsentState {
  decided: boolean
  analytics: boolean
}

interface ConsentContextValue extends ConsentState {
  acceptAll: () => void
  declineAll: () => void
  savePreferences: (prefs: { analytics: boolean }) => void
  syncFromServer: () => Promise<void>
  preferencesOpen: boolean
  openPreferences: () => void
  closePreferences: () => void
}

function readStorage(): ConsentState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { decided: false, analytics: false }
}

function writeStorage(state: ConsentState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, decidedAt: new Date().toISOString() }))
  } catch {}
}

function getOrCreateAnonId(): string {
  try {
    const existing = localStorage.getItem(ANON_ID_KEY)
    if (existing) return existing
    const id = crypto.randomUUID()
    localStorage.setItem(ANON_ID_KEY, id)
    return id
  } catch {
    return crypto.randomUUID()
  }
}

async function persistConsent(state: ConsentState) {
  try {
    await fetch('/api/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        analytics: state.analytics,
        marketing: false,
        anonymous_id: getOrCreateAnonId(),
      }),
    })
  } catch {}
}

function applyPostHog(analytics: boolean) {
  try {
    if (analytics) {
      posthog.opt_in_capturing()
    } else {
      posthog.opt_out_capturing()
    }
  } catch {}
}

const CookieConsentContext = createContext<ConsentContextValue | null>(null)

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConsentState>({ decided: false, analytics: false })
  const [preferencesOpen, setPreferencesOpen] = useState(false)

  useEffect(() => {
    const stored = readStorage()
    setState(stored)
    if (stored.decided) applyPostHog(stored.analytics)
  }, [])

  const save = useCallback((next: ConsentState) => {
    setState(next)
    writeStorage(next)
    applyPostHog(next.analytics)
    persistConsent(next)
    setPreferencesOpen(false)
  }, [])

  const acceptAll = useCallback(() => save({ decided: true, analytics: true }), [save])
  const declineAll = useCallback(() => save({ decided: true, analytics: false }), [save])
  const savePreferences = useCallback(
    ({ analytics }: { analytics: boolean }) => save({ decided: true, analytics }),
    [save]
  )

  // Called after login to pull the server-stored consent and apply it locally
  const syncFromServer = useCallback(async () => {
    try {
      const res = await fetch('/api/consent')
      if (!res.ok) return
      const { consent } = await res.json()
      if (!consent) return
      const next: ConsentState = { decided: true, analytics: consent.analytics }
      setState(next)
      writeStorage(next)
      applyPostHog(next.analytics)
    } catch {}
  }, [])

  return (
    <CookieConsentContext.Provider
      value={{
        ...state,
        acceptAll,
        declineAll,
        savePreferences,
        syncFromServer,
        preferencesOpen,
        openPreferences: () => setPreferencesOpen(true),
        closePreferences: () => setPreferencesOpen(false),
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  )
}

export function useConsent() {
  const ctx = useContext(CookieConsentContext)
  if (!ctx) throw new Error('useConsent must be used within CookieConsentProvider')
  return ctx
}

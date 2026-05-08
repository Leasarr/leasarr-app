'use client'

import { useConsent } from '@/context/CookieConsentContext'

export function CookiePreferencesButton() {
  const { openPreferences } = useConsent()
  return (
    <button
      onClick={openPreferences}
      className="text-sm text-white/60 hover:text-white transition-colors text-left"
    >
      Cookie Preferences
    </button>
  )
}

'use client'

import { Button } from '@/components/ui/Button'
import { useConsent } from '@/context/CookieConsentContext'

export function CookieConsentBanner() {
  const { ready, decided, acceptAll, declineAll, openPreferences } = useConsent()

  if (!ready || decided) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-slide-up">
      <div className="max-w-2xl mx-auto bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-modal p-5 md:p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-primary-container/30 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-primary text-lg">cookie</span>
          </div>
          <div>
            <p className="font-bold text-on-surface text-sm">We use cookies</p>
            <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
              We use analytics cookies to understand how people use Leasarr and make it better. Strictly necessary cookies are always active — they keep the site secure and your session running.{' '}
              <a href="/privacy" className="underline hover:text-on-surface">Privacy policy</a>
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <button
            onClick={openPreferences}
            className="text-sm font-semibold text-primary hover:underline text-left sm:mr-auto py-1"
          >
            Customize
          </button>
          <Button variant="secondary" size="sm" onClick={declineAll} className="w-full sm:w-auto">
            Decline
          </Button>
          <Button variant="primary" size="sm" onClick={acceptAll} className="w-full sm:w-auto">
            Accept All
          </Button>
        </div>
      </div>
    </div>
  )
}

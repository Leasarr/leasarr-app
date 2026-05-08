'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { useConsent } from '@/context/CookieConsentContext'

export function CookiePreferencesModal() {
  const { preferencesOpen, closePreferences, acceptAll, declineAll, savePreferences, analytics } = useConsent()
  const [analyticsEnabled, setAnalyticsEnabled] = useState(analytics)

  useEffect(() => {
    if (preferencesOpen) setAnalyticsEnabled(analytics)
  }, [preferencesOpen, analytics])

  return (
    <Modal open={preferencesOpen} onClose={closePreferences} title="Cookie Preferences" size="sm">
      <div className="space-y-1">
        <p className="text-sm text-on-surface-variant mb-4">
          Control which cookies Leasarr uses. You can update these any time from Settings or the footer.
        </p>

        {/* Strictly Necessary */}
        <div className="flex items-start justify-between gap-4 py-4 border-b border-outline-variant/20">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-on-surface-variant text-base">lock</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-on-surface">Strictly Necessary</p>
              <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                Authentication, security, and session management. Required for the site to work — cannot be turned off.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end flex-shrink-0 mt-0.5">
            <div className="w-11 h-6 rounded-full bg-outline-variant/30 relative cursor-not-allowed">
              <span className="absolute top-0.5 right-0.5 w-5 h-5 bg-on-surface-variant/40 rounded-full" />
            </div>
            <p className="text-[10px] text-on-surface-variant mt-1">Always on</p>
          </div>
        </div>

        {/* Analytics */}
        <div className="flex items-start justify-between gap-4 py-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-on-surface-variant text-base">analytics</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-on-surface">Analytics</p>
              <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                Helps us understand how you navigate Leasarr so we can improve it. Powered by PostHog. No data is sold or shared with third parties.
              </p>
            </div>
          </div>
          <button
            onClick={() => setAnalyticsEnabled(v => !v)}
            aria-label={analyticsEnabled ? 'Disable analytics cookies' : 'Enable analytics cookies'}
            className={cn(
              'w-11 h-6 rounded-full transition-colors flex-shrink-0 relative mt-0.5',
              analyticsEnabled ? 'bg-primary' : 'bg-outline-variant/50'
            )}
          >
            <span className={cn(
              'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
              analyticsEnabled ? 'translate-x-5' : 'translate-x-0'
            )} />
          </button>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-outline-variant/20">
          <Button variant="secondary" size="md" onClick={declineAll} className="w-full sm:w-auto">
            Decline All
          </Button>
          <div className="flex gap-2 sm:ml-auto">
            <Button
              variant="secondary"
              size="md"
              onClick={() => savePreferences({ analytics: analyticsEnabled })}
              className="flex-1 sm:flex-initial"
            >
              Save
            </Button>
            <Button variant="primary" size="md" onClick={acceptAll} className="flex-1 sm:flex-initial">
              Accept All
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

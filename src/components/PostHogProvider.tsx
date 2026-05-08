'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  try {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
      capture_pageview: false,
      capture_pageleave: true,
      // Never capture until the user explicitly consents (Law 25 / GDPR)
      opt_out_capturing_by_default: true,
      loaded: (ph) => {
        // Required for the PostHog toolbar to work on any page
        ;(window as Window & { posthog?: typeof ph }).posthog = ph
      },
    })
  } catch {
    // blocked by ad blocker or privacy extension
  }
}

function PostHogPageview() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const ph = usePostHog()

  useEffect(() => {
    if (pathname) {
      try {
        const url = searchParams.toString()
          ? `${pathname}?${searchParams.toString()}`
          : pathname
        ph.capture('$pageview', { $current_url: url })
      } catch {}
    }
  }, [pathname, searchParams, ph])

  return null
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageview />
      </Suspense>
      {children}
    </PHProvider>
  )
}

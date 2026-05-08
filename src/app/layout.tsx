import type { Metadata, Viewport } from 'next'
import { Manrope, Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { PostHogProvider } from '@/components/PostHogProvider'
import { CookieConsentProvider } from '@/context/CookieConsentContext'
import { CookieConsentBanner } from '@/components/consent/CookieConsentBanner'
import { CookiePreferencesModal } from '@/components/consent/CookiePreferencesModal'

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://leasarr.com'

export const metadata: Metadata = {
  title: {
    default: 'Leasarr — Property Management Software for Landlords',
    template: '%s — Leasarr',
  },
  description: 'Manage properties, tenants, leases, maintenance, and rent payments in one unified platform. Built for landlords and property managers.',
  openGraph: {
    title: 'Leasarr — Property Management Software for Landlords',
    description: 'Manage properties, tenants, leases, maintenance, and rent payments in one unified platform.',
    url: BASE_URL,
    siteName: 'Leasarr',
    type: 'website',
    locale: 'en_CA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Leasarr — Property Management Software for Landlords',
    description: 'Manage properties, tenants, leases, maintenance, and rent payments in one unified platform.',
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
  },
  alternates: {
    canonical: BASE_URL,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${inter.variable}`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
        {/* Anti-flash: apply theme class before first paint. Reads cookie first (shared across subdomains), falls back to localStorage. */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){var c=document.cookie.split(';').find(function(s){return s.trim().startsWith('leasarr-theme=')});var t=c?c.trim().slice(14):(localStorage.getItem('leasarr-theme')||'system');if(t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')})()` }} />
        {/* JS-detection: adds .js to <html> synchronously before <body> is parsed,
            so CSS can hide GSAP-animated elements before the first pixel is painted. */}
        <script dangerouslySetInnerHTML={{ __html: `document.documentElement.classList.add('js')` }} />
      </head>
      <body className="bg-surface font-body text-on-surface antialiased">
        <PostHogProvider>
          <ThemeProvider>
            <CookieConsentProvider>
              <AuthProvider>
                {children}
                <Toaster position="top-right" richColors />
              </AuthProvider>
              <CookieConsentBanner />
              <CookiePreferencesModal />
            </CookieConsentProvider>
          </ThemeProvider>
        </PostHogProvider>
      </body>
    </html>
  )
}

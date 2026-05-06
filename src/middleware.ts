import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const APP_HOST = 'app.leasarr.com'
const MARKETING_HOST = 'leasarr.com'

// Marketing pages — open to everyone, including logged-in users
const OPEN_ROUTES = ['/pricing', '/about', '/waitlist']
// Routes where logged-in users are redirected to their home (homepage + auth pages)
const AUTH_ROUTES = ['/', '/auth/login', '/auth/register', '/auth/reset-password']
const PUBLIC_ROUTES = [...OPEN_ROUTES, ...AUTH_ROUTES, '/auth/callback', '/auth/set-role']
const ALWAYS_ALLOW = ['/auth/callback', '/auth/update-password', '/auth/set-role', '/auth/accept-invite', '/api/stripe', '/api/notifications', '/api/team', '/api/waitlist', '/api/invite', '/api/admin']

function getSite(request: NextRequest): 'app' | 'marketing' | 'dev' {
  const host = request.headers.get('host') ?? ''
  if (host.includes('localhost') || host.includes('127.0.0.1')) return 'dev'
  if (host.startsWith('app.')) return 'app'
  return 'marketing'
}

const MANAGER_ROUTES = [
  '/dashboard', '/tenants', '/people', '/payments', '/maintenance',
  '/leases', '/properties', '/communication', '/reports', '/notifications',
]

const TENANT_ROUTES = ['/portal']

// ─── Mock auth (used when NEXT_PUBLIC_MOCK_AUTH=true) ────────────────────────
function handleMockAuth(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isPublic = PUBLIC_ROUTES.some(r => r === '/' ? pathname === '/' : pathname.startsWith(r))
  const mockRole = request.cookies.get('mock_role')?.value

  if (ALWAYS_ALLOW.some(r => pathname.startsWith(r))) return NextResponse.next()

  if (isPublic) {
    const isAuthRoute = AUTH_ROUTES.some(r => pathname.startsWith(r))
    if (isAuthRoute && mockRole) {
      return NextResponse.redirect(
        new URL(mockRole === 'tenant' ? '/portal' : '/dashboard', request.url)
      )
    }
    return NextResponse.next()
  }

  // Not "logged in" → send to login
  if (!mockRole) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Role-based guard
  if (MANAGER_ROUTES.some(r => pathname.startsWith(r)) && mockRole === 'tenant') {
    return NextResponse.redirect(new URL('/portal', request.url))
  }
  if (TENANT_ROUTES.some(r => pathname.startsWith(r)) && mockRole !== 'tenant') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export async function middleware(request: NextRequest) {
  // In mock mode, skip Supabase entirely — no env vars needed
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return handleMockAuth(request)
  }

  const pathname = request.nextUrl.pathname
  const site = getSite(request)

  // app.leasarr.com: send marketing-only pages to the marketing domain
  if (site === 'app' && OPEN_ROUTES.some(r => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL(pathname + request.nextUrl.search, `https://${MARKETING_HOST}`))
  }

  // leasarr.com: send app routes (including auth pages) to the app subdomain
  // ALWAYS_ALLOW routes (/auth/callback, /auth/set-role, etc.) still pass through on both domains
  if (site === 'marketing') {
    const isAllowed =
      pathname === '/' ||
      OPEN_ROUTES.some(r => pathname.startsWith(r)) ||
      ALWAYS_ALLOW.some(r => pathname.startsWith(r))
    if (!isAllowed) {
      return NextResponse.redirect(new URL(pathname + request.nextUrl.search, `https://${APP_HOST}`))
    }
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Always use getUser() in middleware — validates the JWT server-side
  const { data: { user } } = await supabase.auth.getUser()

  // On app subdomain, logged-out users hitting / should see the marketing site
  if (site === 'app' && pathname === '/' && !user) {
    return NextResponse.redirect(new URL('/', `https://${MARKETING_HOST}`))
  }

  const isPublic = PUBLIC_ROUTES.some(r => r === '/' ? pathname === '/' : pathname.startsWith(r))

  // Callback must always run — never redirect mid-OAuth
  if (ALWAYS_ALLOW.some(r => pathname.startsWith(r))) return response

  if (isPublic) {
    const isAuthRoute = AUTH_ROUTES.some(r => pathname.startsWith(r))
    // Auth pages (login/register) redirect logged-in users to their home
    if (isAuthRoute && user) {
      let role = user.user_metadata?.role as string | undefined
      if (!role) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        role = profile?.role ?? ''
      }
      return NextResponse.redirect(
        new URL(role === 'tenant' ? '/portal' : '/dashboard', request.url)
      )
    }
    return response
  }

  // Not logged in → redirect to login, preserving intended destination
  if (!user) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Logged in: enforce role-based access
  // Prefer user_metadata.role (fast, no DB); fall back to profiles table if missing
  let role = user.user_metadata?.role as string | undefined
  if (!role) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    role = profile?.role ?? ''
  }

  if (MANAGER_ROUTES.some(r => pathname.startsWith(r)) && role === 'tenant') {
    return NextResponse.redirect(new URL('/portal', request.url))
  }

  if (TENANT_ROUTES.some(r => pathname.startsWith(r)) && role !== 'tenant') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

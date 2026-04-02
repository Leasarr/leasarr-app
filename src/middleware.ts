import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/auth/login', '/auth/register', '/auth/callback']

const MANAGER_ROUTES = [
  '/dashboard', '/tenants', '/payments', '/maintenance',
  '/leases', '/properties', '/communication', '/reports',
]

const TENANT_ROUTES = ['/portal']

// ─── Mock auth (used when NEXT_PUBLIC_MOCK_AUTH=true) ────────────────────────
function handleMockAuth(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isPublic = PUBLIC_ROUTES.some(r => pathname.startsWith(r))
  const mockRole = request.cookies.get('mock_role')?.value

  if (isPublic) {
    // Already "logged in" via mock cookie → redirect to role home
    if (mockRole) {
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

  const pathname = request.nextUrl.pathname
  const isPublic = PUBLIC_ROUTES.some(r => pathname.startsWith(r))

  // Already logged in and hitting a public route → redirect to role home
  if (isPublic) {
    if (user) {
      const role = user.user_metadata?.role as string
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
  const role = user.user_metadata?.role as string

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

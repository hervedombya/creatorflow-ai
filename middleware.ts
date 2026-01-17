import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  // First, update the session
  const response = await updateSession(request)
  
  // Create a supabase client to check auth status
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll() {},
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // 1. Auth Guard
  // If user is NOT logged in and trying to access protected routes
  if (!user && (pathname.startsWith('/create') || pathname.startsWith('/onboarding'))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. Onboarding Guard
  if (user) {
    // Check if user has completed onboarding
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_onboarded')
      .eq('id', user.id)
      .single()

    const isOnboarded = profile?.is_onboarded ?? false

    // If user is NOT onboarded and trying to access app core -> redirect to onboarding
    if (!isOnboarded && pathname.startsWith('/create')) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }

    // If user IS onboarded and trying to access onboarding -> redirect to create
    if (isOnboarded && pathname.startsWith('/onboarding')) {
      return NextResponse.redirect(new URL('/create', request.url))
    }

    // If user is logged in and trying to access login -> redirect to appropriate place
    if (pathname === '/login') {
      return NextResponse.redirect(new URL(isOnboarded ? '/create' : '/onboarding', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

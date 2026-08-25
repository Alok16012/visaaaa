import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Allow login page and API routes
  if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // For all other pages, let client-side auth handle it
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

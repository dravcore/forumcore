import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

// Giriş gerektiren route'lar
const PROTECTED_PREFIXES = [
  '/settings',
  '/u/edit',
  '/admin',
]

// Giriş yapılmışken erişilemeyen route'lar
const AUTH_ROUTES = ['/login', '/register']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route))

  if (!isProtected && !isAuthRoute) return NextResponse.next()

  const session = await auth.api.getSession({ headers: request.headers })

  // Korumalı sayfaya giriş yapmadan erişiliyor
  if (isProtected && !session) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Giriş yapılmışken login/register'a gidiliyor
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}

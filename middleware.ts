import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('kanban_token')?.value
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicPaths = ['/', '/login', '/register']

  // Check if current path is public
  const isPublicPath = publicPaths.includes(pathname)

  // Private routes that require authentication
  const isPrivatePath = pathname.startsWith('/dashboard') ||
                       pathname.startsWith('/projects') ||
                       pathname.startsWith('/tasks') ||
                       pathname.startsWith('/board')

  // If accessing a private route without token, redirect to login
  if (isPrivatePath && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Allow the request to continue
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rotas públicas que não precisam de autenticação
const publicRoutes = ['/login', '/changePassword']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Se é uma rota pública, permite acesso
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Verifica se há token de autenticação
  const authToken = request.cookies.get('auth_token')

  // Se não há token e não é uma rota pública, redireciona para login
  if (!authToken) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Se há token, permite acesso
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
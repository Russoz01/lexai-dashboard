import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

/* ═════════════════════════════════════════════════════════════
 * middleware.ts — Auth guard (v10.9 · 2026-04-22)
 * ─────────────────────────────────────────────────────────────
 * Protege /dashboard/* — exige sessão Supabase válida via cookie.
 * Sem sessão → redireciona pra /login?error=session_expired&next=<path>.
 * Admin-only paths têm checagem extra via user_metadata.role.
 * Rotas públicas (/, /login, /reset-password, /empresas, etc.) passam livre.
 * Evita API routes (próprias APIs já validam token Bearer ou webhook).
 * ═════════════════════════════════════════════════════════════ */

const PROTECTED_PREFIXES = ['/dashboard', '/conta', '/billing']
const ADMIN_PREFIXES = ['/dashboard/admin']

export async function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl

  // Só intercepta rotas protegidas; deixa o resto passar direto
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))
  if (!isProtected) return NextResponse.next()

  // Prepara response que vai carregar cookies renovados do Supabase
  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request: { headers: request.headers } })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Sem usuário → manda pro login preservando destino
  if (!user) {
    const loginUrl = new URL('/login', origin)
    loginUrl.searchParams.set('error', 'session_expired')
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Admin guard — role === 'admin' EXCLUSIVAMENTE em app_metadata.
  // user_metadata é gravável pelo cliente via supabase.auth.updateUser({ data: ... })
  // — qualquer usuário poderia se promover a admin se lêssemos dali. app_metadata
  // só é gravável com service-role key (server-only).
  const isAdminPath = ADMIN_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))
  if (isAdminPath) {
    const role = user.app_metadata?.role as string | undefined
    if (role !== 'admin') {
      const dashUrl = new URL('/dashboard', origin)
      dashUrl.searchParams.set('error', 'forbidden')
      return NextResponse.redirect(dashUrl)
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Roda em tudo exceto:
     * - _next/static (assets)
     * - _next/image (otimizador)
     * - favicon.ico, robots.txt, sitemap.xml, og images
     * - /api/* (APIs próprias já protegidas)
     * - /auth/* (callback OAuth)
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|opengraph-image|apple-icon|icon|api|auth).*)',
  ],
}

import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

/* ═════════════════════════════════════════════════════════════
 * middleware.ts — Auth guard + CSP nonce (v10.9 · 2026-04-22)
 * ─────────────────────────────────────────────────────────────
 * Protege /dashboard/* — exige sessão Supabase válida via cookie.
 * Sem sessão → redireciona pra /login?error=session_expired&next=<path>.
 * Admin-only paths têm checagem extra via user_metadata.role.
 * Rotas públicas (/, /login, /reset-password, /empresas, etc.) passam livre.
 * Evita API routes (próprias APIs já validam token Bearer ou webhook).
 *
 * Wave C5 (2026-05-02): CSP nonce opt-in via CSP_NONCE_ENABLED=1.
 * Quando ativado, gera nonce por request + injeta no header CSP em vez de
 * 'unsafe-inline'. Rollback simples: unset env var → fallback pro CSP
 * estático do next.config.js.
 * ═════════════════════════════════════════════════════════════ */

const PROTECTED_PREFIXES = ['/dashboard', '/conta', '/billing']
const ADMIN_PREFIXES = ['/dashboard/admin']

/**
 * Gera nonce base64 random pra CSP.
 * Edge runtime tem crypto.getRandomValues nativo.
 */
function generateNonce(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  let binary = ''
  for (let i = 0; i < array.length; i++) binary += String.fromCharCode(array[i])
  return btoa(binary)
}

function buildCspWithNonce(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval' https://cdnjs.cloudflare.com https://browser.sentry-cdn.com https://js.sentry-cdn.com`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://*.supabase.co https://api.anthropic.com https://api.stripe.com https://app.posthog.com https://*.sentry.io https://*.ingest.sentry.io https://*.ingest.us.sentry.io",
    "frame-src https://js.stripe.com",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://checkout.stripe.com",
  ].join('; ')
}

export async function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl

  // CSP nonce — gera por request se ativado via env
  const cspNonceEnabled = process.env.CSP_NONCE_ENABLED === '1'
  const nonce = cspNonceEnabled ? generateNonce() : null

  // Só intercepta rotas protegidas; deixa o resto passar direto
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))
  if (!isProtected) {
    // Se CSP nonce ativado, ainda precisa setar header em rotas públicas
    if (nonce) {
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-nonce', nonce)
      const res = NextResponse.next({ request: { headers: requestHeaders } })
      res.headers.set('Content-Security-Policy', buildCspWithNonce(nonce))
      return res
    }
    return NextResponse.next()
  }

  // Prepara response que vai carregar cookies renovados do Supabase + nonce header
  const requestHeaders = new Headers(request.headers)
  if (nonce) requestHeaders.set('x-nonce', nonce)
  let response = NextResponse.next({ request: { headers: requestHeaders } })
  if (nonce) response.headers.set('Content-Security-Policy', buildCspWithNonce(nonce))

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
     *
     * Quando CSP_NONCE_ENABLED=1, roda em TODAS rotas pra injetar nonce
     * — mas só faz auth check em rotas protegidas. Outras rotas só recebem
     * o header CSP + x-nonce e seguem.
     */
    {
      source: '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|opengraph-image|apple-icon|icon|api|auth).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}

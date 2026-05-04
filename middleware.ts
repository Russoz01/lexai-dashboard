import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/* ════════════════════════════════════════════════════════════════════
 * Bot scanner protection (audit elite v4 · 2026-05-03)
 * ────────────────────────────────────────────────────────────────────
 * Vercel Observability achou bot batendo POST /api/parecerista a cada
 * 8s (16K requests em 30d, todos 401). Cada 401 ainda executa o
 * Vercel Function (~50ms × 16K = 800s function quota desperdicada).
 *
 * Solucao: bloqueio in-edge (middleware roda antes do route handler).
 * Se request POST /api/<agente>/* nao tem cookie de auth Supabase,
 * retorna 401 imediato sem invocar route handler.
 *
 * Auth Supabase via cookies:
 *   - sb-access-token (SSR)
 *   - sb-<projectId>-auth-token (SSR newer)
 *   - sb-refresh-token
 * Se nenhum presente em POST /api/, presume bot e bloqueia.
 * ═══════════════════════════════════════════════════════════════════ */
function hasSupabaseAuthCookie(request: NextRequest): boolean {
  for (const cookie of request.cookies.getAll()) {
    if (cookie.name.startsWith('sb-') && cookie.name.includes('auth')) {
      return true
    }
    // Legacy
    if (cookie.name === 'sb-access-token' || cookie.name === 'sb-refresh-token') {
      return true
    }
  }
  return false
}

// Routes reais (verificadas via ls src/app/api/) — naming nem sempre bate com
// slug do agente no catalog (ex: agente "Redator" -> rota /api/redigir).
const PROTECTED_AGENT_ROUTES = [
  '/api/parecerista',
  '/api/consultor',
  '/api/redigir',
  '/api/contestador',
  '/api/recursos',
  '/api/audiencia',
  '/api/atendimento',
  '/api/estrategista',
  '/api/revisor',
  '/api/risco',
  '/api/pesquisar',
  '/api/resumir',
  '/api/calcular',
  '/api/legislacao',
  '/api/chat',
  '/api/marketing-ia',
  '/api/negociar',
  '/api/simulado',
  '/api/ensinar',
  '/api/tradutor',
  '/api/compliance',
  '/api/planilhas',
] as const

export async function middleware(request: NextRequest) {
  const pathname0 = request.nextUrl.pathname
  const method = request.method

  // Bot fast-path: POST em rota de agente sem cookie auth = 401 imediato
  // (sem invocar Supabase auth check, sem hit em DB, sem function quota).
  if (
    method === 'POST' &&
    PROTECTED_AGENT_ROUTES.some((r) => pathname0.startsWith(r)) &&
    !hasSupabaseAuthCookie(request)
  ) {
    return NextResponse.json(
      { ok: false, error: 'Nao autenticado.' },
      {
        status: 401,
        headers: {
          'Cache-Control': 'public, max-age=300, s-maxage=300',
          'X-Robots-Tag': 'noindex, nofollow',
        },
      },
    )
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as Parameters<typeof supabaseResponse.cookies.set>[2])
          )
        },
      },
    }
  )

  // Atualiza sessão (necessário para SSR com cookies)
  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Rotas publicas — acessiveis sem autenticacao
  const isPublic =
    pathname === '/' ||
    pathname.startsWith('/intro') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/empresas') ||
    pathname.startsWith('/roi') ||
    pathname.startsWith('/sobre') ||
    pathname.startsWith('/privacidade') ||
    pathname.startsWith('/termos') ||
    pathname.startsWith('/dpa') ||
    pathname.startsWith('/docs') ||
    pathname.startsWith('/status') ||
    pathname.startsWith('/share') ||
    pathname.startsWith('/oc-advogados') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/logo') ||
    pathname.startsWith('/apple-touch-icon') ||
    pathname.startsWith('/themis') ||
    pathname === '/sitemap.xml' ||
    pathname === '/robots.txt'

  // Rotas de API que nao exigem auth no middleware (possuem auth propria ou sao publicas)
  const isOpenApi =
    pathname.startsWith('/api/webhooks') ||
    pathname.startsWith('/api/cron') ||
    pathname === '/api/health' ||
    pathname.startsWith('/api/stripe') ||
    pathname.startsWith('/api/google')

  // Sem sessao e rota protegida → redireciona para /login
  if (!user && !isPublic && !isOpenApi) {
    // API routes retornam 401 JSON em vez de redirect
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ ok: false, error: 'Nao autenticado.' }, { status: 401 })
    }
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.delete('next')
    return NextResponse.redirect(loginUrl)
  }

  // Já logado e tentando acessar /login → redireciona para /dashboard
  if (user && pathname === '/login') {
    const dashUrl = request.nextUrl.clone()
    dashUrl.pathname = '/dashboard'
    return NextResponse.redirect(dashUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

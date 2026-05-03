import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
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

import { createClient } from '@/lib/supabase/server'
import { NextResponse }  from 'next/server'
import { sendEmail, welcomeEmailHtml } from '@/lib/email'
import { events } from '@/lib/analytics'

// Validate redirect path to prevent open redirect attacks + directory traversal
function sanitizeRedirect(path: string): string {
  // Must start with /
  if (!path || typeof path !== 'string') return '/dashboard'
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('://')) return '/dashboard'
  // Block directory traversal and encoded variants
  if (path.includes('/../') || path.includes('/..\\') || path.includes('%2e%2e') || path.includes('%2E%2E')) return '/dashboard'
  // Whitelist allowed top-level paths
  const ALLOWED = ['/dashboard', '/login', '/']
  const isAllowed = ALLOWED.some(p => path === p || path.startsWith(p + '/') || path.startsWith(p + '?'))
  return isAllowed ? path : '/dashboard'
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = sanitizeRedirect(searchParams.get('next') ?? '/dashboard')

  if (code) {
    const supabase = await createClient()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Fire-and-forget: send welcome email + track signup on first sign-in
      // Detect "first sign-in" by checking if created_at == last_sign_in_at (within 10s)
      const user = data?.user
      if (user) {
        try {
          const created = new Date(user.created_at).getTime()
          const lastSignIn = user.last_sign_in_at ? new Date(user.last_sign_in_at).getTime() : created
          const isFirstSignIn = Math.abs(lastSignIn - created) < 10_000
          if (isFirstSignIn && user.email) {
            const nome = (user.user_metadata?.nome as string) || user.email.split('@')[0]
            sendEmail({
              to: user.email,
              subject: 'Bem-vindo a Pralvex — seu trial de 7 dias esta ativo',
              html: welcomeEmailHtml(nome),
            }).catch(() => { /* never block auth on email failure */ })
            events.signup(user.id, user.email).catch(() => { /* silent */ })
          }
        } catch { /* silent */ }
      }

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv    = process.env.NODE_ENV === 'development'

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    } else {
      console.error('[auth/callback] Exchange error:', error.message)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth_error`)
}

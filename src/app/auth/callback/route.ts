import { createClient } from '@/lib/supabase/server'
import { NextResponse }  from 'next/server'

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
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
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

import { createClient } from '@/lib/supabase/server'
import { NextResponse }  from 'next/server'

// Validate redirect path to prevent open redirect attacks
function sanitizeRedirect(path: string): string {
  // Must start with / and not contain // or protocol
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('://')) {
    return '/dashboard'
  }
  return path
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

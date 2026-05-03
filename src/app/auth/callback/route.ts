import { createClient } from '@/lib/supabase/server'
import { NextResponse }  from 'next/server'
import { sendEmail, welcomeEmailHtml } from '@/lib/email'
import { events } from '@/lib/analytics'
import { sendMetaEvent } from '@/lib/meta-capi'
import { safeLog } from '@/lib/safe-log'

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
  // Audit business P1-3 (2026-05-03): captura ref code do redirect — usado
  // pra creditar indicacao no signup completo. Validado abaixo (8 chars hex).
  const refCodeRaw = searchParams.get('ref')
  const refCode = refCodeRaw && /^[a-f0-9]{6,12}$/i.test(refCodeRaw) ? refCodeRaw : null
  // P2-4 (2026-05-03): UTM attribution — query string tem precedencia (recente),
  // cookie 'pralvex_utm' (setado client-side em utm-capture.ts) tem fallback.
  // Stringify como JSONB pra anexar em usuarios.signup_attribution.
  const utmAttribution: Record<string, string> = {}
  for (const p of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
    const v = searchParams.get(p)
    if (v && v.length < 200) utmAttribution[p] = v
  }
  if (Object.keys(utmAttribution).length === 0) {
    // Fallback: le cookie pralvex_utm setado client-side
    const cookieHeader = request.headers.get('cookie') || ''
    const utmCookieMatch = cookieHeader.split(';').find(c => c.trim().startsWith('pralvex_utm='))
    if (utmCookieMatch) {
      try {
        const raw = decodeURIComponent(utmCookieMatch.split('=').slice(1).join('='))
        const parsed = JSON.parse(raw) as Record<string, unknown>
        for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
          const v = parsed[k]
          if (typeof v === 'string' && v.length < 200) utmAttribution[k] = v
        }
      } catch { /* malformed cookie — ignore */ }
    }
  }

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
              subject: 'Bem-vindo a Pralvex — sua demo de 50 min esta ativa',
              html: welcomeEmailHtml(nome),
            }).catch(() => { /* never block auth on email failure */ })
            events.signup(user.id, user.email).catch(() => { /* silent */ })
            // Audit business P0-2 (2026-05-03): Meta Conversions API
            // server-side. Recupera 30-50% dos signups que pixel client-side
            // perde por adblock/ITP. Email hashed SHA256 (LGPD irreversivel).
            sendMetaEvent({
              eventName: 'CompleteRegistration',
              eventId: `signup:${user.id}`,
              email: user.email,
              externalId: user.id,
              sourceUrl: `${origin}/auth/callback`,
            }).catch(() => { /* silent */ })

            // Audit business P1-3 + P2-4 (2026-05-03): processa ref code +
            // UTM attribution. Best-effort — nao bloqueia auth nem mostra erro
            // pro user. Processado em fire-and-forget pra nao atrasar redirect.
            if (refCode || Object.keys(utmAttribution).length > 0) {
              ;(async () => {
                try {
                  // Resolve indicador via referrals.code OR usuarios.referral_code
                  let referrerId: string | null = null
                  if (refCode) {
                    const { data: refByCode } = await supabase
                      .from('referrals')
                      .select('referrer_id, status')
                      .eq('code', refCode)
                      .maybeSingle()
                    if (refByCode && refByCode.status === 'pending') {
                      referrerId = refByCode.referrer_id
                    } else {
                      // fallback: ref code pode ser referral_code do indicador
                      const { data: refByUser } = await supabase
                        .from('usuarios')
                        .select('id')
                        .eq('referral_code', refCode)
                        .maybeSingle()
                      if (refByUser) referrerId = refByUser.id
                    }
                  }
                  // Update usuarios row com referred_by + signup_attribution
                  const updates: Record<string, unknown> = {}
                  if (referrerId) updates.referred_by = referrerId
                  if (Object.keys(utmAttribution).length > 0) updates.signup_attribution = utmAttribution
                  if (Object.keys(updates).length > 0) {
                    await supabase
                      .from('usuarios')
                      .update(updates)
                      .eq('auth_user_id', user.id)
                  }
                  // Vincula referral row ao referred_id se nao tinha (usado em handleReferralConversion)
                  if (referrerId && refCode) {
                    const { data: usuarioRow } = await supabase
                      .from('usuarios')
                      .select('id')
                      .eq('auth_user_id', user.id)
                      .maybeSingle()
                    if (usuarioRow) {
                      await supabase
                        .from('referrals')
                        .update({ referred_id: usuarioRow.id })
                        .eq('code', refCode)
                        .eq('status', 'pending')
                    }
                  }
                } catch (err) {
                  safeLog.warn('[auth/callback] ref/utm capture failed:', err instanceof Error ? err.message : 'unknown')
                }
              })()
            }
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
      safeLog.error('[auth/callback] Exchange error:', error.message)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth_error`)
}

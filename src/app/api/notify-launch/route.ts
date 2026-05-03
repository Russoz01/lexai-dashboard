import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { safeLog } from '@/lib/safe-log'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * POST /api/notify-launch?feature=<slug>
 *
 * Inscreve user logado pra receber email quando uma feature em-breve lancar.
 * Idempotente — se user ja pediu pra mesma feature, retorna ok sem duplicar.
 *
 * Wired pelo botao "Avisar quando lançar" em /dashboard/em-breve.
 *
 * Tabela: feature_notifications (migration 013).
 *
 * Constraints:
 *   - Auth obrigatoria (RLS auth.uid() = usuario_id na tabela)
 *   - Rate-limit por user — 5 inscricoes em 60s evita F5 spam
 *   - feature_slug validado contra catalog.ts implicit (length 1..60)
 */

const FEATURE_SLUG_RE = /^[a-z0-9][a-z0-9-]{0,59}$/i

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const featureSlug = (url.searchParams.get('feature') || '').trim().toLowerCase()

    if (!featureSlug || !FEATURE_SLUG_RE.test(featureSlug)) {
      return NextResponse.json({ error: 'invalid_feature', code: 'invalid_feature' }, { status: 400 })
    }

    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'unauthorized', code: 'unauthorized' }, { status: 401 })
    }

    // Resolve usuario_id (tabela usuarios mapeada via auth_user_id)
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('id')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    if (!usuario) {
      return NextResponse.json({ error: 'user_not_found', code: 'unauthorized' }, { status: 401 })
    }

    // Rate-limit — 5 inscricoes/min/user. Mais que isso = F5 abuse.
    const rl = await checkRateLimit(supabase, `user:${usuario.id}:notify-launch`)
    if (!rl.ok) {
      return NextResponse.json({ error: 'rate_limit', code: 'rate_limit' }, { status: 429 })
    }

    // Insert idempotente — onConflict no unique (usuario_id, feature_slug)
    const { error } = await supabase
      .from('feature_notifications')
      .upsert(
        { usuario_id: usuario.id, feature_slug: featureSlug },
        { onConflict: 'usuario_id,feature_slug', ignoreDuplicates: true },
      )

    if (error) {
      safeLog.error('[api/notify-launch] upsert error:', error.message)
      return NextResponse.json({ error: 'server_error', code: 'server_error' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown'
    safeLog.error('[api/notify-launch] error:', msg)
    return NextResponse.json({ error: 'server_error', code: 'server_error' }, { status: 500 })
  }
}

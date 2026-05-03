import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { safeLog } from '@/lib/safe-log'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * POST /api/cancel-reasons (audit business P1-2 · 2026-05-03)
 *
 * Body:
 *   {
 *     reason: 'caro' | 'nao_usei' | 'falta_feature' | 'mudei_sistema' | 'outro',
 *     detail?: string,
 *     offered?: 'cupom_30' | 'onboarding' | 'beta' | 'pause',
 *     accepted?: boolean,
 *     proceeded?: boolean
 *   }
 *
 * Save flow: antes de redirecionar pro Stripe Customer Portal, frontend chama
 * essa rota com o motivo + counter-offer. Se usuario aceita oferta, registra
 * accepted=true + proceeded=false (continuou). Se foi pro portal, proceeded=true.
 *
 * Side effects:
 *   - Insert em cancel_reasons.
 *   - Update usuarios.last_cancel_attempt_at + last_cancel_reason.
 */
const VALID_REASONS = new Set(['caro', 'nao_usei', 'falta_feature', 'mudei_sistema', 'outro'])
const VALID_OFFERS = new Set(['cupom_30', 'onboarding', 'beta', 'pause'])

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({})) as {
      reason?: string
      detail?: string
      offered?: string
      accepted?: boolean
      proceeded?: boolean
    }

    if (!body.reason || !VALID_REASONS.has(body.reason)) {
      return NextResponse.json({ error: 'invalid_reason' }, { status: 400 })
    }

    // Resolve usuario_id
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('id')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    if (!usuario) {
      return NextResponse.json({ error: 'user_not_found' }, { status: 404 })
    }

    const detail = typeof body.detail === 'string' ? body.detail.slice(0, 1000) : null
    const offered = body.offered && VALID_OFFERS.has(body.offered) ? body.offered : null
    const accepted = typeof body.accepted === 'boolean' ? body.accepted : null
    const proceeded = body.proceeded === true

    const { error: insertError } = await supabase
      .from('cancel_reasons')
      .insert({
        usuario_id: usuario.id,
        reason: body.reason,
        detail,
        offered,
        accepted,
        proceeded,
      })

    if (insertError) {
      safeLog.error('[cancel-reasons] insert failed:', insertError.message)
      return NextResponse.json({ error: 'insert_failed' }, { status: 500 })
    }

    // Update usuarios pra analytics rapida (sem precisar join cancel_reasons)
    await supabase
      .from('usuarios')
      .update({
        last_cancel_attempt_at: new Date().toISOString(),
        last_cancel_reason: body.reason,
      })
      .eq('id', usuario.id)

    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown'
    safeLog.error('[cancel-reasons] handler error:', msg)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
}

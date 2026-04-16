import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ok, unauthorized, serverError, fail } from '@/lib/api-response'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

/**
 * GET /api/referral — retorna o codigo de indicacao do usuario logado
 * e a lista de indicacoes feitas (pending + completed).
 *
 * Se o usuario ainda nao tem codigo, gera um automaticamente.
 */
export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return unauthorized()

    const { data: usuario } = await supabase
      .from('usuarios')
      .select('id, referral_code, nome')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    if (!usuario) return unauthorized('Usuario nao encontrado.')

    let code = usuario.referral_code

    // Gera codigo se nao existe
    if (!code) {
      code = crypto.randomBytes(4).toString('hex') // 8 chars hex
      await supabase
        .from('usuarios')
        .update({ referral_code: code })
        .eq('id', usuario.id)
    }

    // Lista indicacoes
    const { data: referrals } = await supabase
      .from('referrals')
      .select('id, code, status, reward_days, reward_applied, created_at, completed_at')
      .eq('referrer_id', usuario.id)
      .order('created_at', { ascending: false })
      .limit(20)

    const completed = (referrals ?? []).filter(r => r.status === 'completed').length
    const pending = (referrals ?? []).filter(r => r.status === 'pending').length

    return ok({
      code,
      shareUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://lexai.com.br'}/login?ref=${code}`,
      stats: { completed, pending, totalDaysEarned: completed * 15 },
      referrals: referrals ?? [],
    })
  } catch (err) {
    return serverError('referral/get', err)
  }
}

/**
 * POST /api/referral — gera um novo link de indicacao (cria row em referrals)
 * Body: { email?: string } — opcional, para rastrear pra quem foi enviado
 */
export async function POST() {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return unauthorized()

    const { data: usuario } = await supabase
      .from('usuarios')
      .select('id, referral_code')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    if (!usuario) return unauthorized('Usuario nao encontrado.')

    let code = usuario.referral_code
    if (!code) {
      code = crypto.randomBytes(4).toString('hex')
      await supabase
        .from('usuarios')
        .update({ referral_code: code })
        .eq('id', usuario.id)
    }

    // Limita a 50 indicacoes pendentes
    const { count } = await supabase
      .from('referrals')
      .select('id', { count: 'exact' })
      .eq('referrer_id', usuario.id)
      .eq('status', 'pending')

    if ((count ?? 0) >= 50) {
      return fail('Limite de 50 indicacoes pendentes atingido.', 429)
    }

    const inviteCode = crypto.randomBytes(6).toString('hex')

    const { error: insertError } = await supabase
      .from('referrals')
      .insert({
        referrer_id: usuario.id,
        code: inviteCode,
        status: 'pending',
        reward_days: 15,
      })

    if (insertError) {
      return fail('Erro ao criar indicacao.', 500)
    }

    return ok({
      code: inviteCode,
      shareUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://lexai.com.br'}/login?ref=${code}`,
    })
  } catch (err) {
    return serverError('referral/post', err)
  }
}

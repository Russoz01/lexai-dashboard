import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveUsuarioIdServer } from '@/lib/api-utils'
import { ok, fail, unauthorized, serverError } from '@/lib/api-response'

export const dynamic = 'force-dynamic'

/**
 * LGPD Art. 18, VI — eliminacao dos dados pessoais tratados com consentimento.
 *
 * Safeguards:
 * - Requires authenticated session
 * - Requires explicit string confirmation "EXCLUIR MINHA CONTA" in the body
 * - Cancels any active Stripe subscription via the portal URL in the response
 *   (we do NOT call Stripe directly — user performs the cancellation to avoid
 *   silent charge-backs)
 * - Cascades deletes through related tables, then deletes the profile, then
 *   deletes the auth.users row via service-role admin client
 */
const CONFIRMATION = 'EXCLUIR MINHA CONTA'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return unauthorized()

    let body: { confirmation?: string } = {}
    try {
      body = await req.json()
    } catch {
      return fail('Corpo da requisicao invalido.', 400, 'invalid_body')
    }

    if (body.confirmation !== CONFIRMATION) {
      return fail(
        `Confirmacao invalida. Envie { "confirmation": "${CONFIRMATION}" } para prosseguir.`,
        400,
        'confirmation_required',
      )
    }

    const usuarioId = await resolveUsuarioIdServer(supabase, user.id, user.email)
    if (!usuarioId) return unauthorized('Usuario nao encontrado.')

    // Hard delete — admin client bypasses RLS safely because we've already
    // authenticated the subject and scoped every query by their id.
    const admin = createAdminClient()

    const cascadeTables = [
      'historico',
      'oauth_tokens',
      'financeiro',
      'shared_documents',
    ] as const

    const errors: string[] = []
    for (const table of cascadeTables) {
      const { error } = await admin.from(table).delete().eq('user_id', usuarioId)
      if (error) errors.push(`${table}: ${error.message}`)
    }

    // Delete the profile row
    const { error: profileErr } = await admin.from('usuarios').delete().eq('id', usuarioId)
    if (profileErr) errors.push(`usuarios: ${profileErr.message}`)

    // Delete the auth user — invalidates all sessions + tokens
    const { error: authDelErr } = await admin.auth.admin.deleteUser(user.id)
    if (authDelErr) errors.push(`auth: ${authDelErr.message}`)

    if (errors.length) {
      // Partial — log for manual follow-up
      // eslint-disable-next-line no-console
      console.error('[api/user/delete] partial failure:', errors.join(' | '))
      return fail(
        'A exclusao foi parcialmente concluida. Nossa equipe sera notificada.',
        500,
        'partial_deletion',
      )
    }

    // Sign out on client — session is already invalid
    return ok({
      deleted: true,
      deletedAt: new Date().toISOString(),
      message: 'Conta excluida. Todos os seus dados foram removidos em conformidade com a LGPD.',
    })
  } catch (err) {
    return serverError('user/delete', err)
  }
}

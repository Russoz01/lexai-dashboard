import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveUsuarioIdServer } from '@/lib/api-utils'
import { ok, fail, unauthorized, notFound, serverError } from '@/lib/api-response'
import { audit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

/**
 * POST /api/equipe/aceitar — consume an invite token.
 *
 * Flow:
 *   1. User hits /equipe/aceitar?token=XYZ in the browser.
 *   2. That page posts the token here.
 *   3. We validate token, expiry, status, and that the authenticated
 *      user's email matches the invite email (case-insensitive).
 *   4. We insert an equipe_membros row and mark the invite accepted.
 *
 * Body: { token: string }
 */

type Body = { token?: string }

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user || !user.email) {
      return unauthorized('Faca login para aceitar o convite.')
    }

    let body: Body
    try {
      body = await req.json()
    } catch {
      return fail('Corpo invalido.', 400, 'invalid_body')
    }
    if (!body.token) return fail('Token obrigatorio.', 400, 'token_required')

    const admin = createAdminClient()

    const { data: invite } = await admin
      .from('equipe_convites')
      .select('id, equipe_id, email, role, status, expires_at')
      .eq('token', body.token)
      .maybeSingle()

    if (!invite) return notFound('Convite nao encontrado.')
    if (invite.status !== 'pending') {
      return fail(
        `Convite ja ${invite.status === 'accepted' ? 'aceito' : invite.status === 'revoked' ? 'revogado' : 'expirado'}.`,
        410,
        'invite_not_pending',
      )
    }
    if (new Date(invite.expires_at).getTime() < Date.now()) {
      await admin.from('equipe_convites').update({ status: 'expired' }).eq('id', invite.id)
      return fail('Convite expirado. Peca um novo ao administrador.', 410, 'invite_expired')
    }
    if (invite.email.toLowerCase() !== user.email.toLowerCase()) {
      return fail(
        'Este convite foi enviado para outro email. Faca login com o email correto.',
        403,
        'email_mismatch',
      )
    }

    // Resolve usuario row via auth_user_id (NÃO confundir com auth.users.id).
    // Bug crítico anterior: eq('id', user.id) e insert({ id: user.id }) tratavam
    // auth.users.id como se fosse usuarios.id — quebrava FKs em todo o resto
    // do app. resolveUsuarioIdServer faz o mapeamento correto + lazy-create
    // se trigger missed.
    const usuarioId = await resolveUsuarioIdServer(admin, user.id, user.email, user.user_metadata?.nome as string | undefined)
    if (!usuarioId) {
      return serverError('equipe/aceitar', new Error('failed_to_resolve_usuario_id'))
    }

    // Idempotent membership insert
    const { error: memberErr } = await admin
      .from('equipe_membros')
      .upsert(
        { equipe_id: invite.equipe_id, usuario_id: usuarioId, role: invite.role },
        { onConflict: 'equipe_id,usuario_id' },
      )
    if (memberErr) return serverError('equipe/aceitar', memberErr)

    await admin
      .from('equipe_convites')
      .update({ status: 'accepted', accepted_at: new Date().toISOString() })
      .eq('id', invite.id)

    await audit({
      usuarioId,
      action: 'team.member_accept',
      entityType: 'equipe',
      entityId: invite.equipe_id,
      metadata: { inviteId: invite.id, role: invite.role },
      request: req,
    })

    return ok({
      equipeId: invite.equipe_id,
      role: invite.role,
      joined: true,
    })
  } catch (err) {
    return serverError('equipe/aceitar', err)
  }
}

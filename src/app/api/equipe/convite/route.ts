import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ok, fail, unauthorized, forbidden, serverError } from '@/lib/api-response'
import { audit } from '@/lib/audit'
import { sendInviteEmail } from '@/lib/email'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

/**
 * POST /api/equipe/convite
 *
 * Create an invite for a colleague to join an equipe. Body:
 *   { equipeId: string; email: string; role?: 'admin' | 'member' }
 *
 * Authorization:
 *   - Caller must be an owner or admin of the target equipe
 *   - Cannot exceed `seats_paid` on the equipe's Stripe subscription
 *
 * Returns the invite token and an accept URL. The email is dispatched
 * by a companion Resend job (see src/lib/email.ts — `sendInviteEmail`).
 */

const MAX_PENDING_INVITES = 50 // spam guard per equipe

type InviteBody = {
  equipeId: string
  email: string
  role?: 'admin' | 'member'
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return unauthorized()

    let body: InviteBody
    try {
      body = await req.json()
    } catch {
      return fail('Corpo invalido.', 400, 'invalid_body')
    }

    const email = (body.email || '').trim().toLowerCase()
    const role = body.role === 'admin' ? 'admin' : 'member'

    if (!body.equipeId) return fail('equipeId obrigatorio.', 400)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return fail('Email invalido.', 400, 'invalid_email')
    }

    const admin = createAdminClient()

    // 1. Confirm caller is owner/admin of the equipe
    const { data: membership } = await admin
      .from('equipe_membros')
      .select('role')
      .eq('equipe_id', body.equipeId)
      .eq('usuario_id', user.id)
      .maybeSingle()

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return forbidden('Apenas owner ou admin da equipe pode convidar.')
    }

    // 2. Seat check: current_members + pending_invites < seats_paid
    const { data: equipe } = await admin
      .from('equipes')
      .select('seats_paid, nome')
      .eq('id', body.equipeId)
      .maybeSingle()
    if (!equipe) return fail('Equipe nao encontrada.', 404, 'equipe_not_found')

    const [{ count: memberCount }, { count: pendingInvites }] = await Promise.all([
      admin
        .from('equipe_membros')
        .select('*', { count: 'exact', head: true })
        .eq('equipe_id', body.equipeId),
      admin
        .from('equipe_convites')
        .select('*', { count: 'exact', head: true })
        .eq('equipe_id', body.equipeId)
        .eq('status', 'pending'),
    ])

    if ((pendingInvites ?? 0) >= MAX_PENDING_INVITES) {
      return fail(
        'Limite de convites pendentes atingido. Revogue algum antes de criar novos.',
        429,
        'too_many_invites',
      )
    }

    if ((memberCount ?? 0) + (pendingInvites ?? 0) >= equipe.seats_paid) {
      return fail(
        `Seats esgotados (${equipe.seats_paid}). Atualize o plano para convidar mais membros.`,
        402,
        'seats_exhausted',
      )
    }

    // 3. Reject if email already is a member
    const { data: existingUser } = await admin
      .from('usuarios')
      .select('id')
      .ilike('email', email)
      .maybeSingle()
    if (existingUser) {
      const { data: alreadyMember } = await admin
        .from('equipe_membros')
        .select('equipe_id')
        .eq('equipe_id', body.equipeId)
        .eq('usuario_id', existingUser.id)
        .maybeSingle()
      if (alreadyMember) {
        return fail('Este usuario ja e membro da equipe.', 409, 'already_member')
      }
    }

    // 4. Create the invite
    const token = crypto.randomBytes(32).toString('hex')
    const { data: invite, error: insertErr } = await admin
      .from('equipe_convites')
      .insert({
        equipe_id: body.equipeId,
        email,
        role,
        invited_by: user.id,
        token,
      })
      .select('id, token, expires_at')
      .single()

    if (insertErr || !invite) {
      return serverError('equipe/convite', insertErr || new Error('insert_failed'))
    }

    await audit({
      usuarioId: user.id,
      action: 'team.member_invite',
      entityType: 'equipe',
      entityId: body.equipeId,
      metadata: { email, role },
      request: req,
    })

    const origin = req.headers.get('origin') || 'https://pralvex.com.br'
    const acceptUrl = `${origin}/equipe/aceitar?token=${invite.token}`

    // Fetch caller display name for the email salutation. Falls back to
    // email local-part if nome is unset.
    const { data: inviter } = await admin
      .from('usuarios')
      .select('nome, email')
      .eq('id', user.id)
      .maybeSingle()
    const invitedByName =
      inviter?.nome?.trim() || inviter?.email?.split('@')[0] || 'Um colega'

    // Fire-and-forget — delivery failures shouldn't block invite creation
    // (admin can re-send from the UI). Logged by the email lib.
    void sendInviteEmail({
      to: email,
      invitedByName,
      equipeNome: equipe.nome,
      acceptUrl,
    })

    return ok({
      inviteId: invite.id,
      acceptUrl,
      expiresAt: invite.expires_at,
      email,
      role,
    })
  } catch (err) {
    return serverError('equipe/convite', err)
  }
}

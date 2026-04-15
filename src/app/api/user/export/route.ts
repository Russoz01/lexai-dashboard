import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveUsuarioIdServer } from '@/lib/api-utils'
import { ok, unauthorized, serverError } from '@/lib/api-response'

export const dynamic = 'force-dynamic'

/**
 * LGPD Art. 18, II — portabilidade dos dados.
 * Returns every row the authenticated user owns, as a downloadable JSON bundle.
 * Sensitive fields (stripe_customer_id, auth_user_id) are included for the
 * data subject but nothing from other users.
 */
export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return unauthorized()

    const usuarioId = await resolveUsuarioIdServer(
      supabase,
      user.id,
      user.email,
      user.user_metadata?.nome,
    )
    if (!usuarioId) return unauthorized('Usuario nao encontrado.')

    // Fetch the profile row
    const { data: profile } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', usuarioId)
      .maybeSingle()

    // Fetch every related collection — each filtered by user_id
    const [historico, oauthTokens, financeiro, sharedDocuments] = await Promise.all([
      supabase.from('historico').select('*').eq('user_id', usuarioId),
      supabase.from('oauth_tokens').select('provider, scope, created_at, updated_at').eq('user_id', usuarioId),
      supabase.from('financeiro').select('*').eq('user_id', usuarioId),
      supabase.from('shared_documents').select('*').eq('user_id', usuarioId),
    ])

    const bundle = {
      exportedAt: new Date().toISOString(),
      legalBasis: 'LGPD Art. 18, II — Direito a portabilidade dos dados',
      subject: {
        id: usuarioId,
        authUserId: user.id,
        email: user.email,
      },
      profile: profile || null,
      historico: historico.data || [],
      oauthTokens: oauthTokens.data || [], // tokens themselves never exported
      financeiro: financeiro.data || [],
      sharedDocuments: sharedDocuments.data || [],
    }

    const filename = `lexai-export-${usuarioId.slice(0, 8)}-${new Date().toISOString().split('T')[0]}.json`

    return new NextResponse(JSON.stringify(bundle, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  } catch (err) {
    return serverError('user/export', err)
  }
}

// Keep response helper for test probes
export async function HEAD() {
  return ok({ available: true })
}

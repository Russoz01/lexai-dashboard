import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'

const MAX_INPUT_LENGTH = 50000 // 50k chars max

/**
 * Resolves public.usuarios.id from an auth.users.id.
 * Every FK in the schema points to usuarios.id — never insert auth.users.id
 * directly. Falls back to email lookup + lazy creation if trigger missed.
 */
export async function resolveUsuarioIdServer(
  supabase: SupabaseClient,
  authUserId: string,
  email?: string | null,
  nome?: string | null,
): Promise<string | null> {
  // Primary lookup
  const { data } = await supabase
    .from('usuarios')
    .select('id')
    .eq('auth_user_id', authUserId)
    .maybeSingle()
  if (data?.id) return data.id

  // Fallback: email lookup (legacy rows)
  if (email) {
    const { data: byEmail } = await supabase
      .from('usuarios')
      .select('id, auth_user_id')
      .eq('email', email)
      .maybeSingle()
    if (byEmail?.id) {
      if (!byEmail.auth_user_id) {
        await supabase.from('usuarios').update({ auth_user_id: authUserId }).eq('id', byEmail.id)
      }
      return byEmail.id
    }
  }

  // Last resort: create the row (trigger should have done this).
  // Sem email não faz sentido criar — gera duplicata fantasma quando o user
  // real entrar (constraint unique(email) com '' colide depois). Bail.
  if (!email || !email.trim()) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('[resolveUsuarioIdServer] no email available — skipping insert to avoid ghost row')
    }
    return null
  }

  const { data: created, error } = await supabase
    .from('usuarios')
    .insert({
      auth_user_id: authUserId,
      email,
      nome: nome || email.split('@')[0],
      plano: 'free',
      subscription_status: 'trialing',
    })
    .select('id')
    .single()

  if (error || !created?.id) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('[resolveUsuarioIdServer] Failed to create usuarios row:', error?.message)
    }
    return null
  }
  return created.id
}

export async function validateAuth() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return { user: null, supabase, error: NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 }) }
  return { user, supabase, error: null }
}

export function validateInput(text: string | undefined, minLength: number, fieldName: string) {
  if (!text || text.trim().length < minLength) {
    return NextResponse.json({ error: `${fieldName} muito curto. Minimo ${minLength} caracteres.` }, { status: 400 })
  }
  if (text.length > MAX_INPUT_LENGTH) {
    return NextResponse.json({ error: `${fieldName} excede o limite de ${MAX_INPUT_LENGTH} caracteres.` }, { status: 400 })
  }
  return null
}

export function safeError(context: string, err: unknown) {
  const msg = err instanceof Error ? err.message : 'Erro interno'
  // eslint-disable-next-line no-console
  console.error(`[API ${context}]`, msg)

  // Map common Anthropic SDK errors to actionable status codes
  let statusCode = 500
  let clientMsg = 'Ocorreu um erro ao processar sua solicitacao. Tente novamente.'

  if (typeof msg === 'string') {
    if (msg.includes('401') || msg.toLowerCase().includes('invalid_api_key') || msg.toLowerCase().includes('authentication')) {
      statusCode = 503
      clientMsg = 'Servico de IA temporariamente indisponivel. Tente novamente em alguns minutos.'
    } else if (msg.includes('429') || msg.toLowerCase().includes('rate_limit') || msg.toLowerCase().includes('quota')) {
      statusCode = 429
      clientMsg = 'Muitas requisicoes. Aguarde 60 segundos antes de tentar novamente.'
    } else if (msg.toLowerCase().includes('timeout') || msg.toLowerCase().includes('etimedout')) {
      statusCode = 504
      clientMsg = 'O servico de IA demorou muito para responder. Tente um documento menor.'
    } else if (msg.toLowerCase().includes('overloaded')) {
      statusCode = 503
      clientMsg = 'O servico de IA esta sobrecarregado. Tente novamente em 30 segundos.'
    }
  }

  return NextResponse.json({ error: clientMsg }, { status: statusCode })
}

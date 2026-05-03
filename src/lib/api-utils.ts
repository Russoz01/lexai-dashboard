import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { safeLog } from './safe-log'

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
      safeLog.warn('[resolveUsuarioIdServer] no email available — skipping insert to avoid ghost row')
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
      safeLog.error('[resolveUsuarioIdServer] Failed to create usuarios row:', error?.message)
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

// validateInput removido em 2026-05-03 (review elite: 0 callers; rotas usam Zod schemas
// inline ou check manual via api-input-validation.ts). Re-adicionar se padrao mudar.

export function safeError(context: string, err: unknown) {
  const msg = err instanceof Error ? err.message : 'Erro interno'
  // eslint-disable-next-line no-console
  safeLog.error(`[API ${context}]`, msg)

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

/**
 * Parse JSON output de agente IA. Antes era 5 linhas repetidas em 21 routes:
 *   const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
 *   try { parsed = JSON.parse(cleaned) } catch { parsed = fallback }
 *
 * Agora 1 linha:
 *   const parsed = parseAgentJSON(responseText, { ...fallback })
 *
 * Modelo as vezes retorna ```json ... ``` (markdown code fence) ou JSON puro.
 * Esta funcao tira fence + trim + parse com try/catch + retorna fallback se falhar.
 */
export function parseAgentJSON<T = unknown>(responseText: string, fallback: T): T {
  try {
    // Wave C5 fix: regex case-insensitive (Anthropic às vezes retorna ```JSON
    // ou ```Json). Antes só pegava lowercase, deixando fence corromper o parse.
    const cleaned = responseText
      .replace(/```(?:json|json5)?\s*\n?/gi, '')
      .replace(/```\s*\n?/g, '')
      .trim()
    return JSON.parse(cleaned) as T
  } catch (e) {
    // Wave C5 fix: log warning mesmo em prod pra debug — antes engolia silente
    // e operador não saberia o motivo do fallback genérico durante demo.
    // eslint-disable-next-line no-console
    safeLog.warn('[parseAgentJSON] parse failed:', e instanceof Error ? e.message.slice(0, 120) : String(e), '| preview:', responseText.slice(0, 120))
    return fallback
  }
}

/**
 * Retry helper para chamadas Anthropic. Tenta até `maxAttempts` vezes com
 * backoff exponencial (300ms, 900ms, 2700ms) APENAS para erros transientes:
 * 429 rate limit, 502/503/504 server errors, overloaded, timeout.
 *
 * Não retenta para 401 (auth), 400 (bad request) — falham rápido.
 *
 * Wave C5 (2026-05-02) — pré-demo resilience.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelayMs = 300,
): Promise<T> {
  let lastError: unknown
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      const msg = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase()
      const retryable = msg.includes('429')
        || msg.includes('rate_limit')
        || msg.includes('overloaded')
        || msg.includes('timeout')
        || msg.includes('etimedout')
        || msg.includes('502')
        || msg.includes('503')
        || msg.includes('504')
        || msg.includes('econnreset')
      if (!retryable || attempt === maxAttempts) throw err
      const delay = baseDelayMs * Math.pow(3, attempt - 1) // 300, 900, 2700
      // eslint-disable-next-line no-console
      safeLog.warn(`[withRetry] attempt ${attempt}/${maxAttempts} failed (${msg.slice(0, 80)}), retrying in ${delay}ms`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  throw lastError
}

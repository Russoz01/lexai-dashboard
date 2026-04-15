import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'

/**
 * Standard response envelope used by every API route.
 * Shape: { ok: true, data } | { ok: false, error, code? }
 *
 * Using a typed envelope — instead of ad-hoc NextResponse.json({ error }) —
 * lets the frontend branch on a single discriminant and keeps error codes
 * stable for analytics and Sentry breadcrumbs.
 */
export type ApiSuccess<T> = { ok: true; data: T }
export type ApiFailure = { ok: false; error: string; code?: string }
export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<ApiSuccess<T>>({ ok: true, data }, init)
}

export function fail(error: string, status = 400, code?: string) {
  return NextResponse.json<ApiFailure>({ ok: false, error, ...(code ? { code } : {}) }, { status })
}

export function unauthorized(message = 'Nao autorizado.') {
  return fail(message, 401, 'unauthorized')
}

export function forbidden(message = 'Acesso negado.') {
  return fail(message, 403, 'forbidden')
}

export function notFound(message = 'Nao encontrado.') {
  return fail(message, 404, 'not_found')
}

export function rateLimited(message = 'Muitas requisicoes. Aguarde e tente novamente.') {
  return fail(message, 429, 'rate_limited')
}

/**
 * Server-side error reporter. Logs with a context prefix and returns a safe
 * client payload — never leaks stack traces or internal messages.
 */
export function serverError(context: string, err: unknown) {
  const msg = err instanceof Error ? err.message : String(err)
  // eslint-disable-next-line no-console
  console.error(`[API ${context}]`, msg)

  // Map upstream errors to actionable status codes
  const lower = msg.toLowerCase()
  const isUpstreamKnown =
    msg.includes('401') || msg.includes('429') ||
    lower.includes('invalid_api_key') || lower.includes('authentication') ||
    lower.includes('rate_limit') || lower.includes('quota') ||
    lower.includes('timeout') || lower.includes('etimedout') ||
    lower.includes('overloaded')

  // Ship ONLY unexpected errors to Sentry. The four mapped cases above are
  // known upstream states (Anthropic overloaded, user rate-limited) and
  // alerting on them would be noise, not signal.
  if (!isUpstreamKnown) {
    Sentry.captureException(err, {
      tags: { route: context, kind: 'api_server_error' },
    })
  }

  if (msg.includes('401') || lower.includes('invalid_api_key') || lower.includes('authentication')) {
    return fail('Servico de IA temporariamente indisponivel.', 503, 'ai_auth_failed')
  }
  if (msg.includes('429') || lower.includes('rate_limit') || lower.includes('quota')) {
    return fail('Muitas requisicoes. Aguarde 60 segundos.', 429, 'ai_rate_limit')
  }
  if (lower.includes('timeout') || lower.includes('etimedout')) {
    return fail('O servico de IA demorou muito para responder.', 504, 'ai_timeout')
  }
  if (lower.includes('overloaded')) {
    return fail('O servico de IA esta sobrecarregado. Tente em 30s.', 503, 'ai_overloaded')
  }
  return fail('Ocorreu um erro ao processar sua solicitacao.', 500, 'internal_error')
}

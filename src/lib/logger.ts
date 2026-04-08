// Centralized logger. Replaces scattered console.error/console.log calls and
// empty catch blocks. Keeps PII out of logs by truncating long strings and
// redacting sensitive keys (any key matching password/token/secret/texto/etc).
//
// Sentry is not wired — if SENTRY_DSN is ever added, instrumentation can call
// Sentry.captureException from here without touching callers.

type LogContext = Record<string, unknown>

const SENSITIVE_KEY_PATTERN = /password|token|secret|authorization|senha|cpf|cnpj/i
const LONG_CONTENT_KEYS = new Set([
  'texto',
  'documento',
  'conteudo',
  'consulta',
  'query',
  'tema',
  'instrucoes',
  'situacao',
  'responseText',
])

function sanitize(ctx: LogContext): LogContext {
  const out: LogContext = {}
  for (const [k, v] of Object.entries(ctx)) {
    if (SENSITIVE_KEY_PATTERN.test(k)) {
      out[k] = '[redacted]'
      continue
    }
    if (LONG_CONTENT_KEYS.has(k) && typeof v === 'string') {
      out[k] = `[${v.length} chars]`
      continue
    }
    if (typeof v === 'string' && v.length > 200) {
      out[k] = v.slice(0, 200) + '...[truncated]'
      continue
    }
    out[k] = v
  }
  return out
}

function errorToFields(err: unknown): { message: string; name: string; stack?: string } {
  if (err instanceof Error) {
    return { message: err.message, name: err.name, stack: err.stack }
  }
  return { message: String(err), name: 'NonErrorThrown' }
}

export function logError(err: unknown, ctx: LogContext = {}): void {
  const fields = errorToFields(err)
  const safe = sanitize(ctx)
  if (process.env.NODE_ENV === 'production') {
    // eslint-disable-next-line no-console
    console.error('[lexai:error]', fields.message, { name: fields.name, ...safe })
  } else {
    // eslint-disable-next-line no-console
    console.error('[lexai:error]', fields.message, safe, fields.stack)
  }
}

export function logWarn(message: string, ctx: LogContext = {}): void {
  // eslint-disable-next-line no-console
  console.warn('[lexai:warn]', message, sanitize(ctx))
}

export function logInfo(message: string, ctx: LogContext = {}): void {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log('[lexai:info]', message, sanitize(ctx))
  }
}

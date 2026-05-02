/* ════════════════════════════════════════════════════════════════════
 * safe-log · v1.0 (2026-05-02)
 * ────────────────────────────────────────────────────────────────────
 * Wrapper de logging que escruba dados sensíveis antes de enviar pro
 * stdout/Sentry/Vercel function logs.
 *
 * Audit Wave R1 fix SEC-05: 24 routes API com 63 ocorrências de
 * console.* potencialmente vazando PII via Vercel function logs (que
 * ficam em retenção). Esse wrapper:
 *   1. Drop chaves sensíveis (email, senha, cpf, cnpj, token, key, etc)
 *   2. Trunca strings >500 chars
 *   3. Em prod, filtra stack traces que vazam paths internos
 *
 * Uso:
 *   import { safeLog } from '@/lib/safe-log'
 *   safeLog.error('[chat]', { userId, error: err })
 *
 * Drop-in replacement de console.* — mesma assinatura.
 * ═══════════════════════════════════════════════════════════════════ */

const SENSITIVE_KEYS = [
  'email', 'senha', 'password', 'pwd', 'pass',
  'cpf', 'cnpj', 'rg', 'cnh',
  'token', 'access_token', 'refresh_token', 'api_key', 'apikey',
  'secret', 'private_key', 'authorization', 'auth',
  'card_number', 'cvv', 'cvc',
  'phone', 'telefone', 'celular',
  'address', 'endereco', 'rua', 'cep',
] as const

const MAX_STRING_LEN = 500

function isSensitiveKey(key: string): boolean {
  const k = key.toLowerCase()
  return SENSITIVE_KEYS.some(s => k.includes(s))
}

/**
 * Recurse no objeto e substitui valores de chaves sensíveis por '[REDACTED]'.
 * Trunca strings longas.
 */
function scrub(value: unknown, depth = 0): unknown {
  if (depth > 10) return '[MAX_DEPTH]'
  if (value == null) return value

  if (typeof value === 'string') {
    return value.length > MAX_STRING_LEN
      ? value.slice(0, MAX_STRING_LEN) + '...[truncated]'
      : value
  }

  if (typeof value !== 'object') return value

  if (Array.isArray(value)) {
    return value.map(v => scrub(v, depth + 1))
  }

  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(value)) {
    if (isSensitiveKey(k)) {
      out[k] = '[REDACTED]'
    } else {
      out[k] = scrub(v, depth + 1)
    }
  }
  return out
}

function format(args: unknown[]): unknown[] {
  return args.map(a => {
    if (a instanceof Error) {
      return {
        name: a.name,
        message: a.message.slice(0, MAX_STRING_LEN),
        // Stack só em dev — em prod vaza paths internos do Vercel
        stack: process.env.NODE_ENV === 'production'
          ? undefined
          : a.stack?.split('\n').slice(0, 5).join(' | '),
      }
    }
    if (typeof a === 'object' && a !== null) {
      return scrub(a)
    }
    return a
  })
}

export const safeLog = {
  log: (...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.log(...format(args))
  },
  warn: (...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.warn(...format(args))
  },
  error: (...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.error(...format(args))
  },
  /** Log dev-only — silencioso em prod */
  debug: (...args: unknown[]) => {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log('[debug]', ...format(args))
    }
  },
}

/** Helper exportado pra testes ou uso direto */
export { scrub as scrubSensitive }

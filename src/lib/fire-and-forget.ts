/* ════════════════════════════════════════════════════════════════════
 * fire-and-forget · v1.0 (2026-05-03)
 * ────────────────────────────────────────────────────────────────────
 * Helper pra promises non-blocking em routes API. Substitui o pattern
 * frágil `someAsync().catch(() => {})` por execução garantida com log.
 *
 * Por que existe:
 *   No Vercel, lambda congela depois que Response/stream fecham. Toda
 *   microtask pendente (Supabase insert, analytics event) é abortada
 *   silenciosamente. Resultado: writes desaparecem em prod sem erro.
 *
 * Como funciona:
 *   1. Tenta `unstable_after` do next/server (Next 14.2+ com flag
 *      experimental.after). Garante execução pós-response.
 *   2. Se `unstable_after` indisponível, fallback pra .catch() com
 *      log estruturado em safeLog + Sentry.captureException.
 *
 * Uso:
 *   import { fireAndForget } from '@/lib/fire-and-forget'
 *   fireAndForget(recordAgentMemory(...), 'recordAgentMemory:chat')
 *   fireAndForget(events.agentUsed(...), 'events.agentUsed:risco')
 *
 * Audit Wave R2 fix (2026-05-03): substitui 48 sites de
 * `.catch(() => {})` que silenciavam erros + perdiam writes em prod.
 * ═══════════════════════════════════════════════════════════════════ */

import * as Sentry from '@sentry/nextjs'
import { safeLog } from './safe-log'

/**
 * Tenta carregar `unstable_after` de next/server. Se a flag
 * experimental.after não estiver habilitada ou versão não suportar,
 * retorna null e caímos no fallback .catch.
 */
type AfterFn = (callback: () => unknown | Promise<unknown>) => void
let cachedAfter: AfterFn | null | undefined

function resolveAfter(): AfterFn | null {
  if (cachedAfter !== undefined) return cachedAfter
  try {
    // Dynamic require pra não quebrar build se symbol não existir.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nextServer = require('next/server') as Record<string, unknown>
    const candidate = nextServer.unstable_after ?? nextServer.after
    if (typeof candidate === 'function') {
      cachedAfter = candidate as AfterFn
      return cachedAfter
    }
  } catch {
    // ignore — fallback abaixo
  }
  cachedAfter = null
  return null
}

/**
 * Executa promise sem bloquear a response. Em ambientes onde
 * `unstable_after` está disponível, garante execução pós-flush. Senão,
 * encadeia .catch com logging robusto pra evitar unhandled rejection.
 */
export function fireAndForget(promise: Promise<unknown>, label = 'fire_and_forget'): void {
  const after = resolveAfter()

  const handle = async () => {
    try {
      await promise
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      safeLog.error(`[fire-and-forget:${label}]`, message)
      try {
        Sentry.captureException(err, {
          tags: { source: 'fire_and_forget', label },
        })
      } catch {
        // Sentry init falhou — ja logamos via safeLog acima
      }
    }
  }

  if (after) {
    try {
      after(handle)
      return
    } catch {
      // after fora de request scope — fallback abaixo
    }
  }

  // Fallback: encadeia direto. Sem `after` a microtask pode morrer no
  // Vercel quando lambda freeza, mas pelo menos não fica unhandled.
  void handle()
}

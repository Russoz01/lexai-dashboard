'use client'

/* ════════════════════════════════════════════════════════════════════
 * useAgentRequest · v1.0 (2026-05-03 · audit business P1-1)
 * ────────────────────────────────────────────────────────────────────
 * Hook React pra fetch de rotas de agente com handling automatico de 429.
 *
 * Quando rota retorna { error, quota: { used, limit, plan, warning } } com
 * status 429, hook expoe `quotaState` que componente usa pra renderizar
 * <QuotaExceededState>. Demais erros caem em `error` normal.
 *
 * Uso:
 *   const { run, loading, data, error, quotaState, dismissQuota } =
 *     useAgentRequest<ResumoOutput>('/api/resumir')
 *
 *   {quotaState && <QuotaExceededState {...quotaState} onClose={dismissQuota} />}
 * ═══════════════════════════════════════════════════════════════════ */

import { useCallback, useState } from 'react'
import type { QuotaWarning } from '@/components/QuotaExceededState'

export interface QuotaState {
  used: number
  limit: number
  plan: string
  warning: QuotaWarning
}

export interface UseAgentRequestReturn<TData> {
  run: (body: unknown, init?: RequestInit) => Promise<TData | null>
  loading: boolean
  data: TData | null
  error: string | null
  quotaState: QuotaState | null
  dismissQuota: () => void
  reset: () => void
}

interface QuotaError {
  error?: string
  quota?: {
    used?: number
    limit?: number
    plan?: string
    warning?: string
  }
}

function parseQuotaState(payload: unknown): QuotaState | null {
  if (!payload || typeof payload !== 'object') return null
  const q = (payload as QuotaError).quota
  if (!q || typeof q !== 'object') return null
  const used = typeof q.used === 'number' ? q.used : null
  const limit = typeof q.limit === 'number' ? q.limit : null
  const plan = typeof q.plan === 'string' ? q.plan : null
  if (used === null || limit === null || plan === null) return null
  const warningRaw = typeof q.warning === 'string' ? q.warning : 'exceeded'
  const warning: QuotaWarning =
    warningRaw === 'soft' || warningRaw === 'urgent' || warningRaw === 'exceeded'
      ? warningRaw
      : 'exceeded'
  return { used, limit, plan, warning }
}

export function useAgentRequest<TData = unknown>(endpoint: string): UseAgentRequestReturn<TData> {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<TData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [quotaState, setQuotaState] = useState<QuotaState | null>(null)

  const dismissQuota = useCallback(() => {
    setQuotaState((prev) => (prev?.warning === 'exceeded' ? prev : null))
  }, [])

  const reset = useCallback(() => {
    setLoading(false)
    setData(null)
    setError(null)
    setQuotaState(null)
  }, [])

  const run = useCallback(
    async (body: unknown, init?: RequestInit): Promise<TData | null> => {
      setLoading(true)
      setError(null)
      setQuotaState(null)
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
          body: JSON.stringify(body ?? {}),
          ...init,
        })
        const payload = await res.json().catch(() => ({}))
        if (!res.ok) {
          if (res.status === 429) {
            const qs = parseQuotaState(payload)
            if (qs) {
              setQuotaState(qs)
              setLoading(false)
              return null
            }
          }
          const msg =
            (payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string')
              ? payload.error
              : `Erro ${res.status}`
          setError(msg)
          setLoading(false)
          return null
        }
        // Soft warning — backend pode incluir quota mesmo em sucesso (>=75% usado).
        // Audit business P1-1: aviso pre-emptivo evita interrupcao surpresa.
        const qs = parseQuotaState(payload)
        if (qs && qs.warning) setQuotaState(qs)
        setData(payload as TData)
        setLoading(false)
        return payload as TData
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erro de conexao'
        setError(msg)
        setLoading(false)
        return null
      }
    },
    [endpoint],
  )

  return { run, loading, data, error, quotaState, dismissQuota, reset }
}

export default useAgentRequest

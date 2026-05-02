'use client'

import { useState, useCallback } from 'react'

/* ════════════════════════════════════════════════════════════════════
 * useAgentStream · v1.0 (2026-05-02)
 * ────────────────────────────────────────────────────────────────────
 * Hook React pra consumir streams NDJSON de rotas de agente IA.
 *
 * Uso:
 *   const { run, streaming, chars, error } = useAgentStream<Resumo>({
 *     endpoint: '/api/resumir',
 *     onResult: (resumo) => setResumo(resumo),
 *   })
 *   await run({ texto: 'contrato...' })
 *
 * Estado exposto:
 *   - streaming: boolean — true enquanto stream está aberto
 *   - chars: number — caracteres recebidos até agora (progresso visual)
 *   - error: string | null
 *
 * Frontend pode mostrar "Recebendo... X chars" durante streaming, e
 * substituir pelo resultado quando onResult dispara.
 *
 * NDJSON eventos esperados (do backend createAgentStream):
 *   {type:"text",delta:"...",chars:N}
 *   {type:"done",result:{...}}
 *   {type:"error",error:"..."}
 * ═══════════════════════════════════════════════════════════════════ */

export interface UseAgentStreamOptions<T> {
  endpoint: string
  /** Chamado quando stream emite {type:"done", result} */
  onResult: (result: T) => void
  /** Chamado em erro de stream OU HTTP */
  onError?: (error: string) => void
  /** Headers customizados (ex: Authorization) */
  headers?: Record<string, string>
}

export interface UseAgentStreamReturn<TPayload> {
  run: (payload: TPayload) => Promise<void>
  streaming: boolean
  /** Total de caracteres recebidos no stream — útil pra progresso visual */
  chars: number
  error: string | null
  /** Reset manual do estado (útil ao limpar form) */
  reset: () => void
}

export function useAgentStream<TResult = unknown, TPayload = unknown>(
  opts: UseAgentStreamOptions<TResult>,
): UseAgentStreamReturn<TPayload> {
  const [streaming, setStreaming] = useState(false)
  const [chars, setChars] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setStreaming(false)
    setChars(0)
    setError(null)
  }, [])

  const run = useCallback(async (payload: TPayload) => {
    setError(null)
    setChars(0)
    setStreaming(true)

    try {
      const sep = opts.endpoint.includes('?') ? '&' : '?'
      const res = await fetch(`${opts.endpoint}${sep}stream=1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        const msg = data?.error || `Erro ${res.status}`
        setError(msg)
        opts.onError?.(msg)
        return
      }

      const reader = res.body?.getReader()
      if (!reader) {
        // Browser sem ReadableStream — fallback: assume JSON normal
        const data = await res.json()
        opts.onResult(data as TResult)
        return
      }

      const decoder = new TextDecoder()
      let buffer = ''
      let done = false

      while (!done) {
        const { value, done: streamDone } = await reader.read()
        done = streamDone
        if (value) {
          buffer += decoder.decode(value, { stream: !done })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''
          for (const line of lines) {
            if (!line.trim()) continue
            try {
              const event = JSON.parse(line)
              if (event.type === 'text' && typeof event.chars === 'number') {
                setChars(event.chars)
              } else if (event.type === 'done' && event.result !== undefined) {
                opts.onResult(event.result as TResult)
              } else if (event.type === 'error') {
                const msg = event.error || 'Erro ao processar'
                setError(msg)
                opts.onError?.(msg)
              }
            } catch {
              // Linha inválida — ignora
            }
          }
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro de rede'
      setError(msg)
      opts.onError?.(msg)
    } finally {
      setStreaming(false)
    }
  }, [opts])

  return { run, streaming, chars, error, reset }
}

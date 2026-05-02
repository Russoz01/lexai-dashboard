'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

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

  // Wave C5 fix: opts em ref pra evitar re-render infinito quando parent
  // não memoiza opts. Sem isso, cada render do parent cria opts novo →
  // useCallback gera novo run → effects que dependem de run loopam.
  const optsRef = useRef(opts)
  optsRef.current = opts

  // Wave C5 fix: AbortController por chamada — clicks duplos abortam
  // stream anterior antes de iniciar novo. Cleanup em unmount também.
  const abortRef = useRef<AbortController | null>(null)
  const mountedRef = useRef(true)
  useEffect(() => {
    return () => {
      mountedRef.current = false
      abortRef.current?.abort()
    }
  }, [])

  const reset = useCallback(() => {
    setStreaming(false)
    setChars(0)
    setError(null)
  }, [])

  const run = useCallback(async (payload: TPayload) => {
    // Aborta stream anterior se houver
    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac

    if (!mountedRef.current) return
    setError(null)
    setChars(0)
    setStreaming(true)

    const setIfMounted = <S,>(setter: (value: S) => void, value: S) => {
      if (mountedRef.current && !ac.signal.aborted) setter(value)
    }

    try {
      const { endpoint, headers, onResult, onError } = optsRef.current
      const sep = endpoint.includes('?') ? '&' : '?'
      const res = await fetch(`${endpoint}${sep}stream=1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(headers || {}) },
        body: JSON.stringify(payload),
        signal: ac.signal,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        const msg = data?.error || `Erro ${res.status}`
        setIfMounted(setError, msg)
        onError?.(msg)
        return
      }

      const reader = res.body?.getReader()
      if (!reader) {
        // Browser sem ReadableStream — fallback: assume JSON normal
        const data = await res.json()
        if (mountedRef.current && !ac.signal.aborted) onResult(data as TResult)
        return
      }

      const decoder = new TextDecoder()
      let buffer = ''
      let done = false

      try {
        while (!done && !ac.signal.aborted) {
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
                  setIfMounted(setChars, event.chars)
                } else if (event.type === 'done' && event.result !== undefined) {
                  if (mountedRef.current && !ac.signal.aborted) onResult(event.result as TResult)
                } else if (event.type === 'error') {
                  const msg = event.error || 'Erro ao processar'
                  setIfMounted(setError, msg)
                  onError?.(msg)
                }
              } catch {
                // Linha inválida — ignora
              }
            }
          }
        }
      } finally {
        // Libera reader pra evitar leak de stream HTTP
        try { reader.releaseLock() } catch { /* já released */ }
      }
    } catch (e) {
      // Ignora AbortError (esperado em unmount/cancel)
      if (e instanceof Error && e.name === 'AbortError') return
      const msg = e instanceof Error ? e.message : 'Erro de rede'
      setIfMounted(setError, msg)
      optsRef.current.onError?.(msg)
    } finally {
      setIfMounted(setStreaming, false)
    }
  }, []) // Wave C5 fix: deps vazias — tudo via refs

  return { run, streaming, chars, error, reset }
}

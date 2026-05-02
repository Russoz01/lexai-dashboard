import Anthropic from '@anthropic-ai/sdk'
import { parseAgentJSON } from '@/lib/api-utils'
import { isDemoFallbackEnabled, isRetryableError } from '@/lib/demo-fallback'

/* ════════════════════════════════════════════════════════════════════
 * agent-stream · v1.0 (2026-05-02)
 * ────────────────────────────────────────────────────────────────────
 * Helper backend para streaming de agentes. Cada agente que retorna
 * JSON estruturado pode usar esta função pra emitir chunks de texto
 * em tempo real via NDJSON ReadableStream.
 *
 * Eventos emitidos:
 *   {type:"text",delta:"...",chars:N}  — chunk progressivo + total acumulado
 *   {type:"done",result:{...}}         — JSON parseado final
 *   {type:"error",error:"..."}         — erro
 *
 * Frontend consome via fetch + ReadableStream + TextDecoder, mostra
 * contador de chars/tokens como progresso visual e renderiza resultado
 * final quando done chega.
 *
 * Uso (server route):
 *   if (req.nextUrl.searchParams.get('stream') === '1') {
 *     return createAgentStream({
 *       client, params, fallback, agente: 'resumidor', onPersist,
 *     })
 *   }
 * ═══════════════════════════════════════════════════════════════════ */

export interface AgentStreamOptions<T> {
  /** Anthropic client já instanciado */
  client: Anthropic
  /** Parâmetros do messages.create (sem stream — internamente usa stream()) */
  params: Anthropic.Messages.MessageCreateParams
  /** Fallback caso parse JSON falhe — mantém comportamento legacy */
  fallback: T
  /** Nome do agente — pra logs */
  agente: string
  /** Callback opcional pós-stream pra persistir no Supabase, eventos, etc */
  onPersist?: (parsed: T, fullText: string) => Promise<void> | void
  /** Wrapper opcional do payload final (ex: { peca: parsed } em vez de parsed direto) */
  wrapResult?: (parsed: T) => unknown
  /** Resposta cached pra emitir se Anthropic falhar com erro retryable + DEMO_FALLBACK_ENABLED=1 */
  demoFallback?: T
}

export function createAgentStream<T>(opts: AgentStreamOptions<T>): Response {
  const { client, params, fallback, agente, onPersist, wrapResult, demoFallback } = opts

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) => {
        controller.enqueue(encoder.encode(JSON.stringify(obj) + '\n'))
      }

      let fullText = ''

      try {
        const anthStream = client.messages.stream(params)

        anthStream.on('text', (chunk: string) => {
          fullText += chunk
          send({ type: 'text', delta: chunk, chars: fullText.length })
        })

        await anthStream.finalMessage()

        const parsed = parseAgentJSON<T>(fullText, fallback)
        const finalPayload = wrapResult ? wrapResult(parsed) : parsed

        send({ type: 'done', result: finalPayload, chars: fullText.length })

        // Persist fora do stream — não bloqueia fechamento
        if (onPersist) {
          Promise.resolve(onPersist(parsed, fullText)).catch((e: unknown) => {
            // eslint-disable-next-line no-console
            console.error(`[agent-stream:${agente}] onPersist failed:`, e instanceof Error ? e.message : String(e))
          })
        }
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Erro de stream'
        // eslint-disable-next-line no-console
        console.error(`[agent-stream:${agente}]`, message)

        // Wave C5 fix: emite cached response como done event se demo fallback
        // ativo + erro retryable. Frontend renderiza como sucesso transparente.
        if (demoFallback && isDemoFallbackEnabled() && isRetryableError(e)) {
          // eslint-disable-next-line no-console
          console.warn(`[agent-stream:${agente}] using demo fallback (reason: ${message.slice(0, 80)})`)
          const finalPayload = wrapResult ? wrapResult(demoFallback) : demoFallback
          send({ type: 'done', result: finalPayload, chars: 0 })
        } else {
          send({ type: 'error', error: 'Erro ao processar sua solicitacao. Tente novamente.' })
        }
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  })
}

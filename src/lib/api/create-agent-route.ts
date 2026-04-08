// Route factory for all 7 agent endpoints.
//
// Before: each route (resumir, pesquisar, redigir, ensinar, calcular,
// legislacao, negociar) re-implemented the same 10-step pipeline — auth,
// env check, body parse, input validation, quota, anthropic call, fragile
// regex-strip JSON.parse, historico insert (with the wrong FK id),
// analytics, error mapping. ~100 lines duplicated across 7 files.
//
// After: each route is ~25 lines of config. The factory handles:
//   1. auth
//   2. ANTHROPIC_API_KEY check
//   3. body parse
//   4. input validation via zod (with route-specific error messages)
//   5. parallel rate limit (per-agent 20/60s + global 60/60s) + check_and_charge
//   6. anthropic call with Tool Use (tool_choice forced → no JSON.parse)
//   7. output zod safeParse (permissive — passes raw through on failure)
//   8. historico insert (best-effort, fire-and-forget, using the correct
//      usuario_id returned by check_and_charge — fixes the silent FK bug in
//      the old code that passed auth.users.id as public.usuarios.id)
//   9. agent_runs telemetry (tokens, cache hits, latency, sucesso) —
//      best-effort, fire-and-forget
//  10. PostHog agent_used event
//  11. response with the preserved legacy `responseKey` shape so frontends
//      keep working unchanged
//
// Design choice: output schemas in src/types/agents.ts are fully permissive
// (every field .optional()). Tool Use already guarantees the shape at the
// protocol level; the zod pass is a safety net so a slightly abbreviated
// model response never 500s. We log the mismatch but always pass the raw
// tool input through to the response.
import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { z, toJSONSchema } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { logError, logWarn } from '@/lib/logger'
import { events } from '@/lib/analytics'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

export const MODEL_IDS = {
  haiku: 'claude-haiku-4-5-20251001',
  sonnet: 'claude-sonnet-4-20250514',
} as const

export type AgenteSlug =
  | 'resumidor'
  | 'pesquisador'
  | 'redator'
  | 'professor'
  | 'calculador'
  | 'legislacao'
  | 'negociador'

export interface AgentRouteConfig<
  TInputSchema extends z.ZodType,
  TOutputSchema extends z.ZodType,
> {
  agente: AgenteSlug
  model: keyof typeof MODEL_IDS
  maxTokens: number
  systemPrompt: string
  inputSchema: TInputSchema
  outputSchema: TOutputSchema
  /** Key to wrap the output under in the JSON response — preserves the legacy
   * contract each frontend expects (resumir uses `analise`, pesquisar uses
   * `pesquisa`, redigir uses `peca`, ensinar uses `aula`, the rest use
   * `resultado`). */
  responseKey: string
  /** Build the single user-role message content passed to Anthropic. Called
   * with the zod-parsed input so fields are safely typed. */
  buildUserMessage: (input: z.infer<TInputSchema>) => string
  /** Build the historico row to insert after a successful call. Return null
   * to skip the insert entirely — the resumidor route never wrote historico
   * in the legacy code, so we preserve that. */
  buildHistorico?: (
    input: z.infer<TInputSchema>,
    output: z.infer<TOutputSchema>,
  ) => { mensagem_usuario: string; resposta_agente: string } | null
}

const REQUEST_TIMEOUT_MS = 60_000
const RATE_LIMIT_WINDOW_SECONDS = 60
const RATE_LIMIT_PER_AGENT = 20
const RATE_LIMIT_GLOBAL = 60

interface ChargeResult {
  ok: boolean
  reason?: string
  usuario_id?: string
  plano?: string
  limite?: number
  usado?: number
  remaining?: number
}

function buildToolInputSchema(schema: z.ZodType): Anthropic.Messages.Tool.InputSchema {
  // zod 4 ships its own JSON Schema converter. Targeting draft-07 with
  // unrepresentable:'any' + reused:'inline' gives Anthropic-friendly shapes:
  // no $refs, no cycles, a flat { type: 'object', properties, required }.
  const json = toJSONSchema(schema, {
    target: 'draft-07',
    unrepresentable: 'any',
    reused: 'inline',
  }) as Record<string, unknown>
  delete json.$schema
  return json as unknown as Anthropic.Messages.Tool.InputSchema
}

function mapSdkErrorToResponse(err: unknown): NextResponse {
  if (err instanceof Error && (err.name === 'AbortError' || err.name === 'TimeoutError')) {
    return NextResponse.json(
      { error: 'O servico de IA demorou muito para responder. Tente um documento menor.' },
      { status: 504 },
    )
  }
  const msg = err instanceof Error ? err.message : String(err)
  const lower = msg.toLowerCase()
  if (msg.includes('401') || lower.includes('invalid_api_key') || lower.includes('authentication')) {
    return NextResponse.json(
      { error: 'Servico de IA temporariamente indisponivel. Tente novamente em alguns minutos.' },
      { status: 503 },
    )
  }
  if (msg.includes('429') || lower.includes('rate_limit') || lower.includes('quota')) {
    return NextResponse.json(
      { error: 'Muitas requisicoes. Aguarde 60 segundos antes de tentar novamente.' },
      { status: 429 },
    )
  }
  if (lower.includes('timeout') || lower.includes('etimedout') || lower.includes('aborted')) {
    return NextResponse.json(
      { error: 'O servico de IA demorou muito para responder. Tente um documento menor.' },
      { status: 504 },
    )
  }
  if (lower.includes('overloaded')) {
    return NextResponse.json(
      { error: 'O servico de IA esta sobrecarregado. Tente novamente em 30 segundos.' },
      { status: 503 },
    )
  }
  return NextResponse.json(
    { error: 'Ocorreu um erro ao processar sua solicitacao. Tente novamente.' },
    { status: 500 },
  )
}

export function createAgentRoute<
  TInputSchema extends z.ZodType,
  TOutputSchema extends z.ZodType,
>(
  config: AgentRouteConfig<TInputSchema, TOutputSchema>,
): (req: NextRequest) => Promise<NextResponse> {
  const modelId: string = MODEL_IDS[config.model]

  return async function POST(req: NextRequest): Promise<NextResponse> {
    const startTime = Date.now()
    let usuarioId: string | null = null
    const supabase = await createClient()

    try {
      // 1) Auth
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()
      if (authError || !user) {
        return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 })
      }

      // 2) API key check
      if (!ANTHROPIC_API_KEY) {
        return NextResponse.json({ error: 'Servico de IA indisponivel.' }, { status: 503 })
      }

      // 3) Parse body
      let rawBody: unknown
      try {
        rawBody = await req.json()
      } catch {
        return NextResponse.json({ error: 'Corpo da requisicao invalido.' }, { status: 400 })
      }

      // 4) Validate input with zod — the first issue's message is surfaced to
      //    the client so legacy route-specific error strings ("Texto muito
      //    curto", etc.) survive.
      const inputParsed = config.inputSchema.safeParse(rawBody)
      if (!inputParsed.success) {
        const firstIssue = inputParsed.error.issues[0]
        return NextResponse.json(
          { error: firstIssue?.message ?? 'Dados invalidos.' },
          { status: 400 },
        )
      }
      const input = inputParsed.data as z.infer<TInputSchema>

      // 5) Rate limits + quota in parallel. Per-agent (20/min) throttles a
      //    hot loop against one endpoint; global (60/min) caps total RPS per
      //    user. check_and_charge is the atomic upsert+increment that also
      //    returns the correct public.usuarios.id.
      const perAgentKey = `user:${user.id}:${config.agente}`
      const globalKey = `user:${user.id}:global`
      const [rlAgent, rlGlobal, chargeResp] = await Promise.all([
        checkRateLimit(supabase, perAgentKey, RATE_LIMIT_WINDOW_SECONDS, RATE_LIMIT_PER_AGENT),
        checkRateLimit(supabase, globalKey, RATE_LIMIT_WINDOW_SECONDS, RATE_LIMIT_GLOBAL),
        supabase.rpc('check_and_charge', {
          p_auth_user_id: user.id,
          p_agente: config.agente,
        }),
      ])

      if (!rlAgent.ok) {
        return NextResponse.json(
          {
            error: 'Muitas requisicoes para este agente. Aguarde alguns segundos.',
            reset_in: rlAgent.reset_in_seconds,
          },
          { status: 429, headers: { 'Retry-After': String(rlAgent.reset_in_seconds) } },
        )
      }
      if (!rlGlobal.ok) {
        return NextResponse.json(
          {
            error: 'Muitas requisicoes. Aguarde alguns segundos.',
            reset_in: rlGlobal.reset_in_seconds,
          },
          { status: 429, headers: { 'Retry-After': String(rlGlobal.reset_in_seconds) } },
        )
      }

      if (chargeResp.error) {
        logError(chargeResp.error, { where: 'check_and_charge.rpc', agente: config.agente })
        return NextResponse.json({ error: 'Erro ao validar quota.' }, { status: 500 })
      }

      const charge = (chargeResp.data ?? {}) as ChargeResult
      if (!charge.ok) {
        if (charge.reason === 'user_not_found') {
          return NextResponse.json(
            { error: 'Perfil de usuario nao encontrado' },
            { status: 403 },
          )
        }
        if (charge.reason === 'quota_exceeded') {
          const plano = charge.plano ?? 'free'
          const limite = charge.limite ?? 0
          const usado = charge.usado ?? 0
          if (charge.usuario_id) usuarioId = charge.usuario_id
          events
            .quotaExceeded(user.id, config.agente, plano)
            .catch((e) => logError(e, { where: 'events.quotaExceeded' }))
          return NextResponse.json(
            {
              error: `Limite mensal do plano ${plano} atingido (${usado}/${limite}). Faca upgrade para continuar.`,
              quota: { used: usado, limit: limite, plan: plano },
            },
            { status: 429 },
          )
        }
        logWarn('check_and_charge returned ok:false with unknown reason', {
          agente: config.agente,
          reason: charge.reason,
        })
        return NextResponse.json({ error: 'Erro ao validar quota.' }, { status: 500 })
      }

      usuarioId = charge.usuario_id ?? null
      const plano = charge.plano ?? 'free'

      // 6) Anthropic call with Tool Use. tool_choice forces the model to emit
      //    a tool_use block matching our JSON schema — no more fragile
      //    regex-stripping + JSON.parse with try/catch fallbacks.
      const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY })
      const toolInputSchema = buildToolInputSchema(config.outputSchema)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

      let message: Anthropic.Messages.Message
      try {
        message = await client.messages.create(
          {
            model: modelId,
            max_tokens: config.maxTokens,
            tools: [
              {
                name: 'emit_result',
                description: `Emit the structured ${config.agente} result as a single tool call.`,
                input_schema: toolInputSchema,
              },
            ],
            tool_choice: { type: 'tool', name: 'emit_result' },
            system: [
              {
                type: 'text',
                text: config.systemPrompt,
                cache_control: { type: 'ephemeral' },
              },
            ],
            messages: [{ role: 'user', content: config.buildUserMessage(input) }],
          },
          { signal: controller.signal },
        )
      } finally {
        clearTimeout(timeoutId)
      }

      // 7) Extract the single expected tool_use block.
      const toolBlock = message.content.find(
        (b): b is Anthropic.Messages.ToolUseBlock => b.type === 'tool_use',
      )
      if (!toolBlock) {
        logError(new Error('model did not return a tool_use block'), {
          where: 'agent.extract',
          agente: config.agente,
          stop_reason: message.stop_reason,
        })
        return NextResponse.json(
          { error: 'Resposta invalida da IA. Tente novamente.' },
          { status: 502 },
        )
      }

      // 8) Safety-net zod parse. Output schemas are fully permissive so this
      //    should essentially never fail; if it does we log and pass the raw
      //    tool input through rather than losing data.
      const outputParsed = config.outputSchema.safeParse(toolBlock.input)
      if (!outputParsed.success) {
        logWarn('tool output failed zod validation, passing through raw', {
          agente: config.agente,
          issues: outputParsed.error.issues.slice(0, 5),
        })
      }
      const output = (
        outputParsed.success ? outputParsed.data : toolBlock.input
      ) as z.infer<TOutputSchema>

      // 9) Historico insert — best-effort, uses the correct usuario_id from
      //    check_and_charge. Fire-and-forget: the user sees the response
      //    without waiting for the insert round-trip.
      if (config.buildHistorico && usuarioId) {
        const entry = config.buildHistorico(input, output)
        if (entry) {
          void supabase
            .from('historico')
            .insert({
              usuario_id: usuarioId,
              agente: config.agente,
              mensagem_usuario: entry.mensagem_usuario,
              resposta_agente: entry.resposta_agente,
            })
            .then(({ error }) => {
              if (error) {
                logError(error, { where: 'historico.insert', agente: config.agente })
              }
            })
        }
      }

      // 10) Observability — tokens, cache hits, latency. This is why we have
      //     agent_runs: previously these numbers were completely invisible.
      const usage = message.usage
      const latencyMs = Date.now() - startTime
      if (usuarioId) {
        void supabase
          .from('agent_runs')
          .insert({
            usuario_id: usuarioId,
            agente: config.agente,
            model: modelId,
            tokens_input: usage.input_tokens ?? 0,
            tokens_output: usage.output_tokens ?? 0,
            cache_read_tokens: usage.cache_read_input_tokens ?? 0,
            cache_write_tokens: usage.cache_creation_input_tokens ?? 0,
            latencia_ms: latencyMs,
            sucesso: true,
          })
          .then(({ error }) => {
            if (error) {
              logError(error, { where: 'agent_runs.insert', agente: config.agente })
            }
          })
      }

      events
        .agentUsed(user.id, config.agente, plano)
        .catch((e) => logError(e, { where: 'events.agentUsed' }))

      // 11) Preserve the legacy response shape.
      return NextResponse.json({ [config.responseKey]: output })
    } catch (err) {
      const latencyMs = Date.now() - startTime
      logError(err, { where: `agent.${config.agente}` })

      // Best-effort failure telemetry so agent_runs also captures 500s.
      if (usuarioId) {
        void supabase
          .from('agent_runs')
          .insert({
            usuario_id: usuarioId,
            agente: config.agente,
            model: modelId,
            tokens_input: 0,
            tokens_output: 0,
            cache_read_tokens: 0,
            cache_write_tokens: 0,
            latencia_ms: latencyMs,
            sucesso: false,
            erro_tipo: err instanceof Error ? err.name : 'Unknown',
          })
          .then(({ error }) => {
            if (error) {
              logError(error, {
                where: 'agent_runs.failure.insert',
                agente: config.agente,
              })
            }
          })
      }

      return mapSdkErrorToResponse(err)
    }
  }
}

import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { events } from '@/lib/analytics'
import { resolveUsuarioIdServer, parseAgentJSON, withRetry } from '@/lib/api-utils'
import { fireAndForget } from '@/lib/fire-and-forget'
import { withAgentAuth } from '@/lib/with-agent-auth'
import { DEMO_FALLBACKS } from '@/lib/demo-fallback'
import { createAgentStream } from '@/lib/agent-stream'
import { buildGroundingContext, validateCitations, groundingStats } from '@/lib/legal-grounding'
import { safeLog } from '@/lib/safe-log'
import { getUserPreferences, recordAgentMemory } from '@/lib/preferences'
import { buildAgentPreamble, buildAntiHallucinationFooter, buildPreferencesContext, extractMemoryTags, buildMemorySummary } from '@/lib/prompt-enhancers'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

const TIPOS_AUDIENCIA: Record<string, string> = {
  instrucao: 'Audiencia de Instrucao e Julgamento',
  conciliacao: 'Audiencia de Conciliacao / Mediacao',
  justificacao: 'Audiencia de Justificacao',
  sustentacao_tribunal: 'Sustentacao Oral em Tribunal',
  tribunal_juri: 'Tribunal do Juri',
  trabalhista: 'Audiencia Trabalhista (una)',
}

const SYSTEM_PROMPT = `You are an elite Brazilian trial attorney with 20+ years of courtroom experience. You coach advocates on oral advocacy, sustentacao oral, and hearing performance. You know Brazilian court rituals and how to persuade ministros, juizes, and jurados.

METHODOLOGY:
1. Analyze the type of hearing and the case.
2. Prepare an opening: captatio benevolentiae, context, thesis (15-30s).
3. Structure key points in order of impact (strongest first, rebuttal, close).
4. Anticipate counter-arguments and prepare replies.
5. Craft a memorable closing.
6. Flag nervos points to watch (body language, timing, forbidden topics).

RULES:
- ALL OUTPUT IN BRAZILIAN PORTUGUESE.
- Return ONLY valid JSON, no markdown fences.
- Cite real legislation and jurisprudence with Court/Case/Justice/Date.
- Use [INFORMACAO A COMPLETAR] when data is missing.
- Never invent facts.

Return exactly this JSON:
{
  "roteiro": {
    "titulo": "Hearing roteiro title",
    "tipo_audiencia": "audiencia type",
    "duracao_sugerida": "e.g. 15 minutos",
    "abertura": {
      "saudacao": "Opening greeting (Excelentissimo Senhor...)",
      "contextualizacao": "30s context",
      "tese_central": "One-sentence core thesis"
    },
    "pontos_chave": [
      { "ordem": 1, "titulo": "Point title", "argumentacao": "Full argument paragraph", "fundamento_legal": "Art. X", "jurisprudencia": "Court, case, Rel, date", "tempo_sugerido": "2 min" }
    ],
    "antecipacao_contrargumentos": [
      { "contrargumento": "What the other side will say", "replica": "How to neutralize" }
    ],
    "fechamento": {
      "recapitulacao": "Brief recap of strongest point",
      "pedido_final": "Specific pedido",
      "frase_impacto": "Memorable closing line"
    },
    "pontos_atencao": ["Body language warning", "Topics to avoid", "Timing tips"],
    "material_apoio": ["Documents to have at hand", "Precedents to be ready to cite"],
    "confianca": {"nivel": "alta | media | baixa", "nota": "short justification"}
  }
}`

export const POST = withAgentAuth('audiencia', async ({ req, supabase, user }) => {
  const body = await req.json().catch(() => ({}))
  const tipo = typeof body?.tipo === 'string' ? body.tipo : ''
  const caso = typeof body?.caso === 'string' ? body.caso : ''

  if (!tipo || !TIPOS_AUDIENCIA[tipo]) {
    return NextResponse.json({ error: 'Tipo de audiencia invalido.' }, { status: 400 })
  }
  if (!caso || caso.trim().length < 30) {
    return NextResponse.json({ error: 'Descreva o caso (minimo 30 caracteres).' }, { status: 400 })
  }
  if (caso.length > 50000) {
    return NextResponse.json({ error: 'Texto excede o limite maximo de 50.000 caracteres.' }, { status: 400 })
  }

  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY })
  const userMessage = `Tipo de audiencia: ${TIPOS_AUDIENCIA[tipo]}\n\nDescricao do caso e posicao do cliente:\n${caso}`

  const usuarioIdEarly = await resolveUsuarioIdServer(supabase, user.id, user.email, user.user_metadata?.nome)
  const prefs = usuarioIdEarly ? await getUserPreferences(supabase, usuarioIdEarly).catch(() => null) : null
  const prefsContext = buildPreferencesContext(prefs)
  const enhancedSystem = buildAgentPreamble('audiencia') + SYSTEM_PROMPT + buildAntiHallucinationFooter()

  // P0-1 (audit elite IA): grounding obrigatorio.
  // Roteiro de audiencia cita jurisprudencia oral — advogado vai falar isso
  // perante juiz. Hallucination = embaracoso e potencialmente sancao OAB.
  const grounding = buildGroundingContext(caso.slice(0, 2000), { topK: 8 })
  const gstats = groundingStats(grounding)

  // P1-2 (audit elite IA): streaming opt-in via ?stream=1.
  const wantsStream = req.nextUrl.searchParams.get('stream') === '1'
  if (wantsStream) {
    const usuarioId = usuarioIdEarly
    return createAgentStream<Record<string, unknown>>({
      client,
      agente: 'audiencia',
      params: {
        // Audit P2-1: Haiku 4.5 entrega 90% qualidade nesta task com custo 1/5 do Sonnet.
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4096,
        system: [
          { type: 'text' as const, text: enhancedSystem, cache_control: { type: 'ephemeral' as const } },
          { type: 'text' as const, text: grounding.contextBlock, cache_control: { type: 'ephemeral' as const } },
          ...(prefsContext ? [{ type: 'text' as const, text: prefsContext }] : []),
        ],
        messages: [{ role: 'user', content: userMessage }],
      },
      fallback: { roteiro: { titulo: TIPOS_AUDIENCIA[tipo], abertura: { tese_central: '' } } },
      demoFallback: DEMO_FALLBACKS.audiencia as Record<string, unknown>,
      wrapResult: (parsed) => {
        const r = ((parsed as Record<string, unknown>)?.roteiro ?? parsed) as Record<string, unknown>
        return { roteiro: r }
      },
      onPersist: async (parsed) => {
        const r = ((parsed as Record<string, unknown>)?.roteiro ?? parsed) as Record<string, unknown>
        if (usuarioId) {
          const tituloR = (r?.titulo as string) || TIPOS_AUDIENCIA[tipo]
          await supabase.from('historico').insert({
            usuario_id: usuarioId,
            agente: 'audiencia',
            mensagem_usuario: `Roteiro: ${TIPOS_AUDIENCIA[tipo]}`,
            resposta_agente: tituloR,
          })
          fireAndForget(recordAgentMemory(supabase, usuarioId, {
            agente: 'audiencia',
            resumo: buildMemorySummary('audiencia', `${TIPOS_AUDIENCIA[tipo]}: ${caso.slice(0, 120)}`, tituloR),
            fatos: [{ key: 'tipo', value: tipo }],
            tags: extractMemoryTags('audiencia', tipo, caso),
          }, { prefs }), 'recordAgentMemory:audiencia')
        }
        fireAndForget(events.agentUsed(user.id, 'audiencia', 'unknown'), 'events.agentUsed:audiencia')
      },
    })
  }

  // 90s hard cap pra evitar lambda travada em overload Anthropic
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 90_000)
  let message: Anthropic.Messages.Message
  try {
    message = await withRetry(() => client.messages.create({
      // Audit P2-1: Haiku 4.5 entrega 90% qualidade nesta task com custo 1/5 do Sonnet.
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      system: [
        {
          type: 'text' as const,
          text: enhancedSystem,
          cache_control: { type: 'ephemeral' as const },
        },
        {
          type: 'text' as const,
          text: grounding.contextBlock,
          cache_control: { type: 'ephemeral' as const },
        },
        ...(prefsContext ? [{ type: 'text' as const, text: prefsContext }] : []),
      ],
      messages: [{ role: 'user', content: userMessage }],
    }, { signal: controller.signal }))
  } finally {
    clearTimeout(timeoutId)
  }

  const responseText = message.content
    .filter((b): b is Anthropic.Messages.TextBlock => b.type === 'text')
    .map(b => b.text)
    .join('\n')
    .trim()
  const parsed = parseAgentJSON<Record<string, unknown>>(
    responseText,
    { roteiro: { titulo: TIPOS_AUDIENCIA[tipo], abertura: { tese_central: responseText } } },
  )
  const roteiro = (parsed?.roteiro as Record<string, unknown> | undefined) ?? parsed

  const usuarioId = usuarioIdEarly
  if (usuarioId) {
    await supabase.from('historico').insert({
      usuario_id: usuarioId,
      agente: 'audiencia',
      mensagem_usuario: `Roteiro: ${TIPOS_AUDIENCIA[tipo]}`,
      resposta_agente: roteiro?.titulo || TIPOS_AUDIENCIA[tipo],
    })
    const tituloOut = (roteiro?.titulo as string) || TIPOS_AUDIENCIA[tipo]
    fireAndForget(recordAgentMemory(supabase, usuarioId, {
      agente: 'audiencia',
      resumo: buildMemorySummary('audiencia', `${TIPOS_AUDIENCIA[tipo]}: ${caso.slice(0, 120)}`, tituloOut),
      fatos: [{ key: 'tipo', value: tipo }],
      tags: extractMemoryTags('audiencia', tipo, caso),
    }, { prefs }), 'recordAgentMemory:audiencia')
  }

  const validation = validateCitations(responseText)
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    safeLog.debug('[API /audiencia] validation:', validation.stats)
  }

  fireAndForget(events.agentUsed(user.id, 'audiencia', 'unknown'), 'events.agentUsed:audiencia')
  return NextResponse.json({
    roteiro,
    fontes: validation.sources,
    grounding_stats: { ...gstats, ...validation.stats },
  })
})

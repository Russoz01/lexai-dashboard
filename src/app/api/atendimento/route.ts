import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { events } from '@/lib/analytics'
import { resolveUsuarioIdServer, parseAgentJSON } from '@/lib/api-utils'
import { withAgentAuth } from '@/lib/with-agent-auth'
import { LEGAL_AREAS_LABEL_MAP, isLegalAreaSlug } from '@/lib/agents/taxonomy'
import { getUserPreferences, recordAgentMemory } from '@/lib/preferences'
import { buildAgentPreamble, buildAntiHallucinationFooter, buildPreferencesContext, extractMemoryTags, buildMemorySummary } from '@/lib/prompt-enhancers'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

// Taxonomia canônica (v10.10): src/lib/agents/taxonomy.ts.
const AREAS = LEGAL_AREAS_LABEL_MAP

const SYSTEM_PROMPT = `You are an elite Brazilian attorney with 20+ years of experience designing initial client interview scripts. You structure entrevistas iniciais that collect all relevant facts, identify legal issues, and protect the attorney-client relationship under the Codigo de Etica da OAB.

METHODOLOGY:
Structure the interview in 4 blocks:
1. ABERTURA: rapport, context, confidentiality, scope of consulta.
2. FATOS: chronological facts, parties, documents, evidence.
3. OBJETIVOS E EXPECTATIVAS: what the client wants, deal-breakers, budget.
4. FECHAMENTO: attorney analysis, next steps, honorarios, prazo para retorno.

For each question: rationale, red flag signals to watch for, follow-ups.

RULES:
- ALL OUTPUT IN BRAZILIAN PORTUGUESE.
- Return ONLY valid JSON, no markdown fences.
- Questions must be open-ended, non-leading.
- Cite applicable legislation briefly (e.g. OAB ethics, LGPD, prazos prescricionais).
- Use [INFORMACAO A COMPLETAR] when data is missing.
- Never invent facts.

Return exactly this JSON:
{
  "roteiro": {
    "titulo": "Entrevista inicial - [area]",
    "area": "area key",
    "perfil_cliente": "Short profile summary",
    "duracao_estimada": "e.g. 45-60 minutos",
    "observacao_etica": "Brief LGPD + OAB ethics note for this case type",
    "bloco_abertura": {
      "objetivo": "Block goal",
      "perguntas": [
        { "pergunta": "Question text", "racional": "Why ask this", "red_flags": ["Signal to watch"], "followups": ["Follow-up question"] }
      ]
    },
    "bloco_fatos": {
      "objetivo": "...",
      "perguntas": [{ "pergunta": "...", "racional": "...", "red_flags": ["..."], "followups": ["..."] }]
    },
    "bloco_objetivos": {
      "objetivo": "...",
      "perguntas": [{ "pergunta": "...", "racional": "...", "red_flags": ["..."], "followups": ["..."] }]
    },
    "bloco_fechamento": {
      "objetivo": "...",
      "perguntas": [{ "pergunta": "...", "racional": "...", "red_flags": ["..."], "followups": ["..."] }]
    },
    "documentos_pedir": ["Documents to request with specific relevance"],
    "prazos_criticos": ["Prescription or decadence deadlines to flag"],
    "proximos_passos": ["What to do after the interview"],
    "confianca": {"nivel": "alta | media | baixa", "nota": "short justification"}
  }
}`

export const POST = withAgentAuth('atendimento', async ({ req, supabase, user }) => {
  const body = await req.json().catch(() => ({}))
  const areaInput = typeof body?.area === 'string' ? body.area : ''
  const perfil = typeof body?.perfil === 'string' ? body.perfil : ''

  if (!areaInput || !isLegalAreaSlug(areaInput)) {
    return NextResponse.json({ error: 'Area do caso invalida.' }, { status: 400 })
  }
  const area = areaInput
  if (!perfil || perfil.trim().length < 20) {
    return NextResponse.json({ error: 'Descreva o perfil do cliente (minimo 20 caracteres).' }, { status: 400 })
  }
  if (perfil.length > 25000) {
    return NextResponse.json({ error: 'Texto excede o limite maximo de 25.000 caracteres.' }, { status: 400 })
  }

  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY })
  const userMessage = `Area do caso: ${AREAS[area]}\n\nPerfil do cliente e contexto inicial:\n${perfil}`

  const usuarioIdEarly = await resolveUsuarioIdServer(supabase, user.id, user.email, user.user_metadata?.nome)
  const prefs = usuarioIdEarly ? await getUserPreferences(supabase, usuarioIdEarly).catch(() => null) : null
  const prefsContext = buildPreferencesContext(prefs)
  const enhancedSystem = buildAgentPreamble('atendimento') + SYSTEM_PROMPT + buildAntiHallucinationFooter()

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 90_000)
  let message: Anthropic.Messages.Message
  try {
    message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: [
        {
          type: 'text' as const,
          text: enhancedSystem,
          cache_control: { type: 'ephemeral' as const },
        },
        ...(prefsContext ? [{ type: 'text' as const, text: prefsContext }] : []),
      ],
      messages: [{ role: 'user', content: userMessage }],
    }, { signal: controller.signal })
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
    { roteiro: { titulo: 'Entrevista inicial', perfil_cliente: responseText } },
  )
  const roteiro = (parsed?.roteiro as Record<string, unknown> | undefined) ?? parsed

  const usuarioId = usuarioIdEarly
  if (usuarioId) {
    await supabase.from('historico').insert({
      usuario_id: usuarioId,
      agente: 'atendimento',
      mensagem_usuario: `Entrevista: ${AREAS[area]}`,
      resposta_agente: roteiro?.titulo || `Entrevista - ${AREAS[area]}`,
    })
    const tituloOut = (roteiro?.titulo as string) || `Entrevista - ${AREAS[area]}`
    recordAgentMemory(supabase, usuarioId, {
      agente: 'atendimento',
      resumo: buildMemorySummary('atendimento', `${AREAS[area]}: ${perfil.slice(0, 120)}`, tituloOut),
      fatos: [{ key: 'area', value: AREAS[area] }],
      tags: extractMemoryTags('atendimento', area, perfil),
    }, { prefs }).catch(() => {})
  }

  events.agentUsed(user.id, 'atendimento', 'unknown').catch(() => {})
  return NextResponse.json({ roteiro })
})

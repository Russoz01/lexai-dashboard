import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAndIncrementQuota } from '@/lib/quotas'
import { events } from '@/lib/analytics'
import { resolveUsuarioIdServer, parseAgentJSON } from '@/lib/api-utils'
import { buildGroundingContext, validateCitations, groundingStats } from '@/lib/legal-grounding'
import { assertPlanAccess } from '@/lib/plan-access'
import { safeLog } from '@/lib/safe-log'
import { getUserPreferences, recordAgentMemory } from '@/lib/preferences'
import { buildAgentPreamble, buildAntiHallucinationFooter, buildPreferencesContext, extractMemoryTags, buildMemorySummary } from '@/lib/prompt-enhancers'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const REQUEST_TIMEOUT_MS = 90_000

const SYSTEM_PROMPT = `You are an elite Brazilian attorney with 20+ years of experience reviewing contracts, petitions, and legal documents. You catch what others miss — ambiguous clauses, abusive terms, missing safeguards, technical errors, and strategic weaknesses.

METHODOLOGY:
- Read the entire document.
- Identify issues by severity: CRITICOS (must fix), ATENCAO (should review), SUGESTOES (nice to have).
- For each issue, cite the specific passage, the legal basis (articles of CF/1988, CC, CDC, CLT, CPC etc. as applicable), and propose a concrete rewrite.
- When applicable, cite sumulas and real STF/STJ jurisprudence with Court/Case/Justice/Date.
- Never invent facts. Use [INFORMACAO A COMPLETAR] for missing data.

RULES:
- ALL OUTPUT IN BRAZILIAN PORTUGUESE.
- Return ONLY valid JSON, no markdown fences.
- Be transparent about uncertainty.

Return exactly this JSON:
{
  "revisao": {
    "tipo_documento": "Contrato | Peticao | Parecer | Outro",
    "resumo_geral": "2-3 sentence overall assessment",
    "score": 0-100,
    "issues_criticos": [
      { "titulo": "Short title", "trecho": "Exact excerpt from document", "problema": "What is wrong", "fundamento": "Legal basis with article/law", "sugestao": "Concrete rewrite proposal" }
    ],
    "issues_atencao": [
      { "titulo": "...", "trecho": "...", "problema": "...", "fundamento": "...", "sugestao": "..." }
    ],
    "issues_sugestoes": [
      { "titulo": "...", "trecho": "...", "problema": "...", "fundamento": "...", "sugestao": "..." }
    ],
    "reescrita_sugerida": "Full rewritten version of the most problematic sections, with paragraphs separated by \\n\\n.",
    "clausulas_faltantes": ["Clauses that should be added"],
    "confianca": {"nivel": "alta | media | baixa", "nota": "short justification"}
  }
}`

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 })
    if (!ANTHROPIC_API_KEY) return NextResponse.json({ error: 'Servico de IA indisponivel.' }, { status: 503 })

    const planBlock = await assertPlanAccess(supabase, user.id, 'revisor')
    if (planBlock) return planBlock

    const { checkRateLimit, rateLimitResponse } = await import('@/lib/rate-limit')
    const rl = await checkRateLimit(supabase, `user:${user.id}:revisor`)
    if (!rl.ok) return rateLimitResponse(rl)

    const quota = await checkAndIncrementQuota(supabase, user.id, 'revisor')
    if (!quota.ok && quota.response) return quota.response

    const body = await req.json().catch(() => ({}))
    const documento = typeof body?.documento === 'string' ? body.documento : ''
    const tipo = typeof body?.tipo === 'string' ? body.tipo : ''

    if (!documento || documento.trim().length < 100) {
      return NextResponse.json({ error: 'Cole o documento completo (minimo 100 caracteres).' }, { status: 400 })
    }
    if (documento.length > 50000) {
      return NextResponse.json({ error: 'Texto excede o limite maximo de 50.000 caracteres.' }, { status: 400 })
    }

    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY })
    let userMessage = `Documento para revisao:\n\n${documento}`
    if (tipo.trim()) userMessage = `Tipo de documento: ${tipo}\n\n${userMessage}`

    // Use first 2000 chars of the document as query for retrieval (enough for topic match)
    const groundingQuery = documento.slice(0, 2000) + (tipo ? ` ${tipo}` : '')
    const grounding = buildGroundingContext(groundingQuery, { topK: 10 })
    const gstats = groundingStats(grounding)

    const usuarioIdEarly = await resolveUsuarioIdServer(supabase, user.id, user.email, user.user_metadata?.nome)
    const prefs = usuarioIdEarly ? await getUserPreferences(supabase, usuarioIdEarly).catch(() => null) : null
    const prefsContext = buildPreferencesContext(prefs)
    const enhancedSystem = buildAgentPreamble('revisor') + SYSTEM_PROMPT + buildAntiHallucinationFooter()
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      safeLog.debug('[API /revisor] grounding:', gstats)
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
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
          {
            type: 'text' as const,
            text: grounding.contextBlock,
          },
          ...(prefsContext ? [{ type: 'text' as const, text: prefsContext }] : []),
        ],
        messages: [{ role: 'user', content: userMessage }],
      }, { signal: controller.signal })
    } finally {
      clearTimeout(timeoutId)
    }

    const textBlock = message.content.find(b => b.type === 'text')
    const responseText = textBlock && textBlock.type === 'text' ? textBlock.text.trim() : ''
    const parsed = parseAgentJSON<Record<string, unknown> & { revisao?: Record<string, unknown> }>(
      responseText,
      { revisao: { resumo_geral: responseText, issues_criticos: [], issues_atencao: [], issues_sugestoes: [] } },
    )
    const revisao = parsed?.revisao ?? parsed

    const usuarioId = usuarioIdEarly
    if (usuarioId) {
      await supabase.from('historico').insert({
        usuario_id: usuarioId,
        agente: 'revisor',
        mensagem_usuario: `Revisao: ${tipo || 'Documento'} (${documento.length} chars)`,
        resposta_agente: `Revisao concluida - Score ${revisao?.score ?? '-'}`,
      })
      const scoreOut = String(revisao?.score ?? '-')
      recordAgentMemory(supabase, usuarioId, {
        agente: 'revisor',
        resumo: buildMemorySummary('revisor', `${tipo || 'Documento'}: ${documento.slice(0, 120)}`, `score ${scoreOut}`),
        fatos: [
          ...(tipo ? [{ key: 'tipo', value: tipo }] : []),
          { key: 'score', value: scoreOut },
        ],
        tags: extractMemoryTags('revisor', tipo, documento.slice(0, 800)),
      }, { prefs }).catch(() => {})
    }

    const validation = validateCitations(responseText)
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      safeLog.debug('[API /revisor] validation:', validation.stats)
    }

    events.agentUsed(user.id, 'revisor', 'unknown').catch(() => {})
    return NextResponse.json({
      revisao,
      fontes: validation.sources,
      grounding_stats: { ...gstats, ...validation.stats },
    })
  } catch (err: unknown) {
    const errName = err instanceof Error ? err.name : 'Unknown'
    const msg = err instanceof Error ? err.message : 'Erro interno'
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      safeLog.error('[API /revisor]', errName, msg)
    }
    if (errName === 'AbortError' || msg.toLowerCase().includes('aborted') || msg.toLowerCase().includes('timeout')) {
      return NextResponse.json({ error: 'O servico de IA demorou muito para responder. Tente um documento menor.' }, { status: 504 })
    }
    if (err instanceof Error && (msg.includes('529') || msg.toLowerCase().includes('overloaded'))) {
      return NextResponse.json({
        error: 'Agente temporariamente sobrecarregado. Aguarde 30 segundos e tente novamente.',
        retry: true,
      }, { status: 503 })
    }
    return NextResponse.json(
      process.env.NODE_ENV === 'production'
        ? { error: 'Ocorreu um erro ao processar sua solicitacao. Tente novamente.' }
        : { error: 'Ocorreu um erro ao processar sua solicitacao. Tente novamente.', details: msg },
      { status: 500 }
    )
  }
}

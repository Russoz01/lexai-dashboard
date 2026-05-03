import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAndIncrementQuota } from '@/lib/quotas'
import { events } from '@/lib/analytics'
import { resolveUsuarioIdServer, parseAgentJSON } from '@/lib/api-utils'
import { getDemoFallback, isDemoFallbackEnabled, isRetryableError } from '@/lib/demo-fallback'
import { assertPlanAccess } from '@/lib/plan-access'
import { buildGroundingContext, validateCitations, WEB_SEARCH_TOOL, groundingStats } from '@/lib/legal-grounding'
import { safeLog } from '@/lib/safe-log'
import { fireAndForget } from '@/lib/fire-and-forget'
import { getUserPreferences, recordAgentMemory } from '@/lib/preferences'
import { buildAgentPreamble, buildAntiHallucinationFooter, buildPreferencesContext, extractMemoryTags, buildMemorySummary } from '@/lib/prompt-enhancers'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const REQUEST_TIMEOUT_MS = 90_000

const SYSTEM_PROMPT = `You are an elite Brazilian attorney with 20+ years before superior courts (STF, STJ, TST). You produce parecer juridico at the level expected by appellate ministers — rigorous, factual, well-grounded.

METHODOLOGY (8 steps):
1. EMENTA: Resumo tecnico 2-3 frases capturando questao + conclusao + fundamento principal.
2. QUESTAO ANALISADA: Reformule pergunta em linguagem tecnica precisa, delimite escopo (o que e/nao e objeto).
3. FUNDAMENTACAO LEGAL: Cite com hierarquia (CF/88 > Codigo > Lei especial). Para cada artigo, EXPLIQUE aplicabilidade ao caso concreto. Marque [INFORMACAO A COMPLETAR] se faltar dado.
4. DOUTRINA: Cite autores pertinentes a area:
   - Civil: Tartuce, Maria Helena Diniz, Caio Mario, Pablo Stolze, Cristiano Chaves
   - Processual: Theodoro Jr., Nelson Nery Jr., Marinoni, Fredie Didier Jr.
   - Constitucional: Gilmar Mendes, Lenio Streck, Ingo Sarlet, Alexandre de Moraes
   - Penal: Cleber Masson, Rogerio Greco, Cezar Bitencourt
   - Trabalhista: Mauricio Godinho Delgado, Volia Bomfim
   - Tributario: Hugo de Brito Machado, Roque Carrazza
   - Administrativo: Celso Antonio Bandeira, Maria Sylvia Di Pietro
   Nunca invente autor.
5. JURISPRUDENCIA: Acordaos REAIS com Tribunal/Turma/Caso/Relator/Data. Diferencie dominante vs minoritario. Se incerto, declare: "Verificar repositorio oficial (planalto.gov.br, stj.jus.br) antes de citar acordao especifico."
6. ARGUMENTOS FAVORAVEIS x CONTRARIOS: Steelmann ambos lados. Mostre como mitigar contra-argumentos.
7. FATORES CONSIDERADOS: Liste explicitamente o que voce levou em conta (prazo prescricional, sumulas, alteracoes legislativas recentes, contexto factico, etc).
8. CONCLUSAO + RECOMENDACOES + RESSALVAS: posicao fundamentada com grau de confianca, proximos passos, limitacoes.

ANTI-ALUCINACAO (regra absoluta):
- NUNCA invente jurisprudencia ou artigo de lei.
- Se nao souber: "STJ tem entendimento consolidado nesse sentido (consultar repositorio oficial)."
- Use o web search disponivel pra confirmar quando possivel.
- Nunca invente fatos do caso — use [INFORMACAO A COMPLETAR].

REGRAS DE HUMANIZACAO:
- Tom de jurista experiente, nao IA generica.
- Transparencia sobre incerteza: "Este ponto merece cautela porque..."
- Linguagem tecnica acessivel, periodos curtos.

FORMATACAO:
- Use **negrito** em referencias legais embutidas no texto: "**Art. 422 CC** consagra..."
- Use *italico* em titulos de obras de doutrina.

ALL OUTPUT IN BRAZILIAN PORTUGUESE.
Return ONLY valid JSON, no markdown fences.

JSON shape:
{
  "parecer": {
    "titulo": "Titulo do parecer",
    "ementa": "Resumo tecnico 2-3 frases",
    "questao_analisada": "Pergunta reformulada com escopo",
    "fundamentacao_legal": ["Art. X da Lei Y — aplicabilidade ao caso", "Sumula Z — relevancia"],
    "doutrina": ["Autor (Obra, ano) — posicao", "Autor — entendimento divergente"],
    "jurisprudencia": ["STJ, REsp XXXX, Rel. Min. Nome, data — tese"],
    "argumentos_favoraveis": ["Argumento 1 com base legal + doutrina"],
    "argumentos_contrarios": ["Contra-argumento + como mitigar"],
    "fatores_considerados": ["Prazo prescricional X verificado", "Sumula Y aplicavel", "Alteracao recente Lei Z"],
    "conclusao": "Posicao fundamentada com grau de confianca",
    "recomendacoes": ["Pratico 1", "Estrategico 2"],
    "ressalvas": "Limitacoes e riscos",
    "confianca": {"nivel": "alta | media | baixa", "nota": "justificativa breve"}
  }
}`

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 })
    if (!ANTHROPIC_API_KEY) return NextResponse.json({ error: 'Servico de IA indisponivel.' }, { status: 503 })

    const { checkRateLimit, rateLimitResponse } = await import('@/lib/rate-limit')
    // Plan-based access (Wave R1 audit): Parecerista é Escritório+
    const planBlock = await assertPlanAccess(supabase, user.id, 'parecerista')
    if (planBlock) return planBlock

    const rl = await checkRateLimit(supabase, `user:${user.id}:parecerista`)
    if (!rl.ok) return rateLimitResponse(rl)

    const quota = await checkAndIncrementQuota(supabase, user.id, 'parecerista')
    if (!quota.ok && quota.response) return quota.response

    const body = await req.json().catch(() => ({}))
    const consulta = typeof body?.consulta === 'string' ? body.consulta : ''
    const area = typeof body?.area === 'string' ? body.area : ''

    if (!consulta || consulta.trim().length < 20) {
      return NextResponse.json({ error: 'Descreva a consulta com mais detalhes (minimo 20 caracteres).' }, { status: 400 })
    }
    if (consulta.length > 50000) {
      return NextResponse.json({ error: 'Texto excede o limite maximo de 50.000 caracteres.' }, { status: 400 })
    }

    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY })
    let userMessage = `Consulta para parecer juridico:\n\n${consulta}`
    if (area.trim()) userMessage += `\n\nArea do Direito: ${area}`

    const usuarioIdEarly = await resolveUsuarioIdServer(supabase, user.id, user.email, user.user_metadata?.nome)
    const prefs = usuarioIdEarly ? await getUserPreferences(supabase, usuarioIdEarly).catch(() => null) : null
    const prefsContext = buildPreferencesContext(prefs)
    const enhancedSystem = buildAgentPreamble('parecerista') + SYSTEM_PROMPT + buildAntiHallucinationFooter()

    const grounding = buildGroundingContext(`${consulta} ${area}`, { area: area || undefined, topK: 10 })
    const gstats = groundingStats(grounding)
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      safeLog.debug('[API /parecerista] grounding:', gstats)
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
        tools: [WEB_SEARCH_TOOL],
        messages: [{ role: 'user', content: userMessage }],
      }, { signal: controller.signal })
    } finally {
      clearTimeout(timeoutId)
    }

    // Concatena TODOS os text blocks (modelo com WEB_SEARCH_TOOL emite
    // preambulo + tool_use + JSON final em blocks separados).
    const responseText = message.content
      .filter((b): b is Anthropic.Messages.TextBlock => b.type === 'text')
      .map(b => b.text)
      .join('\n')
      .trim()
    const parsed = parseAgentJSON<Record<string, unknown> & { parecer?: Record<string, unknown> }>(
      responseText,
      { parecer: { titulo: 'Parecer', conclusao: responseText } },
    )
    const parecer = parsed?.parecer ?? parsed

    const usuarioId = usuarioIdEarly
    if (usuarioId) {
      await supabase.from('historico').insert({
        usuario_id: usuarioId,
        agente: 'parecerista',
        mensagem_usuario: `Parecer: ${consulta.slice(0, 200)}${area ? ` (${area})` : ''}`,
        resposta_agente: parecer?.titulo || 'Parecer juridico',
      })

      const tituloOut = (parecer?.titulo as string) || consulta.slice(0, 80)
      fireAndForget(recordAgentMemory(supabase, usuarioId, {
        agente: 'parecerista',
        resumo: buildMemorySummary('parecerista', consulta, tituloOut),
        fatos: [
          ...(area ? [{ key: 'area', value: area }] : []),
          { key: 'titulo', value: String(tituloOut).slice(0, 120) },
        ],
        tags: extractMemoryTags('parecerista', area, `${consulta} ${tituloOut}`),
      }, { prefs }), 'recordAgentMemory:parecerista')
    }

    const validation = validateCitations(responseText)
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      safeLog.debug('[API /parecerista] validation:', validation.stats, 'warnings:', validation.warnings.length)
    }

    fireAndForget(events.agentUsed(user.id, 'parecerista', 'unknown'), 'events.agentUsed:parecerista')
    return NextResponse.json({
      parecer,
      fontes: validation.sources,
      grounding_stats: { ...gstats, ...validation.stats },
    })
  } catch (err: unknown) {
    const errName = err instanceof Error ? err.name : 'Unknown'
    const msg = err instanceof Error ? err.message : 'Erro interno'
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      safeLog.error('[API /parecerista]', errName, msg)
    }
    // Demo-mode fallback (Wave C5) — wrap pra match shape de sucesso ({parecer, fontes, grounding_stats})
    if (isDemoFallbackEnabled() && isRetryableError(err)) {
      const fallback = getDemoFallback('parecerista', { reason: msg })
      return NextResponse.json({ parecer: fallback, fontes: [], grounding_stats: {} })
    }
    if (errName === 'AbortError' || msg.toLowerCase().includes('aborted') || msg.toLowerCase().includes('timeout')) {
      return NextResponse.json({ error: 'O servico de IA demorou muito para responder. Tente uma consulta mais curta.' }, { status: 504 })
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

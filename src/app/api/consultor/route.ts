import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { events } from '@/lib/analytics'
import { buildGroundingContext, validateCitations, WEB_SEARCH_TOOL, groundingStats } from '@/lib/legal-grounding'
import { parseAgentJSON } from '@/lib/api-utils'
import { getDemoFallback, isDemoFallbackEnabled, isRetryableError } from '@/lib/demo-fallback'
import { assertPlanAccess } from '@/lib/plan-access'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const REQUEST_TIMEOUT_MS = 60_000

interface ChargeResult {
  ok: boolean
  reason?: string
  usuario_id?: string
  plano?: string
  limite?: number
  usado?: number
  remaining?: number
}

const SYSTEM_PROMPT = `Voce e um advogado brasileiro de elite com 30+ anos de experiencia, reconhecido por pareceres juridicos de altissima qualidade. Combina rigor academico (USP, FGV, UnB, Harvard Law) com vasta pratica em contenciosos estrategicos.

ESPECIALIDADES:
- Direito Civil, Penal, Constitucional, Trabalhista, Tributario, Administrativo, Empresarial, Ambiental, Digital, Consumidor, Familia, Imobiliario, Previdenciario, Internacional
- Analise multidisciplinar quando a questao envolve mais de uma area
- Pareceres para tribunais, orgaos reguladores, empresas e pessoas fisicas

METODOLOGIA DE PARECER (8 passos rigorosos):
1. QUESTAO ANALISADA: Reformule a pergunta em linguagem tecnica precisa, delimitando escopo (o que e e o que nao e objeto do parecer).
2. FUNDAMENTACAO LEGAL: Cite legislacao com hierarquia (CF/88 > Codigo > Lei especial > Regulamento). Para cada artigo, explique APLICABILIDADE ao caso, nao apenas transcreva.
3. DOUTRINA: Referencie autores consagrados pertinentes a area:
   - Civil: Tartuce, Maria Helena Diniz, Caio Mario, Pablo Stolze, Cristiano Chaves
   - Processual: Theodoro Jr., Nelson Nery Jr., Marinoni, Fredie Didier Jr., Daniel Mitidiero
   - Constitucional: Gilmar Mendes, Lenio Streck, Ingo Sarlet, Alexandre de Moraes
   - Penal: Cleber Masson, Rogerio Greco, Cezar Bitencourt, Gustavo Badaro
   - Trabalhista: Mauricio Godinho Delgado, Vólia Bomfim, Sergio Pinto Martins
   - Tributario: Hugo de Brito Machado, Roque Carrazza, Paulo de Barros Carvalho
   - Administrativo: Celso Antonio Bandeira, Maria Sylvia Di Pietro, Marcal Justen Filho
   Mencione obra + ano quando souber. Nunca invente autor.
4. JURISPRUDENCIA: Cite acordaos REAIS com Tribunal/Turma/Caso/Relator/Data. Diferencie entendimento dominante vs minoritario. Se houver divergencia, declare explicitamente.
5. ARGUMENTOS FAVORAVEIS: Apresente os melhores argumentos pro cliente, com base legal + doutrina + jurisprudencia.
6. ARGUMENTOS CONTRARIOS: Apresente os argumentos da parte adversa com igual rigor (steelmanning) e mostre como mitigar/superar cada um.
7. FATORES CONSIDERADOS: Liste o que voce levou em conta na analise (ex: prazo prescricional, sumulas vinculantes, alteracoes recentes na legislacao, contexto factico relevante).
8. CONCLUSAO + RECOMENDACOES + RESSALVAS: posicao fundamentada com grau de confianca, proximos passos praticos, limitacoes do parecer.

ANTI-ALUCINACAO (regra absoluta):
- NUNCA invente jurisprudencia. Se nao souber acordao especifico, escreva: "STJ tem entendimento consolidado nesse sentido (consultar repositorios oficiais antes de citar acordao especifico)."
- NUNCA invente artigo de lei. Se incerto, declare: "Verificar redacao atual no planalto.gov.br antes de usar."
- Use o web search disponivel pra confirmar citacoes quando possivel.
- Marque [INFORMACAO A COMPLETAR] quando faltar dado factico.

REGRAS DE HUMANIZACAO:
- Escreva como jurista experiente e cuidadoso, nao como IA.
- Seja transparente sobre incertezas: "Este ponto merece cautela porque..."
- Linguagem tecnica mas acessivel — o cliente deve entender a conclusao.
- Tom sobrio, sem hype nem floreio. Periodos curtos quando possivel.

FORMATACAO DO TEXTO:
- Use **negrito** em referencias legais ja embutidas em meio a texto: ex: "**Art. 422 do Codigo Civil** consagra..."
- Use *italico* em titulos de obras de doutrina: "*Curso de Direito Civil*, Tartuce, 2024"
- Em listas de fundamentacao_legal, jurisprudencia, doutrina — texto puro (o renderer ja destaca)

TODA SAIDA EM PORTUGUES BRASILEIRO.
Retorne SOMENTE JSON valido, sem markdown fences (sem \`\`\`json wrappers).

Retorne este JSON:
{
  "parecer": {
    "titulo": "Titulo do parecer (ex: Parecer Juridico sobre Responsabilidade Civil por Danos Morais em Negativacao Indevida)",
    "ementa": "Resumo tecnico em 2-3 frases do parecer e sua conclusao principal",
    "questao_analisada": "Reformulacao tecnica da pergunta com delimitacao do escopo (o que e e o que nao e objeto)",
    "fundamentacao_legal": ["Art. X da Lei Y — explicacao de aplicabilidade ao caso concreto", "Art. Z — relevancia"],
    "doutrina": ["Autor (Obra, ano) — posicao", "Outro autor — entendimento divergente/convergente"],
    "jurisprudencia": ["Tribunal, Recurso XXX, Rel. Min. Nome, data — tese central", "..."],
    "argumentos_favoraveis": ["Argumento 1 com base legal + doutrina + jurisprudencia", "Argumento 2"],
    "argumentos_contrarios": ["Contra-argumento 1 com fundamentacao", "Como mitigar/superar"],
    "fatores_considerados": ["Prazo prescricional verificado", "Sumula X aplicavel", "Alteracao recente na Lei Y", "Contexto factico relevante Z"],
    "conclusao": "Posicao fundamentada do parecerista com grau de confianca e justificativa",
    "recomendacoes": ["Recomendacao pratica 1", "Estrategica 2", "Cautelar 3"],
    "ressalvas": "Limitacoes do parecer, necessidade de analise documental complementar, riscos"
  }
}`

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 })
    if (!ANTHROPIC_API_KEY) return NextResponse.json({ error: 'Servico de IA indisponivel.' }, { status: 503 })

    // Sliding-window rate limit (20 req/min per user per agent) — fails open
    // Plan-based access (Wave R1 audit): Consultor é Escritório+
    const planBlock = await assertPlanAccess(supabase, user.id, 'consultor')
    if (planBlock) return planBlock

    const { checkRateLimit, rateLimitResponse } = await import('@/lib/rate-limit')
    const rl = await checkRateLimit(supabase, `user:${user.id}:consultor`)
    if (!rl.ok) return rateLimitResponse(rl)

    // Atomic quota check + charge via SECURITY DEFINER RPC
    const { data: chargeData, error: chargeErr } = await supabase
      .rpc('check_and_charge', { p_auth_user_id: user.id, p_agente: 'consultor' })

    if (chargeErr) {
      console.error('[API /consultor] check_and_charge rpc error:', chargeErr.message, chargeErr.code)
      return NextResponse.json({ error: 'Erro ao validar quota.' }, { status: 500 })
    }

    const charge = (chargeData ?? {}) as ChargeResult
    if (!charge.ok) {
      if (charge.reason === 'user_not_found') {
        return NextResponse.json({ error: 'Perfil de usuario nao encontrado' }, { status: 403 })
      }
      if (charge.reason === 'quota_exceeded') {
        const plano = charge.plano ?? 'free'
        const limite = charge.limite ?? 0
        const usado = charge.usado ?? 0
        return NextResponse.json({
          error: `Limite mensal do plano ${plano} atingido (${usado}/${limite}). Faca upgrade para continuar.`,
          quota: { used: usado, limit: limite, plan: plano },
        }, { status: 429 })
      }
      console.error('[API /consultor] check_and_charge returned ok:false with unknown reason:', charge.reason)
      return NextResponse.json({ error: 'Erro ao validar quota.' }, { status: 500 })
    }

    const usuarioId = charge.usuario_id ?? null
    const plano = charge.plano ?? 'free'

    const body = await req.json().catch(() => ({}))
    const pergunta = typeof body?.pergunta === 'string' ? body.pergunta : ''
    const area = typeof body?.area === 'string' ? body.area : ''
    const contexto = typeof body?.contexto === 'string' ? body.contexto : ''

    if (!pergunta || pergunta.trim().length < 10) return NextResponse.json({ error: 'Informe a pergunta juridica (minimo 10 caracteres).' }, { status: 400 })
    if (pergunta.length > 50000) return NextResponse.json({ error: 'Texto excede o limite maximo de 50.000 caracteres.' }, { status: 400 })
    if (contexto.length > 30000) return NextResponse.json({ error: 'Contexto adicional excede 30.000 caracteres.' }, { status: 400 })

    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY })

    // Build grounding context - retrieves real legal provisions + sumulas from corpus.
    const grounding = buildGroundingContext(`${pergunta} ${area} ${contexto}`, { area: area || undefined, topK: 8 })
    const gstats = groundingStats(grounding)
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log('[API /consultor] grounding:', gstats)
    }

    let userMessage = `Questao juridica para parecer:\n\n${pergunta}`
    if (area.trim()) {
      userMessage += `\n\nArea do Direito: ${area}`
    }
    if (contexto.trim()) {
      userMessage += `\n\nContexto adicional fornecido pelo cliente:\n${contexto}`
    }

    // AbortController gives us a hard 60s cap instead of waiting for the
    // platform's request timeout. Without this, a stuck Anthropic call
    // holds the lambda until Vercel kills it and the user sees a generic
    // 504 with no actionable message.
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    let message: Anthropic.Messages.Message
    try {
      message = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        // 12000 (era 8192): pareceres com fundamentacao + doutrina + favoraveis
        // + contrarios + recomendacoes estouravam o teto, JSON cortado e parse
        // falhava (erro_parse fallback). Haiku 4.5 suporta ate ~16k saida.
        max_tokens: 12000,
        system: [
          {
            type: 'text' as const,
            text: SYSTEM_PROMPT,
            cache_control: { type: 'ephemeral' as const },
          },
          {
            type: 'text' as const,
            text: grounding.contextBlock,
          },
        ],
        tools: [WEB_SEARCH_TOOL],
        messages: [{ role: 'user', content: userMessage }],
      }, { signal: controller.signal })
    } finally {
      clearTimeout(timeoutId)
    }

    // Concatena TODOS os text blocks (modelo emite multiplos quando usa
    // WEB_SEARCH_TOOL: 1 preambulo + tool_use + text final com JSON).
    // find() pegava apenas o primeiro (preambulo "Vou pesquisar...") e
    // perdia o JSON estruturado. Bug critico que sabotava 3 agentes.
    const responseText = message.content
      .filter((b): b is Anthropic.Messages.TextBlock => b.type === 'text')
      .map(b => b.text)
      .join('\n')
      .trim()

    const parecer = responseText
      ? parseAgentJSON<Record<string, unknown>>(responseText, { parecer: { titulo: 'Parecer', conclusao: responseText }, erro_parse: true })
      : { parecer: { titulo: '', conclusao: '' }, erro_parse: true }

    // Normalize: if the model returned { parecer: { ... } }, extract the inner object
    const parecerData = ((parecer as Record<string, unknown>)?.parecer ?? parecer) as Record<string, unknown>

    // Validate citations against verified corpus and extract URLs.
    const validation = validateCitations(responseText)
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log('[API /consultor] validation:', validation.stats, 'warnings:', validation.warnings.length)
    }

    if (usuarioId) {
      const { error: histErr } = await supabase.from('historico').insert({
        usuario_id: usuarioId,
        agente: 'consultor',
        mensagem_usuario: `Parecer: ${pergunta.slice(0, 200)}${area ? ` (${area})` : ''}`,
        resposta_agente: `Parecer sobre ${parecerData?.titulo || pergunta.slice(0, 100)}`,
      })
      if (histErr) {
        console.error('[API /consultor] historico insert error:', histErr.message, histErr.code)
      }
    }

    events.agentUsed(user.id, 'consultor', plano).catch(() => {})

    return NextResponse.json({
      parecer: parecerData,
      fontes: validation.sources,
      grounding_stats: { ...gstats, ...validation.stats },
    })
  } catch (err: unknown) {
    const errName = err instanceof Error ? err.name : 'Unknown'
    const errMsg = err instanceof Error ? err.message : String(err)
    const errStack = err instanceof Error ? err.stack?.split('\n').slice(0, 5).join(' | ') : undefined
    console.error('[API /consultor] unhandled:', errName, '-', errMsg, '|', errStack ?? '')

    // Demo-mode fallback (Wave C5) — fallback tem {parecer:...}, falta fontes + grounding_stats
    if (isDemoFallbackEnabled() && isRetryableError(err)) {
      const fallback = getDemoFallback('consultor', { reason: errMsg })
      return NextResponse.json({ ...fallback, fontes: [], grounding_stats: {} })
    }

    const lower = errMsg.toLowerCase()
    if (errName === 'AbortError' || errName === 'TimeoutError' || lower.includes('timeout') || lower.includes('aborted')) {
      return NextResponse.json({ error: 'O servico de IA demorou muito para responder. Tente uma pergunta mais curta.' }, { status: 504 })
    }
    if (errMsg.includes('401') || lower.includes('invalid_api_key') || lower.includes('authentication')) {
      return NextResponse.json({ error: 'Servico de IA temporariamente indisponivel. Tente novamente em alguns minutos.' }, { status: 503 })
    }
    if (errMsg.includes('429') || lower.includes('rate_limit') || lower.includes('quota')) {
      return NextResponse.json({ error: 'Muitas requisicoes. Aguarde 60 segundos antes de tentar novamente.' }, { status: 429 })
    }
    if (errMsg.includes('529') || lower.includes('overloaded')) {
      return NextResponse.json({ error: 'O servico de IA esta sobrecarregado. Tente novamente em 30 segundos.' }, { status: 503 })
    }
    return NextResponse.json({ error: 'Ocorreu um erro ao processar sua solicitacao. Tente novamente.' }, { status: 500 })
  }
}

import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { events } from '@/lib/analytics'
import { buildGroundingContext, validateCitations, WEB_SEARCH_TOOL, groundingStats } from '@/lib/legal-grounding'

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

const SYSTEM_PROMPT = `Voce e um advogado brasileiro de elite com 30+ anos de experiencia, reconhecido internacionalmente por produzir pareceres juridicos de altissima qualidade. Voce combina rigor academico (USP, FGV, UnB, Harvard Law) com vasta experiencia pratica em contenciosos e consultorias estrategicas.

ESPECIALIDADES:
- Direito Civil, Penal, Constitucional, Trabalhista, Tributario, Administrativo, Empresarial, Ambiental, Digital, Internacional
- Analise multidisciplinar quando a questao envolve mais de uma area
- Pareceres para tribunais, orgaos reguladores, empresas e pessoas fisicas

METODO DE ELABORACAO DO PARECER:
1. QUESTAO ANALISADA: Reformule a pergunta do cliente em linguagem tecnica precisa
2. FUNDAMENTACAO LEGAL: Cite legislacao especifica (artigos, paragrafos, incisos) com explicacao de aplicabilidade
3. DOUTRINA: Referencie autores consagrados (ex: Humberto Theodoro Jr., Nelson Nery Jr., Flavio Tartuce, Maria Helena Diniz, Celso Antonio Bandeira de Mello, Luiz Guilherme Marinoni, Fredie Didier Jr., Hugo de Brito Machado, Roque Carrazza)
4. ARGUMENTOS: Apresente argumentos favoraveis e contrarios com igual rigor, sem parcialidade
5. CONCLUSAO: Posicao fundamentada com grau de confianca
6. RECOMENDACOES: Proximos passos praticos e estrategicos
7. RESSALVAS: Limitacoes do parecer, necessidade de analise documental, riscos

REGRAS DE HUMANIZACAO:
- Escreva como um jurista experiente e cuidadoso, nao como uma IA
- Seja transparente sobre incertezas: "Este ponto merece cautela..."
- Quando houver divergencia jurisprudencial, mencione explicitamente
- Se a questao for vaga, assuma a interpretacao mais razoavel e indique
- Use linguagem tecnica mas acessivel — o cliente deve entender a conclusao
- Cite legislacao atualizada (mencione se houve alteracoes recentes relevantes)

TODA SAIDA EM PORTUGUES BRASILEIRO.
Retorne SOMENTE JSON valido, sem markdown fences.

Retorne este JSON:
{
  "parecer": {
    "titulo": "Titulo do parecer (ex: Parecer Juridico sobre Responsabilidade Civil por Danos Morais)",
    "ementa": "Resumo tecnico em 2-3 frases do parecer e sua conclusao principal",
    "questao_analisada": "Reformulacao tecnica da pergunta do cliente com delimitacao do escopo",
    "fundamentacao_legal": ["Art. X da Lei Y — explicacao de aplicabilidade", "Art. Z do Codigo W — relevancia para o caso"],
    "doutrina": ["Autor (Obra, ano) — posicao sobre o tema", "Outro autor — entendimento divergente/convergente"],
    "argumentos_favoraveis": ["Argumento 1 com base legal", "Argumento 2 com jurisprudencia"],
    "argumentos_contrarios": ["Contra-argumento 1 com fundamentacao", "Contra-argumento 2 e como mitiga-lo"],
    "conclusao": "Posicao fundamentada do parecerista com grau de confianca e justificativa",
    "recomendacoes": ["Recomendacao pratica 1", "Recomendacao estrategica 2", "Providencia cautelar 3"],
    "ressalvas": "Limitacoes do parecer, necessidade de analise documental complementar, e riscos associados"
  }
}`

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 })
    if (!ANTHROPIC_API_KEY) return NextResponse.json({ error: 'Servico de IA indisponivel.' }, { status: 503 })

    // Sliding-window rate limit (20 req/min per user per agent) — fails open
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
    console.log('[API /consultor] grounding:', gstats)

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
        max_tokens: 8192,
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

    // Find the first text block
    const textBlock = message.content.find(
      (b): b is Anthropic.Messages.TextBlock => b.type === 'text',
    )
    const responseText = textBlock?.text.trim() ?? ''

    let parecer
    try {
      const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      parecer = cleaned ? JSON.parse(cleaned) : { parecer: { titulo: '', conclusao: '' }, erro_parse: true }
    } catch {
      parecer = { parecer: { titulo: 'Parecer', conclusao: responseText }, erro_parse: true }
    }

    // Normalize: if the model returned { parecer: { ... } }, extract the inner object
    const parecerData = parecer?.parecer ?? parecer

    // Validate citations against verified corpus and extract URLs.
    const validation = validateCitations(responseText)
    console.log('[API /consultor] validation:', validation.stats, 'warnings:', validation.warnings.length)

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

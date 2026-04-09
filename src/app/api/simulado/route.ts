import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { events } from '@/lib/analytics'

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

const NIVEIS_VALIDOS = ['facil', 'medio', 'dificil'] as const

const SYSTEM_PROMPT = `Voce e um especialista em elaboracao de questoes para concursos publicos e exame da OAB no Brasil. Possui 20+ anos de experiencia como elaborador de bancas como CESPE/CEBRASPE, FGV, FCC, VUNESP e Exame de Ordem (OAB). Sua especialidade e criar questoes que simulam fielmente o estilo, a dificuldade e as armadilhas das provas reais.

DIRETRIZES DE ELABORACAO:
- Questoes devem seguir o padrao da banca especificada (se informada) ou OAB por padrao
- Cada questao DEVE ter exatamente 5 alternativas (a, b, c, d, e)
- Uma UNICA alternativa correta por questao
- Enunciados devem ser tecnicos e precisos, usando terminologia juridica brasileira
- Incluir casos praticos, situacoes hipoteticas e problemas reais quando possivel
- Alternativas incorretas devem ser plausives (distratores de qualidade) — erros sutis, nao absurdos
- Variar os niveis cognitivos: conhecimento, compreensao, aplicacao, analise
- Referenciar legislacao vigente (CF/88, CC/2002, CP, CPC/2015, CLT, CTN, CDC, etc.)
- Citar jurisprudencia do STF e STJ quando pertinente
- Incluir doutrina majoritaria e minoritaria quando relevante

AJUSTE POR NIVEL:
- facil: conceitos fundamentais, letra da lei, decoreba, sumulas vinculantes
- medio: aplicacao pratica, casos concretos, interpretacao sistematica, jurisprudencia consolidada
- dificil: controversias doutrinarias, jurisprudencia divergente, pegadinhas classicas de banca, questoes interdisciplinares

AJUSTE POR BANCA:
- OAB: foco em etica profissional, Estatuto da Advocacia, questoes mais diretas
- CESPE: estilo certo/errado adaptado para multipla escolha, enunciados longos e detalhados
- FGV: questoes contextualizadas com casos praticos elaborados
- FCC: questoes mais objetivas, foco em letra da lei
- VUNESP: questoes regionais (SP), foco em legislacao estadual quando aplicavel

ALL OUTPUT IN BRAZILIAN PORTUGUESE.
Return ONLY valid JSON, no markdown fences.

Return this JSON:
{
  "questoes": [
    {
      "enunciado": "Enunciado completo da questao, incluindo caso pratico ou situacao hipotetica quando aplicavel",
      "alternativas": {
        "a": "Texto da alternativa A",
        "b": "Texto da alternativa B",
        "c": "Texto da alternativa C",
        "d": "Texto da alternativa D",
        "e": "Texto da alternativa E"
      },
      "gabarito": "a|b|c|d|e",
      "justificativa": "Explicacao detalhada de por que a alternativa correta esta certa E por que cada alternativa incorreta esta errada, com fundamentacao legal",
      "artigos_relacionados": ["Art. X da Lei Y", "Sumula Z do STF/STJ"],
      "dica_estudo": "Dica pratica para o estudante memorizar ou aprofundar este ponto"
    }
  ]
}`

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 })
    if (!ANTHROPIC_API_KEY) return NextResponse.json({ error: 'Servico de IA indisponivel.' }, { status: 503 })

    // Sliding-window rate limit (20 req/min per user per agent) — fails open
    const { checkRateLimit, rateLimitResponse } = await import('@/lib/rate-limit')
    const rl = await checkRateLimit(supabase, `user:${user.id}:simulado`)
    if (!rl.ok) return rateLimitResponse(rl)

    // Atomic quota check + charge via SECURITY DEFINER RPC
    const { data: chargeData, error: chargeErr } = await supabase
      .rpc('check_and_charge', { p_auth_user_id: user.id, p_agente: 'simulado' })

    if (chargeErr) {
      console.error('[API /simulado] check_and_charge rpc error:', chargeErr.message, chargeErr.code)
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
      console.error('[API /simulado] check_and_charge returned ok:false with unknown reason:', charge.reason)
      return NextResponse.json({ error: 'Erro ao validar quota.' }, { status: 500 })
    }

    const usuarioId = charge.usuario_id ?? null
    const plano = charge.plano ?? 'free'

    const body = await req.json().catch(() => ({}))
    const materia = typeof body?.materia === 'string' ? body.materia.trim() : ''
    const nivel = typeof body?.nivel === 'string' && NIVEIS_VALIDOS.includes(body.nivel as typeof NIVEIS_VALIDOS[number]) ? body.nivel : 'medio'
    const quantidade = typeof body?.quantidade === 'number' && body.quantidade >= 1 && body.quantidade <= 10 ? body.quantidade : 5
    const banca = typeof body?.banca === 'string' ? body.banca.trim() : ''

    if (!materia || materia.length < 3) return NextResponse.json({ error: 'Informe a materia.' }, { status: 400 })
    if (materia.length > 500) return NextResponse.json({ error: 'Nome da materia muito longo.' }, { status: 400 })
    if (banca.length > 100) return NextResponse.json({ error: 'Nome da banca muito longo.' }, { status: 400 })

    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY })

    let userMessage = `Gere ${quantidade} questoes de ${materia} no nivel "${nivel}".`
    if (banca) {
      userMessage += ` Estilo da banca: ${banca}.`
    }
    userMessage += `\n\nRetorne exatamente ${quantidade} questoes no formato JSON especificado.`

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
        ],
        messages: [{ role: 'user', content: userMessage }],
      }, { signal: controller.signal })
    } finally {
      clearTimeout(timeoutId)
    }

    const textBlock = message.content.find(
      (b): b is Anthropic.Messages.TextBlock => b.type === 'text',
    )
    const responseText = textBlock?.text.trim() ?? ''

    let resultado
    try {
      const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      resultado = cleaned ? JSON.parse(cleaned) : { questoes: [], erro_parse: true }
    } catch {
      resultado = { questoes: [], erro_parse: true, raw: responseText }
    }

    if (usuarioId) {
      const { error: histErr } = await supabase.from('historico').insert({
        usuario_id: usuarioId,
        agente: 'simulado',
        mensagem_usuario: `Simulado: ${materia} (${nivel}, ${quantidade}q${banca ? `, ${banca}` : ''})`,
        resposta_agente: `Simulado com ${quantidade} questoes de ${materia}`,
      })
      if (histErr) {
        console.error('[API /simulado] historico insert error:', histErr.message, histErr.code)
      }
    }

    events.agentUsed(user.id, 'simulado', plano).catch(() => {})

    return NextResponse.json({ questoes: resultado.questoes ?? [] })
  } catch (err: unknown) {
    const errName = err instanceof Error ? err.name : 'Unknown'
    const errMsg = err instanceof Error ? err.message : String(err)
    const errStack = err instanceof Error ? err.stack?.split('\n').slice(0, 5).join(' | ') : undefined
    console.error('[API /simulado] unhandled:', errName, '-', errMsg, '|', errStack ?? '')

    const lower = errMsg.toLowerCase()
    if (errName === 'AbortError' || errName === 'TimeoutError' || lower.includes('timeout') || lower.includes('aborted')) {
      return NextResponse.json({ error: 'O servico de IA demorou muito para responder. Tente menos questoes.' }, { status: 504 })
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

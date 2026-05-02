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

const AREAS_VALIDAS = [
  'Civil', 'Penal', 'Trabalhista', 'Tributario', 'Empresarial',
  'Ambiental', 'Digital', 'Consumidor', 'Administrativo', 'Constitucional',
] as const

const TIPOS_VALIDOS = ['Consultivo', 'Contencioso', 'Preventivo', 'Regulatorio'] as const

const SYSTEM_PROMPT = `Voce e um consultor juridico senior com 25+ anos de experiencia na elaboracao de pareceres juridicos no Brasil. Possui amplo conhecimento em legislacao brasileira, doutrina e jurisprudencia dos tribunais superiores (STF, STJ, TST, TSE). Seu trabalho e reconhecido pela profundidade tecnica, clareza argumentativa e rigor nas citacoes.

DIRETRIZES PARA ELABORACAO DO PARECER:

1. EMENTA: Resumo conciso do parecer em 2-3 frases, identificando o tema central, a area do direito e a conclusao principal.

2. FATOS: Apresentacao organizada dos fatos narrados pelo consulente, separando fatos incontroversos de fatos alegados, identificando lacunas factuais relevantes.

3. QUESTAO JURIDICA: Formulacao precisa da(s) questao(oes) juridica(s) que o parecer pretende responder, delimitando o escopo da analise.

4. FUNDAMENTACAO LEGAL: Analise detalhada da legislacao aplicavel, citando:
   - Dispositivos constitucionais (CF/88)
   - Legislacao federal (CC/2002, CP, CPC/2015, CLT, CTN, CDC, LGPD, etc.)
   - Legislacao especial pertinente
   - Sempre indicar artigo, paragrafo, inciso e alinea quando aplicavel
   - Verificar a vigencia e eventuais alteracoes legislativas

5. DOUTRINA APLICAVEL: Referenciar posicoes doutrinarias relevantes, indicando:
   - Autores e obras de referencia na area
   - Posicao majoritaria vs. minoritaria quando houver divergencia
   - Tendencias doutrinarias emergentes

6. JURISPRUDENCIA RELEVANTE: Citar decisoes dos tribunais superiores e tribunais regionais, incluindo:
   - Numero do recurso/processo quando possivel
   - Tribunal e turma/camara julgadora
   - Tese fixada ou ratio decidendi
   - Distinguir jurisprudencia consolidada de posicoes isoladas

7. CONCLUSAO E RECOMENDACAO: Responder objetivamente a questao juridica, oferecendo:
   - Conclusao fundamentada
   - Recomendacoes praticas para o consulente
   - Riscos juridicos identificados
   - Alternativas e estrategias possiveis

REGRAS GERAIS:
- Toda citacao deve ser precisa e verificavel. Se nao tiver certeza absoluta, indique: "Esta referencia requer verificacao junto a fonte primaria."
- Linguagem tecnica, mas acessivel. Evite jargao desnecessario sem explicacao.
- Seja transparente sobre limitacoes e incertezas.
- Sempre inclua o disclaimer sobre a natureza do parecer gerado por IA.
- Todo o conteudo deve ser em portugues brasileiro (pt-BR).

AJUSTE POR TIPO DE PARECER:
- Consultivo: foco em orientacao preventiva, analise de viabilidade juridica, recomendacoes para tomada de decisao.
- Contencioso: foco em teses defensivas/ofensivas, jurisprudencia favoravel, estrategia processual.
- Preventivo: foco em compliance, mitigacao de riscos, adequacao a normas vigentes.
- Regulatorio: foco em normas regulatorias setoriais, agencias reguladoras, conformidade administrativa.

ALL OUTPUT IN BRAZILIAN PORTUGUESE.
Return ONLY valid JSON, no markdown fences.

Return this JSON:
{
  "parecer": {
    "ementa": "Resumo conciso do parecer",
    "fatos": "Apresentacao organizada dos fatos",
    "questao_juridica": "Formulacao das questoes juridicas a responder",
    "fundamentacao_legal": "Analise detalhada com citacoes de artigos, leis e dispositivos legais",
    "doutrina_aplicavel": "Referencias doutrinarias com autores e obras",
    "jurisprudencia_relevante": "Decisoes de tribunais superiores com numeros e teses",
    "conclusao_recomendacao": "Conclusao fundamentada com recomendacoes praticas",
    "disclaimer": "Este parecer foi gerado por inteligencia artificial e possui carater meramente informativo e orientativo. Nao substitui a analise e validacao por advogado habilitado. As citacoes de legislacao, doutrina e jurisprudencia devem ser verificadas junto as fontes primarias antes de qualquer utilizacao profissional."
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
    const area = typeof body?.area === 'string' && AREAS_VALIDAS.includes(body.area as typeof AREAS_VALIDAS[number]) ? body.area : 'Civil'
    const tema = typeof body?.tema === 'string' ? body.tema.trim() : ''
    const contexto = typeof body?.contexto === 'string' ? body.contexto.trim() : ''
    const tipoParecer = typeof body?.tipo_parecer === 'string' && TIPOS_VALIDOS.includes(body.tipo_parecer as typeof TIPOS_VALIDOS[number]) ? body.tipo_parecer : ''

    if (!tema || tema.length < 5) return NextResponse.json({ error: 'Informe o tema do parecer (minimo 5 caracteres).' }, { status: 400 })
    if (tema.length > 500) return NextResponse.json({ error: 'Tema muito longo (maximo 500 caracteres).' }, { status: 400 })
    if (!contexto || contexto.length < 20) return NextResponse.json({ error: 'Descreva o contexto com mais detalhes (minimo 20 caracteres).' }, { status: 400 })
    if (contexto.length > 5000) return NextResponse.json({ error: 'Contexto muito longo (maximo 5000 caracteres).' }, { status: 400 })

    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY })

    let userMessage = `Elabore um parecer juridico sobre o seguinte tema:\n\nAREA DO DIREITO: ${area}\nTEMA: ${tema}`
    if (tipoParecer) {
      userMessage += `\nTIPO DE PARECER: ${tipoParecer}`
    }
    userMessage += `\n\nCONTEXTO E FATOS RELEVANTES:\n${contexto}`
    userMessage += `\n\nRetorne o parecer completo no formato JSON especificado, com todas as secoes preenchidas de forma detalhada e fundamentada.`

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
      resultado = cleaned ? JSON.parse(cleaned) : { parecer: null, erro_parse: true }
    } catch {
      resultado = { parecer: null, erro_parse: true, raw: responseText }
    }

    if (usuarioId) {
      const { error: histErr } = await supabase.from('historico').insert({
        usuario_id: usuarioId,
        agente: 'simulado',
        mensagem_usuario: `Parecer: ${tema} (Direito ${area}${tipoParecer ? `, ${tipoParecer}` : ''})`,
        resposta_agente: `Parecer juridico sobre ${tema}`,
      })
      if (histErr) {
        console.error('[API /simulado] historico insert error:', histErr.message, histErr.code)
      }
    }

    events.agentUsed(user.id, 'simulado', plano).catch(() => {})

    return NextResponse.json({ parecer: resultado.parecer ?? null })
  } catch (err: unknown) {
    const errName = err instanceof Error ? err.name : 'Unknown'
    const errMsg = err instanceof Error ? err.message : String(err)
    const errStack = err instanceof Error ? err.stack?.split('\n').slice(0, 5).join(' | ') : undefined
    console.error('[API /simulado] unhandled:', errName, '-', errMsg, '|', errStack ?? '')

    const lower = errMsg.toLowerCase()
    if (errName === 'AbortError' || errName === 'TimeoutError' || lower.includes('timeout') || lower.includes('aborted')) {
      return NextResponse.json({ error: 'O servico de IA demorou muito para responder. Tente simplificar o contexto.' }, { status: 504 })
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

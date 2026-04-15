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
  'Financeiro', 'Saúde', 'Tecnologia', 'Varejo', 'Indústria', 'Serviços', 'Jurídico', 'Outro',
  'Saude', 'Industria', 'Servicos', 'Juridico',
] as const

const TIPOS_VALIDOS = [
  'Conformidade LGPD', 'Risco Anticorrupção', 'Compliance Setorial', 'Due Diligence',
  'Risco Anticorrupcao',
] as const

const SYSTEM_PROMPT = `Você é um especialista sênior em compliance e direito regulatório brasileiro com expertise em LGPD (Lei 13.709/2018), Lei Anticorrupção (Lei 12.846/2013) e compliance setorial.

Analise a operação descrita e forneça avaliação estruturada de risco. Responda APENAS com JSON válido:
{
  "exposicoes": "lista numerada das exposições regulatórias identificadas, uma por linha",
  "lgpd": "análise detalhada: base legal aplicável, direitos dos titulares afetados, transferência internacional se houver, necessidade de DPO",
  "anticorrupcao": "análise de risco Lei 12.846/2013: agentes públicos envolvidos, contratos públicos, conflito de interesse, red flags",
  "acoes": "lista numerada de ações corretivas prioritárias, ordenadas por urgência (imediato/30 dias/90 dias)",
  "score": "BAIXO ou MÉDIO ou ALTO ou CRÍTICO",
  "justificativa_score": "1-2 frases justificando o score atribuído",
  "confianca": 0.85
}`

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 })
    if (!ANTHROPIC_API_KEY) return NextResponse.json({ error: 'Servico de IA indisponivel.' }, { status: 503 })

    // Sliding-window rate limit (20 req/min per user per agent) — fails open
    const { checkRateLimit, rateLimitResponse } = await import('@/lib/rate-limit')
    const rl = await checkRateLimit(supabase, `user:${user.id}:compliance`)
    if (!rl.ok) return rateLimitResponse(rl)

    // Atomic quota check + charge via SECURITY DEFINER RPC
    const { data: chargeData, error: chargeErr } = await supabase
      .rpc('check_and_charge', { p_auth_user_id: user.id, p_agente: 'compliance' })

    if (chargeErr) {
      console.error('[API /compliance] check_and_charge rpc error:', chargeErr.message, chargeErr.code)
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
      console.error('[API /compliance] check_and_charge returned ok:false with unknown reason:', charge.reason)
      return NextResponse.json({ error: 'Erro ao validar quota.' }, { status: 500 })
    }

    const usuarioId = charge.usuario_id ?? null
    const plano = charge.plano ?? 'free'

    const body = await req.json().catch(() => ({}))
    const area = typeof body?.area === 'string' && AREAS_VALIDAS.includes(body.area as typeof AREAS_VALIDAS[number]) ? body.area : 'Tecnologia'
    const tipo = typeof body?.tipo === 'string' && TIPOS_VALIDOS.includes(body.tipo as typeof TIPOS_VALIDOS[number]) ? body.tipo : ''
    const descricao = typeof body?.descricao === 'string' ? body.descricao.trim() : ''

    if (!descricao || descricao.length < 20) return NextResponse.json({ error: 'Descreva a operacao com mais detalhes (minimo 20 caracteres).' }, { status: 400 })
    if (descricao.length > 5000) return NextResponse.json({ error: 'Descricao muito longa (maximo 5000 caracteres).' }, { status: 400 })

    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY })

    const userMessage = `Analise a seguinte operacao para fins de compliance regulatorio:\n\nAREA DE ATUACAO: ${area}${tipo ? `\nTIPO DE ANALISE: ${tipo}` : ''}\n\nDESCRICAO DA OPERACAO:\n${descricao}\n\nRetorne a analise completa no formato JSON especificado, com todas as secoes preenchidas de forma detalhada e fundamentada.`

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
      resultado = cleaned ? JSON.parse(cleaned) : { erro_parse: true }
    } catch {
      resultado = { erro_parse: true, raw: responseText }
    }

    if (usuarioId) {
      const { error: histErr } = await supabase.from('historico').insert({
        usuario_id: usuarioId,
        agente: 'compliance',
        mensagem_usuario: `Compliance ${tipo || 'geral'}: ${area} — ${descricao.slice(0, 80)}...`,
        resposta_agente: `Analise de compliance para operacao na area de ${area}`,
      })
      if (histErr) {
        console.error('[API /compliance] historico insert error:', histErr.message, histErr.code)
      }
    }

    events.agentUsed(user.id, 'compliance', plano).catch(() => {})

    return NextResponse.json({ parecer: resultado.erro_parse ? null : resultado })
  } catch (err: unknown) {
    const errName = err instanceof Error ? err.name : 'Unknown'
    const errMsg = err instanceof Error ? err.message : String(err)
    const errStack = err instanceof Error ? err.stack?.split('\n').slice(0, 5).join(' | ') : undefined
    console.error('[API /compliance] unhandled:', errName, '-', errMsg, '|', errStack ?? '')

    const lower = errMsg.toLowerCase()
    if (errName === 'AbortError' || errName === 'TimeoutError' || lower.includes('timeout') || lower.includes('aborted')) {
      return NextResponse.json({ error: 'O servico de IA demorou muito para responder. Tente simplificar a descricao.' }, { status: 504 })
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

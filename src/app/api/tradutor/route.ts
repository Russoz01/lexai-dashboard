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

const IDIOMAS_VALIDOS = ['Inglês (EN)', 'Espanhol (ES)', 'Francês (FR)', 'Português (PT)', 'Ingles', 'Espanhol', 'Frances', 'Portugues'] as const

const TIPOS_VALIDOS = [
  'Contrato internacional', 'Tratado', 'Procuracao', 'Decisao judicial estrangeira', 'Parecer', 'Outro',
] as const

const SYSTEM_PROMPT = `Você é um tradutor jurídico especializado com expertise em direito comparado e terminologia legal em português, inglês, espanhol e francês. Realize traduções técnicas preservando rigorosamente o sentido jurídico.

Responda APENAS com JSON válido:
{
  "traducao": "texto traduzido completo, preservando estrutura e numeração originais",
  "notas": "glossário de termos-chave: Termo Original → Tradução: justificativa da escolha terminológica. Um termo por linha.",
  "alertas": "conceitos do texto fonte sem equivalente direto no direito brasileiro e orientação de como devem ser interpretados. Se nenhum, responda: Nenhum alerta identificado.",
  "confianca": 0.9
}`

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 })
    if (!ANTHROPIC_API_KEY) return NextResponse.json({ error: 'Servico de IA indisponivel.' }, { status: 503 })

    // Sliding-window rate limit (20 req/min per user per agent) — fails open
    const { checkRateLimit, rateLimitResponse } = await import('@/lib/rate-limit')
    const rl = await checkRateLimit(supabase, `user:${user.id}:tradutor`)
    if (!rl.ok) return rateLimitResponse(rl)

    // Atomic quota check + charge via SECURITY DEFINER RPC
    const { data: chargeData, error: chargeErr } = await supabase
      .rpc('check_and_charge', { p_auth_user_id: user.id, p_agente: 'tradutor' })

    if (chargeErr) {
      console.error('[API /tradutor] check_and_charge rpc error:', chargeErr.message, chargeErr.code)
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
      console.error('[API /tradutor] check_and_charge returned ok:false with unknown reason:', charge.reason)
      return NextResponse.json({ error: 'Erro ao validar quota.' }, { status: 500 })
    }

    const usuarioId = charge.usuario_id ?? null
    const plano = charge.plano ?? 'free'

    const body = await req.json().catch(() => ({}))
    const origem = typeof body?.origem === 'string' && IDIOMAS_VALIDOS.includes(body.origem as typeof IDIOMAS_VALIDOS[number]) ? body.origem : 'Inglês (EN)'
    const destino = typeof body?.destino === 'string' && IDIOMAS_VALIDOS.includes(body.destino as typeof IDIOMAS_VALIDOS[number]) ? body.destino : 'Português (PT)'
    const tipo = typeof body?.tipo === 'string' && TIPOS_VALIDOS.includes(body.tipo as typeof TIPOS_VALIDOS[number]) ? body.tipo : 'Outro'
    const texto = typeof body?.texto === 'string' ? body.texto.trim() : ''

    if (!texto || texto.length < 10) return NextResponse.json({ error: 'Informe o texto a traduzir (minimo 10 caracteres).' }, { status: 400 })
    if (texto.length > 8000) return NextResponse.json({ error: 'Texto muito longo (maximo 8000 caracteres).' }, { status: 400 })

    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY })

    const userMessage = `Traduza o seguinte documento juridico:\n\nIDIOMA DE ORIGEM: ${origem}\nIDIOMA DE DESTINO: ${destino}\nTIPO DE DOCUMENTO: ${tipo}\n\nTEXTO A TRADUZIR:\n${texto}\n\nRetorne a traducao completa no formato JSON especificado, com glossario terminologico e alertas juridicos.`

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
        agente: 'tradutor',
        mensagem_usuario: `Traducao ${origem} → ${destino}: ${tipo} — ${texto.slice(0, 80)}...`,
        resposta_agente: `Traducao juridica de ${tipo} de ${origem} para ${destino}`,
      })
      if (histErr) {
        console.error('[API /tradutor] historico insert error:', histErr.message, histErr.code)
      }
    }

    events.agentUsed(user.id, 'tradutor', plano).catch(() => {})

    // API contract: response key é `traducao` (não `parecer`).
    // Antes era `parecer` por copy-paste inconsistente que confundia o front.
    return NextResponse.json({ traducao: resultado.erro_parse ? null : resultado })
  } catch (err: unknown) {
    const errName = err instanceof Error ? err.name : 'Unknown'
    const errMsg = err instanceof Error ? err.message : String(err)
    const errStack = err instanceof Error ? err.stack?.split('\n').slice(0, 5).join(' | ') : undefined
    console.error('[API /tradutor] unhandled:', errName, '-', errMsg, '|', errStack ?? '')

    const lower = errMsg.toLowerCase()
    if (errName === 'AbortError' || errName === 'TimeoutError' || lower.includes('timeout') || lower.includes('aborted')) {
      return NextResponse.json({ error: 'O servico de IA demorou muito para responder. Tente um texto menor.' }, { status: 504 })
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

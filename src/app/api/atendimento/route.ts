import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAndIncrementQuota } from '@/lib/quotas'
import { events } from '@/lib/analytics'
import { resolveUsuarioIdServer } from '@/lib/api-utils'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

const AREAS: Record<string, string> = {
  civel: 'Civel',
  familia: 'Familia e Sucessoes',
  trabalhista: 'Trabalhista',
  penal: 'Penal',
  tributario: 'Tributario',
  consumidor: 'Consumidor',
  empresarial: 'Empresarial',
  imobiliario: 'Imobiliario',
  previdenciario: 'Previdenciario',
  administrativo: 'Administrativo',
}

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

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 })
    if (!ANTHROPIC_API_KEY) return NextResponse.json({ error: 'Servico de IA indisponivel.' }, { status: 503 })

    const { checkRateLimit, rateLimitResponse } = await import('@/lib/rate-limit')
    const rl = await checkRateLimit(supabase, `user:${user.id}:atendimento`)
    if (!rl.ok) return rateLimitResponse(rl)

    const quota = await checkAndIncrementQuota(supabase, user.id, 'atendimento')
    if (!quota.ok && quota.response) return quota.response

    const body = await req.json().catch(() => ({}))
    const area = typeof body?.area === 'string' ? body.area : ''
    const perfil = typeof body?.perfil === 'string' ? body.perfil : ''

    if (!area || !AREAS[area]) {
      return NextResponse.json({ error: 'Area do caso invalida.' }, { status: 400 })
    }
    if (!perfil || perfil.trim().length < 20) {
      return NextResponse.json({ error: 'Descreva o perfil do cliente (minimo 20 caracteres).' }, { status: 400 })
    }
    if (perfil.length > 25000) {
      return NextResponse.json({ error: 'Texto excede o limite maximo de 25.000 caracteres.' }, { status: 400 })
    }

    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY })
    const userMessage = `Area do caso: ${AREAS[area]}\n\nPerfil do cliente e contexto inicial:\n${perfil}`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: [
        {
          type: 'text' as const,
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' as const },
        },
      ],
      messages: [{ role: 'user', content: userMessage }],
    })

    const textBlock = message.content.find(b => b.type === 'text')
    const responseText = textBlock && textBlock.type === 'text' ? textBlock.text.trim() : ''
    let parsed
    try {
      const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      parsed = JSON.parse(cleaned)
    } catch {
      parsed = { roteiro: { titulo: 'Entrevista inicial', perfil_cliente: responseText } }
    }
    const roteiro = parsed?.roteiro ?? parsed

    const usuarioId = await resolveUsuarioIdServer(supabase, user.id, user.email, user.user_metadata?.nome)
    if (usuarioId) {
      await supabase.from('historico').insert({
        usuario_id: usuarioId,
        agente: 'atendimento',
        mensagem_usuario: `Entrevista: ${AREAS[area]}`,
        resposta_agente: roteiro?.titulo || `Entrevista - ${AREAS[area]}`,
      })
    }

    events.agentUsed(user.id, 'atendimento', 'unknown').catch(() => {})
    return NextResponse.json({ roteiro })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    console.error('[API /atendimento]', msg)
    if (err instanceof Error && (msg.includes('529') || msg.toLowerCase().includes('overloaded'))) {
      return NextResponse.json({
        error: 'Agente temporariamente sobrecarregado. Aguarde 30 segundos e tente novamente.',
        retry: true,
      }, { status: 503 })
    }
    return NextResponse.json({
      error: 'Ocorreu um erro ao processar sua solicitacao. Tente novamente.',
      details: msg,
    }, { status: 500 })
  }
}

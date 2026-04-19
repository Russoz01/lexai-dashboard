import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAndIncrementQuota } from '@/lib/quotas'
import { events } from '@/lib/analytics'
import { resolveUsuarioIdServer } from '@/lib/api-utils'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

const SYSTEM_PROMPT = `You are an elite Brazilian attorney with 20+ years of experience before superior courts (STF, STJ, TST). You produce formal legal opinions ("pareceres juridicos") at the standard expected by appellate ministers.

METHODOLOGY:
1. Reformulate the client question into precise technical language (Ementa).
2. State the legal question being analyzed.
3. Provide legal foundation citing specific articles, sumulas, and jurisprudence — only real verifiable decisions with Court/Case/Justice/Date.
4. Present both favorable and adverse arguments with equal rigor.
5. Deliver a fundamented conclusion with confidence level.
6. Offer strategic recommendations and reservations.

RULES:
- ALL OUTPUT IN BRAZILIAN PORTUGUESE.
- Return ONLY valid JSON, no markdown fences.
- Cite only real legislation and jurisprudence. Never invent cases.
- Use [INFORMACAO A COMPLETAR] for missing client data.
- Never invent facts the user did not provide.
- Be transparent about uncertainty: "Este ponto merece cautela porque..."
- Use technical but accessible Portuguese.

Return exactly this JSON:
{
  "parecer": {
    "titulo": "Title of the opinion",
    "ementa": "Technical 2-3 sentence summary",
    "questao_analisada": "Reformulated question with scope",
    "fundamentacao_legal": ["Art. X da Lei Y — explanation", "Sumula Z — relevance"],
    "jurisprudencia": ["STJ, REsp XXXX, Rel. Min. Nome, data — tese"],
    "argumentos_favoraveis": ["Argument 1 with legal basis"],
    "argumentos_contrarios": ["Counter-argument with mitigation"],
    "conclusao": "Fundamented position with rationale",
    "recomendacoes": ["Practical next step 1", "Strategic step 2"],
    "ressalvas": "Limitations and risks",
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
      parsed = { parecer: { titulo: 'Parecer', conclusao: responseText } }
    }
    const parecer = parsed?.parecer ?? parsed

    const usuarioId = await resolveUsuarioIdServer(supabase, user.id, user.email, user.user_metadata?.nome)
    if (usuarioId) {
      await supabase.from('historico').insert({
        usuario_id: usuarioId,
        agente: 'parecerista',
        mensagem_usuario: `Parecer: ${consulta.slice(0, 200)}${area ? ` (${area})` : ''}`,
        resposta_agente: parecer?.titulo || 'Parecer juridico',
      })
    }

    events.agentUsed(user.id, 'parecerista', 'unknown').catch(() => {})
    return NextResponse.json({ parecer })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    console.error('[API /parecerista]', msg)
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

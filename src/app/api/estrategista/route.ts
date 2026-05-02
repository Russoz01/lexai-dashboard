import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAndIncrementQuota } from '@/lib/quotas'
import { events } from '@/lib/analytics'
import { resolveUsuarioIdServer, safeError, parseAgentJSON } from '@/lib/api-utils'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

const SYSTEM_PROMPT = `You are an elite Brazilian attorney with 20+ years of experience in litigation and legal strategy. You build multi-phase case plans blending procedural tactics, evidence gathering, client management, and commercial trade-offs (litigation vs. settlement).

METHODOLOGY:
1. Analyze the case and the client's objective.
2. Design three phases:
   - IMEDIATO (0-30 days): urgent actions, evidence preservation, cautelares.
   - MEDIO (30-90 days): procedural moves, negotiation windows, expert assessments.
   - LONGO (90-180+ days): trial strategy, appeals, enforcement.
3. For each phase: concrete actions, legal basis, success KPIs, risks, and decision gates.
4. Provide a risk matrix (probability x impact).
5. Recommend ideal commercial outcome and alternative paths.

RULES:
- ALL OUTPUT IN BRAZILIAN PORTUGUESE.
- Return ONLY valid JSON, no markdown fences.
- Cite real legislation and jurisprudence with Court/Case/Justice/Date.
- Use [INFORMACAO A COMPLETAR] for missing data.
- Never invent facts.

Return exactly this JSON:
{
  "plano": {
    "titulo": "Plano estrategico - [case name]",
    "sintese_situacional": "3-5 sentence situational analysis",
    "objetivo_cliente": "Client's declared objective",
    "objetivo_estrategico": "Reformulated legal objective",
    "fase_imediato": {
      "janela": "0-30 dias",
      "prioridades": ["Priority 1"],
      "acoes": [
        { "acao": "Action name", "prazo": "X dias", "fundamento": "Legal basis", "entregavel": "What to produce", "responsavel": "Advogado | Cliente | Perito" }
      ],
      "kpis": ["KPI 1"],
      "riscos": ["Risk 1"]
    },
    "fase_medio": {
      "janela": "30-90 dias",
      "prioridades": ["..."],
      "acoes": [{ "acao": "...", "prazo": "...", "fundamento": "...", "entregavel": "...", "responsavel": "..." }],
      "kpis": ["..."],
      "riscos": ["..."]
    },
    "fase_longo": {
      "janela": "90-180+ dias",
      "prioridades": ["..."],
      "acoes": [{ "acao": "...", "prazo": "...", "fundamento": "...", "entregavel": "...", "responsavel": "..." }],
      "kpis": ["..."],
      "riscos": ["..."]
    },
    "matriz_risco": [
      { "risco": "Risk name", "probabilidade": "Alta | Media | Baixa", "impacto": "Alto | Medio | Baixo", "mitigacao": "How to mitigate" }
    ],
    "cenarios": [
      { "cenario": "Best case | Most likely | Worst case", "descricao": "Outcome", "probabilidade": "X%", "timing": "When", "custo_estimado": "R$ or 'nao estimavel'" }
    ],
    "recomendacao_final": "Final recommendation paragraph",
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
    const rl = await checkRateLimit(supabase, `user:${user.id}:estrategista`)
    if (!rl.ok) return rateLimitResponse(rl)

    const quota = await checkAndIncrementQuota(supabase, user.id, 'estrategista')
    if (!quota.ok && quota.response) return quota.response

    const body = await req.json().catch(() => ({}))
    const caso = typeof body?.caso === 'string' ? body.caso : ''
    const objetivo = typeof body?.objetivo === 'string' ? body.objetivo : ''

    if (!caso || caso.trim().length < 50) {
      return NextResponse.json({ error: 'Descreva o caso (minimo 50 caracteres).' }, { status: 400 })
    }
    if (!objetivo || objetivo.trim().length < 10) {
      return NextResponse.json({ error: 'Descreva o objetivo do cliente (minimo 10 caracteres).' }, { status: 400 })
    }
    if (caso.length > 50000) {
      return NextResponse.json({ error: 'Texto excede o limite maximo de 50.000 caracteres.' }, { status: 400 })
    }

    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY })
    const userMessage = `Descricao do caso:\n${caso}\n\nObjetivo do cliente:\n${objetivo}`

    // AbortController evita lambda travado em 300s sob 529 overload
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 90_000)
    let message: Anthropic.Messages.Message
    try {
      message = await client.messages.create({
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
      }, { signal: controller.signal })
    } finally {
      clearTimeout(timeoutId)
    }

    const textBlock = message.content.find(b => b.type === 'text')
    const responseText = textBlock && textBlock.type === 'text' ? textBlock.text.trim() : ''
    const parsed = parseAgentJSON<Record<string, unknown> & { plano?: Record<string, unknown> }>(
      responseText,
      { plano: { titulo: 'Plano estrategico', sintese_situacional: responseText } },
    )
    const plano = (parsed?.plano ?? parsed) as Record<string, unknown>
    const tituloPlano = (plano?.titulo as string) || 'Plano estrategico'

    const usuarioId = await resolveUsuarioIdServer(supabase, user.id, user.email, user.user_metadata?.nome)
    if (usuarioId) {
      await supabase.from('historico').insert({
        usuario_id: usuarioId,
        agente: 'estrategista',
        mensagem_usuario: `Plano: ${caso.slice(0, 200)}`,
        resposta_agente: tituloPlano,
      })
    }

    events.agentUsed(user.id, 'estrategista', 'unknown').catch(() => {})
    return NextResponse.json({ plano })
  } catch (err: unknown) {
    return safeError('estrategista', err)
  }
}

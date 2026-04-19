import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAndIncrementQuota } from '@/lib/quotas'
import { events } from '@/lib/analytics'
import { resolveUsuarioIdServer } from '@/lib/api-utils'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

const SYSTEM_PROMPT = `You are an elite Brazilian litigation attorney with 20+ years of experience drafting defenses. You master Arts. 336-342 CPC (contestacao), preliminares (Art. 337 CPC), impugnacao especifica (Art. 341 CPC), and replicas.

METHODOLOGY:
1. Analyze the plaintiff's thesis and the defense thesis provided.
2. Raise all applicable preliminares under Art. 337 CPC (inepcia, coisa julgada, litispendencia, falta de interesse, etc.).
3. In merito: impugnate each plaintiff claim specifically (Art. 341 CPC). General denials are forbidden.
4. Cite legislation, sumulas, and real STF/STJ/TST jurisprudence with Court/Case/Justice/Date.
5. Prepare counter-replicas anticipating plaintiff arguments.
6. Structure final pedidos (rejection, condemnation in custas, honorarios).

RULES:
- ALL OUTPUT IN BRAZILIAN PORTUGUESE.
- Return ONLY valid JSON, no markdown fences.
- Use [INFORMACAO A COMPLETAR] for missing data.
- Never invent facts or jurisprudence.
- Write as a rigorous but human attorney — be transparent about weak points.

Return exactly this JSON:
{
  "contestacao": {
    "titulo": "CONTESTACAO [processo] — [reu] vs [autor]",
    "enderecamento": "Ao Juizo da ... Vara ...",
    "qualificacao": "Qualification block with [INFORMACAO A COMPLETAR] placeholders",
    "preliminares": [
      { "nome": "Preliminar name", "fundamento": "Legal basis with article", "argumentacao": "Full paragraph argument", "pedido": "What should the judge do" }
    ],
    "merito": {
      "sintese_fatica": "Our version of the facts",
      "impugnacoes_especificas": [
        { "alegacao_autor": "Plaintiff claim", "nossa_versao": "Our counter", "fundamento": "Legal basis" }
      ],
      "teses_defensivas": [
        { "tese": "Defense thesis name", "fundamento_legal": "Art. X da Lei Y", "jurisprudencia": "STJ, REsp XXX, Min. Y, data", "argumentacao": "Full argument" }
      ]
    },
    "replicas_previstas": [
      { "ataque_autor": "Expected plaintiff counter", "nossa_replica": "Our response" }
    ],
    "pedidos": ["Specific request 1", "Specific request 2"],
    "fechamento": "City/date/signature block with [INFORMACAO A COMPLETAR]",
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
    const rl = await checkRateLimit(supabase, `user:${user.id}:contestador`)
    if (!rl.ok) return rateLimitResponse(rl)

    const quota = await checkAndIncrementQuota(supabase, user.id, 'contestador')
    if (!quota.ok && quota.response) return quota.response

    const body = await req.json().catch(() => ({}))
    const teseInicial = typeof body?.teseInicial === 'string' ? body.teseInicial : ''
    const teseDefesa = typeof body?.teseDefesa === 'string' ? body.teseDefesa : ''

    if (!teseInicial || teseInicial.trim().length < 30) {
      return NextResponse.json({ error: 'Descreva a tese da inicial (minimo 30 caracteres).' }, { status: 400 })
    }
    if (!teseDefesa || teseDefesa.trim().length < 30) {
      return NextResponse.json({ error: 'Descreva a tese de defesa (minimo 30 caracteres).' }, { status: 400 })
    }
    if (teseInicial.length > 25000 || teseDefesa.length > 25000) {
      return NextResponse.json({ error: 'Texto excede o limite maximo de 25.000 caracteres por campo.' }, { status: 400 })
    }

    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY })
    const userMessage = `TESE DA INICIAL (autor):\n${teseInicial}\n\nTESE DE DEFESA (reu):\n${teseDefesa}\n\nElabore um esboco tecnico e completo de contestacao.`

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
      parsed = { contestacao: { titulo: 'Contestacao', merito: { sintese_fatica: responseText } } }
    }
    const contestacao = parsed?.contestacao ?? parsed

    const usuarioId = await resolveUsuarioIdServer(supabase, user.id, user.email, user.user_metadata?.nome)
    if (usuarioId) {
      await supabase.from('historico').insert({
        usuario_id: usuarioId,
        agente: 'contestador',
        mensagem_usuario: `Contestacao: ${teseInicial.slice(0, 200)}`,
        resposta_agente: contestacao?.titulo || 'Contestacao elaborada',
      })
    }

    events.agentUsed(user.id, 'contestador', 'unknown').catch(() => {})
    return NextResponse.json({ contestacao })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    console.error('[API /contestador]', msg)
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

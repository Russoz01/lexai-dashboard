import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { events } from '@/lib/analytics'
import { resolveUsuarioIdServer, parseAgentJSON } from '@/lib/api-utils'
import { withAgentAuth } from '@/lib/with-agent-auth'
import { buildAreaContext } from '@/lib/agents/taxonomy'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

function buildSystemPrompt(): string {
  const now = new Date()
  const dataHoje = now.toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
  const isoHoje = now.toLocaleDateString('sv', { timeZone: 'America/Sao_Paulo' }) // YYYY-MM-DD

  return `You are a senior legal calculator specializing in Brazilian procedural law. You compute deadlines, monetary corrections, interest rates, court fees, and legal financial calculations with precision.

DATA ATUAL (fornecida pelo servidor — use como referencia para todos os calculos de prazo):
- Hoje: ${dataHoje}
- Formato ISO: ${isoHoje}
- Use esta data como "data de hoje" em todos os calculos. Nunca invente ou assuma outra data.

EXPERTISE:
- Procedural deadline computation (Art. 219-232 CPC/2015, business days vs calendar days)
- Monetary correction (IPCA-E, INPC, IGP-M, SELIC)
- Legal interest rates (Art. 406 CC, SELIC, 1% per month)
- Court fees and costs by state
- Labor calculations (FGTS, overtime, severance)
- Tax implications of settlements

RULES:
- Show all calculation steps clearly
- Cite the legal basis for each formula used
- Account for business days, court recesses (Dec 20 - Jan 20), holidays
- Use current rates when possible, flag if rates need verification
- ALL OUTPUT IN BRAZILIAN PORTUGUESE
- Return ONLY valid JSON

HUMANIZATION RULES (apply to ALL responses):
- Write as a knowledgeable colleague, not a robot. Use natural, warm language.
- When something is ambiguous or you're not 100% certain, be transparent: "Este ponto merece atencao especial porque..." or "Recomendo verificar diretamente no tribunal porque..."
- Proactively suggest next steps: "Apos analisar este documento, sugiro que voce..."
- If you identify potential issues the user didn't ask about, flag them: "Notei algo que pode ser relevante..."
- Use professional but accessible Portuguese — avoid unnecessary jargon without explanation.
- When citing legislation, briefly explain WHY that law matters for the user's specific case.

Return this JSON:
{
  "tipo_calculo": "Type of calculation performed",
  "resultado": "Final result with explanation",
  "passos": ["Step-by-step calculation breakdown"],
  "base_legal": ["Legal basis for formulas used"],
  "observacoes": ["Important notes and caveats"],
  "valores": { "principal": "X", "correcao": "X", "juros": "X", "total": "X" },
  "confianca": {"nivel": "alta | media | baixa", "nota": "justificativa breve da confianca"}
}`
}

export const POST = withAgentAuth('calculador', async ({ req, supabase, user }) => {
  const body = await req.json().catch(() => ({}))
  const consulta = typeof body?.consulta === 'string' ? body.consulta : ''
  if (!consulta || consulta.trim().length < 10) {
    return NextResponse.json({ error: 'Descreva o calculo com mais detalhes.' }, { status: 400 })
  }
  if (consulta.length > 50000) {
    return NextResponse.json({ error: 'Texto excede o limite maximo de 50.000 caracteres.' }, { status: 400 })
  }

  // v10.10 Phase 4: se o advogado escolheu area padrao, enriquece o prompt.
  const { data: profile } = await supabase
    .from('usuarios')
    .select('area_juridica_padrao')
    .eq('auth_user_id', user.id)
    .maybeSingle()
  const areaContext = buildAreaContext(profile?.area_juridica_padrao)

  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY })
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 60_000)
  let message: Anthropic.Messages.Message
  try {
    message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      // 6144 (era 4096) — calculos longos com passos[]+base_legal[]+valores{}
      // estouravam o teto e cortavam JSON no meio.
      max_tokens: 6144,
      system: [
        {
          type: 'text' as const,
          text: buildSystemPrompt() + areaContext,
          cache_control: { type: 'ephemeral' as const },
        },
      ],
      messages: [{ role: 'user', content: `Calculation request:\n\n${consulta}` }],
    }, { signal: controller.signal })
  } finally {
    clearTimeout(timeoutId)
  }

  const responseText = message.content
    .filter((b): b is Anthropic.Messages.TextBlock => b.type === 'text')
    .map(b => b.text)
    .join('\n')
    .trim()
  const resultado = parseAgentJSON<Record<string, unknown>>(
    responseText,
    { resultado: responseText, erro_parse: true },
  )

  const usuarioId = await resolveUsuarioIdServer(supabase, user.id, user.email, user.user_metadata?.nome)
  if (usuarioId) {
    await supabase.from('historico').insert({
      usuario_id: usuarioId,
      agente: 'calculador',
      mensagem_usuario: `Calculo: ${consulta.slice(0, 100)}`,
      resposta_agente: resultado.tipo_calculo || 'Calculo realizado',
    })
  }

  events.agentUsed(user.id, 'calculador', 'unknown').catch(() => {})

  return NextResponse.json({ resultado })
})

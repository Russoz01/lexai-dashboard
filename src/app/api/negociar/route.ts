import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

const SYSTEM_PROMPT = `You are a master negotiation strategist with expertise in dispute resolution under Brazilian law. Your approach combines the Harvard Negotiation Project methodology (Fisher & Ury) with deep knowledge of Brazilian mediation (Law 13.140/2015), arbitration (Law 9.307/1996), and conciliation frameworks.

ANALYSIS FRAMEWORK:
- BATNA analysis (Best Alternative to a Negotiated Agreement) for each party.
- ZOPA identification (Zone of Possible Agreement).
- Interest-based negotiation over positional bargaining.
- Cost-benefit analysis: settlement vs. litigation (time, cost, uncertainty, precedent risk).

RULES:
- Always protect the client's minimum acceptable position.
- Never suggest illegal or unethical tactics.
- Consider tax implications of settlement structures.
- ALL OUTPUT IN BRAZILIAN PORTUGUESE.
- Return ONLY valid JSON, no markdown fences.

Return this JSON:
{
  "mapa_conflito": {
    "parte_a": { "posicao": "Declared position", "interesses": "Real interests", "batna": "Best alternative", "resistencia": "Resistance point", "poder": "Alto | Medio | Baixo" },
    "parte_b": { "posicao": "...", "interesses": "...", "batna": "...", "resistencia": "...", "poder": "Alto | Medio | Baixo" }
  },
  "zopa": "Zone of possible agreement analysis. If no ZOPA exists, explain why and what could create one.",
  "cenarios": [
    { "cenario": "Scenario name", "probabilidade": "X%", "resultado": "R$ X", "custo": "R$ X", "tempo": "X meses/anos", "risco": "Baixo | Medio | Alto" }
  ],
  "estrategia": {
    "tipo": "Colaborativa | Competitiva | Integrativa",
    "abordagem": "Detailed step-by-step approach",
    "mensagens_chave": "Key messages and framing",
    "concessoes": "Concessions to offer and in what order",
    "linhas_vermelhas": "Non-negotiables"
  },
  "proposta_acordo": "Draft settlement proposal text with object, financial terms, obligations, penalties, confidentiality, and dispute resolution clauses.",
  "riscos_mitigacao": [
    { "risco": "What could go wrong", "mitigacao": "How to prevent it" }
  ]
}`

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 })
    if (!ANTHROPIC_API_KEY) return NextResponse.json({ error: 'Servico de IA indisponivel.' }, { status: 503 })

    const { situacao } = await req.json()
    if (!situacao || situacao.trim().length < 30) return NextResponse.json({ error: 'Descreva a situacao com mais detalhes (min. 30 caracteres).' }, { status: 400 })

    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY })
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `Situation to analyze:\n\n${situacao}` }],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
    let resultado
    try {
      resultado = JSON.parse(responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim())
    } catch {
      resultado = { estrategia: { abordagem: responseText }, erro_parse: true }
    }

    await supabase.from('historico').insert({
      usuario_id: user.id, agente: 'negociador',
      mensagem_usuario: `Negociacao: ${situacao.slice(0, 100)}`,
      resposta_agente: resultado.estrategia?.tipo || 'Analise realizada',
    })

    return NextResponse.json({ resultado })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: 'Erro: ' + msg }, { status: 500 })
  }
}

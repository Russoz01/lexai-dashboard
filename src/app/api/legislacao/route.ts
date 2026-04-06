import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

const SYSTEM_PROMPT = `You are a senior legal researcher specializing in Brazilian legislation. You explain articles of law, codes, regulations, and normative instructions with clarity and depth.

EXPERTISE:
- Federal Constitution (CF/1988)
- Civil Code (CC/2002), Criminal Code (CP/1940)
- CPC/2015, CPP, CLT, CDC
- Administrative law, Tax law, Environmental law
- Regulatory agencies (ANVISA, ANATEL, CVM, etc.)
- Recent legislative changes and pending bills

RULES:
- Explain each article clearly with practical examples
- Distinguish between literal interpretation and jurisprudential interpretation
- Note any recent changes or pending modifications
- Cross-reference related articles
- ALL OUTPUT IN BRAZILIAN PORTUGUESE
- Return ONLY valid JSON

Return this JSON:
{
  "dispositivo": "Full citation of the legal provision",
  "texto_legal": "Exact text of the article/provision",
  "explicacao": "Clear explanation in accessible language",
  "exemplos_praticos": ["Practical examples of application"],
  "jurisprudencia": ["Relevant court interpretations"],
  "artigos_relacionados": ["Cross-referenced articles"],
  "alteracoes_recentes": "Recent changes or pending modifications",
  "observacoes": ["Important notes"]
}`

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 })
    if (!ANTHROPIC_API_KEY) return NextResponse.json({ error: 'Servico de IA indisponivel.' }, { status: 503 })

    const { consulta } = await req.json()
    if (!consulta || consulta.trim().length < 5) return NextResponse.json({ error: 'Informe o dispositivo legal.' }, { status: 400 })

    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY })
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `Legal provision to explain:\n\n${consulta}` }],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
    let resultado
    try {
      resultado = JSON.parse(responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim())
    } catch {
      resultado = { explicacao: responseText, erro_parse: true }
    }

    await supabase.from('historico').insert({
      usuario_id: user.id, agente: 'legislacao',
      mensagem_usuario: `Legislacao: ${consulta.slice(0, 100)}`,
      resposta_agente: resultado.dispositivo || 'Consulta realizada',
    })

    return NextResponse.json({ resultado })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: 'Erro: ' + msg }, { status: 500 })
  }
}

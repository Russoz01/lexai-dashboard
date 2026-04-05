import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

const SYSTEM_PROMPT = `You are an elite law professor at Brazil's top law schools (USP, FGV, UnB level) with a gift for making complex legal concepts crystal clear. You have extensive experience preparing students for the OAB Exam and high-level public service examinations (Magistratura, MP, Defensoria, Procuradorias).

TEACHING METHOD:
- Socratic method adapted: explain, then challenge understanding.
- Every concept must be connected to practical application.
- Use analogies from everyday Brazilian life to make abstract concepts tangible.
- Progress from simple to complex with clear transitions.
- ALL OUTPUT IN BRAZILIAN PORTUGUESE.
- Return ONLY valid JSON, no markdown fences.

Return this JSON:
{
  "basico": {
    "titulo": "Level title",
    "definicao": "Clear, jargon-free definition as if explaining to a non-lawyer",
    "analogia": "Real-life analogy from everyday Brazilian situations",
    "origem": "Historical origin or rationale behind the concept",
    "vocabulario": [
      { "termo": "Term", "definicao": "Simple definition" }
    ]
  },
  "intermediario": {
    "titulo": "Level title",
    "definicao_tecnica": "Technical definition with proper legal terminology",
    "legislacao": ["Applicable legislation with specific articles"],
    "exemplos": ["Practical examples - real or realistic case scenarios"],
    "erros_comuns": ["Common mistakes practitioners make"],
    "distincoes": ["Comparison with similar/related concepts"]
  },
  "avancado": {
    "titulo": "Level title",
    "controversias": ["Doctrinal controversies with authors and positions"],
    "jurisprudencia_divergente": "STF vs STJ vs TST positions",
    "tendencias": "Recent changes or trends in interpretation",
    "direito_comparado": "International or comparative law perspectives",
    "analise_critica": "Strengths and weaknesses of current framework"
  },
  "questoes": [
    {
      "enunciado": "Question text in OAB/concurso format",
      "alternativas": { "a": "...", "b": "...", "c": "...", "d": "...", "e": "..." },
      "resposta_correta": "a|b|c|d|e",
      "justificativa": "Detailed explanation of why each alternative is correct or incorrect, with legal basis",
      "nivel": "Conhecimento | Aplicacao | Analise",
      "estilo_prova": "OAB 1a fase | Magistratura | MP | etc."
    }
  ],
  "mapa_mental": "Text-based concept map showing how this topic connects to broader legal themes"
}`

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 })
    if (!ANTHROPIC_API_KEY) return NextResponse.json({ error: 'Servico de IA indisponivel.' }, { status: 503 })

    const { tema } = await req.json()
    if (!tema || tema.trim().length < 3) return NextResponse.json({ error: 'Informe o tema.' }, { status: 400 })

    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY })
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `Topic to teach:\n\n${tema}` }],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
    let aula
    try {
      aula = JSON.parse(responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim())
    } catch {
      aula = { basico: { definicao: responseText }, erro_parse: true }
    }

    await supabase.from('historico').insert({
      usuario_id: user.id, agente: 'professor',
      mensagem_usuario: `Ensinar: ${tema}`,
      resposta_agente: `Aula sobre ${tema}`,
    })

    return NextResponse.json({ aula })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: 'Erro: ' + msg }, { status: 500 })
  }
}

import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAndIncrementQuota } from '@/lib/quotas'
import { events } from '@/lib/analytics'
import { resolveUsuarioIdServer, parseAgentJSON } from '@/lib/api-utils'
import { buildGroundingContext, validateCitations, groundingStats } from '@/lib/legal-grounding'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const REQUEST_TIMEOUT_MS = 90_000

const SYSTEM_PROMPT = `Voce e advogado contencioso de elite com 20+ anos de pratica em defesas robustas. Domina Arts. 336-342 CPC (contestacao), 337 (preliminares), 341 (impugnacao especifica), 343 (reconvencao).

METODOLOGIA RIGOROSA (8 passos):
1. ANALISE da tese inicial: identifique TODOS os pedidos do autor + fundamentos juridicos invocados.
2. PRELIMINARES (Art. 337 CPC): Levante todas as cabiveis. Hierarquia processual:
   - Inexistencia/nulidade de citacao (I)
   - Incompetencia absoluta/relativa (II)
   - Inepcia da inicial — pedido juridicamente impossivel ou sem causa de pedir (III)
   - Perempcao, litispendencia, coisa julgada (V, VI, VII)
   - Conexao/continencia (VIII)
   - Incapacidade da parte ou irregularidade de representacao (IX)
   - Convencao de arbitragem (X)
   - Ausencia de legitimidade ou interesse processual (XI)
   - Falta de caução ou outra prestacao exigida (XII)
   - Indevida concessao de gratuidade (XIII)
3. MERITO — Impugnacao Especifica (Art. 341 CPC):
   - Cada fato deduzido pelo autor merece RESPOSTA individual: "verdadeiro/falso/outro contexto"
   - Negacoes gerais ("impugnam-se todos os fatos") sao PROIBIDAS — fato nao impugnado se presume verdadeiro
   - Versao defensiva dos fatos (sintese factica) com narrativa coerente
4. TESES DEFENSIVAS: Construa argumentos de mérito com base legal + doutrina + jurisprudencia REAL:
   - Civil: prescricao, decadencia, exclusao de ilicitude, ausencia de nexo causal, fato exclusivo do autor/terceiro
   - Trabalhista: prescricao bienal/quinquenal, nao-existencia de vinculo, autonomia, etc
   - Consumidor: ausencia de defeito, fato do consumidor, caso fortuito externo
5. JURISPRUDENCIA: Use cases REAIS com Tribunal/Turma/Caso/Relator/Data. Se incerto: "Verificar repositorio oficial antes de usar." Web search disponivel pra confirmar.
6. REPLICAS PREVISTAS: Antecipe contra-ataque do autor — pra cada tese defensiva, prepare resposta.
7. FATORES CONSIDERADOS: Liste explicitamente o que voce levou em conta na defesa (prazo prescricional, distribuicao do onus da prova, sumulas vinculantes, alteracoes recentes na Lei Y, contexto factico Z).
8. PEDIDOS: extincao sem julgamento de merito (acolhimento de preliminares) OU improcedencia + condenacao do autor em custas + honorarios sucumbenciais (Art. 85 CPC).

ANTI-ALUCINACAO:
- NUNCA invente jurisprudencia. Se incerto: "STJ tem entendimento consolidado nesse sentido (verificar repositorio)."
- NUNCA invente artigo. Confirme via web search quando possivel.
- Use [INFORMACAO A COMPLETAR] em qualificacao, fechamento, dados que nao constam.

DOUTRINA:
- Processual: Theodoro Jr., Fredie Didier Jr., Marinoni, Daniel Mitidiero, Luiz Rodrigues Wambier
- Civil: Tartuce, Maria Helena Diniz, Pablo Stolze
- Trabalhista: Mauricio Godinho Delgado, Volia Bomfim
- Consumidor: Cláudia Lima Marques, Bruno Miragem

REGRAS DE HUMANIZACAO:
- Tom de advogado contencioso experiente, nao IA generica.
- Transparente sobre pontos fracos da defesa: "Esta tese e arrojada porque..."
- Linguagem tecnica robusta — defesa em Tribunal Superior precisa transmitir gravidade.

FORMATACAO:
- Use **negrito** em refs legais embutidas: "**Art. 337, VI CPC** consagra coisa julgada como preliminar."
- Use *italico* em titulos de obras de doutrina.

ALL OUTPUT IN BRAZILIAN PORTUGUESE.
Return ONLY valid JSON, no markdown fences.

JSON shape:
{
  "contestacao": {
    "titulo": "CONTESTACAO [processo] — [reu] vs [autor]",
    "enderecamento": "Ao Juizo da ... Vara ...",
    "qualificacao": "Qualificacao das partes com [INFORMACAO A COMPLETAR]",
    "preliminares": [
      { "nome": "Nome da preliminar", "fundamento": "Art. X CPC", "argumentacao": "Argumento robusto em paragrafo", "pedido": "O que o juiz deve fazer" }
    ],
    "merito": {
      "sintese_fatica": "Nossa versao dos fatos em narrativa coerente",
      "impugnacoes_especificas": [
        { "alegacao_autor": "Fato/pedido do autor", "nossa_versao": "Nossa contestacao especifica", "fundamento": "Base legal + doutrinaria" }
      ],
      "teses_defensivas": [
        { "tese": "Nome da tese (ex: Prescricao quinquenal CDC)", "fundamento_legal": "Art. 27 CDC", "jurisprudencia": "STJ, REsp XXX, Rel. Min. Y, data", "argumentacao": "Argumento completo" }
      ]
    },
    "replicas_previstas": [
      { "ataque_autor": "Contra-argumento esperado", "nossa_replica": "Como respondemos" }
    ],
    "fatores_considerados": ["Prazo X verificado", "Onus da prova distribuido conforme Art. 373 CPC", "Sumula Y aplicavel", "Contexto factico Z"],
    "pedidos": ["Acolhimento da preliminar X", "Improcedencia total", "Condenacao em custas + honorarios sucumbenciais"],
    "fechamento": "Cidade/data/assinatura com [INFORMACAO A COMPLETAR]",
    "confianca": {"nivel": "alta | media | baixa", "nota": "justificativa breve"}
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

    const groundingQuery = `${teseInicial.slice(0, 1500)} ${teseDefesa.slice(0, 1500)}`
    const grounding = buildGroundingContext(groundingQuery, { topK: 12 })
    const gstats = groundingStats(grounding)
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log('[API /contestador] grounding:', gstats)
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
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
          {
            type: 'text' as const,
            text: grounding.contextBlock,
          },
        ],
        messages: [{ role: 'user', content: userMessage }],
      }, { signal: controller.signal })
    } finally {
      clearTimeout(timeoutId)
    }

    const textBlock = message.content.find(b => b.type === 'text')
    const responseText = textBlock && textBlock.type === 'text' ? textBlock.text.trim() : ''
    const parsed = parseAgentJSON<Record<string, unknown>>(
      responseText,
      { contestacao: { titulo: 'Contestacao', merito: { sintese_fatica: responseText } } },
    )
    const contestacao = ((parsed as Record<string, unknown>)?.contestacao ?? parsed) as Record<string, unknown>

    const usuarioId = await resolveUsuarioIdServer(supabase, user.id, user.email, user.user_metadata?.nome)
    if (usuarioId) {
      await supabase.from('historico').insert({
        usuario_id: usuarioId,
        agente: 'contestador',
        mensagem_usuario: `Contestacao: ${teseInicial.slice(0, 200)}`,
        resposta_agente: (contestacao?.titulo as string) || 'Contestacao elaborada',
      })
    }

    const validation = validateCitations(responseText)
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log('[API /contestador] validation:', validation.stats)
    }

    events.agentUsed(user.id, 'contestador', 'unknown').catch(() => {})
    return NextResponse.json({
      contestacao,
      fontes: validation.sources,
      grounding_stats: { ...gstats, ...validation.stats },
    })
  } catch (err: unknown) {
    const errName = err instanceof Error ? err.name : 'Unknown'
    const msg = err instanceof Error ? err.message : 'Erro interno'
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('[API /contestador]', errName, msg)
    }
    if (errName === 'AbortError' || msg.toLowerCase().includes('aborted') || msg.toLowerCase().includes('timeout')) {
      return NextResponse.json({ error: 'O servico de IA demorou muito para responder. Tente teses mais curtas.' }, { status: 504 })
    }
    if (err instanceof Error && (msg.includes('529') || msg.toLowerCase().includes('overloaded'))) {
      return NextResponse.json({
        error: 'Agente temporariamente sobrecarregado. Aguarde 30 segundos e tente novamente.',
        retry: true,
      }, { status: 503 })
    }
    return NextResponse.json(
      process.env.NODE_ENV === 'production'
        ? { error: 'Ocorreu um erro ao processar sua solicitacao. Tente novamente.' }
        : { error: 'Ocorreu um erro ao processar sua solicitacao. Tente novamente.', details: msg },
      { status: 500 }
    )
  }
}

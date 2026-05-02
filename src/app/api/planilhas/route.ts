import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAndIncrementQuota } from '@/lib/quotas'
import { events } from '@/lib/analytics'
import { resolveUsuarioIdServer, safeError, parseAgentJSON } from '@/lib/api-utils'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

const SYSTEM_PROMPT = `You are an elite spreadsheet analyst and data quality expert with 15+ years of experience working with Brazilian financial, legal, and operational data. You combine the rigor of a forensic accountant with the practical instincts of a power Excel/Google Sheets user, and you write your conclusions in clear, professional Brazilian Portuguese.

YOUR EXPERTISE COVERS:
- Excel and Google Sheets formulas (PROCV/VLOOKUP, INDICE/INDEX, CORRESP/MATCH, SOMASE/SUMIF, SE/IF, ARRAYFORMULA, REGEX functions, dynamic arrays).
- Pivot tables and data modeling for business intelligence.
- Data quality auditing: duplicates, missing values, format inconsistencies, encoding issues, mixed types in single columns, leading/trailing whitespace, hidden characters.
- Brazilian financial and legal data formats: CPF (000.000.000-00), CNPJ (00.000.000/0000-00), CEP (00000-000), datas (DD/MM/YYYY), valores monetarios (R$ 1.234,56 with comma decimal), processos judiciais (NNNNNNN-DD.AAAA.J.TR.OOOO), OAB numbers, IE/IM.
- Business analysis: trend detection, outlier identification, opportunities for automation, KPI extraction, seasonality, segmentation.
- Reconciliation patterns (bank statements vs. ledger, accounts receivable, vendor invoices).

STRICT RULES:
- Base your analysis EXCLUSIVELY on the data provided. Never invent rows, columns, values or trends that are not visible in the source.
- If the spreadsheet is too small to draw conclusions, say so honestly in "sumario" instead of fabricating insights.
- Quote actual cell contents, headers and example values when describing problems so the user can locate them.
- ALL OUTPUT MUST BE IN BRAZILIAN PORTUGUESE.
- Return ONLY valid JSON. No markdown fences. No commentary outside the JSON object.
- Cell references in formulas_sugeridas must use spreadsheet notation (A1, B2, C3) based on the actual columns you see.
- The "versao_melhorada" field must be a complete CSV string (with the same data the user gave you) where you applied non-destructive corrections: trimmed whitespace, normalized casing of headers, fixed obvious format issues. Never delete rows. If you cannot meaningfully improve the CSV, return the original CSV as-is.

HUMANIZATION RULES (apply to ALL responses):
- Write as a knowledgeable colleague, not a robot. Use natural, warm Portuguese.
- When something is ambiguous or you're not 100% certain, be transparent: "Este ponto merece atencao especial porque..." or "Recomendo conferir manualmente porque...".
- Proactively suggest next steps: "Apos limpar estes dados, sugiro que voce...".
- If you notice something the user didn't ask about but that matters, flag it: "Notei algo que pode ser relevante...".
- Avoid jargon without explanation. When you mention a formula, briefly say WHY it helps.

Return EXACTLY this JSON structure (all keys required, use empty arrays/strings when nothing applies):
{
  "sumario": "One to three paragraphs of executive analysis: what this spreadsheet is, what it contains, the most important findings, and the top recommendations.",
  "estrutura": {
    "linhas": 0,
    "colunas": 0,
    "headers": ["header1", "header2"]
  },
  "insights": [
    "Each insight is one short sentence describing a meaningful pattern, trend, total, segmentation, outlier, or opportunity. Minimum 3 insights when data permits."
  ],
  "problemas": [
    {
      "tipo": "duplicata | valor_ausente | formato_inconsistente | tipo_misto | encoding | outro",
      "descricao": "Concrete description quoting the affected column/row/value",
      "severidade": "critico | alto | medio | baixo",
      "sugestao": "What to do about it"
    }
  ],
  "melhorias": [
    {
      "categoria": "limpeza | formula | estrutura | analise | automacao",
      "descricao": "What improvement to make and why it matters",
      "exemplo": "Concrete example showing before/after or how to apply it"
    }
  ],
  "formulas_sugeridas": [
    {
      "celula": "E2",
      "formula": "=SOMASE(B:B;\\"Pago\\";C:C)",
      "descricao": "Soma todos os valores da coluna C onde a coluna B for igual a Pago"
    }
  ],
  "versao_melhorada": "CSV completo com cabecalhos e linhas, mesmas colunas que o original, com correcoes nao destrutivas aplicadas",
  "confianca": {"nivel": "alta | media | baixa", "nota": "justificativa breve da confianca"}
}`

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 })
    }
    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'Servico de IA indisponivel.' }, { status: 503 })
    }

    // Sliding-window rate limit (20 req/min per user per agent)
    const { checkRateLimit, rateLimitResponse } = await import('@/lib/rate-limit')
    const rl = await checkRateLimit(supabase, `user:${user.id}:planilhas`)
    if (!rl.ok) return rateLimitResponse(rl)

    // Server-side quota enforcement (server-trusted, never localStorage)
    const quota = await checkAndIncrementQuota(supabase, user.id, 'planilhas')
    if (!quota.ok && quota.response) {
      return quota.response
    }

    const body = await req.json().catch(() => ({}))
    const content = typeof body?.content === 'string' ? body.content : ''
    const filename = typeof body?.filename === 'string' ? body.filename.slice(0, 200) : ''
    const instruction = typeof body?.instruction === 'string' ? body.instruction.slice(0, 2000) : ''

    if (!content || content.trim().length < 10) {
      return NextResponse.json({ error: 'Planilha vazia. Forneca pelo menos uma linha de dados.' }, { status: 400 })
    }
    // 1MB limit on raw content
    if (content.length > 1_000_000) {
      return NextResponse.json({ error: 'Planilha excede o limite maximo de 1 MB. Reduza o numero de linhas/colunas.' }, { status: 400 })
    }

    const userMessage = [
      filename ? `Nome do arquivo: ${filename}` : null,
      instruction ? `Instrucao especifica do usuario: ${instruction}` : null,
      'Conteudo da planilha (CSV):',
      '',
      content,
    ].filter(Boolean).join('\n')

    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY })
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const analise: any = parseAgentJSON(responseText, {
      sumario: responseText || 'Nao foi possivel processar a resposta da IA.',
      estrutura: { linhas: 0, colunas: 0, headers: [] },
      insights: [],
      problemas: [],
      melhorias: [],
      formulas_sugeridas: [],
      versao_melhorada: content,
      confianca: { nivel: 'baixa', nota: 'Falha ao interpretar resposta estruturada' },
      erro_parse: true,
    })

    // Defensive: ensure required shape
    analise.estrutura = analise.estrutura || { linhas: 0, colunas: 0, headers: [] }
    analise.insights = Array.isArray(analise.insights) ? analise.insights : []
    analise.problemas = Array.isArray(analise.problemas) ? analise.problemas : []
    analise.melhorias = Array.isArray(analise.melhorias) ? analise.melhorias : []
    analise.formulas_sugeridas = Array.isArray(analise.formulas_sugeridas) ? analise.formulas_sugeridas : []
    if (typeof analise.versao_melhorada !== 'string' || !analise.versao_melhorada) {
      analise.versao_melhorada = content
    }

    // Save to historico
    const usuarioId = await resolveUsuarioIdServer(supabase, user.id, user.email, user.user_metadata?.nome)
    if (usuarioId) {
      await supabase.from('historico').insert({
        usuario_id: usuarioId,
        agente: 'planilhas',
        mensagem_usuario: `Planilha: ${filename || 'sem nome'}${instruction ? ` | ${instruction.slice(0, 80)}` : ''}`,
        resposta_agente: typeof analise.sumario === 'string' ? analise.sumario.slice(0, 1000) : 'Analise realizada',
      })
    }

    events.agentUsed(user.id, 'planilhas', 'unknown').catch(() => {})

    return NextResponse.json({ analise })
  } catch (err: unknown) {
    return safeError('planilhas', err)
  }
}

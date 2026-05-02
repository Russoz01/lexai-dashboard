import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAndIncrementQuota } from '@/lib/quotas'
import { events } from '@/lib/analytics'
import { resolveUsuarioIdServer, parseAgentJSON } from '@/lib/api-utils'
import { getDemoFallback, isDemoFallbackEnabled, isRetryableError } from '@/lib/demo-fallback'
import { buildGroundingContext, validateCitations, groundingStats } from '@/lib/legal-grounding'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const REQUEST_TIMEOUT_MS = 90_000

/* ════════════════════════════════════════════════════════════════
 * /api/risco — Score 0-100 de risco jurídico em documentos contratuais
 * ────────────────────────────────────────────────────────────────
 * Subset focado da pipeline do Revisor: em vez de listar TODOS os
 * issues, devolve um score executivo + top 3 pontos de atenção com
 * peso explícito + probabilidade estimada de sucesso em contencioso.
 *
 * Pensado pra reunião com cliente: "vale fechar?" → 30 segundos →
 * score + recomendação. Disclaimer firme ("a IA erra, decisão final
 * é do advogado") embutido na resposta.
 *
 * Grounding: corpus local (CC, CDC, CPC, CF/88) pra ancorar fundamentos.
 * ════════════════════════════════════════════════════════════════ */

const SYSTEM_PROMPT = `Você é um advogado brasileiro sênior especializado em análise executiva de risco contratual. Você não escreve pareceres longos — entrega leitura objetiva pra reunião com cliente em 30 segundos.

METODOLOGIA:
1. Leia o documento completo identificando cláusulas problemáticas.
2. Atribua peso explícito (0-30 pts) a cada ponto de atenção identificado.
3. Some os pesos pra calcular score global de risco (0-100, onde 0=sem risco, 100=crítico).
4. Selecione os TOP 3 pontos mais relevantes — não 40 itens genéricos. Apenas os 3 que mudariam a posição jurídica do cliente.
5. Pra cada ponto: trecho exato + problema + fundamento legal + sugestão concreta.
6. Estime probabilidade de sucesso em eventual contencioso baseado em jurisprudência majoritária.
7. Compare com padrão de mercado quando aplicável (ex: "multa 3x acima do padrão B2B").
8. Conclua com recomendação executiva.

REGRAS:
- TODA SAÍDA EM PORTUGUÊS BRASILEIRO.
- Retorne APENAS JSON válido, sem markdown fences.
- Cite apenas legislação real verificável.
- Use [INFORMACAO A COMPLETAR] para dados faltantes.
- Seja transparente: "Esta análise tem confiança média porque [X]".
- Disclaimer obrigatório no campo "disclaimer".

Score interpretation:
- 0-29: BAIXO — pode assinar com observações menores
- 30-59: MEDIO — renegociar pontos antes de assinar
- 60-79: ALTO — bloqueador de assinatura sem renegociação
- 80-100: CRITICO — não assinar nas condições atuais

Retorne exatamente este JSON:
{
  "risco": {
    "score_global": 0,
    "nivel": "BAIXO | MEDIO | ALTO | CRITICO",
    "tipo_documento": "Contrato | Aditivo | Acordo | Outro",
    "sucesso_contencioso_pct": 50,
    "sucesso_contencioso_justificativa": "1-2 frases sobre jurisprudência e por que essa probabilidade",
    "top_3_pontos": [
      {
        "peso": 0,
        "titulo": "Título curto do ponto",
        "trecho": "Trecho exato do documento problemático",
        "problema": "Por que isso é risco",
        "fundamento": "Art. X da Lei Y — explicação",
        "padrao_mercado": "Como o mercado normalmente trata isso",
        "sugestao": "Reescrita ou cláusula a adicionar"
      }
    ],
    "comparacao_mercado": "1-2 frases sobre como este documento se posiciona vs. padrão B2B",
    "recomendacao": "Recomendação executiva 1-2 frases — assinar / renegociar / recusar",
    "confianca": { "nivel": "alta | media | baixa", "nota": "Justificativa breve" },
    "disclaimer": "Análise assistida por IA. Decisão final é do advogado responsável. A IA pode interpretar mal cláusulas ambíguas — confirme passagens críticas no texto original."
  }
}`

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 })
    if (!ANTHROPIC_API_KEY) return NextResponse.json({ error: 'Servico de IA indisponivel.' }, { status: 503 })

    const { checkRateLimit, rateLimitResponse } = await import('@/lib/rate-limit')
    const rl = await checkRateLimit(supabase, `user:${user.id}:risco`)
    if (!rl.ok) return rateLimitResponse(rl)

    // Validate ANTES de cobrar quota — antes vinha quota primeiro = burn
    // de quota legítima em payload inválido.
    const body = await req.json().catch(() => ({}))
    const documento = typeof body?.documento === 'string' ? body.documento : ''
    const tipo = typeof body?.tipo === 'string' ? body.tipo : ''

    if (!documento || documento.trim().length < 100) {
      return NextResponse.json({ error: 'Cole o documento completo (minimo 100 caracteres).' }, { status: 400 })
    }
    if (documento.length > 50000) {
      return NextResponse.json({ error: 'Texto excede o limite maximo de 50.000 caracteres.' }, { status: 400 })
    }

    const quota = await checkAndIncrementQuota(supabase, user.id, 'risco')
    if (!quota.ok && quota.response) return quota.response

    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY })
    let userMessage = `Analise o risco juridico do documento abaixo e devolva o JSON estruturado conforme especificado.\n\nDOCUMENTO:\n${documento}`
    if (tipo.trim()) userMessage = `Tipo de documento informado: ${tipo}\n\n${userMessage}`

    // Grounding: primeiros 2k chars do documento + tipo guiam retrieval.
    const groundingQuery = documento.slice(0, 2000) + (tipo ? ` ${tipo}` : '')
    const grounding = buildGroundingContext(groundingQuery, { topK: 8 })
    const gstats = groundingStats(grounding)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    let message: Anthropic.Messages.Message
    try {
      message = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
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
      { risco: { score_global: 50, nivel: 'MEDIO', recomendacao: responseText, top_3_pontos: [], confianca: { nivel: 'baixa', nota: 'Resposta nao estruturada' } } },
    )
    const risco = ((parsed as Record<string, unknown>)?.risco ?? parsed) as Record<string, unknown>

    const usuarioId = await resolveUsuarioIdServer(supabase, user.id, user.email, user.user_metadata?.nome)
    if (usuarioId) {
      await supabase.from('historico').insert({
        usuario_id: usuarioId,
        agente: 'risco',
        mensagem_usuario: `Risco: ${tipo || 'Documento'} (${documento.length} chars)`,
        resposta_agente: `Score ${risco?.score_global ?? '-'}/100 (${risco?.nivel ?? '-'})`,
      })
    }

    const validation = validateCitations(responseText)

    events.agentUsed(user.id, 'risco', 'unknown').catch(() => {})
    return NextResponse.json({
      risco,
      fontes: validation.sources,
      grounding_stats: { ...gstats, ...validation.stats },
    })
  } catch (err: unknown) {
    const errName = err instanceof Error ? err.name : 'Unknown'
    const msg = err instanceof Error ? err.message : 'Erro interno'
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('[API /risco]', errName, msg)
    }
    // Demo-mode fallback (Wave C5)
    if (isDemoFallbackEnabled() && isRetryableError(err)) {
      const fallback = getDemoFallback('risco', { reason: msg })
      return NextResponse.json(fallback)
    }
    if (errName === 'AbortError' || msg.toLowerCase().includes('aborted') || msg.toLowerCase().includes('timeout')) {
      return NextResponse.json({ error: 'O servico de IA demorou muito para responder. Tente um documento menor.' }, { status: 504 })
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

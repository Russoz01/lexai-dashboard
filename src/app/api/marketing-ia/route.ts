import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAndIncrementQuota } from '@/lib/quotas'
import { events } from '@/lib/analytics'
import { resolveUsuarioIdServer, safeError, parseAgentJSON, withRetry } from '@/lib/api-utils'
import { validateMarketingOutput } from '@/lib/oab-validator'
import { assertPlanAccess } from '@/lib/plan-access'
import { safeLog } from '@/lib/safe-log'
import { fireAndForget } from '@/lib/fire-and-forget'
import { getDemoFallback, isDemoFallbackEnabled, isRetryableError } from '@/lib/demo-fallback'
import { getUserPreferences, recordAgentMemory } from '@/lib/preferences'
import { buildAgentPreamble, buildAntiHallucinationFooter, buildPreferencesContext, extractMemoryTags, buildMemorySummary } from '@/lib/prompt-enhancers'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

const PLATAFORMAS: Record<string, string> = {
  instagram: 'Instagram (post + carrossel)',
  linkedin: 'LinkedIn (post profissional)',
  blog: 'Artigo de blog (SEO juridico)',
  facebook: 'Facebook (post descritivo)',
  threads: 'Threads (texto curto)',
}

const SYSTEM_PROMPT = `You are an elite Brazilian legal marketer who creates content for attorneys 100% compliant with OAB Provimento 205/2021 (marketing juridico) and the Codigo de Etica da OAB.

NON-NEGOTIABLE COMPLIANCE RULES (Provimento 205/2021):
- NUNCA prometer resultado, chance de vitoria ou qualquer garantia.
- NUNCA mercantilizar a advocacia (descontos, promocoes, "primeira consulta gratis", sorteios, brindes).
- NUNCA captar clientela de forma indevida (abordagem a pessoas em situacao de vulnerabilidade, porta a porta, panfletagem).
- NUNCA usar sensacionalismo, apelo emocional excessivo, linguagem vulgar ou imagens chocantes.
- NUNCA citar valores de honorarios em posts publicos.
- NUNCA mencionar casos especificos que possam identificar clientes (sigilo).
- NUNCA depoimentos/testemunhos de clientes.
- NUNCA comparar-se com outros advogados ou escritorios.
- SEMPRE incluir OAB/UF do advogado (placeholder [OAB/UF - INSCRICAO]).
- SEMPRE manter carater informativo, cientifico, cultural ou discreto.
- Citacoes de legislacao/jurisprudencia devem ter fonte clara.

METHODOLOGY:
1. Analyze topic + platform.
2. Produce 3 distinct post variations in different tones (didatico, analitico, acessivel).
3. For each: titulo/gancho, corpo, CTA compliant, hashtags, visual suggestion.
4. Run every variation through the 10-point compliance checklist and flag any issue.
5. Provide SEO keywords when platform is blog.

RULES:
- ALL OUTPUT IN BRAZILIAN PORTUGUESE.
- Return ONLY valid JSON, no markdown fences.
- Cite legislation with article number and official source.
- Use [INFORMACAO A COMPLETAR] for any missing data.
- Never invent jurisprudence or statistics.

Return exactly this JSON:
{
  "conteudo": {
    "topico": "Topic",
    "plataforma": "platform key",
    "publico_alvo": "Target audience description",
    "variacoes": [
      {
        "nome": "Variacao 1 - Didatica",
        "titulo": "Post title or hook",
        "corpo": "Full post body with paragraphs separated by \\n\\n",
        "cta": "Compliant call-to-action (informative only)",
        "hashtags": ["hashtag1"],
        "sugestao_visual": "Suggested image/graphic (generic, no cliche, no real clients)",
        "tom": "Didatico | Analitico | Acessivel",
        "observacoes": "Tone-specific notes"
      }
    ],
    "checklist_compliance": [
      { "regra": "Rule name from Provimento 205", "status": "OK | Atencao | Violacao", "nota": "Brief observation" }
    ],
    "palavras_chave_seo": ["Keyword 1"],
    "rodape_obrigatorio": "Name + [OAB/UF - INSCRICAO] + disclaimer informativo",
    "alertas": ["Any borderline element the advogado must review before posting"],
    "confianca": {"nivel": "alta | media | baixa", "nota": "short justification"}
  }
}`

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 })
    if (!ANTHROPIC_API_KEY) return NextResponse.json({ error: 'Servico de IA indisponivel.' }, { status: 503 })

    // Plan-based access (Wave R1 audit): Marketing-IA é Firma+
    const planBlock = await assertPlanAccess(supabase, user.id, 'marketing-ia')
    if (planBlock) return planBlock

    const { checkRateLimit, rateLimitResponse } = await import('@/lib/rate-limit')
    const rl = await checkRateLimit(supabase, `user:${user.id}:marketing-ia`)
    if (!rl.ok) return rateLimitResponse(rl)

    const quota = await checkAndIncrementQuota(supabase, user.id, 'marketing-ia')
    if (!quota.ok && quota.response) return quota.response

    const body = await req.json().catch(() => ({}))
    const topico = typeof body?.topico === 'string' ? body.topico : ''
    const plataforma = typeof body?.plataforma === 'string' ? body.plataforma : ''

    if (!topico || topico.trim().length < 10) {
      return NextResponse.json({ error: 'Descreva o topico (minimo 10 caracteres).' }, { status: 400 })
    }
    if (!plataforma || !PLATAFORMAS[plataforma]) {
      return NextResponse.json({ error: 'Plataforma invalida.' }, { status: 400 })
    }
    if (topico.length > 10000) {
      return NextResponse.json({ error: 'Topico excede o limite maximo de 10.000 caracteres.' }, { status: 400 })
    }

    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY })
    const userMessage = `Topico: ${topico}\n\nPlataforma: ${PLATAFORMAS[plataforma]}\n\nGere 3 variacoes de post juridico 100% compliant com Provimento 205/2021 da OAB.`

    const usuarioIdEarly = await resolveUsuarioIdServer(supabase, user.id, user.email, user.user_metadata?.nome)
    const prefs = usuarioIdEarly ? await getUserPreferences(supabase, usuarioIdEarly).catch(() => null) : null
    const prefsContext = buildPreferencesContext(prefs)
    const enhancedSystem = buildAgentPreamble('marketing') + SYSTEM_PROMPT + buildAntiHallucinationFooter()

    // AbortController evita lambda travado em 300s sob 529 overload
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 90_000)
    let message: Anthropic.Messages.Message
    try {
      message = await withRetry(() => client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8192,
        system: [
          {
            type: 'text' as const,
            text: enhancedSystem,
            cache_control: { type: 'ephemeral' as const },
          },
          ...(prefsContext ? [{ type: 'text' as const, text: prefsContext }] : []),
        ],
        messages: [{ role: 'user', content: userMessage }],
      }, { signal: controller.signal }))
    } finally {
      clearTimeout(timeoutId)
    }

    const textBlock = message.content.find(b => b.type === 'text')
    const responseText = textBlock && textBlock.type === 'text' ? textBlock.text.trim() : ''
    const parsed = parseAgentJSON<{ conteudo?: unknown }>(responseText, {
      conteudo: { topico, plataforma, variacoes: [{ nome: 'Variacao 1', corpo: responseText }] },
    })
    const conteudoRaw = parsed?.conteudo ?? parsed

    // SEC-12 audit fix (2026-05-02): valida output contra Provimento 205 OAB.
    // Se LLM gerou conteúdo violador (garantia resultado, mercantilização,
    // sorteios, comparação com colegas), sanitiza + marca violations.
    // Última linha de defesa antes do output sair pra UI do advogado-cliente.
    const validation = validateMarketingOutput(conteudoRaw)
    const conteudo = validation.sanitized
    if (validation.violations.length > 0) {
      // eslint-disable-next-line no-console
      safeLog.warn('[marketing-ia OAB violations]', {
        userId: user.id,
        plataforma,
        violations: validation.violations.map(v => ({ rule: v.rule, severity: v.severity })),
      })
    }

    const usuarioId = usuarioIdEarly
    if (usuarioId) {
      await supabase.from('historico').insert({
        usuario_id: usuarioId,
        agente: 'marketing-ia',
        mensagem_usuario: `Marketing: ${topico.slice(0, 200)} (${PLATAFORMAS[plataforma]})`,
        resposta_agente: `3 variacoes geradas - ${PLATAFORMAS[plataforma]}`,
      })
      fireAndForget(recordAgentMemory(supabase, usuarioId, {
        agente: 'marketing-ia',
        resumo: buildMemorySummary('marketing-ia', `${PLATAFORMAS[plataforma]}: ${topico.slice(0, 120)}`, '3 variações geradas'),
        fatos: [{ key: 'plataforma', value: plataforma }],
        tags: extractMemoryTags('marketing-ia', plataforma, topico),
      }, { prefs }), 'recordAgentMemory:marketing-ia')
    }

    fireAndForget(events.agentUsed(user.id, 'marketing-ia', 'unknown'), 'events.agentUsed:marketing-ia')
    return NextResponse.json({
      conteudo,
      // SEC-12: expor violations pra UI mostrar warning amigável ao advogado
      oab_violations: validation.violations.length > 0
        ? validation.violations.map(v => ({ regra: v.rule, severidade: v.severity, motivo: v.motivo, trecho_removido: v.severity === 'high' ? v.trecho : undefined }))
        : undefined,
    })
  } catch (err: unknown) {
    if (isDemoFallbackEnabled() && isRetryableError(err)) {
      return NextResponse.json(getDemoFallback('marketing-ia', { reason: err instanceof Error ? err.message : String(err) }))
    }
    return safeError('marketing-ia', err)
  }
}

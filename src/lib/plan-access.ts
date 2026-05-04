/* ════════════════════════════════════════════════════════════════════
 * plan-access · v1.0 (2026-05-02)
 * ────────────────────────────────────────────────────────────────────
 * Mapa central de quais agentes cada plano libera. Source of truth pra:
 *   · Backend gating (withAgentAuth)
 *   · Frontend lock badges (Sidebar)
 *   · Pricing grid (lex-pricing-grid features)
 *   · Catalog filter (catalog.ts)
 *
 * Audit Wave R1 follow-up: antes pricing dizia "27 agentes em todos
 * planos" mas Solo R$599 pagava o mesmo que Firma R$1.459 sem barreira
 * técnica — apenas quota numérica diferenciava. Agora cada plano tem
 * acesso a um subset distinto, justificando o preço.
 *
 * Plan ladder:
 *   free       → 0 agentes (trial 50min libera os essenciais temp)
 *   solo       → 8 essenciais
 *   starter    → 18 (essenciais + intermediários)
 *   pro/firma  → TODOS 27
 *   enterprise → TODOS 27 + custom (treinados no escritório)
 * ═══════════════════════════════════════════════════════════════════ */

export type Plano = 'free' | 'solo' | 'starter' | 'pro' | 'enterprise'

/**
 * Os 8 agentes essenciais do tier Solo R$599.
 * Cobertura: pesquisa + redação + cálculo + risco básico + audiência.
 * O que falta: pareceres complexos, recursos, marketing, compliance,
 * verticais (CRM, planilhas, etc).
 */
const SOLO_AGENTS = [
  'resumidor',     // analise de documentos
  'redator',       // peticoes basicas
  'pesquisador',   // jurisprudencia
  'calculador',    // prazos + correcao
  'legislacao',    // consulta artigo
  'risco',         // analise de risco basica
  'contestador',   // contestacao
  'audiencia',     // roteiro audiencia
] as const

/**
 * Os 10 agentes adicionais do tier Escritório R$1.399.
 * Cobertura adicional: pareceres, consultoria, recursos, estratégia,
 * negociação, tradução, revisão, atendimento, simulado OAB, monitoria.
 */
const STARTER_EXTRAS = [
  'parecerista',   // parecer juridico
  'consultor',     // consultoria estrategica
  'recursos',      // apelacao + agravo
  'estrategista',  // plano de litigio
  'negociador',    // BATNA + ZOPA
  'tradutor',      // PT/EN/ES
  'revisor',       // revisao de pecas
  'atendimento',   // entrevista cliente
  'simulado',      // OAB simulado
  'professor',     // monitor legislativo
] as const

/**
 * Os 9 agentes top-tier do plano Firma R$1.459 (TODOS 27).
 * Cobertura: compliance, marketing, CRM, verticais (CNJ DataJud,
 * comparador, flashcards, plano de aula, casos).
 */
const PRO_EXTRAS = [
  'compliance',     // LGPD + Provimento 205 OAB
  'marketing-ia',   // marketing OAB-compliant
  'planilhas',      // controle financeiro/timesheet
  'cnj',            // datajud monitoring
  'comparador',     // diff de documentos
  'flashcards',     // OAB studying
  'plano',          // plano de aula juridico
  'casos',          // gestao de casos
  'crm',            // CRM advogado-cliente
] as const

/**
 * Map plano → agentes liberados. 'enterprise' = todos + custom.
 */
export const PLAN_AGENT_ACCESS: Record<Plano, readonly string[]> = {
  free: [],  // trial libera essenciais temporariamente via outro mecanismo
  solo: SOLO_AGENTS,
  starter: [...SOLO_AGENTS, ...STARTER_EXTRAS],
  pro: [...SOLO_AGENTS, ...STARTER_EXTRAS, ...PRO_EXTRAS],
  enterprise: [...SOLO_AGENTS, ...STARTER_EXTRAS, ...PRO_EXTRAS],  // + custom dinâmicos
}

/**
 * Min plano que libera o agente. Útil pra UI mostrar "Disponível em X+".
 */
export function getMinPlanFor(agente: string): Plano | null {
  if ((SOLO_AGENTS as readonly string[]).includes(agente)) return 'solo'
  if ((STARTER_EXTRAS as readonly string[]).includes(agente)) return 'starter'
  if ((PRO_EXTRAS as readonly string[]).includes(agente)) return 'pro'
  return null  // agente desconhecido
}

/**
 * Verifica se o plano libera o agente. Default permissivo: se plano
 * inválido (ex: null/undefined), trata como 'solo' (mais restritivo).
 */
export function userCanAccessAgent(plano: string | null | undefined, agente: string): boolean {
  const p: Plano = (plano && plano in PLAN_AGENT_ACCESS) ? (plano as Plano) : 'solo'
  return PLAN_AGENT_ACCESS[p].includes(agente)
}

/**
 * Label amigável pra UI mostrar quando user tenta acesso negado.
 */
export function getUpgradeMessage(agente: string): string {
  const minPlan = getMinPlanFor(agente)
  if (!minPlan || minPlan === 'solo') {
    return 'Este agente não está disponível no seu plano atual.'
  }
  const planNames: Record<Plano, string> = {
    free: 'Trial',
    solo: 'Solo',
    starter: 'Escritório',
    pro: 'Firma',
    enterprise: 'Enterprise',
  }
  return `Este agente está disponível a partir do plano ${planNames[minPlan]}.`
}

export type { Plano as PlanoSlug }

/**
 * Helper inline pra routes que NÃO usam withAgentAuth wrapper.
 * Retorna Response 403 se user não pode acessar agente; null se OK.
 *
 * Uso em rota inline:
 *   const blocked = await assertPlanAccess(supabase, user.id, 'parecerista')
 *   if (blocked) return blocked
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function assertPlanAccess(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  authUserId: string,
  agentSlug: string,
): Promise<Response | null> {
  const { data } = await supabase
    .from('usuarios')
    .select('plano, subscription_status, trial_ended_at')
    .eq('auth_user_id', authUserId)
    .maybeSingle()
  const row = data as {
    plano?: string
    subscription_status?: string
    trial_ended_at?: string | null
  } | null
  const plano = row?.plano
  const subscription = row?.subscription_status
  const trialEndedAt = row?.trial_ended_at

  // Bug-fix CRITICO 2026-05-04 (cliente luisgaldiano em demo bloqueado de
  // Parecerista). Antes: assertPlanAccess checava SOMENTE row.plano. Trial
  // 50min sempre vinha com plano='free' + subscription='trialing'. Resultado:
  // user em demo era bloqueado de TODOS agentes que exigem starter+, embora
  // a promessa marketing seja "demo libera acesso enterprise por 50min".
  //
  // Fix: se subscription_status='trialing' E trial_ended_at no futuro,
  // libera TODOS agentes (enterprise tier) durante o trial. Acabou trial,
  // gate normal volta a aplicar baseado em row.plano.
  if (subscription === 'trialing' && trialEndedAt) {
    const trialEnd = new Date(trialEndedAt).getTime()
    if (Number.isFinite(trialEnd) && trialEnd > Date.now()) {
      return null // trial ativo = acesso total liberado
    }
  }

  if (userCanAccessAgent(plano, agentSlug)) return null

  const minPlan = getMinPlanFor(agentSlug)
  return new Response(
    JSON.stringify({
      error: getUpgradeMessage(agentSlug),
      code: 'plan_upgrade_required',
      required_plan: minPlan,
      current_plan: plano || 'unknown',
    }),
    {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    },
  )
}

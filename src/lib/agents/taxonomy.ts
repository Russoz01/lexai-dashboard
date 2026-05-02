/* ═════════════════════════════════════════════════════════════
 * Legal vertical taxonomy — v10.10
 * ─────────────────────────────────────────────────────────────
 * Source of truth pras 10 áreas do Direito brasileiro que a Pralvex
 * atende. Substitui 6+ cópias espalhadas em route handlers e páginas
 * do dashboard (atendimento, consultor, simulado, pesquisador, ...).
 *
 * Convenções:
 *  - `slug` é a chave canônica (kebab/snake case, ASCII, estável)
 *  - `label` é PT-BR com acento correto (UI)
 *  - `labelMono` é ASCII sem acento (pra prompts LLM e logs)
 *  - `shortLabel` é versão compacta pra pills/chips (<= 18 chars)
 *  - `description` é uma frase curta sócio-gestor style
 *  - `commonCases` são 3 exemplos reais de casos que caem nessa área
 *  - `relevantAgents` lista os agentes Pralvex mais úteis pra essa área
 *
 * Por que 10 áreas e não 12+:
 *  - Ambiental, Digital, Constitucional virão depois (n=5 pra validar)
 *  - OAB considera essas 10 o core do contencioso/consultivo brasileiro
 *  - Mais áreas = mais filtro = mais decision fatigue. Começa enxuto.
 *
 * Como estender:
 *  - Adicionar entrada aqui + rodar migration pra aceitar novo slug
 *    como valor válido na coluna usuarios.area_juridica_padrao
 * ═════════════════════════════════════════════════════════════ */

export type LegalAreaSlug =
  | 'civel'
  | 'familia'
  | 'trabalhista'
  | 'penal'
  | 'tributario'
  | 'consumidor'
  | 'empresarial'
  | 'imobiliario'
  | 'previdenciario'
  | 'administrativo'

export interface LegalArea {
  slug: LegalAreaSlug
  label: string
  labelMono: string
  shortLabel: string
  description: string
  commonCases: string[]
  relevantAgents: string[]
}

export const LEGAL_AREAS: readonly LegalArea[] = [
  {
    slug: 'civel',
    label: 'Cível',
    labelMono: 'Civel',
    shortLabel: 'Cível',
    description: 'Contencioso e consultivo em direito privado — responsabilidade civil, contratos, obrigações.',
    commonCases: [
      'Indenização por dano moral ou material',
      'Ação de cobrança e execução de título',
      'Rescisão contratual com perdas e danos',
    ],
    relevantAgents: ['redator', 'contestador', 'pesquisador', 'calculador', 'estrategista'],
  },
  {
    slug: 'familia',
    label: 'Família e Sucessões',
    labelMono: 'Familia e Sucessoes',
    shortLabel: 'Família',
    description: 'Divórcio, guarda, alimentos, inventário, partilha — o emocional vira técnico sem perder a pessoa.',
    commonCases: [
      'Divórcio litigioso com partilha e guarda',
      'Inventário extrajudicial e testamento',
      'Ação de alimentos e revisão',
    ],
    relevantAgents: ['redator', 'atendimento', 'negociador', 'calculador', 'parecerista'],
  },
  {
    slug: 'trabalhista',
    label: 'Trabalhista',
    labelMono: 'Trabalhista',
    shortLabel: 'Trabalho',
    description: 'Reclamatórias, acordos, compliance trabalhista — reforma de 2017 já digerida no prompt.',
    commonCases: [
      'Reclamatória trabalhista (verbas rescisórias + horas extras)',
      'Reconhecimento de vínculo em PJ fraudulento',
      'Defesa de empresa em ação coletiva',
    ],
    relevantAgents: ['contestador', 'calculador', 'audiencia', 'pesquisador', 'redator'],
  },
  {
    slug: 'penal',
    label: 'Penal',
    labelMono: 'Penal',
    shortLabel: 'Penal',
    description: 'Defesa criminal com presunção de inocência no código — e nas cem citações que a gente rastreia.',
    commonCases: [
      'Habeas corpus liberatório',
      'Defesa em ação penal (resposta à acusação, alegações finais)',
      'Execução penal (progressão, livramento condicional)',
    ],
    relevantAgents: ['contestador', 'audiencia', 'pesquisador', 'estrategista', 'parecerista'],
  },
  {
    slug: 'tributario',
    label: 'Tributário',
    labelMono: 'Tributario',
    shortLabel: 'Tributário',
    description: 'Planejamento, contencioso administrativo e judicial — cálculos finos com SELIC, IPCA-E, UFIR.',
    commonCases: [
      'Mandado de segurança contra autuação fiscal',
      'Compensação de créditos e restituição',
      'Revisão de planejamento tributário societário',
    ],
    relevantAgents: ['calculador', 'pesquisador', 'contestador', 'parecerista', 'estrategista'],
  },
  {
    slug: 'consumidor',
    label: 'Consumidor',
    labelMono: 'Consumidor',
    shortLabel: 'Consumidor',
    description: 'CDC + Provimento 205 OAB — massa de casos onde prazo e ementa certos valem o processo.',
    commonCases: [
      'Ação de repetição de indébito e cobrança indevida',
      'Defesa de fornecedor em ação indenizatória',
      'Processo administrativo no Procon',
    ],
    relevantAgents: ['redator', 'contestador', 'pesquisador', 'calculador', 'atendimento'],
  },
  {
    slug: 'empresarial',
    label: 'Empresarial',
    labelMono: 'Empresarial',
    shortLabel: 'Empresarial',
    description: 'Societário, M&A, contratos, recuperação judicial — corpo técnico pra escritório que atende PJ.',
    commonCases: [
      'Due diligence e contrato de compra de quotas',
      'Acordo de sócios e instrumento de dissolução',
      'Recuperação judicial (plano, assembleia, impugnação)',
    ],
    relevantAgents: ['redator', 'parecerista', 'negociador', 'estrategista', 'resumidor'],
  },
  {
    slug: 'imobiliario',
    label: 'Imobiliário',
    labelMono: 'Imobiliario',
    shortLabel: 'Imobiliário',
    description: 'Contratos, registros, usucapião, locação — a parte do Direito onde um milímetro vira litígio.',
    commonCases: [
      'Ação de despejo (denúncia vazia, inadimplemento)',
      'Usucapião extrajudicial',
      'Due diligence imobiliária pra compra e venda',
    ],
    relevantAgents: ['redator', 'parecerista', 'pesquisador', 'calculador', 'resumidor'],
  },
  {
    slug: 'previdenciario',
    label: 'Previdenciário',
    labelMono: 'Previdenciario',
    shortLabel: 'Previdência',
    description: 'INSS, aposentadoria, auxílios, revisões — cálculo atuarial integrado a CNIS e tema 1031 do STF.',
    commonCases: [
      'Revisão de aposentadoria (vida toda, art. 29)',
      'Auxílio-doença e aposentadoria por invalidez',
      'Pensão por morte e tempo de contribuição rural',
    ],
    relevantAgents: ['calculador', 'redator', 'pesquisador', 'contestador', 'atendimento'],
  },
  {
    slug: 'administrativo',
    label: 'Administrativo',
    labelMono: 'Administrativo',
    shortLabel: 'Administrativo',
    description: 'Servidor público, licitação, improbidade — processo que anda no Carf, TCU e JF ao mesmo tempo.',
    commonCases: [
      'Mandado de segurança contra ato administrativo',
      'Defesa em PAD (processo administrativo disciplinar)',
      'Impugnação de edital de licitação',
    ],
    relevantAgents: ['redator', 'contestador', 'pesquisador', 'parecerista', 'estrategista'],
  },
] as const

export const LEGAL_AREAS_BY_SLUG: Readonly<Record<LegalAreaSlug, LegalArea>> =
  LEGAL_AREAS.reduce((acc, area) => {
    acc[area.slug] = area
    return acc
  }, {} as Record<LegalAreaSlug, LegalArea>)

/** Map compatível com os Record<string, string> legados espalhados nas rotas. */
export const LEGAL_AREAS_LABEL_MAP: Readonly<Record<LegalAreaSlug, string>> =
  LEGAL_AREAS.reduce((acc, area) => {
    acc[area.slug] = area.labelMono
    return acc
  }, {} as Record<LegalAreaSlug, string>)

/** Type guard: é uma área válida? */
export function isLegalAreaSlug(value: unknown): value is LegalAreaSlug {
  return typeof value === 'string' && value in LEGAL_AREAS_BY_SLUG
}

/** Busca segura por slug. Retorna null se inválido. */
export function getLegalArea(slug: string | null | undefined): LegalArea | null {
  if (!slug || !isLegalAreaSlug(slug)) return null
  return LEGAL_AREAS_BY_SLUG[slug]
}

/**
 * Gera bloco de contexto pra system-prompt do LLM personalizar resposta
 * com a área padrão do advogado. Chama via:
 *   `const ctx = buildAreaContext(user.area_juridica_padrao)`
 *   `system: [{ text: basePrompt + ctx, ... }]`
 */
export function buildAreaContext(slug: string | null | undefined): string {
  const area = getLegalArea(slug)
  if (!area) return ''
  return `\n\nCONTEXTO DO ADVOGADO (use pra calibrar exemplos e linguagem):
- Area principal de atuacao: ${area.labelMono}
- Casos tipicos dessa area: ${area.commonCases.join('; ')}
Prefira exemplos dessa area quando a pergunta do advogado for ambigua sobre contexto.`
}

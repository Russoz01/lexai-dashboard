/* ══════════════════════════════════════════════════════════════
 * CATALOG — fonte única de verdade dos 27 agentes + 4 módulos (v10.8)
 * ──────────────────────────────────────────────────────────────
 * [NOTA PARA PRÓXIMA SESSÃO — 2026-04-17]
 *
 * CRIADO mas NÃO WIRADO ainda. O plano original era:
 *   - Sidebar consome agents() + modules() + isUnlocked()
 *   - dashboard/page.tsx renderiza bento a partir de CATALOG
 *   - dashboard/planos/page.tsx lê os agentes liberados por plano
 *
 * A refatoração do Sidebar + dashboard/page + planos foi feita
 * na sessão de 2026-04-17 mas REVERTIDA por hook/linter.
 * Git HEAD NÃO contém o wiring — apenas este arquivo isolado.
 *
 * PARA RETOMAR:
 *   1. Reescrever src/components/Sidebar.tsx para consumir
 *      agents(), modules(), isUnlocked(item, userPlan).
 *      Itens não-implementados (implemented:false) devem redirecionar
 *      para /dashboard/em-breve?feature=<slug>.
 *      Itens bloqueados (!isUnlocked) redirecionam para /dashboard/planos.
 *
 *   2. Reescrever src/app/dashboard/page.tsx para renderizar
 *      um bento com agents() + modules() consumindo este catálogo.
 *
 *   3. Reescrever src/app/dashboard/planos/page.tsx para mostrar
 *      quais agentes cada plano libera (filtrar por minPlan).
 *
 * Ver também: src/components/ui/lex-pricing.tsx (landing), já
 * integrado com SpotlightCard e toggle anual/mensal funcionando.
 * ══════════════════════════════════════════════════════════════ */

import {
  MessageSquare, FileText, PenLine, Search, Handshake,
  Calendar, Calculator, BookOpen, ClipboardCheck, Briefcase,
  GraduationCap, ShieldCheck, Languages, Table2,
  FileCheck2, FileEdit, Scale, Gavel, Mic, Target, UserRound, Megaphone,
  Users, BarChart3, Sparkles,
  FolderKanban, Network, GitCompare, AlertTriangle, Layers, CalendarDays,
  type LucideIcon,
} from 'lucide-react'

export type Plan = 'free' | 'solo' | 'starter' | 'pro' | 'enterprise'

export interface CatalogItem {
  slug: string
  label: string
  href: string
  Icon: LucideIcon
  desc: string
  kind: 'agent' | 'module'
  /** menor plano que libera esse item */
  minPlan: Plan
  /** tem página/rota implementada? */
  implemented: boolean
}

/**
 * Catálogo único — 27 agentes + 4 módulos (Casos, CRM, Jurimetria, Marketing).
 * A landing promete "27 agentes, CRM integrado, jurimetria e marketing compliant".
 * Este é o contrato único consumido por Sidebar, Dashboard e Planos.
 */
export const CATALOG: CatalogItem[] = [
  // ───────── 8 essenciais (Solo R$599+) ─────────
  // Wave R1 audit (2026-05-02): minPlan ajustado pra alinhar com novo
  // pricing tier — Solo libera os 8 essenciais que cobrem 80% do uso
  // diário (pesquisa + redação + cálculo + audiência + risco básico).
  { slug: 'chat',         label: 'Chat',         href: '/dashboard/chat',         Icon: MessageSquare,  desc: 'Orquestrador · roteia para o agente certo',     kind: 'agent', minPlan: 'free',    implemented: true  },
  { slug: 'resumidor',    label: 'Resumidor',    href: '/dashboard/resumidor',    Icon: FileText,       desc: 'Contratos, acórdãos e petições',                kind: 'agent', minPlan: 'solo',    implemented: true  },
  { slug: 'pesquisador',  label: 'Pesquisador',  href: '/dashboard/pesquisador',  Icon: Search,         desc: 'Jurisprudência STF, STJ e tribunais',           kind: 'agent', minPlan: 'solo',    implemented: true  },
  { slug: 'redator',      label: 'Redator',      href: '/dashboard/redator',      Icon: PenLine,        desc: 'Peças processuais com fundamentação',           kind: 'agent', minPlan: 'solo',    implemented: true  },
  { slug: 'calculador',   label: 'Calculador',   href: '/dashboard/calculador',   Icon: Calculator,     desc: 'Prazos, juros, correção, custas',               kind: 'agent', minPlan: 'solo',    implemented: true  },
  { slug: 'legislacao',   label: 'Legislação',   href: '/dashboard/legislacao',   Icon: BookOpen,       desc: 'Artigos de lei explicados',                     kind: 'agent', minPlan: 'solo',    implemented: true  },
  { slug: 'risco',        label: 'Risco',        href: '/dashboard/risco',        Icon: AlertTriangle,  desc: 'Score 0-100 de risco contratual',               kind: 'agent', minPlan: 'solo',    implemented: true  },
  { slug: 'contestador',  label: 'Contestador',  href: '/dashboard/contestador',  Icon: Scale,          desc: 'Gera contestações com réplicas',                kind: 'agent', minPlan: 'solo',    implemented: true  },
  { slug: 'audiencia',    label: 'Audiência',    href: '/dashboard/audiencia',    Icon: Mic,            desc: 'Sustentação oral e roteiro',                    kind: 'agent', minPlan: 'solo',    implemented: true  },

  // ───────── 10 intermediários (Escritório R$1.399+) ─────────
  { slug: 'parecerista',  label: 'Parecerista',  href: '/dashboard/parecerista',  Icon: FileCheck2,     desc: 'Pareceres jurídicos fundamentados',             kind: 'agent', minPlan: 'starter', implemented: true  },
  { slug: 'consultor',    label: 'Consultor',    href: '/dashboard/consultor',    Icon: Briefcase,      desc: 'Risco processual e linha de atuação',           kind: 'agent', minPlan: 'starter', implemented: true  },
  { slug: 'recursos',     label: 'Recursos',     href: '/dashboard/recursos',     Icon: Gavel,          desc: 'Apelação, agravo e embargos',                   kind: 'agent', minPlan: 'starter', implemented: true  },
  { slug: 'estrategista', label: 'Estrategista', href: '/dashboard/estrategista', Icon: Target,         desc: 'Plano estratégico do caso',                     kind: 'agent', minPlan: 'starter', implemented: true  },
  { slug: 'negociador',   label: 'Negociador',   href: '/dashboard/negociador',   Icon: Handshake,      desc: 'BATNA, ZOPA e cenários de acordo',              kind: 'agent', minPlan: 'starter', implemented: true  },
  { slug: 'tradutor',     label: 'Tradutor',     href: '/dashboard/tradutor',     Icon: Languages,      desc: 'Traduções juramentadas',                        kind: 'agent', minPlan: 'starter', implemented: true  },
  { slug: 'revisor',      label: 'Revisor',      href: '/dashboard/revisor',      Icon: FileEdit,       desc: 'Revisão de contratos e peças',                  kind: 'agent', minPlan: 'starter', implemented: true  },
  { slug: 'atendimento',  label: 'Atendimento',  href: '/dashboard/atendimento',  Icon: UserRound,      desc: 'Roteiro de entrevista inicial',                 kind: 'agent', minPlan: 'starter', implemented: true  },
  { slug: 'simulado',     label: 'Simulado',     href: '/dashboard/simulado',     Icon: ClipboardCheck, desc: 'Treino OAB e provas objetivas',                 kind: 'agent', minPlan: 'starter', implemented: true  },
  { slug: 'professor',    label: 'Professor',    href: '/dashboard/professor',    Icon: GraduationCap,  desc: 'Aulas sob medida · responsabilidade civil',     kind: 'agent', minPlan: 'starter', implemented: true  },

  // ───────── 9 top-tier (Firma R$1.459+ · TODOS 27) ─────────
  { slug: 'compliance',   label: 'Compliance',   href: '/dashboard/compliance',   Icon: ShieldCheck,    desc: 'LGPD, Provimento 205, conformidade',            kind: 'agent', minPlan: 'pro', implemented: true  },
  { slug: 'marketing-ia', label: 'Marketing IA', href: '/dashboard/marketing-ia', Icon: Megaphone,      desc: 'Conteúdo OAB-compliant para redes',             kind: 'agent', minPlan: 'pro', implemented: true  },
  { slug: 'planilhas',    label: 'Planilhas',    href: '/dashboard/planilhas',    Icon: Table2,         desc: 'Timesheet, controle, honorários',               kind: 'agent', minPlan: 'pro', implemented: true  },
  { slug: 'rotina',       label: 'Rotina',       href: '/dashboard/rotina',       Icon: Calendar,       desc: 'Agenda, compromissos, fluxos',                  kind: 'agent', minPlan: 'pro', implemented: true  },

  // ───────── 5 agentes v10.8 (preview-only — 2026-04-28: catalog honest fix) ─────────
  // Estavam todos como implemented:true mas as page.tsx são <AgentPreviewStage>
  // puro sem API correspondente. Sidebar consumindo isUnlocked() vai redirecionar
  // pra /dashboard/em-breve até que tenham handler real. Auditoria identificou
  // os 5 abaixo + 3 módulos como STUB visual sem backend.
  // (risco movido pra essenciais Solo — único agente v10.8 com backend real)
  { slug: 'cnj',          label: 'CNJ',          href: '/dashboard/cnj',          Icon: Network,        desc: 'Consulta processual via DataJud · monitora',    kind: 'agent', minPlan: 'pro', implemented: false },
  { slug: 'comparador',   label: 'Comparador',   href: '/dashboard/comparador',   Icon: GitCompare,     desc: 'Diff v1 × v2 de contratos e peças',             kind: 'agent', minPlan: 'pro', implemented: false },
  { slug: 'flashcards',   label: 'Flashcards',   href: '/dashboard/flashcards',   Icon: Layers,         desc: 'Memorização SM-2 · spaced repetition',          kind: 'agent', minPlan: 'pro', implemented: false },
  { slug: 'plano',        label: 'Plano',        href: '/dashboard/plano',        Icon: CalendarDays,   desc: 'Plano de estudos IA · cronograma OAB',          kind: 'agent', minPlan: 'pro', implemented: false },

  // ───────── 4 módulos de plataforma ─────────
  // 2026-05-02: CRM virou EM BREVE também (era DEMO funcional, mas Leonardo
  // pediu pra evitar promessa em demo até CRM real estar pronto). Os 4
  // módulos agora são preview-only — todos roteiam pra /dashboard/em-breve.
  { slug: 'casos',        label: 'Casos',        href: '/dashboard/casos',        Icon: FolderKanban,   desc: 'Pastas de casos · timeline por cliente',        kind: 'module', minPlan: 'pro',        implemented: false },
  { slug: 'crm',          label: 'CRM',          href: '/dashboard/crm',          Icon: Users,          desc: 'Leads, clientes e funil de atendimento',        kind: 'module', minPlan: 'pro',        implemented: false },
  { slug: 'jurimetria',   label: 'Jurimetria',   href: '/dashboard/jurimetria',   Icon: BarChart3,      desc: 'Métricas processuais e benchmarks',             kind: 'module', minPlan: 'pro',        implemented: false },
  { slug: 'marketing',    label: 'Marketing',    href: '/dashboard/marketing',    Icon: Sparkles,       desc: 'Agenda de conteúdo compliant · calendário',     kind: 'module', minPlan: 'enterprise', implemented: false },
]

const PLAN_RANK: Record<Plan, number> = { free: 0, solo: 1, starter: 2, pro: 3, enterprise: 4 }

export function isUnlocked(item: CatalogItem, userPlan: Plan): boolean {
  return PLAN_RANK[userPlan] >= PLAN_RANK[item.minPlan]
}

export function agents(): CatalogItem[] {
  return CATALOG.filter(i => i.kind === 'agent')
}

export function modules(): CatalogItem[] {
  return CATALOG.filter(i => i.kind === 'module')
}

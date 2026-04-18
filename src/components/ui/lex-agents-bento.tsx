'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  FileText,
  PenLine,
  Search,
  Handshake,
  MessageSquare,
  Calculator,
  BookOpen,
  Calendar,
  ClipboardCheck,
  GraduationCap,
  Languages,
  ShieldCheck,
  Table2,
  Clipboard,
  Timer,
  LayoutTemplate,
  Wallet,
  History,
  CreditCard,
  Settings,
  Palette,
  Briefcase,
  Scale,
  Users,
  ArrowUpRight,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { Reveal } from '@/components/ui/reveal'
import { RetroGrid } from '@/components/ui/retro-grid'
import { SpotlightCard } from '@/components/ui/spotlight-card'
import { cn } from '@/lib/utils'

/* ════════════════════════════════════════════════════════════════════
 * LexAgentsBento (v3 · 2026-04-18)
 * ────────────────────────────────────────────────────────────────────
 * Feedback anterior (v2 ainda feia, monotona, serio demais):
 *  · hierarquia: 3 featured cards grandes + grid compacto dos restantes
 *  · featured cards com PREVIEW VISUAL (nao so texto e icone)
 *    - CRM:       mini-pipeline com dots e stages
 *    - Redator:   linhas de texto mockadas + timestamp
 *    - Pesquisador: chips de tribunais (STF, STJ, TRF)
 *  · micro tilt no hover (scale sutil, shadow champagne)
 *  · grid compacto apresenta "ver mais" nos 18 agentes restantes
 *  · heading com eyebrow + H2 + subtitulo estruturados
 *  · respira: mais whitespace, densidade menor
 * ═══════════════════════════════════════════════════════════════════ */

type Agent = {
  slug: string
  name: string
  desc: string
  icon: LucideIcon
  featured?: boolean
  tag?: string
}

const agents: Agent[] = [
  // Featured trio — aparecem no topo com preview
  { slug: 'crm',           name: 'CRM Juridico',  desc: 'Pipeline de leads, qualificacao automatica e follow-up com compliance OAB.', icon: Users,         featured: true, tag: 'Pro' },
  { slug: 'redator',       name: 'Redator',       desc: 'Peticoes, recursos e contestacoes com fundamentacao doutrinaria solida.',    icon: PenLine,       featured: true },
  { slug: 'pesquisador',   name: 'Pesquisador',   desc: 'Jurisprudencia STF, STJ, TRFs e TJs indexada com ementa e data de acordao.', icon: Search,        featured: true },
  // Resto — grid compacto
  { slug: 'chat',          name: 'Chat',          desc: 'Orquestrador conversacional — chama o agente certo por voce.',               icon: MessageSquare, tag: 'Novo' },
  { slug: 'resumidor',     name: 'Resumidor',     desc: 'Contratos, acordaos e peticoes resumidos com riscos e prazos.',               icon: FileText },
  { slug: 'negociador',    name: 'Negociador',    desc: 'MAAN, margem viavel e tres cenarios antes da audiencia.',                     icon: Handshake },
  { slug: 'calculador',    name: 'Calculador',    desc: 'Prazos, INPC/IGPM/IPCA, juros de mora e custas por estado.',                  icon: Calculator },
  { slug: 'legislacao',    name: 'Legislacao',    desc: 'Artigos de lei explicados com doutrina e jurisprudencia.',                    icon: BookOpen },
  { slug: 'rotina',        name: 'Rotina',        desc: 'Audiencias, prazos, compromissos e fluxos por prioridade.',                   icon: Calendar },
  { slug: 'consultor',     name: 'Consultor',     desc: 'Parecer juridico estruturado, pronto para revisao.',                          icon: ClipboardCheck },
  { slug: 'parecerista',   name: 'Parecerista',   desc: 'Opinion writing com pro/contra e recomendacao conclusiva.',                   icon: Briefcase },
  { slug: 'professor',     name: 'Professor',     desc: 'Treinamento e revisao em areas especificas do Direito.',                      icon: GraduationCap },
  { slug: 'tradutor',      name: 'Tradutor',      desc: 'Contratos EN/ES/FR com vocabulario tecnico preservado.',                      icon: Languages },
  { slug: 'compliance',    name: 'Compliance',    desc: 'LGPD, anticorrupcao e riscos regulatorios mapeados.',                         icon: ShieldCheck },
  { slug: 'planilhas',     name: 'Planilhas',     desc: 'Melhoria automatica de planilhas com diff estatistico.',                      icon: Table2 },
  { slug: 'simulado',      name: 'Simulado',      desc: 'Exames modelo com devolutiva item a item.',                                   icon: Clipboard },
  { slug: 'prazos',        name: 'Prazos',        desc: 'Rastreamento com prioridade critica, alta, media, baixa.',                    icon: Timer },
  { slug: 'modelos',       name: 'Modelos',       desc: '30+ prompts profissionais por 9 areas do Direito.',                           icon: LayoutTemplate },
  { slug: 'financeiro',    name: 'Financeiro',    desc: 'Honorarios, repasses, impostos e previsibilidade de caixa.',                  icon: Wallet },
  { slug: 'historico',     name: 'Historico',     desc: 'Todas interacoes com tokens e tempo por agente.',                             icon: History },
  { slug: 'planos',        name: 'Planos',        desc: 'Gestao de assinatura, limites e compras avulsas.',                            icon: CreditCard },
  { slug: 'configuracoes', name: 'Configuracoes', desc: 'Integracoes (Calendar, WhatsApp, Drive), notificacoes.',                      icon: Settings },
  { slug: 'design',        name: 'Design System', desc: 'Preferencias de cor, fonte, espaco e densidade do app.',                      icon: Palette },
]

/* ───────────────────────────────────────────────────────────────────
 * PREVIEW visuais — um "mini-screenshot" estilizado por agente featured
 * Isso e o que da vida pro card: o usuario vE o agente trabalhando.
 * ─────────────────────────────────────────────────────────────────── */

function CRMPreview() {
  const stages = [
    { label: 'Lead', count: 12, bright: true },
    { label: 'Qualif', count: 7 },
    { label: 'Proposta', count: 4 },
    { label: 'Fechado', count: 2, bright: true },
  ]
  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg border border-white/[0.06] bg-black/40 p-3">
      <div className="mb-2.5 flex items-center justify-between font-mono text-[0.55rem] uppercase tracking-[0.18em] text-white/40">
        <span>Pipeline · Abril</span>
        <span className="text-[#bfa68e]">25 leads</span>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {stages.map((s, i) => (
          <div
            key={s.label}
            className={cn(
              'rounded-md border p-2 transition-colors',
              s.bright
                ? 'border-[#bfa68e]/30 bg-[#bfa68e]/[0.08]'
                : 'border-white/[0.06] bg-white/[0.02]',
            )}
          >
            <div className="mb-1 flex items-center gap-1">
              <span
                className={cn(
                  'size-1 rounded-full',
                  s.bright ? 'bg-[#e6d4bd]' : 'bg-white/30',
                )}
              />
              <span className="font-mono text-[0.5rem] uppercase tracking-wider text-white/45">
                {s.label}
              </span>
            </div>
            <div
              className={cn(
                'text-[0.95rem] font-medium tabular-nums',
                s.bright ? 'text-white' : 'text-white/65',
              )}
            >
              {s.count}
            </div>
            <div className="mt-1 space-y-0.5">
              {Array.from({ length: Math.min(s.count, 3) }).map((_, j) => (
                <div
                  key={j}
                  className={cn(
                    'h-0.5 rounded-full',
                    s.bright ? 'bg-[#bfa68e]/60' : 'bg-white/10',
                  )}
                  style={{ width: `${60 + (i * 7 + j * 13) % 40}%` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function RedatorPreview() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg border border-white/[0.06] bg-black/40 p-3">
      <div className="mb-2 flex items-center gap-1.5 font-mono text-[0.55rem] uppercase tracking-[0.18em] text-white/40">
        <span className="size-1 animate-pulse rounded-full bg-[#e6d4bd]" />
        Redacao em andamento
      </div>
      <div className="mb-2 text-[0.72rem] font-medium tracking-tight text-white">
        Contestacao &mdash; Processo 0008345-12.2026
      </div>
      <div className="space-y-1">
        <div className="h-1.5 w-[92%] rounded-full bg-white/10" />
        <div className="h-1.5 w-[78%] rounded-full bg-white/10" />
        <div className="h-1.5 w-[88%] rounded-full bg-white/10" />
        <div className="h-1.5 w-[64%] rounded-full bg-[#bfa68e]/40" />
        <div className="h-1.5 w-[70%] rounded-full bg-white/10" />
        <div className="h-1.5 w-[52%] rounded-full bg-white/10" />
      </div>
      <div className="mt-2.5 flex items-center justify-between border-t border-white/[0.06] pt-2 font-mono text-[0.55rem] text-white/45">
        <span>Rev. 3</span>
        <span className="text-[#bfa68e]">12s atras</span>
      </div>
    </div>
  )
}

function PesquisaPreview() {
  const chips = [
    { tag: 'STF', n: 12, bright: true },
    { tag: 'STJ', n: 28, bright: true },
    { tag: 'TRF-3', n: 15 },
    { tag: 'TJSP', n: 47 },
    { tag: 'TJRJ', n: 9 },
  ]
  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg border border-white/[0.06] bg-black/40 p-3">
      <div className="mb-2 flex items-center justify-between font-mono text-[0.55rem] uppercase tracking-[0.18em] text-white/40">
        <span>Pesquisa ativa</span>
        <span className="text-[#bfa68e]">111 acordaos</span>
      </div>
      <div className="mb-2.5 rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-1.5 font-mono text-[0.62rem] text-white/55">
        <span className="text-[#bfa68e]">&gt;</span> dano moral + atraso de voo
      </div>
      <div className="flex flex-wrap gap-1">
        {chips.map((c) => (
          <div
            key={c.tag}
            className={cn(
              'inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[0.52rem] uppercase tracking-wider',
              c.bright
                ? 'border-[#bfa68e]/30 bg-[#bfa68e]/[0.08] text-[#e6d4bd]'
                : 'border-white/10 bg-white/[0.02] text-white/55',
            )}
          >
            <span>{c.tag}</span>
            <span
              className={cn(
                'tabular-nums',
                c.bright ? 'text-[#e6d4bd]/90' : 'text-white/40',
              )}
            >
              {c.n}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

const FEATURED_PREVIEWS: Record<string, () => React.ReactElement> = {
  crm: CRMPreview,
  redator: RedatorPreview,
  pesquisador: PesquisaPreview,
}

/* ───────────────────────────────────────────────────────────────────
 * CARDS
 * ─────────────────────────────────────────────────────────────────── */

function FeatureCard({ a, i }: { a: Agent; i: number }) {
  const Icon = a.icon
  const Preview = FEATURED_PREVIEWS[a.slug]
  return (
    <Reveal delay={0.06 + i * 0.07} className="h-full">
      <SpotlightCard
        color="rgba(191,166,142,0.6)"
        size={440}
        className="h-full rounded-2xl"
      >
        <Link
          href={`/dashboard/${a.slug}`}
          className={cn(
            'group relative flex h-full flex-col overflow-hidden rounded-2xl border p-5 transition-all duration-300',
            'border-[#bfa68e]/20 bg-gradient-to-br from-[#bfa68e]/[0.07] via-neutral-950 to-neutral-950',
            'hover:-translate-y-1 hover:border-[#bfa68e]/45 hover:shadow-[0_20px_60px_-20px_rgba(191,166,142,0.35)]',
          )}
        >
          {/* Halos decorativos */}
          <div
            aria-hidden
            className="pointer-events-none absolute -left-10 -top-10 size-44 rounded-full bg-[#bfa68e]/10 blur-3xl transition-opacity duration-500 group-hover:bg-[#bfa68e]/20"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 -right-16 size-44 rounded-full bg-[#8a6f55]/10 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#bfa68e]/70 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />

          {/* Header: icone + tag */}
          <div className="relative mb-4 flex items-start justify-between gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl border border-[#bfa68e]/30 bg-gradient-to-br from-[#bfa68e]/30 via-[#bfa68e]/10 to-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <Icon className="size-5 text-[#e6d4bd]" strokeWidth={1.75} />
            </div>
            <div className="flex items-center gap-2">
              {a.tag && (
                <span className="inline-flex items-center gap-1 rounded-full border border-[#bfa68e]/30 bg-[#bfa68e]/[0.08] px-2 py-0.5 font-mono text-[0.55rem] uppercase tracking-[0.15em] text-[#e6d4bd]">
                  <span className="size-1 animate-pulse rounded-full bg-[#bfa68e]" />
                  {a.tag}
                </span>
              )}
            </div>
          </div>

          {/* Titulo + desc */}
          <h3 className="relative text-[1.1rem] font-medium tracking-tight text-white">
            {a.name}
          </h3>
          <p className="relative mt-1.5 text-[13px] leading-relaxed text-white/60">
            {a.desc}
          </p>

          {/* Preview visual */}
          {Preview && (
            <div className="relative mt-5 min-h-[135px] flex-1">
              <Preview />
            </div>
          )}

          {/* CTA */}
          <div className="relative mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3.5">
            <span className="inline-flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-[#bfa68e]">
              <Sparkles className="size-3" strokeWidth={2} />
              Abrir agente
            </span>
            <ArrowUpRight
              className="size-3.5 text-[#bfa68e] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              strokeWidth={2}
            />
          </div>
        </Link>
      </SpotlightCard>
    </Reveal>
  )
}

function CompactCard({ a, i }: { a: Agent; i: number }) {
  const Icon = a.icon
  return (
    <Reveal delay={0.03 + (i % 6) * 0.03} className="h-full">
      <SpotlightCard
        color="rgba(255,255,255,0.4)"
        size={260}
        className="h-full rounded-xl"
      >
        <Link
          href={`/dashboard/${a.slug}`}
          className={cn(
            'group relative flex h-full flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-neutral-950/80 p-4 transition-all duration-300',
            'hover:-translate-y-0.5 hover:border-white/[0.18] hover:bg-neutral-950',
          )}
        >
          <div className="mb-3 flex items-start justify-between gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.02] transition-colors group-hover:border-[#bfa68e]/30 group-hover:bg-[#bfa68e]/[0.08]">
              <Icon
                className="size-[15px] text-white/60 transition-colors group-hover:text-[#bfa68e]"
                strokeWidth={1.75}
              />
            </div>
            {a.tag && (
              <span className="rounded-full border border-[#bfa68e]/25 bg-[#bfa68e]/[0.06] px-1.5 py-0.5 font-mono text-[0.5rem] uppercase tracking-wider text-[#e6d4bd]/90">
                {a.tag}
              </span>
            )}
          </div>

          <h3 className="text-[0.85rem] font-medium tracking-tight text-white">
            {a.name}
          </h3>
          <p className="mt-1 line-clamp-2 flex-1 text-[11.5px] leading-relaxed text-white/45">
            {a.desc}
          </p>

          <div className="mt-3 flex items-center justify-between">
            <span className="font-mono text-[0.5rem] uppercase tracking-[0.18em] text-white/30 transition-colors group-hover:text-[#bfa68e]/80">
              Abrir
            </span>
            <ArrowUpRight
              className="size-3 text-white/25 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#bfa68e]"
              strokeWidth={2}
            />
          </div>
        </Link>
      </SpotlightCard>
    </Reveal>
  )
}

/* ───────────────────────────────────────────────────────────────────
 * SECTION
 * ─────────────────────────────────────────────────────────────────── */

export function LexAgentsBento() {
  const featured = agents.filter((a) => a.featured)
  const rest = agents.filter((a) => !a.featured)

  return (
    <section id="agentes" className="relative isolate overflow-hidden bg-black py-28">
      {/* Layers decorativas de fundo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(65%_45%_at_50%_0%,rgba(191,166,142,0.12)_0%,transparent_70%)]"
      />
      <div aria-hidden className="absolute inset-x-0 top-1/3 bottom-0 -z-20">
        <RetroGrid opacity={0.14} angle={70} />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
      />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* ── Heading ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-14 max-w-2xl text-center"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-white/70">
            <Scale className="size-3 text-[#bfa68e]" strokeWidth={2} />
            23 agentes especializados
          </div>
          <h2 className="text-balance text-4xl font-medium tracking-tight text-white md:text-5xl">
            Do primeiro lead{' '}
            <span
              className="bg-gradient-to-br from-[#e6d4bd] via-[#bfa68e] to-[#8a6f55] bg-clip-text italic text-transparent"
              style={{ WebkitBackgroundClip: 'text' }}
            >
              a sentenca
            </span>
            .
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-balance text-white/65">
            Cada agente treinado numa funcao especifica do Direito brasileiro. Todos
            compartilham o mesmo CRM, a mesma biblioteca e os mesmos dados — sem
            cinco ferramentas abertas.
          </p>
        </motion.div>

        {/* ── Featured row (3 cards grandes com preview) ─────────── */}
        <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-3">
          {featured.map((a, i) => (
            <FeatureCard key={a.slug} a={a} i={i} />
          ))}
        </div>

        {/* ── Compact grid (20 agentes restantes) ────────────────── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {rest.map((a, i) => (
            <CompactCard key={a.slug} a={a} i={i} />
          ))}
        </div>

        {/* ── Rodape da secao (stats) ─────────────────────────────── */}
        <Reveal delay={0.2}>
          <div className="mt-16 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 border-y border-white/10 py-6">
            {[
              'Todos os 23 agentes no plano Pro',
              'Historico compartilhado',
              'Um unico CRM',
              'Sem troca de contexto',
            ].map((t) => (
              <div
                key={t}
                className="flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-white/55"
              >
                <span className="size-1 rounded-full bg-[#bfa68e]/60" />
                {t}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

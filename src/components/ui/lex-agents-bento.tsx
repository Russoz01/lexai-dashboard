'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRight, Scale, Sparkles, Clock3 } from 'lucide-react'
import { SpotlightCard } from '@/components/ui/spotlight-card'
import { agents, modules, type CatalogItem } from '@/lib/catalog'
import { cn } from '@/lib/utils'

/* ════════════════════════════════════════════════════════════════════
 * LexAgentsBento (v4 · 2026-04-18)
 * ────────────────────────────────────────────────────────────────────
 * Feedback: bento enchia linguica (pontava Configuracoes, Design System,
 * Planos, Historico como "agentes"). E usava o mesmo fade-up do resto
 * do site. Agora:
 *
 *  · DADOS 100% do catalog.ts (fonte de verdade da dashboard).
 *    4 modulos (Casos, CRM, Jurimetria, Marketing) + 27 agentes
 *    (todos implementados na v10.8).
 *  · Hierarquia honesta:
 *      1) 3 MODULOS featured com preview animado
 *      2) 14 AGENTES prontos — grid denso
 *      3) 8 em BREVE — styling atenuado + badge explicito
 *  · Animacoes NOVAS (nao reutiliza Reveal fade-up):
 *      · lex-bento-card (scale-in 0.94→1)
 *      · lex-pipeline-flow (dot cruza o CRM)
 *      · lex-line-draw (linhas do Redator aparecem escritas)
 *      · lex-chip-pop (chips dos tribunais entram com bounce)
 *  · Contagem real v10.8: 27 agentes implementados + 4 módulos (Casos novo).
 * ═══════════════════════════════════════════════════════════════════ */

/* ───────────────────────────────────────────────────────────────────
 * PREVIEWS dos 3 modulos — cada um com animacao INTERNA
 * ─────────────────────────────────────────────────────────────────── */

function CRMPreview() {
  const stages = [
    { label: 'Lead', n: 12 },
    { label: 'Qualif', n: 7 },
    { label: 'Proposta', n: 4 },
    { label: 'Fechado', n: 2 },
  ]
  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg border border-white/[0.06] bg-black/40 p-3">
      <div className="mb-2.5 flex items-center justify-between font-mono text-[0.55rem] uppercase tracking-[0.18em] text-white/40">
        <span>Pipeline · abril</span>
        <span className="text-[#bfa68e]">25 leads</span>
      </div>
      <div className="relative">
        {/* Track horizontal */}
        <div className="absolute inset-x-2 top-[22px] h-px bg-white/10" />
        {/* Dot que flui pelos 4 stages */}
        <div className="lex-pipeline-dot pointer-events-none absolute left-0 top-[19px] w-[calc(25%-8px)] translate-x-0">
          <div className="ml-[12px] size-[7px] rounded-full bg-[#e6d4bd] shadow-[0_0_12px_rgba(230,212,189,0.9)]" />
        </div>

        <div className="relative grid grid-cols-4 gap-1.5">
          {stages.map((s) => (
            <div
              key={s.label}
              className="rounded-md border border-white/[0.08] bg-white/[0.02] p-2"
            >
              <div className="font-mono text-[0.5rem] uppercase tracking-wider text-white/45">
                {s.label}
              </div>
              <div className="mt-1 text-[0.95rem] font-medium tabular-nums text-white">
                {s.n}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function JurimetriaPreview() {
  const bars = [44, 72, 58, 88, 65, 92, 78] // % heights
  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg border border-white/[0.06] bg-black/40 p-3">
      <div className="mb-2 flex items-center justify-between font-mono text-[0.55rem] uppercase tracking-[0.18em] text-white/40">
        <span>Taxa de exito · 3o grau</span>
        <span className="text-[#bfa68e]">72%</span>
      </div>
      <div className="flex h-[60px] items-end gap-1.5">
        {bars.map((h, i) => (
          <div
            key={i}
            className="lex-line-draw flex-1 rounded-sm bg-gradient-to-t from-[#bfa68e]/20 via-[#bfa68e]/50 to-[#e6d4bd]"
            style={{
              height: `${h}%`,
              animationDelay: `${i * 0.09}s`,
              transformOrigin: 'bottom center',
            }}
          />
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between font-mono text-[0.52rem] uppercase tracking-wider text-white/40">
        <span>jan</span>
        <span>fev</span>
        <span>mar</span>
        <span>abr</span>
        <span>mai</span>
        <span>jun</span>
        <span>jul</span>
      </div>
    </div>
  )
}

function MarketingPreview() {
  const items = [
    { day: '08', kind: 'Post', bright: true },
    { day: '09', kind: 'Reels' },
    { day: '11', kind: 'News', bright: true },
    { day: '15', kind: 'Post' },
    { day: '18', kind: 'Reels', bright: true },
  ]
  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg border border-white/[0.06] bg-black/40 p-3">
      <div className="mb-2 flex items-center justify-between font-mono text-[0.55rem] uppercase tracking-[0.18em] text-white/40">
        <span>Agenda · abr/26</span>
        <span className="text-[#bfa68e]">OAB-compliant</span>
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {items.map((it, i) => (
          <div
            key={i}
            className={cn(
              'lex-chip-pop flex flex-col rounded-md border p-1.5',
              it.bright
                ? 'border-[#bfa68e]/30 bg-[#bfa68e]/[0.08]'
                : 'border-white/[0.06] bg-white/[0.02]',
            )}
            style={{ animationDelay: `${i * 0.08 + 0.15}s` }}
          >
            <div
              className={cn(
                'font-mono text-[0.9rem] font-medium tabular-nums',
                it.bright ? 'text-[#e6d4bd]' : 'text-white/70',
              )}
            >
              {it.day}
            </div>
            <div
              className={cn(
                'font-mono text-[0.48rem] uppercase tracking-wider',
                it.bright ? 'text-[#bfa68e]' : 'text-white/40',
              )}
            >
              {it.kind}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-1.5 font-mono text-[0.5rem] uppercase tracking-wider text-white/45">
        <span className="size-1 rounded-full bg-[#bfa68e]" />
        5 publicacoes agendadas
      </div>
    </div>
  )
}

const MODULE_PREVIEWS: Record<string, () => React.ReactElement> = {
  crm: CRMPreview,
  jurimetria: JurimetriaPreview,
  marketing: MarketingPreview,
}

/* ───────────────────────────────────────────────────────────────────
 * CARDS
 * ─────────────────────────────────────────────────────────────────── */

function ModuleCard({ item, i }: { item: CatalogItem; i: number }) {
  const Icon = item.Icon
  const Preview = MODULE_PREVIEWS[item.slug]
  return (
    <div
      className="lex-bento-card h-full"
      style={{ animationDelay: `${i * 0.08}s` }}
    >
    <SpotlightCard
      color="rgba(191,166,142,0.55)"
      size={440}
      className="h-full rounded-2xl"
    >
      <Link
        href={item.href}
        className={cn(
          'group relative flex h-full flex-col overflow-hidden rounded-2xl border p-5 transition-all duration-300',
          'border-[#bfa68e]/25 bg-gradient-to-br from-[#bfa68e]/[0.08] via-neutral-950 to-neutral-950',
          'hover:-translate-y-1 hover:border-[#bfa68e]/50 hover:shadow-[0_20px_60px_-20px_rgba(191,166,142,0.38)]',
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -left-10 -top-10 size-44 rounded-full bg-[#bfa68e]/10 blur-3xl transition-opacity duration-500 group-hover:bg-[#bfa68e]/20"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#bfa68e]/70 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />

        {/* Header */}
        <div className="relative mb-4 flex items-start justify-between gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl border border-[#bfa68e]/30 bg-gradient-to-br from-[#bfa68e]/30 via-[#bfa68e]/10 to-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <Icon className="size-5 text-[#e6d4bd]" strokeWidth={1.75} />
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-[#bfa68e]/30 bg-[#bfa68e]/[0.08] px-2 py-0.5 font-mono text-[0.55rem] uppercase tracking-[0.15em] text-[#e6d4bd]">
            Modulo
          </span>
        </div>

        <h3 className="relative text-[1.1rem] font-medium tracking-tight text-white">
          {item.label}
        </h3>
        <p className="relative mt-1.5 text-[13px] leading-relaxed text-white/60">
          {item.desc}
        </p>

        {Preview && (
          <div className="relative mt-5 min-h-[125px] flex-1">
            <Preview />
          </div>
        )}

        <div className="relative mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3.5">
          <span className="inline-flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-[#bfa68e]">
            <Sparkles className="size-3" strokeWidth={2} />
            Conheca o modulo
          </span>
          <ArrowUpRight
            className="size-3.5 text-[#bfa68e] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            strokeWidth={2}
          />
        </div>
      </Link>
    </SpotlightCard>
    </div>
  )
}

function AgentCard({
  item,
  i,
  upcoming = false,
}: {
  item: CatalogItem
  i: number
  upcoming?: boolean
}) {
  const Icon = item.Icon
  return (
    <Link
      href={upcoming ? '/dashboard/em-breve?feature=' + item.slug : item.href}
      className={cn(
        'lex-bento-card group relative flex h-full flex-col overflow-hidden rounded-xl border p-4 transition-all duration-300',
        upcoming
          ? 'border-white/[0.05] bg-neutral-950/40 hover:border-white/[0.12]'
          : 'border-white/[0.08] bg-neutral-950/80 hover:-translate-y-0.5 hover:border-[#bfa68e]/30 hover:bg-neutral-950',
      )}
      style={{ animationDelay: `${0.2 + (i % 14) * 0.035}s` }}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div
          className={cn(
            'flex size-8 items-center justify-center rounded-lg border transition-colors',
            upcoming
              ? 'border-white/[0.06] bg-white/[0.015]'
              : 'border-white/[0.08] bg-white/[0.02] group-hover:border-[#bfa68e]/30 group-hover:bg-[#bfa68e]/[0.08]',
          )}
        >
          <Icon
            className={cn(
              'size-[15px] transition-colors',
              upcoming
                ? 'text-white/30'
                : 'text-white/60 group-hover:text-[#bfa68e]',
            )}
            strokeWidth={1.75}
          />
        </div>
        {upcoming && (
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-1.5 py-0.5 font-mono text-[0.48rem] uppercase tracking-wider text-white/50">
            <Clock3 className="size-[9px]" strokeWidth={2} />
            Em breve
          </span>
        )}
      </div>

      <h3
        className={cn(
          'text-[0.85rem] font-medium tracking-tight',
          upcoming ? 'text-white/65' : 'text-white',
        )}
      >
        {item.label}
      </h3>
      <p
        className={cn(
          'mt-1 line-clamp-2 flex-1 text-[11.5px] leading-relaxed',
          upcoming ? 'text-white/30' : 'text-white/45',
        )}
      >
        {item.desc}
      </p>

      {!upcoming && (
        <div className="mt-3 flex items-center justify-between">
          <span className="font-mono text-[0.5rem] uppercase tracking-[0.18em] text-white/30 transition-colors group-hover:text-[#bfa68e]/80">
            Abrir
          </span>
          <ArrowUpRight
            className="size-3 text-white/25 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#bfa68e]"
            strokeWidth={2}
          />
        </div>
      )}
    </Link>
  )
}

/* ───────────────────────────────────────────────────────────────────
 * SECTION
 * ─────────────────────────────────────────────────────────────────── */

export function LexAgentsBento() {
  const modulesList = modules() // 3 items (CRM, Jurimetria, Marketing)
  const agentList = agents()    // 22 items
  const ready = agentList.filter((a) => a.implemented)   // 14
  const upcoming = agentList.filter((a) => !a.implemented) // 8

  return (
    <section id="agentes" className="relative isolate overflow-hidden bg-black py-28">
      {/* Radial tip topo · sem retro-grid duplicado do hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(65%_45%_at_50%_0%,rgba(191,166,142,0.10)_0%,transparent_65%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
      />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* ── Heading honesto ────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-14 max-w-2xl text-center"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-white/70">
            <Scale className="size-3 text-[#bfa68e]" strokeWidth={2} />
            {agentList.length} agentes &middot; {modulesList.length} modulos
          </div>
          <h2 className="text-balance text-4xl font-medium tracking-tight text-white md:text-5xl">
            {ready.length} agentes,{' '}
            <span
              className="bg-gradient-to-br from-[#e6d4bd] via-[#bfa68e] to-[#8a6f55] bg-clip-text italic text-transparent"
              style={{ WebkitBackgroundClip: 'text' }}
            >
              todos ativos
            </span>
            .
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-balance text-white/65">
            Especialistas treinados em funções específicas do Direito brasileiro,
            com CRM, jurimetria e marketing OAB-compliant no mesmo lugar.
          </p>
        </motion.div>

        {/* ── Modulos (3 cards grandes com preview) ──────────────── */}
        <div className="mb-3 flex items-center justify-between">
          <div className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-white/45">
            Plataforma &mdash; {modulesList.length} módulos
          </div>
          <div className="h-px flex-1 ml-4 bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
        </div>
        <div className="mb-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {modulesList.map((m, i) => (
            <ModuleCard key={m.slug} item={m} i={i} />
          ))}
        </div>

        {/* ── Agentes prontos ──────────────────────────────────── */}
        <div className="mb-3 flex items-center justify-between">
          <div className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-[#bfa68e]">
            <span className="mr-2 inline-block size-1.5 rounded-full bg-emerald-400/80 align-middle" />
            Agentes ativos &mdash; {ready.length} disponíveis
          </div>
          <div className="h-px flex-1 ml-4 bg-gradient-to-r from-[#bfa68e]/20 via-white/5 to-transparent" />
        </div>
        <div className="mb-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          {ready.map((a, i) => (
            <AgentCard key={a.slug} item={a} i={i} />
          ))}
        </div>

        {/* ── Agentes em breve (só renderiza se realmente houver algum) ─── */}
        {upcoming.length > 0 && (
          <>
            <div className="mb-3 flex items-center justify-between">
              <div className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-white/45">
                <Clock3 className="mr-2 inline size-3 align-[-2px]" strokeWidth={2} />
                Em desenvolvimento &mdash; {upcoming.length} chegando
              </div>
              <div className="h-px flex-1 ml-4 bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {upcoming.map((a, i) => (
                <AgentCard key={a.slug} item={a} i={i} upcoming />
              ))}
            </div>
          </>
        )}

        {/* ── Footer stats ─────────────────────────────────────── */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 border-y border-white/10 py-6">
          {[
            `${ready.length}/${agentList.length} agentes liberados`,
            '3 modulos de plataforma',
            'Um unico CRM',
            'Compliance OAB · LGPD',
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
      </div>
    </section>
  )
}

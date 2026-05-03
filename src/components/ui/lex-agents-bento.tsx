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
    <div
      className="relative h-full w-full overflow-hidden rounded-lg p-3"
      style={{ border: '1px solid var(--border)', background: 'var(--glass)' }}
    >
      <div
        className="mb-2.5 flex items-center justify-between font-mono text-[0.55rem] uppercase tracking-[0.18em]"
        style={{ color: 'var(--text-muted)' }}
      >
        <span>Pipeline · abril</span>
        <span style={{ color: 'var(--accent)' }}>25 leads</span>
      </div>
      <div className="relative">
        {/* Track horizontal */}
        <div className="absolute inset-x-2 top-[22px] h-px" style={{ background: 'var(--border)' }} />
        {/* Dot que flui pelos 4 stages */}
        <div className="lex-pipeline-dot pointer-events-none absolute left-0 top-[19px] w-[calc(25%-8px)] translate-x-0">
          <div className="ml-[12px] size-[7px] rounded-full bg-[#e6d4bd] shadow-[0_0_12px_rgba(230,212,189,0.9)]" />
        </div>

        <div className="relative grid grid-cols-4 gap-1.5">
          {stages.map((s) => (
            <div
              key={s.label}
              className="rounded-md p-2"
              style={{ border: '1px solid var(--border)', background: 'var(--hover)' }}
            >
              <div
                className="font-mono text-[0.5rem] uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}
              >
                {s.label}
              </div>
              <div
                className="mt-1 text-[0.95rem] font-medium tabular-nums"
                style={{ color: 'var(--text-primary)' }}
              >
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
    <div
      className="relative h-full w-full overflow-hidden rounded-lg p-3"
      style={{ border: '1px solid var(--border)', background: 'var(--glass)' }}
    >
      <div
        className="mb-2 flex items-center justify-between font-mono text-[0.55rem] uppercase tracking-[0.18em]"
        style={{ color: 'var(--text-muted)' }}
      >
        <span>Taxa de exito · 3o grau</span>
        <span style={{ color: 'var(--accent)' }}>72%</span>
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
      <div
        className="mt-2 flex items-center justify-between font-mono text-[0.52rem] uppercase tracking-wider"
        style={{ color: 'var(--text-muted)' }}
      >
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
    <div
      className="relative h-full w-full overflow-hidden rounded-lg p-3"
      style={{ border: '1px solid var(--border)', background: 'var(--glass)' }}
    >
      <div
        className="mb-2 flex items-center justify-between font-mono text-[0.55rem] uppercase tracking-[0.18em]"
        style={{ color: 'var(--text-muted)' }}
      >
        <span>Agenda · abr/26</span>
        <span style={{ color: 'var(--accent)' }}>OAB-compliant</span>
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {items.map((it, i) => (
          <div
            key={i}
            className="lex-chip-pop flex flex-col rounded-md p-1.5"
            style={{
              animationDelay: `${i * 0.08 + 0.15}s`,
              border: it.bright ? '1px solid var(--stone-line)' : '1px solid var(--border)',
              background: it.bright ? 'var(--accent-light)' : 'var(--hover)',
            }}
          >
            <div
              className="font-mono text-[0.9rem] font-medium tabular-nums"
              style={{ color: it.bright ? 'var(--accent)' : 'var(--text-primary)' }}
            >
              {it.day}
            </div>
            <div
              className="font-mono text-[0.48rem] uppercase tracking-wider"
              style={{ color: it.bright ? 'var(--accent)' : 'var(--text-muted)' }}
            >
              {it.kind}
            </div>
          </div>
        ))}
      </div>
      <div
        className="mt-2 flex items-center gap-1.5 font-mono text-[0.5rem] uppercase tracking-wider"
        style={{ color: 'var(--text-muted)' }}
      >
        <span className="size-1 rounded-full" style={{ background: 'var(--accent)' }} />
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
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_-20px_rgba(191,166,142,0.38)]"
        style={{
          border: '1px solid var(--stone-line)',
          background: 'var(--card-bg)',
        }}
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
          <div
            className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#bfa68e]/30 via-[#bfa68e]/10 to-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
            style={{ border: '1px solid var(--stone-line)' }}
          >
            <Icon className="size-5" strokeWidth={1.75} style={{ color: 'var(--accent)' }} />
          </div>
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[0.55rem] uppercase tracking-[0.15em]"
            style={{
              border: '1px solid var(--stone-line)',
              background: 'var(--accent-light)',
              color: 'var(--accent)',
            }}
          >
            Modulo
          </span>
        </div>

        <h3
          className="relative text-[1.1rem] font-medium tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          {item.label}
        </h3>
        <p
          className="relative mt-1.5 text-[13px] leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          {item.desc}
        </p>

        {Preview && (
          <div className="relative mt-5 min-h-[125px] flex-1">
            <Preview />
          </div>
        )}

        <div
          className="relative mt-4 flex items-center justify-between pt-3.5"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <span
            className="inline-flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-[0.18em]"
            style={{ color: 'var(--accent)' }}
          >
            <Sparkles className="size-3" strokeWidth={2} />
            Conheca o modulo
          </span>
          <ArrowUpRight
            className="size-3.5 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            strokeWidth={2}
            style={{ color: 'var(--accent)' }}
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
        'lex-bento-card group relative flex h-full flex-col overflow-hidden rounded-xl p-4 transition-all duration-300',
        !upcoming && 'hover:-translate-y-0.5',
      )}
      style={{
        animationDelay: `${0.2 + (i % 14) * 0.035}s`,
        border: '1px solid var(--border)',
        background: upcoming ? 'var(--hover)' : 'var(--card-bg)',
      }}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div
          className="flex size-8 items-center justify-center rounded-lg transition-colors"
          style={{
            border: '1px solid var(--border)',
            background: upcoming ? 'var(--hover)' : 'var(--accent-light)',
          }}
        >
          <Icon
            className="size-[15px] transition-colors"
            strokeWidth={1.75}
            style={{ color: upcoming ? 'var(--text-muted)' : 'var(--accent)' }}
          />
        </div>
        {upcoming && (
          <span
            className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 font-mono text-[0.48rem] uppercase tracking-wider"
            style={{
              border: '1px solid var(--border)',
              background: 'var(--hover)',
              color: 'var(--text-muted)',
            }}
          >
            <Clock3 className="size-[9px]" strokeWidth={2} />
            Em breve
          </span>
        )}
      </div>

      <h3
        className="text-[0.85rem] font-medium tracking-tight"
        style={{ color: upcoming ? 'var(--text-secondary)' : 'var(--text-primary)' }}
      >
        {item.label}
      </h3>
      <p
        className="mt-1 line-clamp-2 flex-1 text-[11.5px] leading-relaxed"
        style={{ color: upcoming ? 'var(--text-muted)' : 'var(--text-secondary)' }}
      >
        {item.desc}
      </p>

      {!upcoming && (
        <div className="mt-3 flex items-center justify-between">
          <span
            className="font-mono text-[0.5rem] uppercase tracking-[0.18em] transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            Abrir
          </span>
          <ArrowUpRight
            className="size-3 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            strokeWidth={2}
            style={{ color: 'var(--accent)' }}
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
    <section
      id="agentes"
      className="relative isolate overflow-hidden py-28"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Radial tip topo · sem retro-grid duplicado do hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(65%_45%_at_50%_0%,rgba(191,166,142,0.10)_0%,transparent_65%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background: 'linear-gradient(to right, transparent, var(--border), transparent)',
        }}
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
          <div
            className="mb-5 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.2em]"
            style={{
              border: '1px solid var(--border)',
              background: 'var(--hover)',
              color: 'var(--text-secondary)',
            }}
          >
            <Scale className="size-3" strokeWidth={2} style={{ color: 'var(--accent)' }} />
            {agentList.length} agentes &middot; {modulesList.length} modulos
          </div>
          <h2
            className="text-balance text-4xl font-medium tracking-tight md:text-5xl"
            style={{ color: 'var(--text-primary)' }}
          >
            {ready.length} agentes,{' '}
            <span className="text-grad-accent italic">
              todos ativos
            </span>
            .
          </h2>
          <p
            className="mx-auto mt-5 max-w-xl text-balance"
            style={{ color: 'var(--text-secondary)' }}
          >
            Especialistas treinados em funções específicas do Direito brasileiro,
            com CRM, jurimetria e marketing OAB-compliant no mesmo lugar.
          </p>
        </motion.div>

        {/* ── Modulos (3 cards grandes com preview) ──────────────── */}
        <div className="mb-3 flex items-center justify-between">
          <div
            className="font-mono text-[0.6rem] uppercase tracking-[0.2em]"
            style={{ color: 'var(--text-muted)' }}
          >
            Plataforma &mdash; {modulesList.length} módulos
          </div>
          <div
            className="h-px flex-1 ml-4"
            style={{ background: 'linear-gradient(to right, var(--border), transparent)' }}
          />
        </div>
        <div className="mb-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {modulesList.map((m, i) => (
            <ModuleCard key={m.slug} item={m} i={i} />
          ))}
        </div>

        {/* ── Agentes prontos ──────────────────────────────────── */}
        <div className="mb-3 flex items-center justify-between">
          <div
            className="font-mono text-[0.6rem] uppercase tracking-[0.2em]"
            style={{ color: 'var(--accent)' }}
          >
            <span className="mr-2 inline-block size-1.5 rounded-full bg-emerald-400/80 align-middle" />
            Agentes ativos &mdash; {ready.length} disponíveis
          </div>
          <div
            className="h-px flex-1 ml-4"
            style={{ background: 'linear-gradient(to right, var(--stone-line), transparent)' }}
          />
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
              <div
                className="font-mono text-[0.6rem] uppercase tracking-[0.2em]"
                style={{ color: 'var(--text-muted)' }}
              >
                <Clock3 className="mr-2 inline size-3 align-[-2px]" strokeWidth={2} />
                Em desenvolvimento &mdash; {upcoming.length} chegando
              </div>
              <div
                className="h-px flex-1 ml-4"
                style={{ background: 'linear-gradient(to right, var(--border), transparent)' }}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {upcoming.map((a, i) => (
                <AgentCard key={a.slug} item={a} i={i} upcoming />
              ))}
            </div>
          </>
        )}

        {/* ── Footer stats ─────────────────────────────────────── */}
        <div
          className="mt-16 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 py-6"
          style={{
            borderTop: '1px solid var(--border)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          {[
            `${ready.length}/${agentList.length} agentes liberados`,
            '3 modulos de plataforma',
            'Um unico CRM',
            'Compliance OAB · LGPD',
          ].map((t) => (
            <div
              key={t}
              className="flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.2em]"
              style={{ color: 'var(--text-secondary)' }}
            >
              <span className="size-1 rounded-full" style={{ background: 'var(--accent)' }} />
              {t}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

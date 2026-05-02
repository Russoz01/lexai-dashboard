'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowUpRight,
  Sparkles,
  MessageSquare,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { AtelierBg, AtelierDivider } from './atelier-bg'
import {
  heroContainer,
  heroItem,
  listContainer,
  listItem,
  viewportOnce,
  hoverLift,
  EASE_EDITORIAL,
} from '@/lib/motion-variants'

/* ══════════════════════════════════════════════════════════════════════
 * AgentPreviewStage — palco editorial para novos agentes em construção
 * ──────────────────────────────────────────────────────────────────────
 * Parametrizável para os 8 agentes novos (Casos, CNJ, Comparador, Risco,
 * Flashcards, Plano, Jurimetria, Marketing). Não é tela "em breve" —
 * é uma página real de preview que explica o que o agente faz, mostra
 * capacidades, exemplos de input/output, e direciona pro Chat enquanto
 * a versão full ainda é alpha.
 *
 * Estrutura:
 *   1. Hero com kicker + nome + tagline + status beta
 *   2. Grid 2x2 ou 3 "Capacidades" — features principais
 *   3. Exemplo concreto — mockup de input/output
 *   4. CTA pra Chat (onde o agente já roda em beta via orquestrador)
 * ═══════════════════════════════════════════════════════════════════ */

export interface AgentCapability {
  Icon: LucideIcon
  title: string
  body: string
  /** Destaque visual — ressalta card com border champagne */
  featured?: boolean
}

export interface AgentExample {
  prompt: string
  response: string
  /** Label curtinha mostrada acima do output (ex: "Output estimado") */
  outputLabel?: string
}

export interface AgentPreviewStageProps {
  /** Ícone principal do agente (lucide) */
  Icon: LucideIcon
  /** Kicker monospace no topo (ex: "Nº 009 · Agente Casos") */
  kicker: string
  /** Nome do agente, renderizado em gradient champagne */
  name: string
  /** Tagline descritiva logo abaixo do nome */
  tagline: string
  /** Parágrafo explicando o que o agente faz */
  description: string
  /** Status label (ex: "Beta fechado · Release 2026-05") */
  statusLabel: string
  /** Plano mínimo exibido no badge */
  planBadge?: 'Pro' | 'Enterprise'
  /** 3-6 capacidades que o agente oferece */
  capabilities: AgentCapability[]
  /** Exemplo concreto de uso */
  example: AgentExample
  /** Tint personalizado do glow (default: champagne) */
  glowTint?: string
}

export function AgentPreviewStage({
  Icon,
  kicker,
  name,
  tagline,
  description,
  statusLabel,
  planBadge = 'Pro',
  capabilities,
  example,
  glowTint = '#bfa68e',
}: AgentPreviewStageProps) {
  return (
    <div className="relative min-h-full bg-[#0a0807] text-white antialiased">
      <AtelierBg variant="default" glowTint={glowTint} />

      <div className="relative z-10 mx-auto max-w-5xl px-6 py-14 md:py-20">
        {/* ═══════ Voltar ═══════ */}
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: EASE_EDITORIAL }}
        >
          <Link
            href="/dashboard"
            className="group mb-10 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/55 backdrop-blur transition-colors hover:border-[#bfa68e]/40 hover:text-white"
          >
            <ArrowLeft
              size={12}
              strokeWidth={1.75}
              className="transition-transform group-hover:-translate-x-0.5"
            />
            Voltar ao dashboard
          </Link>
        </motion.div>

        {/* ═══════ Hero ═══════ */}
        <motion.div
          variants={heroContainer}
          initial="hidden"
          animate="show"
          className="mb-16"
        >
          <motion.div variants={heroItem} className="mb-5 flex items-center gap-3">
            <div
              className="font-mono text-[0.62rem] uppercase tracking-[0.32em]"
              style={{ color: glowTint }}
            >
              {kicker}
            </div>
            <div className="h-px w-12 bg-gradient-to-r from-[#bfa68e]/60 to-transparent" />
          </motion.div>

          <motion.div variants={heroItem} className="mb-7 flex items-center gap-5">
            <div className="relative">
              <div
                className="absolute -inset-4 rounded-full blur-2xl"
                style={{ backgroundColor: `${glowTint}33` }}
              />
              <div
                className="relative flex size-16 items-center justify-center rounded-2xl border bg-gradient-to-br from-[#1a1410] via-[#0a0807] to-[#050403] shadow-[0_0_32px_rgba(191,166,142,0.25)]"
                style={{ borderColor: `${glowTint}50`, color: glowTint }}
              >
                <Icon size={26} strokeWidth={1.4} />
              </div>
            </div>
            <div className="flex gap-2">
              <div
                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.22em]"
                style={{
                  borderColor: `${glowTint}40`,
                  color: glowTint,
                  background: `linear-gradient(to right, ${glowTint}14, transparent)`,
                }}
              >
                <span
                  className="inline-block size-1.5 animate-pulse rounded-full"
                  style={{ backgroundColor: glowTint }}
                />
                {statusLabel}
              </div>
              <div className="inline-flex items-center rounded-full border border-white/12 bg-white/[0.03] px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-white/60">
                Plano {planBadge}
              </div>
            </div>
          </motion.div>

          <motion.h1
            variants={heroItem}
            className="mb-5 text-balance text-5xl font-light leading-[1.02] tracking-tight md:text-6xl"
          >
            <em
              className="bg-clip-text italic text-transparent"
              style={{
                backgroundImage: `linear-gradient(to right, #f5e8d3, ${glowTint}, #8a6f55)`,
              }}
            >
              {name}
            </em>
          </motion.h1>

          <motion.p
            variants={heroItem}
            className="mb-6 max-w-2xl text-xl font-light leading-[1.35] tracking-tight text-white/80 md:text-2xl"
          >
            {tagline}
          </motion.p>

          <motion.p
            variants={heroItem}
            className="max-w-2xl text-base leading-relaxed text-white/55 md:text-[17px]"
          >
            {description}
          </motion.p>
        </motion.div>

        <AtelierDivider />

        {/* ═══════ Capacidades ═══════ */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={listContainer}
          className="mb-16"
        >
          <motion.div
            variants={listItem}
            className="mb-8 flex items-baseline justify-between"
          >
            <h2 className="text-2xl font-medium tracking-tight text-white md:text-3xl">
              Capacidades
            </h2>
            <span
              className="font-mono text-[0.6rem] uppercase tracking-[0.28em]"
              style={{ color: `${glowTint}CC` }}
            >
              Nº 009/I
            </span>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2">
            {capabilities.map((cap) => {
              const CapIcon = cap.Icon
              return (
                <motion.article
                  key={cap.title}
                  variants={listItem}
                  whileHover={hoverLift}
                  className={`group relative overflow-hidden rounded-2xl border p-6 backdrop-blur transition-colors ${
                    cap.featured
                      ? 'border-[#bfa68e]/30 bg-gradient-to-br from-[#bfa68e]/[0.06] to-transparent'
                      : 'border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent hover:border-[#bfa68e]/25'
                  }`}
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                    style={{ backgroundColor: `${glowTint}30` }}
                  />
                  <div
                    className="mb-4 inline-flex size-10 items-center justify-center rounded-xl border"
                    style={{
                      borderColor: `${glowTint}40`,
                      color: glowTint,
                      background: `linear-gradient(to bottom right, ${glowTint}20, transparent)`,
                    }}
                  >
                    <CapIcon size={18} strokeWidth={1.5} />
                  </div>
                  <h3 className="mb-2 text-lg font-medium text-white">{cap.title}</h3>
                  <p className="text-sm leading-relaxed text-white/60">{cap.body}</p>
                </motion.article>
              )
            })}
          </div>
        </motion.div>

        <AtelierDivider />

        {/* ═══════ Exemplo ═══════ */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 0.65, ease: EASE_EDITORIAL }}
          className="mb-16"
        >
          <div className="mb-8 flex items-baseline justify-between">
            <h2 className="text-2xl font-medium tracking-tight text-white md:text-3xl">
              Exemplo em ação
            </h2>
            <span
              className="font-mono text-[0.6rem] uppercase tracking-[0.28em]"
              style={{ color: `${glowTint}CC` }}
            >
              Nº 009/II
            </span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#0f0c0a]/80 to-[#0a0807]/40 backdrop-blur">
            {/* prompt */}
            <div className="border-b border-white/8 p-6 md:p-8">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg border border-white/12 bg-white/[0.04] text-white/60">
                  <MessageSquare size={13} strokeWidth={1.6} />
                </div>
                <span className="font-mono text-[0.62rem] uppercase tracking-[0.25em] text-white/45">
                  Input do advogado
                </span>
              </div>
              <p className="pl-9 text-[15px] leading-relaxed text-white/80">
                {example.prompt}
              </p>
            </div>

            {/* response */}
            <div
              className="relative p-6 md:p-8"
              style={{
                background: `linear-gradient(to bottom, ${glowTint}06, transparent)`,
              }}
            >
              <div className="mb-3 flex items-center gap-2">
                <div
                  className="flex size-7 items-center justify-center rounded-lg border"
                  style={{
                    borderColor: `${glowTint}40`,
                    color: glowTint,
                    background: `linear-gradient(to bottom right, ${glowTint}22, transparent)`,
                  }}
                >
                  <Zap size={13} strokeWidth={1.6} />
                </div>
                <span
                  className="font-mono text-[0.62rem] uppercase tracking-[0.25em]"
                  style={{ color: `${glowTint}CC` }}
                >
                  {example.outputLabel ?? 'Resposta Pralvex'}
                </span>
              </div>
              <div className="pl-9 font-mono text-[13px] leading-[1.7] text-white/75 whitespace-pre-wrap">
                {example.response}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══════ CTA ═══════ */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 0.6, ease: EASE_EDITORIAL }}
          className="relative overflow-hidden rounded-2xl border border-[#bfa68e]/22 bg-gradient-to-br from-[#bfa68e]/[0.08] via-white/[0.02] to-transparent p-8 md:p-12"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 size-60 rounded-full opacity-40 blur-3xl"
            style={{ backgroundColor: `${glowTint}40` }}
          />
          <div className="relative">
            <div
              className="mb-3 font-mono text-[0.6rem] uppercase tracking-[0.28em]"
              style={{ color: `${glowTint}CC` }}
            >
              Enquanto a versão dedicada amadurece
            </div>
            <h3 className="mb-3 max-w-xl text-2xl font-light tracking-tight text-white md:text-3xl">
              Já dá para usar esse agente{' '}
              <em
                className="bg-clip-text italic text-transparent"
                style={{
                  backgroundImage: `linear-gradient(to right, #f5e8d3, ${glowTint}, #8a6f55)`,
                }}
              >
                agora pelo Chat
              </em>
              .
            </h3>
            <p className="mb-7 max-w-xl text-[15px] leading-relaxed text-white/60">
              O orquestrador roteia pro motor do {name} em modo beta. A UI dedicada
              chega na próxima janela — e seus históricos seguem junto.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard/chat"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#e6d4bd] via-[#bfa68e] to-[#8a6f55] px-5 py-2.5 text-sm font-medium text-[#0a0807] shadow-[0_0_28px_rgba(191,166,142,0.3)] transition-shadow hover:shadow-[0_0_40px_rgba(191,166,142,0.5)]"
              >
                <Sparkles size={14} strokeWidth={2} />
                Usar via Chat
                <ArrowUpRight
                  size={14}
                  strokeWidth={2}
                  className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-5 py-2.5 text-sm text-white/75 backdrop-blur transition-colors hover:border-[#bfa68e]/40 hover:text-white"
              >
                Ver outros agentes
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ═══════ Footer meta ═══════ */}
        <div className="mt-16 flex items-center justify-between font-mono text-[0.6rem] uppercase tracking-[0.22em] text-white/35">
          <span>Pralvex · Agent {name} · MMXXVI</span>
          <span>{statusLabel}</span>
        </div>
      </div>
    </div>
  )
}

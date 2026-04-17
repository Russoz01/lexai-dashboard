'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react'
import { Spotlight } from '@/components/ui/spotlight'
import { RetroGrid } from '@/components/ui/retro-grid'
import { TextRotate } from '@/components/ui/text-rotate'
import { cn } from '@/lib/utils'

/* ─────────────────────────────────────────────────────────────
 * LexHomeHero — 21st.dev-style.
 * Spotlight + retro-grid floor + text-rotate accent + stats pill.
 * ────────────────────────────────────────────────────────────── */

const rotatingWords = [
  'jurisprudencia',
  'peticoes',
  'contratos',
  'pareceres',
  'prazos',
  'compliance',
]

const stats = [
  { k: '22', v: 'agentes especializados' },
  { k: '9',  v: 'areas do Direito' },
  { k: '4min', v: 'por documento' },
  { k: '100%', v: 'LGPD + Provimento 205' },
]

export function LexHomeHero() {
  return (
    <section className="relative isolate overflow-hidden bg-black pt-28 md:pt-36">
      {/* Spotlight + RetroGrid */}
      <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" fill="#bfa68e" />
      <div className="absolute inset-0 -z-10">
        <RetroGrid opacity={0.35} />
      </div>

      {/* Radial fade to page bg */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(80%_60%_at_50%_0%,transparent_0%,#000_80%)]"
      />

      <div className="mx-auto max-w-6xl px-6">
        {/* Floating pill */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto mb-8 flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/75 backdrop-blur"
        >
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#bfa68e] opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-[#bfa68e]" />
          </span>
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-[#bfa68e]">
            Novo
          </span>
          <span className="h-3 w-px bg-white/15" />
          <span>LexAI 2026 · jurimetria + marketing compliant</span>
          <ArrowRight className="size-3 text-white/50" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 12, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="mx-auto max-w-4xl text-balance text-center text-5xl font-medium leading-[1.04] tracking-tight text-white md:text-7xl"
        >
          A inteligencia juridica
          <br />
          que entende de{' '}
          <TextRotate
            words={rotatingWords}
            className="text-[#e4cfa9] italic"
          />
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="mx-auto mt-8 max-w-2xl text-balance text-center text-base leading-relaxed text-white/60 md:text-lg"
        >
          Vinte e dois agentes treinados no ordenamento brasileiro, CRM
          juridico integrado, jurimetria e marketing compliant — num unico
          contrato, revisado por advogado.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-10 flex flex-col items-center justify-center gap-3 md:flex-row"
        >
          <Link
            href="/login"
            className="group relative inline-flex h-11 items-center justify-center gap-2 overflow-hidden rounded-full bg-white px-6 text-sm font-medium text-black transition hover:bg-white/90"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(191,166,142,0.35)_50%,transparent_75%)] bg-[length:200%_100%] animate-shimmer"
            />
            <span className="relative">Comecar agora</span>
            <ArrowRight className="relative size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="#agentes"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.02] px-6 text-sm font-medium text-white transition hover:bg-white/[0.06]"
          >
            <Sparkles className="size-4 text-[#bfa68e]" strokeWidth={1.75} />
            Ver os 22 agentes
          </Link>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.85 }}
          className="mx-auto mt-20 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5 md:grid-cols-4"
        >
          {stats.map((s) => (
            <div
              key={s.v}
              className="bg-black/60 p-5 backdrop-blur-sm"
            >
              <div className="font-mono text-3xl font-medium tabular-nums text-[#e4cfa9]">
                {s.k}
              </div>
              <div className="mt-1 text-xs uppercase tracking-wider text-white/50">
                {s.v}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Trust row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.1 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/40"
        >
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="size-3 text-[#bfa68e]/60" />
            Infra no Brasil
          </span>
          <span className={cn('hidden h-1 w-1 rounded-full bg-white/20 md:block')} />
          <span>LGPD nativa · Lei nº 13.709/2018</span>
          <span className={cn('hidden h-1 w-1 rounded-full bg-white/20 md:block')} />
          <span>Provimento 205/2021 (OAB)</span>
          <span className={cn('hidden h-1 w-1 rounded-full bg-white/20 md:block')} />
          <span>SSO · audit logs · DPA</span>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="pointer-events-none h-32 bg-gradient-to-b from-transparent to-black" />
    </section>
  )
}

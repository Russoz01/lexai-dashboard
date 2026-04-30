'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Reveal } from '@/components/ui/reveal'
import { RetroGrid } from '@/components/ui/retro-grid'
import { AmbientMesh } from '@/components/ui/ambient-mesh'

/* ════════════════════════════════════════════════════════════════════
 * LexFinalCta (v9 · 2026-04-19)
 * ────────────────────────────────────────────────────────────────────
 * Editorial fechamento com:
 *  · Headline serif italic — voz pessoal, nao corporativa
 *  · Numero concreto (20h/semana — economia validada nos beta tests)
 *  · CTA primaria com gradient + shimmer + magnetic glow (lex-magnetic)
 *  · Trust strip final
 * ═══════════════════════════════════════════════════════════════════ */

export function LexFinalCta() {
  return (
    <section className="relative isolate overflow-hidden bg-black py-32">
      <AmbientMesh dust dustCount={10} intensity={0.7} />
      <div className="absolute inset-0 -z-10">
        <RetroGrid opacity={0.22} />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(50%_60%_at_50%_50%,rgba(191,166,142,0.10)_0%,transparent_70%)]"
      />

      <div className="mx-auto max-w-3xl px-6 text-center">
        <Reveal>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mb-7 flex size-16 items-center justify-center rounded-full border border-[#bfa68e]/20 bg-gradient-to-br from-[#bfa68e]/[0.12] to-transparent backdrop-blur"
          >
            <Sparkles className="size-6 text-[#e6d4bd]" strokeWidth={1.4} />
          </motion.div>

          <h2 className="text-balance font-serif text-4xl leading-[1.05] text-white md:text-6xl">
            Vinte horas por semana.
            <br />
            <span className="italic text-[#e6d4bd]">
              Devolvidas pra advocacia
            </span>
            .
          </h2>
          <p className="mx-auto mt-7 max-w-xl text-[15.5px] leading-relaxed text-white/65">
            Demo de 30 minutos grátis · Sem cartão · Cancela com um clique. Money-back
            de 7 dias se não economizar vinte horas na primeira semana após assinar.
          </p>

          <div className="mt-12 flex flex-col items-center justify-center gap-3 md:flex-row">
            <Link
              href="/login"
              className="lex-magnetic lex-cta-shimmer group relative inline-flex h-14 items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-br from-[#f5e8d3] via-[#bfa68e] to-[#8a6f55] px-9 text-[14px] font-medium text-black transition hover:brightness-110"
            >
              <span className="relative z-10">Demo 30 min grátis</span>
              <ArrowRight
                className="relative z-10 size-4 transition-transform group-hover:translate-x-0.5"
                strokeWidth={2}
              />
            </Link>
            <Link
              href="/empresas"
              className="inline-flex h-14 items-center justify-center rounded-full border border-white/15 bg-white/[0.02] px-7 text-[14px] font-medium text-white backdrop-blur transition hover:border-white/35 hover:bg-white/[0.06]"
            >
              Falar com vendas
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-white/35">
            <span>Infra em São Paulo</span>
            <span className="size-1 rounded-full bg-white/15" />
            <span>LGPD nativa</span>
            <span className="size-1 rounded-full bg-white/15" />
            <span>Provimento 205 / OAB</span>
            <span className="size-1 rounded-full bg-white/15" />
            <span>DPA assinado</span>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

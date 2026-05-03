'use client'

/* ─────────────────────────────────────────────────────────────
 * Ato III — Atelier de inteligencia juridica + CTA (3.5s)
 * Final cinematico antes do redirect pra '/'.
 * ───────────────────────────────────────────────────────────── */

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

interface ChapterCTAProps {
  reduced: boolean
  onEnter: () => void
}

export function ChapterCTA({ reduced, onEnter }: ChapterCTAProps) {
  const ease: [number, number, number, number] = [0.22, 1, 0.36, 1]
  const dur = reduced ? 0.01 : 0.9

  return (
    <motion.section
      key="ato-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5, ease } }}
      transition={{ duration: 0.6, ease }}
      className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
      aria-label="Convite para entrar no Pralvex"
    >
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: dur, ease, delay: reduced ? 0 : 0.2 }}
        className="mb-10 font-mono text-[11px] uppercase tracking-[0.4em] text-[#bfa68e]/65"
      >
        Capitulo · 03
      </motion.p>

      {/* Frase de fechamento — duas linhas com peso visual */}
      <motion.h2
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduced ? 0.01 : 1.2, ease, delay: reduced ? 0 : 0.4 }}
        className="font-serif text-[clamp(36px,7vw,82px)] font-semibold leading-[1.0] tracking-tight"
        style={{
          background: 'linear-gradient(180deg, #f5e8d3 0%, #d4b896 50%, #bfa68e 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          color: 'transparent',
        }}
      >
        Atelier de
        <br />
        inteligencia juridica.
      </motion.h2>

      {/* Hairline */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: reduced ? 0.01 : 1.0, ease, delay: reduced ? 0 : 1.0 }}
        className="my-10 h-px w-40 origin-center bg-gradient-to-r from-transparent via-[#bfa68e]/60 to-transparent"
      />

      {/* CTA pill — gold border, hover lift */}
      <motion.button
        type="button"
        onClick={onEnter}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: dur, ease, delay: reduced ? 0 : 1.2 }}
        whileHover={reduced ? undefined : { y: -2 }}
        whileTap={reduced ? undefined : { y: 0, scale: 0.985 }}
        className="group relative inline-flex items-center gap-3 rounded-full border border-[#bfa68e]/45 bg-[#bfa68e]/[0.06] px-8 py-3.5 font-mono text-[12px] uppercase tracking-[0.3em] text-white transition-colors duration-300 hover:border-[#bfa68e] hover:bg-[#bfa68e]/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bfa68e]/70"
      >
        <span>Entrar</span>
        <ArrowRight
          className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
          strokeWidth={1.6}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ boxShadow: '0 0 0 1px rgba(191,166,142,0.35), 0 0 50px rgba(191,166,142,0.28)' }}
        />
      </motion.button>

      {/* Microcopy honest — alinha com brand stance "Pralvex e nova" */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: dur, ease, delay: reduced ? 0 : 1.6 }}
        className="mt-8 max-w-md font-sans text-[12px] leading-relaxed text-white/40"
      >
        50 minutos de demo gratuita. 7 dias de garantia. Sem letra miuda.
      </motion.p>
    </motion.section>
  )
}

export default ChapterCTA

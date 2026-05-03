'use client'

/* ─────────────────────────────────────────────────────────────
 * Ato I — Bem-vindo ao Pralvex (manifesto curto, 3.5s)
 * Logo + tagline + ruler. Stagger fluido, sem scroll dependency.
 * ───────────────────────────────────────────────────────────── */

import { motion } from 'framer-motion'
import { PralvexMark } from '@/components/PralvexMark'

interface ChapterIntroProps {
  reduced: boolean
}

export function ChapterIntro({ reduced }: ChapterIntroProps) {
  // Easing patek-philippe — bate com --ease-editorial do globals.css
  const ease: [number, number, number, number] = [0.22, 1, 0.36, 1]
  const dur = reduced ? 0.01 : 0.9

  return (
    <motion.section
      key="ato-1"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.6, ease } }}
      transition={{ duration: 0.6, ease }}
      className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
      aria-label="Apresentando Pralvex"
    >
      {/* Logo monogram com borda completa — fallback cascade png > svg > text */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: dur, ease, delay: reduced ? 0 : 0.15 }}
        className="mb-12"
      >
        <PralvexMark variant="seal" size={68} />
      </motion.div>

      {/* Eyebrow — quase invisivel, atelier vibe */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: dur, ease, delay: reduced ? 0 : 0.5 }}
        className="mb-6 font-mono text-[11px] uppercase tracking-[0.4em] text-[#bfa68e]/60"
      >
        Apresentando
      </motion.p>

      {/* Wordmark — serif champagne, o nome inteiro com gradient sutil */}
      <motion.h1
        initial={{ opacity: 0, y: 24, letterSpacing: '0.18em' }}
        animate={{ opacity: 1, y: 0, letterSpacing: '-0.01em' }}
        transition={{ duration: reduced ? 0.01 : 1.4, ease, delay: reduced ? 0 : 0.7 }}
        className="font-serif text-[clamp(56px,11vw,140px)] font-semibold leading-[0.92]"
        style={{
          background: 'linear-gradient(180deg, #f5e8d3 0%, #d4b896 38%, #bfa68e 70%, #7a5f48 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          color: 'transparent',
        }}
      >
        Pralvex
      </motion.h1>

      {/* Tagline italic */}
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: dur, ease, delay: reduced ? 0 : 1.4 }}
        className="mt-6 max-w-2xl font-serif text-[clamp(17px,2.4vw,26px)] italic leading-snug text-[#bfa68e]"
      >
        Atelier de inteligencia juridica.
      </motion.p>

      {/* Hairline ruler — desenha-se da esquerda */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: reduced ? 0.01 : 1.1, ease, delay: reduced ? 0 : 1.8 }}
        className="mt-10 h-px w-32 origin-left bg-gradient-to-r from-transparent via-[#bfa68e]/55 to-transparent"
      />
    </motion.section>
  )
}

export default ChapterIntro

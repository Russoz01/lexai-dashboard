/* ══════════════════════════════════════════════════════════════
 * motion-variants — DNA cinético compartilhado Pralvex
 * ──────────────────────────────────────────────────────────────
 * Conjunto de variants Framer Motion aplicado em todas as páginas
 * do atelier editorial. Fonte única de verdade para cadência de
 * entrada, reveal on-scroll, hover premium e stagger de listas.
 *
 * Cada variant respeita prefers-reduced-motion via easing neutro
 * quando o consumidor passa `reduced: true`. Sem esse gate é
 * responsabilidade do consumidor desligar animações não-essenciais.
 *
 * Convenções:
 *   - Easing editorial: cubic-bezier(0.22, 1, 0.36, 1) — decelera
 *     no fim, transmite "objeto assentando"
 *   - Duração base: 0.6s (hero), 0.45s (reveal), 0.25s (hover)
 *   - Stagger: 0.06s padrão, 0.04s quando lista ≥ 10 itens
 *   - Y deslocamento: 16-24px para reveals, 6-8px para hover
 * ══════════════════════════════════════════════════════════════ */

import type { Variants, Transition } from 'framer-motion'

/** Easing editorial premium (ease-out quart). Decelera suave. */
export const EASE_EDITORIAL = [0.22, 1, 0.36, 1] as const

/** Easing firme de entrada (cubic-bezier expo-out). Entra forte, para suave. */
export const EASE_ENTRANCE = [0.16, 1, 0.3, 1] as const

/** Easing glassy drift (ease-in-out sine). Pra elementos que flutuam. */
export const EASE_DRIFT = [0.37, 0, 0.63, 1] as const

/* ══════════════════════════════════════════════════════════════
 * HERO — entrada principal, delay escalonado por posição
 * ══════════════════════════════════════════════════════════════ */

export const heroContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
}

export const heroItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_EDITORIAL },
  },
}

/* ══════════════════════════════════════════════════════════════
 * REVEAL — on-scroll fade-up
 * ══════════════════════════════════════════════════════════════ */

export const revealUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: EASE_EDITORIAL },
  },
}

export const revealFade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.8, ease: EASE_EDITORIAL } },
}

export const revealBlur: Variants = {
  hidden: { opacity: 0, filter: 'blur(12px)', y: 12 },
  show: {
    opacity: 1,
    filter: 'blur(0px)',
    y: 0,
    transition: { duration: 0.8, ease: EASE_EDITORIAL },
  },
}

/** Reveal lateral — pra cards em grid, sequencial */
export const revealSlideRight: Variants = {
  hidden: { opacity: 0, x: -16 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: EASE_EDITORIAL },
  },
}

/* ══════════════════════════════════════════════════════════════
 * LIST STAGGER — grid/lista com entradas sequenciais
 * ══════════════════════════════════════════════════════════════ */

export const listContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
}

export const listContainerFast: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.035,
      delayChildren: 0.05,
    },
  },
}

export const listItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_EDITORIAL },
  },
}

/* ══════════════════════════════════════════════════════════════
 * HAIRLINE — risco dourado expandindo (usado como divisor editorial)
 * ══════════════════════════════════════════════════════════════ */

export const hairlineGrow: Variants = {
  hidden: { scaleX: 0, opacity: 0 },
  show: {
    scaleX: 1,
    opacity: 0.85,
    transition: { duration: 1.05, ease: EASE_EDITORIAL, delay: 0.3 },
  },
}

/* ══════════════════════════════════════════════════════════════
 * CHAR STAGGER — pra títulos letra-por-letra (intro hero style)
 * ══════════════════════════════════════════════════════════════ */

export const charContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.055,
      delayChildren: 0.4,
    },
  },
}

export const charItem: Variants = {
  hidden: { opacity: 0, rotateX: 85, y: 18 },
  show: {
    opacity: 1,
    rotateX: 0,
    y: 0,
    transition: { duration: 0.62, ease: EASE_EDITORIAL },
  },
}

/* ══════════════════════════════════════════════════════════════
 * FLOAT — elementos flutuantes com loop infinito (ambient)
 * ══════════════════════════════════════════════════════════════ */

export const floatGentle = {
  y: [0, -6, 0],
  transition: {
    duration: 5.5,
    ease: EASE_DRIFT,
    repeat: Infinity,
    repeatType: 'loop' as const,
  },
}

export const floatAmbient = {
  y: [0, -10, 0],
  x: [0, 4, 0],
  transition: {
    duration: 9,
    ease: EASE_DRIFT,
    repeat: Infinity,
    repeatType: 'loop' as const,
  },
}

/* ══════════════════════════════════════════════════════════════
 * HOVER — presets declarativos pra whileHover
 * ══════════════════════════════════════════════════════════════ */

export const hoverLift = {
  y: -4,
  transition: { duration: 0.28, ease: EASE_EDITORIAL },
}

export const hoverLiftStrong = {
  y: -8,
  scale: 1.015,
  transition: { duration: 0.32, ease: EASE_EDITORIAL },
}

export const hoverGlow = {
  boxShadow: '0 0 32px rgba(191,166,142,0.22)',
  transition: { duration: 0.3, ease: EASE_EDITORIAL },
}

/* ══════════════════════════════════════════════════════════════
 * VIEWPORT — config padrão pra whileInView
 * ══════════════════════════════════════════════════════════════ */

export const viewportOnce = { once: true, amount: 0.35 } as const
export const viewportOnceLoose = { once: true, amount: 0.15 } as const
export const viewportRepeat = { once: false, amount: 0.3 } as const

/* ══════════════════════════════════════════════════════════════
 * TRANSITIONS — presets nomeados pra reaproveitar
 * ══════════════════════════════════════════════════════════════ */

export const transEditorial = (delay = 0): Transition => ({
  duration: 0.65,
  ease: EASE_EDITORIAL,
  delay,
})

export const transQuick = (delay = 0): Transition => ({
  duration: 0.3,
  ease: EASE_EDITORIAL,
  delay,
})

export const transLong = (delay = 0): Transition => ({
  duration: 1.1,
  ease: EASE_EDITORIAL,
  delay,
})

/* ══════════════════════════════════════════════════════════════
 * PALETA — tokens champagne × noir reutilizados por components
 * ══════════════════════════════════════════════════════════════ */

export const PRALVEX_PALETTE = {
  noir: '#0a0807',
  noirSoft: '#111110',
  noirMid: '#1a1410',
  champagne: '#bfa68e',
  champagneSoft: '#e6d4bd',
  champagneDeep: '#8a6f55',
  champagneGlow: '#f5e8d3',
  stone: '#7a5f48',
  lineSoft: 'rgba(191,166,142,0.18)',
  lineMed: 'rgba(191,166,142,0.34)',
  lineStrong: 'rgba(191,166,142,0.52)',
  surface: 'rgba(255,255,255,0.04)',
  surfaceHover: 'rgba(255,255,255,0.06)',
  surfaceActive: 'rgba(255,255,255,0.08)',
} as const

export type PralvexColor = keyof typeof PRALVEX_PALETTE

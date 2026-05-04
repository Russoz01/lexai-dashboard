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
 *
 * Cleanup audit elite v4 (2026-05-03): removidos 11 exports unused
 * via ts-prune (EASE_ENTRANCE, revealUp/Fade/Blur/SlideRight,
 * listContainerFast, hairlineGrow, charContainer, charItem,
 * floatGentle, floatAmbient). Re-adicionar quando consumer surgir.
 * ══════════════════════════════════════════════════════════════ */

import type { Variants, Transition } from 'framer-motion'

/** Easing editorial premium (ease-out quart). Decelera suave. */
export const EASE_EDITORIAL = [0.22, 1, 0.36, 1] as const

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

export const listItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_EDITORIAL },
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

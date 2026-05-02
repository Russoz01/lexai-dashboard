'use client'

import { useRef } from 'react'
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type Variants,
} from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import s from './vanix-hero-stage.module.css'

/* ════════════════════════════════════════════════════════════════════
 * VanixHeroStage · v1.1 (2026-05-02)
 * ────────────────────────────────────────────────────────────────────
 * Hero da landing Vanix Corp (studio parent). Editorial-noir DNA com:
 *   · Stagger entrance — elementos descem em cascata (0.12s gap).
 *   · Scroll parallax — headline desliza mais lento, glow ambient
 *     mais rapido. Profundidade = motion.
 *   · Reduce-motion — useReducedMotion respeita acessibilidade WCAG.
 *   · SSR-safe — useScroll com ref opt-in.
 *   · Hover/tap micro-interactions nos CTAs.
 *
 * Skills aplicadas: framer-motion-core, scroll, variants, react,
 * gestures, layout.
 * ═══════════════════════════════════════════════════════════════════ */

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.18,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 28, filter: 'blur(8px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.85,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

const PRODUTOS = [
  { nome: 'Pralvex',  categoria: 'Legal-tech OS',       status: 'live' },
  { nome: 'AlexAI',   categoria: 'WhatsApp B2B',        status: 'live' },
  { nome: 'Planora',  categoria: 'AI Spreadsheet',      status: 'live' },
  { nome: 'Leadora',  categoria: 'Lead Capture',        status: 'live' },
  { nome: 'Navalha',  categoria: 'Vertical Barbearias', status: 'design' },
  { nome: 'Calivo',   categoria: 'Accounting OS',       status: 'design' },
] as const

const STATS = [
  { num: '6',    label: 'Produtos no portfolio' },
  { num: '2025', label: 'Founded' },
  { num: 'BR',   label: 'Origem · Ituverava-SP' },
] as const

export function VanixHeroStage() {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  const headlineY   = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, -120])
  const ledeY       = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, -80])
  const glowY       = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, 200])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0])
  const productsY   = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, -40])

  return (
    <motion.section
      ref={ref}
      style={{ opacity: heroOpacity }}
      className={s.hero}
    >
      <motion.div aria-hidden style={{ y: glowY }} className={s.glow} />
      <div aria-hidden className={s.radialTop} />
      <div aria-hidden className={s.hairlineBottom} />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className={s.inner}
      >
        <motion.div variants={itemVariants} className={s.serial}>
          <span className={s.hairline} aria-hidden />
          VANIX CORP · MMXXVI · STUDIO
          <span className={s.hairline} aria-hidden />
        </motion.div>

        <motion.h1
          variants={itemVariants}
          style={{ y: headlineY }}
          className={s.headline}
        >
          O studio que constrói{' '}
          <span className={s.headlineAccent}>produtos vivos</span>
          {' '}com IA.
        </motion.h1>

        <motion.div variants={itemVariants} aria-hidden className={s.divider} />

        <motion.p
          variants={itemVariants}
          style={{ y: ledeY }}
          className={s.lede}
        >
          Seis produtos no portfolio. Cada um resolve um problema real, no
          mercado certo, com tecnologia que entrega day one. Sem hype, sem
          deck, sem promessa de futuro — só software que funciona hoje.
        </motion.p>

        <motion.div variants={itemVariants} className={s.ctas}>
          <motion.a
            href="/portfolio"
            whileHover={reduced ? undefined : { scale: 1.02, y: -2 }}
            whileTap={reduced ? undefined : { scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={s.ctaPrimary}
          >
            Ver portfolio
            <ArrowRight size={14} strokeWidth={2.2} aria-hidden />
          </motion.a>
          <motion.a
            href="/manifesto"
            whileHover={reduced ? undefined : { borderColor: 'rgba(191,166,142,0.4)' }}
            whileTap={reduced ? undefined : { scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className={s.ctaGhost}
          >
            <Sparkles size={13} strokeWidth={1.75} aria-hidden />
            Manifesto Vanix
          </motion.a>
        </motion.div>

        <motion.div variants={itemVariants} className={s.stats}>
          {STATS.map((sItem, i) => (
            <div key={sItem.label} className={s.stat}>
              <span className={s.statNum}>{sItem.num}</span>
              <span className={s.statLabel}>{sItem.label}</span>
              {i < STATS.length - 1 && <span className={s.statSep} aria-hidden>·</span>}
            </div>
          ))}
        </motion.div>

        <motion.div
          style={{ y: productsY }}
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.08, delayChildren: 0.9 },
            },
          }}
          className={s.products}
        >
          <motion.div variants={itemVariants} className={s.productsLabel}>
            <span className={s.hairlineSm} aria-hidden />
            Portfolio
          </motion.div>
          <div className={s.productsGrid}>
            {PRODUTOS.map((p) => (
              <motion.a
                key={p.nome}
                href={`/produtos/${p.nome.toLowerCase()}`}
                variants={{
                  hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
                  show: {
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)',
                    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
                whileHover={reduced ? undefined : { y: -3, borderColor: 'rgba(191,166,142,0.4)' }}
                transition={{ duration: 0.25 }}
                className={s.product}
              >
                <div className={s.productHead}>
                  <span className={s.productNome}>{p.nome}</span>
                  <span
                    className={`${s.productStatus} ${p.status === 'live' ? s.productStatusLive : s.productStatusDesign}`}
                    aria-label={p.status === 'live' ? 'Em produção' : 'Em design'}
                  >
                    {p.status === 'live' ? '●' : '○'}
                  </span>
                </div>
                <span className={s.productCat}>{p.categoria}</span>
              </motion.a>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </motion.section>
  )
}

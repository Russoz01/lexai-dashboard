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

/* ════════════════════════════════════════════════════════════════════
 * VanixHeroStage · v1.0 (2026-05-02)
 * ────────────────────────────────────────────────────────────────────
 * Hero da landing Vanix Corp (studio parent). Editorial-noir DNA com:
 *   · Stagger entrance — elementos descem em cascata (0.12s gap).
 *   · Scroll parallax — headline desliza mais lento, glow ambient
 *     mais rapido. Profundidade = motion (regra UX clássica).
 *   · Reduce-motion — useReducedMotion respeita acessibilidade WCAG.
 *   · SSR-safe — useScroll com ref opt-in, sem window access antes
 *     do hydrate.
 *   · Hover/tap micro-interactions nos CTAs.
 *
 * Skills aplicadas: framer-motion-core, scroll, variants, react,
 * gestures, layout.
 *
 * Standalone: cores e tipografia hardcoded (Playfair italic + DM Sans
 * + JetBrains Mono pra serial). Pra integrar com sistema de tokens da
 * landing, troque os valores por var(--token).
 * ═══════════════════════════════════════════════════════════════════ */

// ── Variants (framer-motion-variants) ─────────────────────────────
// Stagger orchestration: container revela filhos em cascata.
// staggerChildren=0.12 + delayChildren=0.18 = 0.18, 0.30, 0.42, 0.54...
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
      // Curva editorial — ease premium (cubic-bezier "expo out").
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

// Cards de produtos sub-marca (entram com stagger próprio depois do bloco principal)
const PRODUTOS = [
  { nome: 'Pralvex',  categoria: 'Legal-tech OS',     status: 'live' },
  { nome: 'AlexAI',   categoria: 'WhatsApp B2B',      status: 'live' },
  { nome: 'Planora',  categoria: 'AI Spreadsheet',    status: 'live' },
  { nome: 'Leadora',  categoria: 'Lead Capture',      status: 'live' },
  { nome: 'Navalha',  categoria: 'Vertical Barbearias', status: 'design' },
  { nome: 'Calivo',   categoria: 'Accounting OS',     status: 'design' },
] as const

const STATS = [
  { num: '6', label: 'Produtos no portfolio' },
  { num: '2025', label: 'Founded' },
  { num: 'BR', label: 'Origem · Ituverava-SP' },
] as const

export function VanixHeroStage() {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()

  // ── Scroll parallax (framer-motion-scroll) ──────────────────────
  // offset: ["start start", "end start"] = começa quando topo do hero
  // toca topo da viewport, termina quando fundo do hero toca topo.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  // Camadas de profundidade — números maiores = movimento maior = "mais perto"
  const headlineY    = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, -120])
  const ledeY        = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, -80])
  const glowY        = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, 200])
  const heroOpacity  = useTransform(scrollYProgress, [0, 0.85], [1, 0])
  const productsY    = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, -40])

  return (
    <motion.section
      ref={ref}
      style={{ opacity: heroOpacity }}
      className="vanix-hero"
    >
      {/* ── Background layers (parallax independente) ───────────── */}
      <motion.div
        aria-hidden
        style={{ y: glowY }}
        className="vanix-hero__glow"
      />
      <div aria-hidden className="vanix-hero__radial-top" />
      <div aria-hidden className="vanix-hero__hairline-bottom" />

      {/* ── Stagger container ───────────────────────────────────── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="vanix-hero__inner"
      >
        {/* Serial editorial */}
        <motion.div variants={itemVariants} className="vanix-hero__serial">
          <span className="vanix-hero__hairline" aria-hidden />
          VANIX CORP · MMXXVI · STUDIO
          <span className="vanix-hero__hairline" aria-hidden />
        </motion.div>

        {/* Headline com parallax próprio + word reveal individual */}
        <motion.h1
          variants={itemVariants}
          style={{ y: headlineY }}
          className="vanix-hero__headline"
        >
          O studio que constrói{' '}
          <span className="vanix-hero__headline-accent">produtos vivos</span>
          {' '}com IA.
        </motion.h1>

        {/* Hairline divider */}
        <motion.div
          variants={itemVariants}
          aria-hidden
          className="vanix-hero__divider"
        />

        {/* Lede */}
        <motion.p
          variants={itemVariants}
          style={{ y: ledeY }}
          className="vanix-hero__lede"
        >
          Seis produtos no portfolio. Cada um resolve um problema real, no
          mercado certo, com tecnologia que entrega day one. Sem hype, sem
          deck, sem promessa de futuro — só software que funciona hoje.
        </motion.p>

        {/* CTAs com hover + tap (framer-motion-gestures) */}
        <motion.div variants={itemVariants} className="vanix-hero__ctas">
          <motion.a
            href="/portfolio"
            whileHover={reduced ? undefined : { scale: 1.02, y: -2 }}
            whileTap={reduced ? undefined : { scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="vanix-hero__cta-primary"
          >
            Ver portfolio
            <ArrowRight size={14} strokeWidth={2.2} aria-hidden />
          </motion.a>
          <motion.a
            href="/manifesto"
            whileHover={reduced ? undefined : { borderColor: 'rgba(191,166,142,0.4)' }}
            whileTap={reduced ? undefined : { scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="vanix-hero__cta-ghost"
          >
            <Sparkles size={13} strokeWidth={1.75} aria-hidden />
            Manifesto Vanix
          </motion.a>
        </motion.div>

        {/* Stats inline */}
        <motion.div variants={itemVariants} className="vanix-hero__stats">
          {STATS.map((s, i) => (
            <div key={s.label} className="vanix-hero__stat">
              <span className="vanix-hero__stat-num">{s.num}</span>
              <span className="vanix-hero__stat-label">{s.label}</span>
              {i < STATS.length - 1 && <span className="vanix-hero__stat-sep" aria-hidden>·</span>}
            </div>
          ))}
        </motion.div>

        {/* Products grid — stagger SECUNDÁRIO ao revelar */}
        <motion.div
          style={{ y: productsY }}
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.08, delayChildren: 0.9 },
            },
          }}
          className="vanix-hero__products"
        >
          <motion.div
            variants={itemVariants}
            className="vanix-hero__products-label"
          >
            <span className="vanix-hero__hairline-sm" aria-hidden />
            Portfolio
          </motion.div>
          <div className="vanix-hero__products-grid">
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
                className="vanix-hero__product"
              >
                <div className="vanix-hero__product-head">
                  <span className="vanix-hero__product-nome">{p.nome}</span>
                  <span
                    className={`vanix-hero__product-status vanix-hero__product-status--${p.status}`}
                    aria-label={p.status === 'live' ? 'Em produção' : 'Em design'}
                  >
                    {p.status === 'live' ? '●' : '○'}
                  </span>
                </div>
                <span className="vanix-hero__product-cat">{p.categoria}</span>
              </motion.a>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* CSS scoped via styled-jsx — autossuficiente, zero dep      */}
      {/* ────────────────────────────────────────────────────────── */}
      <style jsx>{`
        .vanix-hero {
          position: relative;
          isolation: isolate;
          min-height: 100vh;
          overflow: hidden;
          background: #0a0807;
          color: #f5e8d3;
          font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
          padding: 120px 24px 80px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .vanix-hero__glow {
          position: absolute;
          top: 30%;
          left: 50%;
          transform: translateX(-50%);
          width: 900px;
          height: 600px;
          z-index: -2;
          background: radial-gradient(
            ellipse 50% 60% at 50% 50%,
            rgba(191, 166, 142, 0.18),
            transparent 70%
          );
          filter: blur(40px);
          pointer-events: none;
        }
        .vanix-hero__radial-top {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 480px;
          z-index: -2;
          background: radial-gradient(
            ellipse 60% 50% at 50% 0%,
            rgba(191, 166, 142, 0.1),
            transparent 70%
          );
          pointer-events: none;
        }
        .vanix-hero__hairline-bottom {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 60%;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(191, 166, 142, 0.25),
            transparent
          );
        }
        .vanix-hero__inner {
          position: relative;
          max-width: 1080px;
          margin: 0 auto;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 36px;
        }
        .vanix-hero__serial {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: rgba(191, 166, 142, 0.8);
        }
        .vanix-hero__hairline {
          width: 40px;
          height: 1px;
          background: rgba(191, 166, 142, 0.4);
        }
        .vanix-hero__hairline-sm {
          width: 28px;
          height: 1px;
          background: rgba(255, 255, 255, 0.18);
          display: inline-block;
        }
        .vanix-hero__headline {
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic;
          font-weight: 700;
          font-size: clamp(40px, 6.5vw, 78px);
          line-height: 1.04;
          letter-spacing: -0.012em;
          text-align: center;
          color: #f5e8d3;
          margin: 0;
          max-width: 920px;
          text-wrap: balance;
          text-shadow: 0 0 80px rgba(191, 166, 142, 0.18);
        }
        .vanix-hero__headline-accent {
          color: #bfa68e;
          background: linear-gradient(
            135deg,
            #f5e8d3 0%,
            #bfa68e 50%,
            #8a6f55 100%
          );
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .vanix-hero__divider {
          width: 56px;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(191, 166, 142, 0.5),
            transparent
          );
        }
        .vanix-hero__lede {
          font-size: 17px;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.65);
          text-align: center;
          max-width: 620px;
          margin: 0;
          text-wrap: balance;
        }
        .vanix-hero__ctas {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .vanix-hero__cta-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 50px;
          padding: 0 28px;
          border-radius: 999px;
          background: linear-gradient(
            135deg,
            #f5e8d3,
            #bfa68e 50%,
            #8a6f55
          );
          color: #0a0807;
          font-size: 13.5px;
          font-weight: 600;
          text-decoration: none;
          box-shadow:
            0 10px 32px rgba(191, 166, 142, 0.28),
            0 2px 6px rgba(0, 0, 0, 0.2);
          will-change: transform;
        }
        .vanix-hero__cta-ghost {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 50px;
          padding: 0 24px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.02);
          color: rgba(255, 255, 255, 0.85);
          font-size: 13.5px;
          font-weight: 500;
          text-decoration: none;
          backdrop-filter: blur(8px);
          will-change: border-color;
        }
        .vanix-hero__stats {
          display: flex;
          gap: 6px;
          align-items: center;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 8px;
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }
        .vanix-hero__stat {
          display: inline-flex;
          align-items: baseline;
          gap: 8px;
        }
        .vanix-hero__stat-num {
          color: #bfa68e;
          font-weight: 700;
          font-size: 13px;
          font-variant-numeric: tabular-nums;
        }
        .vanix-hero__stat-label {
          color: rgba(255, 255, 255, 0.4);
        }
        .vanix-hero__stat-sep {
          color: rgba(255, 255, 255, 0.2);
          margin: 0 8px;
        }
        .vanix-hero__products {
          width: 100%;
          max-width: 1000px;
          margin-top: 48px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .vanix-hero__products-label {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          align-self: center;
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.35);
        }
        .vanix-hero__products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 12px;
        }
        .vanix-hero__product {
          position: relative;
          padding: 16px 18px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          background: rgba(255, 255, 255, 0.015);
          backdrop-filter: blur(6px);
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          gap: 6px;
          will-change: transform, border-color;
        }
        .vanix-hero__product-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .vanix-hero__product-nome {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 17px;
          font-weight: 600;
          color: rgba(245, 232, 211, 0.95);
        }
        .vanix-hero__product-status {
          font-size: 10px;
          line-height: 1;
        }
        .vanix-hero__product-status--live {
          color: #6ee7b7;
        }
        .vanix-hero__product-status--design {
          color: rgba(191, 166, 142, 0.6);
        }
        .vanix-hero__product-cat {
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 10.5px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.4);
        }

        @media (max-width: 640px) {
          .vanix-hero {
            padding: 80px 18px 60px;
          }
          .vanix-hero__inner {
            gap: 28px;
          }
          .vanix-hero__products {
            margin-top: 32px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .vanix-hero__cta-primary,
          .vanix-hero__cta-ghost,
          .vanix-hero__product {
            transition: none !important;
          }
        }
      `}</style>
    </motion.section>
  )
}

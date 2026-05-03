'use client'

/* ══════════════════════════════════════════════════════════════
   Pralvex · /intro
   Cinematic entrance teaser. Four scenes, no nav, no footer.
   Editorial-SaaS voice: sophisticated, anti-hype, champagne on black.
   ══════════════════════════════════════════════════════════════ */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  AnimatePresence,
  type Variants,
} from 'framer-motion'
import {
  ChevronDown,
  MessageSquare,
  FileText,
  PenLine,
  Search,
  Calculator,
  Scale,
  ArrowRight,
  Sparkles,
  Calendar,
  CheckCircle2,
} from 'lucide-react'

/* ── Copy (PT-BR, editorial, zero filler) ─────────────────────── */
const MANIFESTO_WORDS = [
  'Vinte',
  'e',
  'dois',
  'agentes.',
  'Um',
  'único',
  'compromisso:',
  'nunca',
  'inventar.',
] as const

const HERO_TITLE = 'Pralvex' as const

type AgentRow = { Icon: typeof MessageSquare; name: string; desc: string }

const AGENTS: ReadonlyArray<AgentRow> = [
  { Icon: MessageSquare, name: 'Consultor',   desc: 'Raciocínio jurídico contextual'  },
  { Icon: FileText,      name: 'Analista',    desc: 'Leitura profunda de documentos'  },
  { Icon: PenLine,       name: 'Redator',     desc: 'Peças processuais com citação'   },
  { Icon: Search,        name: 'Jurimetria',  desc: 'Jurisprudência rastreável'       },
  { Icon: Calculator,    name: 'Cálculos',    desc: 'RPV, honorários, correção'       },
  { Icon: Scale,         name: 'Compliance',  desc: 'LGPD + ética OAB'                },
]

type StatCard = { value: string; label: string }
const STATS: ReadonlyArray<StatCard> = [
  { value: '247',  label: 'peças geradas'  },
  { value: '12',   label: 'dias restantes' },
  { value: '98%',  label: 'precisão'       },
]

/* ── Scene 1 · Hero ───────────────────────────────────────────── */

function HeroScene({ reduced }: { reduced: boolean }) {
  const letters = useMemo(() => HERO_TITLE.split(''), [])

  const letterVariants: Variants = {
    hidden: { opacity: 0, rotateX: 90, y: 20 },
    show:   { opacity: 1, rotateX: 0,  y: 0  },
  }

  return (
    <section
      aria-label="Apresentação"
      className="relative min-h-screen w-full overflow-hidden bg-[#0a0a0a] text-white"
    >
      {/* Skip link top-right */}
      <Link
        href="/"
        className="absolute right-5 top-5 z-30 font-mono text-[11px] uppercase tracking-[0.3em] text-white/50 transition-colors hover:text-[#bfa68e] md:right-10 md:top-8"
      >
        Pular intro <span aria-hidden="true">→</span>
      </Link>

      {/* Layer 0 — Drone video background (cinematic loop)
          Fix React #418 hydration mismatch: SSR/CSR identicos, sem
          dependencia de useReducedMotion no render. Reduced motion
          honrado via CSS @media (prefers-reduced-motion) abaixo. */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        suppressHydrationWarning
        className="lex-intro-drone absolute inset-0 h-full w-full object-cover opacity-55"
        style={{
          mixBlendMode: 'screen',
          filter: 'saturate(0.85) contrast(1.05) brightness(0.75)',
        }}
      >
        <source src="/intro/drone-hero.mp4" type="video/mp4" />
      </video>
      {/* Vignette escuro pra garantir leitura do texto */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 70% at 50% 50%, rgba(10,10,10,0.18) 0%, rgba(10,10,10,0.55) 65%, rgba(10,10,10,0.85) 100%)',
        }}
      />

      {/* Layer 1 — dot grid */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage:
            'radial-gradient(rgba(191,166,142,0.22) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          maskImage:
            'radial-gradient(ellipse 70% 60% at 50% 50%, #000 40%, transparent 85%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 70% 60% at 50% 50%, #000 40%, transparent 85%)',
        }}
      />

      {/* Layer 2 — pulsing champagne radial */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0"
        animate={reduced ? undefined : { opacity: [0.55, 0.85, 0.55] }}
        transition={{ duration: 8, ease: 'easeInOut', repeat: Infinity }}
        style={{
          background:
            'radial-gradient(ellipse 55% 55% at 50% 48%, rgba(245,232,211,0.14), rgba(191,166,142,0.08) 35%, transparent 72%)',
        }}
      />
      {/* Layer 2b — mid warm glow */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0"
        animate={reduced ? undefined : { opacity: [0.35, 0.6, 0.35] }}
        transition={{ duration: 8, ease: 'easeInOut', repeat: Infinity, delay: 1.4 }}
        style={{
          background:
            'radial-gradient(ellipse 80% 35% at 50% 95%, rgba(122,95,72,0.28), transparent 70%)',
        }}
      />

      {/* Layer 3 — thin gold lines drifting */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="absolute h-px w-[32vw]"
            style={{
              top: `${14 + i * 17}%`,
              left: `-${30 + i * 4}%`,
              background:
                'linear-gradient(90deg, transparent, rgba(191,166,142,0.26), transparent)',
            }}
            animate={
              reduced
                ? undefined
                : { x: ['0%', '260%'], opacity: [0, 0.9, 0] }
            }
            transition={{
              duration: 14 + i * 3,
              ease: 'linear',
              repeat: Infinity,
              delay: i * 2.4,
            }}
          />
        ))}
      </div>

      {/* Center content */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 text-center">
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0.01 : 0.9, delay: reduced ? 0 : 0.2 }}
          className="mb-10 font-mono text-[11px] uppercase tracking-[0.35em] text-white/40"
        >
          Apresentando
        </motion.p>

        {/* Title — character stagger */}
        <motion.h1
          initial="hidden"
          animate="show"
          transition={{ staggerChildren: reduced ? 0 : 0.06, delayChildren: reduced ? 0 : 0.5 }}
          className="font-serif text-[clamp(68px,14vw,168px)] font-bold leading-[0.9] tracking-tight"
          style={{ perspective: 1200 }}
          aria-label={HERO_TITLE}
        >
          {letters.map((ch, i) => (
            <motion.span
              key={`${ch}-${i}`}
              variants={letterVariants}
              transition={{
                duration: reduced ? 0.01 : 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="inline-block bg-gradient-to-b from-[#f5e8d3] via-[#bfa68e] to-[#7a5f48] bg-clip-text text-transparent"
              style={{ transformOrigin: '50% 80%' }}
              aria-hidden="true"
            >
              {ch}
            </motion.span>
          ))}
        </motion.h1>

        {/* Subtitle italic */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0.01 : 0.9, delay: reduced ? 0 : 1.1 }}
          className="mt-10 max-w-2xl font-serif text-[clamp(18px,2.4vw,28px)] italic leading-snug text-[#bfa68e]"
        >
          O sistema operacional da advocacia brasileira.
        </motion.p>

        {/* Hairline rule */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: reduced ? 0.01 : 1.1, delay: reduced ? 0 : 1.3, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 h-px w-40 origin-left bg-gradient-to-r from-transparent via-[#bfa68e]/50 to-transparent"
        />

        {/* Scroll prompt */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduced ? 0 : 1.8, duration: 0.8 }}
          className="absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-white/35"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.35em]">
            Role para continuar
          </span>
          <motion.div
            animate={reduced ? undefined : { y: [0, 7, 0] }}
            transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity }}
          >
            <ChevronDown className="h-5 w-5" strokeWidth={1.3} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

/* ── Scene 2 · Manifesto (scroll-driven word reveal) ──────────── */

function ManifestoWord({
  word,
  index,
  total,
  reduced,
  progress,
}: {
  word: string
  index: number
  total: number
  reduced: boolean
  progress: ReturnType<typeof useScroll>['scrollYProgress']
}) {
  // Each word occupies a slice of the scene's progress range
  const slice = 1 / total
  const start = index * slice
  const end = start + slice

  const opacity = useTransform(progress, [start, Math.min(end, 1)], [0, 1])
  const y = useTransform(progress, [start, Math.min(end, 1)], [28, 0])
  const blurPx = useTransform(progress, [start, Math.min(end, 1)], [12, 0])
  const filter = useTransform(blurPx, (v) => `blur(${v}px)`)

  if (reduced) {
    return <span className="mr-[0.28em] inline-block">{word}</span>
  }

  return (
    <motion.span
      style={{ opacity, y, filter }}
      className="mr-[0.28em] inline-block will-change-transform"
    >
      {word}
    </motion.span>
  )
}

function ManifestoScene({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  return (
    <section
      ref={ref}
      aria-label="Manifesto"
      className="relative flex min-h-[130vh] w-full items-center justify-center bg-[#0a0a0a] text-white"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            'radial-gradient(rgba(191,166,142,0.25) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
          maskImage:
            'radial-gradient(ellipse 60% 55% at 50% 50%, #000 30%, transparent 80%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 60% 55% at 50% 50%, #000 30%, transparent 80%)',
        }}
      />

      <div className="sticky top-0 flex min-h-screen w-full items-center justify-center px-6">
        <div className="mx-auto max-w-5xl">
          <p className="mb-10 text-center font-mono text-[11px] uppercase tracking-[0.35em] text-[#bfa68e]/70">
            Manifesto · 01
          </p>
          <h2 className="text-center font-serif text-[clamp(34px,6vw,78px)] font-semibold leading-[1.05] tracking-tight text-white">
            {MANIFESTO_WORDS.map((w, i) => (
              <ManifestoWord
                key={`${w}-${i}`}
                word={w}
                index={i}
                total={MANIFESTO_WORDS.length}
                reduced={reduced}
                progress={scrollYProgress}
              />
            ))}
          </h2>
          <div className="mx-auto mt-14 h-px w-24 bg-gradient-to-r from-transparent via-[#bfa68e]/60 to-transparent" />
          <p className="mt-10 text-center font-sans text-[13px] uppercase tracking-[0.32em] text-white/35">
            Cada citação · rastreável · verificável · negável
          </p>
        </div>
      </div>
    </section>
  )
}

/* ── Scene 3 · Dashboard preview ──────────────────────────────── */

function FloatPanel({
  className,
  children,
  delay = 0,
  period = 4,
  reduced,
}: {
  className?: string
  children: React.ReactNode
  delay?: number
  period?: number
  reduced: boolean
}) {
  return (
    <motion.div
      animate={reduced ? undefined : { y: [0, -4, 0] }}
      transition={{
        duration: period,
        ease: 'easeInOut',
        repeat: Infinity,
        delay,
      }}
      className={
        'rounded-2xl border border-[#bfa68e]/18 bg-white/[0.04] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl ' +
        (className ?? '')
      }
      style={{ willChange: 'transform' }}
    >
      {children}
    </motion.div>
  )
}

function DashboardPreviewScene({ reduced }: { reduced: boolean }) {
  return (
    <section
      aria-label="Pré-visualização do produto"
      className="relative min-h-screen w-full overflow-hidden bg-[#0a0a0a] text-white"
    >
      {/* Soft champagne wash */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(191,166,142,0.10), transparent 70%)',
        }}
      />

      {/* Dashboard preview — decorative panels */}
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden md:block"
        style={{ opacity: 0.7 }}
      >
        {/* Top-left — agent list */}
        <FloatPanel
          className="absolute left-[4%] top-[12%] w-[300px]"
          delay={0}
          period={4.2}
          reduced={reduced}
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#bfa68e]/70">
              Agentes
            </span>
            <span className="text-[10px] text-white/40">22 ativos</span>
          </div>
          <ul className="space-y-2">
            {AGENTS.slice(0, 4).map(({ Icon, name, desc }) => (
              <li key={name} className="flex items-center gap-3 rounded-lg px-1.5 py-1.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#bfa68e]/10 text-[#bfa68e]">
                  <Icon className="h-4 w-4" strokeWidth={1.5} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-medium text-white">{name}</span>
                  <span className="block truncate text-[11px] text-white/40">{desc}</span>
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300/70" />
              </li>
            ))}
          </ul>
        </FloatPanel>

        {/* Center-bottom — chat preview */}
        <FloatPanel
          className="absolute bottom-[16%] left-[30%] w-[340px]"
          delay={0.8}
          period={5.4}
          reduced={reduced}
        >
          <div className="mb-3 flex items-center gap-2">
            <MessageSquare className="h-3.5 w-3.5 text-[#bfa68e]" strokeWidth={1.5} />
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#bfa68e]/70">
              Consultor
            </span>
          </div>
          <div className="space-y-2.5">
            <div className="ml-auto max-w-[80%] rounded-lg rounded-tr-sm bg-white/[0.07] px-3 py-2 text-[12px] leading-relaxed text-white/90">
              Analise o contrato anexo sob a ótica do art. 422 CC.
            </div>
            <div className="max-w-[82%] rounded-lg rounded-tl-sm border border-[#bfa68e]/18 bg-[#bfa68e]/[0.06] px-3 py-2 text-[12px] leading-relaxed text-white/80">
              Cláusula 7ª desequilibra a boa-fé objetiva. Proponho a redação alternativa...
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-white/40">
              <CheckCircle2 className="h-3 w-3 text-emerald-300" strokeWidth={1.5} />
              <span>3 fontes rastreáveis</span>
            </div>
          </div>
        </FloatPanel>

        {/* Right — stats */}
        <FloatPanel
          className="absolute right-[4%] top-[16%] w-[240px]"
          delay={1.6}
          period={3.6}
          reduced={reduced}
        >
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-[#bfa68e]" strokeWidth={1.5} />
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#bfa68e]/70">
              Demo
            </span>
          </div>
          <ul className="space-y-3">
            {STATS.map((s) => (
              <li key={s.label} className="flex items-baseline justify-between">
                <span className="font-serif text-[26px] font-bold leading-none text-[#f5e8d3]">
                  {s.value}
                </span>
                <span className="text-[11px] text-white/45">{s.label}</span>
              </li>
            ))}
          </ul>
        </FloatPanel>

        {/* Bottom — timeline */}
        <FloatPanel
          className="absolute bottom-[8%] right-[6%] w-[300px]"
          delay={2.4}
          period={4.8}
          reduced={reduced}
        >
          <div className="mb-3 flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-[#bfa68e]" strokeWidth={1.5} />
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#bfa68e]/70">
              Agenda
            </span>
          </div>
          <ul className="space-y-2.5">
            {[
              { time: '09h40', title: 'Audiência · TJSP', tag: 'Hoje' },
              { time: '14h00', title: 'Revisão contrato', tag: '3 dias' },
              { time: '17h30', title: 'Prazo embargos', tag: '7 dias' },
            ].map((it) => (
              <li key={it.title} className="flex items-center gap-3">
                <span className="w-10 font-mono text-[10px] tracking-wide text-white/40">
                  {it.time}
                </span>
                <span className="flex-1 truncate text-[12px] text-white/85">{it.title}</span>
                <span className="text-[10px] text-[#bfa68e]/80">{it.tag}</span>
              </li>
            ))}
          </ul>
        </FloatPanel>
      </div>

      {/* Dim overlay for legibility */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 55% 45% at 50% 55%, rgba(10,10,10,0.6), rgba(10,10,10,0.88) 70%)',
        }}
      />

      {/* Foreground content */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: reduced ? 0.01 : 0.8 }}
          className="mb-8 font-mono text-[11px] uppercase tracking-[0.35em] text-[#bfa68e]/80"
        >
          Chapter · 02
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: reduced ? 0.01 : 1, ease: [0.22, 1, 0.36, 1] }}
          className="font-serif text-[clamp(42px,7vw,96px)] font-bold leading-[0.98] tracking-tight text-white"
        >
          Seu próximo escritório.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: reduced ? 0.01 : 1, delay: reduced ? 0 : 0.25 }}
          className="mt-4 font-serif text-[clamp(22px,3vw,38px)] italic leading-snug text-[#bfa68e]"
        >
          Agora ele pensa com você.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: reduced ? 0.01 : 0.9, delay: reduced ? 0 : 0.55 }}
          className="mt-14 flex flex-col items-center gap-4 sm:flex-row sm:gap-6"
        >
          <IntroCTA />
          <Link
            href="/#precos"
            className="font-mono text-[12px] uppercase tracking-[0.3em] text-white/55 transition-colors hover:text-[#bfa68e]"
          >
            Ver planos
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

/* ── Entrar CTA — triggers vault opening on click ─────────────── */

type VaultContext = {
  opening: boolean
  trigger: () => void
}

const VaultCtx = createContext<VaultContext>({ opening: false, trigger: () => {} })

function IntroCTA() {
  const { trigger } = useContext(VaultCtx)
  return (
    <button
      type="button"
      onClick={trigger}
      className="group relative inline-flex items-center gap-3 rounded-full border border-[#bfa68e]/40 bg-[#bfa68e]/5 px-7 py-3 font-mono text-[12px] uppercase tracking-[0.3em] text-white transition-all duration-300 hover:border-[#bfa68e] hover:bg-[#bfa68e]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bfa68e]/70"
    >
      <span>Entrar</span>
      <ArrowRight
        className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
        strokeWidth={1.6}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          boxShadow:
            '0 0 0 1px rgba(191,166,142,0.35), 0 0 40px rgba(191,166,142,0.22)',
        }}
      />
    </button>
  )
}

/* ── Scene 4 · Vault opening — two panels slide apart ─────────── */

function VaultOverlay({
  opening,
  onComplete,
  reduced,
}: {
  opening: boolean
  onComplete: () => void
  reduced: boolean
}) {
  return (
    <AnimatePresence>
      {opening && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, delay: reduced ? 0 : 0.9 }}
          className="fixed inset-0 z-[100] flex"
          onAnimationComplete={onComplete}
          aria-hidden="true"
        >
          {/* Light behind the doors */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 70% 60% at 50% 50%, #fbf3e4 0%, #f5e8d3 30%, #bfa68e 65%, #7a5f48 100%)',
            }}
          />
          {/* Center gleam */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: reduced ? 0.6 : [0, 1, 0.8] }}
            transition={{ duration: reduced ? 0.01 : 1.1 }}
            style={{
              background:
                'radial-gradient(ellipse 30% 60% at 50% 50%, rgba(255,255,255,0.9), transparent 70%)',
            }}
          />

          {/* Left door */}
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: '-102%' }}
            transition={{
              duration: reduced ? 0.01 : 1.1,
              ease: [0.76, 0, 0.24, 1],
              delay: 0.05,
            }}
            className="relative z-10 h-full w-1/2 bg-[#0a0a0a]"
            style={{
              boxShadow: '4px 0 60px rgba(0,0,0,0.8)',
              borderRight: '1px solid rgba(191,166,142,0.25)',
            }}
          />
          {/* Right door */}
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: '102%' }}
            transition={{
              duration: reduced ? 0.01 : 1.1,
              ease: [0.76, 0, 0.24, 1],
              delay: 0.05,
            }}
            className="relative z-10 h-full w-1/2 bg-[#0a0a0a]"
            style={{
              boxShadow: '-4px 0 60px rgba(0,0,0,0.8)',
              borderLeft: '1px solid rgba(191,166,142,0.25)',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ── Page ─────────────────────────────────────────────────────── */

export default function IntroPage() {
  const router = useRouter()
  const prefersReduced = useReducedMotion() ?? false
  const reduced = prefersReduced
  const [opening, setOpening] = useState(false)
  const [pushed, setPushed] = useState(false)

  const trigger = useCallback(() => {
    if (opening) return
    setOpening(true)
  }, [opening])

  // When the vault door animation is "done" (triggered via AnimatePresence
  // exit callback OR the timeout safety net), route to / (landing).
  // 2026-05-02: Leonardo pediu redirect pra landing em vez de login.
  // Marca sessionStorage('pralvex-intro-seen','1') antes do push pra que
  // a landing page nao redirecione pra intro de novo nessa sessao.
  useEffect(() => {
    if (!opening || pushed) return
    const t = window.setTimeout(
      () => {
        setPushed(true)
        try { sessionStorage.setItem('pralvex-intro-seen', '1') } catch { /* noop */ }
        router.push('/')
      },
      reduced ? 120 : 1250,
    )
    return () => window.clearTimeout(t)
  }, [opening, pushed, reduced, router])

  // Marca intro como vista TAMBEM se user clicar "Pular intro" ou navegar
  // pra outro lugar antes do vault completar.
  useEffect(() => {
    return () => {
      try { sessionStorage.setItem('pralvex-intro-seen', '1') } catch { /* noop */ }
    }
  }, [])

  // Auto-trigger vault when user reaches the bottom of the page
  useEffect(() => {
    if (opening) return
    const handler = () => {
      const bottomReached =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4
      if (bottomReached) trigger()
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [opening, trigger])

  const ctxValue = useMemo<VaultContext>(
    () => ({ opening, trigger }),
    [opening, trigger],
  )

  return (
    <VaultCtx.Provider value={ctxValue}>
      <main className="relative min-h-screen w-full bg-[#0a0a0a] text-white antialiased">
        <HeroScene reduced={reduced} />
        <ManifestoScene reduced={reduced} />
        <DashboardPreviewScene reduced={reduced} />
        {/* Bottom sentinel — keeps scroll-to-bottom a deliberate act */}
        <div className="h-[12vh] w-full bg-[#0a0a0a]" aria-hidden="true" />
      </main>
      <VaultOverlay
        opening={opening}
        reduced={reduced}
        onComplete={() => {
          /* no-op: route push handled by effect */
        }}
      />
    </VaultCtx.Provider>
  )
}

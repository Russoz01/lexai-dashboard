'use client'

/* ══════════════════════════════════════════════════════════════
   Pralvex · /intro
   Cinematic brand reveal. 3 atos sequenciais, sem nav, sem footer.
   Voice: champagne em fundo escuro, atelier juridico anti-hype.

   Revamp 2026-05-03 (Leonardo: "intro estava feia e bugada"):
   - Timeline fixa via setTimeout (sem scroll dependency, zero flash 1s).
   - SessionStorage gate: 1a visita auto-toca, subsequente skipa pra '/'.
   - Reduced-motion gracioso: degrada animacoes mas mantem timing.
     Brave Shields force prefers-reduced-motion = aceita e adapta.
   - SSR hydration safe: matchMedia rodado APENAS no useEffect client-side.
   - Stats reais (UX P1.3): 33 agentes / 50min demo / 7d garantia
     em vez de "247 pecas geradas / 98% precisao" (inventados).
   - Sem video pesado (drone OOM no laptop fraco) — 100% layers CSS+motion.
   - Override via ?force-intro=1 ou ?reset-intro=1 (debug + first-touch).
   ══════════════════════════════════════════════════════════════ */

import { Suspense, useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { ChapterIntro } from './_components/ChapterIntro'
import { ChapterPreview } from './_components/ChapterPreview'
import { ChapterCTA } from './_components/ChapterCTA'

/* ── Timeline ────────────────────────────────────────────────────
   Total ~10.5s ate trigger do redirect. User pode pular a qualquer
   momento via "Pular intro" ou clicando "Entrar" no Ato III.

   Ato I:  0.0s → 3.5s  (manifesto + logo)
   Ato II: 3.5s → 7.0s  (dashboard preview)
   Ato III: 7.0s → 10.5s (CTA + atelier line)
   Vault:  10.5s → 11.7s (door slide-out + push '/')
   ───────────────────────────────────────────────────────────── */
const TIMELINE = {
  ATO_2_AT: 3500,
  ATO_3_AT: 7000,
  VAULT_AT: 10500,
  PUSH_AT: 11700,
} as const

const SESSION_KEY = 'pralvex-intro-seen'

type Act = 1 | 2 | 3

// QA fix (2026-05-03): Next.js 14 exige Suspense boundary quando
// useSearchParams() roda em pagina renderizada estaticamente. Sem Suspense,
// build prerender falha. Wrapper IntroPage delega pra IntroContent.
export default function IntroPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0a0a0a' }} />}>
      <IntroContent />
    </Suspense>
  )
}

function IntroContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // mounted gate evita hydration mismatch (#418): qualquer condicional
  // baseado em window/sessionStorage/matchMedia roda APENAS no client.
  const [mounted, setMounted] = useState(false)
  const [reduced, setReduced] = useState(false)
  const [act, setAct] = useState<Act>(1)
  const [opening, setOpening] = useState(false)
  const [pushed, setPushed] = useState(false)

  // ──────────────────────────────────────────────────────────────
  // Mount + reduced-motion + sessionStorage gate (client-only)
  // ──────────────────────────────────────────────────────────────
  useEffect(() => {
    setMounted(true)

    // Detecta reduced-motion no client (Brave Shields force isso = OK).
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', onChange)

    // Force-intro override via ?force-intro=1 (debug ou QA)
    const force = searchParams.get('force-intro') === '1'
    const reset = searchParams.get('reset-intro') === '1'
    if (reset) {
      try { sessionStorage.removeItem(SESSION_KEY) } catch { /* noop */ }
    }

    // Skip se ja viu nessa sessao (a menos que force-intro)
    if (!force) {
      try {
        const seen = sessionStorage.getItem(SESSION_KEY) === '1'
        if (seen) {
          router.replace('/')
          return
        }
      } catch {
        // sessionStorage bloqueado (private mode estrito) → toca normalmente
      }
    }

    return () => mq.removeEventListener('change', onChange)
  }, [router, searchParams])

  // ──────────────────────────────────────────────────────────────
  // Timeline orchestrator — dispara atos por setTimeout fixo.
  // Roda apenas apos mounted (evita flash + double-fire em StrictMode).
  // ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mounted) return
    if (opening || pushed) return

    const t2 = window.setTimeout(() => setAct(2), TIMELINE.ATO_2_AT)
    const t3 = window.setTimeout(() => setAct(3), TIMELINE.ATO_3_AT)
    const tVault = window.setTimeout(() => setOpening(true), TIMELINE.VAULT_AT)

    return () => {
      window.clearTimeout(t2)
      window.clearTimeout(t3)
      window.clearTimeout(tVault)
    }
  }, [mounted, opening, pushed])

  // ──────────────────────────────────────────────────────────────
  // Push pra '/' apos vault overlay completar.
  // Marca sessionStorage pra nao re-tocar intro nessa sessao.
  // ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!opening || pushed) return
    const t = window.setTimeout(() => {
      setPushed(true)
      try { sessionStorage.setItem(SESSION_KEY, '1') } catch { /* noop */ }
      router.push('/')
    }, TIMELINE.PUSH_AT - TIMELINE.VAULT_AT)
    return () => window.clearTimeout(t)
  }, [opening, pushed, router])

  // Marca intro como vista TAMBEM se user pular ou navegar pra fora
  useEffect(() => {
    return () => {
      try { sessionStorage.setItem(SESSION_KEY, '1') } catch { /* noop */ }
    }
  }, [])

  // CTA "Entrar" do Ato III dispara o vault imediatamente
  const handleEnter = useCallback(() => {
    if (opening) return
    setOpening(true)
  }, [opening])

  // ──────────────────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────────────────
  return (
    <main className="relative h-screen w-full overflow-hidden bg-[#0a0a0a] text-white antialiased">
      {/* Skip link top-right — sempre visivel */}
      <Link
        href="/"
        prefetch={false}
        className="absolute right-5 top-5 z-30 font-mono text-[11px] uppercase tracking-[0.3em] text-white/45 transition-colors hover:text-[#bfa68e] md:right-10 md:top-8"
        onClick={() => {
          try { sessionStorage.setItem(SESSION_KEY, '1') } catch { /* noop */ }
        }}
      >
        Pular intro <span aria-hidden="true">→</span>
      </Link>

      {/* Atmosfera de fundo — layers CSS + motion (sem video, sem OOM) */}
      <BackdropLayers reduced={reduced} mounted={mounted} />

      {/* Atos sequenciais via AnimatePresence — fade cross-fade fluido */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait" initial={false}>
          {mounted && act === 1 && <ChapterIntro key="a1" reduced={reduced} />}
          {mounted && act === 2 && <ChapterPreview key="a2" reduced={reduced} />}
          {mounted && act === 3 && (
            <ChapterCTA key="a3" reduced={reduced} onEnter={handleEnter} />
          )}
        </AnimatePresence>
      </div>

      {/* Progress bar inferior — mostra timeline visualmente */}
      {mounted && !opening && <ProgressBar reduced={reduced} />}

      {/* Vault overlay — 2 portas slide-out + clarão dourado */}
      <VaultOverlay opening={opening} reduced={reduced} />
    </main>
  )
}

/* ── Background atmospherics ─────────────────────────────────── */

function BackdropLayers({ reduced, mounted }: { reduced: boolean; mounted: boolean }) {
  return (
    <>
      {/* Dot grid champagne sobre noir */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage: 'radial-gradient(rgba(191,166,142,0.22) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, #000 35%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, #000 35%, transparent 85%)',
        }}
      />

      {/* Pulsing champagne radial — desligado se reduced */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0"
        animate={mounted && !reduced ? { opacity: [0.55, 0.85, 0.55] } : { opacity: 0.7 }}
        transition={{ duration: 8, ease: 'easeInOut', repeat: Infinity }}
        style={{
          background:
            'radial-gradient(ellipse 55% 55% at 50% 48%, rgba(245,232,211,0.14), rgba(191,166,142,0.08) 35%, transparent 72%)',
        }}
      />

      {/* Mid warm glow inferior */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0"
        animate={mounted && !reduced ? { opacity: [0.35, 0.6, 0.35] } : { opacity: 0.45 }}
        transition={{ duration: 8, ease: 'easeInOut', repeat: Infinity, delay: 1.4 }}
        style={{
          background:
            'radial-gradient(ellipse 80% 35% at 50% 95%, rgba(122,95,72,0.28), transparent 70%)',
        }}
      />

      {/* Linhas douradas drifting horizontais — desligadas se reduced */}
      {!reduced && mounted && (
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
              animate={{ x: ['0%', '260%'], opacity: [0, 0.9, 0] }}
              transition={{
                duration: 14 + i * 3,
                ease: 'linear',
                repeat: Infinity,
                delay: i * 2.4,
              }}
            />
          ))}
        </div>
      )}
    </>
  )
}

/* ── Progress bar ────────────────────────────────────────────── */

function ProgressBar({ reduced }: { reduced: boolean }) {
  // Width transita 0 → 100% no decorrer do TIMELINE.VAULT_AT (10.5s).
  // Reduced motion: corta linear, sem easing visivel.
  return (
    <div className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2">
      <div className="relative h-px w-32 overflow-hidden bg-white/10">
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{
            duration: reduced ? 0.01 : TIMELINE.VAULT_AT / 1000,
            ease: 'linear',
          }}
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-transparent via-[#bfa68e]/80 to-[#bfa68e]"
        />
      </div>
      <p className="mt-3 text-center font-mono text-[9px] uppercase tracking-[0.4em] text-white/35">
        Pralvex
      </p>
    </div>
  )
}

/* ── Vault overlay — duas portas slide-out apos timeline ─────── */

function VaultOverlay({ opening, reduced }: { opening: boolean; reduced: boolean }) {
  return (
    <AnimatePresence>
      {opening && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, delay: reduced ? 0 : 0.9 }}
          className="fixed inset-0 z-[100] flex"
          aria-hidden="true"
        >
          {/* Luz dourada por tras das portas */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 70% 60% at 50% 50%, #fbf3e4 0%, #f5e8d3 30%, #bfa68e 65%, #7a5f48 100%)',
            }}
          />
          {/* Clarao central */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: reduced ? 0.6 : [0, 1, 0.85] }}
            transition={{ duration: reduced ? 0.01 : 1.1 }}
            style={{
              background:
                'radial-gradient(ellipse 30% 60% at 50% 50%, rgba(255,255,255,0.92), transparent 70%)',
            }}
          />

          {/* Porta esquerda */}
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
          {/* Porta direita */}
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

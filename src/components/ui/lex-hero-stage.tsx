'use client'

import { useEffect, useRef } from 'react'
import {
  Calculator,
  FileText,
  Handshake,
  PenLine,
  Search,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'

/* ════════════════════════════════════════════════════════════════════
 * LexHeroStage (v9 · 2026-04-19)
 * ────────────────────────────────────────────────────────────────────
 * O "momento 3D" do hero — seis cards de agentes flutuando no espaco
 * com perspective real, cada um em z-depth distinto. Mouse parallax
 * suave: cards no fundo se movem mais que os do front (depth = motion).
 *
 * Decisao tecnica: CSS 3D transforms ao inves de Three.js / R3F.
 *   - Zero deps novos
 *   - GPU-accelerated nativo
 *   - Render no body, sem WebGL context warmup
 *   - Reduce-motion friendly via globals.css
 *
 * Disposicao: cinco cards perifericos (cantos) + um central focal.
 * Cada card carrega:
 *   · icone do agente
 *   · label
 *   · uma linha tecnica (verificavel, nao marketing)
 *
 * Animacao de entrada via lex-stage-card no globals.css (1.1s ease-out
 * por card, escalonado de 0 a 0.45s). Apos entrada, mouse drives
 * --rx/--ry/--mx/--my CSS vars no container.
 * ═══════════════════════════════════════════════════════════════════ */

interface StageAgent {
  Icon: LucideIcon
  label: string
  meta: string
  /** Posicao em vw/vh relativa ao centro */
  x: number
  y: number
  /** Z-depth em px (mais alto = mais "perto" da camera) */
  z: number
  /** Rotacao em Y graus pra dar profundidade */
  rot: number
  /** Delay de entrada em segundos */
  delay: number
  /** Multiplicador de parallax (1 = mexe normal, 2 = mexe 2x mais) */
  parallax: number
  /** Seed pra cor do icone */
  tint: string
}

const STAGE: StageAgent[] = [
  { Icon: PenLine,     label: 'Redator',     meta: 'peca em 4min',     x: -28, y: -16, z: 80,  rot: -7, delay: 0.05, parallax: 1.4, tint: 'text-[#e6d4bd]' },
  { Icon: Search,      label: 'Pesquisador', meta: 'STF · STJ · TJs',  x:  24, y: -22, z: 110, rot:  6, delay: 0.10, parallax: 1.6, tint: 'text-[#e6d4bd]' },
  { Icon: Calculator,  label: 'Calculador',  meta: 'INPC · IGPM · IPCA', x: -32, y:  18, z: 30,  rot: -3, delay: 0.20, parallax: 0.7, tint: 'text-white/80' },
  { Icon: ShieldCheck, label: 'Compliance',  meta: 'Provimento 205',   x:  30, y:  22, z: 60,  rot:  9, delay: 0.25, parallax: 1.1, tint: 'text-[#e6d4bd]' },
  { Icon: FileText,    label: 'Resumidor',   meta: '60 acordaos/min',  x:  -2, y: -34, z: 140, rot:  2, delay: 0.30, parallax: 2.0, tint: 'text-white/85' },
  { Icon: Handshake,   label: 'Negociador',  meta: 'BATNA · ZOPA',     x:   4, y:  32, z: 100, rot: -2, delay: 0.35, parallax: 1.5, tint: 'text-[#e6d4bd]' },
]

export function LexHeroStage() {
  const stageRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>()

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    let targetRX = 0, targetRY = 0, targetMX = 0, targetMY = 0
    let curRX = 0, curRY = 0, curMX = 0, curMY = 0

    function onMove(e: MouseEvent) {
      const rect = stage!.getBoundingClientRect()
      const cx = (e.clientX - rect.left) / rect.width - 0.5
      const cy = (e.clientY - rect.top) / rect.height - 0.5
      // Camera tilt — sutil
      targetRX = cy * -5
      targetRY = cx * 9
      // Translacao de parallax base — multiplicada por card.parallax no transform
      targetMX = cx * 14
      targetMY = cy * 10
    }

    function onLeave() {
      targetRX = 0
      targetRY = 0
      targetMX = 0
      targetMY = 0
    }

    function loop() {
      // Lerp suave (10% por frame)
      curRX += (targetRX - curRX) * 0.08
      curRY += (targetRY - curRY) * 0.08
      curMX += (targetMX - curMX) * 0.08
      curMY += (targetMY - curMY) * 0.08
      stage!.style.setProperty('--rx', `${curRX.toFixed(2)}deg`)
      stage!.style.setProperty('--ry', `${curRY.toFixed(2)}deg`)
      stage!.style.setProperty('--mx', `${curMX.toFixed(2)}px`)
      stage!.style.setProperty('--my', `${curMY.toFixed(2)}px`)
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseleave', onLeave)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <div
      ref={stageRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden [perspective:1600px]"
      style={
        {
          '--rx': '0deg',
          '--ry': '0deg',
          '--mx': '0px',
          '--my': '0px',
        } as React.CSSProperties
      }
    >
      <div
        className="absolute inset-0 will-change-transform [transform-style:preserve-3d]"
        style={{
          transform: 'rotateX(var(--rx)) rotateY(var(--ry))',
          transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {STAGE.map((a) => {
          const Icon = a.Icon
          return (
            <div
              key={a.label}
              className="lex-stage-card absolute left-1/2 top-1/2"
              style={
                {
                  '--fx': `calc(${a.x}vw + (var(--mx) * ${a.parallax}))`,
                  '--fy': `calc(${a.y}vh + (var(--my) * ${a.parallax}))`,
                  '--fz': `${a.z}px`,
                  '--frot': `${a.rot}deg`,
                  animationDelay: `${a.delay}s`,
                  transform: `translate(-50%, -50%) translate3d(calc(${a.x}vw + (var(--mx) * ${a.parallax})), calc(${a.y}vh + (var(--my) * ${a.parallax})), ${a.z}px) rotate3d(0,1,0,${a.rot}deg)`,
                } as React.CSSProperties
              }
            >
              <div className="relative flex w-[10rem] items-center gap-2.5 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-white/[0.015] p-3 shadow-[0_18px_60px_-20px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl md:w-[14.5rem] md:gap-3 md:p-3.5">
                {/* gold corner glint */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -left-px -top-px size-3 rounded-tl-2xl border-l border-t border-[#bfa68e]/40"
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute -bottom-px -right-px size-3 rounded-br-2xl border-b border-r border-[#bfa68e]/40"
                />
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#bfa68e]/25 bg-gradient-to-br from-[#bfa68e]/[0.18] to-transparent">
                  <Icon className={`size-[17px] ${a.tint}`} strokeWidth={1.6} />
                </div>
                <div className="min-w-0">
                  <div className="text-[12.5px] font-medium tracking-tight text-white">
                    {a.label}
                  </div>
                  <div className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">
                    {a.meta}
                  </div>
                </div>
                {/* status dot — agente "ativo" */}
                <div className="absolute right-2.5 top-2.5 flex size-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#bfa68e]/60" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-[#bfa68e]" />
                </div>
              </div>
            </div>
          )
        })}

        {/* Connecting lines — desenho sutil entre cards (depth feel) */}
        <svg
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          width="900"
          height="500"
          viewBox="-450 -250 900 500"
          fill="none"
          aria-hidden
        >
          <defs>
            <linearGradient id="lex-stage-line" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#bfa68e" stopOpacity="0" />
              <stop offset="50%" stopColor="#bfa68e" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#bfa68e" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M -200 -100 L 200 -120 M -220 100 L 220 110 M 0 -200 L 0 200"
            stroke="url(#lex-stage-line)"
            strokeWidth="1"
            strokeDasharray="2 6"
            opacity="0.5"
          />
        </svg>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────
 * GlyphReveal — revela texto caractere-por-caractere com flip 3D
 * Usado pra titulo do manifesto. Pure CSS, mais elegante que palavras.
 * ────────────────────────────────────────────────────────────────── */

export function GlyphReveal({
  text,
  className,
  stagger = 0.025,
  delay = 0,
}: {
  text: string
  className?: string
  stagger?: number
  delay?: number
}) {
  return (
    <span className={className} style={{ display: 'inline-block', perspective: '600px' }}>
      {text.split('').map((c, i) => (
        <span
          key={i}
          className="lex-glyph"
          style={{
            animationDelay: `${delay + i * stagger}s`,
            display: c === ' ' ? 'inline' : 'inline-block',
            whiteSpace: c === ' ' ? 'pre' : undefined,
          }}
        >
          {c}
        </span>
      ))}
    </span>
  )
}

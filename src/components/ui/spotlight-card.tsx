'use client'

import { useRef, type MouseEvent, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

/* ═════════════════════════════════════════════════════════════
 * SpotlightCard — luz branca que segue o mouse em volta da borda
 * Inspirado em 21st.dev/easemize/spotlight-card
 * Duas camadas: (1) borda luminosa (mask gradient radial)
 *               (2) brilho suave no interior
 * ─────────────────────────────────────────────────────────────
 * [NOTA PARA PRÓXIMA SESSÃO — 2026-04-17]
 * Em uso em: src/components/ui/lex-pricing.tsx (landing pricing).
 * Wrappa cada Card na grid, com color+size diferentes para o
 * plano "popular" (champagne, 420) vs restante (branco, 360).
 * Para reutilizar no dashboard, basta envolver o card-alvo.
 * ═════════════════════════════════════════════════════════════ */

interface SpotlightCardProps {
  children: ReactNode
  className?: string
  /** Cor principal do spotlight (default: branco) */
  color?: string
  /** Raio do spotlight em px (default: 360) */
  size?: number
}

export function SpotlightCard({
  children,
  className,
  color = 'rgba(255,255,255,0.85)',
  size = 360,
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`)
    el.style.setProperty('--my', `${e.clientY - rect.top}px`)
  }

  function handleLeave() {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--mx', `-9999px`)
    el.style.setProperty('--my', `-9999px`)
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={cn('group/spot relative isolate', className)}
      style={
        {
          '--mx': '-9999px',
          '--my': '-9999px',
          '--spot-size': `${size}px`,
          '--spot-color': color,
        } as React.CSSProperties
      }
    >
      {/* ── Camada 1 — Borda luminosa (runs around the edge) ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover/spot:opacity-100"
        style={{
          background:
            'radial-gradient(var(--spot-size) circle at var(--mx) var(--my), var(--spot-color), transparent 45%)',
          WebkitMask:
            'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          mask:
            'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          padding: '1px',
        }}
      />

      {/* ── Camada 2 — Brilho suave no interior ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover/spot:opacity-100"
        style={{
          background:
            'radial-gradient(calc(var(--spot-size) * 0.9) circle at var(--mx) var(--my), rgba(255,255,255,0.06), transparent 60%)',
        }}
      />

      {children}
    </div>
  )
}

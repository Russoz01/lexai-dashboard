'use client'

/**
 * PralvexMark — selo PX editorial.
 * Substitui 100% das ocorrências do monograma LX herdado do LexAI.
 *
 * variant="seal"  → quadrado com borda champagne + gradiente noir + letras PX
 * variant="bare"  → só as letras PX (usa quando o wrapper externo já tem o shell, ex.: .sidebar-brand .logo)
 */

interface PralvexMarkProps {
  variant?: 'seal' | 'bare'
  size?: number
  /** força cor custom (default: champagne #bfa68e) */
  tone?: string
  className?: string
}

export function PralvexMark({
  variant = 'seal',
  size = 40,
  tone = '#bfa68e',
  className = '',
}: PralvexMarkProps) {
  const fontSize = size >= 44 ? 14 : size >= 36 ? 12 : size >= 28 ? 10.5 : 9

  const letters = (
    <span
      aria-label="Pralvex"
      style={{
        fontFamily: "'DM Mono', ui-monospace, Menlo, Consolas, monospace",
        fontSize,
        fontWeight: 700,
        letterSpacing: '0.24em',
        color: tone,
        textShadow: `0 0 14px ${tone}55`,
        lineHeight: 1,
        paddingLeft: '0.22em',
        display: 'inline-flex',
      }}
    >
      PX
    </span>
  )

  if (variant === 'bare') return letters

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.24),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1410 0%, #0a0807 100%)',
        border: `1px solid ${tone}55`,
        boxShadow: `inset 0 1px 0 rgba(230,212,189,0.08), 0 4px 20px ${tone}33`,
      }}
    >
      {letters}
    </div>
  )
}

export default PralvexMark

'use client'

import { useState } from 'react'

/**
 * PralvexMark — selo Pralvex.
 *
 * v2.0 (2026-05-02): logo monogram dourado "P + balança" via /public/logo-p.png.
 * Fallback automático pro selo PX editorial se o asset não estiver presente
 * (onError do <img>).
 *
 * variant="seal" → quadrado com borda champagne + gradiente noir, contém logo
 * variant="bare" → só a letra/imagem (use quando o wrapper externo já tem shell)
 */

interface PralvexMarkProps {
  variant?: 'seal' | 'bare'
  size?: number
  /** força cor custom no fallback PX text (default: champagne #bfa68e) */
  tone?: string
  className?: string
}

export function PralvexMark({
  variant = 'seal',
  size = 40,
  tone = '#bfa68e',
  className = '',
}: PralvexMarkProps) {
  const [imgFailed, setImgFailed] = useState(false)
  const fontSize = size >= 44 ? 14 : size >= 36 ? 12 : size >= 28 ? 10.5 : 9

  // Inner content: logo image OR PX text fallback
  const inner = imgFailed ? (
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
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-p.svg"
      alt="Pralvex"
      width={Math.round(size * 0.78)}
      height={Math.round(size * 0.78)}
      onError={() => setImgFailed(true)}
      style={{
        objectFit: 'contain',
        display: 'block',
        // sutil glow champagne sobre o monogram dourado em ambos os modes
        filter: `drop-shadow(0 0 8px ${tone}40)`,
      }}
    />
  )

  if (variant === 'bare') return inner

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
      {inner}
    </div>
  )
}

export default PralvexMark

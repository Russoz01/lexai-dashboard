'use client'

/* ══════════════════════════════════════════════════════════════
 * AtelierCard — v10.10 vocabulário visual canônico do dashboard
 * ──────────────────────────────────────────────────────────────
 * Consolida o padrão editorial v10.9 (hairline gold ::before +
 * radial cursor glow ::after + motion entry) em um componente
 * compartilhado entre chat, prazos, financeiro, configuracoes,
 * planos. Objetivo: uma mesma linguagem visual em todas as
 * sub-rotas do dashboard, sem copy-paste de CSS.
 *
 * Props mínimas — o chamador só precisa passar título.
 * Renderiza como <Link> se `href`, <button> se `onClick`,
 * <article> caso contrário (acessibilidade correta).
 *
 * Respeita prefers-reduced-motion: sem translate/scale,
 * só opacity.
 * ══════════════════════════════════════════════════════════════ */

import { type ReactNode, type MouseEvent } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const EASE = [0.22, 1, 0.36, 1] as const

export type AtelierCardAccent = 'gold' | 'carmim'

export interface AtelierCardProps {
  roman?: string
  title: ReactNode
  description?: ReactNode
  accent?: AtelierCardAccent
  href?: string
  onClick?: () => void
  children?: ReactNode
  className?: string
  /** Texto do item para aria-label se o title for ReactNode complexo. */
  ariaLabel?: string
  /** Desabilita o hover (ex.: card "bloqueado por plano"). */
  muted?: boolean
}

export function AtelierCard({
  roman,
  title,
  description,
  accent = 'gold',
  href,
  onClick,
  children,
  className,
  ariaLabel,
  muted,
}: AtelierCardProps) {
  const handleMouseMove = (event: MouseEvent<HTMLElement>) => {
    if (muted) return
    const rect = event.currentTarget.getBoundingClientRect()
    event.currentTarget.style.setProperty('--mx', `${event.clientX - rect.left}px`)
    event.currentTarget.style.setProperty('--my', `${event.clientY - rect.top}px`)
  }

  const inner = (
    <>
      {roman && <span className="atelier-card__roman">{roman}</span>}
      <h3 className="atelier-card__title">{title}</h3>
      {description && <div className="atelier-card__desc">{description}</div>}
      {children && <div className="atelier-card__slot">{children}</div>}
      <span className="atelier-card__hairline" aria-hidden />
      <span className="atelier-card__glow" aria-hidden />
    </>
  )

  const baseProps = {
    'data-accent': accent,
    'data-muted': muted ? 'true' : undefined,
    className: ['atelier-card', className].filter(Boolean).join(' '),
    onMouseMove: handleMouseMove,
    'aria-label': ariaLabel,
  } as const

  const entryMotion = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-80px' },
    transition: { duration: 0.8, ease: EASE },
  }

  if (href) {
    return (
      <motion.div {...entryMotion}>
        <Link href={href} prefetch={false} {...baseProps}>
          {inner}
        </Link>
      </motion.div>
    )
  }

  if (onClick) {
    return (
      <motion.div {...entryMotion}>
        <button type="button" onClick={onClick} {...baseProps}>
          {inner}
        </button>
      </motion.div>
    )
  }

  return (
    <motion.article {...entryMotion} {...baseProps}>
      {inner}
    </motion.article>
  )
}

export default AtelierCard

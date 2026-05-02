'use client'

import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { useEffect, useState, type ReactNode } from 'react'

/**
 * Reveal — wrapper leve que anima filhos on-scroll usando framer-motion.
 *
 * Fix (v4 · 2026-05-02): fallback de visibilidade pra evitar conteúdo invisível
 * permanente. Antes, `whileInView` podia falhar em headless browsers,
 * IntersectionObserver buggy ou prefers-reduced-motion → conteúdo opacity: 0
 * eternamente (P0 audit: /termos /privacidade /empresas renderizavam void preto).
 *
 * Estratégias combinadas:
 * 1. useReducedMotion → animate=visible imediato (a11y)
 * 2. Safety timeout de 1.2s → force-visible se whileInView não disparou
 * 3. viewport.once + amount minimo pra evitar miss em containers altos
 */
export function Reveal({
  children,
  delay = 0,
  as = 'div',
  className,
}: {
  children: ReactNode
  delay?: number
  as?: 'div' | 'section' | 'header' | 'span' | 'p' | 'article' | 'li' | 'ul'
  className?: string
}) {
  const reduced = useReducedMotion()
  const [forceVisible, setForceVisible] = useState(false)

  useEffect(() => {
    // Safety net: se Reveal não disparou em 1.2s (IntersectionObserver miss,
    // headless browser, etc), força visível pra evitar conteúdo invisível.
    const timer = setTimeout(() => setForceVisible(true), 1200)
    return () => clearTimeout(timer)
  }, [])

  const variants: Variants = {
    hidden:  { opacity: 0, y: 16, filter: 'blur(8px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
    },
  }

  const MotionComponent =
    as === 'section' ? motion.section
    : as === 'header' ? motion.header
    : as === 'span'   ? motion.span
    : as === 'p'      ? motion.p
    : as === 'article'? motion.article
    : as === 'li'     ? motion.li
    : as === 'ul'     ? motion.ul
    : motion.div

  // Se reduced-motion ou safety timeout disparou, animate=visible direto
  // (skipa whileInView completamente, garante conteúdo sempre visível).
  if (reduced || forceVisible) {
    return (
      <MotionComponent
        initial={reduced ? 'visible' : 'hidden'}
        animate="visible"
        variants={variants}
        className={className}
      >
        {children}
      </MotionComponent>
    )
  }

  return (
    <MotionComponent
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '0px 0px -60px 0px', amount: 0.05 }}
      variants={variants}
      className={className}
    >
      {children}
    </MotionComponent>
  )
}

/**
 * WordReveal — revela palavra por palavra via CSS keyframes.
 *
 * Fix (v3): abandonamos framer-motion staggerChildren aqui — ele estava
 * falhando intermitentemente deixando todas palavras em opacity:0.
 * Agora eh puro CSS (animation + animationDelay por indice) — 100%
 * confiavel, dispara na primeira pintura, sem precisar de IntersectionObserver.
 */
export function WordReveal({
  text,
  className,
  stagger = 0.06,
}: {
  text: string
  className?: string
  stagger?: number
}) {
  const words = text.split(' ')
  return (
    <span className={className}>
      {words.map((w, i) => (
        <span
          key={`${w}-${i}`}
          className="lex-word-reveal"
          style={{
            animationDelay: `${i * stagger}s`,
            // whitespace entre palavras preservado por HTML entity
          }}
        >
          {w}
          {i < words.length - 1 ? '\u00A0' : ''}
        </span>
      ))}
    </span>
  )
}

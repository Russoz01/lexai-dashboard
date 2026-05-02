'use client'

import { motion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'

/**
 * Reveal — wrapper leve que anima filhos on-scroll usando framer-motion.
 * Usa `whileInView` (idiomatico) para garantir disparo confiavel.
 *
 * Fix (v3): removido `motion.create(Tag)` dinamico. Garante que elementos
 * ja visiveis no viewport inicial disparem normalmente.
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

  return (
    <MotionComponent
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '0px 0px -60px 0px' }}
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

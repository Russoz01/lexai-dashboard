'use client'

import { motion, useInView, type Variants } from 'framer-motion'
import { useRef, type ReactNode } from 'react'

/**
 * Reveal — wrapper leve que anima filhos on-scroll usando framer-motion.
 * Substitui a dependencia `motion/react` + TimelineContent do pricing-section-4
 * original. Mesma ideia: blur + slide + fade com stagger por delay.
 */
export function Reveal({
  children,
  delay = 0,
  as: Tag = 'div',
  className,
}: {
  children: ReactNode
  delay?: number
  as?: keyof JSX.IntrinsicElements
  className?: string
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -80px 0px' })

  const variants: Variants = {
    hidden:  { opacity: 0, y: -20, filter: 'blur(10px)' },
    visible: { opacity: 1, y: 0,   filter: 'blur(0px)',
      transition: { delay, duration: 0.55, ease: 'easeOut' },
    },
  }

  const MotionTag = motion.create(Tag as 'div')

  return (
    <MotionTag
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={variants}
      className={className}
    >
      {children}
    </MotionTag>
  )
}

/**
 * WordReveal — revela palavra por palavra com stagger, substitui
 * VerticalCutReveal do original (sem Intl.Segmenter ou clip complexo).
 */
export function WordReveal({
  text,
  className,
  stagger = 0.08,
  reverse = false,
}: {
  text: string
  className?: string
  stagger?: number
  reverse?: boolean
}) {
  const words = text.split(' ')
  const container: Variants = {
    hidden:  {},
    visible: {
      transition: {
        staggerChildren: stagger,
        staggerDirection: reverse ? -1 : 1,
      },
    },
  }
  const item: Variants = {
    hidden:  { y: '100%', opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 240, damping: 26 },
    },
  }
  return (
    <motion.span
      initial="hidden"
      animate="visible"
      variants={container}
      className={className}
    >
      {words.map((w, i) => (
        <span
          key={i}
          style={{ display: 'inline-flex', overflow: 'hidden', marginRight: '0.25em' }}
        >
          <motion.span variants={item} style={{ display: 'inline-block' }}>
            {w}
          </motion.span>
        </span>
      ))}
    </motion.span>
  )
}

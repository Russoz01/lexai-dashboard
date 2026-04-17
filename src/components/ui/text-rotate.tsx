'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'

/* TextRotate — palavras alternando verticalmente com blur + slide.
 * Fix (v2):
 *  - altura estabilizada via medicao da palavra mais larga em ghost span
 *    (evita colapso e jump de layout)
 *  - sem `align-bottom` (baseline do h1 pai pode estar em outro lugar)
 *  - position: relative no wrapper para AnimatePresence gerenciar as
 *    palavras absolutas sem pular. */

export function TextRotate({
  words,
  interval = 2400,
  className,
}: {
  words: string[]
  interval?: number
  className?: string
}) {
  const [i, setI] = useState(0)

  useEffect(() => {
    const id = setInterval(
      () => setI((v) => (v + 1) % words.length),
      interval,
    )
    return () => clearInterval(id)
  }, [interval, words.length])

  return (
    <span
      className={cn('relative inline-block overflow-hidden align-baseline', className)}
      style={{ verticalAlign: 'baseline' }}
    >
      {/* Ghost: define largura/altura da palavra mais longa (sem ser visivel) */}
      <span className="invisible whitespace-nowrap" aria-hidden>
        {words.reduce((a, b) => (a.length > b.length ? a : b))}
      </span>

      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={words[i]}
          initial={{ y: '0.9em', opacity: 0, filter: 'blur(6px)' }}
          animate={{ y: 0,       opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: '-0.9em',   opacity: 0, filter: 'blur(6px)' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 whitespace-nowrap"
        >
          {words[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'

/* TextRotate — palavras alternando verticalmente com blur + slide.
 * Padrão 21st.dev hero headline accent. */

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
    const id = setInterval(() => setI((v) => (v + 1) % words.length), interval)
    return () => clearInterval(id)
  }, [interval, words.length])

  return (
    <span className={cn('relative inline-flex overflow-hidden align-bottom', className)}>
      <AnimatePresence mode="wait">
        <motion.span
          key={words[i]}
          initial={{ y: '100%', opacity: 0, filter: 'blur(6px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: '-100%', opacity: 0, filter: 'blur(6px)' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block whitespace-nowrap"
        >
          {words[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

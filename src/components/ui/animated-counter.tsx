'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * AnimatedCounter — conta de 0 ate value com easing (out-cubic), ~1200ms.
 * Respeita prefers-reduced-motion.
 */
export function AnimatedCounter({
  value,
  duration = 1200,
  format,
  className,
}: {
  value: number
  duration?: number
  format?: (n: number) => string
  className?: string
}) {
  const [display, setDisplay] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const reduce = typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) { setDisplay(value); return }

    const start = performance.now()
    const from = 0
    function tick(now: number) {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(Math.round(from + (value - from) * eased))
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [value, duration])

  const text = format ? format(display) : display.toLocaleString('pt-BR')
  return <span className={className}>{text}</span>
}

'use client'

import { useEffect, useRef } from 'react'

/* ════════════════════════════════════════════════════════════════════
 * ScrollProgress — barra fina champagne que enche conforme o scroll.
 * Top fixed, 2px, gradient gold. Update via requestAnimationFrame +
 * passive scroll listener — zero overhead, GPU accelerated transform.
 *
 * Uso (no top da landing):
 *   <ScrollProgress />
 * ═══════════════════════════════════════════════════════════════════ */

export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>()

  useEffect(() => {
    const bar = barRef.current
    if (!bar) return

    function update() {
      if (!bar) return
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const docHeight = (document.documentElement.scrollHeight - window.innerHeight)
      const progress = docHeight > 0 ? Math.min(1, Math.max(0, scrollTop / docHeight)) : 0
      bar.style.transform = `scaleX(${progress})`
    }

    function onScroll() {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px]"
      style={{ background: 'rgba(255, 255, 255, 0.04)' }}
    >
      <div
        ref={barRef}
        className="h-full origin-left"
        style={{
          background: 'linear-gradient(90deg, #f5e8d3 0%, #bfa68e 50%, #8a6f55 100%)',
          boxShadow: '0 0 8px rgba(191, 166, 142, 0.4)',
          transform: 'scaleX(0)',
          willChange: 'transform',
          transition: 'transform 0.08s linear',
        }}
      />
    </div>
  )
}

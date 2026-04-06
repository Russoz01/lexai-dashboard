'use client'

import { useEffect, useRef } from 'react'

export default function TopoBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    let w = 0, h = 0
    let time = 0
    let rafId = 0
    let paused = false

    function resize() {
      if (!canvas) return
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    function drawWave(yBase: number, amplitude: number, frequency: number, phase: number, alpha: number) {
      if (!ctx) return
      ctx.beginPath()
      ctx.moveTo(0, yBase)
      for (let x = 0; x <= w; x += 2) {
        const y = yBase +
          Math.sin((x * frequency * 0.001) + phase) * amplitude +
          Math.sin((x * frequency * 0.0007) + phase * 1.3) * (amplitude * 0.5) +
          Math.sin((x * frequency * 0.0003) + phase * 0.7) * (amplitude * 0.3)
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = `rgba(255,255,255,${alpha})`
      ctx.lineWidth = 1
      ctx.stroke()
    }

    function render() {
      if (paused) return
      rafId = requestAnimationFrame(render)
      time += 0.003

      ctx!.clearRect(0, 0, w, h)

      // Draw topographic wave lines from bottom to middle
      const numLines = 18
      const startY = h * 0.45
      const endY = h * 1.05
      const spacing = (endY - startY) / numLines

      for (let i = 0; i < numLines; i++) {
        const yBase = startY + i * spacing
        const amplitude = 15 + i * 2.5
        const frequency = 2.5 - i * 0.05
        const phase = time + i * 0.4
        // Lines get more visible toward the bottom
        const alpha = 0.012 + (i / numLines) * 0.025
        drawWave(yBase, amplitude, frequency, phase, alpha)
      }

      // Extra set of finer lines in the upper area
      for (let i = 0; i < 8; i++) {
        const yBase = h * 0.2 + i * (h * 0.04)
        const amplitude = 8 + i * 1.5
        const frequency = 3 - i * 0.1
        const phase = time * 0.7 + i * 0.6
        const alpha = 0.006 + (i / 8) * 0.01
        drawWave(yBase, amplitude, frequency, phase, alpha)
      }
    }

    function onVisibility() {
      if (document.hidden) {
        paused = true
        cancelAnimationFrame(rafId)
      } else {
        paused = false
        rafId = requestAnimationFrame(render)
      }
    }

    document.addEventListener('visibilitychange', onVisibility)
    rafId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100vw', height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 1,
      }}
    />
  )
}

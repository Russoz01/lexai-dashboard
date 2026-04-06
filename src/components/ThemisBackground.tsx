'use client'

import { useEffect, useRef } from 'react'

export default function ThemisBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const targetRef = useRef({ x: -1000, y: -1000 })
  const rafRef = useRef(0)

  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = '/themis.png'
    img.onload = () => { imgRef.current = img }

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let dpr = window.devicePixelRatio || 1
    let paused = false

    function resize() {
      if (!canvas) return
      dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    function onMouseMove(e: MouseEvent) {
      targetRef.current = { x: e.clientX, y: e.clientY }
    }

    function onVisibility() {
      if (document.hidden) {
        paused = true
        cancelAnimationFrame(rafRef.current)
      } else {
        paused = false
        rafRef.current = requestAnimationFrame(render)
      }
    }

    function render() {
      if (paused) return
      rafRef.current = requestAnimationFrame(render)

      const w = window.innerWidth
      const h = window.innerHeight
      ctx!.clearRect(0, 0, w, h)

      // Smooth mouse follow
      mouseRef.current.x += (targetRef.current.x - mouseRef.current.x) * 0.06
      mouseRef.current.y += (targetRef.current.y - mouseRef.current.y) * 0.06

      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      if (imgRef.current) {
        const img = imgRef.current
        const imgH = h * 1.2
        const imgW = imgH * (img.width / img.height)
        // Parallax — image moves opposite to cursor
        const px = -(mx - w / 2) * 0.01
        const py = -(my - h / 2) * 0.01
        const imgX = w * 0.55 + px
        const imgY = (h - imgH) / 2 + py

        // Draw image with grayscale filter
        ctx!.save()
        ctx!.globalAlpha = 0.18
        ctx!.filter = 'grayscale(100%) brightness(0.6) contrast(1.1)'
        ctx!.drawImage(img, imgX, imgY, imgW, imgH)
        ctx!.restore()

        // Spotlight mask — reveals image around cursor
        ctx!.save()
        ctx!.globalCompositeOperation = 'destination-in'
        const grad = ctx!.createRadialGradient(mx, my, 0, mx, my, 280)
        grad.addColorStop(0, 'rgba(255,255,255,1)')
        grad.addColorStop(0.5, 'rgba(255,255,255,0.4)')
        grad.addColorStop(0.8, 'rgba(255,255,255,0.08)')
        grad.addColorStop(1, 'rgba(255,255,255,0)')
        ctx!.fillStyle = grad
        ctx!.fillRect(0, 0, w, h)
        ctx!.restore()

        // Blue glow at cursor point
        ctx!.save()
        ctx!.globalAlpha = 0.03
        const glowGrad = ctx!.createRadialGradient(mx, my, 0, mx, my, 200)
        glowGrad.addColorStop(0, 'rgba(37,99,235,0.4)')
        glowGrad.addColorStop(1, 'rgba(37,99,235,0)')
        ctx!.fillStyle = glowGrad
        ctx!.fillRect(0, 0, w, h)
        ctx!.restore()
      }
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', onVisibility)
    rafRef.current = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed', top: 0, left: 0,
        width: '100vw', height: '100vh',
        zIndex: 1, pointerEvents: 'none',
      }}
    />
  )
}

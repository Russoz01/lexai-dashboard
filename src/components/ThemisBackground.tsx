'use client'

import { useEffect, useRef } from 'react'

export default function ThemisBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const mouse = useRef({ x: -1000, y: -1000 })
  const smoothMouse = useRef({ x: -1000, y: -1000 })
  const rafId = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = '/themis.png'
    img.onload = () => { imgRef.current = img }

    const dpr = window.devicePixelRatio || 1

    function resize() {
      if (!canvas) return
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = '100vw'
      canvas.style.height = '100vh'
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    function onMouseMove(e: MouseEvent) {
      mouse.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', onMouseMove)

    // Offscreen canvas for masking (avoids creating new canvas every frame)
    const tempCanvas = document.createElement('canvas')
    const tempCtx = tempCanvas.getContext('2d')!

    function render() {
      if (!ctx || !canvas) return
      const w = window.innerWidth
      const h = window.innerHeight
      ctx.clearRect(0, 0, w, h)

      // Smooth mouse follow (lerp)
      smoothMouse.current.x += (mouse.current.x - smoothMouse.current.x) * 0.06
      smoothMouse.current.y += (mouse.current.y - smoothMouse.current.y) * 0.06
      const mx = smoothMouse.current.x
      const my = smoothMouse.current.y

      if (imgRef.current) {
        const img = imgRef.current

        // Image covers entire viewport (like background-size: cover)
        const imgRatio = img.width / img.height
        const screenRatio = w / h
        let drawW: number, drawH: number
        if (screenRatio > imgRatio) {
          drawW = w * 1.15
          drawH = drawW / imgRatio
        } else {
          drawH = h * 1.15
          drawW = drawH * imgRatio
        }

        // Parallax: image moves OPPOSITE to cursor
        const parallaxX = -(mx - w / 2) * 0.015
        const parallaxY = -(my - h / 2) * 0.015
        const drawX = (w - drawW) / 2 + parallaxX
        const drawY = (h - drawH) / 2 + parallaxY

        // LAYER 1: Base image (barely visible, always there)
        ctx.save()
        ctx.globalAlpha = 0.035
        ctx.filter = 'grayscale(100%) brightness(0.5) contrast(1.3)'
        ctx.drawImage(img, drawX, drawY, drawW, drawH)
        ctx.restore()

        // LAYER 2: Revealed image (spotlight around cursor)
        tempCanvas.width = w
        tempCanvas.height = h

        tempCtx.clearRect(0, 0, w, h)
        tempCtx.globalAlpha = 0.18
        tempCtx.filter = 'grayscale(80%) brightness(0.7) contrast(1.2)'
        tempCtx.drawImage(img, drawX, drawY, drawW, drawH)

        // Apply circular mask (only shows around cursor)
        tempCtx.globalCompositeOperation = 'destination-in'
        const gradient = tempCtx.createRadialGradient(mx, my, 0, mx, my, 300)
        gradient.addColorStop(0, 'rgba(255,255,255,1)')
        gradient.addColorStop(0.4, 'rgba(255,255,255,0.6)')
        gradient.addColorStop(0.7, 'rgba(255,255,255,0.15)')
        gradient.addColorStop(1, 'rgba(255,255,255,0)')
        tempCtx.fillStyle = gradient
        tempCtx.fillRect(0, 0, w, h)

        // Composite onto main canvas
        ctx.drawImage(tempCanvas, 0, 0)

        // LAYER 3: Stone glow at cursor
        ctx.save()
        ctx.globalAlpha = 0.06
        const glowGrad = ctx.createRadialGradient(mx, my, 0, mx, my, 250)
        glowGrad.addColorStop(0, 'rgba(191,166,142,0.42)')
        glowGrad.addColorStop(0.5, 'rgba(191,166,142,0.12)')
        glowGrad.addColorStop(1, 'rgba(191,166,142,0)')
        ctx.fillStyle = glowGrad
        ctx.fillRect(0, 0, w, h)
        ctx.restore()
      }

      rafId.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(rafId.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}

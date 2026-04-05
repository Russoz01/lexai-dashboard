'use client'

import { useEffect, useRef } from 'react'

export default function JuridicalCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const offscreen = document.createElement('canvas')
    const offCtx    = offscreen.getContext('2d')!
    if (!offCtx) return

    let W = 0, H = 0, dpr = 1
    let mouse   = { x: -1000, y: -1000 }
    let lerped  = { x: -1000, y: -1000 }
    let symPos  = { x: 0, y: 0 }
    let rafId   = 0
    let isMobile = false

    // ── Gold palette ────────────────────────────────────────────
    const G1 = '#c9a84c'   // gold main
    const G2 = '#d4b86a'   // gold light
    const G3 = '#8b7230'   // gold dark
    const G4 = '#e8d09a'   // gold highlight

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      W   = window.innerWidth
      H   = window.innerHeight
      canvas!.width  = W * dpr
      canvas!.height = H * dpr
      canvas!.style.width  = W + 'px'
      canvas!.style.height = H + 'px'
      offscreen.width  = canvas!.width
      offscreen.height = canvas!.height
      ctx!.scale(dpr, dpr)
      offCtx.scale(dpr, dpr)
      isMobile = W < 768
    }
    resize()

    // ── 3D Scales of Justice (gold) ──────────────────────────────
    function drawScales(
      c: CanvasRenderingContext2D,
      cx: number, cy: number,
      s: number,
      alpha: number
    ) {
      c.save()
      c.globalAlpha = alpha

      // Pillar — vertical cylinder gradient
      const pillW   = s * 0.045
      const pillTop = cy - s * 0.38
      const pillBot = cy + s * 0.52
      const pillGrad = c.createLinearGradient(cx - pillW, 0, cx + pillW, 0)
      pillGrad.addColorStop(0,    G3)
      pillGrad.addColorStop(0.2,  G2)
      pillGrad.addColorStop(0.55, G1)
      pillGrad.addColorStop(1,    G3)
      c.fillStyle   = pillGrad
      c.shadowColor = `rgba(201,168,76,0.20)`
      c.shadowBlur  = s * 0.04
      c.beginPath()
      c.roundRect(cx - pillW / 2, pillTop, pillW, pillBot - pillTop, pillW * 0.4)
      c.fill()
      c.shadowBlur = 0

      // Base — trapezoid
      const baseW  = s * 0.38; const baseH = s * 0.055
      const baseGrad = c.createLinearGradient(cx - baseW/2, cy + s*0.51, cx + baseW/2, cy + s*0.51 + baseH)
      baseGrad.addColorStop(0, G2)
      baseGrad.addColorStop(1, G3)
      c.fillStyle = baseGrad
      c.beginPath()
      c.roundRect(cx - baseW/2, cy + s*0.51, baseW, baseH, 5)
      c.fill()

      // Beam — horizontal bar with cylinder shading
      const beamY  = cy - s * 0.36
      const beamW  = s * 1.06
      const beamH  = s * 0.055
      const beamGrad = c.createLinearGradient(cx - beamW/2, beamY - beamH/2, cx + beamW/2, beamY + beamH/2)
      beamGrad.addColorStop(0,   G2)
      beamGrad.addColorStop(0.25, G4)
      beamGrad.addColorStop(0.6,  G1)
      beamGrad.addColorStop(1,   G3)
      c.fillStyle   = beamGrad
      c.shadowColor = `rgba(201,168,76,0.18)`
      c.shadowBlur  = s * 0.03
      c.beginPath()
      c.roundRect(cx - beamW/2, beamY - beamH/2, beamW, beamH, beamH * 0.5)
      c.fill()
      c.shadowBlur = 0

      // Apex cap — radial glow
      const capR    = s * 0.055
      const capGrad = c.createRadialGradient(cx - capR*0.3, pillTop - capR*0.3, 0, cx, pillTop, capR)
      capGrad.addColorStop(0, G4)
      capGrad.addColorStop(1, G3)
      c.fillStyle = capGrad
      c.beginPath()
      c.arc(cx, pillTop - capR * 0.3, capR, 0, Math.PI * 2)
      c.fill()

      // ── Pan helper ──────────────────────────────────────────────
      function drawSide(sideX: number) {
        const chainTopY = beamY
        const panCy     = beamY + s * 0.32
        const panR      = s * 0.175
        const chainW    = s * 0.025

        // Chain V-shape
        const chainGrad = c.createLinearGradient(sideX, chainTopY, sideX, panCy)
        chainGrad.addColorStop(0, G2)
        chainGrad.addColorStop(1, G1)
        c.strokeStyle = chainGrad
        c.lineWidth   = chainW
        c.lineCap     = 'round'
        c.beginPath(); c.moveTo(sideX, chainTopY); c.lineTo(sideX - panR * 0.5, panCy - panR * 0.12); c.stroke()
        c.beginPath(); c.moveTo(sideX, chainTopY); c.lineTo(sideX + panR * 0.5, panCy - panR * 0.12); c.stroke()

        // Pan bowl — semicircle with radial gradient
        c.beginPath()
        c.arc(sideX, panCy, panR, 0, Math.PI)
        const panGrad = c.createRadialGradient(
          sideX + panR * 0.15, panCy - panR * 0.1, 0,
          sideX, panCy, panR
        )
        panGrad.addColorStop(0,   G2)
        panGrad.addColorStop(0.4, G1)
        panGrad.addColorStop(1,   G3)
        c.fillStyle   = panGrad
        c.shadowColor = `rgba(201,168,76,0.25)`
        c.shadowBlur  = s * 0.04
        c.fill()
        c.shadowBlur  = 0

        // Pan rim bar
        const rimGrad = c.createLinearGradient(sideX - panR, panCy, sideX + panR, panCy)
        rimGrad.addColorStop(0,   G3)
        rimGrad.addColorStop(0.5, G4)
        rimGrad.addColorStop(1,   G3)
        c.fillStyle = rimGrad
        c.beginPath()
        c.roundRect(sideX - panR, panCy - chainW/2, panR * 2, chainW, chainW / 2)
        c.fill()
      }

      const armX = s * 0.53
      drawSide(cx - armX)
      drawSide(cx + armX)

      c.restore()
    }

    // ── Animation ───────────────────────────────────────────────
    function animate() {
      rafId = requestAnimationFrame(animate)

      const lp = 0.06
      lerped.x += (mouse.x - lerped.x) * lp
      lerped.y += (mouse.y - lerped.y) * lp

      const sidebarOffset = isMobile ? 0 : 240
      const baseCx = sidebarOffset + (W - sidebarOffset) / 2
      const baseCy = H / 2
      const px     = 0.03
      symPos.x = baseCx - (lerped.x - baseCx) * px
      symPos.y = baseCy - (lerped.y - baseCy) * px

      const size = Math.min(W - sidebarOffset, H) * 0.50

      ctx!.clearRect(0, 0, W, H)

      // Layer 1 — ghost base (very subtle)
      drawScales(ctx!, symPos.x, symPos.y, size, 0.03)

      // Layer 2 — spotlight reveal via offscreen mask
      if (!isMobile || (mouse.x > 0 && mouse.y > 0)) {
        offCtx.clearRect(0, 0, W, H)
        drawScales(offCtx, symPos.x, symPos.y, size, 0.22)

        offCtx.globalCompositeOperation = 'destination-in'
        const r    = isMobile ? 0 : 220
        const grad = offCtx.createRadialGradient(
          lerped.x, lerped.y, 0,
          lerped.x, lerped.y, r
        )
        grad.addColorStop(0,    'rgba(0,0,0,1)')
        grad.addColorStop(0.50, 'rgba(0,0,0,0.85)')
        grad.addColorStop(1,    'rgba(0,0,0,0)')
        offCtx.fillStyle = grad
        offCtx.fillRect(0, 0, W, H)
        offCtx.globalCompositeOperation = 'source-over'

        ctx!.drawImage(offscreen, 0, 0)
      }
    }

    function onMouseMove(e: MouseEvent) { mouse.x = e.clientX; mouse.y = e.clientY }
    function onTouchMove(e: TouchEvent) {
      if (e.touches.length > 0) { mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY }
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('resize',    resize)

    animate()

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('resize',    resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', top: 0, left: 0,
        width: '100vw', height: '100vh',
        zIndex: 0, pointerEvents: 'none',
      }}
    />
  )
}

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

/**
 * Exit-intent modal.
 *
 * Fires once per session when the user's mouse leaves the top of the viewport
 * (classic desktop exit signal). On mobile — where there's no top-escape
 * gesture — it fires after 45s on page + 50% scroll depth as a substitute.
 *
 * The modal pushes the ROI calculator (a lower-commitment lead magnet) instead
 * of the paid plan. Philosophy: capture intent before losing the visitor.
 *
 * Honors prefers-reduced-motion (instant instead of fading), and uses a
 * localStorage flag so we don't annoy returning visitors.
 */

const SEEN_KEY = 'lexai-exit-seen-v1'
const SESSION_KEY = 'lexai-exit-fired-session'

export function ExitIntent() {
  const [open, setOpen] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    // Don't show if user has seen it in last 30 days
    try {
      const seen = localStorage.getItem(SEEN_KEY)
      if (seen) {
        const days = (Date.now() - Number(seen)) / 86_400_000
        if (days < 30) return
      }
      if (sessionStorage.getItem(SESSION_KEY)) return
    } catch {
      // storage unavailable — still fine to fire
    }

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)

    let mobileTimer: ReturnType<typeof setTimeout> | null = null
    let scrollTriggered = false

    const fire = () => {
      try {
        sessionStorage.setItem(SESSION_KEY, '1')
      } catch {}
      setOpen(true)
    }

    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY > 0) return // only when the pointer leaves via the TOP
      if (e.relatedTarget) return
      fire()
    }

    const onScroll = () => {
      if (scrollTriggered) return
      const depth = window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight)
      if (depth > 0.5) {
        scrollTriggered = true
        if (window.innerWidth < 900) {
          mobileTimer = setTimeout(fire, 3000)
        }
      }
    }

    if (window.innerWidth >= 900) {
      document.addEventListener('mouseleave', onMouseLeave)
    } else {
      // mobile fallback: 45s on page
      mobileTimer = setTimeout(fire, 45000)
      window.addEventListener('scroll', onScroll, { passive: true })
    }

    return () => {
      document.removeEventListener('mouseleave', onMouseLeave)
      window.removeEventListener('scroll', onScroll)
      if (mobileTimer) clearTimeout(mobileTimer)
    }
  }, [])

  const dismiss = () => {
    setOpen(false)
    try {
      localStorage.setItem(SEEN_KEY, String(Date.now()))
    } catch {}
  }

  // Escape key
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-title"
      className="exit-backdrop"
      onClick={(e) => e.target === e.currentTarget && dismiss()}
    >
      <div className="exit-modal" data-reduced={reducedMotion}>
        <button
          type="button"
          onClick={dismiss}
          className="exit-close"
          aria-label="Fechar"
        >
          <i className="bi bi-x-lg" aria-hidden />
        </button>

        <div className="exit-serial">Antes de sair</div>
        <h2 id="exit-title" className="exit-title">
          Ja calculou <em>quanto</em> seu escritorio economizaria?
        </h2>
        <p className="exit-body">
          Nossa calculadora gratuita mostra ROI, payback e plano ideal para
          seu numero de advogados. Trinta segundos, sem cadastro.
        </p>
        <div className="exit-actions">
          <Link href="/roi" className="exit-btn-primary" onClick={dismiss}>
            Ver calculo do meu escritorio &rarr;
          </Link>
          <button type="button" onClick={dismiss} className="exit-btn-ghost">
            Nao obrigado
          </button>
        </div>
      </div>

      <style jsx global>{`
        .exit-backdrop {
          position: fixed; inset: 0;
          background: rgba(19, 32, 37, 0.64);
          backdrop-filter: blur(4px);
          z-index: 200;
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          animation: exit-fade .18s ease-out;
        }
        .exit-modal {
          position: relative;
          background: var(--bg-base);
          color: var(--text-primary);
          border: 1px solid var(--stone-line);
          border-radius: 8px;
          padding: 48px 40px 40px;
          max-width: 520px;
          width: 100%;
          box-shadow: 0 40px 120px rgba(0,0,0,0.28);
          animation: exit-rise .22s ease-out;
        }
        .exit-modal[data-reduced="true"] { animation: none; }
        .exit-close {
          position: absolute; top: 14px; right: 14px;
          width: 36px; height: 36px;
          border: none; background: transparent;
          cursor: pointer; color: var(--text-muted);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
          transition: background .16s ease, color .16s ease;
        }
        .exit-close:hover { background: var(--hover); color: var(--text-primary); }
        .exit-serial {
          font-size: 11px; letter-spacing: 0.24em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 16px;
        }
        .exit-title {
          font-family: var(--font-playfair), serif;
          font-weight: 700;
          font-size: clamp(28px, 3.4vw, 36px);
          line-height: 1.15; letter-spacing: -0.01em;
          margin: 0 0 14px;
        }
        .exit-title em { font-style: italic; color: var(--accent); }
        .exit-body {
          font-size: 15px; line-height: 1.55;
          color: var(--text-secondary);
          margin: 0 0 28px;
        }
        .exit-actions {
          display: flex; flex-direction: column; gap: 12px;
        }
        .exit-btn-primary {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          padding: 14px 24px;
          background: var(--primary); color: var(--bg-base);
          text-decoration: none;
          font-size: 14px; font-weight: 600; letter-spacing: 0.04em;
          border-radius: 2px;
          transition: transform .16s ease;
        }
        .exit-btn-primary:hover { transform: translateY(-1px); }
        .exit-btn-ghost {
          padding: 12px 20px;
          background: transparent;
          color: var(--text-muted);
          border: none; cursor: pointer;
          font-family: inherit; font-size: 13px;
          letter-spacing: 0.04em;
          transition: color .16s ease;
        }
        .exit-btn-ghost:hover { color: var(--text-primary); }

        @keyframes exit-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes exit-rise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

        @media (prefers-reduced-motion: reduce) {
          .exit-backdrop, .exit-modal { animation: none; }
        }
      `}</style>
    </div>
  )
}

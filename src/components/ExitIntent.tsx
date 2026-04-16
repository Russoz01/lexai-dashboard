'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import s from './ExitIntent.module.css'

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
      className={s.exitBackdrop}
      onClick={(e) => e.target === e.currentTarget && dismiss()}
    >
      <div className={reducedMotion ? s.exitModalReduced : s.exitModal}>
        <button
          type="button"
          onClick={dismiss}
          className={s.exitClose}
          aria-label="Fechar"
        >
          <i className="bi bi-x-lg" aria-hidden />
        </button>

        <div className={s.exitSerial}>Antes de sair</div>
        <h2 id="exit-title" className={s.exitTitle}>
          Ja calculou <em className={s.exitTitleEm}>quanto</em> seu escritorio economizaria?
        </h2>
        <p className={s.exitBody}>
          Nossa calculadora gratuita mostra ROI, payback e plano ideal para
          seu numero de advogados. Trinta segundos, sem cadastro.
        </p>
        <div className={s.exitActions}>
          <Link href="/roi" className={s.exitBtnPrimary} onClick={dismiss}>
            Ver calculo do meu escritorio &rarr;
          </Link>
          <button type="button" onClick={dismiss} className={s.exitBtnGhost}>
            Nao obrigado
          </button>
        </div>
      </div>
    </div>
  )
}

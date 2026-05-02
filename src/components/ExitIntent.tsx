'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'

/* ═════════════════════════════════════════════════════════════
 * ExitIntent — modal "Antes de sair" (migrado para Tailwind em 2026-04-17)
 * ─────────────────────────────────────────────────────────────
 * Dispara 1x por sessão quando o cursor sai pelo topo (desktop)
 * ou 45s + 50% scroll (mobile). Oferece ROI calc como iscariato
 * de menor compromisso que o plano pago.
 *
 * Respeita prefers-reduced-motion e usa localStorage pra não
 * aparecer de novo por 30 dias.
 * ═════════════════════════════════════════════════════════════ */

const SEEN_KEY = 'pralvex-exit-seen-v1'
const SESSION_KEY = 'pralvex-exit-fired-session'

export function ExitIntent() {
  const [open, setOpen] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
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
      if (e.clientY > 0) return
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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && dismiss()}
    >
      <div
        className={`relative w-full max-w-md rounded-2xl border border-white/10 bg-neutral-950 p-8 text-white shadow-[0_30px_100px_-20px_rgba(0,0,0,0.8)] ${
          reducedMotion ? '' : 'animate-in fade-in zoom-in-95 duration-300'
        }`}
      >
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
          aria-label="Fechar"
        >
          <X size={18} aria-hidden />
        </button>

        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-[#bfa68e]">
          <span className="size-1.5 rounded-full bg-[#bfa68e]" />
          Antes de sair
        </div>

        <h2 id="exit-title" className="mb-3 text-balance text-2xl font-medium leading-tight">
          Já calculou{' '}
          <span className="italic text-[#bfa68e]">quanto</span>{' '}
          seu escritório economizaria?
        </h2>

        <p className="mb-6 text-sm leading-relaxed text-white/60">
          Nossa calculadora gratuita mostra ROI, payback e plano ideal para seu
          número de advogados. Trinta segundos, sem cadastro.
        </p>

        <div className="space-y-2">
          <Link
            href="/roi"
            onClick={dismiss}
            className="flex w-full items-center justify-center rounded-lg bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-white/90"
          >
            Ver cálculo do meu escritório &rarr;
          </Link>
          <button
            type="button"
            onClick={dismiss}
            className="w-full rounded-lg px-4 py-2.5 text-xs text-white/50 transition hover:bg-white/5 hover:text-white/80"
          >
            Não obrigado
          </button>
        </div>
      </div>
    </div>
  )
}

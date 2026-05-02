'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { AlertTriangle, Check, X } from 'lucide-react'

/* ════════════════════════════════════════════════════════════════════
 * ConfirmDialog (v10 editorial · 2026-04-22)
 * ────────────────────────────────────────────────────────────────────
 * Modal confirm() customizado. Substitui o dialog nativo do browser
 * por algo que vive dentro da linguagem do atelier: noir, hairline,
 * champagne, Playfair italic e serial number.
 *
 * API imperativa (promise-based) pra ser simples de adotar:
 *
 *   import { confirmDialog } from '@/components/ConfirmDialog'
 *
 *   const ok = await confirmDialog({
 *     title: 'Excluir prazo',
 *     description: 'Essa ação não pode ser desfeita.',
 *     confirmLabel: 'Excluir',
 *     variant: 'danger',
 *   })
 *   if (!ok) return
 *
 * Requer <ConfirmDialogContainer /> montado uma única vez na raiz
 * (já está em src/app/dashboard/layout.tsx junto com o ToastContainer).
 * ═══════════════════════════════════════════════════════════════════ */

type Variant = 'danger' | 'primary'

interface ConfirmOptions {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: Variant
}

interface InternalDialog extends ConfirmOptions {
  id: number
  resolve: (ok: boolean) => void
}

let pushDialog: ((opts: ConfirmOptions) => Promise<boolean>) | null = null

export function confirmDialog(opts: ConfirmOptions): Promise<boolean> {
  if (pushDialog) return pushDialog(opts)
  // Fallback defensivo se o container não tiver montado
  if (typeof window !== 'undefined') {
    return Promise.resolve(window.confirm(opts.title))
  }
  return Promise.resolve(false)
}

export function ConfirmDialogContainer() {
  const [dialog, setDialog] = useState<InternalDialog | null>(null)
  const confirmBtnRef = useRef<HTMLButtonElement | null>(null)
  const cancelBtnRef = useRef<HTMLButtonElement | null>(null)

  const open = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setDialog({
        id: Date.now() + Math.random(),
        resolve,
        variant: opts.variant ?? 'primary',
        ...opts,
      })
    })
  }, [])

  useEffect(() => {
    pushDialog = open
    return () => { pushDialog = null }
  }, [open])

  // Foca o botão de cancelar por padrão (safer default: evita Enter acidental = destruir)
  useEffect(() => {
    if (!dialog) return
    const t = setTimeout(() => {
      if (dialog.variant === 'danger') {
        cancelBtnRef.current?.focus()
      } else {
        confirmBtnRef.current?.focus()
      }
    }, 50)
    return () => clearTimeout(t)
  }, [dialog])

  const close = useCallback((ok: boolean) => {
    if (!dialog) return
    dialog.resolve(ok)
    setDialog(null)
  }, [dialog])

  // ESC fecha, Enter confirma
  useEffect(() => {
    if (!dialog) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { e.preventDefault(); close(false) }
      if (e.key === 'Enter' && document.activeElement !== cancelBtnRef.current) {
        // só confirma via Enter se foco estiver no confirm
        if (document.activeElement === confirmBtnRef.current) {
          e.preventDefault(); close(true)
        }
      }
    }
    document.addEventListener('keydown', onKey)
    // trava scroll enquanto modal aberto
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [dialog, close])

  if (!dialog) return null

  const isDanger = dialog.variant === 'danger'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby={dialog.description ? 'confirm-desc' : undefined}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'grid',
        placeItems: 'center',
        padding: 20,
        animation: 'cdFade 0.18s ease-out',
      }}
    >
      {/* backdrop */}
      <div
        onClick={() => close(false)}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(6,6,6,0.72)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
        aria-hidden="true"
      />

      {/* card */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 460,
          borderRadius: 18,
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'linear-gradient(180deg, #0e0c0a 0%, #08070a 100%)',
          boxShadow:
            '0 30px 80px -20px rgba(0,0,0,0.65), 0 0 0 1px rgba(191,166,142,0.06) inset',
          overflow: 'hidden',
          animation: 'cdRise 0.32s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {/* champagne hairline no topo */}
        <span
          aria-hidden
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background: isDanger
              ? 'linear-gradient(90deg, transparent, rgba(239,68,68,0.5), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(191,166,142,0.55), transparent)',
          }}
        />

        <div style={{ padding: '28px 28px 24px 28px' }}>
          {/* serial + icon */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 18,
            }}
          >
            <div
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.22em',
                color: 'rgba(255,255,255,0.42)',
              }}
            >
              {isDanger ? 'Nº 001 · CONFIRMAÇÃO · MMXXVI' : 'Nº 001 · DECISÃO · MMXXVI'}
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 30,
                height: 30,
                borderRadius: 999,
                border: isDanger
                  ? '1px solid rgba(239,68,68,0.35)'
                  : '1px solid rgba(191,166,142,0.35)',
                background: isDanger
                  ? 'rgba(239,68,68,0.08)'
                  : 'rgba(191,166,142,0.08)',
                color: isDanger ? '#f87171' : '#e6d4bd',
              }}
            >
              <AlertTriangle size={14} strokeWidth={2} aria-hidden />
            </div>
          </div>

          {/* título em serif italic */}
          <h2
            id="confirm-title"
            style={{
              fontFamily:
                "'Playfair Display', ui-serif, Georgia, Cambria, 'Times New Roman', serif",
              fontWeight: 500,
              fontSize: 26,
              lineHeight: 1.15,
              letterSpacing: '-0.01em',
              color: '#f4efe8',
              margin: 0,
            }}
          >
            {dialog.title.split(' ').map((word, i, arr) => {
              // último termo em italic champagne — toque editorial
              if (i === arr.length - 1 && arr.length > 1) {
                return (
                  <em
                    key={i}
                    style={{
                      fontStyle: 'italic',
                      color: isDanger ? '#fca5a5' : '#e6d4bd',
                    }}
                  >
                    {word}
                  </em>
                )
              }
              return <span key={i}>{word}{i < arr.length - 1 ? ' ' : ''}</span>
            })}
          </h2>

          {dialog.description && (
            <p
              id="confirm-desc"
              style={{
                marginTop: 12,
                fontSize: 14,
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.62)',
              }}
            >
              {dialog.description}
            </p>
          )}

          {/* actions */}
          <div
            style={{
              marginTop: 26,
              display: 'flex',
              gap: 10,
              justifyContent: 'flex-end',
            }}
          >
            <button
              ref={cancelBtnRef}
              type="button"
              onClick={() => close(false)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                height: 40,
                padding: '0 16px',
                borderRadius: 999,
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.02)',
                color: 'rgba(255,255,255,0.75)',
                fontSize: 13,
                fontWeight: 500,
                letterSpacing: '-0.005em',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)'
                e.currentTarget.style.color = '#fff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
                e.currentTarget.style.color = 'rgba(255,255,255,0.75)'
              }}
            >
              <X size={14} strokeWidth={2} aria-hidden />
              {dialog.cancelLabel || 'Cancelar'}
            </button>

            <button
              ref={confirmBtnRef}
              type="button"
              onClick={() => close(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                height: 40,
                padding: '0 18px',
                borderRadius: 999,
                border: 'none',
                background: isDanger
                  ? 'linear-gradient(180deg, #ef4444, #b91c1c)'
                  : 'linear-gradient(135deg, #f5e8d3, #bfa68e 55%, #8a6f55)',
                color: isDanger ? '#fff' : '#1a1208',
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: '-0.005em',
                cursor: 'pointer',
                boxShadow: isDanger
                  ? '0 8px 22px -8px rgba(239,68,68,0.55)'
                  : '0 8px 22px -8px rgba(191,166,142,0.55)',
                transition: 'filter 0.18s ease, transform 0.18s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = 'brightness(1.08)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = 'brightness(1)'
              }}
            >
              <Check size={14} strokeWidth={2.25} aria-hidden />
              {dialog.confirmLabel || 'Confirmar'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes cdFade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes cdRise {
          from { opacity: 0; transform: translateY(14px) scale(0.97) }
          to   { opacity: 1; transform: translateY(0) scale(1) }
        }
      `}</style>
    </div>
  )
}

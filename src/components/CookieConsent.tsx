'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShieldCheck, X } from 'lucide-react'

// P1 audit fix (2026-05-02): localStorage em vez de sessionStorage —
// LGPD exige consent persistente + revogável. Antes, banner reaparecia
// a cada nova aba/sessão. Agora persiste 6 meses (TTL via timestamp).
const STORAGE_KEY = 'pralvex-cookie-consent'
const STORAGE_TS_KEY = 'pralvex-cookie-consent-ts'
const TTL_MS = 1000 * 60 * 60 * 24 * 180 // 6 meses
const CONSENT_EVENT = 'pralvex-consent-change'

export type ConsentValue = 'all' | 'necessary'

function isConsentFresh(): boolean {
  try {
    const ts = Number(localStorage.getItem(STORAGE_TS_KEY))
    return Number.isFinite(ts) && ts > 0 && (Date.now() - ts) < TTL_MS
  } catch {
    return false
  }
}

function persistConsent(value: ConsentValue) {
  try {
    localStorage.setItem(STORAGE_KEY, value)
    localStorage.setItem(STORAGE_TS_KEY, String(Date.now()))
  } catch { /* noop */ }
  // Emit CustomEvent pra Clarity/Sentry/etc. ouvirem (event-driven, não polling).
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: { value } }))
  }
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored && isConsentFresh()) return
      const t = window.setTimeout(() => setVisible(true), 400)
      return () => window.clearTimeout(t)
    } catch {
      // localStorage unavailable (private mode, blocked) — show banner
      setVisible(true)
    }
  }, [])

  const handleAcceptAll = () => {
    persistConsent('all')
    setVisible(false)
  }

  const handleNecessaryOnly = () => {
    persistConsent('necessary')
    setVisible(false)
  }

  const handleDismiss = () => {
    // Dismiss = trata como "necessary only" pra cumprir LGPD opt-in
    persistConsent('necessary')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <>
      <div
        role="dialog"
        aria-live="polite"
        aria-label="Aviso de cookies"
        className="pralvex-cookie-consent"
        style={{
          position: 'fixed',
          left: '50%',
          bottom: 20,
          transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)',
          maxWidth: 720,
          zIndex: 9999,
          padding: '18px 22px',
          borderRadius: 16,
          // Audit fix P0-6 (2026-05-02): tokens em vez de hex hardcoded.
          // Adapta light/dark via CSS variables.
          background: 'var(--glass)',
          backdropFilter: 'blur(16px) saturate(160%)',
          WebkitBackdropFilter: 'blur(16px) saturate(160%)',
          border: '1px solid var(--glass-border)',
          boxShadow: 'var(--glass-shadow)',
          color: 'var(--text-primary)',
          fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flexShrink: 0 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'var(--accent-light)',
              border: '1px solid var(--stone-line)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldCheck size={18} strokeWidth={1.75} style={{ color: 'var(--stone)' }} aria-hidden />
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, letterSpacing: '-0.2px' }}>
            Cookies e privacidade
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            Usamos cookies para autenticação (necessários) e analytics (opcional). Você pode revogar o consentimento a qualquer momento em{' '}
            <Link href="/privacidade" style={{ color: 'var(--stone)', textDecoration: 'underline' }}>
              /privacidade
            </Link>
            . LGPD compliant.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Fechar banner de cookies"
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: 6,
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={14} strokeWidth={2} aria-hidden />
        </button>

        <div
          className="pralvex-cookie-buttons"
          style={{
            display: 'flex',
            gap: 8,
            flexShrink: 0,
            alignItems: 'center',
          }}
        >
          <button
            type="button"
            onClick={handleNecessaryOnly}
            style={{
              fontSize: 13,
              fontWeight: 600,
              padding: '9px 16px',
              borderRadius: 10,
              background: 'transparent',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontFamily: 'inherit',
            }}
          >
            Apenas necessários
          </button>
          <button
            type="button"
            onClick={handleAcceptAll}
            style={{
              fontSize: 13,
              fontWeight: 600,
              padding: '9px 18px',
              borderRadius: 10,
              background: 'var(--stone)',
              color: '#132025',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 14px var(--glow)',
              whiteSpace: 'nowrap',
              fontFamily: 'inherit',
            }}
          >
            Aceitar todos
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .pralvex-cookie-consent {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 14px !important;
            bottom: 12px !important;
          }
          .pralvex-cookie-buttons {
            width: 100%;
            justify-content: stretch !important;
          }
          .pralvex-cookie-buttons button {
            flex: 1;
          }
        }
      `}</style>
    </>
  )
}

export default CookieConsent

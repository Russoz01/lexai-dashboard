'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const STORAGE_KEY = 'lexai-cookie-consent'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY)
      if (!stored) {
        const t = window.setTimeout(() => setVisible(true), 400)
        return () => window.clearTimeout(t)
      }
    } catch {
      // sessionStorage may be unavailable (private mode, blocked cookies) — still show banner
      setVisible(true)
    }
  }, [])

  const handleAcceptAll = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, 'all')
    } catch { /* noop */ }
    setVisible(false)
  }

  const handleNecessaryOnly = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, 'necessary')
    } catch { /* noop */ }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <>
      <div
        role="dialog"
        aria-live="polite"
        aria-label="Aviso de cookies"
        className="lexai-cookie-consent"
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
          background: 'rgba(15, 15, 18, 0.82)',
          backdropFilter: 'blur(16px) saturate(160%)',
          WebkitBackdropFilter: 'blur(16px) saturate(160%)',
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow: '0 16px 48px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.03) inset',
          color: '#F1F1F1',
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
              background: 'rgba(191,166,142,0.12)',
              border: '1px solid rgba(191,166,142,0.28)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <i className="bi bi-shield-lock" style={{ color: '#bfa68e', fontSize: 18 }} />
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: '#fff', marginBottom: 4, letterSpacing: '-0.2px' }}>
            Cookies e privacidade
          </div>
          <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.62)', lineHeight: 1.5, margin: 0 }}>
            Usamos cookies para autenticacao (necessarios) e analytics (opcional). Voce pode revogar o consentimento a qualquer momento em{' '}
            <Link href="/privacidade" style={{ color: '#bfa68e', textDecoration: 'underline' }}>
              /privacidade
            </Link>
            . LGPD compliant.
          </p>
        </div>

        <div
          className="lexai-cookie-buttons"
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
              color: 'rgba(255,255,255,0.75)',
              border: '1px solid rgba(255,255,255,0.16)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontFamily: 'inherit',
            }}
          >
            Apenas necessarios
          </button>
          <button
            type="button"
            onClick={handleAcceptAll}
            style={{
              fontSize: 13,
              fontWeight: 600,
              padding: '9px 18px',
              borderRadius: 10,
              background: '#bfa68e',
              color: '#132025',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(191,166,142,0.35)',
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
          .lexai-cookie-consent {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 14px !important;
            bottom: 12px !important;
          }
          .lexai-cookie-buttons {
            width: 100%;
            justify-content: stretch !important;
          }
          .lexai-cookie-buttons button {
            flex: 1;
          }
        }
      `}</style>
    </>
  )
}

export default CookieConsent

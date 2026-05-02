'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'
import * as Sentry from '@sentry/nextjs'

/**
 * Dashboard error boundary — preserva sidebar/layout do dashboard quando uma
 * página específica quebra. Mostra erro localizado + botão de retry sem
 * perder navegação. Sentry captura a exceção pra investigação posterior.
 *
 * Diferente do app/error.tsx (raiz, full-page), este só substitui a área
 * de conteúdo do dashboard. Sidebar continua funcional — user pode navegar
 * pra outro agente sem reload.
 *
 * Wave C5 (2026-05-02) — pre-demo resilience.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('[DashboardError]', error.message, { digest: error.digest })
    Sentry.captureException(error, {
      tags: { source: 'dashboard-error-boundary' },
      extra: {
        digest: error.digest,
        // P2 audit fix: extra context pra triagem (route, UA, viewport)
        pathname: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 200) : 'unknown',
        viewport: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'unknown',
      },
    })
  }, [error])

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '60px 24px', minHeight: '60vh',
      fontFamily: 'var(--font-dm-sans), system-ui, sans-serif',
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%',
        background: 'var(--danger-light, rgba(220,38,38,0.08))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 24,
      }}>
        <AlertTriangle size={22} strokeWidth={1.75} style={{ color: 'var(--danger, #b91c1c)' }} aria-hidden />
      </div>

      <h2 style={{
        fontFamily: 'var(--font-playfair), serif', fontStyle: 'italic',
        fontSize: 28, fontWeight: 600, margin: 0, color: 'var(--text-primary)',
        textAlign: 'center',
      }}>
        Algo deu errado nesta página
      </h2>

      <p style={{
        fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)',
        textAlign: 'center', maxWidth: 480, marginTop: 12,
      }}>
        Registramos a falha. Você pode tentar novamente ou navegar pra outro agente
        usando o menu lateral.
      </p>

      {error.digest ? (
        <code style={{
          marginTop: 20, padding: '6px 12px',
          border: '1px solid var(--border)', borderRadius: 4,
          fontSize: 11, letterSpacing: '0.06em', color: 'var(--text-muted)',
          fontFamily: 'ui-monospace, monospace',
        }}>
          ref: {error.digest}
        </code>
      ) : null}

      <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={() => reset()}
          className="btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <RotateCcw size={14} strokeWidth={1.75} aria-hidden /> Tentar novamente
        </button>
        <Link
          href="/dashboard"
          className="btn-ghost"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <Home size={14} strokeWidth={1.75} aria-hidden /> Voltar pro dashboard
        </Link>
      </div>
    </div>
  )
}

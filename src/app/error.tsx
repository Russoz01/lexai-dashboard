'use client'

import { useEffect } from 'react'
import Link from 'next/link'

/**
 * Global error boundary — shown when a server or client component throws.
 * Editorial look matches landing page: serif headline, stone hairlines,
 * serial labels. Surface the digest id so users can quote it in support.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Console breadcrumb — Sentry will auto-capture when wired up
    // eslint-disable-next-line no-console
    console.error('[GlobalError]', error.message, { digest: error.digest })
  }, [error])

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        background: 'var(--bg-base)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-dm-sans), system-ui, sans-serif',
      }}
    >
      <span
        style={{
          fontSize: 11,
          letterSpacing: '0.24em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          marginBottom: 24,
        }}
      >
        Erro · MMXXVI · Nº 500
      </span>

      <h1
        style={{
          fontFamily: 'var(--font-playfair), serif',
          fontStyle: 'italic',
          fontWeight: 700,
          fontSize: 'clamp(40px, 6vw, 68px)',
          lineHeight: 1.05,
          letterSpacing: '-0.01em',
          textAlign: 'center',
          margin: 0,
          maxWidth: 720,
        }}
      >
        Algo saiu do script.
      </h1>

      <div
        style={{
          width: 48,
          height: 1,
          background: 'var(--stone-line)',
          margin: '32px 0',
        }}
        aria-hidden
      />

      <p
        style={{
          fontSize: 17,
          lineHeight: 1.6,
          color: 'var(--text-secondary)',
          textAlign: 'center',
          maxWidth: 520,
          margin: 0,
        }}
      >
        Registramos a falha e nossa equipe foi notificada. Voce pode tentar
        recarregar a pagina ou voltar para o inicio.
      </p>

      {error.digest ? (
        <code
          style={{
            marginTop: 32,
            padding: '8px 14px',
            border: '1px solid var(--stone-line)',
            borderRadius: 4,
            fontSize: 12,
            letterSpacing: '0.08em',
            color: 'var(--text-muted)',
            fontFamily: 'ui-monospace, monospace',
          }}
        >
          ref: {error.digest}
        </code>
      ) : null}

      <div style={{ display: 'flex', gap: 16, marginTop: 40, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={() => reset()}
          style={{
            padding: '14px 28px',
            background: 'var(--primary)',
            color: 'var(--bg-base)',
            border: 'none',
            borderRadius: 2,
            fontSize: 14,
            letterSpacing: '0.04em',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Tentar novamente
        </button>
        <Link
          href="/"
          style={{
            padding: '14px 28px',
            border: '1px solid var(--stone-line)',
            color: 'var(--text-primary)',
            borderRadius: 2,
            fontSize: 14,
            letterSpacing: '0.04em',
            textDecoration: 'none',
            fontFamily: 'inherit',
          }}
        >
          Voltar para o inicio
        </Link>
      </div>
    </div>
  )
}

import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pagina nao encontrada · Pralvex',
  robots: { index: false, follow: false },
}

export default function NotFound() {
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
        Erro · MMXXVI · Nº 404
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
        Esta pagina nao consta no sumario.
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
        O endereco que voce tentou acessar nao existe ou foi movido. Volte ao
        inicio ou abra o dashboard.
      </p>

      <div style={{ display: 'flex', gap: 16, marginTop: 40, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          href="/"
          style={{
            padding: '14px 28px',
            background: 'var(--primary)',
            color: 'var(--bg-base)',
            borderRadius: 2,
            fontSize: 14,
            letterSpacing: '0.04em',
            textDecoration: 'none',
          }}
        >
          Ir para o inicio
        </Link>
        <Link
          href="/dashboard"
          style={{
            padding: '14px 28px',
            border: '1px solid var(--stone-line)',
            color: 'var(--text-primary)',
            borderRadius: 2,
            fontSize: 14,
            letterSpacing: '0.04em',
            textDecoration: 'none',
          }}
        >
          Abrir dashboard
        </Link>
      </div>
    </div>
  )
}

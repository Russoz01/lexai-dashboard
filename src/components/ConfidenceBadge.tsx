'use client'

interface ConfidenceBadgeProps {
  confianca?: { nivel?: string; nota?: string } | null
  compact?: boolean
}

const LABELS: Record<string, string> = {
  alta: 'Confianca alta',
  media: 'Confianca media',
  baixa: 'Confianca baixa',
}

export default function ConfidenceBadge({ confianca, compact = false }: ConfidenceBadgeProps) {
  const nivel = (confianca?.nivel || 'alta').toLowerCase()
  const safe = ['alta', 'media', 'baixa'].includes(nivel) ? nivel : 'alta'
  const label = LABELS[safe]

  return (
    <span
      className={`confidence-badge ${safe}`}
      title={confianca?.nota || 'Resposta verificada pela LexAI'}
      style={{ cursor: 'help' }}
    >
      <span className={`dot ${safe}`} />
      {compact ? safe.toUpperCase() : label}
    </span>
  )
}

export function VerifiedBadge() {
  return (
    <span className="verified-badge">
      <i className="bi bi-patch-check-fill" />
      Verificado
    </span>
  )
}

export function PoweredByLexAI() {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      fontSize: 10, fontWeight: 600, color: 'var(--text-muted)',
      letterSpacing: 0.3, textTransform: 'uppercase',
      padding: '5px 12px', borderRadius: 12,
      background: 'var(--hover)', border: '1px solid var(--border)',
    }}>
      <i className="bi bi-lightning-charge-fill" style={{ color: 'var(--accent)', fontSize: 11 }} />
      LexAI
      <span style={{
        display: 'inline-block', width: 1, height: 10,
        background: 'var(--border)', margin: '0 1px',
      }} />
      <span style={{ color: 'var(--text-secondary)' }}>by Zyntra</span>
    </span>
  )
}

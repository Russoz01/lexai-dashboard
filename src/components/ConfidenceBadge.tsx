'use client'

import { BadgeCheck, Zap } from 'lucide-react'

interface ConfidenceBadgeProps {
  confianca?: { nivel?: string; nota?: string } | null
  compact?: boolean
}

const LABELS: Record<string, string> = {
  alta: 'Confiança alta',
  media: 'Confiança média',
  baixa: 'Confiança baixa',
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
      <BadgeCheck size={12} strokeWidth={2} aria-hidden />
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
      <Zap size={11} strokeWidth={2} style={{ color: 'var(--accent)' }} aria-hidden />
      LexAI
      <span style={{
        display: 'inline-block', width: 1, height: 10,
        background: 'var(--border)', margin: '0 1px',
      }} />
      <span style={{ color: 'var(--text-secondary)' }}>by Vanix Corp</span>
    </span>
  )
}

'use client'

/* ════════════════════════════════════════════════════════════════════
 * QuotaExceededState · v1.0 (2026-05-03 · audit business P1-1)
 * ────────────────────────────────────────────────────────────────────
 * Componente reusavel pra cobrir os 3 estados de quota:
 *
 *   - 'soft'     (>= 75% usado): toast persistente nao-bloqueante.
 *                  "Voce ja usou 75% do limite — restam X analises."
 *   - 'urgent'   (>= 85% usado): modal/banner amber, ainda permite uso.
 *                  "Apenas X restantes esse mes — considere upgrade."
 *   - 'exceeded' (>=100% usado): deadend vermelho com CTAs.
 *                  Bloqueia interacao + redirect pro upgrade.
 *
 * Uso (a partir do response 429 do agente):
 *   <QuotaExceededState
 *     used={300}
 *     limit={300}
 *     plan="escritorio"
 *     warning="exceeded"
 *     onClose={() => setVisible(false)}
 *   />
 *
 * ───────────────────────────────────────────────────────────────────── */

import Link from 'next/link'
import { ArrowUpCircle, FileBarChart, X } from 'lucide-react'

export type QuotaWarning = 'soft' | 'urgent' | 'exceeded'

export interface QuotaExceededStateProps {
  /** Quantos foram usados ate agora */
  used: number
  /** Limite total do plano */
  limit: number
  /** Slug do plano (escritorio, firma, etc) — usado pra linkar upgrade certo */
  plan: string
  /** Nivel do aviso */
  warning: QuotaWarning
  /** Plano sugerido pra upgrade (default: 'firma') */
  upgradeTo?: 'firma' | 'pro' | 'enterprise'
  /** Callback de fechar — soft/urgent permitem dismiss; exceeded e deadend */
  onClose?: () => void
}

const COLORS: Record<QuotaWarning, { bg: string; border: string; text: string; bar: string }> = {
  soft:     { bg: 'rgba(212,174,106,0.12)', border: 'rgba(212,174,106,0.45)', text: 'var(--accent)', bar: 'var(--accent)' },
  urgent:   { bg: 'rgba(245,158,11,0.10)',   border: 'rgba(245,158,11,0.55)', text: '#f59e0b',       bar: '#f59e0b' },
  exceeded: { bg: 'rgba(239,68,68,0.10)',    border: 'rgba(239,68,68,0.55)',  text: '#ef4444',       bar: '#ef4444' },
}

const HEADLINES: Record<QuotaWarning, string> = {
  soft:     'Cota chegando perto do limite',
  urgent:   'Pouco resta esse mes',
  exceeded: 'Limite mensal atingido',
}

const SUBHEADS: Record<QuotaWarning, (used: number, limit: number, plan: string) => string> = {
  soft:     (u, l) => `Voce ja usou ${u} de ${l} analises do mes. Considere upgrade pra evitar interrupcao.`,
  urgent:   (u, l) => `Apenas ${Math.max(0, l - u)} analises restantes. Upgrade evita travar amanha de manha.`,
  exceeded: (u, l, p) => `Voce usou ${u}/${l} no plano ${p}. Faz upgrade pra continuar agora — sem perder o que ja produziu.`,
}

export function QuotaExceededState({
  used, limit, plan, warning,
  upgradeTo = 'pro',
  onClose,
}: QuotaExceededStateProps) {
  const c = COLORS[warning]
  const ratio = limit > 0 ? Math.min(1, used / limit) : 1
  const pct = Math.round(ratio * 100)
  const headline = HEADLINES[warning]
  const subhead = SUBHEADS[warning](used, limit, plan)

  // exceeded = deadend (sem dismiss). soft/urgent = dismiss permitido.
  const showDismiss = warning !== 'exceeded' && !!onClose

  // Plano de destino do upgrade — pega target que faz sentido com plano atual
  const targetPlan: 'firma' | 'pro' | 'enterprise' =
    plan === 'firma' || plan === 'pro' ? 'enterprise'
    : plan === 'enterprise' ? 'enterprise'
    : upgradeTo

  const targetLabel: Record<typeof targetPlan, string> = {
    pro: 'Firma',
    firma: 'Firma',
    enterprise: 'Enterprise',
  }

  return (
    <div
      role={warning === 'exceeded' ? 'alert' : 'status'}
      aria-live={warning === 'exceeded' ? 'assertive' : 'polite'}
      style={{
        position: 'relative',
        padding: '18px 20px',
        borderRadius: 12,
        border: `1px solid ${c.border}`,
        background: c.bg,
        color: 'var(--text-primary)',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}
    >
      {showDismiss && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar aviso"
          style={{
            position: 'absolute', top: 8, right: 8,
            background: 'transparent', border: 'none', cursor: 'pointer',
            padding: 6, color: 'var(--text-muted)', borderRadius: 6,
          }}
        >
          <X size={14} strokeWidth={2} aria-hidden />
        </button>
      )}

      <div>
        <div style={{
          fontFamily: 'var(--font-mono, ui-monospace), monospace',
          fontSize: 10, fontWeight: 700, letterSpacing: '0.2em',
          textTransform: 'uppercase', color: c.text, marginBottom: 6,
        }}>
          {warning === 'exceeded' ? 'Limite atingido' : warning === 'urgent' ? 'Atencao' : 'Aviso'}
        </div>
        <div style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 18, fontStyle: 'italic', fontWeight: 500,
          color: 'var(--text-primary)', lineHeight: 1.25, letterSpacing: '-0.01em',
        }}>
          {headline}
        </div>
        <p style={{
          fontSize: 13, color: 'var(--text-secondary)',
          margin: '6px 0 0', lineHeight: 1.5,
        }}>
          {subhead}
        </p>
      </div>

      {/* Progress bar */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div
          aria-label={`Uso da cota: ${pct}%`}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          style={{
            width: '100%', height: 6, borderRadius: 999,
            background: 'rgba(255,255,255,0.06)', overflow: 'hidden',
          }}
        >
          <div style={{
            width: `${pct}%`, height: '100%', background: c.bar, transition: 'width 0.3s ease',
          }} />
        </div>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontFamily: 'var(--font-mono, ui-monospace), monospace',
          fontSize: 10, letterSpacing: '0.1em', color: 'var(--text-muted)',
        }}>
          <span>{used} / {limit}</span>
          <span>{pct}%</span>
        </div>
      </div>

      {/* CTAs */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Link
          href={`/dashboard/planos?upgrade=${targetPlan}`}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 16px', borderRadius: 10,
            background: 'linear-gradient(135deg, #f5e8d3, #bfa68e, #7a5f48)',
            color: '#0a0a0a',
            fontFamily: 'var(--font-mono, ui-monospace), monospace',
            fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          <ArrowUpCircle size={13} strokeWidth={2} aria-hidden />
          Fazer upgrade pra {targetLabel[targetPlan]}
        </Link>
        <Link
          href="/dashboard/planos"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 16px', borderRadius: 10,
            background: 'transparent', color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            fontFamily: 'var(--font-mono, ui-monospace), monospace',
            fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          <FileBarChart size={13} strokeWidth={2} aria-hidden />
          Ver detalhes do plano
        </Link>
      </div>
    </div>
  )
}

export default QuotaExceededState

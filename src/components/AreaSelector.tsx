'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { LEGAL_AREAS, type LegalAreaSlug } from '@/lib/agents/taxonomy'

/* ═════════════════════════════════════════════════════════════
 * AreaSelector — v10.11 Atelier edition
 * ─────────────────────────────────────────────────────────────
 * Deixa o advogado eleger sua area principal de atuacao. Cada
 * agente LexAI usa esse sinal pra calibrar exemplos, jurisprudencia
 * referente e tom da resposta.
 *
 * v10.11: alinhado ao padrao editorial do /dashboard — Playfair
 * italic nos nomes, N° serial romano, stone hairlines, spotlight
 * gold decorativo, feedback messages em mono letterspaced.
 *
 * Logica preservada:
 *  - Hidrata via GET /api/user/area-juridica
 *  - PATCH /api/user/area-juridica com optimistic + rollback
 *  - Estados: idle / saving / saved / error
 * ═════════════════════════════════════════════════════════════ */

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

export function AreaSelector() {
  const [selected, setSelected] = useState<LegalAreaSlug | null>(null)
  const [hydrating, setHydrating] = useState(true)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [errMsg, setErrMsg] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/user/area-juridica', { cache: 'no-store' })
        if (!res.ok) return
        const data = (await res.json()) as { slug: LegalAreaSlug | null }
        if (!cancelled) setSelected(data.slug)
      } catch { /* silent */ }
      finally { if (!cancelled) setHydrating(false) }
    })()
    return () => { cancelled = true }
  }, [])

  async function handleSelect(next: LegalAreaSlug) {
    if (saveState === 'saving') return

    const previous = selected
    // Toggle off se clicar de novo no que ja esta selecionado
    const target = next === selected ? null : next

    setSelected(target) // optimistic
    setSaveState('saving')
    setErrMsg('')

    try {
      const res = await fetch('/api/user/area-juridica', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: target }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error || 'Nao consegui salvar.')
      }
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 2000)
    } catch (e) {
      setSelected(previous)
      setSaveState('error')
      setErrMsg(e instanceof Error ? e.message : 'Erro ao salvar preferencia.')
      setTimeout(() => { setSaveState('idle'); setErrMsg('') }, 4000)
    }
  }

  if (hydrating) {
    return (
      <div style={hydratingStyle}>
        <Loader2 size={14} strokeWidth={1.75} aria-hidden className="animate-spin" />
        <span>Carregando preferencia...</span>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Cabecalho editorial: serial + titulo Playfair + subtitulo mono */}
      <div style={headerStyle}>
        <div style={serialStyle}>
          <span style={serialDotStyle} />
          <span>CAPITULO VI · VOCACAO</span>
        </div>
        <h3 style={titleStyle}>
          Area de <em style={titleEmStyle}>atuacao</em>
        </h3>
        <p style={subtitleStyle}>
          Os agentes calibram exemplo, jurisprudencia e tom pela area que voce marcar.
          Pode trocar quando quiser — salva automatico.
        </p>
        <div aria-hidden style={hairlineStyle} />
      </div>

      {/* Feedback pill (saved/error) — posicionado absoluto no topo direito */}
      <div style={feedbackSlotStyle} aria-live="polite">
        {saveState === 'saved' && (
          <span style={savedBadgeStyle}>
            <CheckCircle2 size={11} strokeWidth={2} aria-hidden />
            Salvo
          </span>
        )}
        {saveState === 'saving' && (
          <span style={savingBadgeStyle}>
            <Loader2 size={11} strokeWidth={2} aria-hidden className="animate-spin" />
            Salvando
          </span>
        )}
      </div>

      {errMsg && (
        <div role="alert" style={errorBannerStyle}>
          <AlertCircle size={13} strokeWidth={1.75} aria-hidden style={{ flexShrink: 0 }} />
          <span>{errMsg}</span>
        </div>
      )}

      {/* Grid de areas */}
      <div
        role="radiogroup"
        aria-label="Area de atuacao principal"
        style={gridStyle}
      >
        {LEGAL_AREAS.map((area, i) => {
          const isSelected = selected === area.slug
          const isDisabled = saveState === 'saving'
          return (
            <button
              key={area.slug}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => handleSelect(area.slug)}
              disabled={isDisabled}
              style={{
                ...cardStyle,
                borderColor: isSelected
                  ? 'rgba(191,166,142,0.45)'
                  : 'var(--border)',
                background: isSelected
                  ? 'linear-gradient(180deg, rgba(212,174,106,0.08), rgba(122,95,72,0.03))'
                  : 'var(--card-bg, transparent)',
                boxShadow: isSelected
                  ? 'inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 28px rgba(0,0,0,0.25), 0 0 0 1px rgba(212,174,106,0.06)'
                  : 'none',
                cursor: isDisabled ? 'wait' : 'pointer',
                transform: isSelected ? 'translateY(-1px)' : 'translateY(0)',
              }}
              onMouseEnter={e => {
                if (isDisabled || isSelected) return
                e.currentTarget.style.borderColor = 'rgba(191,166,142,0.24)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={e => {
                if (isDisabled || isSelected) return
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              {/* Spotlight gold decorativo */}
              {isSelected && (
                <span aria-hidden style={spotlightStyle} />
              )}

              {/* Topo: nº serial + check */}
              <div style={cardHeadStyle}>
                <span style={cardSerialStyle}>
                  N° {String(i + 1).padStart(2, '0')} · {ROMAN[i]}
                </span>
                {isSelected && (
                  <CheckCircle2
                    size={15}
                    strokeWidth={2}
                    aria-hidden
                    style={{ color: 'var(--accent)', flexShrink: 0 }}
                  />
                )}
              </div>

              {/* Nome da area em Playfair italic */}
              <div style={cardTitleStyle}>
                {area.label}
              </div>

              {/* Descricao */}
              <div style={cardDescStyle}>
                {area.description}
              </div>
            </button>
          )
        })}
      </div>

      {/* Rodape mono explicando o estado atual */}
      <div style={footerStyle}>
        {selected
          ? <>Agentes calibrados para <strong style={{ color: 'var(--accent)' }}>{LEGAL_AREAS.find(a => a.slug === selected)?.label}</strong> · clique de novo pra desmarcar</>
          : <>Nenhuma area marcada — os agentes operam em modo genérico</>
        }
      </div>
    </div>
  )
}

/* ─── styles ─────────────────────────────────────────────── */

const hydratingStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '32px 8px',
  color: 'var(--text-muted)',
  fontSize: 12,
  fontFamily: 'var(--font-mono, ui-monospace), monospace',
  letterSpacing: '0.08em',
}

const headerStyle: React.CSSProperties = {
  marginBottom: 24,
  paddingBottom: 18,
}

const serialStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 9,
  fontFamily: 'var(--font-mono, ui-monospace), monospace',
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  marginBottom: 12,
}

const serialDotStyle: React.CSSProperties = {
  display: 'inline-block',
  width: 5,
  height: 5,
  borderRadius: '50%',
  background: 'var(--accent)',
  boxShadow: '0 0 8px rgba(191,166,142,0.5)',
}

const titleStyle: React.CSSProperties = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontSize: 26,
  fontWeight: 500,
  lineHeight: 1.12,
  letterSpacing: '-0.02em',
  color: 'var(--text-primary)',
  margin: '0 0 6px',
}

const titleEmStyle: React.CSSProperties = {
  fontStyle: 'italic',
  fontWeight: 400,
  color: 'var(--accent)',
}

const subtitleStyle: React.CSSProperties = {
  fontSize: 13,
  lineHeight: 1.55,
  color: 'var(--text-muted)',
  margin: 0,
  maxWidth: 560,
}

const hairlineStyle: React.CSSProperties = {
  height: 1,
  marginTop: 16,
  background: 'linear-gradient(90deg, rgba(191,166,142,0.6) 0%, rgba(191,166,142,0.14) 28%, transparent 100%)',
}

const feedbackSlotStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  right: 0,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  minHeight: 22,
}

const savedBadgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  fontFamily: 'var(--font-mono, ui-monospace), monospace',
  fontSize: 9.5,
  fontWeight: 700,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: 'var(--success)',
  padding: '4px 10px',
  borderRadius: 6,
  background: 'var(--success-light)',
  border: '1px solid rgba(158,194,139,0.24)',
}

const savingBadgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  fontFamily: 'var(--font-mono, ui-monospace), monospace',
  fontSize: 9.5,
  fontWeight: 700,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: 'var(--accent)',
  padding: '4px 10px',
  borderRadius: 6,
  background: 'var(--accent-light)',
  border: '1px solid rgba(191,166,142,0.2)',
}

const errorBannerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '10px 14px',
  borderRadius: 10,
  background: 'var(--danger-light)',
  border: '1px solid rgba(216,137,119,0.18)',
  color: 'var(--danger)',
  fontSize: 12.5,
  lineHeight: 1.4,
  marginBottom: 14,
  fontFamily: 'var(--font-mono, ui-monospace), monospace',
  letterSpacing: '0.02em',
}

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
  gap: 14,
}

const cardStyle: React.CSSProperties = {
  position: 'relative',
  overflow: 'hidden',
  textAlign: 'left',
  padding: '16px 18px',
  borderRadius: 14,
  border: '1.5px solid',
  transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  fontFamily: 'inherit',
  color: 'inherit',
  minHeight: 128,
}

const spotlightStyle: React.CSSProperties = {
  position: 'absolute',
  top: -40,
  right: -40,
  width: 120,
  height: 120,
  borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(212,174,106,0.14), transparent 70%)',
  pointerEvents: 'none',
}

const cardHeadStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  position: 'relative',
  zIndex: 1,
}

const cardSerialStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono, ui-monospace), monospace',
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
}

const cardTitleStyle: React.CSSProperties = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontStyle: 'italic',
  fontWeight: 500,
  fontSize: 19,
  letterSpacing: '-0.015em',
  lineHeight: 1.15,
  color: 'var(--text-primary)',
  position: 'relative',
  zIndex: 1,
  marginTop: 2,
}

const cardDescStyle: React.CSSProperties = {
  fontSize: 12.5,
  lineHeight: 1.5,
  color: 'var(--text-muted)',
  position: 'relative',
  zIndex: 1,
}

const footerStyle: React.CSSProperties = {
  marginTop: 18,
  paddingTop: 14,
  borderTop: '1px dashed rgba(191,166,142,0.14)',
  fontSize: 11,
  color: 'var(--text-muted)',
  fontFamily: 'var(--font-mono, ui-monospace), monospace',
  letterSpacing: '0.04em',
  lineHeight: 1.5,
}

'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Loader2, Scale } from 'lucide-react'
import { LEGAL_AREAS, type LegalAreaSlug } from '@/lib/agents/taxonomy'

/* ═════════════════════════════════════════════════════════════
 * AreaSelector — v10.10 Phase 4
 * ─────────────────────────────────────────────────────────────
 * Deixa o advogado eleger sua area principal de atuacao. Cada
 * agente LexAI usa esse sinal pra calibrar exemplos, jurisprudencia
 * referente e tom da resposta.
 *
 * Comportamento:
 *  - Hidrata o estado via GET /api/user/area-juridica
 *  - Salva via PATCH /api/user/area-juridica (debounce 200ms implicito no click)
 *  - Optimistic update: UI muda imediato, reverte em erro
 *  - Mensagem de feedback aparece por 2s depois some
 *  - Suporta tema light/dark (usa tokens var(--text-*) e var(--border))
 *
 * Estados visuais:
 *  - loading: spinner overlay
 *  - saving: radio com borda pulsante champagne
 *  - saved: check verde por 2s
 *  - error: borda carmim + mensagem
 *  - empty (nenhuma area escolhida): todas com borda neutra
 *  - selected: uma com borda champagne + fundo levemente champagne
 * ═════════════════════════════════════════════════════════════ */

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

export function AreaSelector() {
  const [selected, setSelected] = useState<LegalAreaSlug | null>(null)
  const [hydrating, setHydrating] = useState(true)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [errMsg, setErrMsg] = useState('')

  // Hydrate from server
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
    setSelected(next) // optimistic
    setSaveState('saving')
    setErrMsg('')

    try {
      const res = await fetch('/api/user/area-juridica', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: next }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error || 'Erro ao salvar.')
      }
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 2000)
    } catch (e) {
      // rollback
      setSelected(previous)
      setSaveState('error')
      setErrMsg(e instanceof Error ? e.message : 'Erro ao salvar preferencia.')
      setTimeout(() => { setSaveState('idle'); setErrMsg('') }, 3500)
    }
  }

  if (hydrating) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '24px',
          color: 'var(--text-muted)',
          fontSize: 13,
        }}
      >
        <Loader2 size={16} strokeWidth={1.75} aria-hidden className="animate-spin" />
        Carregando preferência...
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Scale size={14} strokeWidth={1.75} aria-hidden />
          Área de atuação principal
        </div>
        {saveState === 'saved' && (
          <span
            style={{
              fontSize: 11,
              color: 'var(--accent, #2d6a4f)',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontWeight: 500,
            }}
          >
            <CheckCircle2 size={12} strokeWidth={2} aria-hidden /> salvo
          </span>
        )}
      </div>

      <div
        style={{
          fontSize: 13,
          color: 'var(--text-muted)',
          marginBottom: 18,
          lineHeight: 1.5,
        }}
      >
        Escolha a área em que você mais atua. Os agentes vão priorizar exemplos, jurisprudência
        e tom adequados à sua prática. Pode trocar quando quiser.
      </div>

      {errMsg && (
        <div
          role="alert"
          style={{
            padding: '10px 14px',
            borderRadius: 8,
            background: 'var(--danger-light, rgba(239,68,68,0.08))',
            color: 'var(--danger, #ef4444)',
            fontSize: 13,
            marginBottom: 12,
          }}
        >
          {errMsg}
        </div>
      )}

      <div
        role="radiogroup"
        aria-label="Área de atuação principal"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 10,
        }}
      >
        {LEGAL_AREAS.map((area) => {
          const isSelected = selected === area.slug
          return (
            <button
              key={area.slug}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => handleSelect(area.slug)}
              disabled={saveState === 'saving'}
              style={{
                textAlign: 'left',
                padding: '14px 16px',
                borderRadius: 12,
                cursor: saveState === 'saving' ? 'wait' : 'pointer',
                border: `1.5px solid ${
                  isSelected ? 'var(--accent, #bfa68e)' : 'var(--border)'
                }`,
                background: isSelected
                  ? 'var(--accent-light, rgba(191,166,142,0.08))'
                  : 'var(--card-bg, transparent)',
                transition: 'border-color 0.15s, background 0.15s, transform 0.15s',
                transform: isSelected ? 'translateY(-1px)' : 'translateY(0)',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                fontFamily: 'inherit',
                color: 'inherit',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                }}
              >
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: 14,
                    color: 'var(--text-primary)',
                    lineHeight: 1.2,
                  }}
                >
                  {area.label}
                </span>
                {isSelected && (
                  <CheckCircle2
                    size={16}
                    strokeWidth={2}
                    aria-hidden
                    style={{ color: 'var(--accent, #bfa68e)', flexShrink: 0 }}
                  />
                )}
              </div>
              <span
                style={{
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  lineHeight: 1.4,
                }}
              >
                {area.description}
              </span>
            </button>
          )
        })}
      </div>

      <div
        style={{
          marginTop: 14,
          fontSize: 11,
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono, ui-monospace)',
          letterSpacing: '0.02em',
        }}
      >
        {selected
          ? `Agentes calibrados para ${
              LEGAL_AREAS.find((a) => a.slug === selected)?.label
            }. Salva automaticamente.`
          : 'Nenhuma área selecionada — agentes operam em modo genérico.'}
      </div>
    </div>
  )
}

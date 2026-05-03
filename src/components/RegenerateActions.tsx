'use client'

/* ════════════════════════════════════════════════════════════════════
 * RegenerateActions · v1.0 (2026-05-03)
 * ────────────────────────────────────────────────────────────────────
 * Helper componente pra dashboards de agentes IA. Renderiza 2 botoes:
 *
 *   [Regenerar]    — re-chama API com mesmo input (cache miss intencional)
 *   [Refinar]     — abre textarea, usuario adiciona instrucao, dispara refine
 *
 * Uso (em qualquer dashboard /agentes):
 *
 *   <RegenerateActions
 *     onRegenerate={() => handleSubmit()}
 *     onRefine={(instr) => handleSubmit({ refineWith: instr })}
 *     loading={loading}
 *   />
 *
 * Audit elite IA P2-5 (RICE 180): usuarios queriam iterar sem reescrever
 * tudo. Antes voltava no formulario, alterava 1 coisa, perdia contexto da
 * resposta. Agora botao no resultado mantem fluxo natural.
 *
 * Persistencia: dashboards podem usar sessionStorage('lex:lastPayload:<slug>')
 * pra reuse de input em refresh — exemplo no JSDoc abaixo.
 * ═══════════════════════════════════════════════════════════════════ */

import { useState } from 'react'
import { RotateCw, Wand2, X } from 'lucide-react'

interface RegenerateActionsProps {
  /** Re-chama API com mesmo input. Sem args. */
  onRegenerate: () => void
  /**
   * Abre textarea de refinamento. Recebe instrucao adicional pra somar
   * ao input original. Ex: "encurte pra 2 paragrafos", "mais agressivo
   * na contestacao das preliminares", "adicione fundamento em CDC".
   */
  onRefine?: (instrucaoAdicional: string) => void
  /** Loading externo — desabilita botoes durante request. */
  loading?: boolean
  /** Posicionamento — default 'right'. */
  align?: 'left' | 'right'
  /** Label override pra Regenerar (ex: "Tentar de novo"). */
  regenerateLabel?: string
  /** Label override pra Refinar. */
  refineLabel?: string
}

export default function RegenerateActions({
  onRegenerate,
  onRefine,
  loading = false,
  align = 'right',
  regenerateLabel = 'Regenerar',
  refineLabel = 'Refinar',
}: RegenerateActionsProps) {
  const [refineOpen, setRefineOpen] = useState(false)
  const [instrucao, setInstrucao] = useState('')

  function submitRefine() {
    const trimmed = instrucao.trim()
    if (!trimmed || !onRefine) return
    onRefine(trimmed)
    setInstrucao('')
    setRefineOpen(false)
  }

  return (
    <div
      style={{
        marginTop: 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: align === 'right' ? 'flex-end' : 'flex-start',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={onRegenerate}
          disabled={loading}
          style={btnStyle(loading)}
        >
          <RotateCw size={14} strokeWidth={2.2} />
          {regenerateLabel}
        </button>
        {onRefine && (
          <button
            type="button"
            onClick={() => setRefineOpen(o => !o)}
            disabled={loading}
            style={btnStyle(loading, refineOpen)}
          >
            <Wand2 size={14} strokeWidth={2.2} />
            {refineLabel}
          </button>
        )}
      </div>

      {refineOpen && onRefine && (
        <div
          style={{
            width: '100%',
            maxWidth: 540,
            padding: 16,
            borderRadius: 12,
            border: '1px solid var(--border)',
            background: 'var(--bg-card)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ fontSize: 13, color: 'var(--text)' }}>
              Instrucao adicional pra refinar
            </strong>
            <button
              type="button"
              onClick={() => setRefineOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: 4,
                borderRadius: 6,
              }}
              aria-label="Fechar refinar"
            >
              <X size={14} strokeWidth={2.2} />
            </button>
          </div>
          <textarea
            value={instrucao}
            onChange={e => setInstrucao(e.target.value)}
            placeholder="Ex: 'encurte pra 2 paragrafos' ou 'mais agressivo nas preliminares' ou 'adicione fundamento em CDC'"
            rows={3}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--bg)',
              color: 'var(--text)',
              fontSize: 13,
              fontFamily: 'inherit',
              resize: 'vertical',
              minHeight: 70,
            }}
          />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={submitRefine}
              disabled={loading || instrucao.trim().length < 5}
              style={btnStyle(loading || instrucao.trim().length < 5, true)}
            >
              <Wand2 size={14} strokeWidth={2.2} />
              Aplicar refinamento
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function btnStyle(disabled: boolean, primary = false): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 14px',
    borderRadius: 8,
    border: '1px solid var(--border)',
    background: primary ? 'var(--accent)' : 'var(--bg-card)',
    color: primary ? 'var(--bg)' : 'var(--text)',
    fontSize: 13,
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.55 : 1,
    transition: 'all 180ms ease',
  }
}

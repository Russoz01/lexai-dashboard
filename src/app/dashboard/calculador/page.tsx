'use client'
import { useMemo, useState } from 'react'
import ConfidenceBadge, { PoweredByLexAI } from '@/components/ConfidenceBadge'
import {
  addDiasUteisForenses,
  breakdownPeriodo,
  diferencaDiasUteis,
} from '@/lib/feriados-br'

type RapidoModo = 'adicionar' | 'diferenca'

function formatBR(d: Date): string {
  const day = String(d.getDate()).padStart(2, '0')
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const y = d.getFullYear()
  const dow = ['domingo', 'segunda-feira', 'terca-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sabado'][d.getDay()]
  return `${day}/${m}/${y} (${dow})`
}

function parseInputDate(value: string): Date | null {
  if (!value) return null
  // formato esperado YYYY-MM-DD vindo do <input type="date">
  const [y, m, d] = value.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

export default function CalculadorPage() {
  const [consulta, setConsulta] = useState('')
  const [loading, setLoading] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [resultado, setResultado] = useState<any>(null)
  const [erro, setErro] = useState('')

  // ── Calculadora rapida (offline) ──────────────────────────────────────
  const [rapidoModo, setRapidoModo] = useState<RapidoModo>('adicionar')
  const [rapidoInicio, setRapidoInicio] = useState('')
  const [rapidoFim, setRapidoFim] = useState('')
  const [rapidoDias, setRapidoDias] = useState('')

  const rapidoResultado = useMemo(() => {
    const inicio = parseInputDate(rapidoInicio)
    if (!inicio) return null

    if (rapidoModo === 'adicionar') {
      const dias = parseInt(rapidoDias, 10)
      if (!Number.isFinite(dias) || dias < 0 || dias > 3650) return null
      try {
        const fim = addDiasUteisForenses(inicio, dias)
        const breakdown = breakdownPeriodo(inicio, fim)
        return { tipo: 'adicionar' as const, inicio, fim, breakdown, dias }
      } catch {
        return null
      }
    } else {
      const fim = parseInputDate(rapidoFim)
      if (!fim) return null
      if (fim.getTime() < inicio.getTime()) {
        return { tipo: 'erro' as const, msg: 'A data final deve ser igual ou posterior a data inicial.' }
      }
      const diasUteis = diferencaDiasUteis(inicio, fim)
      const breakdown = breakdownPeriodo(inicio, fim)
      return { tipo: 'diferenca' as const, inicio, fim, breakdown, diasUteis }
    }
  }, [rapidoModo, rapidoInicio, rapidoFim, rapidoDias])

  async function calcular() {
    if (!consulta.trim() || loading) return
    setLoading(true); setErro(''); setResultado(null)
    try {
      const res = await fetch('/api/calcular', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consulta }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResultado(data.resultado)
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro no calculo')
    } finally { setLoading(false) }
  }

  return (
    <div className="page-content" style={{ maxWidth: '100%' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
            Agente IA — Enterprise
          </span>
        </div>
        <h1 className="page-title">Calculador Juridico</h1>
        <p className="page-subtitle">Calcule prazos processuais, correcao monetaria, juros e custas</p>
      </div>

      {/* ════ Calculo rapido de prazo (client-side) ════ */}
      <div className="section-card" style={{ padding: '16px 18px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="bi bi-calendar-week" style={{ color: 'var(--accent)', fontSize: 15 }} />
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Calculo rapido de prazo
            </div>
            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: 'var(--success-light)', color: 'var(--success)', fontWeight: 700, letterSpacing: '0.04em' }}>
              OFFLINE
            </span>
          </div>
          <div style={{ display: 'flex', gap: 4, padding: 3, background: 'var(--hover)', borderRadius: 8, border: '1px solid var(--border)' }}>
            <button
              type="button"
              onClick={() => setRapidoModo('adicionar')}
              style={{
                padding: '5px 12px', borderRadius: 6, border: 'none',
                background: rapidoModo === 'adicionar' ? 'var(--card-bg)' : 'transparent',
                color: rapidoModo === 'adicionar' ? 'var(--text-primary)' : 'var(--text-muted)',
                fontSize: 11, fontWeight: 600, cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                boxShadow: rapidoModo === 'adicionar' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              Adicionar dias
            </button>
            <button
              type="button"
              onClick={() => setRapidoModo('diferenca')}
              style={{
                padding: '5px 12px', borderRadius: 6, border: 'none',
                background: rapidoModo === 'diferenca' ? 'var(--card-bg)' : 'transparent',
                color: rapidoModo === 'diferenca' ? 'var(--text-primary)' : 'var(--text-muted)',
                fontSize: 11, fontWeight: 600, cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                boxShadow: rapidoModo === 'diferenca' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              Calcular diferenca
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: rapidoModo === 'adicionar' ? '1fr 1fr' : '1fr 1fr', gap: 10, marginBottom: 10 }} className="rapido-grid">
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
              Data de inicio
            </label>
            <input
              type="date"
              value={rapidoInicio}
              onChange={e => setRapidoInicio(e.target.value)}
              className="form-input"
              style={{ fontSize: 13, padding: '8px 10px' }}
            />
          </div>

          {rapidoModo === 'adicionar' ? (
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                Quantidade de dias uteis
              </label>
              <input
                type="number"
                min="0"
                max="3650"
                value={rapidoDias}
                onChange={e => setRapidoDias(e.target.value)}
                placeholder="ex: 15"
                className="form-input"
                style={{ fontSize: 13, padding: '8px 10px' }}
              />
            </div>
          ) : (
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                Data final
              </label>
              <input
                type="date"
                value={rapidoFim}
                onChange={e => setRapidoFim(e.target.value)}
                className="form-input"
                style={{ fontSize: 13, padding: '8px 10px' }}
              />
            </div>
          )}
        </div>

        {rapidoResultado && rapidoResultado.tipo === 'erro' && (
          <div style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--danger-light)', color: 'var(--danger)', fontSize: 12 }}>
            {rapidoResultado.msg}
          </div>
        )}

        {rapidoResultado && rapidoResultado.tipo !== 'erro' && (
          <div style={{
            padding: '12px 14px', borderRadius: 10,
            background: 'var(--accent-light)', borderLeft: '3px solid var(--accent)',
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            {rapidoResultado.tipo === 'adicionar' ? (
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Resultado
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginTop: 3 }}>
                  {formatBR(rapidoResultado.fim)}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  {rapidoResultado.dias} dia(s) util(eis) apos {formatBR(rapidoResultado.inicio)}
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Resultado
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginTop: 3 }}>
                  {rapidoResultado.diasUteis} dia(s) util(eis) entre as datas
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  De {formatBR(rapidoResultado.inicio)} ate {formatBR(rapidoResultado.fim)}
                </div>
              </div>
            )}

            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 6,
              paddingTop: 8, borderTop: '1px dashed rgba(45,106,79,0.25)',
            }}>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 12, background: 'var(--card-bg)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                {rapidoResultado.breakdown.diasCorridos} corridos
              </span>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 12, background: 'var(--success-light)', color: 'var(--success)' }}>
                {rapidoResultado.breakdown.diasUteis} uteis
              </span>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 12, background: 'var(--warning-light)', color: 'var(--warning)' }}>
                {rapidoResultado.breakdown.feriados} feriados
              </span>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 12, background: 'var(--hover)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                {rapidoResultado.breakdown.finaisDeSemana} fim de semana
              </span>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 12, background: 'var(--danger-light)', color: 'var(--danger)' }}>
                {rapidoResultado.breakdown.diasRecesso} recesso
              </span>
            </div>
          </div>
        )}

        {!rapidoResultado && rapidoInicio && (
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', padding: 6 }}>
            {rapidoModo === 'adicionar' ? 'Informe a quantidade de dias uteis.' : 'Informe a data final.'}
          </div>
        )}

        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>
          Considera feriados nacionais 2025-2027 e recesso forense (20/12 a 20/01 — art. 220 CPC). Calculo 100% local.
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .rapido-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="redator-main-grid">
        <div className="section-card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
            Descricao do Calculo
          </div>
          <textarea value={consulta} onChange={e => setConsulta(e.target.value)}
            placeholder={"Descreva o calculo que precisa:\n\n- Prazo processual: data de intimacao, tipo de prazo\n- Correcao monetaria: valor, data inicial, indice\n- Juros: taxa, periodo, base de calculo\n- Custas: tribunal, valor da causa"}
            className="form-input" style={{ resize: 'vertical', minHeight: 220, fontFamily: "'DM Sans',sans-serif", fontSize: 13, lineHeight: 1.6 }} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Exemplos:</span>
            {['Prazo para contestacao CPC', 'Correcao monetaria IPCA-E desde 2020', 'Custas processuais TJSP'].map((ex, i) => (
              <button key={i} type="button" onClick={() => setConsulta(ex)}
                style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'var(--hover)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                {ex}
              </button>
            ))}
          </div>
          {erro && <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--danger-light)', color: 'var(--danger)', fontSize: 13, marginTop: 12 }}>{erro}</div>}
          <button onClick={calcular} disabled={!consulta.trim() || loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>
            {loading ? 'Calculando...' : <><i className="bi bi-calculator" /> Calcular</>}
          </button>
        </div>

        <div className="section-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Resultado
            </div>
            {resultado && <ConfidenceBadge confianca={resultado?.confianca} />}
          </div>
          {loading ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Calculando...</div>
          ) : resultado ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, overflowY: 'auto', maxHeight: 500 }}>
              {resultado.resultado && <div style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--accent-light)', borderLeft: '3px solid var(--accent)' }}><strong style={{ color: 'var(--accent)', fontSize: 11, textTransform: 'uppercase' }}>Resultado</strong><p style={{ marginTop: 6, color: 'var(--text-primary)', fontWeight: 600 }}>{String(resultado.resultado)}</p></div>}
              {resultado.valores && <div style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--hover)' }}><strong style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Valores</strong><div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>{Object.entries(resultado.valores).map(([k,v]) => <div key={k}><span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{k}</span><div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{String(v)}</div></div>)}</div></div>}
              {Array.isArray(resultado.passos) && resultado.passos.length > 0 && <div style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--hover)' }}><strong style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Passos</strong>{resultado.passos.map((p: string, i: number) => <p key={i} style={{ marginTop: 6, paddingLeft: 12, borderLeft: '2px solid var(--border)' }}>{p}</p>)}</div>}
              <button onClick={() => { setResultado(null); setConsulta('') }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: 11, background: 'none', border: '1px dashed var(--border)', borderRadius: 10, color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                <i className="bi bi-arrow-counterclockwise" /> Novo calculo
              </button>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <PoweredByLexAI />
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--text-muted)', minHeight: 220 }}>
              <i className="bi bi-calculator" style={{ fontSize: 40, opacity: 0.3 }} />
              <span style={{ fontSize: 13, textAlign: 'center' }}>Descreva o calculo juridico<br />e clique em Calcular</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

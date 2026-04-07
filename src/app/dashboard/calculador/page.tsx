'use client'
import { useState } from 'react'
import ConfidenceBadge, { PoweredByLexAI } from '@/components/ConfidenceBadge'

export default function CalculadorPage() {
  const [consulta, setConsulta] = useState('')
  const [loading, setLoading] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [resultado, setResultado] = useState<any>(null)
  const [erro, setErro] = useState('')

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

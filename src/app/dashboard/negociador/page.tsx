'use client'

import { useState } from 'react'

export default function NegociadorPage() {
  const [situacao, setSituacao] = useState('')
  const [loading, setLoading] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [resultado, setResultado] = useState<any>(null)
  const [erro, setErro] = useState('')

  async function analisar() {
    if (!situacao.trim() || loading) return
    setLoading(true); setErro(''); setResultado(null)
    try {
      const res = await fetch('/api/negociar', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situacao }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResultado(data.resultado)
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro na analise')
    } finally { setLoading(false) }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = resultado as any

  return (
    <div className="page-content" style={{ maxWidth: '100%' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
            Agente IA
          </span>
        </div>
        <h1 className="page-title">Negociador</h1>
        <p className="page-subtitle">Estrategia de negociacao e mediacao de conflitos juridicos</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="redator-main-grid">
        {/* Input */}
        <div className="section-card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
            Descricao do Conflito
          </div>
          <textarea value={situacao} onChange={e => setSituacao(e.target.value)}
            placeholder={"Descreva a situacao de conflito com detalhes:\n\n- Partes envolvidas\n- Objeto da disputa\n- Valor em discussao\n- Historico de tentativas de acordo\n- Posicao do seu cliente"}
            className="form-input" style={{ resize: 'vertical', minHeight: 280, fontFamily: "'DM Sans',sans-serif", fontSize: 13, lineHeight: 1.6 }} />
          {erro && (
            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--danger-light)', color: 'var(--danger)', fontSize: 13, marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="bi bi-exclamation-triangle-fill" /> {erro}
            </div>
          )}
          <button onClick={analisar} disabled={!situacao.trim() || loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>
            {loading ? <><span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Analisando estrategia...</>
              : <><i className="bi bi-lightning" /> Analisar Negociacao</>}
          </button>
        </div>

        {/* Output */}
        <div className="section-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
            Estrategia de Negociacao
          </div>
          {loading ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--text-muted)', minHeight: 280 }}>
              <span style={{ display: 'inline-block', width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <div style={{ fontWeight: 600 }}>Elaborando estrategia...</div>
            </div>
          ) : r ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, overflowY: 'auto', maxHeight: 600 }}>
              {r.zopa ? <div style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--accent-light)', borderLeft: '3px solid var(--accent)' }}><strong style={{ color: 'var(--accent)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Zona de Acordo (ZOPA)</strong><p style={{ marginTop: 6 }}>{String(r.zopa)}</p></div> : null}
              {r.estrategia && typeof r.estrategia === 'object' && (
                <div style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--hover)' }}>
                  <strong style={{ color: 'var(--text-primary)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Estrategia Recomendada</strong>
                  <div style={{ marginTop: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: 'var(--accent-light)', color: 'var(--accent)' }}>{(r.estrategia as any).tipo}</span>
                  </div>
                  <p style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>{(r.estrategia as any).abordagem}</p>
                </div>
              )}
              {Array.isArray(r.cenarios) && r.cenarios.length > 0 && (
                <div style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--hover)' }}>
                  <strong style={{ color: 'var(--text-primary)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Cenarios</strong>
                  <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {(r.cenarios as any[]).map((c, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: c.risco === 'Alto' ? 'var(--danger-light)' : c.risco === 'Medio' ? 'var(--warning-light)' : 'var(--success-light)', color: c.risco === 'Alto' ? 'var(--danger)' : c.risco === 'Medio' ? 'var(--warning)' : 'var(--success)' }}>{c.risco}</span>
                        <span style={{ flex: 1, fontWeight: 500 }}>{c.cenario}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.probabilidade}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {r.proposta_acordo ? <div style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--hover)', whiteSpace: 'pre-wrap' }}><strong style={{ color: 'var(--text-primary)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>Proposta de Acordo</strong>{String(r.proposta_acordo)}</div> : null}
              <button onClick={() => { setResultado(null); setSituacao('') }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: 11, background: 'none', border: '1px dashed var(--border)', borderRadius: 10, color: 'var(--text-muted)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                <i className="bi bi-arrow-counterclockwise" /> Nova analise
              </button>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--text-muted)', minHeight: 280 }}>
              <i className="bi bi-lightning" style={{ fontSize: 40, opacity: 0.3 }} />
              <span style={{ fontSize: 13, textAlign: 'center' }}>Descreva a situacao de conflito<br />e clique em Analisar</span>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

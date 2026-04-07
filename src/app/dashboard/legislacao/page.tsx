'use client'
import { useState } from 'react'
import ConfidenceBadge, { PoweredByLexAI } from '@/components/ConfidenceBadge'

export default function LegislacaoPage() {
  const [consulta, setConsulta] = useState('')
  const [loading, setLoading] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [resultado, setResultado] = useState<any>(null)
  const [erro, setErro] = useState('')

  async function pesquisar() {
    if (!consulta.trim() || loading) return
    setLoading(true); setErro(''); setResultado(null)
    try {
      const res = await fetch('/api/legislacao', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consulta }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResultado(data.resultado)
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro na pesquisa')
    } finally { setLoading(false) }
  }

  return (
    <div className="page-content" style={{ maxWidth: 1200 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
            Agente IA — Enterprise
          </span>
        </div>
        <h1 className="page-title">Legislacao</h1>
        <p className="page-subtitle">Pesquise e entenda artigos de lei, codigos e normas brasileiras</p>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <i className="bi bi-search" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 14 }} />
          <input type="text" value={consulta} onChange={e => setConsulta(e.target.value)}
            placeholder="Ex: Art. 5 CF/88, Art. 927 CC, Art. 300 CPC, Lei 8.078/90..."
            className="form-input" style={{ paddingLeft: 40 }}
            onKeyDown={e => e.key === 'Enter' && pesquisar()} />
        </div>
        <button onClick={pesquisar} disabled={!consulta.trim() || loading} className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
          {loading ? 'Pesquisando...' : <><i className="bi bi-book" /> Pesquisar</>}
        </button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Exemplos:</span>
        {['Art. 5 CF/88', 'Art. 927 Codigo Civil', 'Art. 300 CPC', 'Lei 8.078/90 CDC'].map((ex, i) => (
          <button key={i} type="button" onClick={() => setConsulta(ex)}
            style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'var(--hover)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
            {ex}
          </button>
        ))}
      </div>

      {erro && <div style={{ padding: '12px 14px', borderRadius: 8, background: 'var(--danger-light)', color: 'var(--danger)', fontSize: 13, marginBottom: 16 }}>{erro}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Pesquisando legislacao...</div>
        </div>
      ) : resultado ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {resultado.dispositivo && <div className="section-card" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent)' }}>Dispositivo Legal</div>
              <ConfidenceBadge confianca={resultado?.confianca} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{resultado.dispositivo}</div>
          </div>}

          {resultado.texto_legal && <div className="section-card" style={{ padding: '20px 24px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 8 }}>Texto Legal</div>
            <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.7, fontStyle: 'italic', padding: '12px 16px', borderLeft: '3px solid var(--accent)', background: 'var(--accent-light)', borderRadius: '0 8px 8px 0' }}>{resultado.texto_legal}</p>
          </div>}

          {resultado.explicacao && <div className="section-card" style={{ padding: '20px 24px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 8 }}>Explicacao</div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{resultado.explicacao}</p>
          </div>}

          {Array.isArray(resultado.exemplos_praticos) && resultado.exemplos_praticos.length > 0 && <div className="section-card" style={{ padding: '20px 24px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 8 }}>Exemplos Praticos</div>
            {resultado.exemplos_praticos.map((ex: string, i: number) => <p key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 8, paddingLeft: 12, borderLeft: '2px solid var(--border)' }}>{ex}</p>)}
          </div>}

          <button onClick={() => { setResultado(null); setConsulta('') }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: 11, background: 'none', border: '1px dashed var(--border)', borderRadius: 10, color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", marginTop: 8 }}>
            <i className="bi bi-arrow-counterclockwise" /> Nova pesquisa
          </button>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
            <PoweredByLexAI />
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
          <i className="bi bi-book" style={{ fontSize: 48, display: 'block', marginBottom: 16, opacity: 0.25 }} />
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Pesquise qualquer dispositivo legal</div>
          <div style={{ fontSize: 13 }}>Digite um artigo de lei, codigo ou norma para obter explicacao detalhada</div>
        </div>
      )}
    </div>
  )
}

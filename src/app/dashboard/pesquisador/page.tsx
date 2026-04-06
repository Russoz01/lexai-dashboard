'use client'

import { useState } from 'react'

const TRIBUNAIS = ['Todos','STF','STJ','TST','TSE','TRF 1ª','TRF 2ª','TRF 3ª','TRF 4ª','TRF 5ª','TJSP','TJRJ','TJMG']
const AREAS     = ['Todas','Civil','Penal','Trabalhista','Tributário','Constitucional','Administrativo','Ambiental','Consumidor']
const PERIODOS  = ['Qualquer período','Último mês','Último trimestre','Último ano','Últimos 5 anos']

interface Resultado {
  titulo: string
  tribunal: string
  numero: string
  data: string
  area: string
  relator: string
  ementa: string
  fundamentacao: string[]
  relevancia: string
  tese_fixada: string | null
}

interface PesquisaResponse {
  resultados: Resultado[]
  termos_relacionados: string[]
  legislacao_aplicavel: string[]
}

export default function PesquisadorPage() {
  const [query, setQuery]       = useState('')
  const [tribunal, setTribunal] = useState('Todos')
  const [area, setArea]         = useState('Todas')
  const [periodo, setPeriodo]   = useState('Qualquer período')
  const [buscando, setBuscando] = useState(false)
  const [pesquisa, setPesquisa] = useState<PesquisaResponse | null>(null)
  const [buscou, setBuscou]     = useState(false)
  const [expandido, setExpandido] = useState<string | null>(null)
  const [erro, setErro]         = useState('')
  const [copied, setCopied]     = useState<string | null>(null)

  async function buscar(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setBuscando(true); setBuscou(false); setPesquisa(null); setErro('')

    try {
      const res = await fetch('/api/pesquisar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, tribunal, area, periodo }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro na pesquisa')
      setPesquisa(data.pesquisa)
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao pesquisar')
    } finally {
      setBuscou(true)
      setBuscando(false)
    }
  }

  function copiar(texto: string, id: string) {
    navigator.clipboard.writeText(texto)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const resultados = pesquisa?.resultados ?? []

  return (
    <div className="page-content" style={{ maxWidth: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 12, fontWeight: 600, color: 'var(--accent)',
            letterSpacing: '0.5px', textTransform: 'uppercase',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
            Agente IA
          </span>
        </div>
        <h1 className="page-title">Pesquisador Jurídico</h1>
        <p className="page-subtitle">Pesquise jurisprudência com inteligência artificial</p>
      </div>

      {/* Barra de busca */}
      <form onSubmit={buscar}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <i className="bi bi-search" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 14 }} />
            <input
              type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Ex: responsabilidade civil do fornecedor, dano moral, prescrição..."
              className="form-input"
              style={{ paddingLeft: 40, paddingRight: 16 }}
            />
          </div>
          <button type="submit" disabled={!query.trim() || buscando} className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
            {buscando ? <><i className="bi bi-hourglass-split" /> Pesquisando...</> : <><i className="bi bi-search" /> Pesquisar</>}
          </button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Exemplos:</span>
          {['Responsabilidade civil do fornecedor', 'Dano moral in re ipsa', 'Prescricao intercorrente'].map((ex, i) => (
            <button key={i} type="button" onClick={() => setQuery(ex)}
              style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'var(--hover)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
              {ex}
            </button>
          ))}
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
          <select value={tribunal} onChange={e => setTribunal(e.target.value)} className="form-input" style={{ flex: '1 1 160px', maxWidth: 180 }}>
            {TRIBUNAIS.map(t => <option key={t}>{t}</option>)}
          </select>
          <select value={area} onChange={e => setArea(e.target.value)} className="form-input" style={{ flex: '1 1 160px', maxWidth: 180 }}>
            {AREAS.map(a => <option key={a}>{a}</option>)}
          </select>
          <select value={periodo} onChange={e => setPeriodo(e.target.value)} className="form-input" style={{ flex: '1 1 200px', maxWidth: 220 }}>
            {PERIODOS.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
      </form>

      {/* Erro */}
      {erro && (
        <div style={{ padding: '12px 14px', borderRadius: 8, background: 'var(--danger-light)', color: 'var(--danger)', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <i className="bi bi-exclamation-triangle-fill" />
          {erro}
        </div>
      )}

      {/* Resultados */}
      {buscando ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <div style={{ marginBottom: 16 }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
              <circle cx="12" cy="12" r="10" stroke="var(--accent)" strokeWidth="2.5" strokeDasharray="40 20" strokeLinecap="round" />
            </svg>
          </div>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Pesquisando com IA...</div>
          <div style={{ fontSize: 13 }}>Analisando jurisprudência relevante</div>
        </div>
      ) : buscou && resultados.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <i className="bi bi-journal-x" style={{ fontSize: 36, display: 'block', marginBottom: 12, opacity: 0.4 }} />
          <div style={{ fontWeight: 600 }}>Nenhum resultado encontrado</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>Tente termos diferentes ou remova filtros</div>
        </div>
      ) : resultados.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
            {resultados.length} resultado(s) encontrado(s)
          </div>

          {resultados.map((r, idx) => (
            <div key={idx} className="section-card" style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>{r.titulo}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: '#eef2ff', color: '#4f46e5' }}>{r.tribunal}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: 'var(--hover)', color: 'var(--text-secondary)' }}>{r.area}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                      background: r.relevancia === 'alta' ? '#e8f5ee' : r.relevancia === 'media' ? '#fef5e7' : '#f1f5f9',
                      color: r.relevancia === 'alta' ? '#2d6a4f' : r.relevancia === 'media' ? '#e67e22' : '#64748b',
                    }}>
                      {r.relevancia}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <i className="bi bi-calendar3" /> {r.data}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{r.numero}</span>
                  </div>
                  {r.relator && (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                      <i className="bi bi-person" style={{ marginRight: 4 }} />Rel. {r.relator}
                    </div>
                  )}
                </div>
                <button onClick={() => setExpandido(expandido === String(idx) ? null : String(idx))}
                  className="btn-ghost" style={{ fontSize: 12, padding: '5px 10px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  <i className={`bi ${expandido === String(idx) ? 'bi-chevron-up' : 'bi-chevron-down'}`} /> {expandido === String(idx) ? 'Recolher' : 'Ver ementa'}
                </button>
              </div>

              {expandido === String(idx) && (
                <>
                  <div style={{ padding: '12px 14px', borderRadius: 8, background: 'var(--input-bg)', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginTop: 8 }}>
                    <strong style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Ementa</strong>
                    {r.ementa}
                  </div>

                  {r.tese_fixada && (
                    <div style={{ padding: '12px 14px', borderRadius: 8, background: 'var(--accent-light)', fontSize: 13, color: 'var(--accent)', lineHeight: 1.7, marginTop: 8, borderLeft: '3px solid var(--accent)' }}>
                      <strong style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Tese Fixada</strong>
                      {r.tese_fixada}
                    </div>
                  )}

                  {r.fundamentacao && r.fundamentacao.length > 0 && (
                    <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {r.fundamentacao.map((f, i) => (
                        <span key={i} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'var(--hover)', color: 'var(--text-secondary)', fontWeight: 500 }}>
                          {f}
                        </span>
                      ))}
                    </div>
                  )}
                </>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button className="btn-ghost" style={{ fontSize: 12, padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 5 }}
                  onClick={() => copiar(r.ementa, String(idx))}>
                  <i className={`bi ${copied === String(idx) ? 'bi-check2' : 'bi-clipboard'}`} />
                  {copied === String(idx) ? 'Copiado' : 'Copiar ementa'}
                </button>
              </div>
            </div>
          ))}

          {/* Termos relacionados e legislação */}
          {pesquisa && (pesquisa.termos_relacionados?.length > 0 || pesquisa.legislacao_aplicavel?.length > 0) && (
            <div className="section-card" style={{ padding: '16px 20px', marginTop: 4 }}>
              {pesquisa.termos_relacionados?.length > 0 && (
                <div style={{ marginBottom: pesquisa.legislacao_aplicavel?.length > 0 ? 14 : 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 8 }}>
                    Termos Relacionados
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {pesquisa.termos_relacionados.map((t, i) => (
                      <button key={i} onClick={() => { setQuery(t); }} className="btn-ghost" style={{ fontSize: 12, padding: '4px 10px' }}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {pesquisa.legislacao_aplicavel?.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 8 }}>
                    Legislação Aplicável
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {pesquisa.legislacao_aplicavel.map((l, i) => (
                      <span key={i} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, background: 'var(--accent-light)', color: 'var(--accent)', fontWeight: 500 }}>
                        {l}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <i className="bi bi-journal-bookmark" style={{ fontSize: 40, display: 'block', marginBottom: 12, opacity: 0.3 }} />
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Pesquise jurisprudência com IA</div>
          <div style={{ fontSize: 13 }}>Digite termos na busca e aplique filtros para encontrar decisões</div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

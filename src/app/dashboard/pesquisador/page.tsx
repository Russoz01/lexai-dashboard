'use client'

import { useState } from 'react'

const TRIBUNAIS = ['Todos','STF','STJ','TST','TSE','TRF 1ª','TRF 2ª','TRF 3ª','TRF 4ª','TRF 5ª','TJSP','TJRJ','TJMG']
const AREAS     = ['Todas','Civil','Penal','Trabalhista','Tributário','Constitucional','Administrativo','Ambiental','Consumidor']
const PERIODOS  = ['Qualquer período','Último mês','Último trimestre','Último ano','Últimos 5 anos']

const MOCK_RESULTADOS = [
  {
    id: '1', titulo: 'Responsabilidade civil do empregador por acidente de trabalho',
    tribunal: 'TST', data: '12/03/2024', area: 'Trabalhista',
    ementa: 'O empregador responde objetivamente pelos danos decorrentes de acidentes de trabalho quando presentes os requisitos do art. 927, parágrafo único, do Código Civil, independentemente de culpa.',
    numero: 'RR-1234-56.2023.5.15.0001',
  },
  {
    id: '2', titulo: 'Dano moral por cobrança indevida — relação de consumo',
    tribunal: 'TJSP', data: '05/02/2024', area: 'Consumidor',
    ementa: 'A cobrança indevida de dívida já quitada configura dano moral in re ipsa, independente de comprovação de prejuízo específico, nos termos do CDC.',
    numero: 'AC 1098765-32.2023.8.26.0100',
  },
  {
    id: '3', titulo: 'Prazo decadencial para revisão de contrato bancário',
    tribunal: 'STJ', data: '18/01/2024', area: 'Civil',
    ementa: 'O prazo decadencial para o exercício do direito à revisão de cláusulas contratuais em contratos bancários é de 4 anos, nos termos do art. 178 do Código Civil.',
    numero: 'REsp 2345678-12.2023.1.00.0000',
  },
]

export default function PesquisadorPage() {
  const [query, setQuery]     = useState('')
  const [tribunal, setTribunal] = useState('Todos')
  const [area, setArea]       = useState('Todas')
  const [periodo, setPeriodo] = useState('Qualquer período')
  const [buscando, setBuscando] = useState(false)
  const [resultados, setResultados] = useState<typeof MOCK_RESULTADOS>([])
  const [buscou, setBuscou]   = useState(false)
  const [expandido, setExpandido] = useState<string | null>(null)

  async function buscar(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setBuscando(true); setBuscou(false); setResultados([])
    await new Promise(r => setTimeout(r, 1400))
    setResultados(MOCK_RESULTADOS)
    setBuscou(true); setBuscando(false)
  }

  return (
    <div className="page-content" style={{ maxWidth: '100%' }}>
      {/* Banner */}
      <div className="agent-banner">
        <i className="bi bi-stars" />
        Agente em desenvolvimento — resultados de exemplo exibidos. Integração com bases jurídicas em breve.
      </div>

      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <h1 className="page-title">Pesquisador Jurídico</h1>
        <p className="page-subtitle">Pesquise jurisprudência, doutrina e legislação</p>
      </div>

      {/* Barra de busca */}
      <form onSubmit={buscar}>
        <div style={{ display:'flex', gap:10, marginBottom:16 }}>
          <div style={{ flex:1, position:'relative' }}>
            <i className="bi bi-search" style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', fontSize:14 }} />
            <input
              type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Ex: responsabilidade civil do fornecedor, dano moral, prescrição..."
              className="form-input"
              style={{ paddingLeft:40, paddingRight:16 }}
            />
          </div>
          <button type="submit" disabled={!query.trim() || buscando} className="btn-primary" style={{ whiteSpace:'nowrap' }}>
            {buscando ? <><i className="bi bi-hourglass-split" /> Buscando...</> : <><i className="bi bi-search" /> Buscar</>}
          </button>
        </div>

        {/* Filtros */}
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:24 }}>
          <select value={tribunal} onChange={e => setTribunal(e.target.value)} className="form-input" style={{ flex:'1 1 160px', maxWidth:180 }}>
            {TRIBUNAIS.map(t => <option key={t}>{t}</option>)}
          </select>
          <select value={area} onChange={e => setArea(e.target.value)} className="form-input" style={{ flex:'1 1 160px', maxWidth:180 }}>
            {AREAS.map(a => <option key={a}>{a}</option>)}
          </select>
          <select value={periodo} onChange={e => setPeriodo(e.target.value)} className="form-input" style={{ flex:'1 1 200px', maxWidth:220 }}>
            {PERIODOS.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
      </form>

      {/* Resultados */}
      {buscando ? (
        <div style={{ textAlign:'center', padding:'60px 0', color:'var(--text-muted)' }}>
          <i className="bi bi-hourglass-split" style={{ fontSize:28, display:'block', marginBottom:8 }} />
          Pesquisando nas bases jurídicas...
        </div>
      ) : buscou && resultados.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 0', color:'var(--text-muted)' }}>
          <i className="bi bi-journal-x" style={{ fontSize:36, display:'block', marginBottom:12, opacity:0.4 }} />
          <div style={{ fontWeight:600 }}>Nenhum resultado encontrado</div>
        </div>
      ) : resultados.length > 0 ? (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ fontSize:13, color:'var(--text-muted)', marginBottom:4 }}>
            {resultados.length} resultado(s) encontrado(s)
          </div>
          {resultados.map(r => (
            <div key={r.id} className="section-card" style={{ padding:'16px 20px' }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:8 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:14, color:'var(--text-primary)', marginBottom:4 }}>{r.titulo}</div>
                  <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                    <span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:20, background:'#eef2ff', color:'#4f46e5' }}>{r.tribunal}</span>
                    <span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:20, background:'var(--hover)', color:'var(--text-secondary)' }}>{r.area}</span>
                    <span style={{ fontSize:12, color:'var(--text-muted)', display:'flex', alignItems:'center', gap:4 }}>
                      <i className="bi bi-calendar3" /> {r.data}
                    </span>
                    <span style={{ fontSize:11, color:'var(--text-muted)', fontFamily:'monospace' }}>{r.numero}</span>
                  </div>
                </div>
                <button onClick={() => setExpandido(expandido === r.id ? null : r.id)}
                  className="btn-ghost" style={{ fontSize:12, padding:'5px 10px', whiteSpace:'nowrap', flexShrink:0 }}>
                  <i className={`bi ${expandido === r.id ? 'bi-chevron-up' : 'bi-chevron-down'}`} /> {expandido === r.id ? 'Recolher' : 'Ver ementa'}
                </button>
              </div>
              {expandido === r.id && (
                <div style={{ padding:'12px 14px', borderRadius:8, background:'var(--input-bg)', fontSize:13, color:'var(--text-secondary)', lineHeight:1.7, marginTop:8 }}>
                  <strong style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.05em', color:'var(--text-muted)', display:'block', marginBottom:6 }}>Ementa</strong>
                  {r.ementa}
                </div>
              )}
              <div style={{ display:'flex', gap:8, marginTop:10 }}>
                <button className="btn-ghost" style={{ fontSize:12, padding:'5px 10px', display:'flex', alignItems:'center', gap:5 }}
                  onClick={() => navigator.clipboard.writeText(r.ementa)}>
                  <i className="bi bi-clipboard" /> Copiar ementa
                </button>
                <button className="btn-ghost" style={{ fontSize:12, padding:'5px 10px', display:'flex', alignItems:'center', gap:5 }}>
                  <i className="bi bi-bookmark" /> Salvar
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign:'center', padding:'60px 0', color:'var(--text-muted)' }}>
          <i className="bi bi-journal-bookmark" style={{ fontSize:40, display:'block', marginBottom:12, opacity:0.3 }} />
          <div style={{ fontWeight:600, marginBottom:6 }}>Pesquise jurisprudência</div>
          <div style={{ fontSize:13 }}>Digite termos na busca e aplique filtros para encontrar decisões</div>
        </div>
      )}
    </div>
  )
}

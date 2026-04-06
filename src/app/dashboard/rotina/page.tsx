'use client'

import { useState, useEffect } from 'react'

const DIAS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

const CORES_DISCIPLINA = [
  '#2d6a4f','#4f46e5','#e67e22','#c0392b','#0284c7','#7c3aed','#0f766e',
]

interface Compromisso {
  id: string; titulo: string; horario: string; local: string; disciplina: string; dia: number; cor: string
}

const MOCK: Compromisso[] = [
  { id:'1', titulo:'Direito Civil — Contratos',     horario:'08:00–10:00', local:'Sala 205',        disciplina:'Civil',      dia:1, cor:'#2d6a4f' },
  { id:'2', titulo:'Processo Civil',                horario:'10:00–12:00', local:'Sala 108',        disciplina:'Processo',   dia:1, cor:'#4f46e5' },
  { id:'3', titulo:'Direito Penal',                 horario:'14:00–16:00', local:'Anfiteatro A',    disciplina:'Penal',      dia:2, cor:'#c0392b' },
  { id:'4', titulo:'Estágio — escritório Mendes',   horario:'08:00–12:00', local:'R. XV, 800',     disciplina:'Estágio',    dia:3, cor:'#e67e22' },
  { id:'5', titulo:'Direito Tributário',            horario:'16:00–18:00', local:'Sala 301',        disciplina:'Tributário', dia:4, cor:'#0284c7' },
  { id:'6', titulo:'Seminário de Jurisprudência',   horario:'09:00–11:00', local:'Sala de reuniões',disciplina:'Pesquisa',   dia:5, cor:'#7c3aed' },
]

const EMPTY_COMP = { titulo:'', horario:'', local:'', disciplina:'', dia:1, cor:CORES_DISCIPLINA[0] }

export default function RotinaPage() {
  const [compromissos, setCompromissos] = useState<Compromisso[]>(MOCK)
  const [modal, setModal]   = useState(false)
  const [form, setForm]     = useState(EMPTY_COMP)
  const [hoje]              = useState(new Date())

  // Persist to localStorage
  useEffect(() => {
    const saved = localStorage.getItem('lexai-rotina')
    if (saved) {
      try { setCompromissos(JSON.parse(saved)) } catch { /* use mock */ }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('lexai-rotina', JSON.stringify(compromissos))
  }, [compromissos])

  const inicioSemana = new Date(hoje)
  inicioSemana.setDate(hoje.getDate() - hoje.getDay())

  const dias = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(inicioSemana)
    d.setDate(inicioSemana.getDate() + i)
    return d
  })

  const diaHoje = hoje.getDay()

  function salvar() {
    if (!form.titulo || !form.horario) return
    setCompromissos(prev => [...prev, { ...form, id: Date.now().toString() }])
    setModal(false); setForm(EMPTY_COMP)
  }

  function remover(id: string) {
    setCompromissos(prev => prev.filter(c => c.id !== id))
  }

  const compHoje = compromissos.filter(c => c.dia === diaHoje).sort((a,b) => a.horario.localeCompare(b.horario))

  return (
    <div className="page-content" style={{ maxWidth: '100%' }}>
      {/* Banner */}
      <div className="agent-banner">
        <i className="bi bi-stars" />
        Agente em desenvolvimento — dados de exemplo exibidos. Sincronização com calendário em breve.
      </div>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:28, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 className="page-title">Rotina</h1>
          <p className="page-subtitle">Organize sua agenda semanal de aulas, estágios e compromissos</p>
        </div>
        <button className="btn-primary" onClick={() => setModal(true)}>
          <i className="bi bi-plus-lg" /> Novo Compromisso
        </button>
      </div>

      {/* Cabeçalho da semana */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
        <div style={{ fontSize:14, fontWeight:600, color:'var(--text-secondary)' }}>
          {MESES[inicioSemana.getMonth()]} {inicioSemana.getFullYear()}
        </div>
        <div style={{ fontSize:13, color:'var(--text-muted)' }}>Semana atual</div>
      </div>

      {/* Grade semanal */}
      <div className="rotina-week-grid" style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:8, marginBottom:28 }}>
        {dias.map((d, i) => {
          const isHoje = i === diaHoje
          const comps  = compromissos.filter(c => c.dia === i)
          return (
            <div key={i} style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {/* Dia header */}
              <div style={{ textAlign:'center', paddingBottom:8, borderBottom:'1px solid var(--border)' }}>
                <div style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', marginBottom:4 }}>{DIAS[i]}</div>
                <div style={{
                  width:30, height:30, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                  margin:'0 auto', fontSize:14, fontWeight:700,
                  background: isHoje ? 'var(--accent)' : 'transparent',
                  color: isHoje ? '#fff' : 'var(--text-primary)',
                }}>
                  {d.getDate()}
                </div>
              </div>
              {/* Compromissos do dia */}
              <div style={{ display:'flex', flexDirection:'column', gap:4, minHeight:60 }}>
                {comps.map(c => (
                  <div key={c.id} style={{
                    padding:'6px 8px', borderRadius:6, fontSize:11, lineHeight:1.3,
                    borderLeft:`3px solid ${c.cor}`,
                    background: `${c.cor}18`,
                    cursor:'default',
                  }}
                    title={`${c.horario} — ${c.local}`}>
                    <div style={{ fontWeight:600, color:'var(--text-primary)', marginBottom:2 }}>{c.titulo}</div>
                    <div style={{ color:'var(--text-muted)' }}>{c.horario}</div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Agenda de hoje */}
      <div className="section-card" style={{ padding:'18px 20px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
          <i className="bi bi-calendar-day" style={{ color:'var(--accent)', fontSize:16 }} />
          <span style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)' }}>
            Hoje — {DIAS[diaHoje]}, {hoje.getDate()} de {MESES[hoje.getMonth()]}
          </span>
        </div>
        {compHoje.length === 0 ? (
          <div style={{ textAlign:'center', padding:'30px 0', color:'var(--text-muted)', fontSize:13 }}>
            <i className="bi bi-sun" style={{ fontSize:24, display:'block', marginBottom:8, opacity:0.4 }} />
            Nenhum compromisso hoje
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {compHoje.map(c => (
              <div key={c.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 14px', borderRadius:10, background:'var(--hover)', borderLeft:`3px solid ${c.cor}` }}>
                <div style={{ textAlign:'center', minWidth:60 }}>
                  <div style={{ fontSize:13, fontWeight:700, color: c.cor, fontVariantNumeric:'tabular-nums' }}>{c.horario.split('–')[0]}</div>
                  <div style={{ fontSize:10, color:'var(--text-muted)' }}>{c.horario.split('–')[1] ?? ''}</div>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:14, color:'var(--text-primary)', marginBottom:2 }}>{c.titulo}</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)', display:'flex', alignItems:'center', gap:8 }}>
                    <span><i className="bi bi-geo-alt" style={{ marginRight:3 }}/>{c.local}</span>
                    <span style={{ padding:'1px 7px', borderRadius:20, background:`${c.cor}20`, color:c.cor, fontSize:11, fontWeight:600 }}>{c.disciplina}</span>
                  </div>
                </div>
                <button onClick={() => remover(c.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:14, padding:'4px 6px', borderRadius:6 }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color='var(--danger)'}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color='var(--text-muted)'}>
                  <i className="bi bi-trash3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">Novo Compromisso</span>
              <button className="modal-close" onClick={() => setModal(false)}><i className="bi bi-x" /></button>
            </div>
            <div className="modal-body">
              <div>
                <label className="form-label">Título *</label>
                <input type="text" value={form.titulo} onChange={e => setForm(f => ({...f, titulo:e.target.value}))}
                  placeholder="Ex: Direito Civil — Contratos" className="form-input" />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <div>
                  <label className="form-label">Horário *</label>
                  <input type="text" value={form.horario} onChange={e => setForm(f => ({...f, horario:e.target.value}))}
                    placeholder="08:00–10:00" className="form-input" />
                </div>
                <div>
                  <label className="form-label">Dia da Semana</label>
                  <select value={form.dia} onChange={e => setForm(f => ({...f, dia:Number(e.target.value)}))} className="form-input">
                    {DIAS.map((d, i) => <option key={d} value={i}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <div>
                  <label className="form-label">Local</label>
                  <input type="text" value={form.local} onChange={e => setForm(f => ({...f, local:e.target.value}))}
                    placeholder="Sala 205" className="form-input" />
                </div>
                <div>
                  <label className="form-label">Disciplina / Tipo</label>
                  <input type="text" value={form.disciplina} onChange={e => setForm(f => ({...f, disciplina:e.target.value}))}
                    placeholder="Civil, Penal, Estágio..." className="form-input" />
                </div>
              </div>
              <div>
                <label className="form-label">Cor</label>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {CORES_DISCIPLINA.map(cor => (
                    <button key={cor} onClick={() => setForm(f => ({...f, cor}))} style={{
                      width:28, height:28, borderRadius:'50%', background:cor, border:'none', cursor:'pointer',
                      outline: form.cor === cor ? `3px solid ${cor}` : '3px solid transparent',
                      outlineOffset:2,
                    }} />
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-ghost" style={{ flex:1 }} onClick={() => setModal(false)}>Cancelar</button>
                <button type="button" disabled={!form.titulo || !form.horario} onClick={salvar}
                  className="btn-primary" style={{ flex:1, justifyContent:'center' }}>
                  <i className="bi bi-check2" /> Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

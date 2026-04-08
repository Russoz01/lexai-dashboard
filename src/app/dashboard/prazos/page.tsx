'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { resolveUsuarioId } from '@/lib/usuario'

interface Prazo {
  id: string; titulo: string; descricao: string | null; data_limite: string
  status: string; prioridade: string; alerta_7dias: boolean; alerta_3dias: boolean; alerta_1dia: boolean
}

const PRIOR_STYLE: Record<string, { bg: string; color: string }> = {
  baixa:   { bg: '#f1f5f9', color: '#64748b' },
  media:   { bg: '#eef2ff', color: '#4f46e5' },
  alta:    { bg: '#fef5e7', color: '#e67e22' },
  critica: { bg: '#fdecea', color: '#c0392b' },
}
const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  pendente:  { bg: '#fef5e7', color: '#e67e22' },
  concluido: { bg: '#e8f5ee', color: '#2d6a4f' },
  vencido:   { bg: '#fdecea', color: '#c0392b' },
  cancelado: { bg: '#f1f5f9', color: '#64748b' },
}

function dias(data: string) {
  const hoje = new Date(); hoje.setHours(0,0,0,0)
  return Math.ceil((new Date(data + 'T00:00:00').getTime() - hoje.getTime()) / 86400000)
}
function fmtData(d: string) { const [y,m,dd] = d.split('-'); return `${dd}/${m}/${y}` }
function barCls(d: number) { return d <= 3 ? 'critical' : d <= 10 ? 'warning' : 'normal' }

const EMPTY_FORM = { titulo:'', descricao:'', data_limite:'', prioridade:'media', alerta_7dias:true, alerta_3dias:true, alerta_1dia:true }

export default function PrazosPage() {
  const supabase = createClient()
  const [prazos, setPrazos]       = useState<Prazo[]>([])
  const [loading, setLoading]     = useState(true)
  const [modal, setModal]         = useState(false)
  const [filtro, setFiltro]       = useState('todos')
  const [salvando, setSalvando]   = useState(false)
  const [erro, setErro]           = useState('')
  const [form, setForm]           = useState(EMPTY_FORM)

  const carregar = useCallback(async () => {
    setErro('')
    const usuarioId = await resolveUsuarioId()
    if (!usuarioId) { setLoading(false); return }
    const { data, error } = await supabase.from('prazos').select('*').eq('usuario_id', usuarioId).order('data_limite')
    if (error) { setErro('Nao foi possivel carregar prazos. Tente novamente.'); setLoading(false); return }
    setPrazos(data ?? []); setLoading(false)
  }, [supabase])

  useEffect(() => { carregar() }, [carregar])

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    if (!form.titulo || !form.data_limite) return
    setSalvando(true); setErro('')
    const usuarioId = await resolveUsuarioId()
    if (!usuarioId) { setErro('Nao foi possivel identificar o usuario.'); setSalvando(false); return }
    const { error } = await supabase.from('prazos').insert({ usuario_id: usuarioId, ...form })
    if (error) { setErro(error.message); setSalvando(false); return }
    setModal(false); setForm(EMPTY_FORM); await carregar(); setSalvando(false)
  }

  async function toggleStatus(id: string, status: string) {
    await supabase.from('prazos').update({ status: status === 'concluido' ? 'pendente' : 'concluido' }).eq('id', id)
    await carregar()
  }

  async function deletar(id: string) {
    if (!confirm('Excluir este prazo?')) return
    await supabase.from('prazos').delete().eq('id', id); await carregar()
  }

  const lista     = prazos.filter(p => filtro === 'todos' || p.status === filtro)
  const urgentes  = prazos.filter(p => { const d = dias(p.data_limite); return d >= 0 && d <= 7 && p.status === 'pendente' })

  return (
    <div className="page-content" style={{ maxWidth: '100%' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:28, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 className="page-title">Prazos</h1>
          <p className="page-subtitle">Controle seus prazos processuais e acadêmicos</p>
        </div>
        <button className="btn-primary" onClick={() => setModal(true)}>
          <i className="bi bi-plus-lg" /> Novo Prazo
        </button>
      </div>

      {/* Alerta urgentes */}
      {urgentes.length > 0 && (
        <div style={{ padding:'14px 16px', borderRadius:10, background:'#fef5e7', borderLeft:'3px solid #e67e22', marginBottom:20, display:'flex', alignItems:'flex-start', gap:10 }}>
          <i className="bi bi-exclamation-triangle-fill" style={{ color:'#e67e22', marginTop:1 }} />
          <div style={{ fontSize:13, color:'#b7611a' }}>
            <strong>{urgentes.length} prazo(s)</strong> vencem em até 7 dias:{' '}
            {urgentes.map(p => p.titulo).join(', ')}
          </div>
        </div>
      )}

      {/* Filtros */}
      <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
        {['todos','pendente','concluido','vencido','cancelado'].map(s => (
          <button key={s} onClick={() => setFiltro(s)} style={{
            padding:'7px 14px', borderRadius:8, border:'1px solid var(--border)',
            background: filtro === s ? 'var(--accent)' : 'var(--card-bg)',
            color: filtro === s ? '#fff' : 'var(--text-secondary)',
            fontSize:13, fontWeight:500, cursor:'pointer',
            fontFamily:"'DM Sans',sans-serif", transition:'all 0.15s ease',
          }}>
            {s === 'todos' ? `Todos (${prazos.length})` : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Inline error */}
      {erro && !modal && (
        <div style={{ padding: '12px 14px', borderRadius: 8, background: 'var(--danger-light)', color: 'var(--danger)', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <i className="bi bi-exclamation-triangle-fill" /> {erro}
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div style={{ textAlign:'center', padding:'60px 0', color:'var(--text-muted)' }}>
          <i className="bi bi-hourglass-split" style={{ fontSize:28, display:'block', marginBottom:8 }} />
          Carregando...
        </div>
      ) : lista.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 0', color:'var(--text-muted)' }}>
          <i className="bi bi-clock" style={{ fontSize:36, display:'block', marginBottom:12, opacity:0.4 }} />
          <div style={{ fontWeight:600, marginBottom:6 }}>Nenhum prazo encontrado</div>
          <button className="btn-ghost" style={{ fontSize:13, padding:'8px 16px' }} onClick={() => setModal(true)}>
            Adicionar primeiro prazo
          </button>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {lista.map(prazo => {
            const d = dias(prazo.data_limite)
            return (
              <div key={prazo.id} className="section-card" style={{ padding:0, overflow:'hidden' }}>
                <div style={{ display:'flex', alignItems:'stretch', gap:0 }}>
                  {/* Color bar */}
                  <div className={`deadline-bar ${barCls(d)}`} style={{ width:4, height:'auto', borderRadius:'12px 0 0 12px', flexShrink:0, margin:0 }} />
                  <div style={{ flex:1, padding:'14px 16px', display:'flex', alignItems:'flex-start', gap:14 }}>
                    {/* Status toggle */}
                    <button onClick={() => toggleStatus(prazo.id, prazo.status)} style={{
                      width:22, height:22, borderRadius:'50%', flexShrink:0, marginTop:1,
                      border: prazo.status === 'concluido' ? 'none' : '2px solid var(--border)',
                      background: prazo.status === 'concluido' ? 'var(--accent)' : 'none',
                      cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                      transition:'all 0.15s', color:'#fff', fontSize:11,
                    }}>
                      {prazo.status === 'concluido' && <i className="bi bi-check" />}
                    </button>
                    {/* Content */}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:4 }}>
                        <span style={{ fontWeight:700, fontSize:14, color:'var(--text-primary)', textDecoration: prazo.status==='concluido' ? 'line-through' : 'none', opacity: prazo.status==='concluido' ? 0.5 : 1 }}>
                          {prazo.titulo}
                        </span>
                        <span style={{ ...PRIOR_STYLE[prazo.prioridade], fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:20 }}>
                          {prazo.prioridade}
                        </span>
                        <span style={{ ...STATUS_STYLE[prazo.status], fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:20 }}>
                          {prazo.status}
                        </span>
                      </div>
                      {prazo.descricao && <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:6 }}>{prazo.descricao}</div>}
                      <div style={{ display:'flex', alignItems:'center', gap:16, fontSize:12 }}>
                        <span style={{ color:'var(--text-secondary)', display:'flex', alignItems:'center', gap:4 }}>
                          <i className="bi bi-calendar3" /> {fmtData(prazo.data_limite)}
                        </span>
                        {prazo.status === 'pendente' && (
                          <span style={{ fontWeight:600, color: d<0 ? '#c0392b' : d===0 ? '#c0392b' : d<=3 ? '#e67e22' : 'var(--text-muted)' }}>
                            {d < 0 ? `Vencido há ${Math.abs(d)}d` : d === 0 ? 'Vence hoje!' : `${d} dias restantes`}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Delete */}
                    <button onClick={() => deletar(prazo.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:14, padding:'4px', borderRadius:6, transition:'all 0.15s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color='var(--danger)'}
                      onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color='var(--text-muted)'}
                    >
                      <i className="bi bi-trash3" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── MODAL ── */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">Novo Prazo</span>
              <button className="modal-close" onClick={() => setModal(false)}><i className="bi bi-x" /></button>
            </div>
            <form onSubmit={salvar}>
              <div className="modal-body">
                {erro && <div style={{ padding:'10px 14px', borderRadius:8, background:'var(--danger-light)', color:'var(--danger)', fontSize:13 }}>{erro}</div>}
                <div>
                  <label className="form-label">Título *</label>
                  <input type="text" value={form.titulo} onChange={e => setForm(f => ({...f, titulo:e.target.value}))}
                    placeholder="Ex: Contestação — Proc. 0001234-56" className="form-input" required />
                </div>
                <div>
                  <label className="form-label">Descrição</label>
                  <textarea value={form.descricao} onChange={e => setForm(f => ({...f, descricao:e.target.value}))}
                    placeholder="Detalhes adicionais..." className="form-input" style={{ resize:'none', height:80 }} />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                  <div>
                    <label className="form-label">Data Limite *</label>
                    <input type="date" value={form.data_limite} onChange={e => setForm(f => ({...f, data_limite:e.target.value}))}
                      className="form-input" required />
                  </div>
                  <div>
                    <label className="form-label">Prioridade</label>
                    <select value={form.prioridade} onChange={e => setForm(f => ({...f, prioridade:e.target.value}))} className="form-input">
                      <option value="baixa">Baixa</option>
                      <option value="media">Média</option>
                      <option value="alta">Alta</option>
                      <option value="critica">Crítica</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="form-label">Alertas</label>
                  <div style={{ display:'flex', gap:20 }}>
                    {[['alerta_7dias','7 dias'],['alerta_3dias','3 dias'],['alerta_1dia','1 dia']].map(([k, lbl]) => (
                      <label key={k} style={{ display:'flex', alignItems:'center', gap:7, fontSize:14, color:'var(--text-secondary)', cursor:'pointer' }}>
                        <input type="checkbox" checked={form[k as keyof typeof form] as boolean}
                          onChange={e => setForm(f => ({...f, [k]:e.target.checked}))} />
                        {lbl}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-ghost" style={{ flex:1 }} onClick={() => setModal(false)}>Cancelar</button>
                  <button type="submit" disabled={salvando} className="btn-primary" style={{ flex:1, justifyContent:'center' }}>
                    {salvando ? 'Salvando...' : <><i className="bi bi-check2" /> Adicionar Prazo</>}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

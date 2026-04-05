'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'

interface Lancamento {
  id: string; descricao: string; valor: number; tipo: string; categoria: string; data: string
}

const CAT_ICON: Record<string, string> = {
  honorarios: 'bi-briefcase', mensalidade: 'bi-mortarboard', livro: 'bi-book',
  material: 'bi-pencil', aluguel: 'bi-building', salario: 'bi-person-badge',
  imposto: 'bi-bank', outro: 'bi-three-dots',
}

const EMPTY = { descricao: '', valor: '', tipo: 'receita', categoria: 'honorarios', data: new Date().toISOString().split('T')[0] }

function fmt(v: number) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }
function fmtData(d: string) { const [y,m,dd] = d.split('-'); return `${dd}/${m}/${y}` }

export default function FinanceiroPage() {
  const supabase = createClient()
  const [itens, setItens]       = useState<Lancamento[]>([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro]         = useState('')
  const [form, setForm]         = useState(EMPTY)

  const carregar = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('financeiro').select('*').eq('usuario_id', user.id).order('data', { ascending: false })
    setItens(data ?? []); setLoading(false)
  }, [supabase])

  useEffect(() => { carregar() }, [carregar])

  const receitas = itens.filter(i => i.tipo === 'receita').reduce((s, i) => s + Number(i.valor), 0)
  const despesas = itens.filter(i => i.tipo === 'despesa').reduce((s, i) => s + Number(i.valor), 0)
  const saldo    = receitas - despesas

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setSalvando(true); setErro('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSalvando(false); return }
    const { error } = await supabase.from('financeiro').insert({
      usuario_id: user.id, descricao: form.descricao,
      valor: parseFloat(form.valor), tipo: form.tipo, categoria: form.categoria, data: form.data,
    })
    if (error) { setErro(error.message); setSalvando(false); return }
    setModal(false); setForm(EMPTY); await carregar(); setSalvando(false)
  }

  async function deletar(id: string) {
    if (!confirm('Excluir este lançamento?')) return
    await supabase.from('financeiro').delete().eq('id', id); await carregar()
  }

  // Simple CSS bar chart data
  const meses: Record<string, { r: number; d: number }> = {}
  itens.forEach(i => {
    const m = i.data.slice(0, 7)
    if (!meses[m]) meses[m] = { r: 0, d: 0 }
    if (i.tipo === 'receita') meses[m].r += Number(i.valor)
    else meses[m].d += Number(i.valor)
  })
  const mesesArr = Object.entries(meses).sort(([a],[b]) => a.localeCompare(b)).slice(-6)
  const maxVal   = Math.max(...mesesArr.flatMap(([,v]) => [v.r, v.d]), 1)

  return (
    <div className="page-content" style={{ maxWidth: '100%' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:28, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 className="page-title">Financeiro</h1>
          <p className="page-subtitle">Controle de receitas e despesas do escritório</p>
        </div>
        <button className="btn-primary" onClick={() => setModal(true)}>
          <i className="bi bi-plus-lg" /> Novo Lançamento
        </button>
      </div>

      {/* Cards de resumo */}
      <div className="fin-summary-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:24 }}>
        {[
          { label:'Receitas', valor:receitas, icon:'bi-graph-up-arrow', color:'#2d6a4f', bg:'#e8f5ee' },
          { label:'Despesas', valor:despesas, icon:'bi-graph-down-arrow', color:'#c0392b', bg:'#fdecea' },
          { label:'Saldo',    valor:saldo,    icon:'bi-wallet2', color: saldo >= 0 ? '#2d6a4f' : '#c0392b', bg: saldo >= 0 ? '#e8f5ee' : '#fdecea' },
        ].map(c => (
          <div key={c.label} className="section-card" style={{ padding:'18px 20px' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
              <span style={{ fontSize:13, color:'var(--text-secondary)', fontWeight:500 }}>{c.label}</span>
              <span style={{ width:32, height:32, borderRadius:8, background:c.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <i className={`bi ${c.icon}`} style={{ color:c.color, fontSize:15 }} />
              </span>
            </div>
            <div style={{ fontSize:22, fontWeight:700, color:c.color, fontVariantNumeric:'tabular-nums' }}>{fmt(c.valor)}</div>
          </div>
        ))}
      </div>

      {/* Gráfico de barras CSS */}
      {mesesArr.length > 0 && (
        <div className="section-card" style={{ marginBottom:24, padding:'20px 24px' }}>
          <div style={{ fontSize:13, fontWeight:600, color:'var(--text-secondary)', marginBottom:16, textTransform:'uppercase', letterSpacing:'0.06em' }}>Histórico Mensal</div>
          <div style={{ display:'flex', alignItems:'flex-end', gap:12, height:100 }}>
            {mesesArr.map(([mes, val]) => {
              const [y, m] = mes.split('-')
              const rH = Math.round((val.r / maxVal) * 90)
              const dH = Math.round((val.d / maxVal) * 90)
              return (
                <div key={mes} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                  <div style={{ display:'flex', alignItems:'flex-end', gap:3, height:90 }}>
                    <div title={`Receitas: ${fmt(val.r)}`} style={{ width:14, height:rH, background:'#2d6a4f', borderRadius:'3px 3px 0 0', transition:'height 0.3s' }} />
                    <div title={`Despesas: ${fmt(val.d)}`} style={{ width:14, height:dH, background:'#c0392b', borderRadius:'3px 3px 0 0', transition:'height 0.3s', opacity:0.8 }} />
                  </div>
                  <span style={{ fontSize:10, color:'var(--text-muted)', fontVariantNumeric:'tabular-nums' }}>{m}/{y.slice(2)}</span>
                </div>
              )
            })}
          </div>
          <div style={{ display:'flex', gap:16, marginTop:10 }}>
            <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'var(--text-secondary)' }}>
              <span style={{ width:10, height:10, background:'#2d6a4f', borderRadius:2, display:'inline-block' }} /> Receitas
            </span>
            <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'var(--text-secondary)' }}>
              <span style={{ width:10, height:10, background:'#c0392b', borderRadius:2, display:'inline-block', opacity:0.8 }} /> Despesas
            </span>
          </div>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div style={{ textAlign:'center', padding:'60px 0', color:'var(--text-muted)' }}>
          <i className="bi bi-hourglass-split" style={{ fontSize:28, display:'block', marginBottom:8 }} />
          Carregando...
        </div>
      ) : itens.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 0', color:'var(--text-muted)' }}>
          <i className="bi bi-wallet2" style={{ fontSize:36, display:'block', marginBottom:12, opacity:0.4 }} />
          <div style={{ fontWeight:600, marginBottom:6 }}>Nenhum lançamento registrado</div>
          <button className="btn-ghost" style={{ fontSize:13, padding:'8px 16px' }} onClick={() => setModal(true)}>
            Adicionar primeiro lançamento
          </button>
        </div>
      ) : (
        <div className="section-card" style={{ padding:0, overflow:'hidden' }}>
          <div style={{ overflowX:'auto', WebkitOverflowScrolling:'touch' } as React.CSSProperties}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13, minWidth:520 }}>
            <thead>
              <tr style={{ borderBottom:'1px solid var(--border)' }}>
                {['Data','Descrição','Categoria','Tipo','Valor',''].map(h => (
                  <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:11, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {itens.map(item => (
                <tr key={item.id} style={{ borderBottom:'1px solid var(--border)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background='var(--hover)'}
                  onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background=''}
                >
                  <td style={{ padding:'11px 14px', color:'var(--text-secondary)', fontVariantNumeric:'tabular-nums' }}>{fmtData(item.data)}</td>
                  <td style={{ padding:'11px 14px', color:'var(--text-primary)', fontWeight:500 }}>
                    <span style={{ display:'flex', alignItems:'center', gap:7 }}>
                      <i className={`bi ${CAT_ICON[item.categoria] ?? 'bi-three-dots'}`} style={{ fontSize:13, color:'var(--text-muted)' }} />
                      {item.descricao}
                    </span>
                  </td>
                  <td style={{ padding:'11px 14px' }}>
                    <span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:20, background:'var(--hover)', color:'var(--text-secondary)' }}>
                      {item.categoria}
                    </span>
                  </td>
                  <td style={{ padding:'11px 14px' }}>
                    <span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:20,
                      background: item.tipo === 'receita' ? '#e8f5ee' : '#fdecea',
                      color:      item.tipo === 'receita' ? '#2d6a4f' : '#c0392b' }}>
                      {item.tipo}
                    </span>
                  </td>
                  <td style={{ padding:'11px 14px', fontWeight:700, fontVariantNumeric:'tabular-nums',
                    color: item.tipo === 'receita' ? '#2d6a4f' : '#c0392b' }}>
                    {item.tipo === 'despesa' ? '− ' : '+ '}{fmt(Number(item.valor))}
                  </td>
                  <td style={{ padding:'11px 14px' }}>
                    <button onClick={() => deletar(item.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:13, padding:'4px 6px', borderRadius:6 }}
                      onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color='var(--danger)'}
                      onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color='var(--text-muted)'}>
                      <i className="bi bi-trash3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">Novo Lançamento</span>
              <button className="modal-close" onClick={() => setModal(false)}><i className="bi bi-x" /></button>
            </div>
            <form onSubmit={salvar}>
              <div className="modal-body">
                {erro && <div style={{ padding:'10px 14px', borderRadius:8, background:'var(--danger-light)', color:'var(--danger)', fontSize:13 }}>{erro}</div>}
                <div>
                  <label className="form-label">Descrição *</label>
                  <input type="text" value={form.descricao} onChange={e => setForm(f => ({...f, descricao:e.target.value}))}
                    placeholder="Ex: Honorários — João Silva" className="form-input" required />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                  <div>
                    <label className="form-label">Valor (R$) *</label>
                    <input type="number" step="0.01" min="0" value={form.valor}
                      onChange={e => setForm(f => ({...f, valor:e.target.value}))}
                      placeholder="0,00" className="form-input" required />
                  </div>
                  <div>
                    <label className="form-label">Data *</label>
                    <input type="date" value={form.data} onChange={e => setForm(f => ({...f, data:e.target.value}))} className="form-input" required />
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                  <div>
                    <label className="form-label">Tipo</label>
                    <select value={form.tipo} onChange={e => setForm(f => ({...f, tipo:e.target.value}))} className="form-input">
                      <option value="receita">Receita</option>
                      <option value="despesa">Despesa</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Categoria</label>
                    <select value={form.categoria} onChange={e => setForm(f => ({...f, categoria:e.target.value}))} className="form-input">
                      <option value="honorarios">Honorários</option>
                      <option value="mensalidade">Mensalidade</option>
                      <option value="livro">Livro</option>
                      <option value="material">Material</option>
                      <option value="aluguel">Aluguel</option>
                      <option value="salario">Salário</option>
                      <option value="imposto">Imposto</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-ghost" style={{ flex:1 }} onClick={() => setModal(false)}>Cancelar</button>
                  <button type="submit" disabled={salvando} className="btn-primary" style={{ flex:1, justifyContent:'center' }}>
                    {salvando ? 'Salvando...' : <><i className="bi bi-check2" /> Salvar</>}
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

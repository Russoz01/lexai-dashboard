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

interface InvestmentSuggestion {
  nome: string
  descricao: string
  rendimento: string
  risco: 'Baixo' | 'Medio' | 'Alto'
  tempo: string
}

function getInvestmentSuggestions(saldo: number): InvestmentSuggestion[] {
  if (saldo < 500) {
    return [
      {
        nome: 'Reserva de Emergencia — Tesouro Selic',
        descricao: 'Comece construindo sua reserva de emergencia com liquidez diaria. Ideal para quem esta iniciando.',
        rendimento: '~10,5% a.a.',
        risco: 'Baixo',
        tempo: 'Liquidez diaria',
      },
      {
        nome: 'Poupanca Digital',
        descricao: 'Alternativa simples e acessivel enquanto voce junta mais capital para investir.',
        rendimento: '~6,5% a.a.',
        risco: 'Baixo',
        tempo: 'Liquidez diaria',
      },
      {
        nome: 'Conta Remunerada (Nubank, Inter)',
        descricao: 'Rendimento automatico ate mesmo com pouco dinheiro, sem taxas.',
        rendimento: '~100% CDI',
        risco: 'Baixo',
        tempo: 'Liquidez diaria',
      },
      {
        nome: 'Educacao Financeira',
        descricao: 'Antes de investir mais, invista em conhecimento: livros e cursos gratuitos sobre financas.',
        rendimento: 'Incalculavel',
        risco: 'Baixo',
        tempo: 'Contínuo',
      },
    ]
  }
  if (saldo <= 5000) {
    return [
      {
        nome: 'CDB 110% CDI (Banco Inter)',
        descricao: 'Rende mais que a poupanca e possui garantia do FGC ate R$ 250 mil. Ideal para iniciantes.',
        rendimento: '~11,5% a.a.',
        risco: 'Baixo',
        tempo: '6 a 12 meses',
      },
      {
        nome: 'Tesouro Selic',
        descricao: 'Titulo publico federal com liquidez diaria. O investimento mais seguro do Brasil.',
        rendimento: '~10,5% a.a.',
        risco: 'Baixo',
        tempo: 'Liquidez diaria',
      },
      {
        nome: 'LCI/LCA',
        descricao: 'Isentas de Imposto de Renda, com garantia do FGC. Excelente para medio prazo.',
        rendimento: '~95% CDI liquido',
        risco: 'Baixo',
        tempo: '1 a 2 anos',
      },
      {
        nome: 'Fundos DI',
        descricao: 'Diversificacao automatica com taxa de administracao baixa. Boa porta de entrada.',
        rendimento: '~95% CDI',
        risco: 'Baixo',
        tempo: '6+ meses',
      },
    ]
  }
  if (saldo <= 20000) {
    return [
      {
        nome: 'Tesouro IPCA+ 2029',
        descricao: 'Protege seu dinheiro da inflacao com rentabilidade real garantida ate o vencimento.',
        rendimento: 'IPCA + 6,0% a.a.',
        risco: 'Baixo',
        tempo: '4 a 5 anos',
      },
      {
        nome: 'CDB Prefixado 13% a.a.',
        descricao: 'Trava uma taxa alta antes de possiveis cortes da Selic. Com garantia do FGC.',
        rendimento: '~13,0% a.a.',
        risco: 'Baixo',
        tempo: '2 a 3 anos',
      },
      {
        nome: 'Fundos Imobiliarios (HGLG11)',
        descricao: 'Renda mensal isenta de IR via dividendos. Diversificacao em imoveis corporativos.',
        rendimento: '~9% a.a. + valorizacao',
        risco: 'Medio',
        tempo: '2+ anos',
      },
      {
        nome: 'ETF BOVA11',
        descricao: 'Exposicao diversificada ao Ibovespa com baixo custo. Ideal para comecar em acoes.',
        rendimento: 'Variavel (~12% a.a. hist.)',
        risco: 'Medio',
        tempo: '5+ anos',
      },
    ]
  }
  return [
    {
      nome: 'Carteira Diversificada Equilibrada',
      descricao: '50% Tesouro IPCA+ para protecao, 30% ETF IVVB11 para exposicao global e 20% FIIs (HGLG11, KNRI11) para renda passiva.',
      rendimento: '~11% a.a. estimado',
      risco: 'Medio',
      tempo: '5+ anos',
    },
    {
      nome: 'ETF IVVB11 (S&P 500)',
      descricao: 'Exposicao dolarizada as 500 maiores empresas americanas. Protecao cambial e diversificacao internacional.',
      rendimento: '~10% a.a. hist.',
      risco: 'Medio',
      tempo: '5+ anos',
    },
    {
      nome: 'FIIs de Tijolo (KNRI11, HGLG11)',
      descricao: 'Portfolio de imoveis corporativos premium com distribuicao mensal de dividendos isentos de IR.',
      rendimento: '~8-9% a.a. + valorizacao',
      risco: 'Medio',
      tempo: '3+ anos',
    },
    {
      nome: 'Previdencia Privada PGBL',
      descricao: 'Beneficio fiscal de ate 12% da renda bruta anual. Ideal para quem faz declaracao completa do IR.',
      rendimento: '~10% a.a.',
      risco: 'Baixo',
      tempo: '10+ anos',
    },
  ]
}

function getCheaperAlternative(descricao: string, valor: number): { alt: string; economia: number } | null {
  const d = descricao.toLowerCase()
  if ((d.includes('café') || d.includes('cafe')) && valor > 30) {
    return { alt: 'Cafe solavel Melitta 200g', economia: valor * 0.6 }
  }
  if ((d.includes('almoco') || d.includes('almoço') || d.includes('jantar') || d.includes('comida')) && valor > 40) {
    return { alt: 'Marmita caseira (preparada em casa)', economia: valor * 0.5 }
  }
  if ((d.includes('uber') || d.includes('taxi') || d.includes('táxi') || d.includes('99')) && valor > 20) {
    return { alt: 'Transporte publico ou bike', economia: valor * 0.7 }
  }
  if (d.includes('livro') && valor > 50) {
    return { alt: 'Biblioteca publica ou e-book', economia: valor * 0.8 }
  }
  if ((d.includes('internet') || d.includes('celular')) && valor > 80) {
    return { alt: 'Plano pre-pago com mais dados', economia: valor * 0.3 }
  }
  if (valor > 100) {
    return { alt: 'Buscar desconto por app ou cashback', economia: valor * 0.15 }
  }
  return null
}

function riscoColor(risco: 'Baixo' | 'Medio' | 'Alto') {
  if (risco === 'Baixo') return { bg: '#e8f5ee', color: '#2d6a4f' }
  if (risco === 'Medio') return { bg: '#fff3cd', color: '#856404' }
  return { bg: '#fdecea', color: '#c0392b' }
}

function defaultDateFrom() {
  const d = new Date()
  d.setDate(d.getDate() - 30)
  return d.toISOString().slice(0, 10)
}

export default function FinanceiroPage() {
  const supabase = createClient()
  const [itens, setItens]       = useState<Lancamento[]>([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro]         = useState('')
  const [form, setForm]         = useState(EMPTY)

  // Belvo import modal state
  const [importModal, setImportModal]       = useState(false)
  const [belvoConfigured, setBelvoConfigured] = useState<boolean | null>(null)
  const [importLinkId, setImportLinkId]     = useState('')
  const [importDateFrom, setImportDateFrom] = useState(defaultDateFrom())
  const [importing, setImporting]           = useState(false)
  const [importMsg, setImportMsg]           = useState<{ tipo: 'ok' | 'err' | 'info'; texto: string } | null>(null)

  const carregar = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data, error } = await supabase
        .from('financeiro')
        .select('*')
        .eq('usuario_id', user.id)
        .order('data', { ascending: false })
        .limit(500) // Pagination — server-side
      if (error) {
        setErro('Nao foi possivel carregar lancamentos. Tente recarregar a pagina.')
        setLoading(false)
        return
      }
      setItens(data ?? [])
      setLoading(false)
    } catch {
      setErro('Erro ao conectar com o banco. Verifique sua conexao.')
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => { carregar() }, [carregar])

  const receitas = itens.filter(i => i.tipo === 'receita').reduce((s, i) => s + Number(i.valor), 0)
  const despesas = itens.filter(i => i.tipo === 'despesa').reduce((s, i) => s + Number(i.valor), 0)
  const saldo    = receitas - despesas

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setSalvando(true); setErro('')

    // Validate descricao
    if (!form.descricao.trim() || form.descricao.length > 200) {
      setErro('Descricao obrigatoria (1-200 caracteres).')
      setSalvando(false)
      return
    }

    // Validate valor — was a real bug: NaN was inserted silently
    const valorNum = parseFloat(form.valor)
    if (isNaN(valorNum) || valorNum <= 0 || valorNum > 999999999) {
      setErro('Informe um valor numerico valido maior que zero.')
      setSalvando(false)
      return
    }

    // Validate data
    if (!form.data || isNaN(new Date(form.data).getTime())) {
      setErro('Data invalida.')
      setSalvando(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setErro('Sessao expirada. Faca login novamente.')
      setSalvando(false)
      return
    }

    const { error } = await supabase.from('financeiro').insert({
      usuario_id: user.id,
      descricao: form.descricao.trim(),
      valor: valorNum,
      tipo: form.tipo,
      categoria: form.categoria,
      data: form.data,
    })

    if (error) {
      setErro(error.message || 'Nao foi possivel salvar o lancamento.')
      setSalvando(false)
      return
    }

    setModal(false)
    setForm(EMPTY)
    await carregar()
    setSalvando(false)
  }

  async function deletar(id: string) {
    if (!confirm('Excluir este lançamento?')) return
    await supabase.from('financeiro').delete().eq('id', id); await carregar()
  }

  async function abrirImportModal() {
    setImportModal(true)
    setImportMsg(null)
    if (belvoConfigured === null) {
      try {
        const res = await fetch('/api/financeiro/import', { method: 'GET' })
        const data = await res.json().catch(() => ({ configured: false }))
        setBelvoConfigured(!!data.configured)
      } catch {
        setBelvoConfigured(false)
      }
    }
  }

  async function importarBelvo(e: React.FormEvent) {
    e.preventDefault()
    if (!importLinkId.trim()) {
      setImportMsg({ tipo: 'err', texto: 'Informe o Link ID do Belvo.' })
      return
    }
    setImporting(true)
    setImportMsg(null)
    try {
      const res = await fetch('/api/financeiro/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkId: importLinkId.trim(), dateFrom: importDateFrom || undefined }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.status === 503) {
        setImportMsg({
          tipo: 'info',
          texto: data?.error || 'Belvo nao configurado. Contate o admin para ativar esta feature.',
        })
        setBelvoConfigured(false)
      } else if (!res.ok) {
        setImportMsg({ tipo: 'err', texto: data?.error || 'Falha ao importar transacoes.' })
      } else {
        const imported = Number(data?.imported ?? 0)
        setImportMsg({ tipo: 'ok', texto: `${imported} transacoes importadas com sucesso.` })
        await carregar()
      }
    } catch (err) {
      setImportMsg({ tipo: 'err', texto: err instanceof Error ? err.message : 'Erro desconhecido' })
    } finally {
      setImporting(false)
    }
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
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          <button className="btn-ghost" onClick={abrirImportModal} type="button">
            <i className="bi bi-bank" /> Importar do banco
          </button>
          <button className="btn-primary" onClick={() => setModal(true)}>
            <i className="bi bi-plus-lg" /> Novo Lançamento
          </button>
        </div>
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

      {/* Sugestoes de Investimento */}
      <div className="section-card" style={{ marginBottom:24, padding:'20px 24px' }}>
        <div style={{ fontSize:13, fontWeight:600, color:'var(--text-secondary)', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Sugestoes de Investimento</div>
        <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:16 }}>
          Baseadas no seu saldo atual de <strong style={{ color:'var(--text-primary)' }}>{fmt(saldo)}</strong>
        </div>
        <div className="fin-invest-grid" style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:12 }}>
          {getInvestmentSuggestions(saldo).map((inv, idx) => {
            const risco = riscoColor(inv.risco)
            return (
              <div key={idx} style={{
                padding:'14px 16px',
                borderRadius:10,
                border:'1px solid var(--border)',
                background:'var(--accent-light)',
                display:'flex',
                flexDirection:'column',
                gap:8,
              }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10 }}>
                  <div style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)', lineHeight:1.3 }}>{inv.nome}</div>
                  <span style={{
                    fontSize:10,
                    fontWeight:700,
                    padding:'3px 9px',
                    borderRadius:20,
                    background:risco.bg,
                    color:risco.color,
                    textTransform:'uppercase',
                    letterSpacing:'0.04em',
                    whiteSpace:'nowrap',
                    flexShrink:0,
                  }}>
                    {inv.risco}
                  </span>
                </div>
                <div style={{ fontSize:12, color:'var(--text-secondary)', lineHeight:1.45 }}>{inv.descricao}</div>
                <div style={{ display:'flex', gap:14, marginTop:2, fontSize:11, color:'var(--text-muted)' }}>
                  <span style={{ display:'flex', alignItems:'center', gap:4 }}>
                    <i className="bi bi-graph-up" /> <strong style={{ color:'#2d6a4f' }}>{inv.rendimento}</strong>
                  </span>
                  <span style={{ display:'flex', alignItems:'center', gap:4 }}>
                    <i className="bi bi-clock" /> {inv.tempo}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ fontSize:10, color:'var(--text-muted)', marginTop:14, fontStyle:'italic', lineHeight:1.4 }}>
          <i className="bi bi-info-circle" style={{ marginRight:5 }} />
          Aviso: sugestoes educacionais, nao aconselhamento financeiro. Consulte um profissional certificado antes de investir.
        </div>
      </div>

      {/* Alternativas Mais Baratas */}
      {(() => {
        const despesasList = itens.filter(i => i.tipo === 'despesa').slice(0, 5)
        const alternativas = despesasList
          .map(item => ({ item, alt: getCheaperAlternative(item.descricao, Number(item.valor)) }))
          .filter((x): x is { item: Lancamento; alt: { alt: string; economia: number } } => x.alt !== null)
        const totalEconomia = alternativas.reduce((s, a) => s + a.alt.economia, 0)

        return (
          <div className="section-card" style={{ marginBottom:24, padding:'20px 24px' }}>
            <div style={{ fontSize:13, fontWeight:600, color:'var(--text-secondary)', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Alternativas Mais Baratas</div>
            <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:16 }}>
              Sugestoes inteligentes para reduzir suas despesas recentes
            </div>

            {despesasList.length === 0 ? (
              <div style={{ textAlign:'center', padding:'20px 0', color:'var(--text-muted)', fontSize:13 }}>
                <i className="bi bi-lightbulb" style={{ fontSize:22, display:'block', marginBottom:8, opacity:0.5 }} />
                Nenhuma despesa registrada ainda. Adicione lancamentos para ver sugestoes.
              </div>
            ) : alternativas.length === 0 ? (
              <div style={{ textAlign:'center', padding:'20px 0', color:'var(--text-muted)', fontSize:13 }}>
                <i className="bi bi-check-circle" style={{ fontSize:22, display:'block', marginBottom:8, opacity:0.5 }} />
                Suas despesas recentes ja parecem otimizadas. Continue assim!
              </div>
            ) : (
              <>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {alternativas.map(({ item, alt }) => (
                    <div key={item.id} style={{
                      padding:'12px 14px',
                      borderRadius:10,
                      border:'1px solid var(--border)',
                      background:'var(--accent-light)',
                      display:'flex',
                      flexWrap:'wrap',
                      alignItems:'center',
                      gap:12,
                    }}>
                      <div style={{ flex:'1 1 200px', minWidth:0 }}>
                        <div style={{ fontSize:12, color:'var(--text-muted)', textDecoration:'line-through', marginBottom:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {item.descricao} — {fmt(Number(item.valor))}
                        </div>
                        <div style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', display:'flex', alignItems:'center', gap:6 }}>
                          <i className="bi bi-arrow-right-circle" style={{ color:'#2d6a4f' }} />
                          {alt.alt}
                        </div>
                      </div>
                      <div style={{
                        padding:'6px 12px',
                        borderRadius:8,
                        background:'#e8f5ee',
                        color:'#2d6a4f',
                        fontSize:12,
                        fontWeight:700,
                        whiteSpace:'nowrap',
                        fontVariantNumeric:'tabular-nums',
                      }}>
                        Economia: {fmt(alt.economia)}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{
                  marginTop:14,
                  padding:'12px 16px',
                  borderRadius:10,
                  background:'#e8f5ee',
                  border:'1px solid #2d6a4f20',
                  display:'flex',
                  justifyContent:'space-between',
                  alignItems:'center',
                  flexWrap:'wrap',
                  gap:8,
                }}>
                  <span style={{ fontSize:12, fontWeight:600, color:'#2d6a4f', display:'flex', alignItems:'center', gap:6 }}>
                    <i className="bi bi-piggy-bank" />
                    Economia potencial mensal
                  </span>
                  <strong style={{ fontSize:16, color:'#2d6a4f', fontVariantNumeric:'tabular-nums' }}>{fmt(totalEconomia)}</strong>
                </div>
              </>
            )}
          </div>
        )
      })()}

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

      {/* Belvo import modal */}
      {importModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setImportModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">Importar do banco (Belvo)</span>
              <button className="modal-close" onClick={() => setImportModal(false)}><i className="bi bi-x" /></button>
            </div>
            <form onSubmit={importarBelvo}>
              <div className="modal-body">
                {belvoConfigured === false && (
                  <div style={{ padding:'12px 14px', borderRadius:8, background:'var(--accent-light)', color:'var(--text-secondary)', fontSize:13, lineHeight:1.5 }}>
                    <i className="bi bi-info-circle" style={{ marginRight:6 }} />
                    Esta feature requer configuracao do Belvo. Contate o admin para ativar.
                    <div style={{ marginTop:6, fontSize:12, color:'var(--text-muted)' }}>
                      <a href="https://belvo.com/docs" target="_blank" rel="noopener noreferrer" style={{ color:'var(--accent)' }}>
                        Documentacao Belvo <i className="bi bi-box-arrow-up-right" style={{ fontSize:10 }} />
                      </a>
                    </div>
                  </div>
                )}
                {importMsg && (
                  <div style={{
                    padding:'10px 14px', borderRadius:8, fontSize:13,
                    background: importMsg.tipo === 'ok' ? '#e8f5ee' : importMsg.tipo === 'info' ? 'var(--accent-light)' : 'var(--danger-light)',
                    color: importMsg.tipo === 'ok' ? '#2d6a4f' : importMsg.tipo === 'info' ? 'var(--text-secondary)' : 'var(--danger)',
                  }}>
                    {importMsg.texto}
                  </div>
                )}
                <div>
                  <label className="form-label">Belvo Link ID *</label>
                  <input
                    type="text"
                    value={importLinkId}
                    onChange={e => setImportLinkId(e.target.value)}
                    placeholder="ex: 12345678-abcd-..."
                    className="form-input"
                    disabled={importing || belvoConfigured === false}
                  />
                </div>
                <div>
                  <label className="form-label">Data inicial</label>
                  <input
                    type="date"
                    value={importDateFrom}
                    onChange={e => setImportDateFrom(e.target.value)}
                    className="form-input"
                    disabled={importing || belvoConfigured === false}
                  />
                  <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:4 }}>
                    Padrao: ultimos 30 dias
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-ghost" style={{ flex:1 }} onClick={() => setImportModal(false)}>
                    Fechar
                  </button>
                  <button
                    type="submit"
                    disabled={importing || belvoConfigured === false}
                    className="btn-primary"
                    style={{ flex:1, justifyContent:'center' }}
                  >
                    {importing ? 'Importando...' : <><i className="bi bi-download" /> Importar</>}
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

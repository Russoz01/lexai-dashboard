'use client'

import { useEffect, useState, useCallback } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  Landmark,
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  PieChart,
  Clock,
  Info,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  PiggyBank,
  Hourglass,
  AlertTriangle,
  RotateCcw,
  Trash2,
  X,
  Check,
  Download,
  ExternalLink,
  Briefcase,
  GraduationCap,
  BookOpen,
  Pencil,
  Building2,
  BadgeCheck,
  MoreHorizontal,
  type LucideIcon,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { resolveUsuarioId } from '@/lib/usuario'
import { confirmDialog } from '@/components/ConfirmDialog'

interface Lancamento {
  id: string
  descricao: string
  valor: number
  tipo: string
  categoria: string
  data: string
  recorrente?: boolean
  recorrencia_freq?: string | null
  recorrencia_parent?: string | null
  recorrencia_fim?: string | null
}

const CAT_ICON: Record<string, LucideIcon> = {
  honorarios: Briefcase,
  mensalidade: GraduationCap,
  livro: BookOpen,
  material: Pencil,
  aluguel: Building2,
  salario: BadgeCheck,
  imposto: Landmark,
  outro: MoreHorizontal,
}

// Factory ao inves de const — antes `data: new Date().toISOString()` calculava
// uma vez no module load. Usuario que ficava 8h no painel e abria modal via
// reset(EMPTY) recebia data do inicio da sessao, nao do dia atual.
function emptyForm() {
  return {
    descricao: '',
    valor: '',
    tipo: 'receita',
    categoria: 'honorarios',
    data: new Date().toISOString().split('T')[0],
    recorrente: false,
    recorrencia_freq: 'mensal',
    recorrencia_fim: '',
  }
}
const EMPTY = emptyForm()

// Helper: compute next occurrence date from a frequency and starting date
function proximaData(data: string, freq: string): string {
  const d = new Date(data + 'T00:00:00')
  switch (freq) {
    case 'semanal': d.setDate(d.getDate() + 7); break
    case 'quinzenal': d.setDate(d.getDate() + 14); break
    case 'mensal': d.setMonth(d.getMonth() + 1); break
    case 'bimestral': d.setMonth(d.getMonth() + 2); break
    case 'trimestral': d.setMonth(d.getMonth() + 3); break
    case 'anual': d.setFullYear(d.getFullYear() + 1); break
  }
  return d.toISOString().split('T')[0]
}

// Generate missing recurring child entries up to today (returns number created)
async function gerarRecorrenciasPendentes(
  supabase: SupabaseClient,
  usuarioId: string,
  itens: Lancamento[],
): Promise<number> {
  const hoje = new Date().toISOString().split('T')[0]
  const recorrentes = itens.filter(i => i.recorrente && i.recorrencia_freq)
  let criados = 0

  for (const parent of recorrentes) {
    const existingChildren = itens
      .filter(i => i.recorrencia_parent === parent.id)
      .sort((a, b) => b.data.localeCompare(a.data))
    const lastDate = existingChildren[0]?.data || parent.data
    let nextDate = proximaData(lastDate, parent.recorrencia_freq!)

    while (nextDate <= hoje) {
      if (parent.recorrencia_fim && nextDate > parent.recorrencia_fim) break

      const { error } = await supabase.from('financeiro').insert({
        usuario_id: usuarioId,
        descricao: parent.descricao,
        valor: parent.valor,
        tipo: parent.tipo,
        categoria: parent.categoria,
        data: nextDate,
        recorrente: false,
        recorrencia_parent: parent.id,
      })
      if (error) break
      criados++
      nextDate = proximaData(nextDate, parent.recorrencia_freq!)
    }
  }

  return criados
}

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
        nome: 'Reserva de Emergência — Tesouro Selic',
        descricao: 'Comece construindo sua reserva de emergência com liquidez diária. Ideal para quem está iniciando.',
        rendimento: '~10,5% a.a.',
        risco: 'Baixo',
        tempo: 'Liquidez diária',
      },
      {
        nome: 'Poupança Digital',
        descricao: 'Alternativa simples e acessível enquanto você junta mais capital para investir.',
        rendimento: '~6,5% a.a.',
        risco: 'Baixo',
        tempo: 'Liquidez diária',
      },
      {
        nome: 'Conta Remunerada (Nubank, Inter)',
        descricao: 'Rendimento automático até mesmo com pouco dinheiro, sem taxas.',
        rendimento: '~100% CDI',
        risco: 'Baixo',
        tempo: 'Liquidez diária',
      },
      {
        nome: 'Educação Financeira',
        descricao: 'Antes de investir mais, invista em conhecimento: livros e cursos gratuitos sobre finanças.',
        rendimento: 'Incalculável',
        risco: 'Baixo',
        tempo: 'Contínuo',
      },
    ]
  }
  if (saldo <= 5000) {
    return [
      {
        nome: 'CDB 110% CDI (Banco Inter)',
        descricao: 'Rende mais que a poupança e possui garantia do FGC até R$ 250 mil. Ideal para iniciantes.',
        rendimento: '~11,5% a.a.',
        risco: 'Baixo',
        tempo: '6 a 12 meses',
      },
      {
        nome: 'Tesouro Selic',
        descricao: 'Título público federal com liquidez diária. O investimento mais seguro do Brasil.',
        rendimento: '~10,5% a.a.',
        risco: 'Baixo',
        tempo: 'Liquidez diária',
      },
      {
        nome: 'LCI/LCA',
        descricao: 'Isentas de Imposto de Renda, com garantia do FGC. Excelente para médio prazo.',
        rendimento: '~95% CDI líquido',
        risco: 'Baixo',
        tempo: '1 a 2 anos',
      },
      {
        nome: 'Fundos DI',
        descricao: 'Diversificação automática com taxa de administração baixa. Boa porta de entrada.',
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
        descricao: 'Protege seu dinheiro da inflação com rentabilidade real garantida até o vencimento.',
        rendimento: 'IPCA + 6,0% a.a.',
        risco: 'Baixo',
        tempo: '4 a 5 anos',
      },
      {
        nome: 'CDB Prefixado 13% a.a.',
        descricao: 'Trava uma taxa alta antes de possíveis cortes da Selic. Com garantia do FGC.',
        rendimento: '~13,0% a.a.',
        risco: 'Baixo',
        tempo: '2 a 3 anos',
      },
      {
        nome: 'Fundos Imobiliários (HGLG11)',
        descricao: 'Renda mensal isenta de IR via dividendos. Diversificação em imóveis corporativos.',
        rendimento: '~9% a.a. + valorização',
        risco: 'Medio',
        tempo: '2+ anos',
      },
      {
        nome: 'ETF BOVA11',
        descricao: 'Exposição diversificada ao Ibovespa com baixo custo. Ideal para começar em ações.',
        rendimento: 'Variável (~12% a.a. hist.)',
        risco: 'Medio',
        tempo: '5+ anos',
      },
    ]
  }
  return [
    {
      nome: 'Carteira Diversificada Equilibrada',
      descricao: '50% Tesouro IPCA+ para proteção, 30% ETF IVVB11 para exposição global e 20% FIIs (HGLG11, KNRI11) para renda passiva.',
      rendimento: '~11% a.a. estimado',
      risco: 'Medio',
      tempo: '5+ anos',
    },
    {
      nome: 'ETF IVVB11 (S&P 500)',
      descricao: 'Exposição dolarizada às 500 maiores empresas americanas. Proteção cambial e diversificação internacional.',
      rendimento: '~10% a.a. hist.',
      risco: 'Medio',
      tempo: '5+ anos',
    },
    {
      nome: 'FIIs de Tijolo (KNRI11, HGLG11)',
      descricao: 'Portfólio de imóveis corporativos premium com distribuição mensal de dividendos isentos de IR.',
      rendimento: '~8-9% a.a. + valorização',
      risco: 'Medio',
      tempo: '3+ anos',
    },
    {
      nome: 'Previdência Privada PGBL',
      descricao: 'Benefício fiscal de até 12% da renda bruta anual. Ideal para quem faz declaração completa do IR.',
      rendimento: '~10% a.a.',
      risco: 'Baixo',
      tempo: '10+ anos',
    },
  ]
}

function getCheaperAlternative(descricao: string, valor: number): { alt: string; economia: number } | null {
  const d = descricao.toLowerCase()
  if ((d.includes('café') || d.includes('cafe')) && valor > 30) {
    return { alt: 'Café solúvel Melitta 200g', economia: valor * 0.6 }
  }
  if ((d.includes('almoco') || d.includes('almoço') || d.includes('jantar') || d.includes('comida')) && valor > 40) {
    return { alt: 'Marmita caseira (preparada em casa)', economia: valor * 0.5 }
  }
  if ((d.includes('uber') || d.includes('taxi') || d.includes('táxi') || d.includes('99')) && valor > 20) {
    return { alt: 'Transporte público ou bike', economia: valor * 0.7 }
  }
  if (d.includes('livro') && valor > 50) {
    return { alt: 'Biblioteca pública ou e-book', economia: valor * 0.8 }
  }
  if ((d.includes('internet') || d.includes('celular')) && valor > 80) {
    return { alt: 'Plano pré-pago com mais dados', economia: valor * 0.3 }
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

  const carregar = useCallback(async (skipRecurringGen = false) => {
    try {
      const usuarioId = await resolveUsuarioId()
      if (!usuarioId) { setLoading(false); return }
      const { data, error } = await supabase
        .from('financeiro')
        .select('*')
        .eq('usuario_id', usuarioId)
        .order('data', { ascending: false })
        .limit(500) // Pagination — server-side
      if (error) {
        setErro('Não foi possível carregar lançamentos. Tente recarregar a página.')
        setLoading(false)
        return
      }
      const rows = (data ?? []) as Lancamento[]

      // Auto-generate pending recurring entries (only on initial load, to avoid loops)
      if (!skipRecurringGen) {
        const criados = await gerarRecorrenciasPendentes(supabase, usuarioId, rows)
        if (criados > 0) {
          // Re-fetch to pick up the newly created children; skip gen to avoid infinite loop
          await carregar(true)
          return
        }
      }

      setItens(rows)
      setLoading(false)
    } catch {
      setErro('Erro ao conectar com o banco. Verifique sua conexão.')
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
      setErro('Descrição obrigatória (1-200 caracteres).')
      setSalvando(false)
      return
    }

    // Validate valor — was a real bug: NaN was inserted silently
    const valorNum = parseFloat(form.valor)
    if (isNaN(valorNum) || valorNum <= 0 || valorNum > 999999999) {
      setErro('Informe um valor numérico válido maior que zero.')
      setSalvando(false)
      return
    }

    // Validate data
    if (!form.data || isNaN(new Date(form.data).getTime())) {
      setErro('Data inválida.')
      setSalvando(false)
      return
    }

    const usuarioId = await resolveUsuarioId()
    if (!usuarioId) {
      setErro('Sessão expirada. Faça login novamente.')
      setSalvando(false)
      return
    }

    const { error } = await supabase.from('financeiro').insert({
      usuario_id: usuarioId,
      descricao: form.descricao.trim(),
      valor: valorNum,
      tipo: form.tipo,
      categoria: form.categoria,
      data: form.data,
      recorrente: form.recorrente,
      recorrencia_freq: form.recorrente ? form.recorrencia_freq : null,
      recorrencia_fim: form.recorrente && form.recorrencia_fim ? form.recorrencia_fim : null,
    })

    if (error) {
      setErro(error.message || 'Não foi possível salvar o lançamento.')
      setSalvando(false)
      return
    }

    setModal(false)
    setForm(emptyForm())
    await carregar()
    setSalvando(false)
  }

  async function deletar(id: string) {
    const ok = await confirmDialog({
      title: 'Excluir este lançamento',
      description: 'O registro financeiro será removido da sua base. Essa ação não pode ser desfeita.',
      confirmLabel: 'Excluir',
      cancelLabel: 'Manter',
      variant: 'danger',
    })
    if (!ok) return
    // Antes nao checava erro — RLS ou network failure deletava 0 rows e o
    // carregar() refetch fazia o item "voltar" sem feedback ao usuario.
    const { error } = await supabase.from('financeiro').delete().eq('id', id)
    if (error) {
      const { toast } = await import('@/components/Toast')
      toast('error', 'Não foi possível excluir o lançamento. Tente de novo.')
      return
    }
    await carregar()
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
          texto: data?.error || 'Belvo não configurado. Contate o admin para ativar esta feature.',
        })
        setBelvoConfigured(false)
      } else if (!res.ok) {
        setImportMsg({ tipo: 'err', texto: data?.error || 'Falha ao importar transações.' })
      } else {
        const imported = Number(data?.imported ?? 0)
        setImportMsg({ tipo: 'ok', texto: `${imported} transações importadas com sucesso.` })
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
            <Landmark size={14} strokeWidth={1.75} aria-hidden /> Importar do banco
          </button>
          <button className="btn-primary" onClick={() => setModal(true)}>
            <Plus size={14} strokeWidth={1.75} aria-hidden /> Novo Lançamento
          </button>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="fin-summary-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:24 }}>
        {(() => {
          // Compute prev-month vs current-month delta for each bucket
          const now = new Date()
          const curMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
          const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1)
          const prevMonthKey = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`
          const curR = itens.filter(i => i.tipo === 'receita' && i.data.startsWith(curMonthKey)).reduce((s, i) => s + Number(i.valor), 0)
          const prevR = itens.filter(i => i.tipo === 'receita' && i.data.startsWith(prevMonthKey)).reduce((s, i) => s + Number(i.valor), 0)
          const curD = itens.filter(i => i.tipo === 'despesa' && i.data.startsWith(curMonthKey)).reduce((s, i) => s + Number(i.valor), 0)
          const prevD = itens.filter(i => i.tipo === 'despesa' && i.data.startsWith(prevMonthKey)).reduce((s, i) => s + Number(i.valor), 0)
          const curSaldo = curR - curD
          const prevSaldo = prevR - prevD
          const delta = (cur: number, prev: number): number | null => {
            if (prev === 0) return null
            return ((cur - prev) / Math.abs(prev)) * 100
          }
          const cards = [
            { label: 'Receitas', valor: receitas, Icon: TrendingUp, color: '#2d6a4f', bg: '#e8f5ee', delta: delta(curR, prevR), positiveIsGood: true },
            { label: 'Despesas', valor: despesas, Icon: TrendingDown, color: '#c0392b', bg: '#fdecea', delta: delta(curD, prevD), positiveIsGood: false },
            { label: 'Saldo', valor: saldo, Icon: Wallet, color: saldo >= 0 ? '#2d6a4f' : '#c0392b', bg: saldo >= 0 ? '#e8f5ee' : '#fdecea', delta: delta(curSaldo, prevSaldo), positiveIsGood: true },
          ]
          return cards.map(c => {
            const d = c.delta
            let deltaLabel = ''
            let deltaColor = 'var(--text-muted)'
            let deltaBg = 'var(--hover)'
            let DeltaIcon: LucideIcon = Minus
            if (d !== null) {
              const rounded = Math.round(d)
              const isUp = rounded > 0
              const isDown = rounded < 0
              deltaLabel = `${rounded > 0 ? '+' : ''}${rounded}%`
              DeltaIcon = isUp ? ArrowUpRight : isDown ? ArrowDownRight : Minus
              const isGood = (isUp && c.positiveIsGood) || (isDown && !c.positiveIsGood)
              const isBad = (isDown && c.positiveIsGood) || (isUp && !c.positiveIsGood)
              if (isGood) { deltaColor = '#2d6a4f'; deltaBg = '#e8f5ee' }
              else if (isBad) { deltaColor = '#c0392b'; deltaBg = '#fdecea' }
            }
            const CardIcon = c.Icon
            return (
              <div key={c.label} className="section-card" style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{c.label}</span>
                  <span style={{ width: 32, height: 32, borderRadius: 8, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CardIcon size={15} strokeWidth={1.75} aria-hidden style={{ color: c.color }} />
                  </span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: c.color, fontVariantNumeric: 'tabular-nums' }}>{fmt(c.valor)}</div>
                {d !== null && (
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 12, background: deltaBg, color: deltaColor }}>
                      <DeltaIcon size={10} strokeWidth={1.75} aria-hidden />
                      {deltaLabel}
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>vs mês anterior</span>
                  </div>
                )}
              </div>
            )
          })
        })()}
      </div>

      {/* Mini pie chart por categoria (CSS conic-gradient) */}
      {itens.length > 0 && (() => {
        // Aggregate despesas por categoria
        const byCat: Record<string, number> = {}
        itens.filter(i => i.tipo === 'despesa').forEach(i => {
          const k = i.categoria || 'outro'
          byCat[k] = (byCat[k] ?? 0) + Number(i.valor)
        })
        const entries = Object.entries(byCat).sort((a, b) => b[1] - a[1])
        const totalCat = entries.reduce((s, [, v]) => s + v, 0)
        if (totalCat === 0 || entries.length === 0) return null
        const CAT_COLORS: Record<string, string> = {
          honorarios: '#2d6a4f', mensalidade: '#4f46e5', livro: '#e67e22',
          material: '#0284c7', aluguel: '#c0392b', salario: '#22C55E',
          imposto: '#8B5CF6', outro: '#64748b',
        }
        let acc = 0
        const slices: string[] = []
        const legend: { cat: string; pct: number; color: string; value: number }[] = []
        entries.forEach(([cat, value]) => {
          const pct = (value / totalCat) * 100
          const from = acc
          const to = acc + pct
          const color = CAT_COLORS[cat] ?? '#64748b'
          slices.push(`${color} ${from}% ${to}%`)
          legend.push({ cat, pct, color, value })
          acc = to
        })
        const conic = `conic-gradient(${slices.join(', ')})`
        return (
          <div className="section-card" style={{ marginBottom: 24, padding: '20px 24px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <PieChart size={14} strokeWidth={1.75} aria-hidden />
              Despesas por Categoria
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: 140, height: 140, borderRadius: '50%',
                  background: conic,
                  boxShadow: 'inset 0 0 0 1px var(--border)',
                  transition: 'transform 0.3s ease',
                }} aria-hidden="true" />
                <div style={{
                  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                  width: 84, height: 84, borderRadius: '50%', background: 'var(--card-bg)',
                  boxShadow: 'inset 0 0 0 1px var(--border)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{fmt(totalCat)}</span>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 200, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 8 }}>
                {legend.map(l => (
                  <div key={l.cat} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: l.color, flexShrink: 0 }} />
                    <span style={{ flex: 1, color: 'var(--text-secondary)', textTransform: 'capitalize', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.cat}</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{l.pct.toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      })()}

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

      {/* Sugestões de Investimento */}
      <div className="section-card" style={{ marginBottom:24, padding:'20px 24px' }}>
        <div style={{ fontSize:13, fontWeight:600, color:'var(--text-secondary)', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Sugestões de Investimento</div>
        <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:16 }}>
          Baseadas no seu saldo atual de <strong style={{ color:'var(--text-primary)' }}>{fmt(saldo)}</strong>
        </div>
        <div className="fin-invest-grid" style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:12 }}>
          {getInvestmentSuggestions(saldo).map((inv, idx) => {
            const risco = riscoColor(inv.risco)
            return (
              <div key={idx} className="fin-invest-card" style={{
                padding:'14px 16px',
                borderRadius:10,
                border:'1px solid var(--border)',
                background:'var(--accent-light)',
                display:'flex',
                flexDirection:'column',
                gap:8,
                transition: 'transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease',
                cursor: 'default',
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
                    <TrendingUp size={12} strokeWidth={1.75} aria-hidden /> <strong style={{ color:'#2d6a4f' }}>{inv.rendimento}</strong>
                  </span>
                  <span style={{ display:'flex', alignItems:'center', gap:4 }}>
                    <Clock size={12} strokeWidth={1.75} aria-hidden /> {inv.tempo}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ fontSize:10, color:'var(--text-muted)', marginTop:14, fontStyle:'italic', lineHeight:1.4, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <Info size={10} strokeWidth={1.75} aria-hidden />
          Aviso: sugestões educacionais, não aconselhamento financeiro. Consulte um profissional certificado antes de investir.
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
              Sugestões inteligentes para reduzir suas despesas recentes
            </div>

            {despesasList.length === 0 ? (
              <div style={{ textAlign:'center', padding:'20px 0', color:'var(--text-muted)', fontSize:13 }}>
                <Lightbulb size={22} strokeWidth={1.75} aria-hidden style={{ display:'block', margin:'0 auto 8px', opacity:0.5 }} />
                O livro-caixa aguarda o primeiro lançamento. Depois dele as sugestões aparecem sozinhas.
              </div>
            ) : alternativas.length === 0 ? (
              <div style={{ textAlign:'center', padding:'20px 0', color:'var(--text-muted)', fontSize:13 }}>
                <CheckCircle2 size={22} strokeWidth={1.75} aria-hidden style={{ display:'block', margin:'0 auto 8px', opacity:0.5 }} />
                As despesas recentes parecem redondas. Nada a apontar por agora.
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
                          <ArrowRight size={14} strokeWidth={1.75} aria-hidden style={{ color:'#2d6a4f' }} />
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
                    <PiggyBank size={14} strokeWidth={1.75} aria-hidden />
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
          <Hourglass size={28} strokeWidth={1.75} aria-hidden style={{ display:'block', margin:'0 auto 8px' }} />
          Carregando...
        </div>
      ) : itens.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 0', color:'var(--text-muted)' }}>
          <Wallet size={36} strokeWidth={1.75} aria-hidden style={{ display:'block', margin:'0 auto 12px', opacity:0.4 }} />
          <div style={{ fontWeight:600, marginBottom:6 }}>O livro-caixa abre em branco</div>
          <button className="btn-ghost" style={{ fontSize:13, padding:'8px 16px' }} onClick={() => setModal(true)}>
            Registrar primeiro lançamento
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
              {itens.map(item => {
                const isBigExpense = item.tipo === 'despesa' && Number(item.valor) > 500
                const CatIcon = CAT_ICON[item.categoria] ?? MoreHorizontal
                return (
                <tr key={item.id} style={{
                  borderBottom:'1px solid var(--border)',
                  ...(isBigExpense ? { boxShadow: 'inset 3px 0 0 0 #e67e22' } : {}),
                }}
                  onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background='var(--hover)'}
                  onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background=''}
                >
                  <td style={{ padding:'11px 14px', color:'var(--text-secondary)', fontVariantNumeric:'tabular-nums' }}>{fmtData(item.data)}</td>
                  <td style={{ padding:'11px 14px', color:'var(--text-primary)', fontWeight:500 }}>
                    <span style={{ display:'flex', alignItems:'center', gap:7, flexWrap:'wrap' }}>
                      <CatIcon size={13} strokeWidth={1.75} aria-hidden style={{ color:'var(--text-muted)' }} />
                      {item.descricao}
                      {isBigExpense && <AlertTriangle size={11} strokeWidth={1.75} aria-hidden style={{ color: '#e67e22', marginLeft: 4 }} />}
                      {item.recorrente && (
                        <span title={`Recorrente ${item.recorrencia_freq ?? ''}`} style={{
                          fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10,
                          background: 'var(--accent-light)', color: 'var(--accent)', marginLeft: 8,
                          display: 'inline-flex', alignItems: 'center', gap: 3,
                        }}>
                          <RotateCcw size={10} strokeWidth={1.75} aria-hidden />Recorrente
                        </span>
                      )}
                      {item.recorrencia_parent && !item.recorrente && (
                        <span title="Gerado automaticamente a partir de um lançamento recorrente" style={{
                          fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 8,
                          background: 'var(--hover)', color: 'var(--text-muted)', marginLeft: 6,
                          textTransform: 'uppercase', letterSpacing: '0.04em',
                        }}>
                          auto
                        </span>
                      )}
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
                    <button type="button" onClick={() => deletar(item.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:13, padding:'4px 6px', borderRadius:6 }}
                      onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color='var(--danger)'}
                      onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color='var(--text-muted)'}>
                      <Trash2 size={13} strokeWidth={1.75} aria-hidden />
                    </button>
                  </td>
                </tr>
                )
              })}
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
              <button className="modal-close" onClick={() => setModal(false)}><X size={14} strokeWidth={1.75} aria-hidden /></button>
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
                <div style={{ paddingTop: 12, borderTop: '1px solid var(--border)', marginTop: 4 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)' }}>
                    <input
                      type="checkbox"
                      checked={form.recorrente}
                      onChange={e => setForm(f => ({ ...f, recorrente: e.target.checked }))}
                      style={{ width: 18, height: 18, accentColor: 'var(--accent)' }}
                    />
                    <RotateCcw size={14} strokeWidth={1.75} aria-hidden style={{ color: 'var(--accent)' }} />
                    <span><strong>Lançamento recorrente</strong> — se repete automaticamente</span>
                  </label>

                  {form.recorrente && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14, paddingLeft: 28 }}>
                      <div>
                        <label className="form-label">Frequência</label>
                        <select value={form.recorrencia_freq} onChange={e => setForm(f => ({ ...f, recorrencia_freq: e.target.value }))} className="form-input">
                          <option value="semanal">Semanal</option>
                          <option value="quinzenal">Quinzenal</option>
                          <option value="mensal">Mensal</option>
                          <option value="bimestral">Bimestral</option>
                          <option value="trimestral">Trimestral</option>
                          <option value="anual">Anual</option>
                        </select>
                      </div>
                      <div>
                        <label className="form-label">Termina em (opcional)</label>
                        <input type="date" value={form.recorrencia_fim} onChange={e => setForm(f => ({ ...f, recorrencia_fim: e.target.value }))} className="form-input" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-ghost" style={{ flex:1 }} onClick={() => setModal(false)}>Cancelar</button>
                  <button type="submit" disabled={salvando} className="btn-primary" style={{ flex:1, justifyContent:'center' }}>
                    {salvando ? 'Salvando...' : <><Check size={14} strokeWidth={1.75} aria-hidden /> Salvar</>}
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
              <button className="modal-close" onClick={() => setImportModal(false)}><X size={14} strokeWidth={1.75} aria-hidden /></button>
            </div>
            <form onSubmit={importarBelvo}>
              <div className="modal-body">
                {belvoConfigured === false && (
                  <div style={{ padding:'12px 14px', borderRadius:8, background:'var(--accent-light)', color:'var(--text-secondary)', fontSize:13, lineHeight:1.5 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <Info size={14} strokeWidth={1.75} aria-hidden />
                      Esta feature requer configuração do Belvo. Contate o admin para ativar.
                    </span>
                    <div style={{ marginTop:6, fontSize:12, color:'var(--text-muted)' }}>
                      <a href="https://belvo.com/docs" target="_blank" rel="noopener noreferrer" style={{ color:'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        Documentação Belvo <ExternalLink size={10} strokeWidth={1.75} aria-hidden />
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
                    Padrão: últimos 30 dias
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
                    {importing ? 'Importando...' : <><Download size={14} strokeWidth={1.75} aria-hidden /> Importar</>}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .fin-invest-card:hover {
          transform: translateY(-2px);
          border-color: var(--accent) !important;
          box-shadow: 0 6px 20px -12px rgba(0,0,0,0.28);
        }
      `}</style>
    </div>
  )
}

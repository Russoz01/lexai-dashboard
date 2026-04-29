'use client'
import { useEffect, useMemo, useState } from 'react'
import {
  Landmark,
  CalendarRange,
  Calendar,
  CheckCircle2,
  Flag,
  PauseCircle,
  Clock,
  PlusCircle,
  ArrowLeftRight,
  Calculator,
  RotateCcw,
  ShieldCheck,
  Gauge,
} from 'lucide-react'
import ConfidenceBadge, { PoweredByPralvex } from '@/components/ConfidenceBadge'
import { AgentHero } from '@/components/AgentHero'
import {
  addDiasUteisForenses,
  breakdownPeriodo,
  diferencaDiasUteis,
} from '@/lib/feriados-br'

type RapidoModo = 'adicionar' | 'diferenca'

interface HistoricoItem {
  id: string
  modo: RapidoModo
  inicio: string
  fim: string
  dias: string
  label: string
  ts: number
}

const HISTORICO_KEY = 'pralvex-calc-historico'
const HISTORICO_MAX = 5

function formatBR(d: Date): string {
  const day = String(d.getDate()).padStart(2, '0')
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const y = d.getFullYear()
  const dow = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'][d.getDay()]
  return `${day}/${m}/${y} (${dow})`
}

function parseInputDate(value: string): Date | null {
  if (!value) return null
  // formato esperado YYYY-MM-DD vindo do <input type="date">
  const [y, m, d] = value.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

export default function CalculadorPage() {
  const [consulta, setConsulta] = useState('')
  const [loading, setLoading] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [resultado, setResultado] = useState<any>(null)
  const [erro, setErro] = useState('')

  // ── Calculadora rápida (offline) ──────────────────────────────────────
  const [rapidoModo, setRapidoModo] = useState<RapidoModo>('adicionar')
  const [rapidoInicio, setRapidoInicio] = useState('')
  const [rapidoFim, setRapidoFim] = useState('')
  const [rapidoDias, setRapidoDias] = useState('')

  // ── Histórico local de cálculos rápidos ─────────────────────────────
  const [historico, setHistorico] = useState<HistoricoItem[]>([])

  // ── Taxas atuais do Banco Central (SELIC, CDI, IPCA 12m) ────────────
  type TaxaBC = { data: string; valor: number; anual?: number }
  const [taxas, setTaxas] = useState<{ selic: TaxaBC | null; cdi: TaxaBC | null; ipca: number | null } | null>(null)

  useEffect(() => {
    // cleanup flag — antes Promise.all chamava setTaxas em componente
    // desmontado se usuario navegasse rapido. React warning + memory leak.
    let cancelled = false
    ;(async () => {
      const { getTaxaSELIC, getTaxaCDI, getIPCA12m } = await import('@/lib/brasil-api')
      const [selic, cdi, ipca] = await Promise.all([getTaxaSELIC(), getTaxaCDI(), getIPCA12m()])
      if (!cancelled) setTaxas({ selic, cdi, ipca })
    })().catch(() => {})
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORICO_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as HistoricoItem[]
        if (Array.isArray(parsed)) setHistorico(parsed.slice(0, HISTORICO_MAX))
      }
    } catch {
      /* ignore */
    }
  }, [])

  function salvarHistorico(item: Omit<HistoricoItem, 'id' | 'ts'>) {
    const novo: HistoricoItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      ts: Date.now(),
    }
    setHistorico(prev => {
      // Evitar duplicata com os mesmos parametros
      const filtered = prev.filter(
        p => !(p.modo === novo.modo && p.inicio === novo.inicio && p.fim === novo.fim && p.dias === novo.dias)
      )
      const proximo = [novo, ...filtered].slice(0, HISTORICO_MAX)
      try {
        localStorage.setItem(HISTORICO_KEY, JSON.stringify(proximo))
      } catch {
        /* ignore */
      }
      return proximo
    })
  }

  function aplicarHistorico(item: HistoricoItem) {
    setRapidoModo(item.modo)
    setRapidoInicio(item.inicio)
    setRapidoFim(item.fim)
    setRapidoDias(item.dias)
  }

  function limparHistorico() {
    setHistorico([])
    try { localStorage.removeItem(HISTORICO_KEY) } catch { /* ignore */ }
  }

  const rapidoResultado = useMemo(() => {
    const inicio = parseInputDate(rapidoInicio)
    if (!inicio) return null

    if (rapidoModo === 'adicionar') {
      const dias = parseInt(rapidoDias, 10)
      if (!Number.isFinite(dias) || dias < 0 || dias > 3650) return null
      try {
        const fim = addDiasUteisForenses(inicio, dias)
        const breakdown = breakdownPeriodo(inicio, fim)
        return { tipo: 'adicionar' as const, inicio, fim, breakdown, dias }
      } catch {
        return null
      }
    } else {
      const fim = parseInputDate(rapidoFim)
      if (!fim) return null
      if (fim.getTime() < inicio.getTime()) {
        return { tipo: 'erro' as const, msg: 'A data final deve ser igual ou posterior à data inicial.' }
      }
      const diasUteis = diferencaDiasUteis(inicio, fim)
      const breakdown = breakdownPeriodo(inicio, fim)
      return { tipo: 'diferenca' as const, inicio, fim, breakdown, diasUteis }
    }
  }, [rapidoModo, rapidoInicio, rapidoFim, rapidoDias])

  // Salva historico quando resultado valido eh gerado (debounced)
  useEffect(() => {
    if (!rapidoResultado || rapidoResultado.tipo === 'erro') return
    const t = setTimeout(() => {
      let label = ''
      if (rapidoResultado.tipo === 'adicionar') {
        label = `+${rapidoResultado.dias} dias úteis de ${formatBR(rapidoResultado.inicio).split(' ')[0]}`
      } else {
        label = `${formatBR(rapidoResultado.inicio).split(' ')[0]} até ${formatBR(rapidoResultado.fim).split(' ')[0]}`
      }
      salvarHistorico({
        modo: rapidoModo,
        inicio: rapidoInicio,
        fim: rapidoFim,
        dias: rapidoDias,
        label,
      })
    }, 800)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rapidoResultado])

  async function calcular() {
    if (!consulta.trim() || loading) return
    setLoading(true); setErro(''); setResultado(null)
    try {
      const res = await fetch('/api/calcular', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consulta }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro no cálculo. Tente novamente.')
      setResultado(data.resultado)
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro no cálculo')
    } finally { setLoading(false) }
  }

  return (
    <div className="page-content" style={{ maxWidth: '100%' }}>
      <AgentHero
        edition="Nº XXV"
        Icon={Calculator}
        name="Calculador"
        discipline="Prazos, juros e correção"
        description="Calcula prazos processuais com feriados e recesso forense (art. 220 CPC), correção monetária por IPCA/SELIC/CDI, juros contratuais e custas de tribunal. Inclui calculadora offline de dias úteis com histórico local e taxas BC em tempo real."
        accent="sand"
        meta={[
          { Icon: Clock, label: 'Tempo médio', value: '~25s' },
          { Icon: Gauge, label: 'Escopo', value: 'Prazos · juros · custas' },
          { Icon: ShieldCheck, label: 'Compliance', value: 'Feriados 2025-2027' },
        ]}
        steps={[
          { n: 'I', title: 'Prazo rápido ou cálculo IA', desc: 'Use a calculadora offline de dias úteis ou descreva o cálculo em linguagem natural.' },
          { n: 'II', title: 'Informe parâmetros', desc: 'Data, valor, índice, tipo de prazo, tribunal — quanto mais preciso, melhor o resultado.' },
          { n: 'III', title: 'Receba o cálculo', desc: 'Resultado principal, valores por linha e passos de memória de cálculo auditáveis.' },
        ]}
        examples={[
          { label: 'Prazo para contestação CPC', prompt: 'Calcular prazo para contestação em procedimento comum, começando a contar de 2026-04-22 (terça), com prazo de 15 dias úteis. Considerar feriados e recesso forense.' },
          { label: 'Correção monetária IPCA-E', prompt: 'Valor original R$ 85.000, inadimplemento em 15/03/2020. Calcular correção monetária por IPCA-E até hoje, somando juros de mora de 1% ao mês desde a citação (12/05/2022).' },
          { label: 'Custas processuais TJSP', prompt: 'Calcular custas iniciais no TJSP para ação de cobrança com valor da causa R$ 180.000. Incluir taxa mandato, porte de remessa e custas de distribuição.' },
        ]}
        onExampleClick={setConsulta}
        shortcut="⌘⏎ calcular"
      />

      {/* ════ Taxas atuais do Banco Central ════ */}
      {taxas && (
        <div className="section-card" style={{ padding: '14px 18px', marginBottom: 16, display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Landmark size={14} strokeWidth={1.75} aria-hidden />Taxas atuais (BCB)
          </div>
          {taxas.selic && (
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>SELIC</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>{taxas.selic.anual}% a.a.</div>
            </div>
          )}
          {taxas.cdi && (
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>CDI</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--success)' }}>{taxas.cdi.anual}% a.a.</div>
            </div>
          )}
          {taxas.ipca !== null && (
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>IPCA 12m</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--warning)' }}>{taxas.ipca}%</div>
            </div>
          )}
          <div style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-muted)', fontStyle: 'italic' }}>
            Fonte: Banco Central do Brasil
          </div>
        </div>
      )}

      {/* ════ Calculo rapido de prazo (client-side) ════ */}
      <div className="section-card" style={{ padding: '16px 18px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CalendarRange size={15} strokeWidth={1.75} aria-hidden style={{ color: 'var(--accent)' }} />
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Cálculo rápido de prazo
            </div>
            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: 'var(--success-light)', color: 'var(--success)', fontWeight: 700, letterSpacing: '0.04em' }}>
              OFFLINE
            </span>
          </div>
          <div style={{ display: 'flex', gap: 4, padding: 3, background: 'var(--hover)', borderRadius: 8, border: '1px solid var(--border)' }}>
            <button
              type="button"
              onClick={() => setRapidoModo('adicionar')}
              style={{
                padding: '5px 12px', borderRadius: 6, border: 'none',
                background: rapidoModo === 'adicionar' ? 'var(--card-bg)' : 'transparent',
                color: rapidoModo === 'adicionar' ? 'var(--text-primary)' : 'var(--text-muted)',
                fontSize: 11, fontWeight: 600, cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                boxShadow: rapidoModo === 'adicionar' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              Adicionar dias
            </button>
            <button
              type="button"
              onClick={() => setRapidoModo('diferenca')}
              style={{
                padding: '5px 12px', borderRadius: 6, border: 'none',
                background: rapidoModo === 'diferenca' ? 'var(--card-bg)' : 'transparent',
                color: rapidoModo === 'diferenca' ? 'var(--text-primary)' : 'var(--text-muted)',
                fontSize: 11, fontWeight: 600, cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                boxShadow: rapidoModo === 'diferenca' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              Calcular diferença
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: rapidoModo === 'adicionar' ? '1fr 1fr' : '1fr 1fr', gap: 10, marginBottom: 10 }} className="rapido-grid">
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
              Data de início
            </label>
            <input
              type="date"
              value={rapidoInicio}
              onChange={e => setRapidoInicio(e.target.value)}
              className="form-input"
              style={{ fontSize: 13, padding: '8px 10px' }}
            />
          </div>

          {rapidoModo === 'adicionar' ? (
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                Quantidade de dias úteis
              </label>
              <input
                type="number"
                min="0"
                max="3650"
                value={rapidoDias}
                onChange={e => setRapidoDias(e.target.value)}
                placeholder="ex: 15"
                className="form-input"
                style={{ fontSize: 13, padding: '8px 10px' }}
              />
            </div>
          ) : (
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                Data final
              </label>
              <input
                type="date"
                value={rapidoFim}
                onChange={e => setRapidoFim(e.target.value)}
                className="form-input"
                style={{ fontSize: 13, padding: '8px 10px' }}
              />
            </div>
          )}
        </div>

        {rapidoResultado && rapidoResultado.tipo === 'erro' && (
          <div style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--danger-light)', color: 'var(--danger)', fontSize: 12 }}>
            {rapidoResultado.msg}
          </div>
        )}

        {rapidoResultado && rapidoResultado.tipo !== 'erro' && (
          <div style={{
            padding: '12px 14px', borderRadius: 10,
            background: 'var(--accent-light)', borderLeft: '3px solid var(--accent)',
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            {rapidoResultado.tipo === 'adicionar' ? (
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Resultado
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginTop: 3 }}>
                  {formatBR(rapidoResultado.fim)}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  {rapidoResultado.dias} dia(s) útil(eis) após {formatBR(rapidoResultado.inicio)}
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Resultado
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginTop: 3 }}>
                  {rapidoResultado.diasUteis} dia(s) útil(eis) entre as datas
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  De {formatBR(rapidoResultado.inicio)} até {formatBR(rapidoResultado.fim)}
                </div>
              </div>
            )}

            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 6,
              paddingTop: 8, borderTop: '1px dashed rgba(45,106,79,0.25)',
            }}>
              <span className="breakdown-chip chip-corridos">
                <Calendar size={12} strokeWidth={1.75} aria-hidden />
                {rapidoResultado.breakdown.diasCorridos} corridos
              </span>
              <span className="breakdown-chip chip-uteis">
                <CheckCircle2 size={12} strokeWidth={1.75} aria-hidden />
                {rapidoResultado.breakdown.diasUteis} úteis
              </span>
              <span className="breakdown-chip chip-feriados">
                <Flag size={12} strokeWidth={1.75} aria-hidden />
                {rapidoResultado.breakdown.feriados} feriados
              </span>
              <span className="breakdown-chip chip-fds">
                <CalendarRange size={12} strokeWidth={1.75} aria-hidden />
                {rapidoResultado.breakdown.finaisDeSemana} fim de semana
              </span>
              <span className="breakdown-chip chip-recesso">
                <PauseCircle size={12} strokeWidth={1.75} aria-hidden />
                {rapidoResultado.breakdown.diasRecesso} recesso
              </span>
            </div>
          </div>
        )}

        {!rapidoResultado && rapidoInicio && (
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', padding: 6 }}>
            {rapidoModo === 'adicionar' ? 'Informe a quantidade de dias úteis.' : 'Informe a data final.'}
          </div>
        )}

        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>
          Considera feriados nacionais 2025-2027 e recesso forense (20/12 a 20/01 — art. 220 CPC). Cálculo 100% local.
        </div>

        {/* Historico local dos ultimos calculos */}
        {historico.length > 0 && (
          <div className="calc-historico">
            <div className="calc-historico-header">
              <div className="calc-historico-title">
                <Clock size={12} strokeWidth={1.75} aria-hidden />
                Últimos cálculos
              </div>
              <button
                type="button"
                className="calc-historico-clear"
                onClick={limparHistorico}
                aria-label="Limpar histórico"
              >
                Limpar
              </button>
            </div>
            <div className="calc-historico-row">
              {historico.map(h => (
                <button
                  key={h.id}
                  type="button"
                  className="calc-historico-chip"
                  onClick={() => aplicarHistorico(h)}
                  title={h.label}
                >
                  {h.modo === 'adicionar'
                    ? <PlusCircle size={12} strokeWidth={1.75} aria-hidden />
                    : <ArrowLeftRight size={12} strokeWidth={1.75} aria-hidden />}
                  <span>{h.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .rapido-grid { grid-template-columns: 1fr !important; }
        }
        .breakdown-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 14px;
          letter-spacing: 0.01em;
          font-family: 'DM Sans', sans-serif;
        }
        .chip-corridos {
          background: var(--accent-light);
          color: var(--accent);
        }
        .chip-uteis {
          background: var(--success-light);
          color: var(--success);
        }
        .chip-feriados {
          background: var(--danger-light);
          color: var(--danger);
        }
        .chip-fds {
          background: var(--hover);
          color: var(--text-muted);
          border: 1px solid var(--border);
        }
        .chip-recesso {
          background: var(--warning-light);
          color: var(--warning);
        }
        .calc-historico {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px dashed var(--border);
        }
        .calc-historico-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .calc-historico-title {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
        }
        .calc-historico-title svg {
          color: var(--accent);
        }
        .calc-historico-clear {
          background: none;
          border: none;
          font-size: 10px;
          font-weight: 600;
          color: var(--text-muted);
          cursor: pointer;
          padding: 2px 6px;
          border-radius: 6px;
          font-family: 'DM Sans', sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          transition: color 0.15s ease, background 0.15s ease;
        }
        .calc-historico-clear:hover {
          color: var(--danger);
          background: var(--danger-light);
        }
        .calc-historico-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .calc-historico-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          padding: 5px 10px;
          border-radius: 14px;
          background: var(--hover);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          max-width: 100%;
          transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .calc-historico-chip svg {
          color: var(--accent);
          flex-shrink: 0;
        }
        .calc-historico-chip span {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 180px;
        }
        .calc-historico-chip:hover {
          background: var(--accent-light);
          border-color: var(--accent);
          color: var(--accent);
          transform: translateY(-1px);
        }
        @media (max-width: 640px) {
          .calc-historico-chip span { max-width: 130px; }
          .breakdown-chip { font-size: 10px; padding: 3px 8px; }
        }
      `}</style>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="redator-main-grid">
        <div className="section-card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
            Descrição do Cálculo
          </div>
          <textarea value={consulta} onChange={e => setConsulta(e.target.value)}
            maxLength={50000}
            placeholder={"Descreva o cálculo que precisa:\n\n- Prazo processual: data de intimação, tipo de prazo\n- Correção monetária: valor, data inicial, índice\n- Juros: taxa, período, base de cálculo\n- Custas: tribunal, valor da causa"}
            className="form-input" style={{ resize: 'vertical', minHeight: 220, fontFamily: "'DM Sans',sans-serif", fontSize: 13, lineHeight: 1.6 }} />
          <div style={{ fontSize: 11, color: consulta.length > 45000 ? 'var(--danger)' : consulta.length > 40000 ? '#f59e0b' : 'var(--text-muted)', textAlign: 'right', marginTop: 4 }}>
            {consulta.length.toLocaleString('pt-BR')} / 50.000
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Exemplos:</span>
            {['Prazo para contestação CPC', 'Correção monetária IPCA-E desde 2020', 'Custas processuais TJSP'].map((ex, i) => (
              <button key={i} type="button" onClick={() => setConsulta(ex)}
                style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'var(--hover)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                {ex}
              </button>
            ))}
          </div>
          {erro && <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--danger-light)', color: 'var(--danger)', fontSize: 13, marginTop: 12 }}>{erro}</div>}
          <button type="button" onClick={calcular} disabled={!consulta.trim() || loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>
            {loading ? 'Calculando...' : <><Calculator size={14} strokeWidth={1.75} aria-hidden /> Calcular</>}
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
              <button type="button" onClick={() => { setResultado(null); setConsulta('') }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: 11, background: 'none', border: '1px dashed var(--border)', borderRadius: 10, color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                <RotateCcw size={14} strokeWidth={1.75} aria-hidden /> Novo cálculo
              </button>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <PoweredByPralvex />
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--text-muted)', minHeight: 220 }}>
              <Calculator size={40} strokeWidth={1.75} aria-hidden style={{ opacity: 0.3 }} />
              <span style={{ fontSize: 13, textAlign: 'center' }}>Descreva o cálculo jurídico<br />e clique em Calcular</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

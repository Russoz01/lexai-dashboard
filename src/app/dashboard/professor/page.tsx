'use client'

import { useState } from 'react'
import ConfidenceBadge, { PoweredByLexAI } from '@/components/ConfidenceBadge'
import {
  FileText,
  ShieldAlert,
  Briefcase,
  Coins,
  Building2,
  TreePine,
  Laptop,
  ShoppingBag,
  Landmark,
  Building,
  Check,
  X,
  AlertTriangle,
  Calendar,
  Clock,
  RotateCcw,
  Radio,
  NotebookText,
  GitBranch,
  TrendingUp,
  CheckSquare,
} from 'lucide-react'

const AREAS_PRATICA = [
  { id: 'civil', label: 'Direito Civil', Icon: FileText, color: '#44372b' },
  { id: 'penal', label: 'Direito Penal', Icon: ShieldAlert, color: '#EF4444' },
  { id: 'trabalhista', label: 'Direito Trabalhista', Icon: Briefcase, color: '#F59E0B' },
  { id: 'tributario', label: 'Direito Tributário', Icon: Coins, color: '#10B981' },
  { id: 'empresarial', label: 'Direito Empresarial', Icon: Building2, color: '#EC4899' },
  { id: 'ambiental', label: 'Direito Ambiental', Icon: TreePine, color: '#22C55E' },
  { id: 'digital', label: 'Direito Digital', Icon: Laptop, color: '#0EA5E9' },
  { id: 'consumidor', label: 'Direito do Consumidor', Icon: ShoppingBag, color: '#8B5CF6' },
  { id: 'administrativo', label: 'Direito Administrativo', Icon: Landmark, color: '#06B6D4' },
  { id: 'constitucional', label: 'Direito Constitucional', Icon: Building, color: '#6366F1' },
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Relatorio = any

export default function MonitorLegislativoPage() {
  const [areasSelecionadas, setAreasSelecionadas] = useState<string[]>([])
  const [topicos, setTopicos] = useState('')
  const [loading, setLoading] = useState(false)
  const [relatorio, setRelatorio] = useState<Relatorio | null>(null)
  const [erro, setErro] = useState('')
  const [secaoAtiva, setSecaoAtiva] = useState<'legislacao' | 'precedentes' | 'regulatorio' | 'impacto' | 'acoes'>('legislacao')

  function toggleArea(id: string) {
    setAreasSelecionadas(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    )
  }

  async function monitorar() {
    if (areasSelecionadas.length === 0 || loading) return
    setLoading(true)
    setErro('')
    setRelatorio(null)

    const areasTexto = areasSelecionadas
      .map(id => AREAS_PRATICA.find(a => a.id === id)?.label || id)
      .join(', ')

    try {
      const res = await fetch('/api/ensinar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ areas: areasTexto, topicos }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setRelatorio(data.relatorio)
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao gerar relatório')
    } finally {
      setLoading(false)
    }
  }

  const SECOES = [
    { key: 'legislacao' as const, label: 'Legislação', Icon: NotebookText, color: '#44372b' },
    { key: 'precedentes' as const, label: 'Precedentes', Icon: Landmark, color: '#4f46e5' },
    { key: 'regulatorio' as const, label: 'Regulatório', Icon: GitBranch, color: '#10B981' },
    { key: 'impacto' as const, label: 'Análise de Impacto', Icon: TrendingUp, color: '#e67e22' },
    { key: 'acoes' as const, label: 'Ações Recomendadas', Icon: CheckSquare, color: '#c0392b' },
  ]

  return (
    <div className="page-content" style={{ maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
            Agente IA
          </span>
        </div>
        <h1 className="page-title">Monitor Legislativo</h1>
        <p className="page-subtitle">Acompanhe mudanças legislativas, novos precedentes e atualizações regulatórias relevantes para suas áreas de atuação</p>
      </div>

      {/* Area selection */}
      {!relatorio && !loading && (
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
            Selecione as áreas de atuação para monitorar
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }} className="monitor-grid">
            {AREAS_PRATICA.map(area => {
              const selected = areasSelecionadas.includes(area.id)
              const AreaIcon = area.Icon
              return (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => toggleArea(area.id)}
                  className="section-card"
                  style={{
                    padding: '14px 12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    border: selected ? `2px solid ${area.color}` : '1px solid var(--border)',
                    background: selected ? `${area.color}0a` : 'var(--card-bg)',
                    textAlign: 'center',
                    fontFamily: "'DM Sans', sans-serif",
                    position: 'relative',
                  }}
                >
                  {selected && (
                    <span style={{
                      position: 'absolute', top: 6, right: 6,
                      width: 18, height: 18, borderRadius: '50%',
                      background: area.color, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Check size={11} strokeWidth={1.75} aria-hidden style={{ color: '#fff' }} />
                    </span>
                  )}
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: `${area.color}14`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 8px',
                  }}>
                    <AreaIcon size={16} strokeWidth={1.75} aria-hidden style={{ color: area.color }} />
                  </div>
                  <div style={{
                    fontSize: 12, fontWeight: 600,
                    color: selected ? area.color : 'var(--text-primary)',
                  }}>
                    {area.label}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Specific topics textarea */}
      {!relatorio && !loading && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
            Tópicos específicos para monitorar (opcional)
          </div>
          <textarea
            value={topicos}
            onChange={e => setTopicos(e.target.value)}
            placeholder="Ex: reforma tributária, LGPD, direitos digitais, recuperação judicial, nova lei de licitações..."
            className="form-input"
            rows={3}
            style={{
              width: '100%',
              resize: 'vertical',
              fontSize: 13,
              lineHeight: 1.6,
            }}
          />
        </div>
      )}

      {/* Monitor button */}
      {!relatorio && !loading && (
        <div style={{ marginBottom: 36 }}>
          <button
            type="button"
            onClick={monitorar}
            disabled={areasSelecionadas.length === 0}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '14px 24px',
              fontSize: 15,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
            }}
          >
            <Radio size={18} strokeWidth={1.75} aria-hidden />
            Monitorar {areasSelecionadas.length > 0 ? `(${areasSelecionadas.length} ${areasSelecionadas.length === 1 ? 'área' : 'áreas'})` : ''}
          </button>
          {areasSelecionadas.length === 0 && (
            <div style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
              Selecione ao menos uma área de atuação acima
            </div>
          )}
        </div>
      )}

      {/* Selected areas summary (when no result yet) */}
      {!relatorio && !loading && areasSelecionadas.length > 0 && (
        <div className="section-card" style={{ padding: '16px 20px', marginBottom: 36, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingRight: 16, borderRight: '1px solid var(--border)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Radio size={18} strokeWidth={1.75} aria-hidden style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{areasSelecionadas.length}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{areasSelecionadas.length === 1 ? 'área selecionada' : 'áreas selecionadas'}</div>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 200, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {areasSelecionadas.map(id => {
              const area = AREAS_PRATICA.find(a => a.id === id)
              if (!area) return null
              const AreaIcon = area.Icon
              return (
                <span key={id} style={{
                  fontSize: 11, padding: '4px 10px', borderRadius: 6,
                  background: `${area.color}14`, color: area.color,
                  fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4,
                }}>
                  <AreaIcon size={10} strokeWidth={1.75} aria-hidden />
                  {area.label}
                </span>
              )
            })}
          </div>
          <button
            type="button"
            onClick={() => setAreasSelecionadas([])}
            style={{
              fontSize: 11, padding: '6px 10px', borderRadius: 6,
              background: 'none', border: '1px solid var(--border)',
              color: 'var(--text-muted)', cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              display: 'inline-flex', alignItems: 'center', gap: 4,
            }}
          >
            <X size={11} strokeWidth={1.75} aria-hidden />Limpar
          </button>
        </div>
      )}

      {/* Error */}
      {erro && (
        <div style={{ padding: '12px 14px', borderRadius: 8, background: 'var(--danger-light)', color: 'var(--danger)', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={14} strokeWidth={1.75} aria-hidden /> {erro}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
          <span style={{ display: 'inline-block', width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: 16 }} />
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Gerando relatório legislativo...</div>
          <div style={{ fontSize: 13 }}>Analisando mudanças legislativas, precedentes e regulatórias</div>
        </div>
      ) : relatorio ? (
        <>
          {/* Report header */}
          <div className="section-card" style={{ padding: '20px 24px', marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent)', marginBottom: 6 }}>
                  Relatório de Monitoramento
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4, margin: 0 }}>
                  {relatorio.titulo_relatorio || 'Relatório Legislativo'}
                </h2>
                {relatorio.data_referencia && (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={11} strokeWidth={1.75} aria-hidden />
                    {String(relatorio.data_referencia)}
                  </div>
                )}
              </div>
              <ConfidenceBadge confianca={relatorio.confianca} />
            </div>
          </div>

          {/* Section tabs */}
          <div className="monitor-tabs" style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {SECOES.map(s => {
              const SecIcon = s.Icon
              return (
                <button key={s.key} onClick={() => setSecaoAtiva(s.key)} className="monitor-tab" style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10,
                  border: secaoAtiva === s.key ? `2px solid ${s.color}` : '1px solid var(--border)',
                  background: secaoAtiva === s.key ? `${s.color}12` : 'var(--card-bg)',
                  color: secaoAtiva === s.key ? s.color : 'var(--text-secondary)',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", transition: 'all 0.15s',
                  flexShrink: 0, whiteSpace: 'nowrap',
                }}>
                  <SecIcon size={14} strokeWidth={1.75} aria-hidden /> {s.label}
                </button>
              )
            })}
          </div>

          {/* Section content */}
          <div className="section-card" style={{ padding: '24px 28px' }}>

            {/* Alteracoes Legislativas */}
            {secaoAtiva === 'legislacao' && (() => {
              const items = Array.isArray(relatorio.alteracoes_legislativas) ? relatorio.alteracoes_legislativas : []
              if (items.length === 0) return (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  <p style={{ fontSize: 13 }}>Nenhuma alteração legislativa identificada para o período</p>
                </div>
              )
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#44372b', marginBottom: 4 }}>
                    Alterações Legislativas Recentes
                  </div>
                  {items.map((item: Relatorio, i: number) => (
                    <div key={i} style={{ padding: '16px 18px', borderRadius: 10, background: 'var(--hover)', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: 'var(--accent-light)', color: 'var(--accent)' }}>
                          {String(item.tipo || 'Lei')}
                        </span>
                        {item.status && (
                          <span style={{
                            fontSize: 11, padding: '3px 8px', borderRadius: 20,
                            background: item.status === 'Em vigor' ? 'rgba(45,134,89,0.12)' : item.status === 'Em tramitacao' ? 'rgba(230,126,34,0.12)' : 'var(--hover)',
                            color: item.status === 'Em vigor' ? 'var(--success)' : item.status === 'Em tramitacao' ? '#e67e22' : 'var(--text-muted)',
                            border: '1px solid var(--border)', fontWeight: 600,
                          }}>
                            {String(item.status)}
                          </span>
                        )}
                        {item.data && (
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <Calendar size={10} strokeWidth={1.75} aria-hidden />{String(item.data)}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
                        {String(item.norma || '')}
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 10 }}>
                        {String(item.resumo || '')}
                      </p>
                      {item.impacto && (
                        <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--card-bg)', borderLeft: '3px solid var(--accent)' }}>
                          <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent)', marginBottom: 4 }}>Impacto na Prática</div>
                          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{String(item.impacto)}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            })()}

            {/* Precedentes */}
            {secaoAtiva === 'precedentes' && (() => {
              const items = Array.isArray(relatorio.precedentes) ? relatorio.precedentes : []
              if (items.length === 0) return (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  <p style={{ fontSize: 13 }}>Nenhum precedente relevante identificado para o período</p>
                </div>
              )
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#4f46e5', marginBottom: 4 }}>
                    Novos Precedentes e Jurisprudência
                  </div>
                  {items.map((item: Relatorio, i: number) => (
                    <div key={i} style={{ padding: '16px 18px', borderRadius: 10, background: 'var(--hover)', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: 'rgba(79,70,229,0.12)', color: '#4f46e5' }}>
                          {String(item.tribunal || '')}
                        </span>
                        {item.tipo && (
                          <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: 'var(--hover)', color: 'var(--text-muted)', border: '1px solid var(--border)', fontWeight: 600 }}>
                            {String(item.tipo)}
                          </span>
                        )}
                        {item.data_julgamento && (
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <Calendar size={10} strokeWidth={1.75} aria-hidden />{String(item.data_julgamento)}
                          </span>
                        )}
                      </div>
                      {item.numero_processo && (
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, fontFamily: 'monospace' }}>
                          {String(item.numero_processo)}
                        </div>
                      )}
                      <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.7, marginBottom: 10, fontWeight: 500 }}>
                        {String(item.tese || '')}
                      </p>
                      {item.impacto && (
                        <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--card-bg)', borderLeft: '3px solid #4f46e5' }}>
                          <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#4f46e5', marginBottom: 4 }}>Relevância Prática</div>
                          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{String(item.impacto)}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            })()}

            {/* Atualizacoes Regulatorias */}
            {secaoAtiva === 'regulatorio' && (() => {
              const items = Array.isArray(relatorio.atualizacoes_regulatorias) ? relatorio.atualizacoes_regulatorias : []
              if (items.length === 0) return (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  <p style={{ fontSize: 13 }}>Nenhuma atualização regulatória identificada para o período</p>
                </div>
              )
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#10B981', marginBottom: 4 }}>
                    Atualizações de Órgãos Reguladores
                  </div>
                  {items.map((item: Relatorio, i: number) => (
                    <div key={i} style={{ padding: '16px 18px', borderRadius: 10, background: 'var(--hover)', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: 'rgba(16,185,129,0.12)', color: '#10B981' }}>
                          {String(item.orgao || '')}
                        </span>
                        {item.data && (
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <Calendar size={10} strokeWidth={1.75} aria-hidden />{String(item.data)}
                          </span>
                        )}
                      </div>
                      {item.ato && (
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
                          {String(item.ato)}
                        </div>
                      )}
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                        {String(item.resumo || '')}
                      </p>
                    </div>
                  ))}
                </div>
              )
            })()}

            {/* Analise de Impacto */}
            {secaoAtiva === 'impacto' && (() => {
              const impacto = relatorio.analise_impacto || {}
              const destaques = Array.isArray(relatorio.topicos_em_destaque) ? relatorio.topicos_em_destaque : []
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {impacto.resumo_geral && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#e67e22', marginBottom: 8 }}>Cenário Atual</div>
                      <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{String(impacto.resumo_geral)}</p>
                    </div>
                  )}
                  {Array.isArray(impacto.riscos) && impacto.riscos.length > 0 && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--danger)', marginBottom: 10 }}>Riscos Identificados</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {impacto.riscos.map((risco: string, i: number) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', borderRadius: 8, background: 'rgba(192,57,43,0.06)', borderLeft: '3px solid var(--danger)' }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--danger)', flexShrink: 0, marginTop: 6 }} />
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{String(risco)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {Array.isArray(impacto.oportunidades) && impacto.oportunidades.length > 0 && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--success)', marginBottom: 10 }}>Oportunidades</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {impacto.oportunidades.map((op: string, i: number) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', borderRadius: 8, background: 'rgba(45,134,89,0.06)', borderLeft: '3px solid var(--success)' }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', flexShrink: 0, marginTop: 6 }} />
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{String(op)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {destaques.length > 0 && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 10 }}>Tópicos em Destaque</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {destaques.map((t: string, i: number) => (
                          <span key={i} style={{ fontSize: 12, padding: '6px 14px', borderRadius: 8, background: 'var(--accent-light)', color: 'var(--accent)', fontWeight: 600 }}>
                            {String(t)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })()}

            {/* Acoes Recomendadas */}
            {secaoAtiva === 'acoes' && (() => {
              const items = Array.isArray(relatorio.acoes_recomendadas) ? relatorio.acoes_recomendadas : []
              if (items.length === 0) return (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  <p style={{ fontSize: 13 }}>Nenhuma ação recomendada para o período</p>
                </div>
              )
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#c0392b', marginBottom: 4 }}>
                    Ações Recomendadas para o Escritório
                  </div>
                  {items.map((item: Relatorio, i: number) => {
                    const priorColor = item.prioridade === 'Alta' ? 'var(--danger)' : item.prioridade === 'Media' ? '#e67e22' : 'var(--success)'
                    return (
                      <div key={i} style={{ padding: '16px 18px', borderRadius: 10, background: 'var(--hover)', border: '1px solid var(--border)', borderLeft: `3px solid ${priorColor}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                          <span style={{
                            fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                            background: `${priorColor}14`, color: priorColor,
                          }}>
                            Prioridade {String(item.prioridade || 'Média')}
                          </span>
                          {item.prazo_sugerido && (
                            <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <Clock size={10} strokeWidth={1.75} aria-hidden />{String(item.prazo_sugerido)}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
                          {String(item.acao || '')}
                        </div>
                        {item.justificativa && (
                          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                            {String(item.justificativa)}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </div>

          {/* New monitoring button */}
          <button
            type="button"
            onClick={() => { setRelatorio(null); setAreasSelecionadas([]); setTopicos('') }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', padding: 11, background: 'none',
              border: '1px dashed var(--border)', borderRadius: 10,
              color: 'var(--text-muted)', fontSize: 13, fontWeight: 500,
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", marginTop: 16,
            }}
          >
            <RotateCcw size={14} strokeWidth={1.75} aria-hidden /> Novo monitoramento
          </button>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
            <PoweredByLexAI />
          </div>
        </>
      ) : !loading && (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
          <Radio size={48} strokeWidth={1.75} aria-hidden style={{ display: 'block', margin: '0 auto 16px', opacity: 0.25 }} />
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Monitoramento legislativo inteligente</div>
          <div style={{ fontSize: 13 }}>Selecione suas áreas de atuação e receba um relatório completo de mudanças legislativas</div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .monitor-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .monitor-tabs {
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            padding-bottom: 4px;
            margin-left: -4px;
            margin-right: -4px;
            padding-left: 4px;
            padding-right: 4px;
          }
          .monitor-tabs::-webkit-scrollbar { display: none; }
          .monitor-tab {
            scroll-snap-align: start;
          }
        }
      `}</style>
    </div>
  )
}

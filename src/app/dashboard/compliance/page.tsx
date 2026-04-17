'use client'

import { useState } from 'react'
import { ShieldCheck, Zap, ArrowRight, AlertTriangle, Info, Clipboard, Check, RotateCcw } from 'lucide-react'

interface ComplianceResult {
  exposicoes: string
  lgpd: string
  anticorrupcao: string
  acoes: string
  score: string
  justificativa_score: string
  confianca: number
}

const AREAS = [
  'Financeiro',
  'Saúde',
  'Tecnologia',
  'Varejo',
  'Indústria',
  'Serviços',
  'Jurídico',
  'Outro',
]

const TIPOS = [
  'Conformidade LGPD',
  'Risco Anticorrupção',
  'Compliance Setorial',
  'Due Diligence',
]

const EXEMPLOS = [
  {
    label: 'LGPD e-commerce',
    area: 'Varejo',
    tipo: 'Conformidade LGPD',
    descricao: 'Loja virtual coletando dados de cartão de crédito e comportamento de navegação para personalização. Armazenamento em nuvem AWS us-east-1. Compartilhamento com parceiros de marketing.',
  },
  {
    label: 'Anticorrupção',
    area: 'Jurídico',
    tipo: 'Risco Anticorrupção',
    descricao: 'Empresa participando de licitação pública estadual com subcontratação de fornecedores locais vinculados a servidor público municipal.',
  },
  {
    label: 'Compliance trabalhista',
    area: 'Serviços',
    tipo: 'Compliance Setorial',
    descricao: 'Empresa com 80 funcionários implementando política de home office permanente com controle de jornada por software de monitoramento de tela.',
  },
]

type TabKey = 'exposicoes' | 'lgpd' | 'anticorrupcao' | 'acoes' | 'score'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'exposicoes', label: 'Exposições' },
  { key: 'lgpd', label: 'Risco LGPD' },
  { key: 'anticorrupcao', label: 'Anticorrupção' },
  { key: 'acoes', label: 'Ações Recomendadas' },
  { key: 'score', label: 'Score de Risco' },
]

const SCORE_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  BAIXO:   { bg: '#d1fae5', color: '#065f46', border: '#6ee7b7' },
  MEDIO:   { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' },
  ALTO:    { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
  CRITICO: { bg: '#fce7f3', color: '#831843', border: '#f9a8d4' },
}

export default function CompliancePage() {
  const [area, setArea] = useState(AREAS[0])
  const [tipo, setTipo] = useState(TIPOS[0])
  const [descricao, setDescricao] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [resultado, setResultado] = useState<ComplianceResult | null>(null)
  const [activeTab, setActiveTab] = useState<TabKey>('exposicoes')
  const [copied, setCopied] = useState(false)

  async function analisar() {
    if (loading || !descricao.trim()) return
    setLoading(true)
    setErro('')
    setResultado(null)

    try {
      const res = await fetch('/api/compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ area, tipo, descricao: descricao.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      if (!data.parecer) {
        throw new Error('A análise não foi gerada corretamente. Tente novamente.')
      }
      setResultado(data.parecer as ComplianceResult)
      setActiveTab('exposicoes')
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao gerar análise')
    } finally {
      setLoading(false)
    }
  }

  function novaAnalise() {
    setResultado(null)
    setErro('')
  }

  function preencherExemplo(ex: typeof EXEMPLOS[number]) {
    setArea(ex.area)
    setTipo(ex.tipo)
    setDescricao(ex.descricao)
    setResultado(null)
    setErro('')
  }

  function copiarResultado() {
    if (!resultado) return
    const texto = [
      '=== ANÁLISE DE COMPLIANCE ===',
      '',
      'ÁREA: ' + area,
      'TIPO: ' + tipo,
      '',
      'EXPOSIÇÕES REGULATÓRIAS',
      resultado.exposicoes,
      '',
      'RISCO LGPD',
      resultado.lgpd,
      '',
      'ANTICORRUPÇÃO',
      resultado.anticorrupcao,
      '',
      'AÇÕES RECOMENDADAS',
      resultado.acoes,
      '',
      'SCORE DE RISCO: ' + resultado.score,
      resultado.justificativa_score,
    ].join('\n')
    navigator.clipboard.writeText(texto)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const scoreInfo = resultado?.score ? SCORE_COLORS[resultado.score] ?? SCORE_COLORS['ALTO'] : null

  function getTabContent(): string {
    if (!resultado) return ''
    if (activeTab === 'exposicoes') return resultado.exposicoes ?? ''
    if (activeTab === 'lgpd') return resultado.lgpd ?? ''
    if (activeTab === 'anticorrupcao') return resultado.anticorrupcao ?? ''
    if (activeTab === 'acoes') return resultado.acoes ?? ''
    return ''
  }

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
        <h1 className="page-title">Compliance</h1>
        <p className="page-subtitle" style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 16, color: 'var(--text-muted)' }}>
          Mapeamento de risco regulatório, LGPD e anticorrupção
        </p>
      </div>

      {/* Formulario */}
      {!resultado && !loading && (
        <>
          <div className="section-card" style={{ padding: '24px 28px', marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 20, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={14} strokeWidth={1.75} aria-hidden />Configurar análise
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }} className="compliance-form-grid">
              {/* Area de atuacao */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Área de atuação
                </label>
                <select
                  value={area}
                  onChange={e => setArea(e.target.value)}
                  className="form-input"
                  style={{ width: '100%', cursor: 'pointer' }}
                >
                  {AREAS.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              {/* Tipo de analise */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Tipo de análise
                </label>
                <select
                  value={tipo}
                  onChange={e => setTipo(e.target.value)}
                  className="form-input"
                  style={{ width: '100%', cursor: 'pointer' }}
                >
                  {TIPOS.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Descricao */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Descreva a operação ou atividade
              </label>
              <textarea
                value={descricao}
                onChange={e => setDescricao(e.target.value)}
                maxLength={5000}
                rows={6}
                placeholder="Ex: empresa coletando dados de clientes para fins de marketing direto, com transferência internacional para servidores nos EUA..."
                className="form-input"
                style={{ width: '100%', resize: 'vertical', minHeight: 120, lineHeight: 1.6 }}
              />
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, textAlign: 'right' }}>
                {descricao.length}/5000
              </div>
            </div>

            <button
              onClick={analisar}
              disabled={loading || !descricao.trim()}
              className="btn-primary"
              style={{ width: '100%', padding: '12px 0', fontSize: 14, fontWeight: 600, opacity: !descricao.trim() ? 0.5 : 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <ShieldCheck size={14} strokeWidth={1.75} aria-hidden />
              Analisar compliance
            </button>
          </div>

          {/* Exemplos rapidos */}
          <div className="section-card" style={{ padding: '20px 24px', marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 14, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Zap size={14} strokeWidth={1.75} aria-hidden />Exemplos rápidos
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {EXEMPLOS.map((ex, idx) => (
                <button
                  key={idx}
                  onClick={() => preencherExemplo(ex)}
                  className="compliance-exemplo-btn"
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    padding: '12px 16px', borderRadius: 10,
                    border: '1px solid var(--border)',
                    background: 'transparent', cursor: 'pointer',
                    textAlign: 'left', fontFamily: "'DM Sans', sans-serif",
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    background: 'var(--accent-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: 'var(--accent)',
                  }}>
                    {idx + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                      {ex.label}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {ex.area} · {ex.tipo}
                    </div>
                  </div>
                  <ArrowRight size={14} strokeWidth={1.75} aria-hidden style={{ color: 'var(--text-muted)', marginTop: 6 }} />
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Erro */}
      {erro && (
        <div style={{ padding: '12px 14px', borderRadius: 8, background: 'var(--danger-light)', color: 'var(--danger)', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={14} strokeWidth={1.75} aria-hidden /> {erro}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
          <span style={{ display: 'inline-block', width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: 16 }} />
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Analisando compliance...</div>
          <div style={{ fontSize: 13 }}>Mapeando riscos regulatórios para a área de {area}</div>
        </div>
      )}

      {/* Resultado */}
      {resultado && (
        <>
          {/* Cabecalho do resultado */}
          <div className="section-card" style={{ padding: '16px 20px', marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={18} strokeWidth={1.75} aria-hidden style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{tipo}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Área: {area}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={copiarResultado}
                className="btn-secondary"
                style={{ fontSize: 12, padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                {copied ? <Check size={14} strokeWidth={1.75} aria-hidden /> : <Clipboard size={14} strokeWidth={1.75} aria-hidden />}
                {copied ? 'Copiado' : 'Copiar tudo'}
              </button>
              <button type="button" onClick={novaAnalise} className="btn-secondary" style={{ fontSize: 12, padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <RotateCcw size={14} strokeWidth={1.75} aria-hidden />Nova análise
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="section-card" style={{ padding: 0, marginBottom: 32, overflow: 'hidden' }}>
            {/* Tab bar */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    padding: '12px 20px',
                    fontSize: 13, fontWeight: activeTab === tab.key ? 700 : 500,
                    color: activeTab === tab.key ? 'var(--accent)' : 'var(--text-muted)',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    borderBottom: activeTab === tab.key ? '2px solid var(--accent)' : '2px solid transparent',
                    marginBottom: -1, whiteSpace: 'nowrap',
                    fontFamily: "'DM Sans', sans-serif",
                    transition: 'color 0.15s ease',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{ padding: '24px 28px' }}>
              {activeTab === 'score' ? (
                <div>
                  {scoreInfo && (
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 12,
                      padding: '14px 20px', borderRadius: 12,
                      background: scoreInfo.bg, border: `1px solid ${scoreInfo.border}`,
                      marginBottom: 20,
                    }}>
                      <span style={{
                        width: 14, height: 14, borderRadius: '50%',
                        background: scoreInfo.color, display: 'inline-block', flexShrink: 0,
                      }} />
                      <span style={{ fontSize: 20, fontWeight: 800, color: scoreInfo.color, letterSpacing: '0.04em' }}>
                        {resultado.score}
                      </span>
                    </div>
                  )}
                  {resultado.justificativa_score && (
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                      {resultado.justificativa_score}
                    </p>
                  )}
                  {resultado.confianca != null && (
                    <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                      Confiança da análise: {Math.round(resultado.confianca * 100)}%
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                  {getTabContent() || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Nenhuma informação disponível para esta seção.</span>}
                </div>
              )}
            </div>
          </div>

          {/* Aviso */}
          <div style={{
            padding: '14px 18px', borderRadius: 10,
            background: 'var(--accent-light)',
            borderLeft: '3px solid var(--accent)',
            marginBottom: 32,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Info size={13} strokeWidth={1.75} aria-hidden style={{ color: 'var(--accent)' }} />
              <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent)' }}>
                Aviso importante
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              Esta análise foi gerada por inteligência artificial e possui caráter meramente informativo e orientativo. Não substitui a consultoria de advogado ou especialista em compliance habilitado. As referências à legislação devem ser verificadas junto às fontes primárias antes de qualquer utilização profissional.
            </p>
          </div>

          {/* Botao final */}
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <button type="button" onClick={novaAnalise} className="btn-primary" style={{ padding: '10px 24px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <RotateCcw size={14} strokeWidth={1.75} aria-hidden />
              Nova análise
            </button>
          </div>
        </>
      )}

      {/* Estado vazio */}
      {!resultado && !loading && !erro && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 72, height: 72, borderRadius: '50%',
            background: 'var(--accent-light)', color: 'var(--accent)',
            marginBottom: 16,
          }}>
            <ShieldCheck size={32} strokeWidth={1.75} aria-hidden />
          </div>
          <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Mapeie riscos regulatórios com precisão</div>
          <div style={{ fontSize: 13 }}>Preencha a área, o tipo e descreva a operação acima para iniciar a análise</div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .compliance-exemplo-btn:hover {
          border-color: var(--accent) !important;
          background: var(--hover) !important;
        }
        @media (max-width: 768px) {
          .compliance-form-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { ShieldCheck, Zap, ArrowRight, AlertTriangle, Info, Clipboard, Check, RotateCcw, Clock, Gauge } from 'lucide-react'
import { AgentHero } from '@/components/AgentHero'
import { AgentProgress, AGENT_STEPS } from '@/components/AgentProgress'
import FontesCitadas, { type Fonte } from '@/components/FontesCitadas'

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

// Paleta noir-friendly — antes era light pastel Tailwind (mint/amber/rose/pink)
// que ficava ilegivel sobre noir. Agora champagne→copper→rose stone.
const SCORE_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  BAIXO:   { bg: 'rgba(158,194,139,0.12)', color: 'var(--success)', border: 'rgba(158,194,139,0.35)' },
  MEDIO:   { bg: 'rgba(212,174,106,0.12)', color: 'var(--warning)', border: 'rgba(212,174,106,0.35)' },
  ALTO:    { bg: 'rgba(199,138,97,0.14)',  color: '#c78a61', border: 'rgba(199,138,97,0.40)'  },
  CRITICO: { bg: 'rgba(216,137,119,0.14)', color: 'var(--danger)', border: 'rgba(216,137,119,0.40)' },
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
  // /api/compliance agora retorna { parecer, fontes, grounding_stats } com
  // legal-grounding wired (LGPD Lei 13.709 + Lei 12.846 + CC + CDC + CF/88
  // do corpus). Antes a UI ignorava fontes/stats — feature de grounding ficava
  // invisivel pro usuario.
  const [fontes, setFontes] = useState<Fonte[]>([])
  const [groundingStats, setGroundingStats] = useState<{ topScore?: number; provisions?: number; sumulas?: number } | null>(null)

  async function analisar() {
    if (loading || !descricao.trim()) return
    setLoading(true)
    setErro('')
    setResultado(null)
    setFontes([])
    setGroundingStats(null)

    try {
      const res = await fetch('/api/compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ area, tipo, descricao: descricao.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar análise de compliance.')
      if (!data.parecer) {
        throw new Error('A análise não foi gerada corretamente. Tente novamente.')
      }
      setResultado(data.parecer as ComplianceResult)
      if (Array.isArray(data.fontes)) setFontes(data.fontes)
      if (data.grounding_stats) setGroundingStats(data.grounding_stats)
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
    setFontes([])
    setGroundingStats(null)
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
      <AgentHero
        edition="Nº V"
        Icon={ShieldCheck}
        name="Compliance"
        discipline="Mapeamento regulatório integrado"
        description="Diagnóstico de exposição regulatória com foco em LGPD, anticorrupção e obrigações setoriais. Devolve score, pontos críticos e plano de ação priorizado."
        accent="pearl"
        meta={[
          { Icon: Clock, label: 'Tempo médio', value: '~50s' },
          { Icon: Gauge, label: 'Profundidade', value: '5 blocos' },
          { Icon: ShieldCheck, label: 'Compliance', value: 'LGPD + Lei 12.846' },
        ]}
        steps={[
          { n: 'I', title: 'Contextualize a operação', desc: 'Descreva atividade, dados tratados e setor regulado com o máximo de concretude.' },
          { n: 'II', title: 'Selecione foco', desc: 'Escolha área e tipo de análise para calibrar o recorte regulatório.' },
          { n: 'III', title: 'Receba o raio-X', desc: 'Exposições, riscos LGPD e anticorrupção, score e ações priorizadas.' },
        ]}
        examples={[
          { label: 'Fintech com dados sensíveis', prompt: 'Fintech de crédito consignado que coleta CPF, dados bancários e folha de pagamento de servidores públicos. Armazena em nuvem AWS São Paulo, compartilha com bureaus de crédito. Não possui DPO nomeado.' },
          { label: 'Clínica médica com prontuário digital', prompt: 'Clínica multidisciplinar com prontuário eletrônico, integração com operadoras de saúde e telemedicina. Coleta dados de saúde de pacientes (dados sensíveis LGPD). Sem política formal de retenção.' },
          { label: 'Distribuidor com pregão público', prompt: 'Distribuidora de equipamentos médicos que participa de pregões eletrônicos federais e estaduais. Intermediação comercial com hospitais públicos. Sem programa de integridade formalizado.' },
        ]}
        onExampleClick={setDescricao}
        shortcut="⌘⏎ analisar"
      />

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
        <div style={{ padding: '40px 0' }}>
          <AgentProgress loading steps={[...AGENT_STEPS.compliance]} />
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
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={analisar}
                disabled={loading}
                title="Gerar nova análise com a mesma operação"
                className="btn-secondary"
                style={{ fontSize: 12, padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: 6, opacity: loading ? 0.5 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
              >
                <RotateCcw size={14} strokeWidth={1.75} aria-hidden />
                Regenerar
              </button>
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

          {/* Fontes legais (legal-grounding) */}
          {fontes.length > 0 && (
            <FontesCitadas
              fontes={fontes}
              stats={groundingStats}
              title="Fundamentos regulatórios"
            />
          )}

          {/* Botao final */}
          <div style={{ textAlign: 'center', marginTop: 32 }}>
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

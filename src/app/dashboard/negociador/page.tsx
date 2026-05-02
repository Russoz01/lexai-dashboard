'use client'

import { useState, useEffect } from 'react'
import {
  CheckCircle2,
  Clock,
  Briefcase,
  Home,
  Landmark,
  FileText,
  Building2,
  Users,
  Lightbulb,
  AlertTriangle,
  Zap,
  RotateCcw,
  X,
  Inbox,
  Trash2,
  Handshake,
  ShieldCheck,
  Gauge,
} from 'lucide-react'
import ConfidenceBadge, { PoweredByPralvex } from '@/components/ConfidenceBadge'
import { useDraft, clearDraft } from '@/hooks/useDraft'
import { saveDraft, listDrafts, deleteDraft, type DraftRow } from '@/lib/drafts'
import { AgentHero } from '@/components/AgentHero'
import { AgentProgress, AGENT_STEPS } from '@/components/AgentProgress'

export default function NegociadorPage() {
  const [situacao, setSituacao] = useState('')
  const [loading, setLoading] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [resultado, setResultado] = useState<any>(null)
  const [erro, setErro] = useState('')
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null)
  const [savedBadge, setSavedBadge]         = useState(false)
  const [showDraftsModal, setShowDraftsModal] = useState(false)
  const [draftsList, setDraftsList]           = useState<DraftRow[]>([])
  const [loadingDrafts, setLoadingDrafts]     = useState(false)

  useDraft('pralvex-draft-negociador', situacao, setSituacao)

  useEffect(() => {
    if (!showDraftsModal) return
    let cancelled = false
    setLoadingDrafts(true)
    listDrafts('negociador')
      .then(rows => { if (!cancelled) setDraftsList(rows) })
      .finally(() => { if (!cancelled) setLoadingDrafts(false) })
    return () => { cancelled = true }
  }, [showDraftsModal])

  async function analisar() {
    if (!situacao.trim() || loading) return
    setLoading(true); setErro(''); setResultado(null); setSavedBadge(false)
    try {
      const res = await fetch('/api/negociar', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situacao }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro na análise de negociação')
      setResultado(data.resultado)
      clearDraft('pralvex-draft-negociador')

      // Fire-and-forget: save draft without blocking UI
      const titulo = (data.resultado?.estrategia?.tipo
        ? `Negociação: ${String(data.resultado.estrategia.tipo)}`
        : 'Estratégia de negociação')
      saveDraft('negociador', titulo, data.resultado)
        .then(row => {
          if (row) {
            setCurrentDraftId(row.id)
            setSavedBadge(true)
            setTimeout(() => setSavedBadge(false), 3500)
          }
        })
        .catch(err => console.error('[negociador/saveDraft]', err))
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro na análise')
    } finally { setLoading(false) }
  }

  function loadDraft(d: DraftRow) {
    try {
      setResultado(d.conteudo)
      setCurrentDraftId(d.id)
      setShowDraftsModal(false)
      setErro('')
    } catch {
      setErro('Não foi possível carregar o rascunho')
    }
  }

  async function handleDeleteDraft(id: string) {
    const ok = await deleteDraft(id)
    if (ok) {
      setDraftsList(list => list.filter(d => d.id !== id))
      if (currentDraftId === id) setCurrentDraftId(null)
    }
  }

  function fmtDate(iso: string) {
    try {
      const d = new Date(iso)
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
        ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    } catch { return iso }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = resultado as any

  return (
    <div className="page-content" style={{ maxWidth: '100%' }}>
      <AgentHero
        edition="Nº XXIV"
        Icon={Handshake}
        name="Negociador"
        discipline="Estratégia de acordo real"
        description="Análise de conflitos jurídicos com foco em negociação e mediação. Mapeia ZOPA, sugere estratégia por tipo de disputa, prevê cenários por probabilidade e risco, e devolve proposta de acordo calibrada com base em BATNA e critérios objetivos."
        accent="rose"
        meta={[
          { Icon: Clock, label: 'Tempo médio', value: '~45s' },
          { Icon: Gauge, label: 'Cenários', value: '3 probabilidades' },
          { Icon: ShieldCheck, label: 'Compliance', value: 'BATNA + ZOPA' },
        ]}
        steps={[
          { n: 'I', title: 'Descreva o conflito', desc: 'Partes, objeto, valor em disputa, histórico de acordo e posição do seu cliente.' },
          { n: 'II', title: 'Cenário comum ou custom', desc: 'Use um dos 6 modelos (trabalhista, aluguel, dívida, civil, empresarial, família) como base.' },
          { n: 'III', title: 'Receba a estratégia', desc: 'ZOPA, abordagem recomendada, cenários probabilísticos e proposta de acordo pronta.' },
        ]}
        examples={[
          { label: 'Rescisão contratual B2B', prompt: 'Cliente fornecedor descumpriu prazo de entrega causando perda de R$ 200 mil ao adquirente. Multa contratual prevista de 10%. Adquirente já contratou terceiro por R$ 90 mil. Buscamos acordo com pagamento parcelado da multa + ressarcimento dos danos, evitando ação judicial.' },
          { label: 'Revisão de dívida bancária', prompt: 'Cliente devedor de R$ 45 mil em cartão com juros abusivos aplicados ao longo de 24 meses. Banco ofereceu parcelar em 24x sem desconto. Buscamos revisão de juros (limite 2x SELIC), descontos progressivos e parcelamento em 36x para preservar capacidade financeira do cliente.' },
          { label: 'Pensão alimentícia após perda de emprego', prompt: 'Pai busca reduzir pensão de R$ 3.500 para R$ 1.800 após perda de emprego formal há 4 meses. Mãe quer manter valor atual. Filho de 8 anos. Renda atual do pai caiu 60% (está prestando serviço autônomo). Buscamos acordo proporcional à renda, com cláusula de revisão em 12 meses.' },
        ]}
        onExampleClick={setSituacao}
        shortcut="⌘⏎ analisar"
      />
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {savedBadge && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 12, fontWeight: 600, padding: '6px 12px',
              borderRadius: 20, background: 'var(--success-light)', color: 'var(--success)',
              border: '1px solid var(--success)',
            }}>
              <CheckCircle2 size={14} strokeWidth={1.75} aria-hidden /> Salvo como rascunho
            </span>
          )}
          <button
            type="button"
            onClick={() => setShowDraftsModal(true)}
            className="btn-ghost"
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '8px 14px' }}
          >
            <Clock size={14} strokeWidth={1.75} aria-hidden /> Meus rascunhos
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="redator-main-grid">
        {/* Input */}
        <div className="section-card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
            Descrição do Conflito
          </div>
          <textarea value={situacao} onChange={e => setSituacao(e.target.value)}
            maxLength={50000}
            placeholder={"Descreva a situação de conflito com detalhes:\n\n- Partes envolvidas\n- Objeto da disputa\n- Valor em discussão\n- Histórico de tentativas de acordo\n- Posição do seu cliente"}
            className="form-input" style={{ resize: 'vertical', minHeight: 280, fontFamily: "'DM Sans',sans-serif", fontSize: 13, lineHeight: 1.6 }} />
          <div style={{ fontSize: 11, color: situacao.length > 45000 ? 'var(--danger)' : situacao.length > 40000 ? '#f59e0b' : 'var(--text-muted)', textAlign: 'right', marginTop: 4 }}>
            {situacao.length.toLocaleString('pt-BR')} / 50.000
          </div>

          {/* Cenarios pre-prontos */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
              Cenários comuns &mdash; clique para usar como base
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {[
                { titulo: 'Trabalhista &mdash; horas extras', Icon: Briefcase, color: '#F59E0B', exemplo: 'Cliente trabalhou 3 anos como vendedor sem registro de horas extras. Reclama 18h semanais não pagas. Empresa oferece R$ 8 mil. Cálculo correto: ~R$ 35 mil. Buscamos acordo justo.' },
                { titulo: 'Aluguel &mdash; rescisão contratual', Icon: Home, color: '#06B6D4', exemplo: 'Inquilino quer rescindir contrato 6 meses antes. Fiador resiste à multa. Locador exige 3 aluguéis. Buscamos mediação para reduzir multa proporcionalmente.' },
                { titulo: 'Dívida bancária &mdash; renegociação', Icon: Landmark, color: '#22C55E', exemplo: 'Cliente devedor de R$ 45 mil em cartão com juros abusivos. Banco oferece parcelar em 24x sem desconto. Buscamos revisão de juros e parcelamento em 36x com descontos.' },
                { titulo: 'Civil &mdash; danos morais', Icon: FileText, color: '#44372b', exemplo: 'Cliente teve nome negativado indevidamente por serviço não contratado. Empresa nega responsabilidade. Buscamos acordo extrajudicial: indenização + retirada do nome.' },
                { titulo: 'Empresarial &mdash; quebra de contrato', Icon: Building2, color: '#EC4899', exemplo: 'Fornecedor descumpriu prazo de entrega causando perda de R$ 200 mil. Multa contratual prevista de 10%. Buscamos acordo com pagamento parcelado da multa + ressarcimento dos danos.' },
                { titulo: 'Família &mdash; pensão alimentícia', Icon: Users, color: '#8B5CF6', exemplo: 'Pai busca reduzir pensão após perda de emprego. Mãe quer manter valor atual. Filho de 8 anos. Renda atual do pai caiu 60%. Buscamos acordo proporcional à renda.' },
              ].map((ex, i) => {
                const Icon = ex.Icon
                return (
                  <button key={i} type="button" onClick={() => setSituacao(ex.exemplo)}
                    className="negociador-scenario"
                    style={{
                      textAlign: 'left', padding: '10px 12px', borderRadius: 8,
                      background: 'var(--hover)', border: '1px solid var(--border)',
                      color: 'var(--text-secondary)', cursor: 'pointer',
                      fontFamily: "'DM Sans', sans-serif", fontSize: 12, lineHeight: 1.4,
                      transition: 'transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease',
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                      // CSS var used by hover rule
                      ['--scenario-accent' as string]: ex.color,
                    }}>
                    <span style={{ width: 28, height: 28, flexShrink: 0, borderRadius: 8, background: `${ex.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                      <Icon size={13} strokeWidth={1.75} aria-hidden style={{ color: ex.color }} />
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* SAFE: ex.titulo e hardcoded em EXEMPLOS[] (linhas 185-190) com &mdash; entity. Audit 2026-05-02 confirmou nao vem de IA/DB. */}
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }} dangerouslySetInnerHTML={{ __html: ex.titulo }} />
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Clique para aplicar este modelo</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Dicas para uma negociacao eficaz */}
          <div style={{ marginTop: 16, padding: '14px 16px', borderRadius: 10, background: 'var(--accent-light)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Lightbulb size={14} strokeWidth={1.75} aria-hidden />Dicas para uma negociação eficaz
            </div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              <li><strong>Conheça seu BATNA</strong> &mdash; melhor alternativa caso a negociação falhe</li>
              <li><strong>Identifique a ZOPA</strong> &mdash; a zona onde os interesses das partes se sobrepõem</li>
              <li><strong>Separe pessoas de problemas</strong> &mdash; foque em interesses, não em posições</li>
              <li><strong>Use critérios objetivos</strong> &mdash; valores de mercado, jurisprudência, leis</li>
              <li><strong>Documente tudo</strong> &mdash; registre as concessões feitas e propostas trocadas</li>
              <li><strong>Tenha um plano B</strong> &mdash; medidas judiciais como último recurso</li>
            </ul>
          </div>
          {erro && (
            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--danger-light)', color: 'var(--danger)', fontSize: 13, marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={14} strokeWidth={1.75} aria-hidden /> {erro}
            </div>
          )}
          <button type="button" onClick={analisar} disabled={!situacao.trim() || loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>
            {loading ? <><span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Analisando estratégia...</>
              : <><Zap size={14} strokeWidth={1.75} aria-hidden /> Analisar Negociação</>}
          </button>
        </div>

        {/* Output */}
        <div className="section-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Estratégia de Negociação
            </div>
            {r && <ConfidenceBadge confianca={r?.confianca} />}
          </div>
          {loading ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, minHeight: 280 }}>
              <AgentProgress loading steps={[...AGENT_STEPS.negociador]} />
            </div>
          ) : r ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, overflowY: 'auto', maxHeight: 600 }}>
              {r.zopa ? <div style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--accent-light)', borderLeft: '3px solid var(--accent)' }}><strong style={{ color: 'var(--accent)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Zona de Acordo (ZOPA)</strong><p style={{ marginTop: 6 }}>{String(r.zopa)}</p></div> : null}
              {r.estrategia && typeof r.estrategia === 'object' && (() => {
                const estrategia = r.estrategia as { tipo?: string; abordagem?: string }
                return (
                <div style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--hover)' }}>
                  <strong style={{ color: 'var(--text-primary)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Estratégia Recomendada</strong>
                  <div style={{ marginTop: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: 'var(--accent-light)', color: 'var(--accent)' }}>{estrategia.tipo}</span>
                  </div>
                  <p style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>{estrategia.abordagem}</p>
                </div>
                )
              })()}
              {Array.isArray(r.cenarios) && r.cenarios.length > 0 && (
                <div style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--hover)' }}>
                  <strong style={{ color: 'var(--text-primary)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Cenários</strong>
                  <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {(r.cenarios as Array<{ probabilidade?: string; cenario?: string; risco?: string; titulo?: string; descricao?: string }>).map((c, i) => {
                      // Parse probabilidade — could be "60%", "60", "Alta", etc.
                      const raw = String(c.probabilidade ?? '')
                      const match = raw.match(/(\d{1,3})/)
                      let pct = match ? Math.min(100, Math.max(0, parseInt(match[1], 10))) : 0
                      if (!match) {
                        const low = raw.toLowerCase()
                        if (low.includes('alt')) pct = 80
                        else if (low.includes('med')) pct = 50
                        else if (low.includes('bai')) pct = 20
                      }
                      const riscoCor = c.risco === 'Alto' ? 'var(--danger)' : c.risco === 'Medio' ? 'var(--warning)' : 'var(--success)'
                      const riscoBg = c.risco === 'Alto' ? 'var(--danger-light)' : c.risco === 'Medio' ? 'var(--warning-light)' : 'var(--success-light)'
                      return (
                        <div key={i} style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                            <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: riscoBg, color: riscoCor }}>{c.risco}</span>
                            <span style={{ flex: 1, fontWeight: 500 }}>{c.cenario}</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: riscoCor }}>{raw || `${pct}%`}</span>
                          </div>
                          <div style={{ height: 6, width: '100%', borderRadius: 999, background: 'var(--border)', overflow: 'hidden' }} aria-hidden="true">
                            <div style={{
                              height: '100%',
                              width: `${pct}%`,
                              background: riscoCor,
                              borderRadius: 999,
                              transition: 'width 0.6s ease',
                            }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              {r.proposta_acordo ? <div style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--hover)', whiteSpace: 'pre-wrap' }}><strong style={{ color: 'var(--text-primary)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>Proposta de Acordo</strong>{String(r.proposta_acordo)}</div> : null}
              <button type="button" onClick={() => { setResultado(null); setSituacao('') }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: 11, background: 'none', border: '1px dashed var(--border)', borderRadius: 10, color: 'var(--text-muted)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                <RotateCcw size={14} strokeWidth={1.75} aria-hidden /> Nova análise
              </button>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <PoweredByPralvex />
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--text-muted)', minHeight: 280 }}>
              <Zap size={40} strokeWidth={1.75} aria-hidden style={{ opacity: 0.3 }} />
              <span style={{ fontSize: 13, textAlign: 'center' }}>Descreva a situação de conflito<br />e clique em Analisar</span>
            </div>
          )}
        </div>
      </div>
      {/* Modal: Meus rascunhos */}
      {showDraftsModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowDraftsModal(false)}>
          <div className="modal" style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <span className="modal-title">Meus rascunhos</span>
              <button className="modal-close" onClick={() => setShowDraftsModal(false)}><X size={14} strokeWidth={1.75} aria-hidden /></button>
            </div>
            <div className="modal-body">
              {loadingDrafts ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 30, color: 'var(--text-muted)', gap: 10 }}>
                  <span style={{ display: 'inline-block', width: 20, height: 20, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Carregando rascunhos...
                </div>
              ) : draftsList.length === 0 ? (
                <div style={{ padding: '32px 14px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Inbox size={40} strokeWidth={1.75} aria-hidden style={{ opacity: 0.4, display: 'block', margin: '0 auto 10px' }} />
                  <div style={{ fontSize: 13 }}>O rol de rascunhos está vazio.</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>Qualquer análise aqui é arquivada como rascunho.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 460, overflowY: 'auto' }}>
                  {draftsList.map(d => (
                    <div key={d.id} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 14px', borderRadius: 10,
                      border: '1px solid var(--border)', background: 'var(--card-bg)',
                      transition: 'all 0.15s',
                    }}>
                      <button
                        type="button"
                        onClick={() => loadDraft(d)}
                        style={{
                          flex: 1, textAlign: 'left', background: 'none', border: 'none',
                          cursor: 'pointer', padding: 0, fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                            {d.titulo || 'Sem título'}
                          </span>
                          <span style={{
                            fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 12,
                            background: 'var(--accent-light)', color: 'var(--accent)',
                          }}>v{d.versao}</span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={12} strokeWidth={1.75} aria-hidden />
                          {fmtDate(d.created_at)}
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDraft(d.id)}
                        title="Excluir rascunho"
                        style={{
                          width: 32, height: 32, borderRadius: 8,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: 'none', border: '1px solid var(--border)',
                          color: 'var(--text-muted)', cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'var(--danger-light)'
                          e.currentTarget.style.color = 'var(--danger)'
                          e.currentTarget.style.borderColor = 'var(--danger)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'none'
                          e.currentTarget.style.color = 'var(--text-muted)'
                          e.currentTarget.style.borderColor = 'var(--border)'
                        }}
                      >
                        <Trash2 size={14} strokeWidth={1.75} aria-hidden />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .negociador-scenario:hover {
          transform: translateY(-1px);
          border-color: var(--scenario-accent, var(--accent)) !important;
          box-shadow: 0 4px 14px -10px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  )
}

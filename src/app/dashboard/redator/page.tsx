'use client'

import { useState, useEffect } from 'react'
import ConfidenceBadge, { PoweredByLexAI } from '@/components/ConfidenceBadge'
import { useDraft, clearDraft } from '@/hooks/useDraft'
import { generateDocx, downloadBlob } from '@/lib/word-export'
import { saveDraft, listDrafts, deleteDraft, type DraftRow } from '@/lib/drafts'
import { SkeletonResult } from '@/components/Skeleton'

const TEMPLATES = [
  { id: 'peticao',      label: 'Petição Inicial',  icon: 'bi-file-earmark-text',  desc: 'Petição inicial para distribuição de ação' },
  { id: 'recurso',      label: 'Recurso',           icon: 'bi-arrow-counterclockwise', desc: 'Apelação, Agravo ou Recurso Especial' },
  { id: 'contestacao',  label: 'Contestação',       icon: 'bi-shield-check',       desc: 'Defesa do réu em resposta à petição' },
  { id: 'parecer',      label: 'Parecer Jurídico',  icon: 'bi-journal-text',       desc: 'Análise técnica de questão jurídica' },
  { id: 'contrato',     label: 'Contrato',          icon: 'bi-file-earmark-ruled', desc: 'Minutas e modelos contratuais' },
  { id: 'notificacao',  label: 'Notificação',       icon: 'bi-envelope-paper',     desc: 'Notificação extrajudicial' },
]

interface PecaResponse {
  titulo: string
  documento: string
  referencias_legais: string[]
  observacoes: string[]
  tipo: string
  confianca?: { nivel?: string; nota?: string }
}

export default function RedatorPage() {
  const [template, setTemplate]     = useState('')
  const [instrucoes, setInstrucoes] = useState('')
  const [gerando, setGerando]       = useState(false)
  const [peca, setPeca]             = useState<PecaResponse | null>(null)
  const [erro, setErro]             = useState('')
  const [copied, setCopied]         = useState(false)
  const [exportandoWord, setExportandoWord] = useState(false)
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null)
  const [savedBadge, setSavedBadge]         = useState(false)
  const [showDraftsModal, setShowDraftsModal] = useState(false)
  const [draftsList, setDraftsList]           = useState<DraftRow[]>([])
  const [loadingDrafts, setLoadingDrafts]     = useState(false)

  useDraft('lexai-draft-redator', instrucoes, setInstrucoes)

  useEffect(() => {
    if (!showDraftsModal) return
    let cancelled = false
    setLoadingDrafts(true)
    listDrafts('redator')
      .then(rows => { if (!cancelled) setDraftsList(rows) })
      .finally(() => { if (!cancelled) setLoadingDrafts(false) })
    return () => { cancelled = true }
  }, [showDraftsModal])

  async function gerar() {
    if (!template || !instrucoes.trim()) return
    setGerando(true); setPeca(null); setErro(''); setSavedBadge(false)

    try {
      const res = await fetch('/api/redigir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template, instrucoes }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar documento')
      setPeca(data.peca)
      clearDraft('lexai-draft-redator')

      // Fire-and-forget: save draft without blocking UI
      saveDraft('redator', data.peca?.titulo || 'Peca sem titulo', data.peca)
        .then(row => {
          if (row) {
            setCurrentDraftId(row.id)
            setSavedBadge(true)
            setTimeout(() => setSavedBadge(false), 3500)
          }
        })
        .catch(err => console.error('[redator/saveDraft]', err))
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao gerar peça')
    } finally {
      setGerando(false)
    }
  }

  function loadDraft(d: DraftRow) {
    try {
      setPeca(d.conteudo as PecaResponse)
      setCurrentDraftId(d.id)
      setShowDraftsModal(false)
      setErro('')
    } catch {
      setErro('Nao foi possivel carregar o rascunho')
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

  function copiarDocumento() {
    if (!peca) return
    navigator.clipboard.writeText(peca.documento)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleExportarWord() {
    if (!peca || exportandoWord) return
    setExportandoWord(true)
    try {
      const paragraphs = peca.documento.split(/\n\n+/).filter(p => p.trim())
      const sections = [{ paragraphs }]
      const blob = await generateDocx(peca.titulo || 'Peca Juridica', sections)
      const safeTitle = (peca.titulo || 'peca').replace(/[^\w\s-]/g, '').trim().slice(0, 60) || 'peca'
      downloadBlob(blob, `${safeTitle}.docx`)
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao exportar Word')
    } finally {
      setExportandoWord(false)
    }
  }

  return (
    <div className="page-content" style={{ maxWidth: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 12, fontWeight: 600, color: 'var(--accent)',
              letterSpacing: '0.5px', textTransform: 'uppercase',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
              Agente IA
            </span>
          </div>
          <h1 className="page-title">Redator Jurídico</h1>
          <p className="page-subtitle">Gere peças processuais completas com inteligência artificial</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {savedBadge && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 12, fontWeight: 600, padding: '6px 12px',
              borderRadius: 20, background: 'var(--success-light)', color: 'var(--success)',
              border: '1px solid var(--success)',
            }}>
              <i className="bi bi-check-circle-fill" /> Salvo como rascunho
            </span>
          )}
          <button
            type="button"
            onClick={() => setShowDraftsModal(true)}
            className="btn-ghost"
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '8px 14px' }}
          >
            <i className="bi bi-clock-history" /> Meus rascunhos
          </button>
        </div>
      </div>

      <div className="redator-main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Painel esquerdo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Seletor de template */}
          <div className="section-card" style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
              Tipo de Peça
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {TEMPLATES.map(t => {
                const isActive = template === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => setTemplate(t.id)}
                    className={`template-card${isActive ? ' is-active' : ''}`}
                  >
                    {isActive && (
                      <i className="bi bi-check-circle-fill template-card-check" />
                    )}
                    <i
                      className={`bi ${t.icon} template-card-icon`}
                      style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)' }}
                    />
                    <div
                      className="template-card-label"
                      style={{ color: isActive ? 'var(--accent)' : 'var(--text-primary)' }}
                    >
                      {t.label}
                    </div>
                    <div className="template-card-desc">{t.desc}</div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Instruções */}
          <div className="section-card" style={{ padding: '18px 20px', flex: 1 }}>
            <label className="form-label">Instruções e Fatos</label>
            <textarea
              value={instrucoes}
              onChange={e => setInstrucoes(e.target.value)}
              placeholder={`Descreva os fatos relevantes, partes envolvidas, pedidos e qualquer informação necessária para a elaboração da peça...\n\nEx: Autor: João Silva, CPF 123.456.789-00. Réu: Empresa XYZ Ltda. Fato: inadimplemento contratual desde jan/2024...`}
              className="form-input"
              style={{ resize: 'vertical', minHeight: 180, fontFamily: "'DM Sans',sans-serif", fontSize: 13, lineHeight: 1.6 }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 12, color: 'var(--text-muted)' }}>
              <span>{instrucoes.length > 0 ? `${instrucoes.length} caracteres` : 'Aguardando instruções...'}</span>
            </div>

            {/* Erro */}
            {erro && (
              <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--danger-light)', color: 'var(--danger)', fontSize: 13, marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="bi bi-exclamation-triangle-fill" /> {erro}
              </div>
            )}

            <button
              onClick={gerar}
              disabled={!template || !instrucoes.trim() || gerando}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}
            >
              {gerando
                ? <><svg width="17" height="17" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}><circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="2.5" strokeDasharray="40 20" strokeLinecap="round" /></svg> Gerando peça com IA...</>
                : <><i className="bi bi-magic" /> Gerar Peça</>
              }
            </button>
          </div>
        </div>

        {/* Painel direito — Preview */}
        <div className="section-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 8, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {peca ? peca.titulo : 'Prévia da Peça'}
              </div>
              {peca && <ConfidenceBadge confianca={peca?.confianca} />}
            </div>
            {peca && (
              <button className="btn-ghost" style={{ fontSize: 12, padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 5 }}
                onClick={copiarDocumento}>
                <i className={`bi ${copied ? 'bi-check2' : 'bi-clipboard'}`} /> {copied ? 'Copiado' : 'Copiar'}
              </button>
            )}
            {peca && (
              <button className="btn-ghost" style={{ fontSize: 12, padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 5, opacity: exportandoWord ? 0.7 : 1, cursor: exportandoWord ? 'default' : 'pointer' }}
                disabled={exportandoWord}
                onClick={handleExportarWord}>
                <i className="bi bi-file-word" /> {exportandoWord ? 'Exportando...' : 'Exportar Word'}
              </button>
            )}
            {peca && (
              <button className="btn-ghost" style={{ fontSize: 12, padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 5 }}
                onClick={() => window.print()}>
                <i className="bi bi-file-pdf" /> PDF
              </button>
            )}
          </div>

          {gerando ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Gerando peça...</div>
                <div style={{ fontSize: 13, marginTop: 4 }}>Elaborando com fundamentação legal</div>
              </div>
              <SkeletonResult />
            </div>
          ) : peca ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Documento */}
              <textarea readOnly value={peca.documento} style={{
                flex: 1, minHeight: 400, resize: 'none', border: 'none', outline: 'none',
                background: 'var(--input-bg)', borderRadius: 8, padding: 14,
                fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: 'var(--text-primary)',
                lineHeight: 1.7,
              }} />

              {/* Referências legais */}
              {peca.referencias_legais?.length > 0 && (
                <div style={{ padding: '12px 14px', borderRadius: 8, background: 'var(--accent-light)', borderLeft: '3px solid var(--accent)' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent)', marginBottom: 8 }}>
                    Referências Legais Citadas
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {peca.referencias_legais.map((ref, i) => (
                      <span key={i} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'var(--card-bg)', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        {ref}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Observações */}
              {peca.observacoes?.length > 0 && (
                <div style={{ padding: '12px 14px', borderRadius: 8, background: 'var(--warning-light)', borderLeft: '3px solid var(--warning)' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--warning)', marginBottom: 8 }}>
                    Pontos para Revisão
                  </div>
                  <ul style={{ margin: 0, padding: '0 0 0 16px', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {peca.observacoes.map((obs, i) => (
                      <li key={i}>{obs}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Nova peça */}
              <button
                onClick={() => { setPeca(null); setInstrucoes(''); setTemplate('') }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 8, width: '100%', padding: 11,
                  background: 'none', border: '1px dashed var(--border)',
                  borderRadius: 10, color: 'var(--text-muted)',
                  fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s ease',
                }}
              >
                <i className="bi bi-arrow-counterclockwise" /> Nova peça
              </button>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <PoweredByLexAI />
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--text-muted)', minHeight: 300 }}>
              <i className="bi bi-file-earmark-text" style={{ fontSize: 40, opacity: 0.3 }} />
              <span style={{ fontSize: 13, textAlign: 'center' }}>
                Selecione um template, informe os detalhes<br />e clique em &quot;Gerar Peça&quot;
              </span>
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
              <button className="modal-close" onClick={() => setShowDraftsModal(false)}><i className="bi bi-x" /></button>
            </div>
            <div className="modal-body">
              {loadingDrafts ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 30, color: 'var(--text-muted)', gap: 10 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
                    <circle cx="12" cy="12" r="10" stroke="var(--accent)" strokeWidth="2.5" strokeDasharray="40 20" strokeLinecap="round" />
                  </svg>
                  Carregando rascunhos...
                </div>
              ) : draftsList.length === 0 ? (
                <div style={{ padding: '32px 14px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <i className="bi bi-inbox" style={{ fontSize: 40, opacity: 0.4, display: 'block', marginBottom: 10 }} />
                  <div style={{ fontSize: 13 }}>Nenhum rascunho salvo ainda.</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>Gere uma peca para salvar automaticamente.</div>
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
                            {d.titulo || 'Sem titulo'}
                          </span>
                          <span style={{
                            fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 12,
                            background: 'var(--accent-light)', color: 'var(--accent)',
                          }}>v{d.versao}</span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          <i className="bi bi-clock" style={{ marginRight: 4 }} />
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
                        <i className="bi bi-trash" />
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
        @media (max-width: 768px) {
          .redator-main-grid { grid-template-columns: 1fr !important; }
        }
        .template-card {
          position: relative;
          padding: 12px 14px;
          border-radius: 10px;
          text-align: left;
          cursor: pointer;
          border: 1px solid var(--border);
          background: var(--card-bg);
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1),
                      box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1),
                      border-color 0.2s ease,
                      background 0.2s ease;
          font-family: 'DM Sans', sans-serif;
        }
        .template-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 22px rgba(15, 23, 42, 0.09),
                      0 2px 6px rgba(15, 23, 42, 0.04);
          border-color: var(--accent);
        }
        .template-card.is-active {
          transform: scale(1.02);
          border: 2.5px solid var(--accent);
          background: var(--accent-light);
          padding: 10px 12px;
          box-shadow: 0 6px 20px rgba(37, 99, 235, 0.14);
        }
        .template-card.is-active:hover {
          transform: scale(1.02) translateY(-1px);
        }
        .template-card-check {
          position: absolute;
          top: 8px;
          right: 10px;
          font-size: 15px;
          color: var(--accent);
          line-height: 1;
        }
        .template-card-icon {
          font-size: 16px;
          display: block;
          margin-bottom: 6px;
          line-height: 1;
        }
        .template-card-label {
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 2px;
        }
        .template-card-desc {
          font-size: 11px;
          color: var(--text-muted);
          line-height: 1.35;
        }
        @media (max-width: 640px) {
          .template-card { padding: 10px 12px; }
          .template-card.is-active { padding: 8px 10px; }
          .template-card-check { font-size: 13px; top: 6px; right: 8px; }
        }
      `}</style>
    </div>
  )
}

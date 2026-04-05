'use client'

import { useState } from 'react'

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
}

export default function RedatorPage() {
  const [template, setTemplate]     = useState('')
  const [instrucoes, setInstrucoes] = useState('')
  const [gerando, setGerando]       = useState(false)
  const [peca, setPeca]             = useState<PecaResponse | null>(null)
  const [erro, setErro]             = useState('')
  const [copied, setCopied]         = useState(false)

  async function gerar() {
    if (!template || !instrucoes.trim()) return
    setGerando(true); setPeca(null); setErro('')

    try {
      const res = await fetch('/api/redigir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template, instrucoes }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar documento')
      setPeca(data.peca)
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao gerar peça')
    } finally {
      setGerando(false)
    }
  }

  function copiarDocumento() {
    if (!peca) return
    navigator.clipboard.writeText(peca.documento)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="page-content" style={{ maxWidth: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
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

      <div className="redator-main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Painel esquerdo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Seletor de template */}
          <div className="section-card" style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
              Tipo de Peça
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {TEMPLATES.map(t => (
                <button key={t.id} onClick={() => setTemplate(t.id)} style={{
                  padding: '10px 12px', borderRadius: 8, textAlign: 'left', cursor: 'pointer',
                  border: template === t.id ? '2px solid var(--accent)' : '1px solid var(--border)',
                  background: template === t.id ? 'var(--accent-light)' : 'var(--card-bg)',
                  transition: 'all 0.15s',
                }}>
                  <i className={`bi ${t.icon}`} style={{ fontSize: 16, color: template === t.id ? 'var(--accent)' : 'var(--text-muted)', display: 'block', marginBottom: 6 }} />
                  <div style={{ fontSize: 12, fontWeight: 600, color: template === t.id ? 'var(--accent)' : 'var(--text-primary)', marginBottom: 2 }}>{t.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.3 }}>{t.desc}</div>
                </button>
              ))}
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {peca ? peca.titulo : 'Prévia da Peça'}
            </div>
            {peca && (
              <button className="btn-ghost" style={{ fontSize: 12, padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 5 }}
                onClick={copiarDocumento}>
                <i className={`bi ${copied ? 'bi-check2' : 'bi-clipboard'}`} /> {copied ? 'Copiado' : 'Copiar'}
              </button>
            )}
          </div>

          {gerando ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--text-muted)' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
                <circle cx="12" cy="12" r="10" stroke="var(--accent)" strokeWidth="2.5" strokeDasharray="40 20" strokeLinecap="round" />
              </svg>
              <div style={{ fontWeight: 600 }}>Gerando documento com IA...</div>
              <div style={{ fontSize: 13, textAlign: 'center', maxWidth: 260, lineHeight: 1.5 }}>
                Elaborando peça com fundamentação legal
              </div>
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

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .redator-main-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

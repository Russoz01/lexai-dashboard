'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

interface Analise {
  resumo: string
  tipo_documento: string
  pontos_principais: string[]
  riscos: string[]
  partes_envolvidas: string[]
  prazos_identificados: string[]
}

// ── Inline SVG da balança da justiça ──────────────────────────────────────
function ScalesIcon({ size = 48, color = 'currentColor', strokeWidth = 1.5 }: { size?: number; color?: string; strokeWidth?: number }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 100 100"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Apex */}
      <line x1="50" y1="6"  x2="43" y2="18" />
      <line x1="50" y1="6"  x2="57" y2="18" />
      {/* Beam */}
      <line x1="10" y1="18" x2="90" y2="18" />
      {/* Pillar */}
      <line x1="50" y1="18" x2="50" y2="90" />
      {/* Base */}
      <line x1="35" y1="90" x2="65" y2="90" />
      {/* Left chains */}
      <line x1="10" y1="18" x2="16" y2="48" />
      <line x1="10" y1="18" x2="4"  y2="48" />
      {/* Left pan */}
      <path d="M4,51 A9,9 0 0,0 22,51" />
      <line x1="4"  y1="51" x2="22" y2="51" />
      {/* Right chains */}
      <line x1="90" y1="18" x2="84" y2="48" />
      <line x1="90" y1="18" x2="96" y2="48" />
      {/* Right pan */}
      <path d="M78,51 A9,9 0 0,0 96,51" />
      <line x1="78" y1="51" x2="96" y2="51" />
    </svg>
  )
}

// ── Spinner SVG ───────────────────────────────────────────────────────────
function Spinner({ size = 18, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"
      style={{ animation: 'resumidor-spin 0.8s linear infinite', flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2.5" strokeDasharray="40 20" strokeLinecap="round" />
    </svg>
  )
}

// ── Collapse/Expand section ───────────────────────────────────────────────
function ResultSection({
  title, icon, items, accent, defaultOpen = true,
}: {
  title: string
  icon: React.ReactNode
  items: string[]
  accent: { bg: string; text: string; dot: string }
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  if (items.length === 0) return null

  return (
    <div style={{
      border: '1px solid var(--border)',
      borderRadius: '12px',
      overflow: 'hidden',
      background: 'var(--card-bg)',
      transition: 'background 0.2s',
    }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          gap: '10px', padding: '14px 18px',
          background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left',
          borderBottom: open ? '1px solid var(--border)' : 'none',
        }}
      >
        {icon}
        <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', flex: 1 }}>
          {title}
        </span>
        <span style={{
          background: accent.bg, color: accent.text,
          fontSize: '11px', fontWeight: 600,
          padding: '2px 8px', borderRadius: '10px', marginRight: '4px',
        }}>
          {items.length}
        </span>
        <i className={`bi bi-chevron-${open ? 'up' : 'down'}`}
          style={{ fontSize: '12px', color: 'var(--text-muted)' }} />
      </button>

      {open && (
        <ul style={{ padding: '10px', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {items.map((item, i) => (
            <li key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: '10px',
              padding: '10px 12px', borderRadius: '8px',
              background: accent.bg, fontSize: '13px', color: accent.text, lineHeight: 1.5,
            }}>
              <span style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: accent.dot, flexShrink: 0, marginTop: '5px',
              }} />
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
export default function ResumidorPage() {
  const supabase = createClient()

  const [texto, setTexto]     = useState('')
  const [titulo, setTitulo]   = useState('')
  const [loading, setLoading] = useState(false)
  const [analise, setAnalise] = useState<Analise | null>(null)
  const [erro, setErro]       = useState('')
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo]     = useState(false)
  const [copied, setCopied]   = useState(false)

  async function handleAnalisar() {
    if (!texto.trim() || loading) return
    setLoading(true)
    setErro('')
    setAnalise(null)
    setSalvo(false)

    try {
      const res  = await fetch('/api/resumir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro desconhecido')
      setAnalise(data.analise)
      if (!titulo) setTitulo(data.analise.tipo_documento || 'Documento analisado')
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao processar documento')
    } finally {
      setLoading(false)
    }
  }

  async function handleSalvar() {
    if (!analise || salvando || salvo) return
    setSalvando(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSalvando(false); return }

    await supabase.from('documentos').insert({
      usuario_id: user.id,
      titulo: titulo || 'Documento sem título',
      tipo: mapTipo(analise.tipo_documento),
      conteudo: texto,
      resumo: analise.resumo,
      pontos_principais: analise.pontos_principais.join('\n'),
      riscos: analise.riscos.join('\n'),
      status: 'concluido',
    })

    await supabase.from('historico').insert({
      usuario_id: user.id,
      agente: 'resumidor',
      mensagem_usuario: `Analisar: ${titulo || 'documento'}`,
      resposta_agente: analise.resumo,
    })

    setSalvo(true)
    setSalvando(false)
  }

  function handleCopiar() {
    if (!analise) return
    const texto = [
      `TIPO: ${analise.tipo_documento}`,
      `\nRESUMO:\n${analise.resumo}`,
      analise.pontos_principais.length ? `\nPONTOS PRINCIPAIS:\n${analise.pontos_principais.map(p => `• ${p}`).join('\n')}` : '',
      analise.riscos.length ? `\nRISCOS:\n${analise.riscos.map(r => `• ${r}`).join('\n')}` : '',
    ].filter(Boolean).join('\n')

    navigator.clipboard.writeText(texto)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function mapTipo(tipo: string): string {
    const t = tipo.toLowerCase()
    if (t.includes('contrat')) return 'contrato'
    if (t.includes('peti'))    return 'peticao'
    if (t.includes('acord') || t.includes('decis') || t.includes('senten')) return 'acordao'
    if (t.includes('lei') || t.includes('decreto') || t.includes('norma'))  return 'lei'
    return 'outro'
  }

  const charCount = texto.length

  return (
    <>
      {/* Keyframe for spinner */}
      <style>{`@keyframes resumidor-spin { to { transform: rotate(360deg); } }`}</style>

      <div className="page-content" style={{ maxWidth: '1200px' }}>

        {/* ── Page Header ── */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              fontSize: '12px', fontWeight: 600, color: 'var(--accent)',
              letterSpacing: '0.5px', textTransform: 'uppercase',
            }}>
              <span style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: 'var(--accent)', display: 'inline-block',
                animation: 'pulse 2s infinite',
              }} />
              Agente IA
            </span>
          </div>
          <h1 className="page-title">Resumidor Jurídico</h1>
          <p className="page-subtitle">
            Cole qualquer documento jurídico e a IA retornará uma análise estruturada completa
          </p>
        </div>

        {/* ── Split-view grid ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
          gap: '20px',
          alignItems: 'start',
        }}
          className="resumidor-grid"
        >

          {/* ════ LEFT — Input ════ */}
          <div className="section-card" style={{ display: 'flex', flexDirection: 'column' }}>

            <div className="section-header">
              <div>
                <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="bi bi-file-earmark-text" style={{ color: 'var(--accent)', fontSize: '15px' }} />
                  Documento
                </div>
                <div className="section-subtitle">Cole o texto completo abaixo</div>
              </div>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>

              {/* Título */}
              <div>
                <label className="form-label">Título do documento</label>
                <input
                  type="text"
                  value={titulo}
                  onChange={e => setTitulo(e.target.value)}
                  placeholder="Ex: Contrato de prestação de serviços — 2026"
                  className="form-input"
                />
              </div>

              {/* Textarea */}
              <div style={{ flex: 1 }}>
                <label className="form-label">Texto do documento</label>
                <textarea
                  value={texto}
                  onChange={e => setTexto(e.target.value)}
                  placeholder="Cole aqui o texto do contrato, petição, acórdão, lei, parecer ou qualquer documento jurídico..."
                  className="form-input"
                  style={{
                    minHeight: '320px',
                    resize: 'vertical',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '13px',
                    lineHeight: '1.7',
                  }}
                />
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  marginTop: '6px', fontSize: '12px', color: 'var(--text-muted)',
                }}>
                  <span>
                    {charCount > 0
                      ? `${charCount.toLocaleString('pt-BR')} caracteres`
                      : 'Aguardando documento...'}
                  </span>
                  {charCount > 0 && (
                    <button
                      onClick={() => { setTexto(''); setTitulo(''); setAnalise(null); setErro(''); setSalvo(false) }}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--danger)', fontSize: '12px', fontWeight: 500,
                        display: 'flex', alignItems: 'center', gap: '4px',
                      }}
                    >
                      <i className="bi bi-x-circle" /> Limpar
                    </button>
                  )}
                </div>
              </div>

              {/* Erro */}
              {erro && (
                <div style={{
                  padding: '12px 14px', borderRadius: '8px',
                  background: 'var(--danger-light)', color: 'var(--danger)',
                  fontSize: '13px', display: 'flex', alignItems: 'flex-start', gap: '8px',
                }}>
                  <i className="bi bi-exclamation-triangle-fill" style={{ marginTop: '1px', flexShrink: 0 }} />
                  {erro}
                </div>
              )}

              {/* Botão analisar */}
              <button
                onClick={handleAnalisar}
                disabled={loading || !texto.trim()}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '10px', width: '100%', padding: '13px',
                  background: (!texto.trim() || loading) ? 'var(--border)' : 'var(--accent)',
                  color: (!texto.trim() || loading) ? 'var(--text-muted)' : '#fff',
                  border: 'none', borderRadius: '10px',
                  fontSize: '14px', fontWeight: 600, cursor: loading || !texto.trim() ? 'not-allowed' : 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                  transition: 'all 0.15s ease',
                }}
              >
                {loading
                  ? <><Spinner size={17} color="var(--text-muted)" /> Analisando documento...</>
                  : <><i className="bi bi-cpu" /> Analisar Documento</>
                }
              </button>

            </div>
          </div>

          {/* ════ RIGHT — Result ════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Empty state */}
            {!analise && !loading && (
              <div className="section-card" style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '56px 24px', textAlign: 'center', minHeight: '320px',
              }}>
                <div style={{ opacity: 0.18, marginBottom: '20px' }}>
                  <ScalesIcon size={64} color="var(--accent)" strokeWidth={1.2} />
                </div>
                <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  A análise aparecerá aqui
                </p>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px', maxWidth: '240px', lineHeight: 1.5 }}>
                  Cole um documento no campo ao lado e clique em Analisar
                </p>
              </div>
            )}

            {/* Loading state */}
            {loading && (
              <div className="section-card" style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '56px 24px', minHeight: '320px',
              }}>
                <div style={{ marginBottom: '20px' }}>
                  <Spinner size={36} color="var(--accent)" />
                </div>
                <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Analisando documento...
                </p>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
                  Isso pode levar alguns segundos
                </p>

                {/* Progress hints */}
                <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '260px' }}>
                  {['Lendo estrutura do documento', 'Identificando cláusulas', 'Mapeando riscos', 'Gerando resumo'].map((step, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <span style={{
                        width: '6px', height: '6px', borderRadius: '50%',
                        background: 'var(--accent)', opacity: 0.4 + i * 0.15,
                        flexShrink: 0,
                      }} />
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Analysis result */}
            {analise && (
              <>
                {/* Header card — tipo + ações */}
                <div className="section-card">
                  <div style={{ padding: '16px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          background: 'var(--accent-light)', color: 'var(--accent)',
                          fontSize: '12px', fontWeight: 600,
                          padding: '4px 12px', borderRadius: '20px',
                          border: '1px solid rgba(45,106,79,0.2)',
                        }}>
                          <ScalesIcon size={13} color="var(--accent)" strokeWidth={2} />
                          {analise.tipo_documento}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          onClick={handleCopiar}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '7px 14px', borderRadius: '8px',
                            background: 'none', border: '1px solid var(--border)',
                            color: copied ? 'var(--accent)' : 'var(--text-secondary)',
                            fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                            fontFamily: "'DM Sans', sans-serif",
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <i className={`bi bi-${copied ? 'check2' : 'clipboard'}`} />
                          {copied ? 'Copiado' : 'Copiar'}
                        </button>
                        <button
                          onClick={handleSalvar}
                          disabled={salvando || salvo}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '7px 14px', borderRadius: '8px',
                            background: salvo ? 'var(--accent-light)' : 'var(--accent)',
                            border: salvo ? '1px solid rgba(45,106,79,0.3)' : 'none',
                            color: salvo ? 'var(--accent)' : '#fff',
                            fontSize: '13px', fontWeight: 600, cursor: (salvando || salvo) ? 'default' : 'pointer',
                            fontFamily: "'DM Sans', sans-serif",
                            opacity: salvando ? 0.7 : 1,
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {salvo
                            ? <><i className="bi bi-check-circle-fill" /> Salvo</>
                            : salvando
                            ? <><Spinner size={14} color="var(--accent)" /> Salvando...</>
                            : <><i className="bi bi-floppy" /> Salvar</>
                          }
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resumo executivo */}
                <div className="section-card">
                  <div className="section-header">
                    <div>
                      <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className="bi bi-text-paragraph" style={{ color: 'var(--accent)' }} />
                        Resumo Executivo
                      </div>
                      <div className="section-subtitle">Síntese gerada pela IA</div>
                    </div>
                  </div>
                  <div style={{ padding: '18px 20px' }}>
                    <p style={{
                      fontSize: '14px', color: 'var(--text-primary)',
                      lineHeight: '1.75', whiteSpace: 'pre-wrap',
                    }}>
                      {analise.resumo}
                    </p>
                  </div>
                </div>

                {/* Pontos Principais */}
                <ResultSection
                  title="Pontos Principais"
                  icon={<i className="bi bi-check-circle-fill" style={{ color: '#2d6a4f', fontSize: '14px' }} />}
                  items={analise.pontos_principais}
                  accent={{ bg: 'var(--accent-light)', text: 'var(--accent)', dot: 'var(--accent)' }}
                  defaultOpen
                />

                {/* Riscos e Cláusulas */}
                <ResultSection
                  title="Riscos e Cláusulas Importantes"
                  icon={<i className="bi bi-exclamation-triangle-fill" style={{ color: 'var(--warning)', fontSize: '14px' }} />}
                  items={analise.riscos}
                  accent={{ bg: 'var(--warning-light)', text: 'var(--warning)', dot: 'var(--warning)' }}
                  defaultOpen
                />

                {/* Partes Envolvidas */}
                <ResultSection
                  title="Partes Envolvidas"
                  icon={<i className="bi bi-people-fill" style={{ color: '#4f46e5', fontSize: '14px' }} />}
                  items={analise.partes_envolvidas}
                  accent={{ bg: '#eef2ff', text: '#4f46e5', dot: '#4f46e5' }}
                  defaultOpen={false}
                />

                {/* Prazos Identificados */}
                <ResultSection
                  title="Prazos Identificados"
                  icon={<i className="bi bi-calendar-event-fill" style={{ color: 'var(--danger)', fontSize: '14px' }} />}
                  items={analise.prazos_identificados}
                  accent={{ bg: 'var(--danger-light)', text: 'var(--danger)', dot: 'var(--danger)' }}
                  defaultOpen={false}
                />

                {/* Nova análise */}
                <button
                  onClick={() => { setAnalise(null); setTexto(''); setTitulo(''); setSalvo(false) }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '8px', width: '100%', padding: '11px',
                    background: 'none', border: '1px dashed var(--border)',
                    borderRadius: '10px', color: 'var(--text-muted)',
                    fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)' }}
                >
                  <i className="bi bi-arrow-counterclockwise" /> Nova análise
                </button>

              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile responsive styles ── */}
      <style>{`
        @media (max-width: 768px) {
          .resumidor-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  )
}

'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import ConfidenceBadge, { PoweredByLexAI } from '@/components/ConfidenceBadge'
import { toast } from '@/components/Toast'
import { useDraft, clearDraft } from '@/hooks/useDraft'
import { generateDocx, downloadBlob } from '@/lib/word-export'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Analise = any

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
  const [exportandoWord, setExportandoWord] = useState(false)
  const [compartilhando, setCompartilhando] = useState(false)

  useDraft('lexai-draft-resumidor', texto, setTexto)

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
      if (!titulo) setTitulo(data.analise.classificacao?.tipo || data.analise.tipo_documento || 'Documento analisado')
      toast('success', 'Documento analisado com sucesso')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro ao processar documento'
      setErro(msg)
      toast('error', msg)
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
      tipo: mapTipo(analise.classificacao?.tipo || analise.tipo_documento || ''),
      conteudo: texto,
      resumo: analise.objeto || analise.resumo || '',
      pontos_principais: (analise.pontos_principais || analise.pontos_chave || []).join?.('\n') || '',
      riscos: (analise.riscos || []).map?.((r: any) => typeof r === 'string' ? r : r.descricao || '').join('\n') || '',
      status: 'concluido',
    })

    await supabase.from('historico').insert({
      usuario_id: user.id,
      agente: 'resumidor',
      mensagem_usuario: `Analisar: ${titulo || 'documento'}`,
      resposta_agente: analise.objeto || analise.resumo || '',
    })

    setSalvo(true)
    setSalvando(false)
    clearDraft('lexai-draft-resumidor')
    toast('success', 'Documento salvo no historico')
  }

  async function handleExportarWord() {
    if (!analise || exportandoWord) return
    setExportandoWord(true)
    try {
      const sections: Array<{ heading?: string; paragraphs: string[] }> = []

      const tipoDoc = analise.classificacao?.tipo || analise.tipo_documento || 'Documento'
      const docTitle = titulo || tipoDoc || 'Documento analisado'

      // Objeto / resumo
      const objetoText = analise.objeto || analise.resumo || analise.conclusao
      if (objetoText) {
        sections.push({
          heading: 'Resumo Executivo',
          paragraphs: String(objetoText).split(/\n\n+/),
        })
      }

      // Pontos principais
      const pontos = analise.pontos_principais || analise.pontos_chave || []
      if (Array.isArray(pontos) && pontos.length > 0) {
        sections.push({
          heading: 'Pontos Principais',
          paragraphs: pontos.map((p: unknown, i: number) =>
            `${i + 1}. ${typeof p === 'string' ? p : String(p)}`
          ),
        })
      }

      // Riscos
      const riscos = analise.riscos || []
      if (Array.isArray(riscos) && riscos.length > 0) {
        sections.push({
          heading: 'Riscos e Clausulas Importantes',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          paragraphs: riscos.map((r: any, i: number) => {
            if (typeof r === 'string') return `${i + 1}. ${r}`
            const grav = r.gravidade ? `[${String(r.gravidade).toUpperCase()}] ` : ''
            const desc = r.descricao || String(r)
            const mit = r.mitigacao ? ` — Mitigacao: ${r.mitigacao}` : ''
            return `${i + 1}. ${grav}${desc}${mit}`
          }),
        })
      }

      // Prazos
      const prazos = analise.prazos_identificados || analise.prazos || []
      if (Array.isArray(prazos) && prazos.length > 0) {
        sections.push({
          heading: 'Prazos Identificados',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          paragraphs: prazos.map((p: any, i: number) => {
            if (typeof p === 'string') return `${i + 1}. ${p}`
            const evento = p.prazo || p.evento || ''
            const data = p.data ? ` (${p.data})` : ''
            const base = p.base_legal || p.clausula ? ` — ${p.base_legal || p.clausula}` : ''
            const conseq = p.consequencia ? ` | Consequencia: ${p.consequencia}` : ''
            return `${i + 1}. ${evento}${data}${base}${conseq}`
          }),
        })
      }

      // Fundamentacao legal
      const fundamentacao = analise.fundamentacao_legal || analise.fundamentacao || []
      if (Array.isArray(fundamentacao) && fundamentacao.length > 0) {
        sections.push({
          heading: 'Fundamentacao Legal',
          paragraphs: fundamentacao.map((f: unknown, i: number) =>
            `${i + 1}. ${typeof f === 'string' ? f : String(f)}`
          ),
        })
      }

      // Conclusao
      if (analise.conclusao && analise.conclusao !== objetoText) {
        sections.push({
          heading: 'Conclusao',
          paragraphs: String(analise.conclusao).split(/\n\n+/),
        })
      }

      const blob = await generateDocx(docTitle, sections)
      const safeTitle = docTitle.replace(/[^\w\s-]/g, '').trim().slice(0, 60) || 'documento'
      downloadBlob(blob, `${safeTitle}.docx`)
      toast('success', 'Documento Word exportado')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro ao exportar Word'
      toast('error', msg)
    } finally {
      setExportandoWord(false)
    }
  }

  function handleCopiar() {
    if (!analise) return
    const texto = [
      `TIPO: ${analise.classificacao?.tipo || analise.tipo_documento || ''}`,
      `\nRESUMO:\n${analise.objeto || analise.resumo || ''}`,
      (analise.pontos_principais || analise.pontos_chave || []).length ? `\nPONTOS PRINCIPAIS:\n${(analise.pontos_principais || analise.pontos_chave || []).map((p: string) => `- ${p}`).join('\n')}` : '',
      (analise.riscos || []).length ? `\nRISCOS:\n${(analise.riscos || []).map((r: any) => `- ${typeof r === 'string' ? r : r.descricao || r}`).join('\n')}` : '',
      analise.conclusao ? `\nCONCLUSAO:\n${analise.conclusao}` : '',
    ].filter(Boolean).join('\n')

    navigator.clipboard.writeText(texto)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast('info', 'Analise copiada para a area de transferencia')
  }

  async function handleCompartilhar() {
    if (!analise || compartilhando) return
    setCompartilhando(true)
    try {
      const shareTitulo = titulo || analise.classificacao?.tipo || analise.tipo_documento || 'Documento analisado'
      const res = await fetch('/api/share/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: String(shareTitulo).slice(0, 200),
          conteudo: analise,
          tipo: 'analise',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao criar link')

      await navigator.clipboard.writeText(data.url)
      toast('success', 'Link copiado! Valido por 7 dias')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro ao compartilhar'
      toast('error', msg)
    } finally {
      setCompartilhando(false)
    }
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
                  onKeyDown={e => {
                    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                      e.preventDefault()
                      handleAnalisar()
                    }
                  }}
                  placeholder="Cole aqui o texto do contrato, petição, acórdão, lei, parecer ou qualquer documento jurídico... (Ctrl+Enter para analisar)"
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
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Exemplos:</span>
                  {['Contrato de prestacao de servicos', 'Peticao inicial indenizacao', 'Acordao do STJ'].map((ex, i) => (
                    <button key={i} type="button" onClick={() => setTexto(ex)}
                      style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'var(--hover)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                      {ex}
                    </button>
                  ))}
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          background: 'var(--accent-light)', color: 'var(--accent)',
                          fontSize: '12px', fontWeight: 600,
                          padding: '4px 12px', borderRadius: '20px',
                          border: '1px solid rgba(45,106,79,0.2)',
                        }}>
                          <ScalesIcon size={13} color="var(--accent)" strokeWidth={2} />
                          {analise.classificacao?.tipo || analise.tipo_documento || 'Documento'}
                        </span>
                        {(analise.ramo_direito || analise.classificacao?.jurisdicao) && (
                          <span style={{
                            fontSize: '11px', fontWeight: 600,
                            padding: '3px 10px', borderRadius: '20px',
                            background: '#eef2ff', color: '#4f46e5',
                          }}>
                            {analise.ramo_direito || analise.classificacao?.jurisdicao || ''}
                          </span>
                        )}
                        <ConfidenceBadge confianca={analise?.confianca} />
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
                        <button
                          onClick={() => window.print()}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '7px 14px', borderRadius: '8px',
                            background: 'none', border: '1px solid var(--border)',
                            color: 'var(--text-secondary)',
                            fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                            fontFamily: "'DM Sans', sans-serif",
                          }}
                        >
                          <i className="bi bi-file-pdf" /> Exportar PDF
                        </button>
                        <button
                          onClick={handleExportarWord}
                          disabled={exportandoWord}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '7px 14px', borderRadius: '8px',
                            background: 'none', border: '1px solid var(--border)',
                            color: 'var(--text-secondary)',
                            fontSize: '13px', fontWeight: 500,
                            cursor: exportandoWord ? 'default' : 'pointer',
                            fontFamily: "'DM Sans', sans-serif",
                            opacity: exportandoWord ? 0.7 : 1,
                          }}
                        >
                          {exportandoWord
                            ? <><Spinner size={14} color="var(--text-muted)" /> Exportando...</>
                            : <><i className="bi bi-file-word" /> Exportar Word</>
                          }
                        </button>
                        <button
                          onClick={handleCompartilhar}
                          disabled={compartilhando}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '7px 14px', borderRadius: '8px',
                            background: 'none', border: '1px solid var(--border)',
                            color: 'var(--text-secondary)',
                            fontSize: '13px', fontWeight: 500,
                            cursor: compartilhando ? 'default' : 'pointer',
                            fontFamily: "'DM Sans', sans-serif",
                            opacity: compartilhando ? 0.7 : 1,
                          }}
                        >
                          {compartilhando
                            ? <><Spinner size={14} color="var(--text-muted)" /> Gerando link...</>
                            : <><i className="bi bi-link-45deg" /> Compartilhar link</>
                          }
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Deadline Alert — appears when any deadlines were extracted */}
                {(() => {
                  const prazos = analise.prazos_identificados || analise.prazos || []
                  if (!prazos.length) return null
                  return (
                    <div className="urgent-deadline" style={{ marginBottom: 0 }}>
                      <div className="deadline-label">
                        <i className="bi bi-clock-history" />
                        {prazos.length} prazo(s) detectado(s) automaticamente
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        A LexAI extraiu prazos importantes deste documento. Verifique a sessao &quot;Prazos Identificados&quot; abaixo e considere adicionar ao seu calendario para nao perder datas criticas.
                      </div>
                    </div>
                  )
                })()}

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
                      {analise.objeto || analise.resumo || analise.conclusao || 'Analise concluida'}
                    </p>
                  </div>
                </div>

                {/* Pontos Principais */}
                <ResultSection
                  title="Pontos Principais"
                  icon={<i className="bi bi-check-circle-fill" style={{ color: '#2d6a4f', fontSize: '14px' }} />}
                  items={analise.pontos_principais || analise.pontos_chave || []}
                  accent={{ bg: 'var(--accent-light)', text: 'var(--accent)', dot: 'var(--accent)' }}
                  defaultOpen
                />

                {/* Riscos e Cláusulas */}
                <ResultSection
                  title="Riscos e Cláusulas Importantes"
                  icon={<i className="bi bi-exclamation-triangle-fill" style={{ color: 'var(--warning)', fontSize: '14px' }} />}
                  items={(analise.riscos || []).map((r: any) => typeof r === 'string' ? r : `[${(r.gravidade || 'INFO').toUpperCase()}] ${r.descricao || r}${r.mitigacao ? ` — ${r.mitigacao}` : ''}`)}
                  accent={{ bg: 'var(--warning-light)', text: 'var(--warning)', dot: 'var(--warning)' }}
                  defaultOpen
                />

                {/* Partes Envolvidas */}
                <ResultSection
                  title="Partes Envolvidas"
                  icon={<i className="bi bi-people-fill" style={{ color: '#4f46e5', fontSize: '14px' }} />}
                  items={(analise.partes_envolvidas || analise.partes || []).map((p: any) => typeof p === 'string' ? p : `${p.nome || p} — ${p.qualificacao || p.documento || ''}`)}
                  accent={{ bg: '#eef2ff', text: '#4f46e5', dot: '#4f46e5' }}
                  defaultOpen={false}
                />

                {/* Prazos Identificados — sempre aberto por importancia */}
                <ResultSection
                  title="Prazos Identificados"
                  icon={<i className="bi bi-calendar-event-fill" style={{ color: 'var(--danger)', fontSize: '14px' }} />}
                  items={(analise.prazos_identificados || analise.prazos || []).map((p: any) => typeof p === 'string' ? p : `${p.prazo || p.evento || p} (${p.data || ''})${p.base_legal || p.clausula ? ` — ${p.base_legal || p.clausula}` : ''}${p.consequencia ? ` | Consequencia: ${p.consequencia}` : ''}`)}
                  accent={{ bg: 'var(--danger-light)', text: 'var(--danger)', dot: 'var(--danger)' }}
                  defaultOpen
                />

                {/* Fundamentação Legal */}
                {(analise.fundamentacao_legal || analise.fundamentacao || [])?.length > 0 && (
                  <ResultSection
                    title="Fundamentação Legal"
                    icon={<i className="bi bi-book-fill" style={{ color: '#2d6a4f', fontSize: '14px' }} />}
                    items={analise.fundamentacao_legal || analise.fundamentacao || []}
                    accent={{ bg: 'var(--accent-light)', text: 'var(--accent)', dot: 'var(--accent)' }}
                    defaultOpen={false}
                  />
                )}

                {/* Sugestões */}
                {analise.sugestoes?.length > 0 && (
                  <ResultSection
                    title="Sugestões e Recomendações"
                    icon={<i className="bi bi-lightbulb-fill" style={{ color: '#e67e22', fontSize: '14px' }} />}
                    items={analise.sugestoes}
                    accent={{ bg: '#fef5e7', text: '#e67e22', dot: '#e67e22' }}
                    defaultOpen={false}
                  />
                )}

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

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
                  <PoweredByLexAI />
                </div>

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

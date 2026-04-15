'use client'

import { useMemo, useRef, useState } from 'react'
import * as Papa from 'papaparse'
import ConfidenceBadge, { PoweredByLexAI } from '@/components/ConfidenceBadge'
import { toast } from '@/components/Toast'
import { useDraft, clearDraft } from '@/hooks/useDraft'

// ── Diff helpers ────────────────────────────────────────────────────────────
const DIFF_MAX_ROWS = 50

function parseCsvSafe(csv: string): string[][] {
  if (!csv) return []
  try {
    const parsed = Papa.parse<string[]>(csv, { skipEmptyLines: true })
    return (parsed.data as string[][]) || []
  } catch {
    return []
  }
}

interface DiffStats {
  celulasModificadas: number
  linhasAdicionadas: number
  linhasRemovidas: number
  totalLinhas: number
}

function computeDiffStats(orig: string[][], melh: string[][]): DiffStats {
  const totalLinhas = Math.max(orig.length, melh.length)
  let celulasModificadas = 0
  const minRows = Math.min(orig.length, melh.length)
  for (let i = 0; i < minRows; i++) {
    const a = orig[i] || []
    const b = melh[i] || []
    const cols = Math.max(a.length, b.length)
    for (let j = 0; j < cols; j++) {
      if ((a[j] ?? '') !== (b[j] ?? '')) celulasModificadas++
    }
  }
  const linhasAdicionadas = Math.max(0, melh.length - orig.length)
  const linhasRemovidas = Math.max(0, orig.length - melh.length)
  return { celulasModificadas, linhasAdicionadas, linhasRemovidas, totalLinhas }
}

// ── Types ──────────────────────────────────────────────────────────────────
interface Estrutura {
  linhas: number
  colunas: number
  headers: string[]
}
interface Problema {
  tipo: string
  descricao: string
  severidade: 'critico' | 'alto' | 'medio' | 'baixo' | string
  sugestao: string
}
interface Melhoria {
  categoria: string
  descricao: string
  exemplo: string
}
interface FormulaSugerida {
  celula: string
  formula: string
  descricao: string
}
interface Analise {
  sumario: string
  estrutura: Estrutura
  insights: string[]
  problemas: Problema[]
  melhorias: Melhoria[]
  formulas_sugeridas: FormulaSugerida[]
  versao_melhorada: string
  confianca?: { nivel?: string; nota?: string }
  erro_parse?: boolean
}

// ── Spinner ─────────────────────────────────────────────────────────────────
function Spinner({ size = 18, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"
      style={{ animation: 'planilhas-spin 0.8s linear infinite', flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2.5" strokeDasharray="40 20" strokeLinecap="round" />
    </svg>
  )
}

// ── File parser ─────────────────────────────────────────────────────────────
async function parseFile(file: File): Promise<string> {
  const lower = file.name.toLowerCase()
  if (lower.endsWith('.csv') || file.type === 'text/csv') {
    const raw = await file.text()
    // Round-trip through papaparse to normalize line endings + escaping
    try {
      const parsed = Papa.parse<string[]>(raw, { skipEmptyLines: true })
      if (parsed.errors && parsed.errors.length > 0) {
        // Still return raw if parser errored — let server handle it
        return raw
      }
      return Papa.unparse(parsed.data as unknown[][])
    } catch {
      return raw
    }
  }
  // .xlsx / .xls / others — try SheetJS (dynamic import keeps it out of main bundle)
  const XLSX = await import('xlsx')
  const buffer = await file.arrayBuffer()
  const wb = XLSX.read(buffer, { type: 'array' })
  const firstSheetName = wb.SheetNames[0]
  if (!firstSheetName) throw new Error('Arquivo nao contem nenhuma planilha legivel.')
  const firstSheet = wb.Sheets[firstSheetName]
  return XLSX.utils.sheet_to_csv(firstSheet)
}

// ── Severity styling ─────────────────────────────────────────────────────────
function severityStyle(sev: string): { bg: string; color: string; border: string; label: string; icon: string } {
  const s = (sev || '').toLowerCase()
  if (s === 'critico') return { bg: 'rgba(220,38,38,0.1)', color: '#dc2626', border: 'rgba(220,38,38,0.3)', label: 'CRITICO', icon: 'bi-exclamation-octagon-fill' }
  if (s === 'alto')    return { bg: 'rgba(234,88,12,0.1)', color: '#ea580c', border: 'rgba(234,88,12,0.3)', label: 'ALTO', icon: 'bi-exclamation-triangle-fill' }
  if (s === 'medio')   return { bg: 'rgba(202,138,4,0.1)', color: '#ca8a04', border: 'rgba(202,138,4,0.3)', label: 'MEDIO', icon: 'bi-info-circle-fill' }
  if (s === 'baixo')   return { bg: 'rgba(100,116,139,0.1)', color: '#64748b', border: 'rgba(100,116,139,0.3)', label: 'BAIXO', icon: 'bi-circle-fill' }
  return { bg: 'var(--hover)', color: 'var(--text-muted)', border: 'var(--border)', label: (sev || 'INFO').toUpperCase(), icon: 'bi-dash-circle' }
}

// ─────────────────────────────────────────────────────────────────────────────
export default function PlanilhasPage() {
  const [csvText, setCsvText]       = useState('')
  const [filename, setFilename]     = useState('')
  const [instruction, setInstruction] = useState('')
  const [loading, setLoading]       = useState(false)
  const [analise, setAnalise]       = useState<Analise | null>(null)
  const [erro, setErro]             = useState('')
  const [dragOver, setDragOver]     = useState(false)
  const [parsing, setParsing]       = useState(false)
  const [copied, setCopied]         = useState(false)
  const [showDiff, setShowDiff]     = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // ── Diff visual ─────────────────────────────────────────────────────────
  const diffData = useMemo(() => {
    if (!analise?.versao_melhorada) return null
    const orig = parseCsvSafe(csvText)
    const melh = parseCsvSafe(analise.versao_melhorada)
    if (orig.length === 0 && melh.length === 0) return null
    const stats = computeDiffStats(orig, melh)
    return { orig, melh, stats }
  }, [csvText, analise?.versao_melhorada])

  // Auto-save the user instruction draft
  useDraft('lexai-draft-planilhas-instruction', instruction, setInstruction)

  async function handleFile(file: File | null | undefined) {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast('error', 'Arquivo muito grande. O limite e 5 MB.')
      return
    }
    setParsing(true)
    setErro('')
    try {
      const text = await parseFile(file)
      if (text.length > 1_000_000) {
        toast('error', 'Conteudo da planilha excede 1 MB. Reduza o numero de linhas/colunas.')
        return
      }
      setCsvText(text)
      setFilename(file.name)
      toast('success', `Arquivo "${file.name}" carregado`)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Nao foi possivel ler o arquivo.'
      setErro(msg)
      toast('error', msg)
    } finally {
      setParsing(false)
    }
  }

  async function handleAnalisar() {
    if (!csvText.trim() || loading) return
    setLoading(true)
    setErro('')
    setAnalise(null)
    try {
      const res = await fetch('/api/planilhas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: csvText,
          filename: filename || undefined,
          instruction: instruction || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro desconhecido')
      setAnalise(data.analise as Analise)
      clearDraft('lexai-draft-planilhas-instruction')
      toast('success', 'Planilha analisada com sucesso')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro ao processar planilha'
      setErro(msg)
      toast('error', msg)
    } finally {
      setLoading(false)
    }
  }

  function handleCopiarMelhorada() {
    if (!analise) return
    navigator.clipboard.writeText(analise.versao_melhorada)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast('info', 'Versao melhorada copiada para a area de transferencia')
  }

  function handleDownloadMelhorada() {
    if (!analise) return
    const blob = new Blob([analise.versao_melhorada], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const safe = (filename || 'planilha').replace(/\.[^.]+$/, '').replace(/[^\w\s-]/g, '').trim().slice(0, 60) || 'planilha'
    const a = document.createElement('a')
    a.href = url
    a.download = `${safe}-melhorada.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast('success', 'Download iniciado')
  }

  function handleLimpar() {
    setCsvText('')
    setFilename('')
    setInstruction('')
    setAnalise(null)
    setErro('')
  }

  const charCount = csvText.length

  return (
    <>
      <style>{`@keyframes planilhas-spin { to { transform: rotate(360deg); } }`}</style>

      <div className="page-content" style={{ maxWidth: 1200 }}>
        {/* ── Header ── */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 12, fontWeight: 600, color: 'var(--accent)',
              letterSpacing: '0.5px', textTransform: 'uppercase',
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: 'var(--accent)', display: 'inline-block',
                animation: 'pulse 2s infinite',
              }} />
              Agente IA
            </span>
          </div>
          <h1 className="page-title">Planilhas</h1>
          <p className="page-subtitle">
            Analise, melhore e otimize suas planilhas com IA
          </p>
        </div>

        <div
          className="planilhas-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
            gap: 20,
            alignItems: 'start',
          }}
        >
          {/* ════ LEFT — Input ════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Drag-and-drop card */}
            <div className="section-card" style={{ padding: 0 }}>
              <div className="section-header">
                <div>
                  <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <i className="bi bi-file-earmark-spreadsheet" style={{ color: 'var(--accent)', fontSize: 15 }} />
                    Carregar planilha
                  </div>
                  <div className="section-subtitle">Arraste um arquivo CSV ou Excel</div>
                </div>
              </div>

              <div style={{ padding: '18px 20px 20px' }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                  onChange={e => handleFile(e.target.files?.[0])}
                  style={{ display: 'none' }}
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => {
                    e.preventDefault()
                    setDragOver(false)
                    handleFile(e.dataTransfer.files?.[0])
                  }}
                  style={{
                    border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 12,
                    padding: '28px 20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: dragOver ? 'var(--accent-light)' : 'var(--input-bg)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {parsing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                      <Spinner size={28} color="var(--accent)" />
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Lendo arquivo...</div>
                    </div>
                  ) : filename ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <i className="bi bi-file-earmark-spreadsheet-fill" style={{ fontSize: 32, color: 'var(--accent)' }} />
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{filename}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {charCount.toLocaleString('pt-BR')} caracteres &middot; clique para trocar
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <i className="bi bi-cloud-upload" style={{ fontSize: 32, color: 'var(--text-muted)' }} />
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                        Clique ou arraste seu arquivo aqui
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        CSV, XLSX ou XLS &middot; ate 5 MB
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Paste fallback */}
            <div className="section-card" style={{ padding: 0 }}>
              <div className="section-header">
                <div>
                  <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <i className="bi bi-clipboard" style={{ color: 'var(--accent)', fontSize: 15 }} />
                    Ou cole o CSV manualmente
                  </div>
                  <div className="section-subtitle">Util quando voce ja copiou de outra ferramenta</div>
                </div>
              </div>

              <div style={{ padding: '18px 20px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <textarea
                  value={csvText}
                  onChange={e => { setCsvText(e.target.value); if (!filename) setFilename('') }}
                  placeholder={`nome,cpf,valor,vencimento\nJoao Silva,123.456.789-00,1234.56,2026-05-12\nMaria Souza,987.654.321-00,2500.00,2026-06-30`}
                  className="form-input"
                  style={{
                    minHeight: 160, resize: 'vertical',
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                    fontSize: 12, lineHeight: 1.6,
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                  <span>
                    {charCount > 0
                      ? `${charCount.toLocaleString('pt-BR')} caracteres`
                      : 'Aguardando dados...'}
                  </span>
                  {charCount > 0 && (
                    <button
                      onClick={handleLimpar}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--danger)', fontSize: 12, fontWeight: 500,
                        display: 'flex', alignItems: 'center', gap: 4,
                      }}
                    >
                      <i className="bi bi-x-circle" /> Limpar
                    </button>
                  )}
                </div>

                <div>
                  <label className="form-label">Instrucao especifica (opcional)</label>
                  <textarea
                    value={instruction}
                    onChange={e => setInstruction(e.target.value)}
                    placeholder="Ex: encontre duplicatas, calcule o total mensal, identifique outliers de valor"
                    className="form-input"
                    style={{
                      minHeight: 70, resize: 'vertical',
                      fontFamily: "'DM Sans', sans-serif", fontSize: 13, lineHeight: 1.6,
                    }}
                  />
                </div>

                {erro && (
                  <div style={{
                    padding: '12px 14px', borderRadius: 8,
                    background: 'var(--danger-light)', color: 'var(--danger)',
                    fontSize: 13, display: 'flex', alignItems: 'flex-start', gap: 8,
                  }}>
                    <i className="bi bi-exclamation-triangle-fill" style={{ marginTop: 1, flexShrink: 0 }} />
                    {erro}
                  </div>
                )}

                <button
                  onClick={handleAnalisar}
                  disabled={loading || !csvText.trim()}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: 10, width: '100%', padding: 13,
                    background: (!csvText.trim() || loading) ? 'var(--border)' : 'var(--accent)',
                    color: (!csvText.trim() || loading) ? 'var(--text-muted)' : 'var(--bg-base)',
                    border: 'none', borderRadius: 10,
                    fontSize: 14, fontWeight: 600,
                    cursor: loading || !csvText.trim() ? 'not-allowed' : 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                    transition: 'all 0.15s ease',
                  }}
                >
                  {loading
                    ? <><Spinner size={17} color="var(--text-muted)" /> Analisando planilha...</>
                    : <><i className="bi bi-cpu" /> Analisar planilha</>
                  }
                </button>
              </div>
            </div>
          </div>

          {/* ════ RIGHT — Result ════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Empty state */}
            {!analise && !loading && (
              <div className="section-card" style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '56px 24px', textAlign: 'center', minHeight: 320,
              }}>
                <i className="bi bi-file-earmark-spreadsheet" style={{ fontSize: 56, opacity: 0.18, color: 'var(--accent)', marginBottom: 18 }} />
                <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)' }}>
                  A analise aparecera aqui
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6, maxWidth: 280, lineHeight: 1.5 }}>
                  Carregue um arquivo CSV/Excel ou cole os dados ao lado e clique em Analisar
                </p>
              </div>
            )}

            {/* Loading state */}
            {loading && (
              <div className="section-card" style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '56px 24px', minHeight: 320,
              }}>
                <div style={{ marginBottom: 20 }}>
                  <Spinner size={36} color="var(--accent)" />
                </div>
                <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                  Analisando planilha...
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>
                  Isso pode levar alguns segundos
                </p>

                <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 280 }}>
                  {['Lendo estrutura', 'Detectando duplicatas e valores ausentes', 'Calculando insights', 'Gerando formulas e versao melhorada'].map((step, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%',
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
            {analise && !loading && (
              <>
                {/* Header / confidence */}
                <div className="section-card">
                  <div style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: 'var(--accent-light)', color: 'var(--accent)',
                        fontSize: 12, fontWeight: 600,
                        padding: '4px 12px', borderRadius: 20,
                        border: '1px solid rgba(45,106,79,0.2)',
                      }}>
                        <i className="bi bi-file-earmark-spreadsheet" />
                        {filename || 'Planilha analisada'}
                      </span>
                      <ConfidenceBadge confianca={analise.confianca} />
                    </div>
                    <button
                      onClick={() => { setAnalise(null) }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '7px 14px', borderRadius: 8,
                        background: 'none', border: '1px solid var(--border)',
                        color: 'var(--text-secondary)',
                        fontSize: 13, fontWeight: 500, cursor: 'pointer',
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      <i className="bi bi-arrow-counterclockwise" /> Nova analise
                    </button>
                  </div>
                </div>

                {/* Sumario executivo */}
                <div className="section-card">
                  <div className="section-header">
                    <div>
                      <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <i className="bi bi-text-paragraph" style={{ color: 'var(--accent)' }} />
                        Sumario executivo
                      </div>
                      <div className="section-subtitle">Visao geral gerada pela IA</div>
                    </div>
                  </div>
                  <div style={{ padding: '18px 20px' }}>
                    <p style={{
                      fontSize: 14, color: 'var(--text-primary)',
                      lineHeight: 1.75, whiteSpace: 'pre-wrap',
                    }}>
                      {analise.sumario || 'Analise concluida.'}
                    </p>
                  </div>
                </div>

                {/* Estrutura */}
                <div className="section-card">
                  <div className="section-header">
                    <div>
                      <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <i className="bi bi-grid-3x3" style={{ color: 'var(--accent)' }} />
                        Estrutura detectada
                      </div>
                      <div className="section-subtitle">Dimensoes e cabecalhos</div>
                    </div>
                  </div>
                  <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      <span style={{
                        fontSize: 12, fontWeight: 600,
                        padding: '5px 12px', borderRadius: 20,
                        background: 'var(--accent-light)', color: 'var(--accent)',
                      }}>
                        <i className="bi bi-list-ol" /> {analise.estrutura?.linhas ?? 0} linhas
                      </span>
                      <span style={{
                        fontSize: 12, fontWeight: 600,
                        padding: '5px 12px', borderRadius: 20,
                        background: '#eef2ff', color: '#4f46e5',
                      }}>
                        <i className="bi bi-layout-three-columns" /> {analise.estrutura?.colunas ?? 0} colunas
                      </span>
                    </div>
                    {Array.isArray(analise.estrutura?.headers) && analise.estrutura.headers.length > 0 && (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                          Cabecalhos
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {analise.estrutura.headers.map((h, i) => (
                            <span key={i} style={{
                              fontSize: 11, padding: '3px 10px', borderRadius: 6,
                              background: 'var(--hover)', border: '1px solid var(--border)',
                              color: 'var(--text-secondary)', fontWeight: 500,
                              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                            }}>
                              {h}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Insights */}
                {analise.insights.length > 0 && (
                  <div className="section-card">
                    <div className="section-header">
                      <div>
                        <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <i className="bi bi-lightbulb-fill" style={{ color: '#e67e22' }} />
                          Insights
                        </div>
                        <div className="section-subtitle">{analise.insights.length} descobertas</div>
                      </div>
                    </div>
                    <ul style={{ padding: '12px', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6, margin: 0 }}>
                      {analise.insights.map((ins, i) => (
                        <li key={i} style={{
                          display: 'flex', alignItems: 'flex-start', gap: 10,
                          padding: '10px 12px', borderRadius: 8,
                          background: '#fef5e7', color: '#9a5d00',
                          fontSize: 13, lineHeight: 1.5,
                        }}>
                          <i className="bi bi-lightbulb" style={{ marginTop: 2, flexShrink: 0 }} />
                          <span>{ins}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Problemas */}
                {analise.problemas.length > 0 && (
                  <div className="section-card">
                    <div className="section-header">
                      <div>
                        <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <i className="bi bi-exclamation-triangle-fill" style={{ color: 'var(--warning)' }} />
                          Problemas encontrados
                        </div>
                        <div className="section-subtitle">{analise.problemas.length} questao(oes) detectada(s)</div>
                      </div>
                    </div>
                    <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {analise.problemas.map((p, i) => {
                        const sev = severityStyle(p.severidade)
                        return (
                          <div key={i} style={{
                            padding: '12px 14px', borderRadius: 10,
                            background: 'var(--card-bg)', border: `1px solid ${sev.border}`,
                            borderLeft: `3px solid ${sev.color}`,
                            display: 'flex', flexDirection: 'column', gap: 6,
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                              <span style={{
                                fontSize: 10, fontWeight: 700,
                                padding: '3px 9px', borderRadius: 10,
                                background: sev.bg, color: sev.color,
                                letterSpacing: '0.04em',
                                display: 'inline-flex', alignItems: 'center', gap: 5,
                              }}>
                                <i className={`bi ${sev.icon}`} style={{ fontSize: 11 }} />
                                {sev.label}
                              </span>
                              {p.tipo && (
                                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>
                                  {p.tipo}
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                              {p.descricao}
                            </div>
                            {p.sugestao && (
                              <div style={{
                                fontSize: 12, color: 'var(--text-secondary)',
                                lineHeight: 1.5, paddingTop: 4,
                                borderTop: '1px dashed var(--border)',
                              }}>
                                <span style={{ fontWeight: 600, color: sev.color }}>
                                  <i className="bi bi-arrow-right-short" /> Sugestao:
                                </span>{' '}
                                {p.sugestao}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Melhorias */}
                {analise.melhorias.length > 0 && (
                  <div className="section-card">
                    <div className="section-header">
                      <div>
                        <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <i className="bi bi-stars" style={{ color: 'var(--accent)' }} />
                          Sugestoes de melhoria
                        </div>
                        <div className="section-subtitle">{analise.melhorias.length} ideia(s)</div>
                      </div>
                    </div>
                    <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {analise.melhorias.map((m, i) => (
                        <div key={i} style={{
                          padding: '12px 14px', borderRadius: 10,
                          background: 'var(--accent-light)',
                          borderLeft: '3px solid var(--accent)',
                          display: 'flex', flexDirection: 'column', gap: 6,
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{
                              fontSize: 10, fontWeight: 700,
                              padding: '2px 8px', borderRadius: 10,
                              background: '#fff', color: 'var(--accent)',
                              letterSpacing: '0.04em', textTransform: 'uppercase',
                              border: '1px solid rgba(45,106,79,0.2)',
                            }}>
                              {m.categoria || 'geral'}
                            </span>
                          </div>
                          <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                            {m.descricao}
                          </div>
                          {m.exemplo && (
                            <div style={{
                              fontSize: 12, color: 'var(--text-secondary)',
                              lineHeight: 1.5, paddingTop: 4,
                              borderTop: '1px dashed rgba(45,106,79,0.25)',
                              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                            }}>
                              {m.exemplo}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Formulas sugeridas */}
                {analise.formulas_sugeridas.length > 0 && (
                  <div className="section-card">
                    <div className="section-header">
                      <div>
                        <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <i className="bi bi-calculator" style={{ color: 'var(--accent)' }} />
                          Formulas sugeridas
                        </div>
                        <div className="section-subtitle">{analise.formulas_sugeridas.length} formula(s) prontas para colar</div>
                      </div>
                    </div>
                    <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {analise.formulas_sugeridas.map((f, i) => (
                        <div key={i} className="planilhas-formula-card" style={{
                          padding: '12px 14px', borderRadius: 10,
                          background: 'var(--input-bg)', border: '1px solid var(--border)',
                          display: 'flex', flexDirection: 'column', gap: 8,
                          transition: 'transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{
                              fontSize: 11, fontWeight: 700,
                              padding: '3px 10px', borderRadius: 6,
                              background: 'var(--accent)', color: 'var(--bg-base)',
                              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                            }}>
                              {f.celula || '—'}
                            </span>
                            <button
                              onClick={() => { navigator.clipboard.writeText(f.formula); toast('info', 'Formula copiada') }}
                              style={{
                                marginLeft: 'auto',
                                background: 'none', border: '1px solid var(--border)',
                                color: 'var(--text-muted)', borderRadius: 6,
                                padding: '3px 8px', fontSize: 11, fontWeight: 500,
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                                fontFamily: "'DM Sans', sans-serif",
                              }}
                            >
                              <i className="bi bi-clipboard" /> Copiar
                            </button>
                          </div>
                          <code style={{
                            display: 'block', padding: '10px 12px', borderRadius: 8,
                            background: 'var(--card-bg)', border: '1px solid var(--border)',
                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                            fontSize: 12, color: 'var(--text-primary)',
                            wordBreak: 'break-all', lineHeight: 1.5,
                          }}>
                            {f.formula}
                          </code>
                          {f.descricao && (
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                              {f.descricao}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Versao melhorada */}
                {analise.versao_melhorada && (
                  <div className="section-card">
                    <div className="section-header">
                      <div>
                        <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <i className="bi bi-magic" style={{ color: 'var(--accent)' }} />
                          Versao melhorada
                        </div>
                        <div className="section-subtitle">CSV com correcoes nao destrutivas aplicadas</div>
                      </div>
                    </div>
                    <div style={{ padding: '16px 20px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <textarea
                        readOnly
                        value={analise.versao_melhorada}
                        style={{
                          width: '100%', minHeight: 180, resize: 'vertical',
                          padding: 12, borderRadius: 8,
                          background: 'var(--input-bg)', border: '1px solid var(--border)',
                          color: 'var(--text-primary)',
                          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                          fontSize: 12, lineHeight: 1.6,
                        }}
                      />
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button
                          onClick={handleCopiarMelhorada}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '8px 14px', borderRadius: 8,
                            background: 'none', border: '1px solid var(--border)',
                            color: copied ? 'var(--accent)' : 'var(--text-secondary)',
                            fontSize: 13, fontWeight: 500, cursor: 'pointer',
                            fontFamily: "'DM Sans', sans-serif",
                          }}
                        >
                          <i className={`bi bi-${copied ? 'check2' : 'clipboard'}`} />
                          {copied ? 'Copiado' : 'Copiar CSV'}
                        </button>
                        <button
                          onClick={handleDownloadMelhorada}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '8px 14px', borderRadius: 8,
                            background: 'var(--accent)', border: 'none',
                            color: 'var(--bg-base)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                            fontFamily: "'DM Sans', sans-serif",
                          }}
                        >
                          <i className="bi bi-download" /> Baixar CSV
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Diff visual antes/depois ─────────────────────────── */}
                {diffData && (
                  <div className="section-card">
                    <div className="section-header">
                      <div>
                        <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <i className="bi bi-arrow-left-right" style={{ color: 'var(--accent)' }} />
                          Diff visual
                        </div>
                        <div className="section-subtitle">Compare a planilha original com a versao melhorada</div>
                      </div>
                      <button
                        onClick={() => setShowDiff(s => !s)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '7px 13px', borderRadius: 8,
                          background: showDiff ? 'var(--accent)' : 'none',
                          border: `1px solid ${showDiff ? 'var(--accent)' : 'var(--border)'}`,
                          color: showDiff ? '#fff' : 'var(--text-secondary)',
                          fontSize: 12, fontWeight: 500, cursor: 'pointer',
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        <i className={`bi bi-${showDiff ? 'eye-slash' : 'eye'}`} />
                        {showDiff ? 'Ocultar diff' : 'Mostrar diff'}
                      </button>
                    </div>

                    <div style={{ padding: '14px 18px 6px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600,
                        padding: '4px 10px', borderRadius: 12,
                        background: 'var(--warning-light)', color: 'var(--warning)',
                      }}>
                        <i className="bi bi-pencil-square" /> {diffData.stats.celulasModificadas} celula(s) modificada(s)
                      </span>
                      <span style={{
                        fontSize: 11, fontWeight: 600,
                        padding: '4px 10px', borderRadius: 12,
                        background: 'var(--success-light)', color: 'var(--success)',
                      }}>
                        <i className="bi bi-plus-circle" /> {diffData.stats.linhasAdicionadas} linha(s) adicionada(s)
                      </span>
                      <span style={{
                        fontSize: 11, fontWeight: 600,
                        padding: '4px 10px', borderRadius: 12,
                        background: 'var(--danger-light)', color: 'var(--danger)',
                      }}>
                        <i className="bi bi-dash-circle" /> {diffData.stats.linhasRemovidas} linha(s) removida(s)
                      </span>
                    </div>

                    {showDiff && (
                      <div style={{ padding: '10px 18px 18px' }}>
                        {(() => {
                          const { orig, melh } = diffData
                          const totalRows = Math.max(orig.length, melh.length)
                          const visible = Math.min(totalRows, DIFF_MAX_ROWS)
                          const hidden = totalRows - visible
                          // Largura maxima de colunas: max entre orig e melh
                          let maxCols = 0
                          for (let i = 0; i < visible; i++) {
                            const a = orig[i]?.length || 0
                            const b = melh[i]?.length || 0
                            if (a > maxCols) maxCols = a
                            if (b > maxCols) maxCols = b
                          }
                          if (maxCols === 0) {
                            return (
                              <div style={{
                                fontSize: 12, color: 'var(--text-muted)',
                                padding: '12px 14px', borderRadius: 8,
                                background: 'var(--hover)', textAlign: 'center',
                              }}>
                                Nenhum dado para comparar.
                              </div>
                            )
                          }
                          return (
                            <>
                              <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: 12,
                                fontSize: 11,
                                color: 'var(--text-muted)',
                                marginBottom: 6,
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                              }}>
                                <div>Original</div>
                                <div>Melhorada</div>
                              </div>
                              <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: 12,
                                maxHeight: 460,
                                overflow: 'auto',
                                border: '1px solid var(--border)',
                                borderRadius: 8,
                                padding: 8,
                                background: 'var(--input-bg)',
                              }}>
                                {/* ─ Original side ─ */}
                                <div className="planilhas-diff-scroll" style={{ overflow: 'auto' }}>
                                  <table className="planilhas-diff-table" style={{
                                    borderCollapse: 'separate', borderSpacing: 0, width: '100%',
                                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                                    fontSize: 11,
                                  }}>
                                    <tbody>
                                      {Array.from({ length: visible }).map((_, i) => {
                                        const row = orig[i] || []
                                        const otherRow = melh[i] || []
                                        const isExtra = i >= melh.length // linha removida
                                        return (
                                          <tr key={i}>
                                            {Array.from({ length: maxCols }).map((__, j) => {
                                              const cell = row[j] ?? ''
                                              const other = otherRow[j] ?? ''
                                              const diff = !isExtra && cell !== other && (cell !== '' || other !== '')
                                              const isFirst = j === 0
                                              const bgBase = isExtra
                                                ? 'var(--danger-light)'
                                                : diff
                                                  ? 'var(--danger-light)'
                                                  : 'var(--input-bg)'
                                              return (
                                                <td key={j} className={isFirst ? 'planilhas-sticky-col' : ''} style={{
                                                  padding: '4px 6px',
                                                  border: '1px solid var(--border)',
                                                  background: bgBase,
                                                  color: diff || isExtra ? 'var(--danger)' : 'var(--text-muted)',
                                                  textDecoration: diff ? 'line-through' : 'none',
                                                  whiteSpace: 'nowrap',
                                                  maxWidth: 180,
                                                  overflow: 'hidden',
                                                  textOverflow: 'ellipsis',
                                                  ...(isFirst ? { position: 'sticky', left: 0, zIndex: 2, fontWeight: 600, boxShadow: '2px 0 0 0 var(--border)' } : {}),
                                                }} title={cell}>
                                                  {cell || <span style={{ opacity: 0.4 }}>—</span>}
                                                </td>
                                              )
                                            })}
                                          </tr>
                                        )
                                      })}
                                    </tbody>
                                  </table>
                                </div>

                                {/* ─ Improved side ─ */}
                                <div className="planilhas-diff-scroll" style={{ overflow: 'auto' }}>
                                  <table className="planilhas-diff-table" style={{
                                    borderCollapse: 'separate', borderSpacing: 0, width: '100%',
                                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                                    fontSize: 11,
                                  }}>
                                    <tbody>
                                      {Array.from({ length: visible }).map((_, i) => {
                                        const row = melh[i] || []
                                        const otherRow = orig[i] || []
                                        const isExtra = i >= orig.length // linha adicionada
                                        return (
                                          <tr key={i}>
                                            {Array.from({ length: maxCols }).map((__, j) => {
                                              const cell = row[j] ?? ''
                                              const other = otherRow[j] ?? ''
                                              const diff = !isExtra && cell !== other && (cell !== '' || other !== '')
                                              const isFirst = j === 0
                                              const bgBase = isExtra
                                                ? 'var(--success-light)'
                                                : diff
                                                  ? 'var(--success-light)'
                                                  : 'var(--input-bg)'
                                              return (
                                                <td key={j} className={isFirst ? 'planilhas-sticky-col' : ''} style={{
                                                  padding: '4px 6px',
                                                  border: '1px solid var(--border)',
                                                  background: bgBase,
                                                  color: diff || isExtra ? 'var(--success)' : 'var(--text-muted)',
                                                  fontWeight: diff || isExtra ? 600 : 400,
                                                  whiteSpace: 'nowrap',
                                                  maxWidth: 180,
                                                  overflow: 'hidden',
                                                  textOverflow: 'ellipsis',
                                                  ...(isFirst ? { position: 'sticky', left: 0, zIndex: 2, fontWeight: 700, boxShadow: '2px 0 0 0 var(--border)' } : {}),
                                                }} title={cell}>
                                                  {cell || <span style={{ opacity: 0.4 }}>—</span>}
                                                </td>
                                              )
                                            })}
                                          </tr>
                                        )
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              {hidden > 0 && (
                                <div style={{
                                  marginTop: 8, padding: '8px 12px',
                                  borderRadius: 8, background: 'var(--hover)',
                                  border: '1px dashed var(--border)',
                                  fontSize: 11, color: 'var(--text-muted)',
                                  textAlign: 'center',
                                }}>
                                  + {hidden} linha(s) adicional(is) nao exibida(s) (mostrando primeiras {DIFF_MAX_ROWS}).
                                </div>
                              )}
                            </>
                          )
                        })()}
                      </div>
                    )}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
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
          .planilhas-grid {
            grid-template-columns: 1fr !important;
          }
        }
        .planilhas-formula-card:hover {
          transform: translateY(-2px);
          border-color: var(--accent) !important;
          box-shadow: 0 6px 20px -12px rgba(0,0,0,0.25);
        }
        .planilhas-sticky-col {
          background-clip: padding-box;
        }
      `}</style>
    </>
  )
}

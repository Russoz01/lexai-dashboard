'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase'
import ConfidenceBadge, { PoweredByLexAI } from '@/components/ConfidenceBadge'
import { toast } from '@/components/Toast'
import { useDraft, clearDraft } from '@/hooks/useDraft'
import { generateDocx, downloadBlob } from '@/lib/word-export'
import { extractPdfWithMeta } from '@/lib/pdf-parser'
import { anonymize, deAnonymize, type AnonymizeResult } from '@/lib/anonymizer'
import { SkeletonResult } from '@/components/Skeleton'

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

  // ── PDF upload state ─────────────────────────────────────────────────
  const fileInputRef  = useRef<HTMLInputElement | null>(null)
  const fileInputARef = useRef<HTMLInputElement | null>(null)
  const fileInputBRef = useRef<HTMLInputElement | null>(null)
  const [carregandoPdf, setCarregandoPdf] = useState<null | 'single' | 'A' | 'B'>(null)

  // ── LGPD anonymizer state ────────────────────────────────────────────
  const [anonimizar, setAnonimizar] = useState(false)
  const [mascarados, setMascarados] = useState(0)

  // ── Compare 2 documents state ────────────────────────────────────────
  const [modoComparar, setModoComparar] = useState(false)
  const [textoA, setTextoA] = useState('')
  const [textoB, setTextoB] = useState('')
  const [analiseA, setAnaliseA] = useState<Analise | null>(null)
  const [analiseB, setAnaliseB] = useState<Analise | null>(null)
  const [comparando, setComparando] = useState(false)

  useDraft('lexai-draft-resumidor', texto, setTexto)

  // ── PDF upload handlers ──────────────────────────────────────────────
  async function handlePdfFile(file: File, target: 'single' | 'A' | 'B') {
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast('error', 'Selecione um arquivo PDF')
      return
    }
    setCarregandoPdf(target)
    try {
      const { text, numPages } = await extractPdfWithMeta(file)
      if (!text.trim()) {
        toast('error', 'PDF sem texto extraivel (verifique se nao e digitalizado)')
        return
      }
      if (target === 'single') setTexto(text)
      else if (target === 'A') setTextoA(text)
      else setTextoB(text)
      const baseName = file.name.replace(/\.pdf$/i, '').slice(0, 80)
      if (target === 'single' && !titulo) setTitulo(baseName)
      toast('success', `PDF carregado: ${numPages} ${numPages === 1 ? 'pagina' : 'paginas'}`)
    } catch (e) {
      console.error('PDF parse error:', e)
      toast('error', 'Nao foi possivel ler o PDF')
    } finally {
      setCarregandoPdf(null)
    }
  }

  // ── Helper to apply de-anonymization across analysis fields ──────────
  function deAnonymizeAnalise(a: Analise, replacements: AnonymizeResult['replacements']): Analise {
    if (!a || replacements.length === 0) return a
    const decode = (s: unknown) =>
      typeof s === 'string' ? deAnonymize(s, replacements) : s

    const out: Analise = { ...a }
    if (typeof out.objeto === 'string') out.objeto = decode(out.objeto)
    if (typeof out.resumo === 'string') out.resumo = decode(out.resumo)
    if (typeof out.conclusao === 'string') out.conclusao = decode(out.conclusao)

    if (Array.isArray(out.pontos_principais)) {
      out.pontos_principais = out.pontos_principais.map(decode)
    }
    if (Array.isArray(out.pontos_chave)) {
      out.pontos_chave = out.pontos_chave.map(decode)
    }
    if (Array.isArray(out.sugestoes)) {
      out.sugestoes = out.sugestoes.map(decode)
    }
    if (Array.isArray(out.fundamentacao_legal)) {
      out.fundamentacao_legal = out.fundamentacao_legal.map(decode)
    }
    if (Array.isArray(out.fundamentacao)) {
      out.fundamentacao = out.fundamentacao.map(decode)
    }
    if (Array.isArray(out.riscos)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      out.riscos = out.riscos.map((r: any) => {
        if (typeof r === 'string') return decode(r)
        return {
          ...r,
          descricao: decode(r.descricao),
          mitigacao: decode(r.mitigacao),
        }
      })
    }
    if (Array.isArray(out.partes_envolvidas)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      out.partes_envolvidas = out.partes_envolvidas.map((p: any) => {
        if (typeof p === 'string') return decode(p)
        return { ...p, nome: decode(p.nome), qualificacao: decode(p.qualificacao), documento: decode(p.documento) }
      })
    }
    if (Array.isArray(out.partes)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      out.partes = out.partes.map((p: any) => {
        if (typeof p === 'string') return decode(p)
        return { ...p, nome: decode(p.nome), qualificacao: decode(p.qualificacao), documento: decode(p.documento) }
      })
    }
    if (Array.isArray(out.prazos_identificados)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      out.prazos_identificados = out.prazos_identificados.map((p: any) => {
        if (typeof p === 'string') return decode(p)
        return { ...p, prazo: decode(p.prazo), evento: decode(p.evento), base_legal: decode(p.base_legal), clausula: decode(p.clausula), consequencia: decode(p.consequencia) }
      })
    }
    if (Array.isArray(out.prazos)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      out.prazos = out.prazos.map((p: any) => {
        if (typeof p === 'string') return decode(p)
        return { ...p, prazo: decode(p.prazo), evento: decode(p.evento), base_legal: decode(p.base_legal), clausula: decode(p.clausula), consequencia: decode(p.consequencia) }
      })
    }
    return out
  }

  async function callResumirApi(rawText: string): Promise<Analise> {
    let payloadText = rawText
    let replacements: AnonymizeResult['replacements'] = []
    if (anonimizar) {
      const masked = anonymize(rawText)
      payloadText = masked.text
      replacements = masked.replacements
    }
    const res  = await fetch('/api/resumir', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texto: payloadText }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Erro desconhecido')
    let result: Analise = data.analise
    if (anonimizar && replacements.length > 0) {
      result = deAnonymizeAnalise(result, replacements)
    }
    // Track total masked count for the badge (single mode uses this)
    if (replacements.length > 0) setMascarados(prev => prev + replacements.length)
    return result
  }

  async function handleComparar() {
    if (!textoA.trim() || !textoB.trim() || comparando) return
    setComparando(true)
    setErro('')
    setAnaliseA(null)
    setAnaliseB(null)
    setMascarados(0)
    try {
      const [a, b] = await Promise.all([callResumirApi(textoA), callResumirApi(textoB)])
      setAnaliseA(a)
      setAnaliseB(b)
      toast('success', 'Comparacao concluida')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro ao comparar documentos'
      setErro(msg)
      toast('error', msg)
    } finally {
      setComparando(false)
    }
  }

  // ── Comparison helpers (string match between riscos arrays) ──────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function riscoToString(r: any): string {
    if (typeof r === 'string') return r
    return String(r?.descricao || r || '').trim()
  }
  function diffRiscos(a: Analise | null, b: Analise | null) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const arrA: string[] = ((a?.riscos || []) as any[]).map(riscoToString).filter(Boolean)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const arrB: string[] = ((b?.riscos || []) as any[]).map(riscoToString).filter(Boolean)
    const setA = new Set(arrA.map(s => s.toLowerCase()))
    const setB = new Set(arrB.map(s => s.toLowerCase()))
    const exclusivosA = arrA.filter(s => !setB.has(s.toLowerCase()))
    const exclusivosB = arrB.filter(s => !setA.has(s.toLowerCase()))
    const comuns      = arrA.filter(s => setB.has(s.toLowerCase()))
    return { exclusivosA, exclusivosB, comuns }
  }

  async function handleAnalisar() {
    if (!texto.trim() || loading) return
    setLoading(true)
    setErro('')
    setAnalise(null)
    setSalvo(false)
    setMascarados(0)

    try {
      const result = await callResumirApi(texto)
      setAnalise(result)
      if (!titulo) setTitulo(result.classificacao?.tipo || result.tipo_documento || 'Documento analisado')
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

          {/* Mode toggle */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => {
                setModoComparar(false)
                setAnaliseA(null)
                setAnaliseB(null)
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', borderRadius: '8px',
                background: !modoComparar ? 'var(--accent)' : 'var(--card-bg)',
                color: !modoComparar ? '#fff' : 'var(--text-secondary)',
                border: `1px solid ${!modoComparar ? 'var(--accent)' : 'var(--border)'}`,
                fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                transition: 'all 0.15s ease',
              }}
            >
              <i className="bi bi-file-earmark-text" />
              Documento único
            </button>
            <button
              type="button"
              onClick={() => {
                setModoComparar(true)
                setAnalise(null)
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', borderRadius: '8px',
                background: modoComparar ? 'var(--accent)' : 'var(--card-bg)',
                color: modoComparar ? '#fff' : 'var(--text-secondary)',
                border: `1px solid ${modoComparar ? 'var(--accent)' : 'var(--border)'}`,
                fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                transition: 'all 0.15s ease',
              }}
            >
              <i className="bi bi-files" />
              Comparar 2 documentos
            </button>
          </div>
        </div>

        {/* ── Split-view grid (single document mode) ── */}
        {!modoComparar && (
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
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: '8px', marginBottom: '6px', flexWrap: 'wrap',
                }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Texto do documento</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {mascarados > 0 && (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        fontSize: '11px', fontWeight: 600,
                        padding: '3px 8px', borderRadius: '10px',
                        background: '#eef2ff', color: '#4f46e5',
                        border: '1px solid rgba(79,70,229,0.2)',
                      }}>
                        <i className="bi bi-shield-lock-fill" />
                        {mascarados} dado{mascarados === 1 ? '' : 's'} mascarado{mascarados === 1 ? '' : 's'}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={carregandoPdf === 'single'}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '6px 12px', borderRadius: '8px',
                        background: 'var(--card-bg)', border: '1px solid var(--border)',
                        color: 'var(--text-secondary)',
                        fontSize: '12px', fontWeight: 600,
                        cursor: carregandoPdf === 'single' ? 'default' : 'pointer',
                        fontFamily: "'DM Sans', sans-serif",
                        opacity: carregandoPdf === 'single' ? 0.7 : 1,
                      }}
                    >
                      {carregandoPdf === 'single'
                        ? <><Spinner size={12} color="var(--text-muted)" /> Carregando PDF...</>
                        : <><i className="bi bi-file-earmark-pdf" /> Carregar PDF</>
                      }
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (f) handlePdfFile(f, 'single')
                        e.target.value = ''
                      }}
                    />
                  </div>
                </div>
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
                {/* LGPD anonymizer toggle */}
                <label style={{
                  display: 'flex', alignItems: 'flex-start', gap: '8px',
                  marginTop: '8px', cursor: 'pointer',
                  fontSize: '12px', color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                }}>
                  <input
                    type="checkbox"
                    checked={anonimizar}
                    onChange={e => setAnonimizar(e.target.checked)}
                    style={{ marginTop: '2px', accentColor: 'var(--accent)' }}
                  />
                  <span>
                    <strong style={{ color: 'var(--text-primary)' }}>Anonimizar dados pessoais (LGPD)</strong>
                    <br />
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      CPF, CNPJ, e-mail, telefone e CEP serao mascarados antes de enviar para a IA
                    </span>
                  </span>
                </label>
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
              <div className="section-card" style={{ padding: '24px' }}>
                <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px', textAlign: 'center' }}>
                  Analisando documento...
                </p>
                <SkeletonResult />
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
        )}

        {/* ── Compare 2 documents mode ── */}
        {modoComparar && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Side-by-side textareas */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
              gap: '20px',
              alignItems: 'start',
            }}
              className="resumidor-grid"
            >
              {/* Documento A */}
              <div className="section-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="section-header">
                  <div>
                    <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="bi bi-file-earmark-text" style={{ color: 'var(--accent)', fontSize: '15px' }} />
                      Documento A
                    </div>
                    <div className="section-subtitle">Cole o primeiro texto</div>
                  </div>
                </div>
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => fileInputARef.current?.click()}
                      disabled={carregandoPdf === 'A'}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '6px 12px', borderRadius: '8px',
                        background: 'var(--card-bg)', border: '1px solid var(--border)',
                        color: 'var(--text-secondary)',
                        fontSize: '12px', fontWeight: 600,
                        cursor: carregandoPdf === 'A' ? 'default' : 'pointer',
                        fontFamily: "'DM Sans', sans-serif",
                        opacity: carregandoPdf === 'A' ? 0.7 : 1,
                      }}
                    >
                      {carregandoPdf === 'A'
                        ? <><Spinner size={12} color="var(--text-muted)" /> Carregando PDF...</>
                        : <><i className="bi bi-file-earmark-pdf" /> Carregar PDF</>
                      }
                    </button>
                    <input
                      ref={fileInputARef}
                      type="file"
                      accept=".pdf,application/pdf"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (f) handlePdfFile(f, 'A')
                        e.target.value = ''
                      }}
                    />
                  </div>
                  <textarea
                    value={textoA}
                    onChange={e => setTextoA(e.target.value)}
                    placeholder="Cole aqui o primeiro documento..."
                    className="form-input"
                    style={{
                      minHeight: '280px', resize: 'vertical',
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '13px', lineHeight: '1.7',
                    }}
                  />
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {textoA.length > 0
                      ? `${textoA.length.toLocaleString('pt-BR')} caracteres`
                      : 'Aguardando documento...'}
                  </div>
                </div>
              </div>

              {/* Documento B */}
              <div className="section-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="section-header">
                  <div>
                    <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="bi bi-file-earmark-text" style={{ color: 'var(--accent)', fontSize: '15px' }} />
                      Documento B
                    </div>
                    <div className="section-subtitle">Cole o segundo texto</div>
                  </div>
                </div>
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => fileInputBRef.current?.click()}
                      disabled={carregandoPdf === 'B'}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '6px 12px', borderRadius: '8px',
                        background: 'var(--card-bg)', border: '1px solid var(--border)',
                        color: 'var(--text-secondary)',
                        fontSize: '12px', fontWeight: 600,
                        cursor: carregandoPdf === 'B' ? 'default' : 'pointer',
                        fontFamily: "'DM Sans', sans-serif",
                        opacity: carregandoPdf === 'B' ? 0.7 : 1,
                      }}
                    >
                      {carregandoPdf === 'B'
                        ? <><Spinner size={12} color="var(--text-muted)" /> Carregando PDF...</>
                        : <><i className="bi bi-file-earmark-pdf" /> Carregar PDF</>
                      }
                    </button>
                    <input
                      ref={fileInputBRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (f) handlePdfFile(f, 'B')
                        e.target.value = ''
                      }}
                    />
                  </div>
                  <textarea
                    value={textoB}
                    onChange={e => setTextoB(e.target.value)}
                    placeholder="Cole aqui o segundo documento..."
                    className="form-input"
                    style={{
                      minHeight: '280px', resize: 'vertical',
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '13px', lineHeight: '1.7',
                    }}
                  />
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {textoB.length > 0
                      ? `${textoB.length.toLocaleString('pt-BR')} caracteres`
                      : 'Aguardando documento...'}
                  </div>
                </div>
              </div>
            </div>

            {/* LGPD toggle (compare mode) */}
            <div className="section-card" style={{ padding: '14px 18px' }}>
              <label style={{
                display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer',
                fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5,
              }}>
                <input
                  type="checkbox"
                  checked={anonimizar}
                  onChange={e => setAnonimizar(e.target.checked)}
                  style={{ marginTop: '3px', accentColor: 'var(--accent)' }}
                />
                <span>
                  <strong style={{ color: 'var(--text-primary)' }}>Anonimizar dados pessoais (LGPD)</strong>
                  <br />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    CPF, CNPJ, e-mail, telefone e CEP serao mascarados nos dois documentos antes de enviar para a IA
                  </span>
                </span>
              </label>
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

            {/* Comparar button */}
            <button
              onClick={handleComparar}
              disabled={comparando || !textoA.trim() || !textoB.trim()}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '10px', width: '100%', padding: '14px',
                background: (!textoA.trim() || !textoB.trim() || comparando) ? 'var(--border)' : 'var(--accent)',
                color: (!textoA.trim() || !textoB.trim() || comparando) ? 'var(--text-muted)' : '#fff',
                border: 'none', borderRadius: '10px',
                fontSize: '14px', fontWeight: 600,
                cursor: (comparando || !textoA.trim() || !textoB.trim()) ? 'not-allowed' : 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                transition: 'all 0.15s ease',
              }}
            >
              {comparando
                ? <><Spinner size={17} color="var(--text-muted)" /> Comparando documentos...</>
                : <><i className="bi bi-arrows-collapse-vertical" /> Comparar</>
              }
            </button>

            {/* Loading state */}
            {comparando && (
              <div className="section-card" style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '40px 24px',
              }}>
                <Spinner size={32} color="var(--accent)" />
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '14px' }}>
                  Analisando documentos em paralelo...
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Isso pode levar alguns segundos
                </p>
              </div>
            )}

            {/* Comparison results */}
            {analiseA && analiseB && !comparando && (() => {
              const diff = diffRiscos(analiseA, analiseB)
              return (
                <>
                  {mascarados > 0 && (
                    <div style={{
                      display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: '6px',
                      fontSize: '12px', fontWeight: 600,
                      padding: '6px 12px', borderRadius: '20px',
                      background: '#eef2ff', color: '#4f46e5',
                      border: '1px solid rgba(79,70,229,0.2)',
                    }}>
                      <i className="bi bi-shield-lock-fill" />
                      {mascarados} dado{mascarados === 1 ? '' : 's'} mascarado{mascarados === 1 ? '' : 's'}
                    </div>
                  )}

                  {/* Diferencas detectadas */}
                  <div className="section-card">
                    <div className="section-header">
                      <div>
                        <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <i className="bi bi-diagram-2-fill" style={{ color: 'var(--accent)' }} />
                          Diferencas detectadas
                        </div>
                        <div className="section-subtitle">Comparacao automatica entre os documentos</div>
                      </div>
                    </div>
                    <div style={{ padding: '18px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                      {/* Riscos exclusivos de A */}
                      <div style={{
                        padding: '14px', borderRadius: '10px',
                        background: 'var(--warning-light)',
                        border: '1px solid rgba(234,179,8,0.2)',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--warning)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          <i className="bi bi-exclamation-triangle-fill" />
                          Riscos exclusivos de A
                          <span style={{ marginLeft: 'auto', background: 'rgba(234,179,8,0.15)', borderRadius: '10px', padding: '1px 8px' }}>{diff.exclusivosA.length}</span>
                        </div>
                        {diff.exclusivosA.length === 0 ? (
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Nenhum risco exclusivo</div>
                        ) : (
                          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {diff.exclusivosA.map((r, i) => (
                              <li key={i} style={{ fontSize: '12px', color: 'var(--warning)', lineHeight: 1.5, paddingLeft: '10px', borderLeft: '2px solid var(--warning)' }}>
                                {r}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Riscos exclusivos de B */}
                      <div style={{
                        padding: '14px', borderRadius: '10px',
                        background: 'var(--danger-light)',
                        border: '1px solid rgba(220,38,38,0.18)',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--danger)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          <i className="bi bi-exclamation-triangle-fill" />
                          Riscos exclusivos de B
                          <span style={{ marginLeft: 'auto', background: 'rgba(220,38,38,0.15)', borderRadius: '10px', padding: '1px 8px' }}>{diff.exclusivosB.length}</span>
                        </div>
                        {diff.exclusivosB.length === 0 ? (
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Nenhum risco exclusivo</div>
                        ) : (
                          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {diff.exclusivosB.map((r, i) => (
                              <li key={i} style={{ fontSize: '12px', color: 'var(--danger)', lineHeight: 1.5, paddingLeft: '10px', borderLeft: '2px solid var(--danger)' }}>
                                {r}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Pontos em comum */}
                      <div style={{
                        padding: '14px', borderRadius: '10px',
                        background: 'var(--accent-light)',
                        border: '1px solid rgba(45,106,79,0.2)',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--accent)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          <i className="bi bi-check-circle-fill" />
                          Pontos em comum
                          <span style={{ marginLeft: 'auto', background: 'rgba(45,106,79,0.15)', borderRadius: '10px', padding: '1px 8px' }}>{diff.comuns.length}</span>
                        </div>
                        {diff.comuns.length === 0 ? (
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Nenhum risco em comum</div>
                        ) : (
                          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {diff.comuns.map((r, i) => (
                              <li key={i} style={{ fontSize: '12px', color: 'var(--accent)', lineHeight: 1.5, paddingLeft: '10px', borderLeft: '2px solid var(--accent)' }}>
                                {r}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Side-by-side analyses */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
                    gap: '20px',
                    alignItems: 'start',
                  }}
                    className="resumidor-grid"
                  >
                    <CompareAnalysisCard label="Documento A" analise={analiseA} />
                    <CompareAnalysisCard label="Documento B" analise={analiseB} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
                    <PoweredByLexAI />
                  </div>
                </>
              )
            })()}
          </div>
        )}
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

// ── Reusable card to render a single analysis in compare mode ──────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CompareAnalysisCard({ label, analise }: { label: string; analise: any }) {
  const tipoDoc = analise.classificacao?.tipo || analise.tipo_documento || 'Documento'
  const objeto  = analise.objeto || analise.resumo || analise.conclusao || 'Analise concluida'
  const pontos  = analise.pontos_principais || analise.pontos_chave || []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const riscos  = (analise.riscos || []).map((r: any) =>
    typeof r === 'string'
      ? r
      : `[${(r.gravidade || 'INFO').toString().toUpperCase()}] ${r.descricao || r}${r.mitigacao ? ` — ${r.mitigacao}` : ''}`
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div className="section-card">
        <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '11px', fontWeight: 700,
            padding: '3px 10px', borderRadius: '20px',
            background: 'var(--accent)', color: '#fff',
            textTransform: 'uppercase', letterSpacing: '0.5px',
          }}>
            {label}
          </span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'var(--accent-light)', color: 'var(--accent)',
            fontSize: '12px', fontWeight: 600,
            padding: '4px 12px', borderRadius: '20px',
            border: '1px solid rgba(45,106,79,0.2)',
          }}>
            {tipoDoc}
          </span>
        </div>
      </div>

      <div className="section-card">
        <div className="section-header">
          <div>
            <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="bi bi-text-paragraph" style={{ color: 'var(--accent)' }} />
              Resumo Executivo
            </div>
          </div>
        </div>
        <div style={{ padding: '16px 18px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
            {objeto}
          </p>
        </div>
      </div>

      <ResultSection
        title="Pontos Principais"
        icon={<i className="bi bi-check-circle-fill" style={{ color: '#2d6a4f', fontSize: '14px' }} />}
        items={pontos}
        accent={{ bg: 'var(--accent-light)', text: 'var(--accent)', dot: 'var(--accent)' }}
        defaultOpen
      />
      <ResultSection
        title="Riscos e Cláusulas Importantes"
        icon={<i className="bi bi-exclamation-triangle-fill" style={{ color: 'var(--warning)', fontSize: '14px' }} />}
        items={riscos}
        accent={{ bg: 'var(--warning-light)', text: 'var(--warning)', dot: 'var(--warning)' }}
        defaultOpen
      />
    </div>
  )
}

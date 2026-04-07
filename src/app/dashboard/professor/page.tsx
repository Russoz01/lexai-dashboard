'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import ConfidenceBadge, { PoweredByLexAI } from '@/components/ConfidenceBadge'
import { useDraft, clearDraft } from '@/hooks/useDraft'
import { parseDocument, truncateForAI, type ParsedDocument } from '@/lib/document-parser'
import { toast } from '@/components/Toast'
import {
  recordQuizAttempt,
  createFlashcard,
  listDueFlashcards,
  reviewFlashcard,
  getQuizStats,
  getFlashcardStats,
  type FlashcardRow,
  type QuizStats,
  type FlashcardStats,
} from '@/lib/professor-store'

export default function ProfessorPage() {
  const [tema, setTema] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [instituicao, setInstituicao] = useState('')
  const [loading, setLoading] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [aula, setAula] = useState<any>(null)
  const [erro, setErro] = useState('')
  const [nivel, setNivel] = useState<'basico' | 'intermediario' | 'avancado' | 'questoes' | 'flashcards' | 'plano'>('basico')

  // Material upload (PDF/DOCX/TXT)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [material, setMaterial] = useState<ParsedDocument | null>(null)
  const [loadingMaterial, setLoadingMaterial] = useState(false)

  async function handleMaterialUpload(file: File) {
    setLoadingMaterial(true)
    setErro('')
    try {
      const parsed = await parseDocument(file)
      if (parsed.text.length < 100) {
        toast('error', 'Arquivo parece vazio ou nao foi possivel extrair o texto.')
        setLoadingMaterial(false)
        return
      }
      setMaterial(parsed)
      // Auto-fill tema if empty
      if (!tema.trim()) {
        const firstLine = parsed.text.split('\n').find(l => l.trim().length > 5)?.trim().slice(0, 80) || parsed.filename
        setTema(firstLine)
      }
      const fmt = parsed.format.toUpperCase()
      const pages = parsed.pages ? ` (${parsed.pages} paginas)` : ''
      toast('success', `${fmt} carregado: ${parsed.filename}${pages}`)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao ler arquivo'
      setErro(msg)
      toast('error', msg)
    } finally {
      setLoadingMaterial(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function clearMaterial() {
    setMaterial(null)
  }

  // Quiz stats (for the questoes tab header)
  const [quizStats, setQuizStats] = useState<QuizStats | null>(null)
  const refreshQuizStats = useCallback(async () => {
    try {
      const s = await getQuizStats()
      setQuizStats(s)
    } catch { /* ignore */ }
  }, [])

  // Flashcards (SRS)
  const [flashStats, setFlashStats] = useState<FlashcardStats | null>(null)
  const [dueCards, setDueCards] = useState<FlashcardRow[]>([])
  const [loadingFlash, setLoadingFlash] = useState(false)
  const refreshFlashcards = useCallback(async () => {
    setLoadingFlash(true)
    try {
      const [stats, due] = await Promise.all([getFlashcardStats(), listDueFlashcards(20)])
      setFlashStats(stats)
      setDueCards(due)
    } catch { /* ignore */ } finally { setLoadingFlash(false) }
  }, [])

  // Refresh stats when entering the relevant tab
  useEffect(() => {
    if (nivel === 'questoes') refreshQuizStats()
    if (nivel === 'flashcards') refreshFlashcards()
  }, [nivel, refreshQuizStats, refreshFlashcards])

  useDraft('lexai-draft-professor', tema, setTema)

  // Memory — save studied topics to localStorage
  const [studyHistory, setStudyHistory] = useState<string[]>([])
  useEffect(() => {
    try {
      const saved = localStorage.getItem('lexai-study-history')
      if (saved) setStudyHistory(JSON.parse(saved))
    } catch { /* ignore */ }
  }, [])

  async function ensinar() {
    if (!tema.trim() || loading) return
    setLoading(true); setErro(''); setAula(null)

    // Build request with extra context
    const body: Record<string, string> = { tema }
    if (youtubeUrl.trim()) {
      body.videoContent = `YouTube URL: ${youtubeUrl} — Analise o conteudo deste video sobre o tema "${tema}". Extraia os pontos principais para estudo.`
    }
    if (instituicao.trim()) {
      body.instituicao = instituicao
    }
    if (studyHistory.length > 0) {
      body.historico = studyHistory.slice(-10).join(', ')
    }
    // Include uploaded study material (PDF/DOCX/TXT) — truncated to fit context
    if (material && material.text.length > 0) {
      body.material = truncateForAI(material.text, 50000)
      body.materialNome = material.filename
    }

    try {
      const res = await fetch('/api/ensinar', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAula(data.aula)
      clearDraft('lexai-draft-professor')

      // Save to study history
      const updated = [...studyHistory.filter(t => t !== tema), tema].slice(-20)
      setStudyHistory(updated)
      localStorage.setItem('lexai-study-history', JSON.stringify(updated))
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro')
    } finally { setLoading(false) }
  }

  const NIVEIS = [
    { key: 'basico' as const, label: 'Basico', icon: 'bi-book', color: '#2d8659' },
    { key: 'intermediario' as const, label: 'Intermediario', icon: 'bi-journal-text', color: '#4f46e5' },
    { key: 'avancado' as const, label: 'Avancado', icon: 'bi-mortarboard', color: '#c0392b' },
    { key: 'questoes' as const, label: 'Questoes', icon: 'bi-patch-question', color: '#e67e22' },
    { key: 'flashcards' as const, label: 'Flashcards', icon: 'bi-collection', color: '#8B5CF6' },
    { key: 'plano' as const, label: 'Plano de Estudo', icon: 'bi-calendar-check', color: '#3B82F6' },
  ]

  return (
    <div className="page-content" style={{ maxWidth: 1200 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
            Agente IA
          </span>
        </div>
        <h1 className="page-title">Professor</h1>
        <p className="page-subtitle">Aprenda qualquer materia &mdash; Direito, ENEM, Vestibular, Concursos. Ensino nivel Harvard com video analysis, padroes de prova e plano de estudo</p>
      </div>

      {/* Search bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <i className="bi bi-search" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 14 }} />
          <input type="text" value={tema} onChange={e => setTema(e.target.value)}
            placeholder="Digite o tema juridico: ex. prescricao, responsabilidade civil, habeas corpus..."
            className="form-input" style={{ paddingLeft: 40 }}
            onKeyDown={e => e.key === 'Enter' && ensinar()} />
        </div>
        <button onClick={ensinar} disabled={!tema.trim() || loading} className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
          {loading ? 'Preparando aula...' : <><i className="bi bi-mortarboard" /> Ensinar</>}
        </button>
      </div>

      {/* Extra inputs — YouTube + Institution */}
      {!aula && !loading && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          <div style={{ position: 'relative' }}>
            <i className="bi bi-youtube" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 14 }} />
            <input type="text" value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)}
              placeholder="Link do YouTube (opcional) — resumo do video"
              className="form-input" style={{ paddingLeft: 40, fontSize: 13 }} />
          </div>
          <div style={{ position: 'relative' }}>
            <i className="bi bi-mortarboard" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 14 }} />
            <input type="text" value={instituicao} onChange={e => setInstituicao(e.target.value)}
              placeholder="Faculdade/Concurso (ex: OAB, TJSP, USP)"
              className="form-input" style={{ paddingLeft: 40, fontSize: 13 }} />
          </div>
        </div>
      )}

      {/* Document upload — PDF / DOCX / TXT */}
      {!aula && !loading && (
        <div style={{ marginBottom: 16 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt,.md"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleMaterialUpload(file)
            }}
          />
          {!material ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loadingMaterial}
              style={{
                width: '100%',
                padding: '14px 18px',
                borderRadius: 10,
                border: '2px dashed var(--border)',
                background: 'var(--hover)',
                color: 'var(--text-secondary)',
                fontSize: 13,
                fontWeight: 500,
                cursor: loadingMaterial ? 'wait' : 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
            >
              {loadingMaterial ? (
                <>
                  <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Lendo arquivo...
                </>
              ) : (
                <>
                  <i className="bi bi-file-earmark-arrow-up" style={{ fontSize: 18, color: 'var(--accent)' }} />
                  <span><strong>Carregar PDF, DOCX ou TXT</strong> &mdash; gere uma aula a partir do seu material de estudo</span>
                </>
              )}
            </button>
          ) : (
            <div style={{
              padding: '14px 18px',
              borderRadius: 10,
              border: '1px solid var(--accent)',
              background: 'var(--accent-light)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'var(--card-bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <i className={`bi ${material.format === 'pdf' ? 'bi-file-earmark-pdf' : material.format === 'docx' || material.format === 'doc' ? 'bi-file-earmark-word' : 'bi-file-earmark-text'}`}
                  style={{ fontSize: 20, color: 'var(--accent)' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {material.filename}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  {material.format.toUpperCase()}
                  {material.pages ? ` &middot; ${material.pages} paginas` : ''}
                  {' '}&middot; {(material.size / 1024).toFixed(0)} KB
                  {' '}&middot; {material.text.length.toLocaleString('pt-BR')} caracteres extraidos
                </div>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: '6px 12px', borderRadius: 8,
                  background: 'var(--card-bg)', border: '1px solid var(--border)',
                  color: 'var(--text-secondary)', fontSize: 12, fontWeight: 500,
                  cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                }}
                title="Trocar arquivo"
              >
                <i className="bi bi-arrow-repeat" /> Trocar
              </button>
              <button
                type="button"
                onClick={clearMaterial}
                style={{
                  padding: '6px 10px', borderRadius: 8,
                  background: 'none', border: '1px solid var(--border)',
                  color: 'var(--danger)', fontSize: 12, cursor: 'pointer',
                }}
                title="Remover arquivo"
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Study memory dashboard */}
      {!aula && !loading && studyHistory.length > 0 && (
        <div className="section-card" style={{ padding: '16px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingRight: 16, borderRight: '1px solid var(--border)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="bi bi-journal-bookmark-fill" style={{ fontSize: 18, color: 'var(--accent)' }} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{studyHistory.length}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>temas estudados</div>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Retomar estudos recentes</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {studyHistory.slice(-6).reverse().map((t, i) => (
                <button key={i} onClick={() => setTema(t)}
                  style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, background: 'var(--hover)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                  <i className="bi bi-arrow-clockwise" style={{ marginRight: 4, fontSize: 10 }} />{t}
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => { if (confirm('Limpar todo o historico de estudo?')) { setStudyHistory([]); localStorage.removeItem('lexai-study-history') } }}
            style={{ fontSize: 11, padding: '6px 10px', borderRadius: 6, background: 'none', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
            <i className="bi bi-trash" style={{ marginRight: 4 }} />Limpar
          </button>
        </div>
      )}

      {/* Study categories — now 8 areas */}
      {!aula && !loading && (
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
            Areas de Estudo Juridico &mdash; Clique em qualquer materia
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }} className="study-grid">
            {[
              { area: 'Direito Civil', temas: ['Responsabilidade Civil', 'Contratos', 'Prescricao', 'Posse e Propriedade'], icon: 'bi-file-earmark-text', color: '#2563EB' },
              { area: 'Direito Penal', temas: ['Legitima Defesa', 'Crimes contra o patrimonio', 'Principio da Legalidade', 'Dosimetria da Pena'], icon: 'bi-shield-exclamation', color: '#EF4444' },
              { area: 'Direito Constitucional', temas: ['Direitos Fundamentais', 'Controle de Constitucionalidade', 'Remedios Constitucionais', 'Separacao de Poderes'], icon: 'bi-building', color: '#8B5CF6' },
              { area: 'Direito do Trabalho', temas: ['Rescisao Indireta', 'Horas Extras', 'Acidente de Trabalho', 'FGTS'], icon: 'bi-briefcase', color: '#F59E0B' },
              { area: 'Direito Tributario', temas: ['Principio da Legalidade Tributaria', 'IPTU', 'ICMS', 'Imunidade Tributaria'], icon: 'bi-cash-coin', color: '#10B981' },
              { area: 'Direito Administrativo', temas: ['Atos Administrativos', 'Licitacoes', 'Improbidade', 'Servidores Publicos'], icon: 'bi-bank', color: '#06B6D4' },
              { area: 'Direito Empresarial', temas: ['Recuperacao Judicial', 'Sociedade Limitada', 'Titulos de Credito', 'Falencia'], icon: 'bi-buildings', color: '#EC4899' },
              { area: 'Direito Processual', temas: ['Tutela Provisoria', 'Recursos CPC', 'Coisa Julgada', 'Intervencao de Terceiros'], icon: 'bi-journal-check', color: '#6366F1' },
            ].map((cat, i) => (
              <div key={i} className="section-card" style={{ padding: '16px', cursor: 'pointer', transition: 'transform 0.15s ease' }}
                onClick={() => { setTema(cat.temas[0]); }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: `${cat.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className={`bi ${cat.icon}`} style={{ color: cat.color, fontSize: 14 }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{cat.area}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {cat.temas.map((t, j) => (
                    <button key={j} onClick={(e) => { e.stopPropagation(); setTema(t); }}
                      style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'var(--hover)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ensino Medio / ENEM / Vestibular — academic subjects */}
      {!aula && !loading && (
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              <i className="bi bi-book-half" style={{ marginRight: 6 }} />Ensino Medio &mdash; ENEM, Vestibular, Concursos
            </div>
            <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 10, background: 'rgba(139,92,246,0.12)', color: '#8B5CF6', fontWeight: 700, letterSpacing: '0.3px' }}>
              QUALQUER MATERIA
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }} className="study-grid">
            {[
              { area: 'Matematica', temas: ['Funcoes', 'Trigonometria', 'Geometria', 'Probabilidade'], icon: 'bi-calculator', color: '#2563EB' },
              { area: 'Portugues', temas: ['Sintaxe', 'Interpretacao de Texto', 'Figuras de Linguagem', 'Crase'], icon: 'bi-translate', color: '#10B981' },
              { area: 'Fisica', temas: ['Cinematica', 'Leis de Newton', 'Termodinamica', 'Eletromagnetismo'], icon: 'bi-lightning-charge', color: '#F59E0B' },
              { area: 'Quimica', temas: ['Tabela Periodica', 'Ligacoes Quimicas', 'Quimica Organica', 'Estequiometria'], icon: 'bi-moisture', color: '#06B6D4' },
              { area: 'Biologia', temas: ['Genetica', 'Ecologia', 'Evolucao', 'Citologia'], icon: 'bi-tree', color: '#22C55E' },
              { area: 'Historia', temas: ['Brasil Colonia', 'Revolucao Francesa', 'Era Vargas', 'Guerra Fria'], icon: 'bi-hourglass-split', color: '#8B5CF6' },
              { area: 'Geografia', temas: ['Globalizacao', 'Geopolitica', 'Climatologia', 'Demografia'], icon: 'bi-globe-americas', color: '#0EA5E9' },
              { area: 'Filosofia', temas: ['Socrates', 'Kant', 'Existencialismo', 'Etica'], icon: 'bi-lightbulb', color: '#EC4899' },
              { area: 'Sociologia', temas: ['Durkheim', 'Marx', 'Weber', 'Movimentos Sociais'], icon: 'bi-people', color: '#6366F1' },
              { area: 'Ingles', temas: ['Verb Tenses', 'Phrasal Verbs', 'Reading Comprehension', 'Grammar Rules'], icon: 'bi-chat-dots', color: '#EF4444' },
              { area: 'Literatura', temas: ['Modernismo', 'Romantismo', 'Machado de Assis', 'Escolas Literarias'], icon: 'bi-journal-text', color: '#D97706' },
              { area: 'Redacao ENEM', temas: ['Estrutura Dissertativa', 'Proposta de Intervencao', 'Conectivos', 'Argumentacao'], icon: 'bi-pencil-square', color: '#14B8A6' },
            ].map((cat, i) => (
              <div key={i} className="section-card" style={{ padding: '16px', cursor: 'pointer', transition: 'transform 0.15s ease' }}
                onClick={() => { setTema(cat.temas[0]); }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: `${cat.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className={`bi ${cat.icon}`} style={{ color: cat.color, fontSize: 14 }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{cat.area}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {cat.temas.map((t, j) => (
                    <button key={j} onClick={(e) => { e.stopPropagation(); setTema(t); }}
                      style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'var(--hover)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ensino Superior — university courses */}
      {!aula && !loading && (
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              <i className="bi bi-mortarboard" style={{ marginRight: 6 }} />Ensino Superior &mdash; Cursos Universitarios
            </div>
            <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 10, background: 'rgba(34,197,94,0.12)', color: '#22C55E', fontWeight: 700, letterSpacing: '0.3px' }}>
              FACULDADE
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }} className="study-grid">
            {[
              { area: 'Calculo', temas: ['Limites', 'Derivadas', 'Integrais', 'Equacoes Diferenciais'], icon: 'bi-graph-up', color: '#2563EB' },
              { area: 'Algebra Linear', temas: ['Matrizes', 'Determinantes', 'Autovalores', 'Espacos Vetoriais'], icon: 'bi-grid-3x3', color: '#6366F1' },
              { area: 'Estatistica', temas: ['Distribuicao Normal', 'Hipoteses', 'Regressao', 'Inferencia'], icon: 'bi-bar-chart', color: '#0EA5E9' },
              { area: 'Programacao', temas: ['Algoritmos', 'POO', 'Estruturas de Dados', 'Complexidade'], icon: 'bi-code-slash', color: '#10B981' },
              { area: 'Engenharia Civil', temas: ['Resistencia dos Materiais', 'Hidraulica', 'Concreto', 'Topografia'], icon: 'bi-building', color: '#F59E0B' },
              { area: 'Engenharia Eletrica', temas: ['Circuitos', 'Eletromagnetismo', 'Sinais', 'Controle'], icon: 'bi-cpu', color: '#EAB308' },
              { area: 'Medicina', temas: ['Anatomia', 'Fisiologia', 'Farmacologia', 'Patologia'], icon: 'bi-heart-pulse', color: '#EF4444' },
              { area: 'Enfermagem', temas: ['Semiologia', 'SAE', 'Farmacologia Clinica', 'UTI'], icon: 'bi-bandaid', color: '#EC4899' },
              { area: 'Psicologia', temas: ['Freud', 'Skinner', 'Gestalt', 'Cognicao'], icon: 'bi-emoji-smile', color: '#A855F7' },
              { area: 'Economia', temas: ['Micro', 'Macro', 'Inflacao', 'Politica Monetaria'], icon: 'bi-currency-dollar', color: '#22C55E' },
              { area: 'Administracao', temas: ['Marketing', 'RH', 'Estrategia', 'Logistica'], icon: 'bi-briefcase', color: '#0891B2' },
              { area: 'Contabilidade', temas: ['DRE', 'Balanco', 'Custos', 'Auditoria'], icon: 'bi-calculator', color: '#14B8A6' },
              { area: 'Arquitetura', temas: ['Bauhaus', 'Sustentabilidade', 'Urbanismo', 'CAD'], icon: 'bi-house', color: '#D97706' },
              { area: 'Engenharia de Software', temas: ['UML', 'Scrum', 'Padroes Projeto', 'DevOps'], icon: 'bi-laptop', color: '#3B82F6' },
              { area: 'Ciencia de Dados', temas: ['Python', 'Machine Learning', 'SQL', 'Visualizacao'], icon: 'bi-bar-chart-line', color: '#8B5CF6' },
              { area: 'Marketing Digital', temas: ['SEO', 'Trafego Pago', 'Funil de Vendas', 'Analytics'], icon: 'bi-megaphone', color: '#F97316' },
            ].map((cat, i) => (
              <div key={i} className="section-card" style={{ padding: '16px', cursor: 'pointer', transition: 'transform 0.15s ease' }}
                onClick={() => { setTema(cat.temas[0]); }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: `${cat.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className={`bi ${cat.icon}`} style={{ color: cat.color, fontSize: 14 }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{cat.area}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {cat.temas.map((t, j) => (
                    <button key={j} onClick={(e) => { e.stopPropagation(); setTema(t); }}
                      style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'var(--hover)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Public Resources — external free legal resources */}
      {!aula && !loading && (
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              <i className="bi bi-globe2" style={{ marginRight: 6 }} />Biblioteca Publica &mdash; Recursos Gratuitos Confiaveis
            </div>
            <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 10, background: 'var(--accent-light)', color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.3px' }}>
              100% GRATUITO
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }} className="study-grid">
            {[
              { nome: 'Portal do STF', desc: 'Supremo Tribunal Federal &mdash; acordaos e sumulas', url: 'https://portal.stf.jus.br/', icon: 'bi-bank', color: '#c9a84c' },
              { nome: 'Portal do STJ', desc: 'Superior Tribunal de Justica &mdash; jurisprudencia', url: 'https://www.stj.jus.br/', icon: 'bi-bank2', color: '#2563EB' },
              { nome: 'Planalto — Leis', desc: 'Codigos, leis federais e decretos', url: 'https://www.planalto.gov.br/ccivil_03/', icon: 'bi-book', color: '#10B981' },
              { nome: 'CNJ', desc: 'Conselho Nacional de Justica', url: 'https://www.cnj.jus.br/', icon: 'bi-diagram-3', color: '#8B5CF6' },
              { nome: 'JusBrasil', desc: 'Maior acervo juridico da internet', url: 'https://www.jusbrasil.com.br/', icon: 'bi-search', color: '#EC4899' },
              { nome: 'Senado — Biblioteca', desc: 'Biblioteca digital do Senado Federal', url: 'https://www2.senado.leg.br/bdsf/', icon: 'bi-journal-richtext', color: '#F59E0B' },
              { nome: 'Dominio Publico', desc: 'Livros, teses e monografias gratuitas', url: 'http://www.dominiopublico.gov.br/', icon: 'bi-collection', color: '#06B6D4' },
              { nome: 'Khan Academy BR', desc: 'Matematica, ciencias e fisica gratis', url: 'https://pt.khanacademy.org/', icon: 'bi-mortarboard', color: '#14B8A6' },
              { nome: 'Brasil Escola', desc: 'Resumos de todas as materias ENEM', url: 'https://brasilescola.uol.com.br/', icon: 'bi-backpack', color: '#6366F1' },
              { nome: 'Me Salva!', desc: 'Aulas ENEM e vestibular no YouTube', url: 'https://www.youtube.com/@MeSalvaENEM', icon: 'bi-youtube', color: '#EF4444' },
              { nome: 'Duolingo', desc: 'Aprenda idiomas gratuitamente', url: 'https://www.duolingo.com/', icon: 'bi-translate', color: '#22C55E' },
              { nome: 'Gran Cursos YouTube', desc: 'Aulas gratuitas de Direito no YouTube', url: 'https://www.youtube.com/@grancursos', icon: 'bi-play-btn', color: '#F97316' },
            ].map((rec, i) => (
              <a key={i} href={rec.url} target="_blank" rel="noopener noreferrer"
                className="section-card"
                style={{ padding: '14px 16px', textDecoration: 'none', color: 'inherit', display: 'block', transition: 'all 0.15s ease', position: 'relative' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = rec.color }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = '' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: `${rec.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className={`bi ${rec.icon}`} style={{ color: rec.color, fontSize: 14 }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {rec.nome}
                      <i className="bi bi-box-arrow-up-right" style={{ fontSize: 10, color: 'var(--text-muted)' }} />
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{rec.desc}</div>
              </a>
            ))}
          </div>
        </div>
      )}

      {erro && (
        <div style={{ padding: '12px 14px', borderRadius: 8, background: 'var(--danger-light)', color: 'var(--danger)', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <i className="bi bi-exclamation-triangle-fill" /> {erro}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
          <span style={{ display: 'inline-block', width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: 16 }} />
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Preparando aula completa...</div>
          <div style={{ fontSize: 13 }}>Elaborando conteudo em tres niveis</div>
        </div>
      ) : aula ? (
        <>
          {/* Confidence badge */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <ConfidenceBadge confianca={aula?.confianca} />
          </div>
          {/* Level tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {NIVEIS.map(n => (
              <button key={n.key} onClick={() => setNivel(n.key)} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10,
                border: nivel === n.key ? `2px solid ${n.color}` : '1px solid var(--border)',
                background: nivel === n.key ? `${n.color}12` : 'var(--card-bg)',
                color: nivel === n.key ? n.color : 'var(--text-secondary)',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", transition: 'all 0.15s',
              }}>
                <i className={`bi ${n.icon}`} /> {n.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="section-card" style={{ padding: '24px 28px' }}>
            {nivel === 'basico' && aula.basico && (() => {
              const b = aula.basico as any
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div><div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#2d8659', marginBottom: 8 }}>Definicao</div><p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.7 }}>{String(b.definicao)}</p></div>
                  {b.analogia && <div style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--accent-light)', borderLeft: '3px solid var(--accent)' }}><div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent)', marginBottom: 6 }}>Analogia</div><p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{String(b.analogia)}</p></div>}
                  {b.origem && <div><div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 8 }}>Origem Historica</div><p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{String(b.origem)}</p></div>}
                </div>
              )
            })()}

            {nivel === 'intermediario' && aula.intermediario && (() => {
              const m = aula.intermediario as any
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div><div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#4f46e5', marginBottom: 8 }}>Definicao Tecnica</div><p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.7 }}>{String(m.definicao_tecnica)}</p></div>
                  {Array.isArray(m.legislacao) && <div><div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 8 }}>Legislacao Aplicavel</div><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{m.legislacao.map((l: string, i: number) => <span key={i} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, background: 'var(--hover)', color: 'var(--text-secondary)', fontWeight: 500 }}>{l}</span>)}</div></div>}
                  {Array.isArray(m.exemplos) && <div><div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 8 }}>Exemplos Praticos</div>{m.exemplos.map((ex: string, i: number) => <p key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 8, paddingLeft: 12, borderLeft: '2px solid var(--border)' }}>{ex}</p>)}</div>}
                </div>
              )
            })()}

            {nivel === 'avancado' && aula.avancado && (() => {
              const a = aula.avancado as any
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {Array.isArray(a.controversias) && <div><div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#c0392b', marginBottom: 8 }}>Controversias Doutrinarias</div>{a.controversias.map((c: string, i: number) => <p key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 8, paddingLeft: 12, borderLeft: '2px solid var(--danger)' }}>{c}</p>)}</div>}
                  {a.jurisprudencia_divergente && <div style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--hover)' }}><div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 8 }}>Jurisprudencia Divergente</div><p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{String(a.jurisprudencia_divergente)}</p></div>}
                  {a.analise_critica && <div><div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 8 }}>Analise Critica</div><p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{String(a.analise_critica)}</p></div>}
                </div>
              )
            })()}

            {nivel === 'questoes' && Array.isArray(aula.questoes) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Estatisticas globais (apenas quando ha tentativas) */}
                {quizStats && quizStats.total > 0 && (
                  <div className="section-card" style={{ padding: '14px 16px', background: 'var(--card-bg)' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 12 }}>
                      <i className="bi bi-bar-chart" style={{ marginRight: 6 }} />Suas estatisticas
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{quizStats.total}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>respondidas</div>
                      </div>
                      <div style={{ height: 32, width: 1, background: 'var(--border)' }} />
                      <div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: quizStats.taxa >= 0.7 ? 'var(--success)' : quizStats.taxa >= 0.4 ? '#e67e22' : 'var(--danger)', lineHeight: 1 }}>
                          {Math.round(quizStats.taxa * 100)}%
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>taxa de acerto</div>
                      </div>
                      {(() => {
                        const piores = quizStats.porTema
                          .filter(t => t.total > 0)
                          .map(t => ({ ...t, taxa: t.acertos / t.total }))
                          .sort((a, b) => a.taxa - b.taxa)
                          .slice(0, 3)
                        if (piores.length === 0) return null
                        return (
                          <>
                            <div style={{ height: 32, width: 1, background: 'var(--border)' }} />
                            <div style={{ flex: 1, minWidth: 220 }}>
                              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Topicos mais errados</div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {piores.map((t, idx) => (
                                  <span key={idx} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 6, background: 'rgba(192,57,43,0.10)', color: 'var(--danger)', fontWeight: 600 }}>
                                    {t.tema} <span style={{ opacity: 0.7, marginLeft: 4 }}>{Math.round(t.taxa * 100)}%</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          </>
                        )
                      })()}
                    </div>
                  </div>
                )}

                {(aula.questoes as any[]).map((q, i) => (
                  <QuestaoCard
                    key={i}
                    questao={q}
                    index={i}
                    tema={tema}
                    onAttempt={refreshQuizStats}
                    onFlashcardSaved={refreshFlashcards}
                  />
                ))}
              </div>
            )}

            {nivel === 'flashcards' && (
              <FlashcardsTab
                stats={flashStats}
                cards={dueCards}
                loading={loadingFlash}
                onReview={async (id, q) => {
                  await reviewFlashcard(id, q)
                  // remove the reviewed card from the list optimistically
                  setDueCards(prev => prev.filter(c => c.id !== id))
                  refreshFlashcards()
                }}
                onRefresh={refreshFlashcards}
              />
            )}

            {nivel === 'plano' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {aula.plano_estudo && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#3B82F6', marginBottom: 8 }}>Plano de Estudo Sugerido</div>
                    <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{String(aula.plano_estudo)}</p>
                  </div>
                )}
                {aula.analise_video && (
                  <div style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--accent-light)', borderLeft: '3px solid var(--accent)' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent)', marginBottom: 8 }}>Resumo do Video</div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{String(aula.analise_video)}</p>
                  </div>
                )}
                {aula.padrao_provas && (
                  <div style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--hover)', borderLeft: '3px solid #F59E0B' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#F59E0B', marginBottom: 8 }}>Padrao de Provas</div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{String(aula.padrao_provas)}</p>
                  </div>
                )}
                {!aula.plano_estudo && !aula.analise_video && !aula.padrao_provas && (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    <p style={{ fontSize: 13 }}>Informe uma faculdade ou link de video para ver o plano de estudo personalizado</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {aula.mapa_mental && (
            <div className="section-card" style={{ padding: '18px 20px', marginTop: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 10 }}>Mapa Mental</div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{String(aula.mapa_mental)}</p>
            </div>
          )}

          <button onClick={() => { setAula(null); setTema('') }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: 11, background: 'none', border: '1px dashed var(--border)', borderRadius: 10, color: 'var(--text-muted)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", marginTop: 16 }}>
            <i className="bi bi-arrow-counterclockwise" /> Novo tema
          </button>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
            <PoweredByLexAI />
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
          <i className="bi bi-mortarboard" style={{ fontSize: 48, display: 'block', marginBottom: 16, opacity: 0.25 }} />
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Aprenda qualquer tema juridico</div>
          <div style={{ fontSize: 13 }}>Digite um tema e receba uma aula completa em 3 niveis com questoes OAB</div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function QuestaoCard({ questao: q, index: i, tema, onAttempt, onFlashcardSaved }: { questao: any; index: number; tema: string; onAttempt?: () => void; onFlashcardSaved?: () => void }) {
  const [mostrar, setMostrar] = useState(false)
  const [selecionada, setSelecionada] = useState<string | null>(null)
  const [tempoSeg, setTempoSeg] = useState<number | null>(null)
  const [startedAt] = useState<number>(() => Date.now())
  const [savingAttempt, setSavingAttempt] = useState(false)
  // Flashcard form
  const [showFlashForm, setShowFlashForm] = useState(false)
  const [flashPergunta, setFlashPergunta] = useState('')
  const [flashResposta, setFlashResposta] = useState('')
  const [savingFlash, setSavingFlash] = useState(false)
  const [flashSaved, setFlashSaved] = useState(false)

  const alt = (q.alternativas || {}) as Record<string, string>
  const correta = String(q.resposta_correta || '').toLowerCase()
  const acertou = mostrar && selecionada === correta

  async function escolherAlternativa(letra: string) {
    if (mostrar) return
    const elapsed = Math.max(1, Math.round((Date.now() - startedAt) / 1000))
    setSelecionada(letra)
    setMostrar(true)
    setTempoSeg(elapsed)
    setSavingAttempt(true)
    try {
      await recordQuizAttempt(
        tema || '(sem tema)',
        q,
        letra,
        correta,
        letra === correta,
        elapsed,
      )
      onAttempt?.()
    } catch { /* ignore */ } finally {
      setSavingAttempt(false)
    }
  }

  function abrirFormFlashcard() {
    if (!showFlashForm) {
      // Pre-fill from question
      setFlashPergunta(String(q.enunciado || ''))
      const respostaTexto = (alt[correta] ? `${correta.toUpperCase()}) ${alt[correta]}` : correta.toUpperCase())
      const just = q.justificativa ? `\n\n${String(q.justificativa)}` : ''
      setFlashResposta(`${respostaTexto}${just}`)
    }
    setShowFlashForm(s => !s)
  }

  async function salvarFlashcard() {
    if (!flashPergunta.trim() || !flashResposta.trim()) return
    setSavingFlash(true)
    try {
      const card = await createFlashcard(tema || '(sem tema)', flashPergunta.trim(), flashResposta.trim())
      if (card) {
        setFlashSaved(true)
        setShowFlashForm(false)
        onFlashcardSaved?.()
      }
    } catch { /* ignore */ } finally {
      setSavingFlash(false)
    }
  }

  return (
    <div style={{ padding: '18px 20px', borderRadius: 12, background: 'var(--hover)', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: 'var(--accent-light)', color: 'var(--accent)' }}>Questao {i + 1}</span>
        {q.estilo_prova && <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: 'var(--hover)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>{String(q.estilo_prova)}</span>}
        {mostrar && (
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
            background: acertou ? 'rgba(45,134,89,0.14)' : 'rgba(192,57,43,0.14)',
            color: acertou ? 'var(--success)' : 'var(--danger)',
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>
            <i className={`bi ${acertou ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}`} />
            {acertou ? 'Acertou!' : 'Errou'}
          </span>
        )}
        {tempoSeg !== null && (
          <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <i className="bi bi-stopwatch" />{tempoSeg}s
          </span>
        )}
      </div>
      <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.7, marginBottom: 14 }}>{String(q.enunciado)}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {Object.entries(alt).map(([letra, texto]) => {
          const isCorreta = mostrar && letra === correta
          const isErrada = mostrar && selecionada === letra && letra !== correta
          return (
            <button key={letra} onClick={() => escolherAlternativa(letra)} disabled={mostrar} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', borderRadius: 8, textAlign: 'left', cursor: mostrar ? 'default' : 'pointer', fontFamily: "'DM Sans',sans-serif",
              background: isCorreta ? 'rgba(45,134,89,0.12)' : isErrada ? 'rgba(192,57,43,0.12)' : 'var(--card-bg)',
              border: isCorreta ? '1.5px solid var(--success)' : isErrada ? '1.5px solid var(--danger)' : '1px solid var(--border)',
              color: 'var(--text-primary)', fontSize: 13, transition: 'all 0.15s',
            }}>
              <span style={{ fontWeight: 700, color: isCorreta ? 'var(--success)' : isErrada ? 'var(--danger)' : 'var(--text-muted)', minWidth: 18 }}>{letra.toUpperCase()})</span>
              <span style={{ lineHeight: 1.5 }}>{texto}</span>
            </button>
          )
        })}
      </div>
      {mostrar && q.justificativa && (
        <div style={{ marginTop: 14, padding: '14px 16px', borderRadius: 10, background: 'var(--card-bg)', borderLeft: '3px solid var(--accent)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent)', marginBottom: 6 }}>Justificativa</div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{String(q.justificativa)}</p>
        </div>
      )}
      {mostrar && (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={abrirFormFlashcard}
              disabled={flashSaved}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 12, padding: '6px 12px', borderRadius: 8,
                background: flashSaved ? 'var(--accent-light)' : 'var(--card-bg)',
                border: '1px solid var(--border)',
                color: flashSaved ? 'var(--accent)' : 'var(--text-secondary)',
                cursor: flashSaved ? 'default' : 'pointer',
                fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
              }}
            >
              <i className={`bi ${flashSaved ? 'bi-check2-circle' : 'bi-collection'}`} />
              {flashSaved ? 'Flashcard salvo' : 'Salvar como flashcard'}
            </button>
            {savingAttempt && (
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                <i className="bi bi-arrow-repeat" style={{ marginRight: 4 }} />Registrando...
              </span>
            )}
          </div>
          {showFlashForm && (
            <div style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--card-bg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>
                <label style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>Pergunta</label>
                <textarea value={flashPergunta} onChange={e => setFlashPergunta(e.target.value)} rows={2} className="form-input" style={{ width: '100%', fontSize: 12, marginTop: 4, resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>Resposta</label>
                <textarea value={flashResposta} onChange={e => setFlashResposta(e.target.value)} rows={3} className="form-input" style={{ width: '100%', fontSize: 12, marginTop: 4, resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={salvarFlashcard}
                  disabled={savingFlash || !flashPergunta.trim() || !flashResposta.trim()}
                  className="btn-primary"
                  style={{ fontSize: 12, padding: '6px 14px' }}
                >
                  {savingFlash ? 'Salvando...' : 'Salvar'}
                </button>
                <button
                  onClick={() => setShowFlashForm(false)}
                  style={{ fontSize: 12, padding: '6px 14px', borderRadius: 8, background: 'none', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Flashcards tab
// ---------------------------------------------------------------------------

function FlashcardsTab({
  stats,
  cards,
  loading,
  onReview,
  onRefresh,
}: {
  stats: FlashcardStats | null
  cards: FlashcardRow[]
  loading: boolean
  onReview: (id: string, quality: number) => Promise<void>
  onRefresh: () => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#8B5CF6' }}>
          <i className="bi bi-collection" style={{ marginRight: 6 }} />Flashcards &mdash; Spaced Repetition
        </div>
        <button onClick={onRefresh} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, background: 'none', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
          <i className="bi bi-arrow-clockwise" style={{ marginRight: 4 }} />Atualizar
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        <div className="section-card" style={{ padding: '14px 16px', textAlign: 'center', background: 'var(--card-bg)' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{stats?.total ?? 0}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, marginTop: 4 }}>total de cards</div>
        </div>
        <div className="section-card" style={{ padding: '14px 16px', textAlign: 'center', background: 'var(--card-bg)' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: (stats?.due ?? 0) > 0 ? '#8B5CF6' : 'var(--text-primary)', lineHeight: 1 }}>{stats?.due ?? 0}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, marginTop: 4 }}>para revisar hoje</div>
        </div>
        <div className="section-card" style={{ padding: '14px 16px', textAlign: 'center', background: 'var(--card-bg)' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{stats ? stats.facilidadeMedia.toFixed(2) : '0.00'}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, marginTop: 4 }}>facilidade media</div>
        </div>
      </div>

      {/* Review queue */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
          <span style={{ display: 'inline-block', width: 28, height: 28, border: '3px solid var(--border)', borderTopColor: '#8B5CF6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : cards.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
          <i className="bi bi-check2-circle" style={{ fontSize: 36, display: 'block', marginBottom: 10, color: '#8B5CF6', opacity: 0.7 }} />
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Nenhum card para revisar hoje</div>
          <div style={{ fontSize: 12 }}>Volte amanha! Salve flashcards a partir das questoes para comecar.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {cards.map(card => (
            <FlashcardReview key={card.id} card={card} onReview={onReview} />
          ))}
        </div>
      )}
    </div>
  )
}

function FlashcardReview({
  card,
  onReview,
}: {
  card: FlashcardRow
  onReview: (id: string, quality: number) => Promise<void>
}) {
  const [revealed, setRevealed] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function answer(quality: number) {
    if (submitting) return
    setSubmitting(true)
    try {
      await onReview(card.id, quality)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ padding: '18px 20px', borderRadius: 12, background: 'var(--hover)', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: 'rgba(139,92,246,0.14)', color: '#8B5CF6' }}>
          {card.tema || '(sem tema)'}
        </span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
          <i className="bi bi-arrow-repeat" style={{ marginRight: 4 }} />{card.total_revisoes} revisoes
        </span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
          ease {Number(card.facilidade).toFixed(2)}
        </span>
      </div>
      <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.7, marginBottom: 12, whiteSpace: 'pre-wrap' }}>{card.pergunta}</p>

      {!revealed ? (
        <button
          onClick={() => setRevealed(true)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 12, padding: '8px 14px', borderRadius: 8,
            background: 'var(--card-bg)', border: '1px solid var(--border)',
            color: 'var(--text-secondary)', cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
          }}
        >
          <i className="bi bi-eye" />Mostrar resposta
        </button>
      ) : (
        <>
          <div style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--card-bg)', borderLeft: '3px solid #8B5CF6', marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#8B5CF6', marginBottom: 6 }}>Resposta</div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{card.resposta}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {([
              { q: 1, label: 'Errei', color: '#c0392b' },
              { q: 3, label: 'Dificil', color: '#e67e22' },
              { q: 4, label: 'Bom', color: '#2d8659' },
              { q: 5, label: 'Facil', color: '#3B82F6' },
            ] as const).map(opt => (
              <button
                key={opt.q}
                disabled={submitting}
                onClick={() => answer(opt.q)}
                style={{
                  fontSize: 12, padding: '10px 8px', borderRadius: 8,
                  background: `${opt.color}14`, border: `1px solid ${opt.color}55`,
                  color: opt.color, cursor: submitting ? 'wait' : 'pointer',
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

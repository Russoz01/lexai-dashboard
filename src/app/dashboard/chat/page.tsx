'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  RotateCcw,
  ArrowUpRight,
  Paperclip,
  AlertTriangle,
  X,
  RefreshCw,
  FileText,
  Pencil,
  BookMarked,
  Zap,
  Bell,
  Calculator,
  Book,
  CalendarDays,
  FileSpreadsheet,
  Sparkles,
  Settings2,
  Brain,
  Gauge,
  ChevronUp,
  ChevronDown,
  type LucideIcon,
} from 'lucide-react'
import { extractPdfWithMeta } from '@/lib/pdf-parser'
import { confirmDialog } from '@/components/ConfirmDialog'
import { safeLog } from '@/lib/safe-log'

/* ─────────────────────────────────────────────────────────────────────────────
 * Pralvex — Chat Orquestrador
 *
 * Interface conversacional única. O usuário manda texto ou arquivo (PDF/TXT),
 * o orquestrador decide se responde direto ou sugere o agente especialista.
 *
 * Design: editorial, mesma linguagem do atelier — stone/navy, Playfair italic,
 * hairlines, números em série. Sem balão azul de chatbot. As mensagens são
 * tratadas como entradas de diário.
 * ──────────────────────────────────────────────────────────────────────────── */

type Role = 'user' | 'assistant'
type Fidelidade = 'profissional' | 'parceiro' | 'casual'
type Modo = 'simples' | 'complexo'

const LS_FIDELIDADE = 'pralvex-chat-fidelidade'
const LS_MODO = 'pralvex-chat-modo'
// 2026-05-04 bug-fix cliente "sumiu meu chat": persiste mensagens da sessao
// em localStorage. Reload/F5/fechar-aba mantem conversa. Limite 60 msgs
// (cap historico recente, performance). Usuario clica "Nova conversa" pra
// limpar manualmente.
const LS_MESSAGES = 'pralvex-chat-messages'
const LS_SESSION_ID = 'pralvex-chat-session-id'
const MESSAGES_PERSIST_LIMIT = 60

// Gera UUID v4 simples (browser native crypto). Fallback Math.random pra dev local
// sem crypto.randomUUID (raro em Chrome/Firefox modernos).
function genSessionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  // RFC4122 v4 fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

interface AgenteSugerido {
  key: string
  titulo: string
  rota: string
  justificativa: string
  pre_prompt?: string
}

interface Message {
  id: string
  role: Role
  content: string
  arquivo?: { nome: string; paginas?: number; chars: number }
  agente?: AgenteSugerido
  timestamp: number
}

const AGENTES_ICONS: Record<string, LucideIcon> = {
  resumidor:   FileText,
  redator:     Pencil,
  pesquisador: BookMarked,
  negociador:  Zap,
  professor:   Bell,
  calculador:  Calculator,
  legislacao:  Book,
  rotina:      CalendarDays,
  planilhas:   FileSpreadsheet,
}

function nowId() { return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` }

function fmtHora(ts: number) {
  return new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

const SUGESTOES: { Icon: LucideIcon; texto: string }[] = [
  { Icon: FileText,   texto: 'Analisar um contrato anexado' },
  { Icon: Pencil,     texto: 'Escrever uma petição inicial' },
  { Icon: BookMarked, texto: 'Jurisprudência sobre dano moral no STJ' },
  { Icon: Calculator, texto: 'Calcular prazo de contestação' },
]

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  // Bug-fix urgente cliente (2026-05-04): refactor singular -> array.
  // Antes: `arquivo: T | null` (1 anexo por vez, sem drag-drop, sem multi-select).
  // Depois: `arquivos: T[]` + drag-drop + input multiple.
  type Anexo = { nome: string; texto: string; paginas: number }
  const [arquivos, setArquivos] = useState<Anexo[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [parsingPdf, setParsingPdf] = useState(false)
  // Migration 016 (2026-05-04): session_id agrupa exchanges da mesma conversa.
  // Frontend gera UUID v4 quando inicia chat fresh, mantem mesmo durante toda
  // a sessao. Persistido em localStorage junto com messages. Botao "Nova conversa"
  // gera novo UUID. Param ?session=X carrega sessao do banco e usa o ID dela.
  const [sessionId, setSessionId] = useState<string>('')
  const [carregandoSessao, setCarregandoSessao] = useState(false)

  // Configuracoes do chat — persistem em localStorage
  // fidelidade: como o assistente trata voce (profissional/parceiro/casual)
  // modo: profundidade da resposta (simples=Haiku rapido / complexo=Sonnet aprofundado)
  const [fidelidade, setFidelidade] = useState<Fidelidade>('parceiro')
  const [modo, setModo] = useState<Modo>('simples')
  const [showSettings, setShowSettings] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Wave C5 fix: AbortController + mounted ref pra cancelar stream em
  // unmount/limpar conversa. Sem isso, setState dispara em componente
  // desmontado (warning React) e reader vaza.
  const abortRef = useRef<AbortController | null>(null)
  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      abortRef.current?.abort()
    }
  }, [])

  // Hidrata as preferencias + mensagens + sessionId do localStorage no mount.
  // Tambem suporta query param ?session=<UUID> pra reabrir conversa do historico.
  useEffect(() => {
    let restoredSessionId: string | null = null
    try {
      const f = localStorage.getItem(LS_FIDELIDADE) as Fidelidade | null
      if (f && ['profissional', 'parceiro', 'casual'].includes(f)) setFidelidade(f)
      const m = localStorage.getItem(LS_MODO) as Modo | null
      if (m && ['simples', 'complexo'].includes(m)) setModo(m)
      // Persistencia mensagens (bug-fix "sumiu meu chat")
      const raw = localStorage.getItem(LS_MESSAGES)
      if (raw) {
        const parsed = JSON.parse(raw) as Message[]
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Sanity check: cada msg precisa ter id + role + content
          const safe = parsed.filter(m => m && m.id && m.role && typeof m.content === 'string')
          if (safe.length > 0) setMessages(safe)
        }
      }
      restoredSessionId = localStorage.getItem(LS_SESSION_ID)
    } catch { /* localStorage indisponivel ou JSON corrupto — silent */ }

    // Detecta ?session=<UUID> na URL (pra reabrir conversa do historico)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const querySessionId = params.get('session')
      if (querySessionId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(querySessionId)) {
        // Carrega sessao do banco e substitui state local
        setSessionId(querySessionId)
        setCarregandoSessao(true)
        fetch(`/api/historico/sessao?id=${encodeURIComponent(querySessionId)}`, { cache: 'no-store' })
          .then(r => r.ok ? r.json() : null)
          .then(data => {
            if (data?.ok && Array.isArray(data.messages)) {
              setMessages(data.messages)
              try { localStorage.setItem(LS_SESSION_ID, querySessionId) } catch { /* silent */ }
            } else {
              setErro('Conversa nao encontrada ou expirada.')
            }
          })
          .catch(() => setErro('Erro ao carregar conversa do historico.'))
          .finally(() => setCarregandoSessao(false))
        return
      }
    }

    // Sem ?session=, mantem ou cria sessionId local
    if (restoredSessionId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(restoredSessionId)) {
      setSessionId(restoredSessionId)
    } else {
      const novo = genSessionId()
      setSessionId(novo)
      try { localStorage.setItem(LS_SESSION_ID, novo) } catch { /* silent */ }
    }
  }, [])

  // Persiste em mudanca
  useEffect(() => {
    try { localStorage.setItem(LS_FIDELIDADE, fidelidade) } catch { /* silent */ }
  }, [fidelidade])
  useEffect(() => {
    try { localStorage.setItem(LS_MODO, modo) } catch { /* silent */ }
  }, [modo])
  // Persiste mensagens (cap MESSAGES_PERSIST_LIMIT pra performance + storage)
  useEffect(() => {
    try {
      if (messages.length === 0) {
        localStorage.removeItem(LS_MESSAGES)
        return
      }
      const toSave = messages.slice(-MESSAGES_PERSIST_LIMIT)
      localStorage.setItem(LS_MESSAGES, JSON.stringify(toSave))
    } catch { /* localStorage cheio ou desabilitado — silent, nao bloqueia chat */ }
  }, [messages])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    // Autofocus na primeira renderização
    inputRef.current?.focus()
  }, [])

  // Auto-resize textarea
  const autoResize = useCallback(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 220)}px`
  }, [])

  useEffect(() => { autoResize() }, [input, autoResize])

  // Processa 1 arquivo individual. Suporta PDF/TXT/MD/DOCX/CSV/XLSX/JSON/HTML.
  // Bug-fix urgente cliente (2026-05-04 10:20): "nao da pra anexar documento, todos
  // os tipos com erro". Cliente provavelmente arrastava DOCX/CSV/XLSX = rejeitado.
  // Agora aceita virtualmente qualquer formato comum de documento juridico.
  async function processarArquivo(file: File): Promise<Anexo | null> {
    if (file.size > 10 * 1024 * 1024) {
      setErro(`"${file.name}" muito grande. Limite de 10MB por arquivo.`)
      return null
    }
    const lower = file.name.toLowerCase()
    try {
      // PDF
      if (file.type === 'application/pdf' || lower.endsWith('.pdf')) {
        try {
          const { text, numPages } = await extractPdfWithMeta(file)
          if (text.length < 20) {
            setErro(`"${file.name}" sem texto extraível. Pode ser PDF escaneado (imagem). Use OCR online (smallpdf, ilovepdf) pra converter pra texto antes.`)
            return null
          }
          return { nome: file.name, texto: text, paginas: numPages }
        } catch (err) {
          const msg = err instanceof Error ? err.message : ''
          if (msg.toLowerCase().includes('password')) {
            setErro(`"${file.name}" protegido por senha. Remova a senha primeiro (Adobe/Foxit/online).`)
          } else if (msg.toLowerCase().includes('invalid pdf')) {
            setErro(`"${file.name}" PDF corrompido ou invalido.`)
          } else {
            setErro(`Erro ao ler PDF "${file.name}". Tente abrir e salvar de novo.`)
          }
          return null
        }
      }
      // RTF (Rich Text — Word legacy, comum em escritorio juridico)
      if (lower.endsWith('.rtf') || file.type === 'application/rtf' || file.type === 'text/rtf') {
        const raw = await file.text()
        // Strip RTF control words ({\rtf1\ansi\..) e grupos {} mantendo so texto.
        // Implementacao basica — cobre 90% dos RTFs simples gerados por Word/LibreOffice.
        const stripped = raw
          .replace(/\\par[d]?/g, '\n')                  // paragrafos
          .replace(/\\tab/g, '\t')                       // tabs
          .replace(/\\'([0-9a-f]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
          .replace(/\\u(-?\d+)\??/g, (_, n) => String.fromCharCode(Number(n)))
          .replace(/\\[a-z]+-?\d* ?/g, '')               // outros control words
          .replace(/[{}]/g, '')                          // grupos
          .replace(/\n{3,}/g, '\n\n')                    // collapse newlines
          .trim()
        if (stripped.length < 10) {
          setErro(`"${file.name}" RTF vazio ou nao foi possivel extrair texto.`)
          return null
        }
        return { nome: file.name, texto: stripped, paginas: 0 }
      }
      // Imagens (JPG/PNG/HEIC/GIF/WEBP) — ainda nao suportado mas mensagem clara
      if (file.type.startsWith('image/') || /\.(jpe?g|png|heic|gif|webp|bmp|tiff?)$/i.test(lower)) {
        setErro(`"${file.name}" e imagem. Pra documento escaneado, use OCR (smallpdf.com/pdf-to-text) e cole o texto. Suporte direto a imagens em breve.`)
        return null
      }
      // DOCX (Word moderno) — mammoth ja em deps
      if (
        lower.endsWith('.docx') ||
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        const mammoth = await import('mammoth')
        const arrayBuffer = await file.arrayBuffer()
        const result = await mammoth.extractRawText({ arrayBuffer })
        const text = (result.value || '').trim()
        if (text.length < 10) {
          setErro(`"${file.name}" sem texto extraível.`)
          return null
        }
        return { nome: file.name, texto: text, paginas: 0 }
      }
      // DOC (Word antigo, formato binario) — mammoth NAO suporta .doc legacy
      if (lower.endsWith('.doc') || file.type === 'application/msword') {
        setErro(`"${file.name}" formato .doc antigo nao suportado. Salva como .docx ou .pdf primeiro.`)
        return null
      }
      // CSV — papaparse ja em deps
      if (file.type === 'text/csv' || lower.endsWith('.csv')) {
        const Papa = (await import('papaparse')).default
        const csvText = await file.text()
        const parsed = Papa.parse<string[]>(csvText, { skipEmptyLines: true })
        const rows = (parsed.data || []) as string[][]
        const text = rows.map(r => r.join(' | ')).join('\n')
        if (text.length < 10) {
          setErro(`"${file.name}" CSV vazio.`)
          return null
        }
        return { nome: file.name, texto: text, paginas: 0 }
      }
      // XLSX (Excel) — xlsx ja em deps (lazy import pra nao inflar bundle main)
      if (
        lower.endsWith('.xlsx') ||
        lower.endsWith('.xls') ||
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel'
      ) {
        const XLSX = await import('xlsx')
        const arrayBuffer = await file.arrayBuffer()
        const wb = XLSX.read(arrayBuffer, { type: 'array' })
        const partes: string[] = []
        for (const sheetName of wb.SheetNames) {
          const sheet = wb.Sheets[sheetName]
          const csv = XLSX.utils.sheet_to_csv(sheet)
          partes.push(`--- ${sheetName} ---\n${csv}`)
        }
        const text = partes.join('\n\n').trim()
        if (text.length < 10) {
          setErro(`"${file.name}" planilha vazia.`)
          return null
        }
        return { nome: file.name, texto: text, paginas: 0 }
      }
      // TXT/MD/JSON/HTML/CSS/JS/TS/etc — qualquer texto plano
      if (
        file.type.startsWith('text/') ||
        file.type === 'application/json' ||
        file.type === 'application/xml' ||
        lower.endsWith('.txt') ||
        lower.endsWith('.md') ||
        lower.endsWith('.json') ||
        lower.endsWith('.xml') ||
        lower.endsWith('.html') ||
        lower.endsWith('.htm')
      ) {
        const text = await file.text()
        if (text.length < 10) {
          setErro(`"${file.name}" vazio ou muito pequeno.`)
          return null
        }
        return { nome: file.name, texto: text, paginas: 0 }
      }
      // Imagens, audio, video, etc — nao suportado mas mensagem clara
      setErro(`"${file.name}" formato não suportado. Aceitos: PDF, DOCX, TXT, MD, CSV, XLSX, JSON.`)
      return null
    } catch (err) {
      safeLog.error('[chat/file]', err)
      setErro(`Erro ao ler "${file.name}". Tente novamente.`)
      return null
    }
  }

  async function processarFiles(files: FileList | File[]) {
    const arr = Array.from(files)
    if (arr.length === 0) return
    setErro('')
    setParsingPdf(true)
    const novos: Anexo[] = []
    for (const file of arr) {
      const anexo = await processarArquivo(file)
      if (anexo) novos.push(anexo)
    }
    if (novos.length > 0) {
      setArquivos(prev => [...prev, ...novos])
    }
    setParsingPdf(false)
  }

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    // CRITICAL FIX 2026-05-04 (cliente "nao da pra anexar"):
    // ANTES: const files = e.target.files; e.target.value = ''; ...
    // BUG: setting e.target.value='' invalidava a FileList capturada (browser
    // spec — em Chromium-based, ref vira empty apos reset). Causa: log
    // mostrava Files:1 mas branch len==0 disparava (false negative).
    // FIX: Array.from() copia files PRA ARRAY antes de zerar input value.
    // Array.from cria copia independente, nao afetada pelo reset.
    const filesArray = e.target.files ? Array.from(e.target.files) : []
    e.target.value = '' // permite re-selecionar mesmo arquivo
    // eslint-disable-next-line no-console
    console.log('[chat/upload] onPickFile triggered. Files:', filesArray.length, filesArray.map(f => `${f.name} (${f.type}, ${f.size}b)`))
    if (filesArray.length === 0) {
      setErro('Nenhum arquivo selecionado.')
      return
    }
    await processarFiles(filesArray)
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!isDragOver) setIsDragOver(true)
  }

  function onDragLeave(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  async function onDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      await processarFiles(files)
    }
  }

  function removerArquivo(idx: number) {
    setArquivos(prev => prev.filter((_, i) => i !== idx))
  }

  async function enviar(textoManual?: string) {
    const texto = (textoManual ?? input).trim()
    if (!texto && arquivos.length === 0) return
    if (loading) return

    setErro('')
    // Mensagem do user no historico mostra apenas o primeiro arquivo (compat retro).
    // Lista completa segue no payload concatenado pra IA.
    const primeiroArquivo = arquivos[0]
    const userMsg: Message = {
      id: nowId(),
      role: 'user',
      content: texto,
      arquivo: primeiroArquivo
        ? {
            nome: arquivos.length > 1
              ? `${primeiroArquivo.nome} +${arquivos.length - 1} anexos`
              : primeiroArquivo.nome,
            paginas: primeiroArquivo.paginas,
            chars: arquivos.reduce((acc, a) => acc + a.texto.length, 0),
          }
        : undefined,
      timestamp: Date.now(),
    }

    // Envia 14 ultimas msgs (server pega 12 — manda 2 extras pra absorver
    // tool_use intermediario que nao conta no contexto user/assistant)
    const historicoPayload = messages.slice(-14).map(m => ({
      role: m.role,
      content: m.content + (m.agente ? ` [→ ${m.agente.titulo}]` : ''),
    }))

    // Cria a mensagem do assistente VAZIA já — streaming preenche progressivo
    const assistantId = nowId()
    const assistantMsg: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    }

    setMessages(prev => [...prev, userMsg, assistantMsg])
    setInput('')
    // Concat texto de TODOS os anexos com headers `===arquivo: nome.pdf===` pra IA
    // distinguir documentos. Backend recebe string unica em arquivoTexto (sem mudar API).
    const arquivosSnapshot = arquivos
    const arquivoTextoConcat = arquivosSnapshot.length > 0
      ? arquivosSnapshot
          .map(a => `===arquivo: ${a.nome}===\n${a.texto}`)
          .join('\n\n')
      : ''
    const arquivoNomeConcat = arquivosSnapshot.length === 1
      ? arquivosSnapshot[0].nome
      : arquivosSnapshot.length > 1
        ? `${arquivosSnapshot.length} anexos (${arquivosSnapshot.map(a => a.nome).join(', ')})`
        : ''
    setArquivos([])
    setLoading(true)

    // Wave C5 fix: aborta stream anterior se existir + cria novo controller
    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac

    try {
      // Wave C4 (2026-05-02) — streaming via NDJSON
      // Server retorna lines: {type:"text",delta:...} | {type:"agente",...} | {type:"done"} | {type:"error"}
      const res = await fetch('/api/chat?stream=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensagem: texto,
          arquivoTexto: arquivoTextoConcat || undefined,
          arquivoNome: arquivoNomeConcat || undefined,
          historico: historicoPayload,
          fidelidade,
          modo,
          sessionId: sessionId || undefined,
        }),
        signal: ac.signal,
      })

      // Erro HTTP (rate limit / quota / auth) — body é JSON normal, não stream
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setErro(data?.error || 'Erro ao processar mensagem.')
        // Remove a assistant msg vazia que adicionamos
        setMessages(prev => prev.filter(m => m.id !== assistantId))
        setLoading(false)
        return
      }

      const reader = res.body?.getReader()
      if (!reader) {
        // Browser sem ReadableStream — fallback para legacy não-streaming
        const data = await res.json()
        setMessages(prev => prev.map(m =>
          m.id === assistantId
            ? { ...m, content: data.mensagem || '', agente: data.tipo === 'rotear' ? data.agente : undefined }
            : m,
        ))
        setLoading(false)
        return
      }

      const decoder = new TextDecoder()
      let buffer = ''
      let done = false
      let gotError = false

      try {
      while (!done && !ac.signal.aborted) {
        const { value, done: streamDone } = await reader.read()
        done = streamDone
        if (value) {
          buffer += decoder.decode(value, { stream: !done })
          // NDJSON — uma linha JSON por evento
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''
          for (const line of lines) {
            if (!line.trim()) continue
            // Wave C5 fix: skip processing se desmontado/abortado
            if (!mountedRef.current || ac.signal.aborted) break
            try {
              const event = JSON.parse(line)
              if (event.type === 'text' && typeof event.delta === 'string') {
                setMessages(prev => prev.map(m =>
                  m.id === assistantId ? { ...m, content: m.content + event.delta } : m,
                ))
              } else if (event.type === 'agente' && event.agente) {
                setMessages(prev => prev.map(m =>
                  m.id === assistantId
                    ? {
                        ...m,
                        agente: event.agente,
                        // Se o LLM emitiu só tool_use sem texto, usa fallback do server
                        content: m.content || event.mensagem || '',
                      }
                    : m,
                ))
              } else if (event.type === 'done') {
                // Garante content final caso server tenha mandado fallback
                setMessages(prev => prev.map(m =>
                  m.id === assistantId && !m.content && event.mensagem
                    ? { ...m, content: event.mensagem }
                    : m,
                ))
              } else if (event.type === 'error') {
                gotError = true
                setErro(event.error || 'Erro ao processar mensagem.')
                setMessages(prev => prev.filter(m => m.id !== assistantId))
              }
            } catch {
              // Linha inválida — ignora silenciosamente
            }
          }
        }
      }
      } finally {
        // Libera lock do reader pra liberar stream HTTP
        try { reader.releaseLock() } catch { /* já released */ }
      }

      if (gotError) return
    } catch (err) {
      // AbortError esperado em unmount/limpar conversa — ignora silenciosamente
      if (err instanceof Error && err.name === 'AbortError') {
        if (mountedRef.current) setMessages(prev => prev.filter(m => m.id !== assistantId))
        return
      }
      safeLog.error('[chat/send]', err)
      if (mountedRef.current) {
        setErro('Erro de rede. Verifique sua conexão e tente novamente.')
        setMessages(prev => prev.filter(m => m.id !== assistantId))
      }
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviar()
    }
  }

  async function limparConversa() {
    // Wave C5 fix: aborta stream em curso ao limpar conversa
    abortRef.current?.abort()
    const ok = await confirmDialog({
      title: 'Limpar a conversa',
      description: 'Essa ação remove todas as mensagens desta sessão. Não é possível desfazer.',
      confirmLabel: 'Limpar',
      cancelLabel: 'Manter',
      variant: 'danger',
    })
    if (!ok) return
    setMessages([])
    setErro('')
    // Migration 016: nova conversa = novo session_id (rows seguintes ficam
    // separadas no banco). Limpa LS_MESSAGES + atualiza LS_SESSION_ID.
    const novoId = genSessionId()
    setSessionId(novoId)
    try {
      localStorage.setItem(LS_SESSION_ID, novoId)
      localStorage.removeItem(LS_MESSAGES)
    } catch { /* silent */ }
    // Limpa ?session= da URL se viemos do historico
    if (typeof window !== 'undefined' && window.location.search.includes('session=')) {
      window.history.replaceState({}, '', window.location.pathname)
    }
  }

  function abrirAgenteComContexto(agente: AgenteSugerido) {
    // Salva pre_prompt no sessionStorage para ser consumido pelo agente destino
    if (agente.pre_prompt) {
      sessionStorage.setItem(`pralvex-prefill-${agente.key}`, agente.pre_prompt)
    }
    window.location.href = agente.rota
  }

  const temConversa = messages.length > 0

  return (
    <div className="page-content chat-root">
      {/* ── Header editorial ─────────────────────────────── */}
      <div className="chat-head">
        <div>
          <div className="chat-serial">N° 010 · CHAT · MMXXVI</div>
          <h1 className="chat-title">
            Orquestrador <em className="chat-italic">conversacional</em>
          </h1>
          <p className="chat-lede">
            Mande qualquer texto ou documento. Eu respondo direto ou chamo o agente certo para você.
          </p>
        </div>
        {temConversa && (
          <button className="chat-clear" onClick={limparConversa} aria-label="Limpar conversa">
            <RotateCcw size={14} strokeWidth={1.75} aria-hidden />
            <span>Limpar</span>
          </button>
        )}
      </div>

      {/* ── Scroll area ─────────────────────────────────── */}
      <div className="chat-scroll" ref={scrollRef}>
        {!temConversa ? (
          <div className="chat-empty">
            <div className="chat-empty-mark">
              <svg viewBox="0 0 40 40" fill="none" width="32" height="32" aria-hidden="true">
                <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="1.3" />
                <path d="M13 17 L20 24 L27 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="chat-empty-serial">Capítulo I</div>
            <h2 className="chat-empty-title">
              Como posso te <em className="chat-italic">ajudar hoje</em>?
            </h2>
            <p className="chat-empty-lede">
              Digite uma dúvida, cole um trecho ou anexe um arquivo. Eu analiso e decido o melhor caminho.
            </p>

            <div className="chat-suggestions">
              {SUGESTOES.map((s) => {
                const Icon = s.Icon
                return (
                  <button
                    key={s.texto}
                    className="chat-suggestion"
                    onClick={() => { setInput(s.texto); inputRef.current?.focus() }}
                    type="button"
                  >
                    <Icon size={16} strokeWidth={1.75} aria-hidden />
                    <span>{s.texto}</span>
                    <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden className="chat-sug-arrow" />
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="chat-messages">
            {messages.map((m, idx) => (
              <article key={m.id} className={`chat-msg chat-msg--${m.role}`} data-idx={idx}>
                <div className="chat-msg-meta">
                  <span className="chat-msg-label">
                    {m.role === 'user' ? 'Você' : 'Pralvex'}
                  </span>
                  <span className="chat-msg-time">{fmtHora(m.timestamp)}</span>
                </div>

                {m.arquivo && (
                  <div className="chat-msg-file">
                    <Paperclip size={14} strokeWidth={1.75} aria-hidden />
                    <span>{m.arquivo.nome}</span>
                    {m.arquivo.paginas ? <span className="chat-msg-file-meta">· {m.arquivo.paginas} pgs</span> : null}
                    <span className="chat-msg-file-meta">· {(m.arquivo.chars / 1000).toFixed(1)}k caracteres</span>
                  </div>
                )}

                {m.content && (
                  <div className="chat-msg-body">
                    {m.content.split('\n').map((line, i) => (
                      line.trim() ? <p key={i}>{line}</p> : <div key={i} style={{ height: 6 }} />
                    ))}
                  </div>
                )}

                {/* Typing dots quando assistant ainda nao recebeu nenhum delta */}
                {m.role === 'assistant' && !m.content && loading && idx === messages.length - 1 && (
                  <div
                    className="chat-typing"
                    role="status"
                    aria-live="polite"
                    aria-label="Pralvex está pensando"
                  >
                    <span className="chat-dot" aria-hidden="true" />
                    <span className="chat-dot" aria-hidden="true" />
                    <span className="chat-dot" aria-hidden="true" />
                    <span className="sr-only">Pralvex está pensando...</span>
                  </div>
                )}

                {m.agente && (() => {
                  const AgenteIcon = AGENTES_ICONS[m.agente.key] || Sparkles
                  return (
                    <div className="chat-msg-agente">
                      <div className="chat-msg-agente-head">
                        <AgenteIcon size={18} strokeWidth={1.75} aria-hidden />
                        <span className="chat-msg-agente-titulo">
                          Agente recomendado · <strong>{m.agente.titulo}</strong>
                        </span>
                      </div>
                      <p className="chat-msg-agente-just">{m.agente.justificativa}</p>
                      <button
                        className="chat-msg-agente-cta"
                        onClick={() => abrirAgenteComContexto(m.agente!)}
                        type="button"
                      >
                        Abrir {m.agente.titulo} &nbsp;→
                      </button>
                    </div>
                  )
                })()}
              </article>
            ))}

            {/* Typing dots agora aparecem inline na propria msg do assistant
                vazia (Wave C4 streaming). Bloco externo removido. */}
          </div>
        )}
      </div>

      {/* ── Composer ──────────────────────────────────────
          Debug 2026-05-04 cliente "nao da pra anexar nada":
          Removido overlay drag-drop (suspeita interferencia com input click).
          Drag-drop handlers continuam ativos (SEM overlay visivel) — feedback
          visual apenas via outline tracejado quando isDragOver. */}
      <div
        className="chat-composer"
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        style={isDragOver ? {
          background: 'rgba(191,166,142,0.08)',
          outline: '2px dashed var(--accent)',
          outlineOffset: -8,
          borderRadius: 12,
        } : undefined}
      >
        {erro && (
          <div className="chat-error" role="alert">
            <AlertTriangle size={14} strokeWidth={1.75} aria-hidden />
            <span>{erro}</span>
            <button type="button" onClick={() => setErro('')} aria-label="Fechar">
              <X size={14} strokeWidth={1.75} aria-hidden />
            </button>
          </div>
        )}

        {/* Settings bar — fidelidade + modo */}
        <div className="chat-settings">
          <button
            type="button"
            className="chat-settings-toggle"
            onClick={() => setShowSettings(s => !s)}
            aria-expanded={showSettings}
            aria-label="Configurar chat"
          >
            <Settings2 size={13} strokeWidth={1.75} aria-hidden />
            <span className="chat-settings-summary">
              <strong>{modo === 'complexo' ? 'Complexo' : 'Simples'}</strong>
              <span className="chat-settings-sep">·</span>
              <span>
                {fidelidade === 'profissional' ? 'Profissional' : fidelidade === 'casual' ? 'Casual' : 'Parceiro'}
              </span>
            </span>
            <span className="chat-settings-caret" aria-hidden="true">
              {showSettings ? <ChevronUp size={12} strokeWidth={2} /> : <ChevronDown size={12} strokeWidth={2} />}
            </span>
          </button>

          {showSettings && (
            <div className="chat-settings-panel">
              {/* Modo */}
              <div className="chat-settings-group">
                <div className="chat-settings-label">
                  <Gauge size={11} strokeWidth={2} aria-hidden />
                  Profundidade
                </div>
                <div className="chat-settings-segments" role="radiogroup">
                  <button
                    type="button"
                    role="radio"
                    aria-checked={modo === 'simples'}
                    onClick={() => setModo('simples')}
                    className={`chat-settings-seg ${modo === 'simples' ? 'is-active' : ''}`}
                  >
                    <Zap size={11} strokeWidth={2} aria-hidden />
                    Simples
                    <small>resposta rapida</small>
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={modo === 'complexo'}
                    onClick={() => setModo('complexo')}
                    className={`chat-settings-seg ${modo === 'complexo' ? 'is-active' : ''}`}
                  >
                    <Brain size={11} strokeWidth={2} aria-hidden />
                    Complexo
                    <small>raciocinio profundo</small>
                  </button>
                </div>
              </div>

              {/* Fidelidade — tom */}
              <div className="chat-settings-group">
                <div className="chat-settings-label">
                  <Sparkles size={11} strokeWidth={2} aria-hidden />
                  Tom
                </div>
                <div className="chat-settings-segments" role="radiogroup">
                  {(['profissional', 'parceiro', 'casual'] as const).map(f => (
                    <button
                      key={f}
                      type="button"
                      role="radio"
                      aria-checked={fidelidade === f}
                      onClick={() => setFidelidade(f)}
                      className={`chat-settings-seg ${fidelidade === f ? 'is-active' : ''}`}
                    >
                      {f === 'profissional' ? 'Profissional' : f === 'parceiro' ? 'Parceiro' : 'Casual'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="chat-settings-hint">
                {modo === 'complexo'
                  ? 'Modo complexo usa raciocinio mais profundo — leva alguns segundos a mais.'
                  : 'Modo simples e otimizado pra respostas em segundos.'}
              </div>
            </div>
          )}
        </div>

        {parsingPdf && (
          <div className="chat-attached">
            <RefreshCw size={18} strokeWidth={1.75} aria-hidden className="chat-spin" />
            <span>Processando arquivo(s)...</span>
          </div>
        )}
        {arquivos.length > 0 && !parsingPdf && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {arquivos.map((a, idx) => (
              <div key={`${a.nome}-${idx}`} className="chat-attached">
                <FileText size={18} strokeWidth={1.75} aria-hidden />
                <div className="chat-attached-info">
                  <div className="chat-attached-name">{a.nome}</div>
                  <div className="chat-attached-meta">
                    {a.paginas > 0 ? `${a.paginas} páginas · ` : ''}
                    {(a.texto.length / 1000).toFixed(1)}k caracteres
                  </div>
                </div>
                <button
                  className="chat-attached-remove"
                  onClick={() => removerArquivo(idx)}
                  aria-label={`Remover ${a.nome}`}
                  type="button"
                >
                  <X size={18} strokeWidth={1.75} aria-hidden />
                </button>
              </div>
            ))}
            {arquivos.length > 1 && (
              <div style={{
                fontSize: 11,
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono, ui-monospace), monospace',
                letterSpacing: '0.06em',
                paddingLeft: 4,
              }}>
                {arquivos.length} arquivos anexados · {(arquivos.reduce((acc, a) => acc + a.texto.length, 0) / 1000).toFixed(1)}k caracteres totais
              </div>
            )}
          </div>
        )}

        <div className="chat-composer-box">
          <button
            className="chat-attach-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading || parsingPdf}
            type="button"
            aria-label="Anexar arquivo"
          >
            <Paperclip size={18} strokeWidth={1.75} aria-hidden />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.md,.docx,.rtf,.csv,.xlsx,.xls,.json,.xml,.html,.htm,text/plain,text/markdown,text/csv,text/html,text/rtf,application/json,application/pdf,application/rtf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            onChange={onPickFile}
            multiple
            aria-label="Selecionar arquivos (PDF, DOCX, RTF, TXT, MD, CSV, XLSX, JSON) — multiplos permitidos"
            style={{ display: 'none' }}
          />

          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Pergunte algo ao gabinete..."
            className="chat-input"
            rows={1}
            disabled={loading}
            aria-label="Mensagem"
          />

          <button
            className="chat-send"
            onClick={() => enviar()}
            disabled={loading || parsingPdf || (!input.trim() && arquivos.length === 0)}
            type="button"
            aria-label="Enviar"
          >
            {loading ? (
              <RefreshCw size={18} strokeWidth={1.75} aria-hidden className="chat-spin" />
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
          </button>
        </div>

        <div className="chat-composer-hint">
          <span><kbd>Enter</kbd> envia · <kbd>Shift + Enter</kbd> nova linha</span>
          <span className="chat-composer-sep">·</span>
          <span>PDF, TXT ou MD até 10MB</span>
        </div>
      </div>

      {/* ── Styles ──────────────────────────────────────── */}
      <style>{`
        .chat-root {
          position: relative;
          display: flex;
          flex-direction: column;
          min-height: calc(100vh - 72px);
          max-width: 880px;
          margin: 0 auto;
          padding: 36px 32px 0;
        }

        /* ── Italic + serial labels ────────────────────── */
        .chat-italic {
          font-family: var(--font-playfair, 'Playfair Display'), Georgia, serif;
          font-style: italic;
          font-weight: 500;
          color: var(--accent);
          letter-spacing: -0.5px;
        }
        .chat-serial {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 2.4px;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 10px;
        }

        /* ── Head ──────────────────────────────────────── */
        .chat-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          padding-bottom: 24px;
          border-bottom: 1px solid var(--stone-line);
          margin-bottom: 8px;
        }
        .chat-title {
          font-size: clamp(28px, 3.4vw, 42px);
          font-weight: 300;
          letter-spacing: -1.4px;
          line-height: 1.05;
          color: var(--text-primary);
          margin: 0 0 10px;
        }
        .chat-title .chat-italic { font-size: 1em; letter-spacing: -1.1px; }
        .chat-lede {
          font-size: 14px;
          line-height: 1.6;
          color: var(--text-secondary);
          max-width: 520px;
          margin: 0;
        }
        .chat-clear {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: transparent;
          border: 1px solid var(--stone-line);
          color: var(--text-secondary);
          font-family: inherit;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .chat-clear:hover {
          background: var(--stone-soft);
          border-color: var(--accent);
          color: var(--text-primary);
        }

        /* ── Scroll area ───────────────────────────────── */
        .chat-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 32px 0 20px;
          scroll-behavior: smooth;
        }
        .chat-scroll::-webkit-scrollbar { width: 8px; }
        .chat-scroll::-webkit-scrollbar-thumb {
          background: var(--stone-line);
          border-radius: 4px;
        }
        .chat-scroll::-webkit-scrollbar-track { background: transparent; }

        /* ── Empty state ───────────────────────────────── */
        .chat-empty {
          text-align: center;
          padding: 40px 20px 60px;
          max-width: 560px;
          margin: 0 auto;
          animation: chat-rise 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .chat-empty-mark {
          width: 68px;
          height: 68px;
          margin: 0 auto 28px;
          border: 1px solid var(--stone-line);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
          background: var(--stone-soft);
          animation: chat-orb 4s ease-in-out infinite;
        }
        .chat-empty-serial {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 2.4px;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 14px;
        }
        .chat-empty-title {
          font-size: clamp(28px, 3.6vw, 40px);
          font-weight: 300;
          letter-spacing: -1.2px;
          line-height: 1.1;
          color: var(--text-primary);
          margin: 0 0 14px;
        }
        .chat-empty-lede {
          font-size: 14px;
          line-height: 1.65;
          color: var(--text-secondary);
          max-width: 440px;
          margin: 0 auto 40px;
        }

        .chat-suggestions {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0;
          border-top: 1px solid var(--stone-line);
          border-left: 1px solid var(--stone-line);
          max-width: 520px;
          margin: 0 auto;
        }
        .chat-suggestion {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 18px 20px;
          background: transparent;
          border: none;
          border-right: 1px solid var(--stone-line);
          border-bottom: 1px solid var(--stone-line);
          color: var(--text-secondary);
          font-family: inherit;
          font-size: 13px;
          text-align: left;
          cursor: pointer;
          transition: all 0.25s ease;
          position: relative;
        }
        .chat-suggestion:hover {
          background: var(--stone-soft);
          color: var(--text-primary);
        }
        .chat-suggestion > svg {
          color: var(--accent);
          flex-shrink: 0;
        }
        .chat-suggestion span { flex: 1; }
        .chat-sug-arrow {
          opacity: 0;
          transform: translate(-4px, 4px);
          transition: all 0.3s ease;
        }
        .chat-suggestion:hover .chat-sug-arrow {
          opacity: 1;
          transform: translate(0, 0);
        }

        /* ── Messages ──────────────────────────────────── */
        .chat-messages {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        .chat-msg {
          animation: chat-rise 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
          padding: 0 4px;
        }
        .chat-msg--user {
          padding-left: 32px;
          border-left: 2px solid var(--accent);
        }
        .chat-msg--assistant {
          padding-left: 32px;
          border-left: 2px solid var(--stone-line);
        }
        .chat-msg-meta {
          display: flex;
          align-items: baseline;
          gap: 12px;
          margin-bottom: 10px;
        }
        .chat-msg-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--text-primary);
        }
        .chat-msg--assistant .chat-msg-label { color: var(--accent); }
        .chat-msg-time {
          font-size: 10px;
          color: var(--text-muted);
          letter-spacing: 0.5px;
          font-variant-numeric: tabular-nums;
        }
        .chat-msg-body {
          font-size: 15px;
          line-height: 1.7;
          color: var(--text-primary);
        }
        .chat-msg-body p {
          margin: 0 0 10px;
        }
        .chat-msg-body p:last-child { margin-bottom: 0; }
        .chat-msg--user .chat-msg-body { color: var(--text-secondary); font-size: 14px; }

        .chat-msg-file {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          background: var(--stone-soft);
          border: 1px solid var(--stone-line);
          font-size: 12px;
          color: var(--text-secondary);
          margin-bottom: 10px;
        }
        .chat-msg-file > svg { color: var(--accent); }
        .chat-msg-file-meta { color: var(--text-muted); }

        /* ── Agente card ───────────────────────────────── */
        .chat-msg-agente {
          margin-top: 18px;
          padding: 20px 22px;
          border: 1px solid var(--stone-line);
          background: var(--card-bg);
          backdrop-filter: blur(12px);
          position: relative;
        }
        .chat-msg-agente::before {
          content: '';
          position: absolute;
          top: -1px;
          left: 20px;
          right: 20px;
          height: 1px;
          background: var(--accent);
        }
        .chat-msg-agente-head {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
        }
        .chat-msg-agente-head > svg {
          color: var(--accent);
        }
        .chat-msg-agente-titulo {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1.8px;
          text-transform: uppercase;
          color: var(--text-muted);
        }
        .chat-msg-agente-titulo strong {
          color: var(--text-primary);
          letter-spacing: 0.4px;
        }
        .chat-msg-agente-just {
          font-family: var(--font-playfair, 'Playfair Display'), Georgia, serif;
          font-style: italic;
          font-size: 15px;
          line-height: 1.6;
          color: var(--text-primary);
          margin: 0 0 16px;
        }
        .chat-msg-agente-cta {
          display: inline-block;
          padding: 10px 20px;
          background: var(--text-primary);
          color: var(--bg-base);
          border: 1px solid var(--text-primary);
          font-family: inherit;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.4px;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .chat-msg-agente-cta:hover {
          background: var(--accent);
          border-color: var(--accent);
          transform: translateY(-1px);
        }

        /* ── Typing indicator ──────────────────────────── */
        .chat-typing {
          display: flex;
          gap: 6px;
          padding: 8px 0;
        }
        .chat-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent);
          animation: chat-dot-pulse 1.2s ease-in-out infinite;
        }
        .chat-dot:nth-child(2) { animation-delay: 0.15s; }
        .chat-dot:nth-child(3) { animation-delay: 0.30s; }

        /* ── Composer ──────────────────────────────────── */
        .chat-composer {
          position: sticky;
          bottom: 0;
          padding: 20px 0 28px;
          background: linear-gradient(to top, var(--bg-base) 40%, transparent);
          margin-top: auto;
        }
        .chat-error {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          margin-bottom: 12px;
          background: rgba(139,46,31,0.08);
          border: 1px solid rgba(139,46,31,0.30);
          color: var(--danger);
          font-size: 13px;
        }
        .chat-error button {
          margin-left: auto;
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          padding: 2px 6px;
        }

        .chat-attached {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: var(--stone-soft);
          border: 1px solid var(--stone-line);
          margin-bottom: 10px;
        }
        .chat-attached > svg { color: var(--accent); }
        .chat-attached-info { flex: 1; min-width: 0; }
        .chat-attached-name {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .chat-attached-meta {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 2px;
        }
        .chat-attached-remove {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 6px;
          transition: color 0.2s ease;
        }
        .chat-attached-remove:hover { color: var(--danger); }

        .chat-composer-box {
          display: flex;
          align-items: flex-end;
          gap: 4px;
          padding: 10px 10px 10px 14px;
          background: var(--input-bg);
          border: 1px solid var(--stone-line);
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .chat-composer-box:focus-within {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--stone-soft);
        }
        .chat-attach-btn, .chat-send {
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s ease, background 0.2s ease;
        }
        .chat-attach-btn:hover:not(:disabled) {
          color: var(--accent);
          background: var(--stone-soft);
        }
        .chat-send {
          background: var(--text-primary);
          color: var(--bg-base);
          border-radius: 0;
        }
        .chat-send:hover:not(:disabled) {
          background: var(--accent);
        }
        .chat-send:disabled, .chat-attach-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .chat-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-primary);
          font-family: inherit;
          font-size: 14px;
          line-height: 1.6;
          resize: none;
          padding: 10px 6px;
          max-height: 220px;
          min-height: 24px;
        }
        .chat-input::placeholder { color: var(--text-muted); }

        .chat-composer-hint {
          display: flex;
          gap: 10px;
          margin-top: 10px;
          font-size: 11px;
          color: var(--text-muted);
          justify-content: center;
          flex-wrap: wrap;
        }
        .chat-composer-hint kbd {
          font-family: var(--font-dm-sans), sans-serif;
          font-size: 10px;
          padding: 2px 6px;
          border: 1px solid var(--stone-line);
          background: var(--stone-soft);
          color: var(--text-secondary);
        }
        .chat-composer-sep { opacity: 0.5; }

        /* ── Animations ────────────────────────────────── */
        @keyframes chat-rise {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes chat-dot-pulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40%           { opacity: 1;   transform: scale(1); }
        }
        @keyframes chat-orb {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(191, 166, 142, 0.50);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(191, 166, 142, 0);
          }
        }
        .chat-spin { animation: chat-spin 0.9s linear infinite; display: inline-block; }
        @keyframes chat-spin { to { transform: rotate(360deg); } }

        /* ── Settings bar (fidelidade + modo) ────────────── */
        .chat-settings {
          margin-bottom: 10px;
        }
        .chat-settings-toggle {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 12px;
          background: var(--stone-soft, var(--hover));
          border: 1px solid var(--stone-line, var(--border));
          color: var(--text-secondary);
          font-family: inherit;
          font-size: 11px;
          letter-spacing: 0.5px;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s ease;
        }
        .chat-settings-toggle:hover {
          border-color: var(--accent);
          color: var(--text-primary);
        }
        .chat-settings-summary {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: 'DM Mono', ui-monospace, Menlo, Consolas, monospace;
          font-size: 10.5px;
          letter-spacing: 0.06em;
        }
        .chat-settings-summary strong {
          color: var(--accent);
          font-weight: 700;
        }
        .chat-settings-sep { opacity: 0.4; }
        .chat-settings-caret {
          font-size: 9px;
          opacity: 0.6;
          margin-left: 4px;
        }
        .chat-settings-panel {
          margin-top: 10px;
          padding: 14px 16px;
          background: var(--card-bg, rgba(10,10,10,0.6));
          border: 1px solid var(--stone-line, var(--border));
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          animation: chat-rise 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .chat-settings-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .chat-settings-label {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-family: 'DM Mono', ui-monospace, Menlo, Consolas, monospace;
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--text-muted);
        }
        .chat-settings-segments {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
        }
        .chat-settings-seg {
          flex: 1;
          min-width: 90px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 8px 10px;
          background: transparent;
          border: 1px solid var(--stone-line, var(--border));
          color: var(--text-secondary);
          font-family: inherit;
          font-size: 11.5px;
          font-weight: 500;
          letter-spacing: 0.3px;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.18s ease;
          flex-direction: column;
          line-height: 1.3;
        }
        .chat-settings-seg small {
          font-size: 9.5px;
          color: var(--text-muted);
          font-weight: 400;
          letter-spacing: 0.04em;
        }
        .chat-settings-seg:hover {
          border-color: rgba(191,166,142,0.3);
          color: var(--text-primary);
        }
        .chat-settings-seg.is-active {
          border-color: var(--accent);
          background: rgba(191,166,142,0.1);
          color: var(--text-primary);
          box-shadow: inset 0 0 0 1px rgba(191,166,142,0.18);
        }
        .chat-settings-seg.is-active small { color: var(--accent); }
        .chat-settings-hint {
          font-size: 11px;
          color: var(--text-muted);
          font-style: italic;
          line-height: 1.5;
        }

        /* ── Responsive ────────────────────────────────── */
        @media (max-width: 720px) {
          .chat-root { padding: 24px 20px 0; }
          .chat-head { flex-direction: column; gap: 14px; }
          .chat-msg--user, .chat-msg--assistant { padding-left: 20px; }
          .chat-suggestions { grid-template-columns: 1fr; }
          .chat-settings-segments { flex-direction: column; }
          .chat-settings-seg { flex-direction: row; min-width: 0; }
        }
      `}</style>
    </div>
  )
}

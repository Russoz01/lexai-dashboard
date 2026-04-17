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
  type LucideIcon,
} from 'lucide-react'
import { extractPdfWithMeta } from '@/lib/pdf-parser'

/* ─────────────────────────────────────────────────────────────────────────────
 * LexAI — Chat Orquestrador
 *
 * Interface conversacional única. O usuário manda texto ou arquivo (PDF/TXT),
 * o orquestrador decide se responde direto ou sugere o agente especialista.
 *
 * Design: editorial, mesma linguagem do atelier — stone/navy, Playfair italic,
 * hairlines, números em série. Sem balão azul de chatbot. As mensagens são
 * tratadas como entradas de diário.
 * ──────────────────────────────────────────────────────────────────────────── */

type Role = 'user' | 'assistant'

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
  const [arquivo, setArquivo] = useState<{ nome: string; texto: string; paginas: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [parsingPdf, setParsingPdf] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // Permite re-selecionar o mesmo arquivo
    if (!file) return

    setErro('')

    if (file.size > 10 * 1024 * 1024) {
      setErro('Arquivo muito grande. Limite de 10MB.')
      return
    }

    try {
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        setParsingPdf(true)
        const { text, numPages } = await extractPdfWithMeta(file)
        if (text.length < 20) {
          setErro('Não consegui extrair texto do PDF. O arquivo pode ser uma imagem escaneada.')
          setParsingPdf(false)
          return
        }
        setArquivo({ nome: file.name, texto: text, paginas: numPages })
        setParsingPdf(false)
      } else if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        const text = await file.text()
        if (text.length < 10) {
          setErro('Arquivo vazio ou muito pequeno.')
          return
        }
        setArquivo({ nome: file.name, texto: text, paginas: 0 })
      } else {
        setErro('Formato não suportado. Envie PDF, TXT ou MD.')
      }
    } catch (err) {
      console.error('[chat/file]', err)
      setErro('Erro ao ler arquivo. Tente novamente.')
      setParsingPdf(false)
    }
  }

  async function enviar(textoManual?: string) {
    const texto = (textoManual ?? input).trim()
    if (!texto && !arquivo) return
    if (loading) return

    setErro('')
    const userMsg: Message = {
      id: nowId(),
      role: 'user',
      content: texto,
      arquivo: arquivo ? { nome: arquivo.nome, paginas: arquivo.paginas, chars: arquivo.texto.length } : undefined,
      timestamp: Date.now(),
    }

    const historicoPayload = messages.slice(-8).map(m => ({
      role: m.role,
      content: m.content + (m.agente ? ` [→ ${m.agente.titulo}]` : ''),
    }))

    setMessages(prev => [...prev, userMsg])
    setInput('')
    const arquivoSnapshot = arquivo
    setArquivo(null)
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensagem: texto,
          arquivoTexto: arquivoSnapshot?.texto,
          arquivoNome: arquivoSnapshot?.nome,
          historico: historicoPayload,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErro(data?.error || 'Erro ao processar mensagem.')
        setLoading(false)
        return
      }

      const assistantMsg: Message = {
        id: nowId(),
        role: 'assistant',
        content: data.mensagem || '',
        agente: data.tipo === 'rotear' ? data.agente : undefined,
        timestamp: Date.now(),
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch (err) {
      console.error('[chat/send]', err)
      setErro('Erro de rede. Verifique sua conexão e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviar()
    }
  }

  function limparConversa() {
    if (!confirm('Limpar toda a conversa?')) return
    setMessages([])
    setErro('')
  }

  function abrirAgenteComContexto(agente: AgenteSugerido) {
    // Salva pre_prompt no sessionStorage para ser consumido pelo agente destino
    if (agente.pre_prompt) {
      sessionStorage.setItem(`lexai-prefill-${agente.key}`, agente.pre_prompt)
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
                    {m.role === 'user' ? 'Você' : 'LexAI'}
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

            {loading && (
              <article className="chat-msg chat-msg--assistant">
                <div className="chat-msg-meta">
                  <span className="chat-msg-label">LexAI</span>
                  <span className="chat-msg-time">agora</span>
                </div>
                <div className="chat-typing">
                  <span className="chat-dot" />
                  <span className="chat-dot" />
                  <span className="chat-dot" />
                </div>
              </article>
            )}
          </div>
        )}
      </div>

      {/* ── Composer ────────────────────────────────────── */}
      <div className="chat-composer">
        {erro && (
          <div className="chat-error" role="alert">
            <AlertTriangle size={14} strokeWidth={1.75} aria-hidden />
            <span>{erro}</span>
            <button type="button" onClick={() => setErro('')} aria-label="Fechar">
              <X size={14} strokeWidth={1.75} aria-hidden />
            </button>
          </div>
        )}

        {(arquivo || parsingPdf) && (
          <div className="chat-attached">
            {parsingPdf ? (
              <>
                <RefreshCw size={18} strokeWidth={1.75} aria-hidden className="chat-spin" />
                <span>Extraindo texto do PDF...</span>
              </>
            ) : arquivo ? (
              <>
                <FileText size={18} strokeWidth={1.75} aria-hidden />
                <div className="chat-attached-info">
                  <div className="chat-attached-name">{arquivo.nome}</div>
                  <div className="chat-attached-meta">
                    {arquivo.paginas > 0 ? `${arquivo.paginas} páginas · ` : ''}
                    {(arquivo.texto.length / 1000).toFixed(1)}k caracteres extraídos
                  </div>
                </div>
                <button className="chat-attached-remove" onClick={() => setArquivo(null)} aria-label="Remover anexo">
                  <X size={18} strokeWidth={1.75} aria-hidden />
                </button>
              </>
            ) : null}
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
            accept=".pdf,.txt,.md,text/plain,text/markdown,application/pdf"
            onChange={onPickFile}
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
            disabled={loading || parsingPdf || (!input.trim() && !arquivo)}
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

        /* ── Responsive ────────────────────────────────── */
        @media (max-width: 720px) {
          .chat-root { padding: 24px 20px 0; }
          .chat-head { flex-direction: column; gap: 14px; }
          .chat-msg--user, .chat-msg--assistant { padding-left: 20px; }
          .chat-suggestions { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}

'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Search,
  XCircle,
  Filter,
  Archive,
  Clock,
  type LucideIcon,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import { resolveUsuarioId } from '@/lib/usuario'
import { CATALOG } from '@/lib/catalog'
import {
  heroContainer,
  heroItem,
  listContainer,
  listItem,
  EASE_EDITORIAL,
} from '@/lib/motion-variants'

/* ═════════════════════════════════════════════════════════════════
 * /dashboard/historico — rescaled to Noir Atelier (2026-04-23)
 * ─────────────────────────────────────────────────────────────────
 * Antes: cards em pastel com hex hardcoded (bg #f0e7d8 color #44372b).
 * Agora: editorial dark com chips champagne, serial romano por entrada,
 * hairlines stone, stagger Framer Motion. Consome CATALOG pra mapping
 * agente → Icon + label bonito. Zero fallback pra cor pastel.
 * ═════════════════════════════════════════════════════════════════ */

interface HistoricoItem {
  id: string
  agente: string
  mensagem_usuario: string
  resposta_agente: string | null
  tokens_usados: number | null
  created_at: string
}

const BY_SLUG = new Map(CATALOG.map(item => [item.slug, item]))

/** Resolve agente slug → { Icon, label, accent } do catalog. */
function resolveAgenteMeta(slug: string): {
  Icon: LucideIcon
  label: string
  accent: string
} {
  const normalized = (slug || '').toLowerCase().trim()
  const found = BY_SLUG.get(normalized)
  if (found) {
    return { Icon: found.Icon, label: found.label, accent: '#bfa68e' }
  }
  // Fallback elegante — mesma paleta, sem pastel
  return { Icon: MessageSquare, label: slug || 'Agente', accent: '#8a6f55' }
}

function pad2(n: number) {
  return n.toString().padStart(2, '0')
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'agora'
  if (min < 60) return `${min}min`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d`
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  })
}

function formatarData(dt: string) {
  return new Date(dt).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function HistoricoPage() {
  const supabase = createClient()
  const [historico, setHistorico] = useState<HistoricoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [expandido, setExpandido] = useState<string | null>(null)
  const [filtro, setFiltro] = useState('')
  const [filtroAgente, setFiltroAgente] = useState<string>('todos')

  const carregar = useCallback(async (signal?: AbortSignal) => {
    setErro('')
    const usuarioId = await resolveUsuarioId()
    if (signal?.aborted) return
    if (!usuarioId) {
      setErro('Sessão expirada. Faça login novamente.')
      setLoading(false)
      return
    }

    const { data, error: dataErr } = await supabase
      .from('historico')
      .select('*')
      .eq('usuario_id', usuarioId)
      .order('created_at', { ascending: false })
      .limit(100)

    if (signal?.aborted) return
    if (dataErr) {
      setErro('Não foi possível carregar o histórico. Tente novamente.')
      setLoading(false)
      return
    }

    setHistorico(data ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    // AbortController previne setState em componente desmontado se o user
    // navegar antes do select retornar.
    const ac = new AbortController()
    carregar(ac.signal)
    return () => ac.abort()
  }, [carregar])

  const historicoFiltrado = useMemo(() => {
    return historico.filter(item => {
      if (filtroAgente !== 'todos' && item.agente !== filtroAgente) return false
      if (filtro.trim()) {
        const q = filtro.toLowerCase().trim()
        const inMsg = item.mensagem_usuario?.toLowerCase().includes(q)
        const inResp = item.resposta_agente?.toLowerCase().includes(q)
        if (!inMsg && !inResp) return false
      }
      return true
    })
  }, [historico, filtro, filtroAgente])

  const agentesUnicos = useMemo(
    () => Array.from(new Set(historico.map(i => i.agente))).sort(),
    [historico],
  )

  return (
    <div className="page-content" style={{ maxWidth: 980 }}>
      {/* ═══════ Header editorial ═══════ */}
      <motion.header
        variants={heroContainer}
        initial="hidden"
        animate="show"
        style={{ marginBottom: 36 }}
      >
        <motion.div
          variants={heroItem}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 12,
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#bfa68e',
              boxShadow: '0 0 8px rgba(191,166,142,0.65)',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-mono, ui-monospace), monospace',
              fontSize: 10,
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
              color: '#bfa68e',
              fontWeight: 600,
            }}
          >
            N° 006 · Arquivo · MMXXVI
          </span>
          <span
            aria-hidden
            style={{
              width: 48,
              height: 1,
              background:
                'linear-gradient(to right, rgba(191,166,142,0.55), transparent)',
            }}
          />
        </motion.div>

        <motion.h1
          variants={heroItem}
          className="page-title"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(2.2rem, 5vw, 3.2rem)',
            fontWeight: 300,
            letterSpacing: '-0.01em',
            lineHeight: 1.05,
            color: 'var(--text-primary)',
            marginBottom: 10,
          }}
        >
          Arquivo do{' '}
          <em
            style={{
              fontStyle: 'italic',
              backgroundImage:
                'linear-gradient(to right, #e6d4bd, #bfa68e, #8a6f55)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            atelier
          </em>
        </motion.h1>

        <motion.p
          variants={heroItem}
          className="page-subtitle"
          style={{
            fontSize: 15,
            color: 'var(--text-muted)',
            maxWidth: 640,
            lineHeight: 1.55,
          }}
        >
          Toda consulta aos agentes Pralvex vira linha permanente daqui.
          Busca por cliente, processo ou trecho de resposta. Últimas 100
          interações no topo.
        </motion.p>

        <motion.div
          aria-hidden
          variants={heroItem}
          style={{
            marginTop: 24,
            height: 1,
            maxWidth: 280,
            background:
              'linear-gradient(to right, rgba(191,166,142,0.45), transparent)',
            transformOrigin: 'left center',
          }}
        />
      </motion.header>

      {/* ═══════ Filtros editoriais ═══════ */}
      {!loading && historico.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_EDITORIAL, delay: 0.3 }}
          style={{
            display: 'flex',
            gap: 10,
            marginBottom: 28,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              flex: '1 1 260px',
              position: 'relative',
              minWidth: 240,
            }}
          >
            <Search
              size={14}
              strokeWidth={1.75}
              aria-hidden
              style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'rgba(191,166,142,0.55)',
              }}
            />
            <input
              type="text"
              value={filtro}
              onChange={e => setFiltro(e.target.value)}
              placeholder="Buscar no arquivo..."
              style={{
                width: '100%',
                paddingLeft: 40,
                paddingRight: filtro ? 40 : 14,
                paddingTop: 10,
                paddingBottom: 10,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(191,166,142,0.18)',
                borderRadius: 10,
                color: 'var(--text-primary)',
                fontSize: 13.5,
                outline: 'none',
                transition: 'border-color 0.2s, background 0.2s',
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = 'rgba(191,166,142,0.42)'
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = 'rgba(191,166,142,0.18)'
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
              }}
            />
            {filtro && (
              <button
                type="button"
                onClick={() => setFiltro('')}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'rgba(191,166,142,0.6)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: 4,
                }}
                aria-label="Limpar busca"
              >
                <XCircle size={14} strokeWidth={1.75} aria-hidden />
              </button>
            )}
          </div>

          <div style={{ position: 'relative' }}>
            <Filter
              size={12}
              strokeWidth={2}
              aria-hidden
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'rgba(191,166,142,0.55)',
                pointerEvents: 'none',
              }}
            />
            <select
              value={filtroAgente}
              onChange={e => setFiltroAgente(e.target.value)}
              style={{
                flex: '0 0 200px',
                paddingLeft: 32,
                paddingRight: 28,
                paddingTop: 10,
                paddingBottom: 10,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(191,166,142,0.18)',
                borderRadius: 10,
                color: 'var(--text-primary)',
                fontSize: 13,
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none',
                minWidth: 200,
              }}
            >
              <option value="todos">Todos os agentes</option>
              {agentesUnicos.map(a => {
                const meta = resolveAgenteMeta(a)
                return (
                  <option key={a} value={a}>
                    {meta.label}
                  </option>
                )
              })}
            </select>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 12px',
              borderRadius: 8,
              background: 'rgba(191,166,142,0.06)',
              border: '1px solid rgba(191,166,142,0.18)',
              fontFamily: 'var(--font-mono, ui-monospace), monospace',
              fontSize: 10.5,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: '#bfa68e',
              fontWeight: 600,
            }}
          >
            <Archive size={11} strokeWidth={2} aria-hidden />
            {historicoFiltrado.length}/{historico.length}
          </div>
        </motion.div>
      )}

      {/* ═══════ Estados ═══════ */}
      {erro ? (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: 12,
            background:
              'linear-gradient(to right, rgba(191,75,75,0.1), rgba(191,75,75,0.04))',
            border: '1px solid rgba(191,75,75,0.25)',
            color: '#ff9999',
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <AlertTriangle size={15} strokeWidth={2} aria-hidden /> {erro}
        </div>
      ) : loading ? (
        <div
          style={{
            textAlign: 'center',
            padding: '80px 0',
            color: 'var(--text-muted)',
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            style={{
              animation: 'hist-spin 1s linear infinite',
              marginBottom: 12,
            }}
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="#bfa68e"
              strokeWidth="2"
              strokeDasharray="40 20"
              strokeLinecap="round"
            />
          </svg>
          <div
            style={{
              fontFamily: 'var(--font-mono, ui-monospace), monospace',
              fontSize: 10,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: 'rgba(191,166,142,0.65)',
            }}
          >
            Abrindo o arquivo
          </div>
        </div>
      ) : historico.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_EDITORIAL }}
          style={{
            padding: '64px 28px',
            textAlign: 'center',
            borderRadius: 16,
            border: '1px dashed rgba(191,166,142,0.22)',
            background:
              'radial-gradient(ellipse at 50% 30%, rgba(191,166,142,0.05), transparent 70%)',
          }}
        >
          <Archive
            size={38}
            strokeWidth={1.3}
            aria-hidden
            style={{
              color: '#bfa68e',
              opacity: 0.4,
              marginBottom: 16,
            }}
          />
          <div
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontStyle: 'italic',
              fontSize: 22,
              fontWeight: 400,
              color: 'var(--text-primary)',
              marginBottom: 6,
            }}
          >
            O arquivo abre em silêncio
          </div>
          <p
            style={{
              fontSize: 13.5,
              color: 'var(--text-muted)',
              maxWidth: 400,
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Sua primeira consulta aos agentes Pralvex ancora a primeira
            linha aqui — e o histórico passa a rodar cronológico.
          </p>
        </motion.div>
      ) : historicoFiltrado.length === 0 ? (
        <div
          style={{
            padding: '48px 28px',
            textAlign: 'center',
            borderRadius: 16,
            border: '1px dashed rgba(191,166,142,0.22)',
            background: 'rgba(255,255,255,0.015)',
          }}
        >
          <Search
            size={28}
            strokeWidth={1.4}
            aria-hidden
            style={{
              color: '#bfa68e',
              opacity: 0.45,
              marginBottom: 10,
            }}
          />
          <p
            style={{
              fontSize: 13.5,
              color: 'var(--text-muted)',
              lineHeight: 1.6,
            }}
          >
            Nenhuma linha do arquivo bate com esses filtros.
            <br />
            Ajuste a busca ou o agente e tente de novo.
          </p>
        </div>
      ) : (
        <motion.div
          variants={listContainer}
          initial="hidden"
          animate="show"
          style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
        >
          {historicoFiltrado.map((item, idx) => {
            const meta = resolveAgenteMeta(item.agente)
            const isOpen = expandido === item.id
            const ItemIcon = meta.Icon
            return (
              <motion.article
                key={item.id}
                variants={listItem}
                style={{
                  position: 'relative',
                  borderRadius: 14,
                  overflow: 'hidden',
                  border: isOpen
                    ? '1px solid rgba(191,166,142,0.32)'
                    : '1px solid rgba(191,166,142,0.14)',
                  background: isOpen
                    ? 'linear-gradient(to bottom, rgba(26,20,16,0.92), rgba(10,8,7,0.88))'
                    : 'linear-gradient(to bottom, rgba(20,18,16,0.6), rgba(10,8,7,0.6))',
                  backdropFilter: 'blur(8px)',
                  transition:
                    'border-color 0.3s ease, background 0.3s ease, box-shadow 0.3s ease',
                  boxShadow: isOpen
                    ? '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(191,166,142,0.08)'
                    : 'none',
                }}
              >
                <button
                  onClick={() => setExpandido(isOpen ? null : item.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    textAlign: 'left',
                    padding: '16px 20px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'inherit',
                  }}
                  onMouseEnter={e => {
                    if (isOpen) return
                    e.currentTarget.parentElement!.style.borderColor =
                      'rgba(191,166,142,0.28)'
                  }}
                  onMouseLeave={e => {
                    if (isOpen) return
                    e.currentTarget.parentElement!.style.borderColor =
                      'rgba(191,166,142,0.14)'
                  }}
                >
                  {/* Serial number editorial */}
                  <span
                    style={{
                      flexShrink: 0,
                      fontFamily: 'var(--font-mono, ui-monospace), monospace',
                      fontSize: 10,
                      letterSpacing: '0.2em',
                      color: 'rgba(191,166,142,0.55)',
                      fontWeight: 700,
                      minWidth: 26,
                    }}
                  >
                    {pad2(idx + 1)}
                  </span>

                  {/* Icon agente */}
                  <div
                    style={{
                      flexShrink: 0,
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background:
                        'linear-gradient(135deg, rgba(212,174,106,0.16), rgba(122,95,72,0.06))',
                      border: '1px solid rgba(212,174,106,0.28)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: meta.accent,
                    }}
                  >
                    <ItemIcon size={15} strokeWidth={1.6} aria-hidden />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        flexWrap: 'wrap',
                        marginBottom: 4,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'Playfair Display', Georgia, serif",
                          fontStyle: 'italic',
                          fontSize: 15,
                          fontWeight: 500,
                          color: 'var(--text-primary)',
                          letterSpacing: '-0.005em',
                        }}
                      >
                        {meta.label}
                      </span>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontFamily:
                            'var(--font-mono, ui-monospace), monospace',
                          fontSize: 10,
                          letterSpacing: '0.16em',
                          textTransform: 'uppercase',
                          color: 'rgba(191,166,142,0.6)',
                          fontWeight: 600,
                        }}
                      >
                        <Clock size={9} strokeWidth={2} aria-hidden />
                        {relativeTime(item.created_at)}
                      </span>
                      {item.tokens_usados != null &&
                        item.tokens_usados > 0 && (
                          <span
                            style={{
                              fontFamily:
                                'var(--font-mono, ui-monospace), monospace',
                              fontSize: 10,
                              letterSpacing: '0.14em',
                              color: 'rgba(191,166,142,0.38)',
                            }}
                          >
                            {item.tokens_usados}t
                          </span>
                        )}
                    </div>
                    <p
                      style={{
                        fontSize: 13,
                        color: 'rgba(230,212,189,0.72)',
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        lineHeight: 1.5,
                      }}
                    >
                      {item.mensagem_usuario || '—'}
                    </p>
                  </div>

                  {isOpen ? (
                    <ChevronUp
                      size={15}
                      strokeWidth={1.75}
                      aria-hidden
                      style={{
                        color: '#bfa68e',
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <ChevronDown
                      size={15}
                      strokeWidth={1.75}
                      aria-hidden
                      style={{
                        color: 'rgba(191,166,142,0.5)',
                        flexShrink: 0,
                      }}
                    />
                  )}
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && item.resposta_agente && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{
                        duration: 0.35,
                        ease: EASE_EDITORIAL,
                      }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div
                        style={{
                          padding: '0 20px 18px 76px',
                          borderTop: '1px solid rgba(191,166,142,0.12)',
                          paddingTop: 16,
                          background:
                            'linear-gradient(to bottom, rgba(191,166,142,0.04), transparent 60%)',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            marginBottom: 10,
                            paddingTop: 2,
                          }}
                        >
                          <span
                            style={{
                              width: 4,
                              height: 4,
                              borderRadius: '50%',
                              background: '#bfa68e',
                            }}
                          />
                          <span
                            style={{
                              fontFamily:
                                'var(--font-mono, ui-monospace), monospace',
                              fontSize: 10,
                              letterSpacing: '0.24em',
                              textTransform: 'uppercase',
                              color: '#bfa68e',
                              fontWeight: 600,
                            }}
                          >
                            Resposta · {formatarData(item.created_at)}
                          </span>
                        </div>
                        <p
                          style={{
                            fontSize: 13.5,
                            color: 'rgba(230,212,189,0.85)',
                            lineHeight: 1.75,
                            whiteSpace: 'pre-wrap',
                            margin: 0,
                            fontFamily:
                              'var(--font-body, ui-sans-serif), system-ui',
                          }}
                        >
                          {item.resposta_agente}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.article>
            )
          })}
        </motion.div>
      )}

      <style>{`@keyframes hist-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

'use client'

/**
 * Biblioteca de modelos (/dashboard/modelos).
 *
 * Galeria consultavel com 30+ prompts prontos para os 8 agentes, agrupados
 * por 9 areas do direito. Cada cartao abre um modal com o prompt completo;
 * a acao primaria copia o texto e leva o usuario direto ao agente certo.
 *
 * Objetivo de produto: reduzir o "paginar em branco" do novo usuario — no
 * lugar de olhar para um input vazio, ele ve um catalogo de pontos de
 * partida auditaveis por area de atuacao.
 */

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import {
  TEMPLATES,
  AREA_LABELS,
  AGENT_LABELS,
  type Template,
  type TemplateArea,
  type TemplateAgent,
} from '@/lib/templates'
import { toast } from '@/components/Toast'

type AreaFilter = 'all' | TemplateArea
type AgentFilter = 'all' | TemplateAgent

const AREA_ORDER: TemplateArea[] = [
  'civil',
  'trabalhista',
  'tributario',
  'empresarial',
  'familia',
  'consumidor',
  'penal',
  'imobiliario',
  'administrativo',
]

// Quais areas/agentes tem templates cadastrados — evita mostrar filtros vazios.
const AVAILABLE_AREAS = new Set(TEMPLATES.map(t => t.area))
const AVAILABLE_AGENTS = new Set(TEMPLATES.map(t => t.agent))

export default function ModelosPage() {
  const [query, setQuery] = useState('')
  const [area, setArea] = useState<AreaFilter>('all')
  const [agent, setAgent] = useState<AgentFilter>('all')
  const [opened, setOpened] = useState<Template | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return TEMPLATES.filter(t => {
      if (area !== 'all' && t.area !== area) return false
      if (agent !== 'all' && t.agent !== agent) return false
      if (!q) return true
      const haystack = `${t.title} ${t.subtitle} ${t.tags.join(' ')} ${AREA_LABELS[t.area]} ${AGENT_LABELS[t.agent]}`.toLowerCase()
      return haystack.includes(q)
    })
  }, [query, area, agent])

  const totalShown = filtered.length
  const totalAll = TEMPLATES.length

  return (
    <div className="page-content" style={{ maxWidth: 1200 }}>
      {/* Cabecalho */}
      <div style={{ marginBottom: 28 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          fontSize: 11, fontWeight: 600, letterSpacing: '0.24em',
          textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 8,
        }}>
          <i className="bi bi-collection" aria-hidden />
          MMXXVI &middot; Biblioteca de modelos
        </div>
        <h1 className="page-title">Modelos</h1>
        <p className="page-subtitle">
          Pontos de partida para petições, pareceres, cálculos e propostas —
          cada prompt ja vem calibrado para o agente certo.
        </p>
      </div>

      {/* Filtros */}
      <div className="mod-toolbar">
        <div className="mod-search">
          <i className="bi bi-search" aria-hidden />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por tema, tag ou palavra-chave..."
            aria-label="Buscar modelo"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="Limpar busca">
              <i className="bi bi-x-circle-fill" />
            </button>
          )}
        </div>

        <select
          value={area}
          onChange={e => setArea(e.target.value as AreaFilter)}
          className="mod-select"
          aria-label="Filtrar por area"
        >
          <option value="all">Todas as areas</option>
          {AREA_ORDER.filter(a => AVAILABLE_AREAS.has(a)).map(a => (
            <option key={a} value={a}>{AREA_LABELS[a]}</option>
          ))}
        </select>

        <select
          value={agent}
          onChange={e => setAgent(e.target.value as AgentFilter)}
          className="mod-select"
          aria-label="Filtrar por agente"
        >
          <option value="all">Todos os agentes</option>
          {Array.from(AVAILABLE_AGENTS).sort().map(a => (
            <option key={a} value={a}>{AGENT_LABELS[a]}</option>
          ))}
        </select>
      </div>

      <div className="mod-meta">
        {totalShown === totalAll
          ? <>Exibindo <strong>{totalAll}</strong> modelos</>
          : <>Exibindo <strong>{totalShown}</strong> de <strong>{totalAll}</strong> modelos</>
        }
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="mod-empty">
          <i className="bi bi-search" aria-hidden />
          <h3>Nenhum modelo encontrado</h3>
          <p>Tente ampliar o filtro ou limpar a busca.</p>
          <button
            type="button"
            onClick={() => { setQuery(''); setArea('all'); setAgent('all') }}
            className="mod-reset-btn"
          >
            Limpar filtros
          </button>
        </div>
      ) : (
        <div className="mod-grid">
          {filtered.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setOpened(t)}
              className="mod-card"
              aria-label={`Abrir modelo: ${t.title}`}
            >
              <div className="mod-card-top">
                <span className="mod-badge-area">{AREA_LABELS[t.area]}</span>
                <span className="mod-badge-time">
                  <i className="bi bi-clock" aria-hidden />
                  {t.estimatedMinutes}min
                </span>
              </div>
              <h3 className="mod-card-title">{t.title}</h3>
              <p className="mod-card-sub">{t.subtitle}</p>
              <div className="mod-card-footer">
                <span className="mod-card-agent">
                  <i className="bi bi-robot" aria-hidden />
                  {AGENT_LABELS[t.agent]}
                </span>
                <span className="mod-card-cta">
                  Abrir <i className="bi bi-arrow-right" aria-hidden />
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Modal detalhe */}
      {opened && <TemplateModal template={opened} onClose={() => setOpened(null)} />}

      <style jsx>{`
        .mod-toolbar {
          display: grid;
          grid-template-columns: 1fr auto auto;
          gap: 12px;
          margin-bottom: 12px;
        }
        @media (max-width: 720px) {
          .mod-toolbar { grid-template-columns: 1fr; }
        }
        .mod-search {
          position: relative;
          display: flex;
          align-items: center;
        }
        .mod-search > i.bi-search {
          position: absolute;
          left: 14px;
          color: var(--text-muted);
          font-size: 14px;
          pointer-events: none;
        }
        .mod-search input {
          width: 100%;
          padding: 12px 40px;
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 6px;
          color: var(--text-primary);
          font-size: 14px;
          font-family: inherit;
          transition: border-color .16s ease;
        }
        .mod-search input:focus {
          outline: none;
          border-color: var(--accent);
        }
        .mod-search button {
          position: absolute;
          right: 10px;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-muted);
          font-size: 14px;
          padding: 4px;
        }
        .mod-select {
          padding: 12px 14px;
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 6px;
          color: var(--text-primary);
          font-size: 14px;
          font-family: inherit;
          cursor: pointer;
          min-width: 180px;
        }
        .mod-select:focus { outline: none; border-color: var(--accent); }

        .mod-meta {
          color: var(--text-muted);
          font-size: 13px;
          margin-bottom: 20px;
        }
        .mod-meta strong { color: var(--text-primary); font-weight: 600; }

        .mod-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        .mod-card {
          position: relative;
          text-align: left;
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 20px 22px 18px;
          cursor: pointer;
          font-family: inherit;
          transition: transform .18s ease, border-color .18s ease, box-shadow .18s ease;
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-height: 180px;
        }
        .mod-card:hover {
          border-color: var(--accent);
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.06);
        }
        .mod-card:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
        }
        .mod-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .mod-badge-area {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--accent);
          padding: 4px 8px;
          border: 1px solid color-mix(in srgb, var(--accent) 32%, transparent);
          border-radius: 3px;
          background: color-mix(in srgb, var(--accent) 8%, transparent);
        }
        .mod-badge-time {
          font-size: 11px;
          color: var(--text-muted);
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .mod-card-title {
          margin: 0;
          font-family: var(--font-playfair), serif;
          font-weight: 700;
          font-size: 18px;
          line-height: 1.25;
          color: var(--text-primary);
          letter-spacing: -0.01em;
        }
        .mod-card-sub {
          margin: 0;
          font-size: 13px;
          line-height: 1.5;
          color: var(--text-secondary);
        }
        .mod-card-footer {
          margin-top: auto;
          padding-top: 10px;
          border-top: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .mod-card-agent {
          font-size: 12px;
          color: var(--text-muted);
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .mod-card-cta {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.04em;
          color: var(--accent);
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .mod-empty {
          padding: 60px 30px;
          text-align: center;
          background: var(--card-bg);
          border: 1px dashed var(--border);
          border-radius: 8px;
        }
        .mod-empty > i {
          font-size: 32px;
          color: var(--text-muted);
          margin-bottom: 14px;
          display: block;
        }
        .mod-empty h3 {
          margin: 0 0 6px;
          font-size: 18px;
          color: var(--text-primary);
        }
        .mod-empty p {
          margin: 0 0 18px;
          color: var(--text-muted);
          font-size: 14px;
        }
        .mod-reset-btn {
          padding: 10px 20px;
          background: var(--accent);
          color: #fff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-family: inherit;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.04em;
        }
      `}</style>
    </div>
  )
}

/* ─────────────────────────── MODAL DE DETALHE ─────────────────────────── */

function TemplateModal({ template, onClose }: { template: Template; onClose: () => void }) {
  const [copying, setCopying] = useState(false)

  // ESC fecha
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function copyAndOpen() {
    setCopying(true)
    try {
      await navigator.clipboard.writeText(template.prompt)
      toast('success', 'Prompt copiado. Cole no agente aberto.')
    } catch {
      toast('error', 'Nao foi possivel copiar. Copie manualmente da caixa abaixo.')
    }
    setCopying(false)
  }

  async function copyOnly() {
    try {
      await navigator.clipboard.writeText(template.prompt)
      toast('success', 'Prompt copiado para a area de transferencia.')
    } catch {
      toast('error', 'Falha ao copiar.')
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="mod-modal-title"
      className="mod-backdrop"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="mod-modal">
        <button
          type="button"
          onClick={onClose}
          className="mod-close"
          aria-label="Fechar"
        >
          <i className="bi bi-x-lg" aria-hidden />
        </button>

        <div className="mod-serial">
          {AREA_LABELS[template.area]} &middot; {AGENT_LABELS[template.agent]} &middot; {template.estimatedMinutes}min
        </div>
        <h2 id="mod-modal-title" className="mod-modal-title">{template.title}</h2>
        <p className="mod-modal-sub">{template.subtitle}</p>

        <div className="mod-prompt-label">Prompt</div>
        <pre className="mod-prompt-body">{template.prompt}</pre>

        {template.tags.length > 0 && (
          <div className="mod-tags">
            {template.tags.map(t => (
              <span key={t} className="mod-tag">#{t}</span>
            ))}
          </div>
        )}

        <div className="mod-actions">
          <Link
            href={`/dashboard/${template.agent}`}
            onClick={copyAndOpen}
            className="mod-btn-primary"
          >
            {copying ? 'Copiando...' : `Copiar e abrir ${AGENT_LABELS[template.agent]}`}
            <i className="bi bi-arrow-right" aria-hidden />
          </Link>
          <button type="button" onClick={copyOnly} className="mod-btn-ghost">
            <i className="bi bi-clipboard" aria-hidden /> Apenas copiar prompt
          </button>
        </div>
      </div>

      <style jsx>{`
        .mod-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(19, 32, 37, 0.56);
          backdrop-filter: blur(4px);
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          animation: mod-fade .18s ease-out;
        }
        .mod-modal {
          position: relative;
          background: var(--bg-base);
          color: var(--text-primary);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 40px 38px 32px;
          max-width: 640px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 40px 120px rgba(0, 0, 0, 0.22);
          animation: mod-rise .22s ease-out;
        }
        .mod-close {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 36px; height: 36px;
          border: none;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          transition: background .16s ease, color .16s ease;
        }
        .mod-close:hover { background: var(--hover); color: var(--text-primary); }

        .mod-serial {
          font-size: 11px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 12px;
        }
        .mod-modal-title {
          font-family: var(--font-playfair), serif;
          font-weight: 700;
          font-size: clamp(24px, 3vw, 30px);
          line-height: 1.2;
          letter-spacing: -0.01em;
          margin: 0 0 8px;
        }
        .mod-modal-sub {
          font-size: 14px;
          line-height: 1.5;
          color: var(--text-secondary);
          margin: 0 0 22px;
        }
        .mod-prompt-label {
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 8px;
        }
        .mod-prompt-body {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 16px 18px;
          margin: 0 0 18px;
          font-family: 'SF Mono', Menlo, Consolas, monospace;
          font-size: 13px;
          line-height: 1.6;
          white-space: pre-wrap;
          word-break: break-word;
          color: var(--text-primary);
          max-height: 260px;
          overflow-y: auto;
        }
        .mod-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 24px;
        }
        .mod-tag {
          font-size: 11px;
          padding: 3px 8px;
          border-radius: 3px;
          background: var(--hover);
          color: var(--text-muted);
          letter-spacing: 0.02em;
        }
        .mod-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .mod-btn-primary {
          flex: 1 1 auto;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 13px 22px;
          background: var(--primary);
          color: var(--bg-base);
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.04em;
          border-radius: 4px;
          transition: transform .16s ease;
        }
        .mod-btn-primary:hover { transform: translateY(-1px); }
        .mod-btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 13px 18px;
          background: transparent;
          color: var(--text-secondary);
          border: 1px solid var(--border);
          border-radius: 4px;
          cursor: pointer;
          font-family: inherit;
          font-size: 13px;
          transition: border-color .16s ease, color .16s ease;
        }
        .mod-btn-ghost:hover {
          border-color: var(--accent);
          color: var(--text-primary);
        }

        @keyframes mod-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes mod-rise {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .mod-backdrop, .mod-modal { animation: none; }
        }
      `}</style>
    </div>
  )
}

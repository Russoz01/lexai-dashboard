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
import s from './page.module.css'
import {
  TEMPLATES,
  AREA_LABELS,
  AGENT_LABELS,
  type Template,
  type TemplateArea,
  type TemplateAgent,
} from '@/lib/templates'
import { toast } from '@/components/Toast'
import { Library, Search, XCircle, Clock, Bot, ArrowRight, X, Clipboard } from 'lucide-react'

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
    <div className={`page-content ${s.pageWrap}`}>
      {/* Cabecalho */}
      <div className={s.headerWrap}>
        <div className={s.headerSerial}>
          <Library size={14} strokeWidth={1.75} aria-hidden />
          MMXXVI &middot; Biblioteca de modelos
        </div>
        <h1 className="page-title">Modelos</h1>
        <p className="page-subtitle">
          Pontos de partida para petições, pareceres, cálculos e propostas —
          cada prompt já vem calibrado para o agente certo.
        </p>
      </div>

      {/* Filtros */}
      <div className={s.modToolbar}>
        <div className={s.modSearch}>
          <Search size={14} strokeWidth={1.75} aria-hidden className={s.modSearchIcon} />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por tema, tag ou palavra-chave..."
            aria-label="Buscar modelo"
            className={s.modSearchInput}
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="Limpar busca" className={s.modSearchClear}>
              <XCircle size={14} strokeWidth={1.75} aria-hidden />
            </button>
          )}
        </div>

        <select
          value={area}
          onChange={e => setArea(e.target.value as AreaFilter)}
          className={s.modSelect}
          aria-label="Filtrar por área"
        >
          <option value="all">Todas as áreas</option>
          {AREA_ORDER.filter(a => AVAILABLE_AREAS.has(a)).map(a => (
            <option key={a} value={a}>{AREA_LABELS[a]}</option>
          ))}
        </select>

        <select
          value={agent}
          onChange={e => setAgent(e.target.value as AgentFilter)}
          className={s.modSelect}
          aria-label="Filtrar por agente"
        >
          <option value="all">Todos os agentes</option>
          {Array.from(AVAILABLE_AGENTS).sort().map(a => (
            <option key={a} value={a}>{AGENT_LABELS[a]}</option>
          ))}
        </select>
      </div>

      <div className={s.modMeta}>
        {totalShown === totalAll
          ? <>Exibindo <strong>{totalAll}</strong> modelos</>
          : <>Exibindo <strong>{totalShown}</strong> de <strong>{totalAll}</strong> modelos</>
        }
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className={s.modEmpty}>
          <Search size={14} strokeWidth={1.75} aria-hidden className={s.modEmptyIcon} />
          <h3 className={s.modEmptyH3}>O acervo não devolveu modelo</h3>
          <p className={s.modEmptyP}>Ajuste o filtro ou limpe a busca — ainda há mais peças no arquivo.</p>
          <button
            type="button"
            onClick={() => { setQuery(''); setArea('all'); setAgent('all') }}
            className={s.modResetBtn}
          >
            Limpar filtros
          </button>
        </div>
      ) : (
        <div className={s.modGrid}>
          {filtered.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setOpened(t)}
              className={s.modCard}
              aria-label={`Abrir modelo: ${t.title}`}
            >
              <div className={s.modCardTop}>
                <span className={s.modBadgeArea}>{AREA_LABELS[t.area]}</span>
                <span className={s.modBadgeTime}>
                  <Clock size={14} strokeWidth={1.75} aria-hidden />
                  {t.estimatedMinutes}min
                </span>
              </div>
              <h3 className={s.modCardTitle}>{t.title}</h3>
              <p className={s.modCardSub}>{t.subtitle}</p>
              <div className={s.modCardFooter}>
                <span className={s.modCardAgent}>
                  <Bot size={14} strokeWidth={1.75} aria-hidden />
                  {AGENT_LABELS[t.agent]}
                </span>
                <span className={s.modCardCta}>
                  Abrir <ArrowRight size={14} strokeWidth={1.75} aria-hidden />
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Modal detalhe */}
      {opened && <TemplateModal template={opened} onClose={() => setOpened(null)} />}
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
      toast('error', 'Não foi possível copiar. Copie manualmente da caixa abaixo.')
    }
    setCopying(false)
  }

  async function copyOnly() {
    try {
      await navigator.clipboard.writeText(template.prompt)
      toast('success', 'Prompt copiado para a área de transferência.')
    } catch {
      toast('error', 'Falha ao copiar.')
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="mod-modal-title"
      className={s.modBackdrop}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className={s.modModal}>
        <button
          type="button"
          onClick={onClose}
          className={s.modClose}
          aria-label="Fechar"
        >
          <X size={14} strokeWidth={1.75} aria-hidden />
        </button>

        <div className={s.modSerial}>
          {AREA_LABELS[template.area]} &middot; {AGENT_LABELS[template.agent]} &middot; {template.estimatedMinutes}min
        </div>
        <h2 id="mod-modal-title" className={s.modModalTitle}>{template.title}</h2>
        <p className={s.modModalSub}>{template.subtitle}</p>

        <div className={s.modPromptLabel}>Prompt</div>
        <pre className={s.modPromptBody}>{template.prompt}</pre>

        {template.tags.length > 0 && (
          <div className={s.modTags}>
            {template.tags.map(t => (
              <span key={t} className={s.modTag}>#{t}</span>
            ))}
          </div>
        )}

        <div className={s.modActions}>
          <Link
            href={`/dashboard/${template.agent}`}
            onClick={copyAndOpen}
            className={s.modBtnPrimary}
          >
            {copying ? 'Copiando...' : `Copiar e abrir ${AGENT_LABELS[template.agent]}`}
            <ArrowRight size={14} strokeWidth={1.75} aria-hidden />
          </Link>
          <button type="button" onClick={copyOnly} className={s.modBtnGhost}>
            <Clipboard size={14} strokeWidth={1.75} aria-hidden /> Apenas copiar prompt
          </button>
        </div>
      </div>
    </div>
  )
}

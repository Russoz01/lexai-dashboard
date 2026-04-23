'use client'

import { useState } from 'react'
import { Search, AlertTriangle, BookOpen, Calendar, ExternalLink, ChevronDown, ChevronUp, User, Clipboard, Check, CheckCircle2, NotebookText, Layers, Hourglass, FileX } from 'lucide-react'
import ConfidenceBadge, { PoweredByPralvex, VerifiedBadge } from '@/components/ConfidenceBadge'
import { SkeletonResult } from '@/components/Skeleton'
import s from './page.module.css'

const TRIBUNAIS = ['Todos','STF','STJ','TST','TSE','TRF 1ª','TRF 2ª','TRF 3ª','TRF 4ª','TRF 5ª','TJSP','TJRJ','TJMG']
const AREAS     = ['Todas','Civil','Penal','Trabalhista','Tributário','Constitucional','Administrativo','Ambiental','Consumidor']
const PERIODOS  = ['Qualquer período','Último mês','Último trimestre','Último ano','Últimos 5 anos']

interface Resultado {
  titulo: string
  tribunal: string
  numero: string
  data: string
  area: string
  relator: string
  ementa: string
  fundamentacao: string[]
  relevancia: string
  tese_fixada: string | null
}

interface JurisprudenciaReal {
  id: string
  tribunal: string
  numero: string
  data: string
  ementa: string
  url: string
}

interface PesquisaResponse {
  resultados: Resultado[]
  termos_relacionados: string[]
  legislacao_aplicavel: string[]
  confianca?: { nivel?: string; nota?: string }
  jurisprudencia_real?: JurisprudenciaReal[]
  fonte?: string
}

export default function PesquisadorPage() {
  const [query, setQuery]       = useState('')
  const [tribunal, setTribunal] = useState('Todos')
  const [area, setArea]         = useState('Todas')
  const [periodo, setPeriodo]   = useState('Qualquer período')
  const [buscando, setBuscando] = useState(false)
  const [pesquisa, setPesquisa] = useState<PesquisaResponse | null>(null)
  const [buscou, setBuscou]     = useState(false)
  const [expandido, setExpandido] = useState<string | null>(null)
  const [erro, setErro]         = useState('')
  const [copied, setCopied]     = useState<string | null>(null)

  async function buscar(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setBuscando(true); setBuscou(false); setPesquisa(null); setErro('')

    try {
      const res = await fetch('/api/pesquisar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, tribunal, area, periodo }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro na pesquisa')
      setPesquisa(data.pesquisa)
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao pesquisar')
    } finally {
      setBuscou(true)
      setBuscando(false)
    }
  }

  function copiar(texto: string, id: string) {
    navigator.clipboard.writeText(texto)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const resultados = pesquisa?.resultados ?? []

  return (
    <div className={`page-content ${s.pageWrap}`}>
      {/* Header */}
      <div className={s.headerWrap}>
        <div className={s.headerRow}>
          <span className={s.agentBadge}>
            <span className={s.agentDot} />
            Agente IA
          </span>
        </div>
        <h1 className="page-title">Pesquisador Jurídico</h1>
        <p className="page-subtitle">Pesquise jurisprudência com inteligência artificial</p>
      </div>

      {/* Barra de busca */}
      <form onSubmit={buscar}>
        <div className={s.searchRow}>
          <div className={s.searchField}>
            <Search size={16} strokeWidth={1.75} aria-hidden className={s.searchIcon} />
            <input
              type="text" value={query} onChange={e => setQuery(e.target.value)}
              maxLength={2000}
              placeholder="Ex: responsabilidade civil do fornecedor, dano moral, prescrição..."
              className="form-input"
              style={{ paddingLeft: 40, paddingRight: 16 }}
            />
          </div>
          <button type="submit" disabled={!query.trim() || buscando} className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
            {buscando ? <><Hourglass size={14} strokeWidth={1.75} aria-hidden /> Pesquisando...</> : <><Search size={14} strokeWidth={1.75} aria-hidden /> Pesquisar</>}
          </button>
        </div>

        {/* Filtros */}
        <div className={s.filtersWrap}>
          <div className={s.filtersLabel}>
            Filtros avançados
          </div>
          <div className={s.filtersRow}>
            <select value={tribunal} onChange={e => setTribunal(e.target.value)} className="form-input" style={{ flex: '1 1 180px', maxWidth: 220 }}>
              {TRIBUNAIS.map(t => <option key={t}>{t}</option>)}
            </select>
            <select value={area} onChange={e => setArea(e.target.value)} className="form-input" style={{ flex: '1 1 180px', maxWidth: 220 }}>
              {AREAS.map(a => <option key={a}>{a}</option>)}
            </select>
            <select value={periodo} onChange={e => setPeriodo(e.target.value)} className="form-input" style={{ flex: '1 1 200px', maxWidth: 240 }}>
              {PERIODOS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>
      </form>

      {/* Erro */}
      {erro && (
        <div className={s.errorBox}>
          <AlertTriangle size={14} strokeWidth={1.75} aria-hidden />
          {erro}
        </div>
      )}

      {/* Resultados */}
      {buscando ? (
        <div className={s.loadingWrap}>
          <div className={s.loadingCenter}>
            <div className={s.loadingTitle}>Pesquisando com IA...</div>
            <div className={s.loadingSub}>Analisando jurisprudência relevante</div>
          </div>
          <SkeletonResult />
        </div>
      ) : buscou && resultados.length === 0 ? (
        <div className={s.emptyResults}>
          <FileX size={32} strokeWidth={1.75} aria-hidden className={s.emptyIcon} />
          <div className={s.emptyTitle}>Nenhum resultado encontrado</div>
          <div className={s.emptySub}>Tente termos diferentes ou remova filtros</div>
        </div>
      ) : resultados.length > 0 || (pesquisa?.jurisprudencia_real?.length ?? 0) > 0 ? (
        <div className={s.resultsContainer}>
          <div className={s.resultsHeader}>
            <div className={s.resultsCounterPill}>
              <Layers size={14} strokeWidth={1.75} aria-hidden />
              Mostrando <strong>{resultados.length}</strong> de <strong>{resultados.length + (pesquisa?.jurisprudencia_real?.length ?? 0)}</strong> resultados
            </div>
            {pesquisa && <ConfidenceBadge confianca={pesquisa?.confianca} />}
          </div>

          {/* JusBrasil verified block — only shows when the API was configured and returned hits */}
          {pesquisa?.jurisprudencia_real && pesquisa.jurisprudencia_real.length > 0 && (
            <div className={`section-card ${s.jusBrasilCard}`}>
              <div className={s.jusBrasilHeader}>
                <span className={s.jusBrasilBadge}>
                  <CheckCircle2 size={14} strokeWidth={1.75} aria-hidden /> Verificado JusBrasil
                </span>
                <span className={s.jusBrasilCount}>
                  {pesquisa.jurisprudencia_real.length} decisão(ões) reais recuperadas da base JusBrasil
                </span>
              </div>
              <div className={s.jusBrasilList}>
                {pesquisa.jurisprudencia_real.map((j) => (
                  <div key={j.id || `${j.tribunal}-${j.numero}`} className={s.jusBrasilItem}>
                    <div className={s.jusBrasilItemHeader}>
                      <span className={s.jusBrasilTribunal}>{j.tribunal || 'Tribunal'}</span>
                      <span className={s.jusBrasilNumero}>{j.numero}</span>
                      {j.data && (
                        <span className={s.badgeDate}>
                          <Calendar size={14} strokeWidth={1.75} aria-hidden /> {j.data}
                        </span>
                      )}
                    </div>
                    {j.ementa && (
                      <div className={s.jusBrasilEmenta}>
                        {j.ementa}
                      </div>
                    )}
                    {j.url && (
                      <a href={j.url} target="_blank" rel="noopener noreferrer" className={s.jusBrasilLink}>
                        <ExternalLink size={14} strokeWidth={1.75} aria-hidden /> Abrir no JusBrasil
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {resultados.map((r, idx) => (
            <div
              key={idx}
              className={`section-card result-card ${s.resultCardInner}`}
              style={{
                borderLeft: r.relevancia === 'alta' ? '3px solid var(--success)' : undefined,
              }}
            >
              <div className={s.resultHeader}>
                <div style={{ flex: 1 }}>
                  <div className={s.resultTitle}>{r.titulo}</div>
                  <div className={s.resultBadges}>
                    <span className={s.badgeTribunal}>{r.tribunal}</span>
                    <span className={s.badgeArea}>{r.area}</span>
                    <span className={r.relevancia === 'alta' ? s.relevanciaAlta : r.relevancia === 'media' ? s.relevanciaMedia : s.relevanciaBaixa}>
                      {r.relevancia}
                    </span>
                    <span className={s.badgeDate}>
                      <Calendar size={14} strokeWidth={1.75} aria-hidden /> {r.data}
                    </span>
                    <span className={s.badgeNumero}>{r.numero}</span>
                    <VerifiedBadge />
                  </div>
                  {r.relator && (
                    <div className={s.resultRelator}>
                      <User size={14} strokeWidth={1.75} aria-hidden style={{ marginRight: 4 }} />Rel. {r.relator}
                    </div>
                  )}
                </div>
                <button type="button" onClick={() => setExpandido(expandido === String(idx) ? null : String(idx))}
                  className="btn-ghost" style={{ fontSize: 12, padding: '5px 10px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {expandido === String(idx) ? <ChevronUp size={14} strokeWidth={1.75} aria-hidden /> : <ChevronDown size={14} strokeWidth={1.75} aria-hidden />} {expandido === String(idx) ? 'Recolher' : 'Ver ementa'}
                </button>
              </div>

              {expandido === String(idx) && (
                <>
                  <div className={s.ementaBox}>
                    <strong className={s.ementaLabel}>Ementa</strong>
                    {r.ementa}
                  </div>

                  {r.tese_fixada && (
                    <div className={s.teseBox}>
                      <strong className={s.ementaLabel}>Tese Fixada</strong>
                      {r.tese_fixada}
                    </div>
                  )}

                  {r.fundamentacao && r.fundamentacao.length > 0 && (
                    <div className={s.fundamentacaoRow}>
                      {r.fundamentacao.map((f, i) => (
                        <span key={i} className={s.fundamentacaoTag}>
                          {f}
                        </span>
                      ))}
                    </div>
                  )}
                </>
              )}

              <div className={s.resultActions}>
                <button className="btn-ghost" style={{ fontSize: 12, padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 5 }}
                  onClick={() => copiar(r.ementa, String(idx))}>
                  {copied === String(idx) ? <Check size={14} strokeWidth={1.75} aria-hidden /> : <Clipboard size={14} strokeWidth={1.75} aria-hidden />}
                  {copied === String(idx) ? 'Copiado' : 'Copiar ementa'}
                </button>
              </div>
            </div>
          ))}

          {/* Termos relacionados e legislação */}
          {pesquisa && (pesquisa.termos_relacionados?.length > 0 || pesquisa.legislacao_aplicavel?.length > 0) && (
            <div className={`section-card ${s.relatedCard}`}>
              {pesquisa.termos_relacionados?.length > 0 && (
                <div style={{ marginBottom: pesquisa.legislacao_aplicavel?.length > 0 ? 14 : 0 }}>
                  <div className={s.relatedSectionLabel}>
                    Termos Relacionados
                  </div>
                  <div className={s.relatedTagsRow}>
                    {pesquisa.termos_relacionados.map((t, i) => (
                      <button key={i} onClick={() => { setQuery(t); }} className="btn-ghost" style={{ fontSize: 12, padding: '4px 10px' }}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {pesquisa.legislacao_aplicavel?.length > 0 && (
                <div>
                  <div className={s.relatedSectionLabel}>
                    Legislação Aplicável
                  </div>
                  <div className={s.relatedTagsRow}>
                    {pesquisa.legislacao_aplicavel.map((l, i) => (
                      <span key={i} className={s.legislacaoTag}>
                        {l}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <div className={s.poweredRow}>
            <PoweredByPralvex />
          </div>
        </div>
      ) : (
        <div className={s.pesquisadorEmpty}>
          <div className={s.pesquisadorEmptyIcon}>
            <NotebookText size={32} strokeWidth={1.75} aria-hidden />
          </div>
          <div className={s.pesquisadorEmptyTitle}>Pesquise jurisprudência com IA</div>
          <div className={s.pesquisadorEmptySub}>Digite termos na busca e aplique filtros para encontrar decisões</div>
        </div>
      )}
    </div>
  )
}

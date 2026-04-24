'use client'

import { useState } from 'react'
import { BookOpen, ExternalLink, ShieldCheck, AlertTriangle, Globe, ScrollText, Scale, ChevronDown, ChevronUp } from 'lucide-react'

export interface Fonte {
  tipo: 'lei' | 'sumula' | 'jurisprudencia' | 'doutrina' | 'web'
  identificacao: string
  texto_citado?: string
  url?: string
  verificacao: 'verified_corpus' | 'verified_web' | 'unverified_ai' | 'failed_validation'
  nota?: string
}

interface FontesCitadasProps {
  fontes: Fonte[] | null | undefined
  stats?: {
    total?: number
    verified_corpus?: number
    verified_web?: number
    unverified_ai?: number
    provisions?: number
    sumulas?: number
    topScore?: number
  } | null
  title?: string
}

function iconForTipo(tipo: Fonte['tipo']) {
  switch (tipo) {
    case 'lei': return <ScrollText size={14} strokeWidth={2} />
    case 'sumula': return <Scale size={14} strokeWidth={2} />
    case 'jurisprudencia': return <Scale size={14} strokeWidth={2} />
    case 'doutrina': return <BookOpen size={14} strokeWidth={2} />
    case 'web': return <Globe size={14} strokeWidth={2} />
  }
}

function verificationMeta(v: Fonte['verificacao']) {
  switch (v) {
    case 'verified_corpus':
      return {
        label: 'Corpus verificado',
        color: '#0f7a4a',
        bg: 'rgba(15, 122, 74, 0.08)',
        icon: <ShieldCheck size={12} strokeWidth={2.2} />,
      }
    case 'verified_web':
      return {
        label: 'Web search',
        color: '#1c5fa8',
        bg: 'rgba(28, 95, 168, 0.08)',
        icon: <Globe size={12} strokeWidth={2.2} />,
      }
    case 'unverified_ai':
      return {
        label: 'Nao verificado',
        color: '#a85a00',
        bg: 'rgba(168, 90, 0, 0.1)',
        icon: <AlertTriangle size={12} strokeWidth={2.2} />,
      }
    case 'failed_validation':
      return {
        label: 'Falhou validacao',
        color: '#a83434',
        bg: 'rgba(168, 52, 52, 0.1)',
        icon: <AlertTriangle size={12} strokeWidth={2.2} />,
      }
  }
}

export default function FontesCitadas({ fontes, stats, title = 'Fontes citadas' }: FontesCitadasProps) {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})

  if (!fontes || fontes.length === 0) {
    return null
  }

  const verified = fontes.filter(f => f.verificacao === 'verified_corpus' || f.verificacao === 'verified_web').length
  const unverified = fontes.filter(f => f.verificacao === 'unverified_ai' || f.verificacao === 'failed_validation').length

  return (
    <div
      style={{
        marginTop: 24,
        padding: '20px 24px',
        borderRadius: 16,
        border: '1px solid var(--border)',
        background: 'linear-gradient(180deg, rgba(191, 166, 142, 0.04), rgba(191, 166, 142, 0.01))',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <ShieldCheck size={16} strokeWidth={2} style={{ color: '#8a6f55' }} />
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, letterSpacing: 0.2, color: 'var(--text)' }}>
              {title}
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            {verified} de {fontes.length} fontes {verified === fontes.length ? 'verificadas' : `verificadas${unverified > 0 ? ` · ${unverified} sem verificacao` : ''}`}
          </p>
        </div>
        {stats && typeof stats.topScore === 'number' && stats.topScore > 0 && (
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: 0.4, textTransform: 'uppercase' }}>
            match score {stats.topScore}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {fontes.map((fonte, idx) => {
          const meta = verificationMeta(fonte.verificacao)
          const isExpanded = expanded[idx] ?? false
          const hasDetail = Boolean(fonte.texto_citado || fonte.nota)

          return (
            <div
              key={`${fonte.identificacao}-${idx}`}
              style={{
                padding: '12px 14px',
                borderRadius: 10,
                border: '1px solid var(--border)',
                background: 'var(--bg-card)',
                transition: 'all 180ms ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 28, height: 28, borderRadius: 8,
                    background: meta.bg, color: meta.color, flexShrink: 0,
                  }}>
                    {iconForTipo(fonte.tipo)}
                  </span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {fonte.identificacao}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: meta.color, fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>
                      {meta.icon}
                      {meta.label}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {fonte.url && (
                    <a
                      href={fonte.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '6px 10px', borderRadius: 6,
                        fontSize: 11, fontWeight: 600, color: 'var(--accent)',
                        textDecoration: 'none', border: '1px solid var(--border)',
                        background: 'transparent',
                      }}
                    >
                      abrir <ExternalLink size={10} strokeWidth={2.2} />
                    </a>
                  )}
                  {hasDetail && (
                    <button
                      onClick={() => setExpanded({ ...expanded, [idx]: !isExpanded })}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '6px 10px', borderRadius: 6,
                        fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
                        border: '1px solid var(--border)', background: 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      {isExpanded ? 'fechar' : 'ver texto'}
                      {isExpanded ? <ChevronUp size={10} strokeWidth={2.2} /> : <ChevronDown size={10} strokeWidth={2.2} />}
                    </button>
                  )}
                </div>
              </div>

              {isExpanded && hasDetail && (
                <div style={{
                  marginTop: 10, padding: 12, borderRadius: 8,
                  background: 'var(--hover)', fontSize: 12, lineHeight: 1.6, color: 'var(--text)',
                }}>
                  {fonte.texto_citado && (
                    <p style={{ margin: 0, fontStyle: 'italic' }}>
                      &ldquo;{fonte.texto_citado}&rdquo;
                    </p>
                  )}
                  {fonte.nota && (
                    <p style={{ margin: fonte.texto_citado ? '8px 0 0 0' : 0, fontSize: 11, color: 'var(--text-muted)' }}>
                      {fonte.nota}
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {unverified > 0 && (
        <p style={{ margin: '14px 0 0 0', fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.5 }}>
          Citacoes marcadas &ldquo;nao verificadas&rdquo; foram geradas pelo modelo e nao constam no corpus local da Pralvex. Confira em planalto.gov.br, site do tribunal ou Jus Brasil antes de usar em peca processual.
        </p>
      )}
    </div>
  )
}

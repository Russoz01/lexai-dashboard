'use client'

import { useState } from 'react'
import {
  FileCheck2,
  RotateCcw,
  Check,
  Clipboard,
  CheckCircle2,
  XCircle,
  Info,
  Sparkles,
} from 'lucide-react'
import ConfidenceBadge, { PoweredByLexAI } from '@/components/ConfidenceBadge'
import { toast } from '@/components/Toast'

interface Parecer {
  titulo?: string
  ementa?: string
  questao_analisada?: string
  fundamentacao_legal?: string[]
  jurisprudencia?: string[]
  argumentos_favoraveis?: string[]
  argumentos_contrarios?: string[]
  conclusao?: string
  recomendacoes?: string[]
  ressalvas?: string
  confianca?: { nivel?: string; nota?: string }
}

const AREAS = [
  'Civil', 'Penal', 'Constitucional', 'Trabalhista', 'Tributario',
  'Administrativo', 'Empresarial', 'Ambiental', 'Digital', 'Internacional',
]

export default function PareceristaPage() {
  const [consulta, setConsulta] = useState('')
  const [area, setArea] = useState('')
  const [loading, setLoading] = useState(false)
  const [parecer, setParecer] = useState<Parecer | null>(null)
  const [copiado, setCopiado] = useState(false)

  async function gerar() {
    if (!consulta.trim() || loading) return
    setLoading(true)
    setParecer(null)
    try {
      const res = await fetch('/api/parecerista', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consulta, area: area || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar parecer')
      setParecer(data.parecer)
    } catch (e: unknown) {
      toast('error', e instanceof Error ? e.message : 'Erro ao gerar parecer')
    } finally {
      setLoading(false)
    }
  }

  function copiar() {
    if (!parecer) return
    const partes = [
      `PARECER JURIDICO`,
      parecer.titulo ?? '',
      '',
      `EMENTA: ${parecer.ementa ?? ''}`,
      '',
      `I. QUESTAO ANALISADA`,
      parecer.questao_analisada ?? '',
      '',
      `II. FUNDAMENTACAO LEGAL`,
      ...(parecer.fundamentacao_legal ?? []).map((f, i) => `${i + 1}. ${f}`),
      '',
      `III. JURISPRUDENCIA`,
      ...(parecer.jurisprudencia ?? []).map((j, i) => `${i + 1}. ${j}`),
      '',
      `IV. CONCLUSAO`,
      parecer.conclusao ?? '',
    ]
    navigator.clipboard.writeText(partes.join('\n')).then(() => {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    })
  }

  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }}>
      {/* Hero */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          <div style={{
            background: 'rgba(191,166,142,0.1)',
            border: '1px solid rgba(191,166,142,0.3)',
            borderRadius: 12, padding: 12,
          }}>
            <FileCheck2 size={24} style={{ color: 'var(--accent)' }} aria-hidden />
          </div>
          <div>
            <h1 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 32, color: 'var(--text-primary)', margin: 0, fontWeight: 700,
            }}>
              Parecerista
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '4px 0 0' }}>
              Pareceres juridicos fundamentados com legislacao, jurisprudencia e recomendacoes
            </p>
          </div>
        </div>
      </div>

      {/* Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }} className="parec-grid">
        {/* Input */}
        <div style={{
          background: 'var(--card-bg)', border: '1px solid var(--border)',
          borderRadius: 14, padding: 24,
        }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', margin: '0 0 20px' }}>
            Consulta
          </h2>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Descricao da consulta
            </label>
            <textarea
              value={consulta}
              onChange={e => setConsulta(e.target.value)}
              maxLength={50000}
              placeholder="Descreva a questao juridica para o parecer..."
              rows={10}
              style={{
                width: '100%', padding: 12, borderRadius: 8,
                border: '1px solid var(--border)', background: 'var(--bg-base)',
                color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.6,
                fontFamily: 'inherit', resize: 'vertical', minHeight: 200,
              }}
            />
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right', marginTop: 4 }}>
              {consulta.length.toLocaleString('pt-BR')} / 50.000
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Area do Direito
            </label>
            <select
              value={area}
              onChange={e => setArea(e.target.value)}
              style={{
                width: '100%', padding: 12, borderRadius: 8,
                border: '1px solid var(--border)', background: 'var(--bg-base)',
                color: 'var(--text-primary)', fontSize: 14, cursor: 'pointer',
              }}
            >
              <option value="">Detectar automaticamente</option>
              {AREAS.map(a => <option key={a} value={a}>Direito {a}</option>)}
            </select>
          </div>
          <button
            onClick={gerar}
            disabled={!consulta.trim() || loading}
            style={{
              width: '100%', padding: '12px 20px', borderRadius: 8,
              background: 'var(--accent)', color: 'var(--bg-base)',
              border: 'none', fontSize: 14, fontWeight: 600,
              cursor: (!consulta.trim() || loading) ? 'not-allowed' : 'pointer',
              opacity: (!consulta.trim() || loading) ? 0.5 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <Sparkles size={16} aria-hidden /> {loading ? 'Elaborando parecer...' : 'Gerar parecer'}
          </button>
        </div>

        {/* Output */}
        <div style={{
          background: 'var(--card-bg)', border: '1px solid var(--border)',
          borderRadius: 14, padding: 24, minHeight: 500,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', margin: 0 }}>
              Parecer
            </h2>
            {parecer && (
              <button onClick={copiar} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 6,
                background: 'transparent', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer',
              }}>
                {copiado ? <Check size={13} /> : <Clipboard size={13} />}
                {copiado ? 'Copiado' : 'Copiar'}
              </button>
            )}
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
              <span style={{
                display: 'inline-block', width: 32, height: 32,
                border: '3px solid var(--border)', borderTopColor: 'var(--accent)',
                borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: 16,
              }} />
              <div style={{ fontSize: 13 }}>Analisando legislacao e doutrina...</div>
            </div>
          )}

          {!loading && !parecer && (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
              <FileCheck2 size={40} style={{ margin: '0 auto 16px', opacity: 0.3 }} aria-hidden />
              <div style={{ fontSize: 13 }}>Descreva a consulta para gerar o parecer</div>
            </div>
          )}

          {parecer && !loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {parecer.titulo && (
                <h3 style={{
                  fontFamily: "'Playfair Display', serif", fontSize: 20,
                  color: 'var(--text-primary)', margin: 0, lineHeight: 1.3,
                }}>
                  {parecer.titulo}
                </h3>
              )}
              {parecer.ementa && (
                <div style={{
                  padding: 14, borderRadius: 8, background: 'var(--hover)',
                  borderLeft: '3px solid var(--accent)',
                  fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, fontStyle: 'italic',
                }}>
                  {parecer.ementa}
                </div>
              )}
              {parecer.questao_analisada && (
                <Section title="Questao analisada">
                  <p style={paraStyle}>{parecer.questao_analisada}</p>
                </Section>
              )}
              {parecer.fundamentacao_legal && parecer.fundamentacao_legal.length > 0 && (
                <Section title="Fundamentacao legal">
                  <ul style={listStyle}>
                    {parecer.fundamentacao_legal.map((f, i) => (
                      <li key={i} style={liStyle}>{f}</li>
                    ))}
                  </ul>
                </Section>
              )}
              {parecer.jurisprudencia && parecer.jurisprudencia.length > 0 && (
                <Section title="Jurisprudencia">
                  <ul style={listStyle}>
                    {parecer.jurisprudencia.map((j, i) => (
                      <li key={i} style={liStyle}>{j}</li>
                    ))}
                  </ul>
                </Section>
              )}
              {((parecer.argumentos_favoraveis?.length ?? 0) > 0 || (parecer.argumentos_contrarios?.length ?? 0) > 0) && (
                <Section title="Argumentos">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#2d8659', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <CheckCircle2 size={13} /> Favoraveis
                      </div>
                      {parecer.argumentos_favoraveis?.map((a, i) => (
                        <div key={i} style={{ ...argStyle, borderLeftColor: '#2d8659' }}>{a}</div>
                      ))}
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#c0392b', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <XCircle size={13} /> Contrarios
                      </div>
                      {parecer.argumentos_contrarios?.map((a, i) => (
                        <div key={i} style={{ ...argStyle, borderLeftColor: '#c0392b' }}>{a}</div>
                      ))}
                    </div>
                  </div>
                </Section>
              )}
              {parecer.conclusao && (
                <Section title="Conclusao">
                  <div style={{
                    padding: 16, borderRadius: 8,
                    background: 'var(--accent-light)', border: '1px solid var(--accent)',
                    fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.7, fontWeight: 500,
                  }}>
                    {parecer.conclusao}
                  </div>
                </Section>
              )}
              {parecer.recomendacoes && parecer.recomendacoes.length > 0 && (
                <Section title="Recomendacoes">
                  <ul style={listStyle}>
                    {parecer.recomendacoes.map((r, i) => (
                      <li key={i} style={liStyle}>{r}</li>
                    ))}
                  </ul>
                </Section>
              )}
              {parecer.ressalvas && (
                <div style={{
                  padding: 14, borderRadius: 8, background: 'rgba(230, 126, 34, 0.06)',
                  border: '1px solid rgba(230, 126, 34, 0.2)',
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#e67e22', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Info size={13} /> Ressalvas
                  </div>
                  <p style={{ ...paraStyle, fontSize: 13 }}>{parecer.ressalvas}</p>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, gap: 12, flexWrap: 'wrap' }}>
                {parecer.confianca && <ConfidenceBadge confianca={parecer.confianca} />}
                <PoweredByLexAI />
              </div>
              <button
                onClick={() => { setParecer(null); setConsulta(''); setArea('') }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: 10, borderRadius: 8, background: 'transparent',
                  border: '1px dashed var(--border)', color: 'var(--text-muted)',
                  fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                <RotateCcw size={14} aria-hidden /> Novo parecer
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .parec-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

const paraStyle: React.CSSProperties = {
  fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.7, margin: 0,
}
const listStyle: React.CSSProperties = {
  listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8,
}
const liStyle: React.CSSProperties = {
  padding: 10, borderRadius: 6, background: 'var(--hover)',
  fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6,
}
const argStyle: React.CSSProperties = {
  padding: 10, borderRadius: 6, background: 'var(--hover)',
  borderLeft: '3px solid', fontSize: 13, color: 'var(--text-secondary)',
  lineHeight: 1.6, marginBottom: 6,
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{
        fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.08em', color: 'var(--accent)', marginBottom: 10,
      }}>
        {title}
      </div>
      {children}
    </div>
  )
}

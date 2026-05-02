'use client'

import { useState } from 'react'
import {
  AlertTriangle,
  Gauge,
  ShieldCheck,
  Clock,
  TrendingUp,
  Search,
  RotateCcw,
} from 'lucide-react'
import { toast } from '@/components/Toast'
import { AgentHero } from '@/components/AgentHero'
import { AgentProgress, AGENT_STEPS } from '@/components/AgentProgress'
import { AGENT_EXAMPLES } from '@/lib/agent-examples'
import { Wand2 } from 'lucide-react'
import FontesCitadas, { type Fonte } from '@/components/FontesCitadas'

interface PontoRisco {
  peso?: number
  titulo?: string
  trecho?: string
  problema?: string
  fundamento?: string
  padrao_mercado?: string
  sugestao?: string
}

interface RiscoResult {
  score_global?: number
  nivel?: 'BAIXO' | 'MEDIO' | 'ALTO' | 'CRITICO'
  tipo_documento?: string
  sucesso_contencioso_pct?: number
  sucesso_contencioso_justificativa?: string
  top_3_pontos?: PontoRisco[]
  comparacao_mercado?: string
  recomendacao?: string
  confianca?: { nivel?: string; nota?: string }
  disclaimer?: string
}

const TIPOS = ['Contrato', 'Aditivo', 'Acordo', 'NDA', 'Termo de uso', 'Outro']

function nivelColor(nivel?: string): { bg: string; fg: string; label: string } {
  // Paleta noir-friendly — antes saturada (verde/amber/laranja/vermelho)
  // que ficava berrante no noir. Agora gradiente champagne→copper→rose stone
  // que escala visualmente com a severidade.
  switch (nivel) {
    case 'BAIXO':   return { bg: 'rgba(158,194,139,0.14)', fg: 'var(--success)', label: 'BAIXO' }
    case 'MEDIO':   return { bg: 'rgba(212,174,106,0.16)', fg: 'var(--warning)', label: 'MÉDIO' }
    case 'ALTO':    return { bg: 'rgba(199,138,97,0.18)',  fg: '#c78a61', label: 'ALTO' }
    case 'CRITICO': return { bg: 'rgba(216,137,119,0.20)', fg: 'var(--danger)', label: 'CRÍTICO' }
    default:        return { bg: 'var(--stone-soft)', fg: 'var(--accent)', label: '—' }
  }
}

export default function RiscoPage() {
  const [documento, setDocumento] = useState('')
  const [tipo, setTipo] = useState('')
  const [loading, setLoading] = useState(false)
  const [risco, setRisco] = useState<RiscoResult | null>(null)
  const [fontes, setFontes] = useState<Fonte[]>([])
  const [groundingStats, setGroundingStats] = useState<{ topScore?: number; provisions?: number; sumulas?: number } | null>(null)

  async function analisar() {
    if (documento.trim().length < 100 || loading) return
    setLoading(true)
    setRisco(null)
    setFontes([])
    setGroundingStats(null)
    try {
      const res = await fetch('/api/risco', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documento, tipo: tipo || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro na análise')
      setRisco(data.risco)
      if (Array.isArray(data.fontes)) setFontes(data.fontes)
      if (data.grounding_stats) setGroundingStats(data.grounding_stats)
    } catch (e: unknown) {
      toast('error', e instanceof Error ? e.message : 'Erro na análise')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setDocumento('')
    setTipo('')
    setRisco(null)
    setFontes([])
    setGroundingStats(null)
  }

  const cores = nivelColor(risco?.nivel)

  return (
    <div className="agent-page">
      <AgentHero
        edition="Nº XXVI"
        Icon={AlertTriangle}
        name="Risco"
        discipline="Score executivo de contratos"
        description="Análise 0–100 de risco jurídico em contratos. Top 3 pontos com peso explícito, probabilidade de sucesso em contencioso e comparação com padrão de mercado. Pronto pra reunião com cliente em 30 segundos."
        accent="bronze"
        meta={[
          { Icon: Clock, label: 'Tempo médio', value: '~30s' },
          { Icon: Gauge, label: 'Formato', value: 'Score + top 3 + recomendação' },
          { Icon: ShieldCheck, label: 'Compliance', value: 'Disclaimer obrigatório' },
        ]}
        steps={[
          { n: 'I', title: 'Cole o documento', desc: 'Contrato, aditivo, acordo ou termo a partir de 100 caracteres.' },
          { n: 'II', title: 'Análise ponderada', desc: 'IA atribui peso explícito a cada ponto e calcula score global.' },
          { n: 'III', title: 'Recomendação', desc: 'Score, top 3 riscos, prob. de sucesso e comparação com mercado.' },
        ]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginTop: 24 }}>
        {/* INPUT */}
        <div style={{
          background: 'var(--card-bg)', border: '1px solid var(--border)',
          borderRadius: 14, padding: 24,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 14, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Search size={12} strokeWidth={2} /> Documento
          </div>

          <label className="form-label" style={{ marginBottom: 6 }}>Tipo (opcional)</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="form-input"
            style={{ marginBottom: 14 }}
          >
            <option value="">Sem tipo específico</option>
            {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <label className="form-label" style={{ margin: 0 }}>Texto do documento</label>
            <button
              type="button"
              onClick={() => setDocumento(AGENT_EXAMPLES.risco[0].payload.documento)}
              disabled={!!documento.trim()}
              title={documento.trim() ? 'Limpe o campo para carregar exemplo' : 'Carregar contrato SaaS de exemplo'}
              aria-label={documento.trim() ? 'Limpe o campo para carregar exemplo' : 'Carregar contrato SaaS de exemplo'}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '4px 10px', borderRadius: 6,
                background: 'var(--card-bg)', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', fontSize: 11, fontWeight: 600,
                cursor: documento.trim() ? 'not-allowed' : 'pointer',
                opacity: documento.trim() ? 0.5 : 1,
              }}
            >
              <Wand2 size={12} strokeWidth={1.75} aria-hidden /> Exemplo
            </button>
          </div>
          <textarea
            value={documento}
            onChange={(e) => setDocumento(e.target.value)}
            placeholder="Cole o texto completo do contrato, aditivo ou acordo aqui (mínimo 100 caracteres)…"
            className="form-input"
            style={{ minHeight: 280, resize: 'vertical', fontFamily: 'ui-monospace, Menlo, Consolas, monospace', fontSize: 13, lineHeight: 1.55 }}
          />
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
            {documento.length.toLocaleString('pt-BR')} / 50.000 caracteres
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
            <button
              onClick={analisar}
              disabled={loading || documento.trim().length < 100}
              className="btn-primary"
              style={{ flex: 1 }}
            >
              {loading ? 'Analisando…' : 'Analisar risco'}
            </button>
            {risco && !loading && (
              <button onClick={analisar} className="btn-ghost" type="button" title="Gerar nova análise do mesmo documento" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <RotateCcw size={13} strokeWidth={1.75} /> Regenerar
              </button>
            )}
            {(documento || risco) && (
              <button onClick={reset} className="btn-ghost" type="button">
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* RESULT */}
        <div style={{
          background: 'var(--card-bg)', border: '1px solid var(--border)',
          borderRadius: 14, padding: 24, minHeight: 380,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 14, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Gauge size={12} strokeWidth={2} /> Análise executiva
          </div>

          {!risco && !loading && (
            <div style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.7, fontStyle: 'italic' }}>
              Cole o documento e clique em <strong>Analisar risco</strong>. Você recebe score 0-100, top 3 pontos com peso, probabilidade de sucesso em contencioso e comparação com padrão de mercado.
            </div>
          )}

          {loading && (
            <AgentProgress loading steps={[...AGENT_STEPS.risco]} />
          )}

          {risco && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Score gauge */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, padding: '14px 18px', borderRadius: 12, background: cores.bg, border: `1px solid ${cores.fg}40` }}>
                <div style={{ fontSize: 44, fontWeight: 600, color: cores.fg, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                  {risco.score_global ?? '—'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: cores.fg }}>
                    Risco {cores.label}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    {risco.tipo_documento || 'Documento'} · score 0-100
                  </div>
                </div>
                {typeof risco.sucesso_contencioso_pct === 'number' && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <TrendingUp size={11} strokeWidth={2.2} /> Contencioso
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 500, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                      {risco.sucesso_contencioso_pct}%
                    </div>
                  </div>
                )}
              </div>

              {/* Sucesso justificativa */}
              {risco.sucesso_contencioso_justificativa && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, fontStyle: 'italic' }}>
                  {risco.sucesso_contencioso_justificativa}
                </div>
              )}

              {/* Top 3 pontos */}
              {Array.isArray(risco.top_3_pontos) && risco.top_3_pontos.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Top 3 pontos de atenção
                  </div>
                  {risco.top_3_pontos.slice(0, 3).map((p, i) => (
                    <div key={i} style={{
                      padding: '12px 14px', borderRadius: 10,
                      border: '1px solid var(--border)', background: 'var(--bg-card)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                          {i + 1}. {p.titulo || 'Ponto sem título'}
                        </div>
                        {typeof p.peso === 'number' && (
                          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: cores.fg, padding: '2px 8px', borderRadius: 6, background: cores.bg }}>
                            PESO {p.peso}
                          </span>
                        )}
                      </div>
                      {p.problema && (
                        <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 6 }}>
                          {p.problema}
                        </div>
                      )}
                      {p.fundamento && (
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                          <strong>Fundamento:</strong> {p.fundamento}
                        </div>
                      )}
                      {p.padrao_mercado && (
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                          <strong>Padrão de mercado:</strong> {p.padrao_mercado}
                        </div>
                      )}
                      {p.sugestao && (
                        <div style={{ fontSize: 11, color: 'var(--accent)', marginTop: 6, paddingTop: 6, borderTop: '1px dashed var(--border)' }}>
                          <strong>Sugestão:</strong> {p.sugestao}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Recomendação */}
              {risco.recomendacao && (
                <div style={{ padding: '12px 14px', borderRadius: 10, border: `1px solid ${cores.fg}40`, background: cores.bg }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: cores.fg, marginBottom: 6 }}>
                    Recomendação
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>
                    {risco.recomendacao}
                  </div>
                </div>
              )}

              {/* Comparação mercado */}
              {risco.comparacao_mercado && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  <strong>Vs. padrão de mercado: </strong>{risco.comparacao_mercado}
                </div>
              )}

              {/* Disclaimer obrigatório */}
              {risco.disclaimer && (
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic', padding: '10px 12px', borderRadius: 8, background: 'var(--hover)', border: '1px dashed var(--border)' }}>
                  ⚠ {risco.disclaimer}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Fontes citadas */}
      {fontes.length > 0 && (
        <FontesCitadas
          fontes={fontes}
          stats={groundingStats}
          title="Fundamentos legais"
        />
      )}
    </div>
  )
}

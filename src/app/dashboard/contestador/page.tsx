'use client'

import { useState } from 'react'
import {
  Scale,
  RotateCcw,
  Check,
  Clipboard,
  Sparkles,
} from 'lucide-react'
import ConfidenceBadge, { PoweredByLexAI } from '@/components/ConfidenceBadge'
import { toast } from '@/components/Toast'

interface Preliminar {
  nome?: string; fundamento?: string; argumentacao?: string; pedido?: string
}
interface Impugnacao {
  alegacao_autor?: string; nossa_versao?: string; fundamento?: string
}
interface Tese {
  tese?: string; fundamento_legal?: string; jurisprudencia?: string; argumentacao?: string
}
interface Replica {
  ataque_autor?: string; nossa_replica?: string
}
interface Contestacao {
  titulo?: string
  enderecamento?: string
  qualificacao?: string
  preliminares?: Preliminar[]
  merito?: {
    sintese_fatica?: string
    impugnacoes_especificas?: Impugnacao[]
    teses_defensivas?: Tese[]
  }
  replicas_previstas?: Replica[]
  pedidos?: string[]
  fechamento?: string
  confianca?: { nivel?: string; nota?: string }
}

export default function ContestadorPage() {
  const [teseInicial, setTeseInicial] = useState('')
  const [teseDefesa, setTeseDefesa] = useState('')
  const [loading, setLoading] = useState(false)
  const [contestacao, setContestacao] = useState<Contestacao | null>(null)
  const [copiado, setCopiado] = useState(false)

  async function gerar() {
    if (teseInicial.trim().length < 30 || teseDefesa.trim().length < 30 || loading) return
    setLoading(true)
    setContestacao(null)
    try {
      const res = await fetch('/api/contestador', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teseInicial, teseDefesa }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar contestacao')
      setContestacao(data.contestacao)
    } catch (e: unknown) {
      toast('error', e instanceof Error ? e.message : 'Erro ao gerar contestacao')
    } finally {
      setLoading(false)
    }
  }

  function copiar() {
    if (!contestacao) return
    const t = contestacao
    const blocks = [
      t.titulo, '', t.enderecamento, '', t.qualificacao, '',
      'PRELIMINARES',
      ...(t.preliminares ?? []).map(p => `- ${p.nome}\n${p.argumentacao}`),
      '', 'MERITO',
      t.merito?.sintese_fatica,
      '', 'PEDIDOS',
      ...(t.pedidos ?? []).map(p => `- ${p}`),
      '', t.fechamento,
    ].filter(Boolean).join('\n')
    navigator.clipboard.writeText(blocks).then(() => {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    })
  }

  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          <div style={{
            background: 'rgba(191,166,142,0.1)',
            border: '1px solid rgba(191,166,142,0.3)',
            borderRadius: 12, padding: 12,
          }}>
            <Scale size={24} style={{ color: 'var(--accent)' }} aria-hidden />
          </div>
          <div>
            <h1 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 32, color: 'var(--text-primary)', margin: 0, fontWeight: 700,
            }}>
              Contestador
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '4px 0 0' }}>
              Esboco tecnico de contestacao com preliminares, merito e replicas
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }} className="cont-grid">
        <div style={{
          background: 'var(--card-bg)', border: '1px solid var(--border)',
          borderRadius: 14, padding: 24,
        }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', margin: '0 0 20px' }}>
            Teses do caso
          </h2>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Tese da inicial (autor)
            </label>
            <textarea
              value={teseInicial}
              onChange={e => setTeseInicial(e.target.value)}
              maxLength={25000}
              placeholder="Resumo da tese e pedidos da inicial..."
              rows={6}
              style={{
                width: '100%', padding: 12, borderRadius: 8,
                border: '1px solid var(--border)', background: 'var(--bg-base)',
                color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.6,
                fontFamily: 'inherit', resize: 'vertical', minHeight: 120,
              }}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Tese de defesa (reu)
            </label>
            <textarea
              value={teseDefesa}
              onChange={e => setTeseDefesa(e.target.value)}
              maxLength={25000}
              placeholder="Posicao de defesa, contra-fatos e argumentos..."
              rows={6}
              style={{
                width: '100%', padding: 12, borderRadius: 8,
                border: '1px solid var(--border)', background: 'var(--bg-base)',
                color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.6,
                fontFamily: 'inherit', resize: 'vertical', minHeight: 120,
              }}
            />
          </div>
          <button
            onClick={gerar}
            disabled={teseInicial.trim().length < 30 || teseDefesa.trim().length < 30 || loading}
            style={{
              width: '100%', padding: '12px 20px', borderRadius: 8,
              background: 'var(--accent)', color: 'var(--bg-base)',
              border: 'none', fontSize: 14, fontWeight: 600,
              cursor: (teseInicial.trim().length < 30 || teseDefesa.trim().length < 30 || loading) ? 'not-allowed' : 'pointer',
              opacity: (teseInicial.trim().length < 30 || teseDefesa.trim().length < 30 || loading) ? 0.5 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <Sparkles size={16} aria-hidden /> {loading ? 'Redigindo contestacao...' : 'Gerar contestacao'}
          </button>
        </div>

        <div style={{
          background: 'var(--card-bg)', border: '1px solid var(--border)',
          borderRadius: 14, padding: 24, minHeight: 500,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', margin: 0 }}>
              Contestacao
            </h2>
            {contestacao && (
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
              <div style={{ fontSize: 13 }}>Elaborando preliminares e merito...</div>
            </div>
          )}

          {!loading && !contestacao && (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
              <Scale size={40} style={{ margin: '0 auto 16px', opacity: 0.3 }} aria-hidden />
              <div style={{ fontSize: 13 }}>Preencha as duas teses (minimo 30 caracteres)</div>
            </div>
          )}

          {contestacao && !loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {contestacao.titulo && (
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: 'var(--text-primary)', margin: 0 }}>
                  {contestacao.titulo}
                </h3>
              )}
              {contestacao.enderecamento && (
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                  {contestacao.enderecamento}
                </div>
              )}
              {contestacao.qualificacao && (
                <div style={{ padding: 12, borderRadius: 8, background: 'var(--hover)', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {contestacao.qualificacao}
                </div>
              )}

              {(contestacao.preliminares?.length ?? 0) > 0 && (
                <Section title="Preliminares">
                  {contestacao.preliminares?.map((p, i) => (
                    <div key={i} style={cardStyle}>
                      {p.nome && <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{p.nome}</div>}
                      {p.fundamento && <div style={{ fontSize: 12, color: 'var(--accent)', marginBottom: 6 }}>{p.fundamento}</div>}
                      {p.argumentacao && <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 6 }}>{p.argumentacao}</div>}
                      {p.pedido && <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>Pedido: {p.pedido}</div>}
                    </div>
                  ))}
                </Section>
              )}

              {contestacao.merito?.sintese_fatica && (
                <Section title="Sintese fatica (defesa)">
                  <div style={cardStyle}>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>
                      {contestacao.merito.sintese_fatica}
                    </p>
                  </div>
                </Section>
              )}

              {(contestacao.merito?.impugnacoes_especificas?.length ?? 0) > 0 && (
                <Section title="Impugnacoes especificas (Art. 341 CPC)">
                  {contestacao.merito?.impugnacoes_especificas?.map((imp, i) => (
                    <div key={i} style={cardStyle}>
                      {imp.alegacao_autor && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}><strong>Autor alega:</strong> {imp.alegacao_autor}</div>}
                      {imp.nossa_versao && <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: 4 }}><strong>Nossa versao:</strong> {imp.nossa_versao}</div>}
                      {imp.fundamento && <div style={{ fontSize: 12, color: 'var(--accent)' }}>{imp.fundamento}</div>}
                    </div>
                  ))}
                </Section>
              )}

              {(contestacao.merito?.teses_defensivas?.length ?? 0) > 0 && (
                <Section title="Teses defensivas">
                  {contestacao.merito?.teses_defensivas?.map((t, i) => (
                    <div key={i} style={cardStyle}>
                      {t.tese && <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{t.tese}</div>}
                      {t.fundamento_legal && <div style={{ fontSize: 12, color: 'var(--accent)', marginBottom: 4 }}>{t.fundamento_legal}</div>}
                      {t.jurisprudencia && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontStyle: 'italic' }}>{t.jurisprudencia}</div>}
                      {t.argumentacao && <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{t.argumentacao}</div>}
                    </div>
                  ))}
                </Section>
              )}

              {(contestacao.replicas_previstas?.length ?? 0) > 0 && (
                <Section title="Replicas previstas">
                  {contestacao.replicas_previstas?.map((r, i) => (
                    <div key={i} style={cardStyle}>
                      {r.ataque_autor && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Ataque: {r.ataque_autor}</div>}
                      {r.nossa_replica && <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>Replica: {r.nossa_replica}</div>}
                    </div>
                  ))}
                </Section>
              )}

              {(contestacao.pedidos?.length ?? 0) > 0 && (
                <Section title="Pedidos">
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {contestacao.pedidos?.map((p, i) => (
                      <li key={i} style={{ padding: 10, borderRadius: 6, background: 'var(--hover)', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        {i + 1}. {p}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {contestacao.fechamento && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', whiteSpace: 'pre-wrap', padding: 10, borderRadius: 6, background: 'var(--hover)' }}>
                  {contestacao.fechamento}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, gap: 12, flexWrap: 'wrap' }}>
                {contestacao.confianca && <ConfidenceBadge confianca={contestacao.confianca} />}
                <PoweredByLexAI />
              </div>
              <button
                onClick={() => { setContestacao(null); setTeseInicial(''); setTeseDefesa('') }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: 10, borderRadius: 8, background: 'transparent',
                  border: '1px dashed var(--border)', color: 'var(--text-muted)',
                  fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                <RotateCcw size={14} /> Nova contestacao
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .cont-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

const cardStyle: React.CSSProperties = {
  padding: 12, borderRadius: 8, background: 'var(--hover)',
  borderLeft: '3px solid var(--accent)', marginBottom: 8,
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

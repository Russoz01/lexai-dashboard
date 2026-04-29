'use client'

import { useState } from 'react'
import {
  Scale,
  RotateCcw,
  Check,
  Clipboard,
  Sparkles,
  Shield,
  Clock,
  ShieldCheck,
  Gauge,
} from 'lucide-react'
import ConfidenceBadge, { PoweredByPralvex } from '@/components/ConfidenceBadge'
import { toast } from '@/components/Toast'
import { AgentHero } from '@/components/AgentHero'
import FontesCitadas, { type Fonte } from '@/components/FontesCitadas'

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
  const [fontes, setFontes] = useState<Fonte[]>([])
  const [groundingStats, setGroundingStats] = useState<{ topScore?: number; provisions?: number; sumulas?: number } | null>(null)

  async function gerar() {
    if (teseInicial.trim().length < 30 || teseDefesa.trim().length < 30 || loading) return
    setLoading(true)
    setContestacao(null)
    setFontes([])
    setGroundingStats(null)
    try {
      const res = await fetch('/api/contestador', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teseInicial, teseDefesa }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar contestacao')
      setContestacao(data.contestacao)
      if (Array.isArray(data.fontes)) setFontes(data.fontes)
      if (data.grounding_stats) setGroundingStats(data.grounding_stats)
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
    <div className="agent-page">
      <AgentHero
        edition="Nº XVIII"
        Icon={Shield}
        name="Contestador"
        discipline="Defesa técnica completa"
        description="Esboço de contestação com endereçamento, qualificação, preliminares, impugnações específicas, teses defensivas, réplicas previstas e pedidos. Antecipa o ataque do autor e calibra a defesa com fundamento e jurisprudência."
        accent="pearl"
        meta={[
          { Icon: Clock, label: 'Tempo médio', value: '~60s' },
          { Icon: Gauge, label: 'Profundidade', value: 'Preliminares + mérito' },
          { Icon: ShieldCheck, label: 'Compliance', value: 'CPC + Provimento 205' },
        ]}
        steps={[
          { n: 'I', title: 'Cole a tese inicial', desc: 'Petição inicial ou síntese dos pedidos e causa de pedir do autor.' },
          { n: 'II', title: 'Apresente a defesa', desc: 'Tese do seu cliente, provas disponíveis e circunstâncias favoráveis.' },
          { n: 'III', title: 'Receba a contestação', desc: 'Preliminares, impugnações, teses, réplicas previstas e pedidos formatados.' },
        ]}
        examples={[
          { label: 'Ação de dano moral online', prompt: 'Autor alega dano moral por mensagens ofensivas publicadas em grupo privado de WhatsApp com 40 membros. Pede R$ 80k. Junta prints parciais. Tese de defesa: cliente nunca publicou tais mensagens, prints são montagens. Perícia em grupo dependeria de quebra de sigilo. Autor já tem histórico de 3 ações similares contra outros réus.' },
          { label: 'Reclamação trabalhista', prompt: 'Ex-funcionária alega rescisão indireta por assédio moral da supervisora. Pede R$ 150k entre indenização e verbas rescisórias. Reclamada tem defesa: cliente trabalhou 11 meses, tinha histórico de baixa performance documentado em PDI, saiu por conta própria após receber feedback formal. Empresa tem política anti-assédio ativa desde 2020, com canal de denúncia não utilizado pela autora.' },
          { label: 'Ação de cobrança B2B', prompt: 'Autora cobra R$ 230k por prestação de serviço de consultoria não paga. Cliente entende que serviço foi entregue com atraso de 6 meses e qualidade aquém do contratado. Há e-mails documentando insatisfação, contratação de terceiro para refazer trabalho, custo extra R$ 90k. Quer compensação em reconvenção pelo prejuízo.' },
        ]}
        onExampleClick={setTeseDefesa}
        shortcut="⌘⏎ gerar"
      />

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
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={gerar} disabled={loading} title="Gerar nova versão com as mesmas teses" style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 6,
                  background: 'transparent', border: '1px solid var(--border)',
                  color: 'var(--text-secondary)', fontSize: 12, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1,
                }}>
                  <RotateCcw size={13} /> Regenerar
                </button>
                <button onClick={copiar} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 6,
                  background: 'transparent', border: '1px solid var(--border)',
                  color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer',
                }}>
                  {copiado ? <Check size={13} /> : <Clipboard size={13} />}
                  {copiado ? 'Copiado' : 'Copiar'}
                </button>
              </div>
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

              {fontes.length > 0 && (
                <FontesCitadas
                  fontes={fontes}
                  stats={groundingStats}
                  title="Fundamentos da defesa"
                />
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, gap: 12, flexWrap: 'wrap' }}>
                {contestacao.confianca && <ConfidenceBadge confianca={contestacao.confianca} />}
                <PoweredByPralvex />
              </div>
              <button
                onClick={() => { setContestacao(null); setTeseInicial(''); setTeseDefesa(''); setFontes([]); setGroundingStats(null) }}
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

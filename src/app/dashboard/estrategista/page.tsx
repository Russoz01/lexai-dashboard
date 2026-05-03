'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Target,
  RotateCcw,
  Check,
  Clipboard,
  Sparkles,
  AlertTriangle,
  Clock,
  Brain,
  ShieldCheck,
  Gauge,
} from 'lucide-react'
import ConfidenceBadge, { PoweredByPralvex } from '@/components/ConfidenceBadge'
import { toast } from '@/components/Toast'
import { AgentHero } from '@/components/AgentHero'
import { AgentProgress, AGENT_STEPS } from '@/components/AgentProgress'

interface Acao {
  acao?: string; prazo?: string; fundamento?: string; entregavel?: string; responsavel?: string
}
interface Fase {
  janela?: string; prioridades?: string[]; acoes?: Acao[]; kpis?: string[]; riscos?: string[]
}
interface Matriz {
  risco?: string; probabilidade?: string; impacto?: string; mitigacao?: string
}
interface Cenario {
  cenario?: string; descricao?: string; probabilidade?: string; timing?: string; custo_estimado?: string
}
interface Plano {
  titulo?: string
  sintese_situacional?: string
  objetivo_cliente?: string
  objetivo_estrategico?: string
  fase_imediato?: Fase
  fase_medio?: Fase
  fase_longo?: Fase
  matriz_risco?: Matriz[]
  cenarios?: Cenario[]
  recomendacao_final?: string
  confianca?: { nivel?: string; nota?: string }
}

export default function EstrategistaPage() {
  const [caso, setCaso] = useState('')
  const [objetivo, setObjetivo] = useState('')
  const [loading, setLoading] = useState(false)
  const [plano, setPlano] = useState<Plano | null>(null)
  const [copiado, setCopiado] = useState(false)

  // Demo P0-1 fix (2026-05-03): AbortController + timeout 90s.
  const abortRef = useRef<AbortController | null>(null)
  useEffect(() => () => { abortRef.current?.abort() }, [])

  async function gerar() {
    if (caso.trim().length < 50 || objetivo.trim().length < 10 || loading) return
    setLoading(true)
    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac
    const tid = setTimeout(() => ac.abort(), 90_000)
    setPlano(null)
    try {
      const res = await fetch('/api/estrategista', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caso, objetivo }),
        signal: ac.signal,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar plano')
      setPlano(data.plano)
    } catch (e: unknown) {
      toast('error', e instanceof Error ? e.message : 'Erro ao gerar plano')
    } finally {
      clearTimeout(tid)
      setLoading(false)
    }
  }

  function copiar() {
    if (!plano) return
    const fmtFase = (nome: string, f?: Fase) => [
      `== ${nome} (${f?.janela ?? ''}) ==`,
      ...(f?.acoes ?? []).map(a => `- ${a.acao} (${a.prazo})`),
    ].join('\n')
    const content = [
      plano.titulo,
      '', plano.sintese_situacional,
      '', `Objetivo: ${plano.objetivo_estrategico}`,
      '', fmtFase('IMEDIATO', plano.fase_imediato),
      '', fmtFase('MEDIO', plano.fase_medio),
      '', fmtFase('LONGO', plano.fase_longo),
      '', plano.recomendacao_final,
    ].filter(Boolean).join('\n')
    navigator.clipboard.writeText(content).then(() => {
      setCopiado(true); setTimeout(() => setCopiado(false), 2000)
    })
  }

  return (
    <div className="agent-page">
      <AgentHero
        edition="Nº XV"
        Icon={Brain}
        name="Estrategista"
        discipline="Plano em três horizontes"
        description="Estratégia processual do caso em três fases: imediato, médio e longo prazo. Cada fase traz ações, prazos, KPIs, riscos, cenários e matriz de mitigação. Útil para briefing interno, reunião com cliente e plano de honorário de êxito."
        accent="rose"
        meta={[
          { Icon: Clock, label: 'Tempo médio', value: '~60s' },
          { Icon: Gauge, label: 'Profundidade', value: '3 fases + cenários' },
          { Icon: ShieldCheck, label: 'Compliance', value: 'Fundamentação exigível' },
        ]}
        steps={[
          { n: 'I', title: 'Descreva o caso', desc: 'Fatos, partes, disputa, documentos e status atual do processo.' },
          { n: 'II', title: 'Declare o objetivo', desc: 'O que o cliente quer alcançar, com prazo e critério de sucesso claros.' },
          { n: 'III', title: 'Receba o plano', desc: 'Três fases com ações, prazos, KPIs, riscos e recomendação final.' },
        ]}
        examples={[
          { label: 'Ação trabalhista de alto valor', prompt: 'Cliente ex-diretor de multinacional pleiteia rescisão indireta com pedido de R$ 2.8M (equiparação, horas extras, danos morais por assédio moral sistêmico). Empresa é ré solvente com 50 funcionários. Já há prints de mensagens e 4 testemunhas. Cliente está desempregado há 5 meses.' },
          { label: 'Sociedade em conflito', prompt: 'Sociedade limitada de 3 sócios, meu cliente é minoritário (20%). Majoritários desviaram R$ 600 mil em operações simuladas e agora tentam expulsá-lo via exclusão judicial. Contrato social prevê arbitragem. Há laudo pericial contratado pelo cliente apontando o desvio.' },
          { label: 'Contrato B2B em risco', prompt: 'Cliente é distribuidora que firmou exclusividade com fabricante por 5 anos. Ao 14° mês, fabricante reduziu 70% o volume entregue sem justificar. Cliente já investiu R$ 400 mil em estrutura. Objetivo: restabelecer fornecimento ou indenização. Fabricante é grupo econômico solvente.' },
        ]}
        onExampleClick={setCaso}
        shortcut="⌘⏎ gerar"
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }} className="est-grid">
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', margin: '0 0 20px' }}>
            Situacao
          </h2>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Descricao do caso
            </label>
            <textarea
              value={caso}
              onChange={e => setCaso(e.target.value)}
              maxLength={50000}
              placeholder="Descreva o caso em detalhes: partes, processo, fase atual, provas, valor em discussao..."
              rows={10}
              style={{
                width: '100%', padding: 12, borderRadius: 8,
                border: '1px solid var(--border)', background: 'var(--bg-base)',
                color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.6,
                fontFamily: 'inherit', resize: 'vertical', minHeight: 200,
              }}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Objetivo do cliente
            </label>
            <textarea
              value={objetivo}
              onChange={e => setObjetivo(e.target.value)}
              maxLength={5000}
              placeholder="Ex: ganhar a causa, reduzir exposure financeira, acordo rapido, proteger reputacao..."
              rows={4}
              style={{
                width: '100%', padding: 12, borderRadius: 8,
                border: '1px solid var(--border)', background: 'var(--bg-base)',
                color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.6,
                fontFamily: 'inherit', resize: 'vertical', minHeight: 80,
              }}
            />
          </div>
          <button
            onClick={gerar}
            disabled={caso.trim().length < 50 || objetivo.trim().length < 10 || loading}
            style={{
              width: '100%', padding: '12px 20px', borderRadius: 8,
              background: 'var(--accent)', color: 'var(--bg-base)',
              border: 'none', fontSize: 14, fontWeight: 600,
              cursor: (caso.trim().length < 50 || objetivo.trim().length < 10 || loading) ? 'not-allowed' : 'pointer',
              opacity: (caso.trim().length < 50 || objetivo.trim().length < 10 || loading) ? 0.5 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <Sparkles size={16} aria-hidden /> {loading ? 'Montando plano...' : 'Gerar plano estrategico'}
          </button>
        </div>

        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 14, padding: 24, minHeight: 500 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', margin: 0 }}>
              Plano estrategico
            </h2>
            {plano && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={gerar} disabled={loading} title="Gerar novo plano com a mesma situação" style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 6,
                  background: 'transparent', border: '1px solid var(--border)',
                  color: 'var(--text-secondary)', fontSize: 12, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1,
                }}>
                  <RotateCcw size={13} /> Regenerar
                </button>
                <button onClick={copiar} style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 6,
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
            <div style={{ padding: 24 }}>
              <AgentProgress loading steps={[...AGENT_STEPS.estrategista]} />
            </div>
          )}

          {!loading && !plano && (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
              <Target size={40} style={{ margin: '0 auto 16px', opacity: 0.3 }} aria-hidden />
              <div style={{ fontSize: 13 }}>Descreva o caso e o objetivo para gerar o plano</div>
            </div>
          )}

          {plano && !loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {plano.titulo && (
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: 'var(--text-primary)', margin: 0 }}>
                  {plano.titulo}
                </h3>
              )}
              {plano.sintese_situacional && (
                <div style={{ padding: 12, borderRadius: 8, background: 'var(--hover)', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  {plano.sintese_situacional}
                </div>
              )}
              {plano.objetivo_estrategico && (
                <div style={{ padding: 12, borderRadius: 8, background: 'var(--accent-light)', border: '1px solid var(--accent)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                    Objetivo estrategico
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6, fontWeight: 500 }}>
                    {plano.objetivo_estrategico}
                  </div>
                </div>
              )}

              {plano.fase_imediato && <FaseBlock title="Fase imediata" color="#c0392b" fase={plano.fase_imediato} />}
              {plano.fase_medio && <FaseBlock title="Fase media" color="#e67e22" fase={plano.fase_medio} />}
              {plano.fase_longo && <FaseBlock title="Fase longa" color="#2d8659" fase={plano.fase_longo} />}

              {(plano.matriz_risco?.length ?? 0) > 0 && (
                <Section title="Matriz de risco">
                  {plano.matriz_risco?.map((m, i) => (
                    <div key={i} style={{ ...cardStyle, borderLeftColor: '#c0392b' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <AlertTriangle size={14} style={{ color: '#c0392b' }} />
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{m.risco}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 12, fontSize: 11, marginBottom: 6 }}>
                        {m.probabilidade && <span style={{ color: 'var(--text-muted)' }}>Prob: <strong style={{ color: 'var(--text-secondary)' }}>{m.probabilidade}</strong></span>}
                        {m.impacto && <span style={{ color: 'var(--text-muted)' }}>Impacto: <strong style={{ color: 'var(--text-secondary)' }}>{m.impacto}</strong></span>}
                      </div>
                      {m.mitigacao && <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{m.mitigacao}</div>}
                    </div>
                  ))}
                </Section>
              )}

              {(plano.cenarios?.length ?? 0) > 0 && (
                <Section title="Cenarios">
                  {plano.cenarios?.map((c, i) => (
                    <div key={i} style={cardStyle}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{c.cenario}</div>
                      {c.descricao && <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 6 }}>{c.descricao}</div>}
                      <div style={{ display: 'flex', gap: 12, fontSize: 11, flexWrap: 'wrap' }}>
                        {c.probabilidade && <span style={{ color: 'var(--text-muted)' }}>Prob: <strong style={{ color: 'var(--text-secondary)' }}>{c.probabilidade}</strong></span>}
                        {c.timing && <span style={{ color: 'var(--text-muted)' }}>Timing: <strong style={{ color: 'var(--text-secondary)' }}>{c.timing}</strong></span>}
                        {c.custo_estimado && <span style={{ color: 'var(--text-muted)' }}>Custo: <strong style={{ color: 'var(--text-secondary)' }}>{c.custo_estimado}</strong></span>}
                      </div>
                    </div>
                  ))}
                </Section>
              )}

              {plano.recomendacao_final && (
                <div style={{
                  padding: 16, borderRadius: 8,
                  background: 'var(--accent-light)', border: '1px solid var(--accent)',
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                    Recomendacao final
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.7, fontWeight: 500 }}>
                    {plano.recomendacao_final}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, gap: 12, flexWrap: 'wrap' }}>
                {plano.confianca && <ConfidenceBadge confianca={plano.confianca} />}
                <PoweredByPralvex />
              </div>
              <button
                onClick={() => { setPlano(null); setCaso(''); setObjetivo('') }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: 10, borderRadius: 8, background: 'transparent',
                  border: '1px dashed var(--border)', color: 'var(--text-muted)',
                  fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                <RotateCcw size={14} /> Novo plano
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .est-grid { grid-template-columns: 1fr !important; }
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
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent)', marginBottom: 10 }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function FaseBlock({ title, color, fase }: { title: string; color: string; fase: Fase }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <Clock size={14} style={{ color }} />
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color }}>
          {title}
        </div>
        {fase.janela && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>· {fase.janela}</span>}
      </div>
      {(fase.prioridades?.length ?? 0) > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
          {fase.prioridades?.map((p, i) => (
            <span key={i} style={{
              fontSize: 11, padding: '3px 10px', borderRadius: 12,
              background: 'var(--hover)', color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
            }}>
              {p}
            </span>
          ))}
        </div>
      )}
      {(fase.acoes?.length ?? 0) > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {fase.acoes?.map((a, i) => (
            <div key={i} style={{
              padding: 12, borderRadius: 8, background: 'var(--hover)',
              borderLeft: `3px solid ${color}`,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                {a.acao}
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 11, flexWrap: 'wrap', marginBottom: 6 }}>
                {a.prazo && <span style={{ color: 'var(--text-muted)' }}>Prazo: <strong style={{ color: 'var(--text-secondary)' }}>{a.prazo}</strong></span>}
                {a.responsavel && <span style={{ color: 'var(--text-muted)' }}>Resp: <strong style={{ color: 'var(--text-secondary)' }}>{a.responsavel}</strong></span>}
              </div>
              {a.fundamento && <div style={{ fontSize: 12, color: 'var(--accent)', marginBottom: 4 }}>{a.fundamento}</div>}
              {a.entregavel && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Entregavel: {a.entregavel}</div>}
            </div>
          ))}
        </div>
      )}
      {((fase.kpis?.length ?? 0) > 0 || (fase.riscos?.length ?? 0) > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
          {(fase.kpis?.length ?? 0) > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#2d8659', marginBottom: 6 }}>KPIs</div>
              {fase.kpis?.map((k, i) => (
                <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 3 }}>· {k}</div>
              ))}
            </div>
          )}
          {(fase.riscos?.length ?? 0) > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#c0392b', marginBottom: 6 }}>Riscos</div>
              {fase.riscos?.map((r, i) => (
                <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 3 }}>· {r}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

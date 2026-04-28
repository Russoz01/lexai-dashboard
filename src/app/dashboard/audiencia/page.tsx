'use client'

import { useState } from 'react'
import {
  Mic,
  RotateCcw,
  Check,
  Clipboard,
  Sparkles,
  Clock,
  AlertCircle,
  ShieldCheck,
  Gauge,
} from 'lucide-react'
import ConfidenceBadge, { PoweredByPralvex } from '@/components/ConfidenceBadge'
import { toast } from '@/components/Toast'
import { AgentHero } from '@/components/AgentHero'

interface PontoChave {
  ordem?: number; titulo?: string; argumentacao?: string
  fundamento_legal?: string; jurisprudencia?: string; tempo_sugerido?: string
}
interface Roteiro {
  titulo?: string
  tipo_audiencia?: string
  duracao_sugerida?: string
  abertura?: { saudacao?: string; contextualizacao?: string; tese_central?: string }
  pontos_chave?: PontoChave[]
  antecipacao_contrargumentos?: { contrargumento?: string; replica?: string }[]
  fechamento?: { recapitulacao?: string; pedido_final?: string; frase_impacto?: string }
  pontos_atencao?: string[]
  material_apoio?: string[]
  confianca?: { nivel?: string; nota?: string }
}

const TIPOS: Record<string, string> = {
  instrucao: 'Audiencia de Instrucao',
  conciliacao: 'Audiencia de Conciliacao',
  justificacao: 'Audiencia de Justificacao',
  sustentacao_tribunal: 'Sustentacao Oral (Tribunal)',
  tribunal_juri: 'Tribunal do Juri',
  trabalhista: 'Audiencia Trabalhista',
}

export default function AudienciaPage() {
  const [tipo, setTipo] = useState('instrucao')
  const [caso, setCaso] = useState('')
  const [loading, setLoading] = useState(false)
  const [roteiro, setRoteiro] = useState<Roteiro | null>(null)
  const [copiado, setCopiado] = useState(false)

  async function gerar() {
    if (caso.trim().length < 30 || loading) return
    setLoading(true)
    setRoteiro(null)
    try {
      const res = await fetch('/api/audiencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, caso }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar roteiro')
      setRoteiro(data.roteiro)
    } catch (e: unknown) {
      toast('error', e instanceof Error ? e.message : 'Erro ao gerar roteiro')
    } finally {
      setLoading(false)
    }
  }

  function copiar() {
    if (!roteiro) return
    const blocks = [
      roteiro.titulo, '',
      'ABERTURA',
      roteiro.abertura?.saudacao,
      roteiro.abertura?.contextualizacao,
      `Tese: ${roteiro.abertura?.tese_central}`,
      '', 'PONTOS CHAVE',
      ...(roteiro.pontos_chave ?? []).map(p => `${p.ordem}. ${p.titulo}\n${p.argumentacao}`),
      '', 'FECHAMENTO',
      roteiro.fechamento?.recapitulacao,
      roteiro.fechamento?.pedido_final,
      roteiro.fechamento?.frase_impacto,
    ].filter(Boolean).join('\n')
    navigator.clipboard.writeText(blocks).then(() => {
      setCopiado(true); setTimeout(() => setCopiado(false), 2000)
    })
  }

  return (
    <div className="agent-page">
      <AgentHero
        edition="Nº XVI"
        Icon={Mic}
        name="Audiência"
        discipline="Roteiros de sustentação oral"
        description="Roteiro completo para audiência de instrução, conciliação, sustentação no tribunal ou júri: abertura, pontos-chave com tempo, antecipação de contrargumentos, fechamento e material de apoio. Foco em performance oral real."
        accent="bronze"
        meta={[
          { Icon: Clock, label: 'Tempo médio', value: '~45s' },
          { Icon: Gauge, label: 'Profundidade', value: 'Abertura → fechamento' },
          { Icon: ShieldCheck, label: 'Compliance', value: 'Fundamentação exigível' },
        ]}
        steps={[
          { n: 'I', title: 'Escolha o tipo', desc: 'Instrução, conciliação, justificação, sustentação oral ou tribunal do júri.' },
          { n: 'II', title: 'Descreva o caso', desc: 'Tese, partes, provas disponíveis e objetivo da audiência.' },
          { n: 'III', title: 'Receba o roteiro', desc: 'Abertura, pontos-chave com tempo, contrargumentos e fechamento pronto para ensaio.' },
        ]}
        examples={[
          { label: 'Sustentação trabalhista', prompt: 'Audiência de instrução em ação trabalhista. Cliente reclama R$ 380 mil em horas extras, adicional noturno e dano moral por assédio. Provas: 3 testemunhas (2 ex-colegas + 1 atual), planilhas de controle de ponto falsas emitidas pela empresa, prints de WhatsApp com supervisor. Juiz é conhecido por ser rigoroso com prova testemunhal.' },
          { label: 'Conciliação no cível', prompt: 'Audiência de conciliação em ação de rescisão contratual com pedido de R$ 120 mil por quebra de contrato B2B. Cliente quer acordo entre R$ 70k e R$ 90k, com parcelamento em até 6x. Parte contrária ofereceu R$ 40k à vista na última tentativa extrajudicial. Juiz valoriza acordos.' },
          { label: 'Sustentação oral STJ', prompt: 'Sustentação oral de 15 minutos no STJ em recurso especial sobre responsabilidade civil de provedor de aplicação por conteúdo ofensivo de terceiro. Tese: Marco Civil + precedente do STF no Tema 987. Relator já votou contra, precisamos virar 2 ministros.' },
        ]}
        onExampleClick={setCaso}
        shortcut="⌘⏎ gerar"
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }} className="aud-grid">
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', margin: '0 0 20px' }}>
            Configuracao
          </h2>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Tipo de audiencia
            </label>
            <select value={tipo} onChange={e => setTipo(e.target.value)} style={{
              width: '100%', padding: 12, borderRadius: 8,
              border: '1px solid var(--border)', background: 'var(--bg-base)',
              color: 'var(--text-primary)', fontSize: 14, cursor: 'pointer',
            }}>
              {Object.entries(TIPOS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Descricao do caso
            </label>
            <textarea
              value={caso}
              onChange={e => setCaso(e.target.value)}
              maxLength={50000}
              placeholder="Descreva o caso, a posicao do cliente, principais provas e a tese central..."
              rows={12}
              style={{
                width: '100%', padding: 12, borderRadius: 8,
                border: '1px solid var(--border)', background: 'var(--bg-base)',
                color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.6,
                fontFamily: 'inherit', resize: 'vertical', minHeight: 240,
              }}
            />
          </div>
          <button
            onClick={gerar}
            disabled={caso.trim().length < 30 || loading}
            style={{
              width: '100%', padding: '12px 20px', borderRadius: 8,
              background: 'var(--accent)', color: 'var(--bg-base)',
              border: 'none', fontSize: 14, fontWeight: 600,
              cursor: (caso.trim().length < 30 || loading) ? 'not-allowed' : 'pointer',
              opacity: (caso.trim().length < 30 || loading) ? 0.5 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <Sparkles size={16} aria-hidden /> {loading ? 'Montando roteiro...' : 'Gerar roteiro'}
          </button>
        </div>

        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 14, padding: 24, minHeight: 500 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', margin: 0 }}>
              Roteiro
            </h2>
            {roteiro && (
              <button onClick={copiar} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 6,
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
              <span style={{ display: 'inline-block', width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: 16 }} />
              <div style={{ fontSize: 13 }}>Estruturando abertura, pontos-chave e fechamento...</div>
            </div>
          )}

          {!loading && !roteiro && (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
              <Mic size={40} style={{ margin: '0 auto 16px', opacity: 0.3 }} aria-hidden />
              <div style={{ fontSize: 13 }}>Descreva o caso para montar o roteiro</div>
            </div>
          )}

          {roteiro && !loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {roteiro.titulo && (
                <div>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: 'var(--text-primary)', margin: 0 }}>
                    {roteiro.titulo}
                  </h3>
                  {roteiro.duracao_sugerida && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                      <Clock size={12} /> {roteiro.duracao_sugerida}
                    </div>
                  )}
                </div>
              )}

              {roteiro.abertura && (
                <Section title="Abertura">
                  <div style={cardStyle}>
                    {roteiro.abertura.saudacao && <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600, marginBottom: 6 }}>{roteiro.abertura.saudacao}</div>}
                    {roteiro.abertura.contextualizacao && <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 6 }}>{roteiro.abertura.contextualizacao}</div>}
                    {roteiro.abertura.tese_central && <div style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600, lineHeight: 1.6 }}>Tese: {roteiro.abertura.tese_central}</div>}
                  </div>
                </Section>
              )}

              {(roteiro.pontos_chave?.length ?? 0) > 0 && (
                <Section title="Pontos-chave">
                  {roteiro.pontos_chave?.map((p, i) => (
                    <div key={i} style={cardStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                          {p.ordem ?? i + 1}. {p.titulo}
                        </div>
                        {p.tempo_sugerido && (
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={11} /> {p.tempo_sugerido}
                          </span>
                        )}
                      </div>
                      {p.argumentacao && <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 6 }}>{p.argumentacao}</div>}
                      {p.fundamento_legal && <div style={{ fontSize: 12, color: 'var(--accent)', marginBottom: 4 }}>{p.fundamento_legal}</div>}
                      {p.jurisprudencia && <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>{p.jurisprudencia}</div>}
                    </div>
                  ))}
                </Section>
              )}

              {(roteiro.antecipacao_contrargumentos?.length ?? 0) > 0 && (
                <Section title="Contra-argumentos previstos">
                  {roteiro.antecipacao_contrargumentos?.map((c, i) => (
                    <div key={i} style={{ ...cardStyle, borderLeftColor: '#c0392b' }}>
                      {c.contrargumento && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Ataque: {c.contrargumento}</div>}
                      {c.replica && <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>Replica: {c.replica}</div>}
                    </div>
                  ))}
                </Section>
              )}

              {roteiro.fechamento && (
                <Section title="Fechamento">
                  <div style={{ ...cardStyle, background: 'var(--accent-light)', borderLeft: '3px solid var(--accent)' }}>
                    {roteiro.fechamento.recapitulacao && <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 6 }}>{roteiro.fechamento.recapitulacao}</div>}
                    {roteiro.fechamento.pedido_final && <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: 6, fontWeight: 600 }}>{roteiro.fechamento.pedido_final}</div>}
                    {roteiro.fechamento.frase_impacto && <div style={{ fontSize: 14, color: 'var(--accent)', fontStyle: 'italic', marginTop: 8, fontFamily: "'Playfair Display', serif" }}>&ldquo;{roteiro.fechamento.frase_impacto}&rdquo;</div>}
                  </div>
                </Section>
              )}

              {(roteiro.pontos_atencao?.length ?? 0) > 0 && (
                <Section title="Pontos de atencao">
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {roteiro.pontos_atencao?.map((p, i) => (
                      <li key={i} style={{
                        padding: 10, borderRadius: 6, background: 'rgba(230,126,34,0.08)',
                        fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6,
                        display: 'flex', alignItems: 'flex-start', gap: 8,
                      }}>
                        <AlertCircle size={14} style={{ color: '#e67e22', flexShrink: 0, marginTop: 2 }} />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {(roteiro.material_apoio?.length ?? 0) > 0 && (
                <Section title="Material de apoio">
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {roteiro.material_apoio?.map((m, i) => (
                      <li key={i} style={{ padding: 10, borderRadius: 6, background: 'var(--hover)', fontSize: 13, color: 'var(--text-secondary)' }}>
                        {m}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, gap: 12, flexWrap: 'wrap' }}>
                {roteiro.confianca && <ConfidenceBadge confianca={roteiro.confianca} />}
                <PoweredByPralvex />
              </div>
              <button
                onClick={() => { setRoteiro(null); setCaso('') }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: 10, borderRadius: 8, background: 'transparent',
                  border: '1px dashed var(--border)', color: 'var(--text-muted)',
                  fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                <RotateCcw size={14} /> Novo roteiro
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .aud-grid { grid-template-columns: 1fr !important; }
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

'use client'

import { useState } from 'react'
import {
  UserRound,
  RotateCcw,
  Check,
  Clipboard,
  Sparkles,
  AlertCircle,
  Flag,
  Clock,
  ListChecks,
  ShieldCheck,
} from 'lucide-react'
import ConfidenceBadge, { PoweredByPralvex } from '@/components/ConfidenceBadge'
import { toast } from '@/components/Toast'
import { LEGAL_AREAS_LABEL_MAP } from '@/lib/agents/taxonomy'
import { AgentHero } from '@/components/AgentHero'

interface Pergunta {
  pergunta?: string; racional?: string; red_flags?: string[]; followups?: string[]
}
interface Bloco {
  objetivo?: string; perguntas?: Pergunta[]
}
interface Roteiro {
  titulo?: string
  area?: string
  perfil_cliente?: string
  duracao_estimada?: string
  observacao_etica?: string
  bloco_abertura?: Bloco
  bloco_fatos?: Bloco
  bloco_objetivos?: Bloco
  bloco_fechamento?: Bloco
  documentos_pedir?: string[]
  prazos_criticos?: string[]
  proximos_passos?: string[]
  confianca?: { nivel?: string; nota?: string }
}

// Taxonomia canônica (v10.10): src/lib/agents/taxonomy.ts é o source of truth.
const AREAS = LEGAL_AREAS_LABEL_MAP

export default function AtendimentoPage() {
  const [area, setArea] = useState('civel')
  const [perfil, setPerfil] = useState('')
  const [loading, setLoading] = useState(false)
  const [roteiro, setRoteiro] = useState<Roteiro | null>(null)
  const [copiado, setCopiado] = useState(false)

  async function gerar() {
    if (perfil.trim().length < 20 || loading) return
    setLoading(true)
    setRoteiro(null)
    try {
      const res = await fetch('/api/atendimento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ area, perfil }),
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
    const fmtBloco = (titulo: string, b?: Bloco) => [
      `== ${titulo} ==`,
      b?.objetivo && `Objetivo: ${b.objetivo}`,
      ...(b?.perguntas ?? []).map((p, i) => `${i + 1}. ${p.pergunta}`),
    ].filter(Boolean).join('\n')
    const content = [
      roteiro.titulo,
      fmtBloco('Abertura', roteiro.bloco_abertura),
      fmtBloco('Fatos', roteiro.bloco_fatos),
      fmtBloco('Objetivos', roteiro.bloco_objetivos),
      fmtBloco('Fechamento', roteiro.bloco_fechamento),
    ].filter(Boolean).join('\n\n')
    navigator.clipboard.writeText(content).then(() => {
      setCopiado(true); setTimeout(() => setCopiado(false), 2000)
    })
  }

  return (
    <div className="agent-page">
      <AgentHero
        edition="Nº VII"
        Icon={UserRound}
        name="Atendimento"
        discipline="Roteiros de entrevista"
        description="Monta o roteiro da primeira consulta em 4 blocos — abertura, fatos, objetivos, fechamento. Inclui red flags éticas, documentos a pedir e prazos críticos."
        accent="rose"
        meta={[
          { Icon: Clock, label: 'Duração estimada', value: '45-60 min' },
          { Icon: ListChecks, label: 'Estrutura', value: '4 blocos + followups' },
          { Icon: ShieldCheck, label: 'Provimento 205', value: 'Observações éticas' },
        ]}
        steps={[
          { n: 'I', title: 'Escolha a área', desc: 'Cível, trabalhista, tributário, família... a pauta muda por área.' },
          { n: 'II', title: 'Perfil do cliente', desc: 'Quem é, qual o contexto do problema, o que trouxe até você.' },
          { n: 'III', title: 'Roteiro completo', desc: 'Perguntas + racional + red flags + documentos + prazos.' },
        ]}
        examples={[
          { label: 'Sócio cobrando haveres', prompt: 'PJ de pequeno porte em SP, recebeu notificação extrajudicial de ex-sócio cobrando haveres. Primeira consulta, ainda não contratou advogado. Contrato social antigo, sem cláusula de apuração.' },
          { label: 'Rescisão indireta suspeita', prompt: 'Funcionário CLT de 4 anos em empresa de tecnologia. Relata atrasos de salário há 3 meses, ambiente tóxico, quer rescisão indireta mas tem medo de retaliação.' },
          { label: 'Divórcio com filhos menores', prompt: 'Mulher, 38, casada há 12 anos em comunhão parcial. Dois filhos menores (8 e 5). Marido empresário, suspeita de ocultação patrimonial em offshore.' },
        ]}
        onExampleClick={setPerfil}
        shortcut="⌘⏎ gerar"
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }} className="aten-grid">
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', margin: '0 0 20px' }}>
            Contexto do caso
          </h2>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Area do caso
            </label>
            <select value={area} onChange={e => setArea(e.target.value)} style={{
              width: '100%', padding: 12, borderRadius: 8,
              border: '1px solid var(--border)', background: 'var(--bg-base)',
              color: 'var(--text-primary)', fontSize: 14, cursor: 'pointer',
            }}>
              {Object.entries(AREAS).map(([k, v]) => (
                <option key={k} value={k}>Direito {v}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Perfil do cliente e contexto inicial
            </label>
            <textarea
              value={perfil}
              onChange={e => setPerfil(e.target.value)}
              maxLength={25000}
              placeholder="Ex: PJ de pequeno porte em SP, recebeu notificação extrajudicial de ex-sócio cobrando haveres. Primeira consulta, ainda não contratou..."
              rows={10}
              style={{
                width: '100%', padding: 12, borderRadius: 8,
                border: '1px solid var(--border)', background: 'var(--bg-base)',
                color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.6,
                fontFamily: 'inherit', resize: 'vertical', minHeight: 200,
              }}
            />
          </div>
          <button
            onClick={gerar}
            disabled={perfil.trim().length < 20 || loading}
            style={{
              width: '100%', padding: '12px 20px', borderRadius: 8,
              background: 'var(--accent)', color: 'var(--bg-base)',
              border: 'none', fontSize: 14, fontWeight: 600,
              cursor: (perfil.trim().length < 20 || loading) ? 'not-allowed' : 'pointer',
              opacity: (perfil.trim().length < 20 || loading) ? 0.5 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <Sparkles size={16} aria-hidden /> {loading ? 'Montando roteiro...' : 'Gerar roteiro de entrevista'}
          </button>
        </div>

        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 14, padding: 24, minHeight: 500 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', margin: 0 }}>
              Roteiro de entrevista
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
              <div style={{ fontSize: 13 }}>Estruturando blocos de entrevista...</div>
            </div>
          )}

          {!loading && !roteiro && (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
              <UserRound size={40} style={{ margin: '0 auto 16px', opacity: 0.3 }} aria-hidden />
              <div style={{ fontSize: 13 }}>Descreva o perfil do cliente (minimo 20 caracteres)</div>
            </div>
          )}

          {roteiro && !loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {roteiro.titulo && (
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: 'var(--text-primary)', margin: 0 }}>
                  {roteiro.titulo}
                </h3>
              )}
              {roteiro.duracao_estimada && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Duracao estimada: {roteiro.duracao_estimada}
                </div>
              )}
              {roteiro.observacao_etica && (
                <div style={{
                  padding: 12, borderRadius: 8, background: 'rgba(230,126,34,0.08)',
                  border: '1px solid rgba(230,126,34,0.2)', fontSize: 12, color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                }}>
                  <strong style={{ color: '#e67e22' }}>Observacao etica:</strong> {roteiro.observacao_etica}
                </div>
              )}

              {roteiro.bloco_abertura && <BlocoBlock title="Bloco 1 - Abertura" bloco={roteiro.bloco_abertura} />}
              {roteiro.bloco_fatos && <BlocoBlock title="Bloco 2 - Fatos" bloco={roteiro.bloco_fatos} />}
              {roteiro.bloco_objetivos && <BlocoBlock title="Bloco 3 - Objetivos" bloco={roteiro.bloco_objetivos} />}
              {roteiro.bloco_fechamento && <BlocoBlock title="Bloco 4 - Fechamento" bloco={roteiro.bloco_fechamento} />}

              {(roteiro.documentos_pedir?.length ?? 0) > 0 && (
                <Section title="Documentos a solicitar">
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {roteiro.documentos_pedir?.map((d, i) => (
                      <li key={i} style={{ padding: 10, borderRadius: 6, background: 'var(--hover)', fontSize: 13, color: 'var(--text-secondary)' }}>
                        {d}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {(roteiro.prazos_criticos?.length ?? 0) > 0 && (
                <Section title="Prazos criticos">
                  {roteiro.prazos_criticos?.map((p, i) => (
                    <div key={i} style={{
                      padding: 10, borderRadius: 6, marginBottom: 6,
                      background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.2)',
                      fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6,
                      display: 'flex', alignItems: 'flex-start', gap: 8,
                    }}>
                      <Flag size={14} style={{ color: '#c0392b', flexShrink: 0, marginTop: 2 }} />
                      <span>{p}</span>
                    </div>
                  ))}
                </Section>
              )}

              {(roteiro.proximos_passos?.length ?? 0) > 0 && (
                <Section title="Proximos passos">
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {roteiro.proximos_passos?.map((p, i) => (
                      <li key={i} style={{ padding: 10, borderRadius: 6, background: 'var(--hover)', fontSize: 13, color: 'var(--text-secondary)' }}>
                        {i + 1}. {p}
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
                onClick={() => { setRoteiro(null); setPerfil('') }}
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
          .aten-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
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

function BlocoBlock({ title, bloco }: { title: string; bloco: Bloco }) {
  return (
    <div style={{
      padding: 14, borderRadius: 10, background: 'var(--hover)',
      border: '1px solid var(--border)',
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent)', marginBottom: 10 }}>
        {title}
      </div>
      {bloco.objetivo && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: 10 }}>
          {bloco.objetivo}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {bloco.perguntas?.map((p, i) => (
          <div key={i} style={{ padding: 10, borderRadius: 6, background: 'var(--bg-base)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: 6 }}>
              {i + 1}. {p.pergunta}
            </div>
            {p.racional && (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 6 }}>
                Racional: {p.racional}
              </div>
            )}
            {(p.red_flags?.length ?? 0) > 0 && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 6 }}>
                <AlertCircle size={12} style={{ color: '#c0392b', flexShrink: 0, marginTop: 2 }} />
                <div style={{ fontSize: 11, color: '#c0392b', lineHeight: 1.5 }}>
                  {p.red_flags?.join(' · ')}
                </div>
              </div>
            )}
            {(p.followups?.length ?? 0) > 0 && (
              <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px dashed var(--border)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Follow-ups
                </div>
                {p.followups?.map((f, j) => (
                  <div key={j} style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    · {f}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

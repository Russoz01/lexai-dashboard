'use client'

import { useState } from 'react'
import {
  Megaphone,
  RotateCcw,
  Check,
  Clipboard,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import ConfidenceBadge, { PoweredByPralvex } from '@/components/ConfidenceBadge'
import { toast } from '@/components/Toast'

interface Variacao {
  nome?: string; titulo?: string; corpo?: string; cta?: string
  hashtags?: string[]; sugestao_visual?: string; tom?: string; observacoes?: string
}
interface Checklist {
  regra?: string; status?: string; nota?: string
}
interface Conteudo {
  topico?: string
  plataforma?: string
  publico_alvo?: string
  variacoes?: Variacao[]
  checklist_compliance?: Checklist[]
  palavras_chave_seo?: string[]
  rodape_obrigatorio?: string
  alertas?: string[]
  confianca?: { nivel?: string; nota?: string }
}

const PLATAFORMAS: Record<string, string> = {
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  blog: 'Blog / SEO',
  facebook: 'Facebook',
  threads: 'Threads',
}

export default function MarketingIaPage() {
  const [topico, setTopico] = useState('')
  const [plataforma, setPlataforma] = useState('instagram')
  const [loading, setLoading] = useState(false)
  const [conteudo, setConteudo] = useState<Conteudo | null>(null)
  const [copiadoIdx, setCopiadoIdx] = useState<number | null>(null)

  async function gerar() {
    if (topico.trim().length < 10 || loading) return
    setLoading(true)
    setConteudo(null)
    try {
      const res = await fetch('/api/marketing-ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topico, plataforma }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar conteúdo')
      setConteudo(data.conteudo)
    } catch (e: unknown) {
      toast('error', e instanceof Error ? e.message : 'Erro ao gerar conteúdo')
    } finally {
      setLoading(false)
    }
  }

  function copiarVariacao(v: Variacao, idx: number) {
    const text = [
      v.titulo, '', v.corpo, '', v.cta, '', (v.hashtags ?? []).join(' '),
    ].filter(Boolean).join('\n')
    navigator.clipboard.writeText(text).then(() => {
      setCopiadoIdx(idx)
      setTimeout(() => setCopiadoIdx(null), 2000)
    })
  }

  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }}>
      <div className="demo-ribbon" style={{ position: 'relative', top: 'auto', borderRadius: 12, marginBottom: 24, borderBottom: '1px solid rgba(212,174,106,0.28)' }}>
        <strong style={{ fontWeight: 700, letterSpacing: '0.22em' }}>Modo demonstração</strong>
        <span style={{ opacity: 0.7 }}>·</span>
        <span style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'none', fontFamily: 'var(--font-sans, system-ui)' }}>
          módulo em beta fechado — respostas são geradas mas limitadas
        </span>
        <a href="/dashboard/planos" className="demo-ribbon-link">Solicitar acesso completo</a>
      </div>

      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          <div style={{ background: 'rgba(191,166,142,0.1)', border: '1px solid rgba(191,166,142,0.3)', borderRadius: 12, padding: 12 }}>
            <Megaphone size={24} style={{ color: 'var(--accent)' }} aria-hidden />
          </div>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 32, color: 'var(--text-primary)', margin: 0, fontWeight: 700 }}>
              Marketing IA
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '4px 0 0' }}>
              Conteúdo OAB-compliant (Provimento 205/2021) com 3 variações + checklist
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }} className="mkt-grid">
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', margin: '0 0 20px' }}>
            Briefing do post
          </h2>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Plataforma
            </label>
            <select value={plataforma} onChange={e => setPlataforma(e.target.value)} style={{
              width: '100%', padding: 12, borderRadius: 8,
              border: '1px solid var(--border)', background: 'var(--bg-base)',
              color: 'var(--text-primary)', fontSize: 14, cursor: 'pointer',
            }}>
              {Object.entries(PLATAFORMAS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Tópico / ângulo
            </label>
            <textarea
              value={topico}
              onChange={e => setTopico(e.target.value)}
              maxLength={10000}
              placeholder="Ex: Novo entendimento do STJ sobre dano moral em demora de entrega de produto…"
              rows={8}
              style={{
                width: '100%', padding: 12, borderRadius: 8,
                border: '1px solid var(--border)', background: 'var(--bg-base)',
                color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.6,
                fontFamily: 'inherit', resize: 'vertical', minHeight: 160,
              }}
            />
          </div>
          <div style={{
            padding: 10, borderRadius: 8, background: 'rgba(45,134,89,0.06)',
            border: '1px solid rgba(45,134,89,0.2)', marginBottom: 16,
            display: 'flex', alignItems: 'flex-start', gap: 8,
          }}>
            <ShieldCheck size={14} style={{ color: '#2d8659', flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Todo conteúdo passa pelo filtro do Provimento 205/2021 da OAB antes de ser entregue. Garantia de resultado, promoções e mercantilização são bloqueados automaticamente.
            </div>
          </div>
          <button
            onClick={gerar}
            disabled={topico.trim().length < 10 || loading}
            style={{
              width: '100%', padding: '12px 20px', borderRadius: 8,
              background: 'var(--accent)', color: 'var(--bg-base)',
              border: 'none', fontSize: 14, fontWeight: 600,
              cursor: (topico.trim().length < 10 || loading) ? 'not-allowed' : 'pointer',
              opacity: (topico.trim().length < 10 || loading) ? 0.5 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <Sparkles size={16} aria-hidden /> {loading ? 'Gerando variações…' : 'Gerar 3 variações'}
          </button>
        </div>

        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 14, padding: 24, minHeight: 500 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', margin: '0 0 20px' }}>
            Variações e compliance
          </h2>

          {loading && (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
              <span style={{ display: 'inline-block', width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: 16 }} />
              <div style={{ fontSize: 13 }}>Redigindo 3 variações + checklist de compliance…</div>
            </div>
          )}

          {!loading && !conteudo && (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
              <Megaphone size={40} style={{ margin: '0 auto 16px', opacity: 0.3 }} aria-hidden />
              <div style={{ fontSize: 13 }}>Descreva o tópico (mínimo 10 caracteres)</div>
            </div>
          )}

          {conteudo && !loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {conteudo.publico_alvo && (
                <div style={{ padding: 10, borderRadius: 8, background: 'var(--hover)', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  <strong>Público-alvo:</strong> {conteudo.publico_alvo}
                </div>
              )}

              {(conteudo.variacoes?.length ?? 0) > 0 && (
                <Section title={`Variações (${conteudo.variacoes?.length ?? 0})`}>
                  {conteudo.variacoes?.map((v, i) => (
                    <div key={i} style={{
                      padding: 14, borderRadius: 10, background: 'var(--bg-base)',
                      border: '1px solid var(--border)', marginBottom: 12,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 8, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{v.nome}</div>
                          {v.tom && (
                            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: 'var(--accent-light)', color: 'var(--accent)', fontWeight: 600 }}>
                              {v.tom}
                            </span>
                          )}
                        </div>
                        <button onClick={() => copiarVariacao(v, i)} style={{
                          display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6,
                          background: 'transparent', border: '1px solid var(--border)',
                          color: 'var(--text-secondary)', fontSize: 11, cursor: 'pointer',
                        }}>
                          {copiadoIdx === i ? <Check size={12} /> : <Clipboard size={12} />}
                          {copiadoIdx === i ? 'Copiado' : 'Copiar'}
                        </button>
                      </div>
                      {v.titulo && (
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: 8 }}>
                          {v.titulo}
                        </div>
                      )}
                      {v.corpo && (
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: 10 }}>
                          {v.corpo}
                        </div>
                      )}
                      {v.cta && (
                        <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, marginBottom: 8 }}>
                          CTA: {v.cta}
                        </div>
                      )}
                      {(v.hashtags?.length ?? 0) > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                          {v.hashtags?.map((h, j) => (
                            <span key={j} style={{
                              fontSize: 11, color: 'var(--text-muted)',
                              padding: '2px 8px', borderRadius: 10, background: 'var(--hover)',
                            }}>
                              {h.startsWith('#') ? h : `#${h}`}
                            </span>
                          ))}
                        </div>
                      )}
                      {v.sugestao_visual && (
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          Visual: {v.sugestao_visual}
                        </div>
                      )}
                      {v.observacoes && (
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, paddingTop: 6, borderTop: '1px dashed var(--border)' }}>
                          {v.observacoes}
                        </div>
                      )}
                    </div>
                  ))}
                </Section>
              )}

              {(conteudo.checklist_compliance?.length ?? 0) > 0 && (
                <Section title="Checklist de compliance (Provimento 205)">
                  {conteudo.checklist_compliance?.map((c, i) => {
                    const status = (c.status ?? '').toLowerCase()
                    const ok = status === 'ok'
                    const violacao = status === 'violacao'
                    const color = ok ? '#2d8659' : violacao ? '#c0392b' : '#e67e22'
                    const Icon = ok ? CheckCircle2 : violacao ? XCircle : AlertTriangle
                    return (
                      <div key={i} style={{
                        padding: 10, borderRadius: 8, marginBottom: 6,
                        background: `rgba(${ok ? '45,134,89' : violacao ? '192,57,43' : '230,126,34'},0.06)`,
                        border: `1px solid rgba(${ok ? '45,134,89' : violacao ? '192,57,43' : '230,126,34'},0.2)`,
                        display: 'flex', alignItems: 'flex-start', gap: 8,
                      }}>
                        <Icon size={14} style={{ color, flexShrink: 0, marginTop: 2 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                            {c.regra}
                          </div>
                          {c.nota && <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{c.nota}</div>}
                        </div>
                      </div>
                    )
                  })}
                </Section>
              )}

              {(conteudo.palavras_chave_seo?.length ?? 0) > 0 && (
                <Section title="Palavras-chave SEO">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {conteudo.palavras_chave_seo?.map((k, i) => (
                      <span key={i} style={{
                        fontSize: 12, padding: '4px 10px', borderRadius: 12,
                        background: 'var(--hover)', color: 'var(--text-secondary)',
                        border: '1px solid var(--border)',
                      }}>
                        {k}
                      </span>
                    ))}
                  </div>
                </Section>
              )}

              {conteudo.rodape_obrigatorio && (
                <div style={{ padding: 12, borderRadius: 8, background: 'var(--accent-light)', border: '1px solid var(--accent)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                    Rodapé obrigatório
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.6 }}>
                    {conteudo.rodape_obrigatorio}
                  </div>
                </div>
              )}

              {(conteudo.alertas?.length ?? 0) > 0 && (
                <Section title="Alertas">
                  {conteudo.alertas?.map((a, i) => (
                    <div key={i} style={{
                      padding: 10, borderRadius: 6, marginBottom: 6,
                      background: 'rgba(230,126,34,0.08)', border: '1px solid rgba(230,126,34,0.2)',
                      fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5,
                      display: 'flex', alignItems: 'flex-start', gap: 8,
                    }}>
                      <AlertTriangle size={13} style={{ color: '#e67e22', flexShrink: 0, marginTop: 2 }} />
                      <span>{a}</span>
                    </div>
                  ))}
                </Section>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, gap: 12, flexWrap: 'wrap' }}>
                {conteudo.confianca && <ConfidenceBadge confianca={conteudo.confianca} />}
                <PoweredByPralvex />
              </div>
              <button
                onClick={() => { setConteudo(null); setTopico('') }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: 10, borderRadius: 8, background: 'transparent',
                  border: '1px dashed var(--border)', color: 'var(--text-muted)',
                  fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                <RotateCcw size={14} /> Novo conteúdo
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .mkt-grid { grid-template-columns: 1fr !important; }
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

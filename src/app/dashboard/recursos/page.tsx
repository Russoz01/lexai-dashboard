'use client'

import { useState } from 'react'
import {
  Gavel,
  RotateCcw,
  Check,
  Clipboard,
  Sparkles,
  FileUp,
  Clock,
  ShieldCheck,
  Gauge,
} from 'lucide-react'
import ConfidenceBadge, { PoweredByPralvex } from '@/components/ConfidenceBadge'
import { toast } from '@/components/Toast'
import { AgentHero } from '@/components/AgentHero'

interface FundamentoReforma {
  ponto?: string; argumentacao?: string; fundamento_legal?: string; jurisprudencia?: string
}
interface Recurso {
  titulo?: string
  tipo_recurso?: string
  cabimento?: {
    fundamento_legal?: string
    tempestividade?: string
    preparo?: string
    legitimidade?: string
    sintese?: string
  }
  prequestionamento?: string
  razoes?: {
    sintese_do_julgado?: string
    fundamentos_de_reforma?: FundamentoReforma[]
    divergencia_jurisprudencial?: string
  }
  pedidos?: string[]
  fechamento?: string
  confianca?: { nivel?: string; nota?: string }
}

const TIPOS: Record<string, string> = {
  apelacao: 'Apelacao',
  agravo_instrumento: 'Agravo de Instrumento',
  agravo_interno: 'Agravo Interno',
  embargos_declaracao: 'Embargos de Declaracao',
  recurso_especial: 'Recurso Especial (REsp)',
  recurso_extraordinario: 'Recurso Extraordinario (RE)',
}

export default function RecursosPage() {
  const [tipo, setTipo] = useState('apelacao')
  const [decisao, setDecisao] = useState('')
  const [loading, setLoading] = useState(false)
  const [recurso, setRecurso] = useState<Recurso | null>(null)
  const [copiado, setCopiado] = useState(false)

  async function gerar() {
    if (decisao.trim().length < 50 || loading) return
    setLoading(true)
    setRecurso(null)
    try {
      const res = await fetch('/api/recursos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, decisao }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar recurso')
      setRecurso(data.recurso)
    } catch (e: unknown) {
      toast('error', e instanceof Error ? e.message : 'Erro ao gerar recurso')
    } finally {
      setLoading(false)
    }
  }

  function copiar() {
    if (!recurso) return
    const t = recurso
    const blocks = [
      t.titulo, '',
      'CABIMENTO', t.cabimento?.sintese,
      '', 'RAZOES', t.razoes?.sintese_do_julgado,
      ...(t.razoes?.fundamentos_de_reforma ?? []).map(f => `\n- ${f.ponto}\n${f.argumentacao}`),
      '', 'PEDIDOS',
      ...(t.pedidos ?? []).map(p => `- ${p}`),
    ].filter(Boolean).join('\n')
    navigator.clipboard.writeText(blocks).then(() => {
      setCopiado(true); setTimeout(() => setCopiado(false), 2000)
    })
  }

  return (
    <div className="agent-page">
      <AgentHero
        edition="Nº XVII"
        Icon={FileUp}
        name="Recursos"
        discipline="Apelação, agravo e excepcionais"
        description="Minuta completa de recurso com cabimento, prequestionamento, síntese do julgado, fundamentos de reforma e divergência jurisprudencial. Cobre apelação, agravo, embargos, recurso especial e extraordinário com checagem de pressupostos."
        accent="sand"
        meta={[
          { Icon: Clock, label: 'Tempo médio', value: '~60s' },
          { Icon: Gauge, label: 'Profundidade', value: 'Cabimento → pedidos' },
          { Icon: ShieldCheck, label: 'Compliance', value: 'Pressupostos auditados' },
        ]}
        steps={[
          { n: 'I', title: 'Escolha o recurso', desc: 'Apelação, agravo, embargos, REsp ou RE — cada um com rito e pressupostos próprios.' },
          { n: 'II', title: 'Cole a decisão', desc: 'Íntegra da sentença ou acórdão recorrido, com data de intimação se houver.' },
          { n: 'III', title: 'Receba a minuta', desc: 'Cabimento, prequestionamento, razões por ponto, pedidos e fechamento formatado.' },
        ]}
        examples={[
          { label: 'Apelação civil', prompt: 'Sentença de improcedência em ação de dano moral por negativação indevida (valor R$ 25.000). Juiz entendeu que cliente não comprovou o dano, apesar de juntar prints do cadastro no Serasa e declaração de testemunhas. Houve cerceamento de defesa: pedido de prova pericial grafotécnica foi indeferido sem fundamentação adequada.' },
          { label: 'Agravo de instrumento', prompt: 'Decisão interlocutória em ação trabalhista negou tutela de urgência para reintegração de diretor estatutário demitido sem processo administrativo. Juiz entendeu que não há verossimilhança. Cliente é diretor há 14 anos, rescisão foi comunicada por e-mail às 23h, em desacordo com estatuto social que exige deliberação em assembleia.' },
          { label: 'Embargos de declaração', prompt: 'Acórdão do TJSP manteve procedência de ação de cobrança, mas foi omisso sobre o pedido de compensação com débito reconhecido do autor na reconvenção. Também foi contraditório: no corpo do acórdão menciona ressarcimento de R$ 80k mas na dispositiva fixa R$ 120k.' },
        ]}
        onExampleClick={setDecisao}
        shortcut="⌘⏎ gerar"
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }} className="rec-grid">
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', margin: '0 0 20px' }}>
            Dados do recurso
          </h2>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Tipo de recurso
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
              Decisao recorrida + contexto
            </label>
            <textarea
              value={decisao}
              onChange={e => setDecisao(e.target.value)}
              maxLength={50000}
              placeholder="Descreva a sentenca/acordao recorrido, o processo e a tese que se quer reformar..."
              rows={12}
              style={{
                width: '100%', padding: 12, borderRadius: 8,
                border: '1px solid var(--border)', background: 'var(--bg-base)',
                color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.6,
                fontFamily: 'inherit', resize: 'vertical', minHeight: 240,
              }}
            />
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right', marginTop: 4 }}>
              {decisao.length.toLocaleString('pt-BR')} / 50.000
            </div>
          </div>
          <button
            onClick={gerar}
            disabled={decisao.trim().length < 50 || loading}
            style={{
              width: '100%', padding: '12px 20px', borderRadius: 8,
              background: 'var(--accent)', color: 'var(--bg-base)',
              border: 'none', fontSize: 14, fontWeight: 600,
              cursor: (decisao.trim().length < 50 || loading) ? 'not-allowed' : 'pointer',
              opacity: (decisao.trim().length < 50 || loading) ? 0.5 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <Sparkles size={16} aria-hidden /> {loading ? 'Elaborando recurso...' : 'Gerar recurso'}
          </button>
        </div>

        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 14, padding: 24, minHeight: 500 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', margin: 0 }}>
              Esboco do recurso
            </h2>
            {recurso && (
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
              <span style={{
                display: 'inline-block', width: 32, height: 32,
                border: '3px solid var(--border)', borderTopColor: 'var(--accent)',
                borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: 16,
              }} />
              <div style={{ fontSize: 13 }}>Analisando cabimento e razoes...</div>
            </div>
          )}

          {!loading && !recurso && (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
              <Gavel size={40} style={{ margin: '0 auto 16px', opacity: 0.3 }} aria-hidden />
              <div style={{ fontSize: 13 }}>Descreva a decisao recorrida (minimo 50 caracteres)</div>
            </div>
          )}

          {recurso && !loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {recurso.titulo && (
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: 'var(--text-primary)', margin: 0 }}>
                  {recurso.titulo}
                </h3>
              )}

              {recurso.cabimento && (
                <Section title="Cabimento">
                  <div style={cardStyle}>
                    {recurso.cabimento.fundamento_legal && <div style={row}><strong>Fundamento:</strong> {recurso.cabimento.fundamento_legal}</div>}
                    {recurso.cabimento.tempestividade && <div style={row}><strong>Tempestividade:</strong> {recurso.cabimento.tempestividade}</div>}
                    {recurso.cabimento.preparo && <div style={row}><strong>Preparo:</strong> {recurso.cabimento.preparo}</div>}
                    {recurso.cabimento.legitimidade && <div style={row}><strong>Legitimidade:</strong> {recurso.cabimento.legitimidade}</div>}
                    {recurso.cabimento.sintese && <div style={{ marginTop: 8, fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>{recurso.cabimento.sintese}</div>}
                  </div>
                </Section>
              )}

              {recurso.prequestionamento && (
                <Section title="Prequestionamento">
                  <div style={{ ...cardStyle, borderLeftColor: '#8B5CF6' }}>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{recurso.prequestionamento}</p>
                  </div>
                </Section>
              )}

              {recurso.razoes?.sintese_do_julgado && (
                <Section title="Sintese do julgado recorrido">
                  <div style={cardStyle}>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                      {recurso.razoes.sintese_do_julgado}
                    </p>
                  </div>
                </Section>
              )}

              {(recurso.razoes?.fundamentos_de_reforma?.length ?? 0) > 0 && (
                <Section title="Fundamentos de reforma">
                  {recurso.razoes?.fundamentos_de_reforma?.map((f, i) => (
                    <div key={i} style={cardStyle}>
                      {f.ponto && <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{i + 1}. {f.ponto}</div>}
                      {f.fundamento_legal && <div style={{ fontSize: 12, color: 'var(--accent)', marginBottom: 4 }}>{f.fundamento_legal}</div>}
                      {f.jurisprudencia && <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: 6 }}>{f.jurisprudencia}</div>}
                      {f.argumentacao && <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.argumentacao}</div>}
                    </div>
                  ))}
                </Section>
              )}

              {recurso.razoes?.divergencia_jurisprudencial && (
                <Section title="Divergencia jurisprudencial">
                  <div style={{ ...cardStyle, borderLeftColor: '#e67e22' }}>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{recurso.razoes.divergencia_jurisprudencial}</p>
                  </div>
                </Section>
              )}

              {(recurso.pedidos?.length ?? 0) > 0 && (
                <Section title="Pedidos">
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {recurso.pedidos?.map((p, i) => (
                      <li key={i} style={{ padding: 10, borderRadius: 6, background: 'var(--hover)', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        {i + 1}. {p}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {recurso.fechamento && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', whiteSpace: 'pre-wrap', padding: 10, borderRadius: 6, background: 'var(--hover)' }}>
                  {recurso.fechamento}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, gap: 12, flexWrap: 'wrap' }}>
                {recurso.confianca && <ConfidenceBadge confianca={recurso.confianca} />}
                <PoweredByPralvex />
              </div>
              <button
                onClick={() => { setRecurso(null); setDecisao('') }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: 10, borderRadius: 8, background: 'transparent',
                  border: '1px dashed var(--border)', color: 'var(--text-muted)',
                  fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                <RotateCcw size={14} /> Novo recurso
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .rec-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

const cardStyle: React.CSSProperties = {
  padding: 12, borderRadius: 8, background: 'var(--hover)',
  borderLeft: '3px solid var(--accent)', marginBottom: 8,
}
const row: React.CSSProperties = { fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }

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

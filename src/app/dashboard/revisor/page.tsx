'use client'

import { useState } from 'react'
import {
  FileEdit,
  AlertTriangle,
  AlertCircle,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Check,
  Clipboard,
} from 'lucide-react'
import ConfidenceBadge, { PoweredByLexAI } from '@/components/ConfidenceBadge'
import { toast } from '@/components/Toast'

interface Issue {
  titulo?: string
  trecho?: string
  problema?: string
  fundamento?: string
  sugestao?: string
}

interface Revisao {
  tipo_documento?: string
  resumo_geral?: string
  score?: number
  issues_criticos?: Issue[]
  issues_atencao?: Issue[]
  issues_sugestoes?: Issue[]
  reescrita_sugerida?: string
  clausulas_faltantes?: string[]
  confianca?: { nivel?: string; nota?: string }
}

const TIPOS = [
  'Contrato', 'Peticao', 'Parecer', 'Notificacao', 'Recurso', 'Acordo', 'Outro',
]

export default function RevisorPage() {
  const [documento, setDocumento] = useState('')
  const [tipo, setTipo] = useState('')
  const [loading, setLoading] = useState(false)
  const [revisao, setRevisao] = useState<Revisao | null>(null)
  const [copiado, setCopiado] = useState(false)

  async function revisar() {
    if (documento.trim().length < 100 || loading) return
    setLoading(true)
    setRevisao(null)
    try {
      const res = await fetch('/api/revisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documento, tipo: tipo || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro na revisao')
      setRevisao(data.revisao)
    } catch (e: unknown) {
      toast('error', e instanceof Error ? e.message : 'Erro na revisao')
    } finally {
      setLoading(false)
    }
  }

  function copiarReescrita() {
    if (!revisao?.reescrita_sugerida) return
    navigator.clipboard.writeText(revisao.reescrita_sugerida).then(() => {
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
            <FileEdit size={24} style={{ color: 'var(--accent)' }} aria-hidden />
          </div>
          <div>
            <h1 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 32, color: 'var(--text-primary)', margin: 0, fontWeight: 700,
            }}>
              Revisor
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '4px 0 0' }}>
              Revisao tecnica de contratos e pecas — criticos, atencao, sugestoes
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }} className="rev-grid">
        <div style={{
          background: 'var(--card-bg)', border: '1px solid var(--border)',
          borderRadius: 14, padding: 24,
        }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', margin: '0 0 20px' }}>
            Documento
          </h2>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Tipo de documento
            </label>
            <select value={tipo} onChange={e => setTipo(e.target.value)} style={{
              width: '100%', padding: 12, borderRadius: 8,
              border: '1px solid var(--border)', background: 'var(--bg-base)',
              color: 'var(--text-primary)', fontSize: 14, cursor: 'pointer',
            }}>
              <option value="">Detectar automaticamente</option>
              {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Cole o texto completo
            </label>
            <textarea
              value={documento}
              onChange={e => setDocumento(e.target.value)}
              maxLength={50000}
              placeholder="Cole aqui o contrato, peticao ou documento a revisar..."
              rows={14}
              style={{
                width: '100%', padding: 12, borderRadius: 8,
                border: '1px solid var(--border)', background: 'var(--bg-base)',
                color: 'var(--text-primary)', fontSize: 13, lineHeight: 1.6,
                fontFamily: 'inherit', resize: 'vertical', minHeight: 280,
              }}
            />
            <div style={{ fontSize: 11, color: documento.length < 100 ? 'var(--text-muted)' : 'var(--text-secondary)', textAlign: 'right', marginTop: 4 }}>
              {documento.length.toLocaleString('pt-BR')} / 50.000 (min. 100)
            </div>
          </div>
          <button
            onClick={revisar}
            disabled={documento.trim().length < 100 || loading}
            style={{
              width: '100%', padding: '12px 20px', borderRadius: 8,
              background: 'var(--accent)', color: 'var(--bg-base)',
              border: 'none', fontSize: 14, fontWeight: 600,
              cursor: (documento.trim().length < 100 || loading) ? 'not-allowed' : 'pointer',
              opacity: (documento.trim().length < 100 || loading) ? 0.5 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <Sparkles size={16} aria-hidden /> {loading ? 'Revisando...' : 'Revisar documento'}
          </button>
        </div>

        <div style={{
          background: 'var(--card-bg)', border: '1px solid var(--border)',
          borderRadius: 14, padding: 24, minHeight: 500,
        }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', margin: '0 0 20px' }}>
            Revisao tecnica
          </h2>

          {loading && (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
              <span style={{
                display: 'inline-block', width: 32, height: 32,
                border: '3px solid var(--border)', borderTopColor: 'var(--accent)',
                borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: 16,
              }} />
              <div style={{ fontSize: 13 }}>Analisando clausulas e identificando riscos...</div>
            </div>
          )}

          {!loading && !revisao && (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
              <FileEdit size={40} style={{ margin: '0 auto 16px', opacity: 0.3 }} aria-hidden />
              <div style={{ fontSize: 13 }}>Cole o documento (minimo 100 caracteres) para revisar</div>
            </div>
          )}

          {revisao && !loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {(revisao.tipo_documento || typeof revisao.score === 'number') && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
                  padding: 14, borderRadius: 8, background: 'var(--hover)',
                }}>
                  {revisao.tipo_documento && (
                    <span style={{
                      fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 6,
                      background: 'var(--accent-light)', color: 'var(--accent)',
                    }}>
                      {revisao.tipo_documento}
                    </span>
                  )}
                  {typeof revisao.score === 'number' && (
                    <span style={{
                      fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)',
                    }}>
                      Score tecnico: <strong style={{ color: 'var(--text-primary)', fontSize: 16 }}>{revisao.score}/100</strong>
                    </span>
                  )}
                </div>
              )}
              {revisao.resumo_geral && (
                <div style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.7 }}>
                  {revisao.resumo_geral}
                </div>
              )}

              {(revisao.issues_criticos?.length ?? 0) > 0 && (
                <IssueList
                  title="Criticos"
                  icon={<AlertTriangle size={14} />}
                  color="#c0392b"
                  bg="rgba(192,57,43,0.08)"
                  issues={revisao.issues_criticos ?? []}
                />
              )}
              {(revisao.issues_atencao?.length ?? 0) > 0 && (
                <IssueList
                  title="Atencao"
                  icon={<AlertCircle size={14} />}
                  color="#e67e22"
                  bg="rgba(230,126,34,0.08)"
                  issues={revisao.issues_atencao ?? []}
                />
              )}
              {(revisao.issues_sugestoes?.length ?? 0) > 0 && (
                <IssueList
                  title="Sugestoes"
                  icon={<Lightbulb size={14} />}
                  color="#2d8659"
                  bg="rgba(45,134,89,0.08)"
                  issues={revisao.issues_sugestoes ?? []}
                />
              )}

              {revisao.clausulas_faltantes && revisao.clausulas_faltantes.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent)', marginBottom: 10 }}>
                    Clausulas faltantes
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {revisao.clausulas_faltantes.map((c, i) => (
                      <li key={i} style={{
                        padding: 10, borderRadius: 6, background: 'var(--hover)',
                        fontSize: 13, color: 'var(--text-secondary)',
                      }}>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {revisao.reescrita_sugerida && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent)' }}>
                      Reescrita sugerida
                    </div>
                    <button onClick={copiarReescrita} style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '4px 10px', borderRadius: 6,
                      background: 'transparent', border: '1px solid var(--border)',
                      color: 'var(--text-secondary)', fontSize: 11, cursor: 'pointer',
                    }}>
                      {copiado ? <Check size={12} /> : <Clipboard size={12} />}
                      {copiado ? 'Copiado' : 'Copiar'}
                    </button>
                  </div>
                  <div style={{
                    padding: 14, borderRadius: 8, background: 'var(--bg-base)',
                    border: '1px solid var(--border)', fontSize: 13,
                    color: 'var(--text-primary)', lineHeight: 1.7,
                    whiteSpace: 'pre-wrap', maxHeight: 400, overflowY: 'auto',
                  }}>
                    {revisao.reescrita_sugerida}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, gap: 12, flexWrap: 'wrap' }}>
                {revisao.confianca && <ConfidenceBadge confianca={revisao.confianca} />}
                <PoweredByLexAI />
              </div>
              <button
                onClick={() => { setRevisao(null); setDocumento(''); setTipo('') }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: 10, borderRadius: 8, background: 'transparent',
                  border: '1px dashed var(--border)', color: 'var(--text-muted)',
                  fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                <RotateCcw size={14} /> Nova revisao
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .rev-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

function IssueList({ title, icon, color, bg, issues }: {
  title: string; icon: React.ReactNode; color: string; bg: string; issues: Issue[]
}) {
  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
        fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.08em', color,
      }}>
        {icon}
        {title} ({issues.length})
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {issues.map((issue, i) => (
          <div key={i} style={{
            padding: 12, borderRadius: 8, background: bg,
            borderLeft: `3px solid ${color}`,
          }}>
            {issue.titulo && (
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                {issue.titulo}
              </div>
            )}
            {issue.trecho && (
              <div style={{
                fontSize: 12, color: 'var(--text-muted)', marginBottom: 6,
                padding: '6px 10px', background: 'var(--bg-base)', borderRadius: 4,
                fontStyle: 'italic',
              }}>
                &ldquo;{issue.trecho}&rdquo;
              </div>
            )}
            {issue.problema && (
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, lineHeight: 1.6 }}>
                {issue.problema}
              </div>
            )}
            {issue.fundamento && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                <strong>Fundamento:</strong> {issue.fundamento}
              </div>
            )}
            {issue.sugestao && (
              <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6, marginTop: 8, paddingTop: 8, borderTop: '1px dashed var(--border)' }}>
                <strong style={{ color }}>Sugestao:</strong> {issue.sugestao}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

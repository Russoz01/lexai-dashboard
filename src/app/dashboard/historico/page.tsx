'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'

interface HistoricoItem {
  id: string
  agente: string
  mensagem_usuario: string
  resposta_agente: string | null
  tokens_usados: number | null
  created_at: string
}

const AGENTE_CORES: Record<string, { bg: string; color: string }> = {
  resumidor:    { bg: '#dbeafe', color: '#2563eb' },
  prazos:       { bg: '#fef5e7', color: '#d97706' },
  redator:      { bg: '#ede9fe', color: '#7c3aed' },
  pesquisador:  { bg: '#d1fae5', color: '#059669' },
  financeiro:   { bg: '#e8f5ee', color: '#2d6a4f' },
  rotina:       { bg: '#f1f5f9', color: '#64748b' },
  negociador:   { bg: '#fef5e7', color: '#b45309' },
  professor:    { bg: '#fce7f3', color: '#be185d' },
  orquestrador: { bg: '#e8f5ee', color: '#2d6a4f' },
}

export default function HistoricoPage() {
  const supabase = createClient()
  const [historico, setHistorico] = useState<HistoricoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [expandido, setExpandido] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('historico')
      .select('*')
      .eq('usuario_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100)

    setHistorico(data ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { carregar() }, [carregar])

  function formatarData(dt: string) {
    return new Date(dt).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  const cores = (agente: string) => AGENTE_CORES[agente] ?? { bg: '#f1f5f9', color: '#64748b' }

  return (
    <div className="page-content" style={{ maxWidth: 900 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 12, fontWeight: 600, color: '#059669',
            letterSpacing: '0.5px', textTransform: 'uppercase',
          }}>
            <i className="bi bi-chat-square-text" style={{ fontSize: 13 }} />
            Registro de Atividades
          </span>
        </div>
        <h1 className="page-title">Histórico</h1>
        <p className="page-subtitle">Todas as interações com os agentes de IA</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ animation: 'hist-spin 0.8s linear infinite', marginBottom: 8 }}>
            <circle cx="12" cy="12" r="10" stroke="var(--accent)" strokeWidth="2.5" strokeDasharray="40 20" strokeLinecap="round" />
          </svg>
          <div>Carregando...</div>
        </div>
      ) : historico.length === 0 ? (
        <div className="section-card" style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '56px 24px', textAlign: 'center', border: '1px dashed var(--border)',
        }}>
          <i className="bi bi-chat-square-text" style={{ fontSize: 36, color: 'var(--text-muted)', opacity: 0.4, marginBottom: 12 }} />
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Nenhuma interação registrada ainda</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {historico.map(item => {
            const c = cores(item.agente)
            return (
              <div key={item.id} className="section-card" style={{ padding: 0, overflow: 'hidden' }}>
                <button
                  onClick={() => setExpandido(expandido === item.id ? null : item.id)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'flex-start', gap: 12,
                    textAlign: 'left', padding: '14px 18px',
                    background: 'none', border: 'none', cursor: 'pointer',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                        background: c.bg, color: c.color,
                      }}>
                        {item.agente}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatarData(item.created_at)}</span>
                      {item.tokens_usados && (
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.tokens_usados} tokens</span>
                      )}
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.mensagem_usuario}
                    </p>
                  </div>
                  <i className={`bi bi-chevron-${expandido === item.id ? 'up' : 'down'}`}
                    style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0, marginTop: 2 }} />
                </button>

                {expandido === item.id && item.resposta_agente && (
                  <div style={{
                    padding: '14px 18px', borderTop: '1px solid var(--border)',
                    background: 'var(--hover)',
                  }}>
                    <div style={{
                      fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                      letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 8,
                    }}>
                      Resposta do agente
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0 }}>
                      {item.resposta_agente}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <style>{`@keyframes hist-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

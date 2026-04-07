'use client'

import { useState } from 'react'
import ConfidenceBadge, { PoweredByLexAI } from '@/components/ConfidenceBadge'
import { useDraft, clearDraft } from '@/hooks/useDraft'

export default function NegociadorPage() {
  const [situacao, setSituacao] = useState('')
  const [loading, setLoading] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [resultado, setResultado] = useState<any>(null)
  const [erro, setErro] = useState('')

  useDraft('lexai-draft-negociador', situacao, setSituacao)

  async function analisar() {
    if (!situacao.trim() || loading) return
    setLoading(true); setErro(''); setResultado(null)
    try {
      const res = await fetch('/api/negociar', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situacao }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResultado(data.resultado)
      clearDraft('lexai-draft-negociador')
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro na analise')
    } finally { setLoading(false) }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = resultado as any

  return (
    <div className="page-content" style={{ maxWidth: '100%' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
            Agente IA
          </span>
        </div>
        <h1 className="page-title">Negociador</h1>
        <p className="page-subtitle">Estrategia de negociacao e mediacao de conflitos juridicos</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="redator-main-grid">
        {/* Input */}
        <div className="section-card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
            Descricao do Conflito
          </div>
          <textarea value={situacao} onChange={e => setSituacao(e.target.value)}
            placeholder={"Descreva a situacao de conflito com detalhes:\n\n- Partes envolvidas\n- Objeto da disputa\n- Valor em discussao\n- Historico de tentativas de acordo\n- Posicao do seu cliente"}
            className="form-input" style={{ resize: 'vertical', minHeight: 280, fontFamily: "'DM Sans',sans-serif", fontSize: 13, lineHeight: 1.6 }} />

          {/* Cenarios pre-prontos */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
              Cenarios comuns &mdash; clique para usar como base
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {[
                { titulo: 'Trabalhista &mdash; horas extras', exemplo: 'Cliente trabalhou 3 anos como vendedor sem registro de horas extras. Reclama 18h semanais nao pagas. Empresa oferece R$ 8 mil. Calculo correto: ~R$ 35 mil. Buscamos acordo justo.' },
                { titulo: 'Aluguel &mdash; rescisao contratual', exemplo: 'Inquilino quer rescindir contrato 6 meses antes. Fiador resiste a multa. Locador exige 3 alugueis. Buscamos mediacao para reduzir multa proporcionalmente.' },
                { titulo: 'Divida bancaria &mdash; renegociacao', exemplo: 'Cliente devedor de R$ 45 mil em cartao com juros abusivos. Banco oferece parcelar em 24x sem desconto. Buscamos revisao de juros e parcelamento em 36x com descontos.' },
                { titulo: 'Civil &mdash; danos morais', exemplo: 'Cliente teve nome negativado indevidamente por servico nao contratado. Empresa nega responsabilidade. Buscamos acordo extrajudicial: indenizacao + retirada do nome.' },
                { titulo: 'Empresarial &mdash; quebra de contrato', exemplo: 'Fornecedor descumpriu prazo de entrega causando perda de R$ 200 mil. Multa contratual prevista de 10%. Buscamos acordo com pagamento parcelado da multa + ressarcimento dos danos.' },
                { titulo: 'Familia &mdash; pensao alimenticia', exemplo: 'Pai busca reduzir pensao apos perda de emprego. Mae quer manter valor atual. Filho de 8 anos. Renda atual do pai caiu 60%. Buscamos acordo proporcional a renda.' },
              ].map((ex, i) => (
                <button key={i} type="button" onClick={() => setSituacao(ex.exemplo)}
                  style={{
                    textAlign: 'left', padding: '10px 12px', borderRadius: 8,
                    background: 'var(--hover)', border: '1px solid var(--border)',
                    color: 'var(--text-secondary)', cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif", fontSize: 12, lineHeight: 1.4,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }} dangerouslySetInnerHTML={{ __html: ex.titulo }} />
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Clique para aplicar este modelo</div>
                </button>
              ))}
            </div>
          </div>

          {/* Dicas para uma negociacao eficaz */}
          <div style={{ marginTop: 16, padding: '14px 16px', borderRadius: 10, background: 'var(--accent-light)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <i className="bi bi-lightbulb-fill" />Dicas para uma negociacao eficaz
            </div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              <li><strong>Conheca seu BATNA</strong> &mdash; melhor alternativa caso a negociacao falhe</li>
              <li><strong>Identifique a ZOPA</strong> &mdash; a zona onde os interesses das partes se sobrepoem</li>
              <li><strong>Separe pessoas de problemas</strong> &mdash; foque em interesses, nao em posicoes</li>
              <li><strong>Use criterios objetivos</strong> &mdash; valores de mercado, jurisprudencia, leis</li>
              <li><strong>Documente tudo</strong> &mdash; registre as concessoes feitas e propostas trocadas</li>
              <li><strong>Tenha um plano B</strong> &mdash; medidas judiciais como ultimo recurso</li>
            </ul>
          </div>
          {erro && (
            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--danger-light)', color: 'var(--danger)', fontSize: 13, marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="bi bi-exclamation-triangle-fill" /> {erro}
            </div>
          )}
          <button onClick={analisar} disabled={!situacao.trim() || loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>
            {loading ? <><span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Analisando estrategia...</>
              : <><i className="bi bi-lightning" /> Analisar Negociacao</>}
          </button>
        </div>

        {/* Output */}
        <div className="section-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Estrategia de Negociacao
            </div>
            {r && <ConfidenceBadge confianca={r?.confianca} />}
          </div>
          {loading ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--text-muted)', minHeight: 280 }}>
              <span style={{ display: 'inline-block', width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <div style={{ fontWeight: 600 }}>Elaborando estrategia...</div>
            </div>
          ) : r ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, overflowY: 'auto', maxHeight: 600 }}>
              {r.zopa ? <div style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--accent-light)', borderLeft: '3px solid var(--accent)' }}><strong style={{ color: 'var(--accent)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Zona de Acordo (ZOPA)</strong><p style={{ marginTop: 6 }}>{String(r.zopa)}</p></div> : null}
              {r.estrategia && typeof r.estrategia === 'object' && (
                <div style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--hover)' }}>
                  <strong style={{ color: 'var(--text-primary)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Estrategia Recomendada</strong>
                  <div style={{ marginTop: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: 'var(--accent-light)', color: 'var(--accent)' }}>{(r.estrategia as any).tipo}</span>
                  </div>
                  <p style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>{(r.estrategia as any).abordagem}</p>
                </div>
              )}
              {Array.isArray(r.cenarios) && r.cenarios.length > 0 && (
                <div style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--hover)' }}>
                  <strong style={{ color: 'var(--text-primary)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Cenarios</strong>
                  <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {(r.cenarios as any[]).map((c, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: c.risco === 'Alto' ? 'var(--danger-light)' : c.risco === 'Medio' ? 'var(--warning-light)' : 'var(--success-light)', color: c.risco === 'Alto' ? 'var(--danger)' : c.risco === 'Medio' ? 'var(--warning)' : 'var(--success)' }}>{c.risco}</span>
                        <span style={{ flex: 1, fontWeight: 500 }}>{c.cenario}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.probabilidade}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {r.proposta_acordo ? <div style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--hover)', whiteSpace: 'pre-wrap' }}><strong style={{ color: 'var(--text-primary)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>Proposta de Acordo</strong>{String(r.proposta_acordo)}</div> : null}
              <button onClick={() => { setResultado(null); setSituacao('') }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: 11, background: 'none', border: '1px dashed var(--border)', borderRadius: 10, color: 'var(--text-muted)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                <i className="bi bi-arrow-counterclockwise" /> Nova analise
              </button>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <PoweredByLexAI />
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--text-muted)', minHeight: 280 }}>
              <i className="bi bi-lightning" style={{ fontSize: 40, opacity: 0.3 }} />
              <span style={{ fontSize: 13, textAlign: 'center' }}>Descreva a situacao de conflito<br />e clique em Analisar</span>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

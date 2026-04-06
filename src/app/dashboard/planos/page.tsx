'use client'

import { useState, useEffect } from 'react'

const PLANOS_BASE = [
  {
    id: 'starter', nome: 'Starter', precoMensal: 59, precoAnual: 48,
    features: [
      { label: 'Agentes disponiveis', valor: '3 (Resumidor, Pesquisador, Professor)', disponivel: true },
      { label: 'Documentos/mes', valor: '50', disponivel: true },
      { label: 'Suporte', valor: 'FAQ apenas', disponivel: true },
      { label: 'API propria', valor: '', disponivel: false },
      { label: 'Exportacao PDF', valor: '', disponivel: false },
      { label: 'Historico', valor: '30 dias', disponivel: true },
      { label: 'Modelos customizados', valor: '', disponivel: false },
    ],
  },
  {
    id: 'pro', nome: 'Pro', precoMensal: 119, precoAnual: 98,
    features: [
      { label: 'Agentes disponiveis', valor: '6 (todos os basicos)', disponivel: true },
      { label: 'Documentos/mes', valor: '200', disponivel: true },
      { label: 'Suporte', valor: 'Email (48h)', disponivel: true },
      { label: 'API propria', valor: '', disponivel: false },
      { label: 'Exportacao PDF', valor: '', disponivel: true },
      { label: 'Historico', valor: '90 dias', disponivel: true },
      { label: 'Modelos customizados', valor: '', disponivel: false },
    ],
  },
  {
    id: 'enterprise', nome: 'Enterprise', precoMensal: 239, precoAnual: 196,
    features: [
      { label: 'Agentes disponiveis', valor: '10 (todos + exclusivos)', disponivel: true },
      { label: 'Documentos/mes', valor: 'Ilimitado', disponivel: true },
      { label: 'Suporte', valor: 'Prioritario (24h) + WhatsApp', disponivel: true },
      { label: 'API propria', valor: '', disponivel: true },
      { label: 'Exportacao PDF', valor: '', disponivel: true },
      { label: 'Historico', valor: 'Ilimitado', disponivel: true },
      { label: 'Modelos customizados', valor: '', disponivel: true },
    ],
  },
]

const BENEFICIOS_ENTERPRISE = [
  'Onboarding dedicado com especialista juridico',
  'Acesso antecipado a novos agentes e funcionalidades',
  'SLA de resposta garantido em 4h para chamados criticos',
  'Treinamento personalizado para sua equipe',
]

function getDestaqueId(planoAtual: string): string {
  if (planoAtual === 'starter') return 'pro'
  if (planoAtual === 'pro') return 'enterprise'
  return 'enterprise'
}

function getBadgeLabel(planoId: string, planoAtual: string): string | null {
  const destaqueId = getDestaqueId(planoAtual)
  if (planoId !== destaqueId) return null
  if (planoAtual === 'enterprise') return 'SEU PLANO PREMIUM'
  return 'MAIS POPULAR'
}

function getCtaLabel(planoId: string, planoAtual: string, precoPlano: number, precoAtual: number): string {
  if (planoId === planoAtual) return '\u2713  Voce esta aqui'
  if (precoPlano > precoAtual) return 'Comecar agora'
  return 'Reduzir plano'
}

export default function PlanosPage() {
  const [planoAtual, setPlanoAtual] = useState('enterprise')
  const [ciclo, setCiclo] = useState<'mensal' | 'anual'>('mensal')

  useEffect(() => {
    const saved = localStorage.getItem('lexai-plano')
    if (saved) setPlanoAtual(saved)
    else localStorage.setItem('lexai-plano', 'enterprise')
  }, [])

  const precoAtual = PLANOS_BASE.find(p => p.id === planoAtual)?.precoMensal || 0
  const destaqueId = getDestaqueId(planoAtual)

  return (
    <div className="page-content" style={{ maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ marginBottom: 12, textAlign: 'center' }}>
        <h1 className="page-title" style={{ fontSize: 32 }}>Planos LexAI</h1>
        <p className="page-subtitle" style={{ maxWidth: 500, margin: '8px auto 0' }}>
          Escolha o plano ideal para sua pratica juridica. Upgrade ou downgrade a qualquer momento.
        </p>
      </div>

      {/* Social proof bar */}
      <div style={{
        textAlign: 'center', margin: '0 auto 24px', padding: '10px 20px',
        background: 'var(--accent-light)',
        borderRadius: 10, border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        <i className="bi bi-shield-check" style={{ color: 'var(--accent)', fontSize: 15 }} />
        <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
          Mais de <strong style={{ color: 'var(--accent)' }}>200 documentos</strong> revisados e analisados
        </span>
      </div>

      {/* Billing cycle toggle */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 28,
      }}>
        <span style={{
          fontSize: 13, fontWeight: ciclo === 'mensal' ? 700 : 500,
          color: ciclo === 'mensal' ? 'var(--text-primary)' : 'var(--text-muted)',
          cursor: 'pointer', transition: 'all 0.15s',
        }} onClick={() => setCiclo('mensal')}>
          Mensal
        </span>
        <div
          onClick={() => setCiclo(ciclo === 'mensal' ? 'anual' : 'mensal')}
          style={{
            width: 44, height: 24, borderRadius: 12, cursor: 'pointer',
            background: ciclo === 'anual' ? 'var(--accent)' : 'var(--border)',
            position: 'relative', transition: 'background 0.2s',
          }}
        >
          <div style={{
            width: 18, height: 18, borderRadius: '50%', background: '#fff',
            position: 'absolute', top: 3,
            left: ciclo === 'anual' ? 23 : 3,
            transition: 'left 0.2s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }} />
        </div>
        <span style={{
          fontSize: 13, fontWeight: ciclo === 'anual' ? 700 : 500,
          color: ciclo === 'anual' ? 'var(--text-primary)' : 'var(--text-muted)',
          cursor: 'pointer', transition: 'all 0.15s',
        }} onClick={() => setCiclo('anual')}>
          Anual
        </span>
        {ciclo === 'anual' && (
          <span style={{
            fontSize: 11, fontWeight: 700, color: '#0f1923',
            background: 'linear-gradient(135deg, #c9a84c, #d4b86a)',
            padding: '3px 10px', borderRadius: 20,
            animation: 'fadeIn 0.2s',
          }}>
            Economize 18%
          </span>
        )}
      </div>

      {/* Plan cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 24 }}>
        {PLANOS_BASE.map(plano => {
          const isDestaque = plano.id === destaqueId
          const badgeLabel = getBadgeLabel(plano.id, planoAtual)
          const preco = ciclo === 'anual' ? plano.precoAnual : plano.precoMensal
          const isCurrentPlan = plano.id === planoAtual
          const isEnterprisePremium = plano.id === 'enterprise' && planoAtual === 'enterprise'

          return (
            <div key={plano.id} className="section-card animate-in" style={{
              padding: 0, overflow: 'hidden', position: 'relative',
              border: isEnterprisePremium
                ? '2px solid transparent'
                : isDestaque
                  ? '2px solid var(--accent)'
                  : '1px solid var(--border)',
              boxShadow: isEnterprisePremium
                ? '0 8px 32px rgba(201,168,76,0.2)'
                : isDestaque
                  ? '0 8px 32px rgba(201,168,76,0.15)'
                  : undefined,
              backgroundImage: isEnterprisePremium
                ? 'linear-gradient(var(--card-bg), var(--card-bg)), linear-gradient(135deg, #c9a84c, #3b82f6, #c9a84c)'
                : undefined,
              backgroundOrigin: isEnterprisePremium ? 'border-box' : undefined,
              backgroundClip: isEnterprisePremium ? 'padding-box, border-box' : undefined,
            }}>
              {/* Badge */}
              {badgeLabel && (
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0,
                  background: isEnterprisePremium
                    ? 'linear-gradient(135deg, #c9a84c, #3b82f6)'
                    : 'linear-gradient(135deg, #c9a84c, #d4b86a)',
                  padding: '6px 0', textAlign: 'center',
                  fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase',
                  color: '#fff',
                }}>
                  {badgeLabel}
                </div>
              )}

              <div style={{ padding: badgeLabel ? '52px 24px 28px' : '28px 24px' }}>
                {/* Name */}
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.3px' }}>{plano.nome}</div>

                  {/* Price */}
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4 }}>
                    <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>R$</span>
                    <span style={{
                      fontSize: 40, fontWeight: 800, letterSpacing: '-1px', fontVariantNumeric: 'tabular-nums',
                      color: isDestaque ? 'var(--accent)' : 'var(--text-primary)',
                    }}>
                      {preco}
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>/mes</span>
                  </div>
                  {ciclo === 'anual' && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      <span style={{ textDecoration: 'line-through', marginRight: 6 }}>R$ {plano.precoMensal}</span>
                      <span style={{ color: 'var(--success)', fontWeight: 600 }}>-18%</span>
                    </div>
                  )}
                </div>

                {/* Features */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                  {plano.features.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                      <span style={{
                        width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 11,
                        background: f.disponivel ? 'var(--success-light)' : 'var(--hover)',
                        color: f.disponivel ? 'var(--success)' : 'var(--text-muted)',
                      }}>
                        <i className={`bi ${f.disponivel ? 'bi-check' : 'bi-x'}`} />
                      </span>
                      <span style={{ color: f.disponivel ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: f.disponivel ? 500 : 400 }}>
                        {f.label}{f.valor ? `: ${f.valor}` : ''}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <button style={{
                  width: '100%', padding: '12px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: isCurrentPlan ? 'default' : 'pointer',
                  fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: isCurrentPlan
                    ? 'var(--hover)'
                    : isDestaque
                      ? 'linear-gradient(135deg, #c9a84c, #d4b86a)'
                      : 'var(--primary)',
                  color: isCurrentPlan
                    ? 'var(--text-muted)'
                    : isDestaque
                      ? '#0f1923'
                      : '#fff',
                  border: isCurrentPlan ? '1px solid var(--border)' : 'none',
                }} disabled={isCurrentPlan}
                onClick={() => {
                  if (!isCurrentPlan) {
                    setPlanoAtual(plano.id)
                    localStorage.setItem('lexai-plano', plano.id)
                    window.location.reload()
                  }
                }}>
                  {getCtaLabel(plano.id, planoAtual, plano.precoMensal, precoAtual)}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Enterprise exclusive benefits (shown only when user is on Enterprise) */}
      {planoAtual === 'enterprise' && (
        <div className="section-card animate-in" style={{
          padding: '20px 28px', marginBottom: 40,
          border: '1px solid rgba(201,168,76,0.25)',
          background: 'linear-gradient(135deg, rgba(201,168,76,0.04), rgba(59,130,246,0.03))',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16,
          }}>
            <i className="bi bi-gem" style={{ color: 'var(--accent)', fontSize: 18 }} />
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              Beneficios Exclusivos Enterprise
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {BENEFICIOS_ENTERPRISE.map((b, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10, fontSize: 13,
                color: 'var(--text-secondary)', padding: '8px 12px',
                background: 'rgba(201,168,76,0.05)', borderRadius: 8,
              }}>
                <i className="bi bi-star-fill" style={{ color: 'var(--accent)', fontSize: 10, flexShrink: 0 }} />
                {b}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Spacer when not enterprise */}
      {planoAtual !== 'enterprise' && <div style={{ marginBottom: 40 }} />}

      {/* FAQ */}
      <div className="section-card" style={{ padding: '24px 28px' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>Perguntas Frequentes</div>
        {[
          { q: 'Posso trocar de plano a qualquer momento?', a: 'Sim, voce pode fazer upgrade ou downgrade do seu plano a qualquer momento. A diferenca sera calculada proporcionalmente.' },
          { q: 'Como funciona o limite de documentos?', a: 'Cada analise de documento, pesquisa ou geracao de peca conta como 1 documento. O contador reseta no inicio de cada mes.' },
          { q: 'O que acontece quando atinjo o limite?', a: 'Voce recebera um aviso e podera fazer upgrade do plano ou aguardar o proximo ciclo mensal.' },
          { q: 'Os agentes IA sao diferentes entre os planos?', a: 'Sim. O plano Starter inclui 3 agentes basicos. O Pro inclui 6 agentes. O Enterprise inclui todos os 10 agentes atuais e acesso prioritario a novos agentes exclusivos.' },
          { q: 'Qual a vantagem do plano anual?', a: 'No plano anual voce economiza 20% em relacao ao pagamento mensal, alem de garantir o preco fixo por 12 meses sem reajustes.' },
        ].map((item, i) => (
          <div key={i} style={{ padding: '14px 0', borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>{item.q}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item.a}</div>
          </div>
        ))}
      </div>

      {/* Contact */}
      <div style={{ textAlign: 'center', marginTop: 24, padding: '20px 0', color: 'var(--text-muted)', fontSize: 13 }}>
        Duvidas? Entre em contato: luizfernandoleonardoleonardo@gmail.com | (34) 99302-6456
      </div>
    </div>
  )
}

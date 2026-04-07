'use client'

import { useState, useEffect } from 'react'

const PLANOS_BASE = [
  {
    id: 'starter', nome: 'Starter', tagline: 'Para estudantes e iniciantes',
    precoMensal: 59, precoAnual: 48,
    stripeLink: 'https://buy.stripe.com/test_dRm4gy6gG1Nb2T14ZA2oE01',
    economiaReal: 'Economize 12h por semana em pesquisas',
    features: [
      { label: '3 agentes essenciais (Resumidor, Pesquisador, Professor)', disponivel: true },
      { label: '50 analises de documentos por mes', disponivel: true },
      { label: 'Historico de 30 dias', disponivel: true },
      { label: 'Suporte via FAQ', disponivel: true },
      { label: 'Exportacao em PDF', disponivel: false },
      { label: 'API propria para integracao', disponivel: false },
      { label: 'Modelos customizados', disponivel: false },
    ],
  },
  {
    id: 'pro', nome: 'Pro', tagline: 'Para advogados autonomos',
    precoMensal: 119, precoAnual: 98,
    stripeLink: 'https://buy.stripe.com/test_9B69ASawWajH5192Rs2oE02',
    economiaReal: 'Economia de R$ 3.200/mes em horas de trabalho',
    features: [
      { label: '6 agentes especializados para pratica diaria', disponivel: true },
      { label: '200 analises de documentos por mes', disponivel: true },
      { label: 'Historico estendido de 90 dias', disponivel: true },
      { label: 'Suporte por email em ate 48h', disponivel: true },
      { label: 'Exportacao em PDF profissional', disponivel: true },
      { label: 'API propria para integracao', disponivel: false },
      { label: 'Modelos customizados', disponivel: false },
    ],
  },
  {
    id: 'enterprise', nome: 'Enterprise', tagline: 'Para escritorios e bancas',
    precoMensal: 239, precoAnual: 196,
    stripeLink: 'https://buy.stripe.com/test_cNicN434u0J7fFN1No2oE03',
    economiaReal: 'ROI de 8x sobre o investimento mensal',
    features: [
      { label: 'Todos os 10 agentes + exclusivos', disponivel: true },
      { label: 'Analises ilimitadas', disponivel: true },
      { label: 'Historico ilimitado e backup em nuvem', disponivel: true },
      { label: 'Suporte prioritario via WhatsApp 24h', disponivel: true },
      { label: 'Exportacao em PDF profissional', disponivel: true },
      { label: 'API propria para integracao', disponivel: true },
      { label: 'Modelos customizados da sua banca', disponivel: true },
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
  if (precoPlano > precoAtual) return 'Iniciar 2 dias gratis'
  return 'Mudar para este plano'
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
      {/* Header — marketing-focused */}
      <div style={{ marginBottom: 16, textAlign: 'center' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 11, fontWeight: 700, color: 'var(--accent)',
          letterSpacing: '1px', textTransform: 'uppercase',
          padding: '5px 12px', borderRadius: 20,
          background: 'var(--accent-light)', border: '1px solid var(--border)', marginBottom: 16,
        }}>
          <i className="bi bi-lightning-charge-fill" />Oferta de lancamento &mdash; 2 dias gratis sem cartao
        </span>
        <h1 className="page-title" style={{ fontSize: 36, marginBottom: 8 }}>
          Trabalhe <span style={{ color: 'var(--accent)' }}>10x mais rapido</span> no Direito
        </h1>
        <p className="page-subtitle" style={{ maxWidth: 580, margin: '8px auto 0', fontSize: 15 }}>
          Pare de gastar horas com pesquisas manuais. Comece hoje, cancele quando quiser, sem multas nem burocracia.
        </p>
      </div>

      {/* Trust bar — multiple signals */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10,
        margin: '0 auto 24px', maxWidth: 760,
      }} className="trust-grid">
        {[
          { icon: 'bi-shield-lock-fill', label: 'LGPD compliant', sub: 'Dados criptografados' },
          { icon: 'bi-credit-card-2-back-fill', label: 'Pagamento Stripe', sub: '100% seguro' },
          { icon: 'bi-arrow-counterclockwise', label: 'Cancele quando quiser', sub: 'Sem multas' },
          { icon: 'bi-headset', label: 'Suporte em PT-BR', sub: 'Resposta rapida' },
        ].map((t, i) => (
          <div key={i} className="section-card" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <i className={`bi ${t.icon}`} style={{ color: 'var(--accent)', fontSize: 18, flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{t.label}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{t.sub}</div>
            </div>
          </div>
        ))}
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
                {/* Name + tagline */}
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, letterSpacing: '-0.3px' }}>{plano.nome}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>{plano.tagline}</div>

                  {/* Price */}
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4 }}>
                    <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>R$</span>
                    <span style={{
                      fontSize: 44, fontWeight: 800, letterSpacing: '-1px', fontVariantNumeric: 'tabular-nums',
                      color: isDestaque ? 'var(--accent)' : 'var(--text-primary)',
                    }}>
                      {preco}
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>/mes</span>
                  </div>
                  {ciclo === 'anual' && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      <span style={{ textDecoration: 'line-through', marginRight: 6 }}>R$ {plano.precoMensal}</span>
                      <span style={{ color: 'var(--success)', fontWeight: 600 }}>-18% no anual</span>
                    </div>
                  )}
                  {/* Economia real — value driver */}
                  <div style={{
                    marginTop: 12, padding: '8px 12px', borderRadius: 8,
                    background: 'var(--accent-light)', border: '1px solid var(--border)',
                    fontSize: 11, fontWeight: 600, color: 'var(--accent)',
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                  }}>
                    <i className="bi bi-graph-up-arrow" />{plano.economiaReal}
                  </div>
                </div>

                {/* Features */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
                  {plano.features.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13 }}>
                      <span style={{
                        width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 11,
                        background: f.disponivel ? 'var(--success-light)' : 'var(--hover)',
                        color: f.disponivel ? 'var(--success)' : 'var(--text-muted)',
                        marginTop: 1,
                      }}>
                        <i className={`bi ${f.disponivel ? 'bi-check' : 'bi-x'}`} />
                      </span>
                      <span style={{ color: f.disponivel ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: f.disponivel ? 500 : 400, lineHeight: 1.4 }}>
                        {f.label}
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
                  if (!isCurrentPlan && plano.stripeLink) {
                    // Open Stripe checkout for upgrade
                    window.open(plano.stripeLink, '_blank')
                    // Also update local plan state
                    setPlanoAtual(plano.id)
                    localStorage.setItem('lexai-plano', plano.id)
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
      {planoAtual !== 'enterprise' && <div style={{ marginBottom: 24 }} />}

      {/* Before/After comparison — classic marketing tactic */}
      <div className="section-card" style={{ padding: '28px 32px', marginBottom: 24 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>
            A diferenca na pratica
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            Advogado sem LexAI <span style={{ color: 'var(--text-muted)', margin: '0 8px' }}>vs</span> Advogado com LexAI
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="compare-grid">
          <div style={{ padding: 20, borderRadius: 12, background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, color: '#EF4444', fontWeight: 700, fontSize: 13 }}>
              <i className="bi bi-x-circle-fill" /> SEM LEXAI
            </div>
            {[
              '3 horas lendo um contrato de 40 paginas',
              'Pesquisa manual em 5 sites diferentes',
              'Peticao escrita do zero toda semana',
              'Calculos de prazos em planilha',
              'Risco de perder jurisprudencia relevante',
              'Custo alto de estagiarios para tarefas repetitivas',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.5 }}>
                <i className="bi bi-dash-circle" style={{ color: '#EF4444', marginTop: 3, flexShrink: 0, fontSize: 11 }} />
                {item}
              </div>
            ))}
          </div>
          <div style={{ padding: 20, borderRadius: 12, background: 'var(--accent-light)', border: '1px solid rgba(201,168,76,0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, color: 'var(--accent)', fontWeight: 700, fontSize: 13 }}>
              <i className="bi bi-check-circle-fill" /> COM LEXAI
            </div>
            {[
              'Analise completa em 45 segundos com riscos identificados',
              'Pesquisa em STF, STJ e tribunais em um clique',
              '6 templates prontos (peticao, recurso, contestacao...)',
              'Prazos calculados automaticamente com base no CPC',
              'IA nao esquece nenhuma sumula relevante',
              'Sua equipe focada em estrategia, nao em repeticao',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--text-primary)', marginBottom: 8, lineHeight: 1.5, fontWeight: 500 }}>
                <i className="bi bi-check-circle-fill" style={{ color: 'var(--accent)', marginTop: 3, flexShrink: 0, fontSize: 11 }} />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

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

'use client'

import { useState, useEffect } from 'react'

const PLANOS_BASE = [
  {
    id: 'starter', nome: 'Escritorio', tagline: '1–5 advogados',
    precoMensal: 1399,
    perSeat: true,
    stripeLink: 'https://buy.stripe.com/test_dRm4gy6gG1Nb2T14ZA2oE01',
    economiaReal: 'Recupere 12h por semana em pesquisas por advogado',
    features: [
      { label: '5 agentes (Resumidor, Pesquisador, Redator, Calculador, Monitor Legislativo)', disponivel: true },
      { label: '200 documentos por mes', disponivel: true },
      { label: 'Historico de 45 dias', disponivel: true },
      { label: 'Suporte por email em 24h', disponivel: true },
      { label: 'Exportacao em PDF', disponivel: false },
      { label: 'API propria para integracao', disponivel: false },
      { label: 'Agentes customizados', disponivel: false },
    ],
  },
  {
    id: 'pro', nome: 'Firma', tagline: '6–15 advogados · Mais escolhido',
    precoMensal: 1459,
    perSeat: true,
    stripeLink: 'https://buy.stripe.com/test_9B69ASawWajH5192Rs2oE02',
    economiaReal: 'Capacidade de atendimento +40% sem contratar',
    features: [
      { label: 'Todos os 12 agentes especializados', disponivel: true },
      { label: 'Documentos ilimitados', disponivel: true },
      { label: 'Historico de 90 dias', disponivel: true },
      { label: 'Suporte prioritario em 3h', disponivel: true },
      { label: 'Exportacao em PDF profissional', disponivel: true },
      { label: 'Sessao de onboarding dedicada', disponivel: true },
      { label: 'Compra avulsa de tokens', disponivel: true },
    ],
  },
  {
    id: 'enterprise', nome: 'Enterprise', tagline: '16+ advogados',
    precoMensal: 1599,
    perSeat: true,
    stripeLink: 'https://buy.stripe.com/test_cNicN434u0J7fFN1No2oE03',
    economiaReal: 'ROI de 8x sobre o investimento mensal',
    features: [
      { label: 'Agentes customizados para o escritorio', disponivel: true },
      { label: 'Analises ilimitadas + fair use', disponivel: true },
      { label: 'Historico ilimitado e backup em nuvem', disponivel: true },
      { label: 'Suporte via WhatsApp 24h + Gerente dedicado', disponivel: true },
      { label: 'API privada + SLA de uptime', disponivel: true },
      { label: 'Opcao on-premise', disponivel: true },
      { label: 'DPA incluso', disponivel: true },
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
  // Downgrade: current plan is more expensive than target
  if (precoAtual > precoPlano) return 'Mudar para este plano'
  if (planoId === 'starter' || planoId === 'escritorio') return 'Comecar 7 dias gratis'
  if (precoPlano > precoAtual) return 'Agendar demonstracao'
  return 'Mudar para este plano'
}

export default function PlanosPage() {
  const [planoAtual, setPlanoAtual] = useState('enterprise')

  useEffect(() => {
    const saved = localStorage.getItem('lexai-plano')
    if (saved) setPlanoAtual(saved)
    else localStorage.setItem('lexai-plano', 'enterprise')
  }, [])

  async function abrirPortal() {
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert('Nao foi possivel abrir o portal. Tente novamente.')
    } catch { alert('Erro ao abrir portal de pagamento') }
  }

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
          <i className="bi bi-lightning-charge-fill" />Oferta de lancamento &mdash; 7 dias gratis sem cartao
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

      {/* Pricing model note */}
      <div style={{
        textAlign: 'center', marginBottom: 28, fontSize: 13,
        color: 'var(--text-secondary)', letterSpacing: '0.2px',
      }}>
        Cobranca <strong style={{ color: 'var(--accent)' }}>por advogado registrado</strong> · De R$ 1.399 a R$ 1.599 conforme o plano
      </div>

      {/* Plan cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 24 }}>
        {PLANOS_BASE.map(plano => {
          const isDestaque = plano.id === destaqueId
          const badgeLabel = getBadgeLabel(plano.id, planoAtual)
          const preco = plano.precoMensal
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
                ? 'linear-gradient(var(--card-bg), var(--card-bg)), linear-gradient(135deg, #c9a84c, #bfa68e, #c9a84c)'
                : undefined,
              backgroundOrigin: isEnterprisePremium ? 'border-box' : undefined,
              backgroundClip: isEnterprisePremium ? 'padding-box, border-box' : undefined,
            }}>
              {/* Badge */}
              {badgeLabel && (
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0,
                  background: isEnterprisePremium
                    ? 'linear-gradient(135deg, #c9a84c, #bfa68e)'
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
                      {preco.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    por advogado / mes
                  </div>
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
                      : 'var(--accent)',
                  color: isCurrentPlan
                    ? 'var(--text-muted)'
                    : isDestaque
                      ? '#0f1923'
                      : 'var(--bg-base)',
                  border: isCurrentPlan ? '1px solid var(--border)' : 'none',
                }} disabled={isCurrentPlan}
                onClick={() => {
                  if (!isCurrentPlan) {
                    if (plano.stripeLink) {
                      // Open Stripe checkout for upgrade
                      window.open(plano.stripeLink, '_blank')
                      // Also update local plan state
                      setPlanoAtual(plano.id)
                      localStorage.setItem('lexai-plano', plano.id)
                    } else if (plano.id === 'starter' || plano.id === 'escritorio') {
                      window.location.href = '/login'
                    }
                  }
                }}>
                  {getCtaLabel(plano.id, planoAtual, plano.precoMensal, precoAtual)}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Gerenciar minha assinatura — Stripe portal */}
      <div className="section-card animate-in" style={{
        padding: '20px 28px', marginBottom: 20,
        display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12, flexShrink: 0,
          background: 'var(--accent-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <i className="bi bi-credit-card" style={{ fontSize: 22, color: 'var(--accent)' }} />
        </div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            Gerenciar pagamento e assinatura
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Atualize cartao, baixe faturas, faca downgrade ou cancele a qualquer momento via Stripe.
          </div>
        </div>
        <button type="button" onClick={abrirPortal} className="btn-primary" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, flexShrink: 0,
        }}>
          <i className="bi bi-credit-card" />
          Abrir portal Stripe
        </button>
      </div>

      {/* Enterprise exclusive benefits (shown only when user is on Enterprise) */}
      {planoAtual === 'enterprise' && (
        <div className="section-card animate-in" style={{
          padding: '20px 28px', marginBottom: 40,
          border: '1px solid rgba(201,168,76,0.25)',
          background: 'linear-gradient(135deg, rgba(201,168,76,0.04), rgba(191,166,142,0.05))',
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

      {/* Testimonials — social proof */}
      <div className="section-card" style={{ padding: '28px 32px', marginBottom: 24 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>
            <i className="bi bi-stars" style={{ marginRight: 6 }} />Quem ja usa esta amando
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            Resultados reais de quem testou
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="compare-grid">
          {[
            {
              nome: 'Mariana Castro',
              cargo: 'Advogada Civil — SP',
              foto: 'MC',
              cor: '#44372b',
              estrelas: 5,
              texto: 'Em 2 semanas economizei mais de 20 horas que eu gastava em pesquisa de jurisprudencia. O Pesquisador encontra acordaos que eu nem sabia que existiam.',
            },
            {
              nome: 'Dr. Pedro Henrique',
              cargo: 'Socio — PHM Advogados',
              foto: 'PH',
              cor: '#10B981',
              estrelas: 5,
              texto: 'O Calculador e o Monitor Legislativo mudaram a forma como gerenciamos prazos. Zero perda processual desde que adotamos a plataforma no escritorio.',
            },
            {
              nome: 'Renata Lima',
              cargo: 'Sócia — Lima Advocacia',
              foto: 'RL',
              cor: '#8B5CF6',
              estrelas: 5,
              texto: 'Substituiu 2 estagiarios e ainda entrega mais rapido. O Redator gera peticoes que so precisam de pequenos ajustes. Investimento que se pagou em 1 mes.',
            },
          ].map((t, i) => (
            <div key={i} style={{ padding: 20, borderRadius: 12, background: 'var(--card-bg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 2, color: '#F59E0B' }}>
                {Array.from({ length: t.estrelas }).map((_, j) => (
                  <i key={j} className="bi bi-star-fill" style={{ fontSize: 12 }} />
                ))}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, fontStyle: 'italic' }}>
                &ldquo;{t.texto}&rdquo;
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 'auto', paddingTop: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${t.cor}, ${t.cor}aa)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                  {t.foto}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{t.nome}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.cargo}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Money-back guarantee — risk reversal */}
      <div className="section-card" style={{
        padding: '28px 32px',
        marginBottom: 24,
        background: 'linear-gradient(135deg, var(--accent-light), rgba(16,185,129,0.04))',
        border: '1px solid rgba(16,185,129,0.20)',
        textAlign: 'center',
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', background: 'rgba(16,185,129,0.12)', marginBottom: 14 }}>
          <i className="bi bi-shield-check" style={{ fontSize: 30, color: '#10B981' }} />
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.5px' }}>
          Garantia de 7 dias ou seu dinheiro de volta
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto', lineHeight: 1.6 }}>
          Teste todos os agentes sem risco. Se a LexAI nao economizar pelo menos 5 horas do seu trabalho na primeira semana, devolvemos 100% do valor. Sem perguntas, sem burocracia.
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 18, flexWrap: 'wrap' }}>
          {[
            { icon: 'bi-clock-history', text: '7 dias para testar' },
            { icon: 'bi-arrow-counterclockwise', text: 'Reembolso em 24h' },
            { icon: 'bi-emoji-smile', text: 'Sem perguntas' },
          ].map((g, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>
              <i className={`bi ${g.icon}`} style={{ color: '#10B981', fontSize: 14 }} />
              {g.text}
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA — urgency + scarcity */}
      <div className="section-card" style={{
        padding: '36px 32px',
        marginBottom: 24,
        background: 'linear-gradient(135deg, rgba(201,168,76,0.10), rgba(191,166,142,0.10))',
        border: '1px solid rgba(201,168,76,0.30)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          Vagas limitadas para o lancamento
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10, letterSpacing: '-0.8px' }}>
          Pronto para acabar com as horas perdidas?
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 540, margin: '0 auto 24px', lineHeight: 1.6 }}>
          Junte-se aos primeiros escritorios que ja transformaram sua rotina. Comece em 30 segundos &mdash; sem cartao de credito.
        </div>
        <button type="button" onClick={() => {
          const link = PLANOS_BASE.find(p => p.id === destaqueId)?.stripeLink
          if (link) window.open(link, '_blank')
        }} style={{
          padding: '14px 32px', borderRadius: 12, fontSize: 15, fontWeight: 700,
          background: 'linear-gradient(135deg, #c9a84c, #d4b86a)', color: '#0f1923',
          border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
          display: 'inline-flex', alignItems: 'center', gap: 10,
          boxShadow: '0 8px 24px rgba(201,168,76,0.30)', transition: 'transform 0.15s',
        }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'}>
          <i className="bi bi-rocket-takeoff-fill" />
          Comecar 7 dias gratis agora
        </button>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12 }}>
          Cancele a qualquer momento &middot; Sem cobranca durante o periodo gratis &middot; Suporte em portugues
        </div>
      </div>

      {/* FAQ */}
      <div className="section-card" style={{ padding: '24px 28px' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>Perguntas Frequentes</div>
        {[
          { q: 'E se eu nao gostar? Tenho como cancelar?', a: 'Sim. Voce pode cancelar com 1 clique a qualquer momento, sem multas, sem ligacao com vendedor, sem perguntas. Alem disso, oferecemos 7 dias de garantia: se nao economizar 5h na primeira semana, devolvemos 100% do valor.' },
          { q: 'Preciso ter conhecimento tecnico para usar?', a: 'Nao. A LexAI foi projetada para ser usada por advogados sem nenhum conhecimento de programacao. Voce digita em portugues e a IA responde estruturado, pronto para usar.' },
          { q: 'Os documentos que eu enviar ficam seguros?', a: 'Totalmente. Somos LGPD compliant, todos os dados sao criptografados em transito e em repouso. Nao usamos seus documentos para treinar modelos. Sua privacidade e prioridade.' },
          { q: 'Posso trocar de plano depois?', a: 'Sim, voce pode fazer upgrade ou downgrade a qualquer momento. A diferenca e calculada proporcionalmente. Sem fidelidade nem multa.' },
          { q: 'Como funciona o limite de documentos?', a: 'Cada analise, pesquisa ou peca conta como 1 documento. O contador reseta no inicio do mes. Se atingir o limite, voce recebe aviso e pode fazer upgrade ou aguardar o proximo ciclo.' },
          { q: 'Quanto tempo eu economizo de verdade?', a: 'A media dos nossos usuarios e 12 a 20 horas por semana. Uma analise de contrato que levaria 3h leva 45 segundos. Uma peca que voce escreveria em 2h sai pronta em 2 minutos.' },
          { q: 'Como funciona a cobranca por advogado?', a: 'O valor por advogado varia conforme o plano: Escritorio R$ 1.399, Firma R$ 1.459 e Enterprise R$ 1.599. Quanto maior o plano, mais agentes e recursos disponiveis por usuario.' },
        ].map((item, i, arr) => (
          <div key={i} style={{ padding: '14px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>{item.q}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item.a}</div>
          </div>
        ))}
      </div>

      {/* Contact */}
      <div style={{ textAlign: 'center', marginTop: 24, padding: '20px 0', color: 'var(--text-muted)', fontSize: 13 }}>
        Duvidas? Entre em contato: contato@vanixcorp.com
      </div>
    </div>
  )
}

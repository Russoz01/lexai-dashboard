'use client'

/* ═════════════════════════════════════════════════════════════
 * PLANOS — v10 editorial dark
 * ─────────────────────────────────────────────────────────────
 * Voz Renato · champagne + noir + ouro antigo.
 * Segue padrão visual da landing / dashboard / CRM.
 * ═════════════════════════════════════════════════════════════ */

import { useState, useEffect } from 'react'
import {
  Check, CheckCircle2, Clock, CreditCard, Gem, Headphones, MinusCircle,
  Rocket, RotateCcw, ShieldCheck, Smile, Sparkles, Star, TrendingUp, X,
  XCircle, Zap, type LucideIcon,
} from 'lucide-react'

type PlanoId = 'starter' | 'pro' | 'enterprise'

interface Plano {
  id: PlanoId
  nome: string
  tagline: string
  precoMensal: number
  stripeLink: string
  economiaReal: string
  features: { label: string; disponivel: boolean }[]
}

const PLANOS_BASE: Plano[] = [
  {
    id: 'starter', nome: 'Escritório', tagline: '1–5 advogados',
    precoMensal: 1399,
    stripeLink: 'https://buy.stripe.com/test_dRm4gy6gG1Nb2T14ZA2oE01',
    economiaReal: 'Recupere 12h por semana em pesquisas por advogado',
    features: [
      { label: '5 agentes (Resumidor, Pesquisador, Redator, Calculador, Monitor Legislativo)', disponivel: true },
      { label: '200 documentos por mês', disponivel: true },
      { label: 'Histórico de 45 dias', disponivel: true },
      { label: 'Suporte por email em 24h', disponivel: true },
      { label: 'Exportação em PDF', disponivel: false },
      { label: 'API própria para integração', disponivel: false },
      { label: 'Agentes customizados', disponivel: false },
    ],
  },
  {
    id: 'pro', nome: 'Firma', tagline: '6–15 advogados · Mais escolhido',
    precoMensal: 1459,
    stripeLink: 'https://buy.stripe.com/test_9B69ASawWajH5192Rs2oE02',
    economiaReal: 'Capacidade de atendimento +40% sem contratar',
    features: [
      { label: 'Todos os 22 agentes especializados', disponivel: true },
      { label: 'Documentos ilimitados', disponivel: true },
      { label: 'Histórico de 90 dias', disponivel: true },
      { label: 'Suporte prioritário em 3h', disponivel: true },
      { label: 'Exportação em PDF profissional', disponivel: true },
      { label: 'Sessão de onboarding dedicada', disponivel: true },
      { label: 'CRM + Marketing em beta fechado', disponivel: true },
    ],
  },
  {
    id: 'enterprise', nome: 'Enterprise', tagline: '16+ advogados',
    precoMensal: 1599,
    stripeLink: 'https://buy.stripe.com/test_cNicN434u0J7fFN1No2oE03',
    economiaReal: 'ROI de 8x sobre o investimento mensal',
    features: [
      { label: 'Agentes customizados para o escritório', disponivel: true },
      { label: 'Análises ilimitadas + fair use', disponivel: true },
      { label: 'Histórico ilimitado e backup em nuvem', disponivel: true },
      { label: 'Suporte via WhatsApp 24h + Gerente dedicado', disponivel: true },
      { label: 'API privada + SLA de uptime', disponivel: true },
      { label: 'Opção on-premise', disponivel: true },
      { label: 'DPA incluso · CRM + Marketing liberados', disponivel: true },
    ],
  },
]

const BENEFICIOS_ENTERPRISE = [
  'Onboarding dedicado com especialista jurídico',
  'Acesso antecipado a novos agentes e funcionalidades',
  'SLA de resposta garantido em 4h para chamados críticos',
  'Treinamento personalizado para sua equipe',
]

const TRUST_ITEMS: { Icon: LucideIcon; label: string; sub: string }[] = [
  { Icon: ShieldCheck,  label: 'LGPD compliant',         sub: 'Dados criptografados' },
  { Icon: CreditCard,   label: 'Pagamento Stripe',       sub: '100% seguro' },
  { Icon: RotateCcw,    label: 'Cancele quando quiser',  sub: 'Sem multas' },
  { Icon: Headphones,   label: 'Suporte em PT-BR',       sub: 'Resposta rápida' },
]

const GUARANTEE_POINTS: { Icon: LucideIcon; text: string }[] = [
  { Icon: Clock,     text: '7 dias para testar' },
  { Icon: RotateCcw, text: 'Reembolso em 24h' },
  { Icon: Smile,     text: 'Sem perguntas' },
]

function getDestaqueId(planoAtual: PlanoId): PlanoId {
  if (planoAtual === 'starter') return 'pro'
  return 'enterprise'
}

function getBadgeLabel(planoId: PlanoId, planoAtual: PlanoId): string | null {
  const destaqueId = getDestaqueId(planoAtual)
  if (planoId !== destaqueId) return null
  if (planoAtual === 'enterprise') return 'SEU PLANO PREMIUM'
  return 'MAIS ESCOLHIDO'
}

function getCtaLabel(planoId: PlanoId, planoAtual: PlanoId, precoPlano: number, precoAtual: number): string {
  if (planoId === planoAtual) return 'Você está aqui'
  if (precoAtual > precoPlano) return 'Mudar para este plano'
  if (planoId === 'starter') return 'Começar 7 dias grátis'
  if (precoPlano > precoAtual) return 'Agendar demonstração'
  return 'Mudar para este plano'
}

export default function PlanosPage() {
  const [planoAtual, setPlanoAtual] = useState<PlanoId>('enterprise')

  useEffect(() => {
    const saved = localStorage.getItem('lexai-plano') as PlanoId | null
    if (saved === 'starter' || saved === 'pro' || saved === 'enterprise') setPlanoAtual(saved)
    else localStorage.setItem('lexai-plano', 'enterprise')
  }, [])

  async function abrirPortal() {
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert('Não foi possível abrir o portal. Tente novamente.')
    } catch { alert('Erro ao abrir portal de pagamento') }
  }

  const precoAtual = PLANOS_BASE.find(p => p.id === planoAtual)?.precoMensal || 0
  const destaqueId = getDestaqueId(planoAtual)

  return (
    <div style={{ padding: '32px 36px 56px', maxWidth: 1400, margin: '0 auto' }}>
      {/* HEADER */}
      <header style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 14px', borderRadius: 999,
          background: 'linear-gradient(135deg, rgba(212,174,106,0.16), rgba(191,166,142,0.08))',
          border: '1px solid rgba(212,174,106,0.32)',
          fontFamily: 'var(--font-mono, ui-monospace), monospace',
          fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase',
          color: 'var(--accent)', marginBottom: 18,
        }}>
          <Zap size={11} strokeWidth={2} aria-hidden />
          Oferta de lançamento · 7 dias grátis
        </div>
        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 48, fontWeight: 500, fontStyle: 'italic',
          color: 'var(--text-primary)', margin: 0, lineHeight: 1.05, letterSpacing: '-0.02em',
        }}>
          Trabalhe 10× mais rápido<br />
          <span style={{
            background: 'linear-gradient(135deg, #f5e8d3, #bfa68e, #7a5f48)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', fontStyle: 'normal',
          }}>no Direito brasileiro.</span>
        </h1>
        <p style={{
          maxWidth: 640, margin: '18px auto 0',
          fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.65,
        }}>
          Pare de gastar horas com pesquisa manual. Cada advogado ganha tempo pra estratégia, não repetição.
          Comece hoje. Cancele quando quiser. Sem letra miúda.
        </p>
      </header>

      {/* TRUST BAR */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14,
        marginBottom: 28,
      }} className="lp-trust-grid">
        {TRUST_ITEMS.map((t, i) => (
          <div key={i} style={{
            padding: 14, borderRadius: 12,
            background: 'rgba(15,15,15,0.78)',
            border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(212,174,106,0.12)',
              border: '1px solid rgba(212,174,106,0.28)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <t.Icon size={16} strokeWidth={1.75} style={{ color: 'var(--accent)' }} aria-hidden />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{t.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* PRICING NOTE */}
      <div style={{
        textAlign: 'center', marginBottom: 22,
        fontSize: 12, color: 'var(--text-muted)',
        fontFamily: 'var(--font-mono, ui-monospace), monospace', letterSpacing: '0.08em',
      }}>
        cobrança <strong style={{ color: 'var(--accent)' }}>por advogado registrado</strong> · R$ 1.399 a R$ 1.599 conforme plano
      </div>

      {/* PLAN CARDS */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18,
        marginBottom: 32,
      }} className="lp-plans-grid">
        {PLANOS_BASE.map(plano => {
          const isDestaque = plano.id === destaqueId
          const badgeLabel = getBadgeLabel(plano.id, planoAtual)
          const preco = plano.precoMensal
          const isCurrentPlan = plano.id === planoAtual
          const isEnterprisePremium = plano.id === 'enterprise' && planoAtual === 'enterprise'

          return (
            <div key={plano.id} style={{
              position: 'relative',
              borderRadius: 16, overflow: 'hidden',
              background: isEnterprisePremium
                ? 'radial-gradient(120% 140% at 20% 0%, rgba(212,174,106,0.12), transparent 60%), linear-gradient(180deg, rgba(20,15,8,0.92), rgba(10,10,10,0.94))'
                : 'rgba(15,15,15,0.82)',
              border: isEnterprisePremium
                ? '1px solid rgba(212,174,106,0.55)'
                : isDestaque
                  ? '1px solid rgba(212,174,106,0.42)'
                  : '1px solid var(--border)',
              boxShadow: isEnterprisePremium
                ? '0 24px 60px rgba(212,174,106,0.12), inset 0 1px 0 rgba(255,255,255,0.04)'
                : isDestaque
                  ? '0 16px 40px rgba(212,174,106,0.08)'
                  : '0 8px 24px rgba(0,0,0,0.25)',
              transform: isDestaque ? 'translateY(-4px)' : 'none',
              transition: 'transform 0.2s ease, border-color 0.2s ease',
            }}>
              {badgeLabel && (
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0,
                  padding: '7px 0', textAlign: 'center',
                  background: 'linear-gradient(135deg, #f5e8d3, #bfa68e, #7a5f48)',
                  color: '#0a0a0a',
                  fontFamily: 'var(--font-mono, ui-monospace), monospace',
                  fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.22em', textTransform: 'uppercase',
                }}>
                  {badgeLabel}
                </div>
              )}

              <div style={{ padding: badgeLabel ? '44px 24px 26px' : '26px 24px' }}>
                {/* Name + tagline */}
                <div style={{
                  fontFamily: 'var(--font-mono, ui-monospace), monospace',
                  fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase',
                  color: 'var(--accent)', marginBottom: 6,
                }}>
                  Plano · {plano.id}
                </div>
                <div style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 32, fontStyle: 'italic', fontWeight: 500,
                  color: 'var(--text-primary)', lineHeight: 1.1,
                  letterSpacing: '-0.01em', marginBottom: 4,
                }}>
                  {plano.nome}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
                  {plano.tagline}
                </div>

                {/* Price */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600 }}>R$</span>
                  <span style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: 52, fontWeight: 600, lineHeight: 1,
                    color: isDestaque ? 'var(--accent)' : 'var(--text-primary)',
                    letterSpacing: '-0.02em',
                  }}>
                    {preco.toLocaleString('pt-BR')}
                  </span>
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono, ui-monospace), monospace',
                  fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
                  color: 'var(--text-muted)', marginBottom: 14,
                }}>
                  por advogado / mês
                </div>

                {/* Economia real */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 12px', borderRadius: 10, marginBottom: 20,
                  background: 'rgba(212,174,106,0.08)',
                  border: '1px solid rgba(212,174,106,0.2)',
                  fontSize: 11, color: 'var(--accent-light2)', fontWeight: 500, lineHeight: 1.4,
                }}>
                  <TrendingUp size={12} strokeWidth={2} style={{ flexShrink: 0 }} aria-hidden />
                  {plano.economiaReal}
                </div>

                {/* Features */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
                  {plano.features.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <span style={{
                        width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        background: f.disponivel ? 'rgba(212,174,106,0.14)' : 'rgba(120,110,100,0.06)',
                        border: `1px solid ${f.disponivel ? 'rgba(212,174,106,0.34)' : 'rgba(120,110,100,0.18)'}`,
                        color: f.disponivel ? 'var(--accent)' : 'var(--text-muted)',
                        marginTop: 1,
                      }}>
                        {f.disponivel
                          ? <Check size={11} strokeWidth={2.5} aria-hidden />
                          : <X size={11} strokeWidth={2.5} aria-hidden />}
                      </span>
                      <span style={{
                        fontSize: 12, lineHeight: 1.5,
                        color: f.disponivel ? 'var(--text-secondary)' : 'var(--text-muted)',
                        textDecoration: f.disponivel ? 'none' : 'line-through',
                        textDecorationColor: 'rgba(120,110,100,0.4)',
                      }}>
                        {f.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button
                  disabled={isCurrentPlan}
                  onClick={() => {
                    if (!isCurrentPlan) {
                      if (plano.stripeLink) {
                        window.open(plano.stripeLink, '_blank')
                        setPlanoAtual(plano.id)
                        localStorage.setItem('lexai-plano', plano.id)
                      }
                    }
                  }}
                  style={{
                    width: '100%', padding: '13px 16px', borderRadius: 10,
                    fontFamily: 'var(--font-mono, ui-monospace), monospace',
                    fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700,
                    cursor: isCurrentPlan ? 'default' : 'pointer',
                    transition: 'all 0.2s ease',
                    background: isCurrentPlan
                      ? 'rgba(191,166,142,0.06)'
                      : isDestaque
                        ? 'linear-gradient(135deg, #f5e8d3, #bfa68e, #7a5f48)'
                        : 'transparent',
                    color: isCurrentPlan
                      ? 'var(--text-muted)'
                      : isDestaque
                        ? '#0a0a0a'
                        : 'var(--accent)',
                    border: isCurrentPlan
                      ? '1px solid var(--border)'
                      : isDestaque
                        ? '1px solid rgba(212,174,106,0.5)'
                        : '1px solid rgba(212,174,106,0.38)',
                    boxShadow: isDestaque && !isCurrentPlan ? '0 12px 32px rgba(212,174,106,0.22)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                >
                  {isCurrentPlan && <CheckCircle2 size={13} strokeWidth={2} aria-hidden />}
                  {getCtaLabel(plano.id, planoAtual, plano.precoMensal, precoAtual)}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* GERENCIAR ASSINATURA */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20,
        padding: 22, borderRadius: 14, marginBottom: 22,
        background: 'rgba(15,15,15,0.82)',
        border: '1px solid var(--border)',
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: 260 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: 'rgba(212,174,106,0.12)',
            border: '1px solid rgba(212,174,106,0.28)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CreditCard size={20} strokeWidth={1.75} style={{ color: 'var(--accent)' }} aria-hidden />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, fontStyle: 'italic',
              color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1.25, fontWeight: 500,
            }}>
              Gerenciar pagamento e assinatura
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Atualize cartão, baixe faturas, faça downgrade ou cancele a qualquer momento via Stripe.
            </div>
          </div>
        </div>
        <button
          type="button" onClick={abrirPortal}
          style={{
            padding: '12px 18px', borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg, #f5e8d3, #bfa68e)',
            color: '#0a0a0a', border: '1px solid rgba(212,174,106,0.5)',
            fontFamily: 'var(--font-mono, ui-monospace), monospace',
            fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700,
            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
            boxShadow: '0 10px 28px rgba(212,174,106,0.22)',
          }}
        >
          <CreditCard size={13} strokeWidth={2} aria-hidden />
          Abrir portal Stripe
        </button>
      </div>

      {/* ENTERPRISE EXCLUSIVE */}
      {planoAtual === 'enterprise' && (
        <div style={{
          padding: 24, borderRadius: 14, marginBottom: 32,
          background: 'radial-gradient(140% 140% at 20% 0%, rgba(212,174,106,0.12), transparent 60%), rgba(15,15,15,0.88)',
          border: '1px solid rgba(212,174,106,0.32)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Gem size={18} strokeWidth={1.75} style={{ color: 'var(--accent)' }} aria-hidden />
            <div style={{
              fontFamily: 'var(--font-mono, ui-monospace), monospace',
              fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase',
              color: 'var(--accent)', fontWeight: 700,
            }}>
              Benefícios exclusivos · Enterprise
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }} className="lp-benefits-grid">
            {BENEFICIOS_ENTERPRISE.map((b, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '10px 12px', borderRadius: 10,
                background: 'rgba(10,10,10,0.4)',
                border: '1px solid rgba(191,166,142,0.12)',
                fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5,
              }}>
                <Star size={11} strokeWidth={2} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 3 }} aria-hidden />
                {b}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* COMPARE SECTION */}
      <div style={{
        padding: 28, borderRadius: 14, marginBottom: 24,
        background: 'rgba(15,15,15,0.82)',
        border: '1px solid var(--border)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div style={{
            fontFamily: 'var(--font-mono, ui-monospace), monospace',
            fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase',
            color: 'var(--accent)', marginBottom: 8,
          }}>
            A diferença na prática
          </div>
          <div style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 28, fontStyle: 'italic', fontWeight: 500,
            color: 'var(--text-primary)', letterSpacing: '-0.01em',
          }}>
            sem LexAI <span style={{ color: 'var(--text-muted)', margin: '0 8px', fontStyle: 'normal', fontSize: 16 }}>versus</span> com LexAI
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18 }} className="lp-compare-grid">
          <div style={{
            padding: 18, borderRadius: 12,
            background: 'rgba(216,137,119,0.04)',
            border: '1px solid rgba(216,137,119,0.18)',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
              fontFamily: 'var(--font-mono, ui-monospace), monospace',
              fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase',
              color: '#d88977', fontWeight: 700,
            }}>
              <XCircle size={14} strokeWidth={2} aria-hidden /> Sem LexAI
            </div>
            {[
              '3 horas lendo um contrato de 40 páginas',
              'Pesquisa manual em 5 sites diferentes',
              'Petição escrita do zero toda semana',
              'Cálculos de prazos em planilha',
              'Risco de perder jurisprudência relevante',
              'Custo alto de estagiários para tarefas repetitivas',
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '8px 0', fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.55,
              }}>
                <MinusCircle size={11} strokeWidth={2} style={{ color: '#d88977', marginTop: 3, flexShrink: 0 }} aria-hidden />
                {item}
              </div>
            ))}
          </div>
          <div style={{
            padding: 18, borderRadius: 12,
            background: 'radial-gradient(120% 140% at 20% 0%, rgba(212,174,106,0.08), transparent 60%), rgba(15,15,15,0.5)',
            border: '1px solid rgba(212,174,106,0.3)',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
              fontFamily: 'var(--font-mono, ui-monospace), monospace',
              fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase',
              color: 'var(--accent)', fontWeight: 700,
            }}>
              <CheckCircle2 size={14} strokeWidth={2} aria-hidden /> Com LexAI
            </div>
            {[
              'Análise completa em 45 segundos com riscos identificados',
              'Pesquisa em STF, STJ e tribunais em um clique',
              '6 templates prontos (petição, recurso, contestação...)',
              'Prazos calculados automaticamente com base no CPC',
              'IA não esquece nenhuma súmula relevante',
              'Sua equipe focada em estratégia, não em repetição',
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '8px 0', fontSize: 12.5, color: 'var(--text-primary)', lineHeight: 1.55, fontWeight: 500,
              }}>
                <CheckCircle2 size={11} strokeWidth={2.5} style={{ color: 'var(--accent)', marginTop: 3, flexShrink: 0 }} aria-hidden />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TESTIMONIALS */}
      <div style={{
        padding: 28, borderRadius: 14, marginBottom: 24,
        background: 'rgba(15,15,15,0.82)',
        border: '1px solid var(--border)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div style={{
            fontFamily: 'var(--font-mono, ui-monospace), monospace',
            fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase',
            color: 'var(--accent)', marginBottom: 8,
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}>
            <Sparkles size={11} strokeWidth={2} aria-hidden /> Quem já usa
          </div>
          <div style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 28, fontStyle: 'italic', fontWeight: 500,
            color: 'var(--text-primary)', letterSpacing: '-0.01em',
          }}>
            resultados reais de quem testou
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="lp-test-grid">
          {[
            {
              nome: 'Mariana Castro',
              cargo: 'Advogada Civil · SP',
              foto: 'MC',
              texto: 'Em 2 semanas economizei mais de 20 horas que eu gastava em pesquisa de jurisprudência. O Pesquisador encontra acórdãos que eu nem sabia que existiam.',
            },
            {
              nome: 'Dr. Pedro Henrique',
              cargo: 'Sócio · PHM Advogados',
              foto: 'PH',
              texto: 'O Calculador e o Monitor Legislativo mudaram a forma como gerenciamos prazos. Zero perda processual desde que adotamos a plataforma no escritório.',
            },
            {
              nome: 'Renata Lima',
              cargo: 'Sócia · Lima Advocacia',
              foto: 'RL',
              texto: 'Substituiu 2 estagiários e ainda entrega mais rápido. O Redator gera petições que só precisam de pequenos ajustes. Investimento que se pagou em 1 mês.',
            },
          ].map((t, i) => (
            <div key={i} style={{
              padding: 20, borderRadius: 12,
              background: 'rgba(10,10,10,0.55)',
              border: '1px solid rgba(191,166,142,0.12)',
              display: 'flex', flexDirection: 'column', gap: 14,
            }}>
              <div style={{ display: 'flex', gap: 2, color: 'var(--accent)' }}>
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} size={12} strokeWidth={2} fill="currentColor" aria-hidden />
                ))}
              </div>
              <div style={{
                fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic',
                fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.55, fontWeight: 400,
              }}>
                &ldquo;{t.texto}&rdquo;
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 'auto' }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: 'linear-gradient(135deg, #f5e8d3, #bfa68e)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#0a0a0a', fontWeight: 700, fontSize: 13,
                  letterSpacing: '0.04em',
                }}>
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

      {/* GUARANTEE */}
      <div style={{
        padding: 28, borderRadius: 14, marginBottom: 24, textAlign: 'center',
        background: 'radial-gradient(120% 160% at 50% 0%, rgba(93,123,79,0.08), transparent 60%), rgba(15,15,15,0.88)',
        border: '1px solid rgba(93,123,79,0.28)',
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14, margin: '0 auto 14px',
          background: 'rgba(93,123,79,0.14)',
          border: '1px solid rgba(93,123,79,0.38)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <ShieldCheck size={26} strokeWidth={1.75} style={{ color: '#8fb082' }} aria-hidden />
        </div>
        <div style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 26, fontStyle: 'italic', fontWeight: 500,
          color: 'var(--text-primary)', marginBottom: 10, letterSpacing: '-0.01em',
        }}>
          garantia de 7 dias · ou o dinheiro de volta
        </div>
        <div style={{
          maxWidth: 560, margin: '0 auto 18px',
          fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.65,
        }}>
          Teste todos os agentes sem risco. Se a LexAI não economizar pelo menos 5 horas do seu trabalho na primeira semana, devolvemos 100% do valor. Sem perguntas, sem burocracia.
        </div>
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 22, flexWrap: 'wrap',
        }}>
          {GUARANTEE_POINTS.map((g, i) => (
            <div key={i} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontFamily: 'var(--font-mono, ui-monospace), monospace',
              fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
              color: 'var(--text-secondary)', fontWeight: 600,
            }}>
              <g.Icon size={13} strokeWidth={2} style={{ color: '#8fb082' }} aria-hidden />
              {g.text}
            </div>
          ))}
        </div>
      </div>

      {/* FINAL CTA */}
      <div style={{
        padding: 36, borderRadius: 14, marginBottom: 24, textAlign: 'center',
        background: 'radial-gradient(120% 140% at 20% 0%, rgba(212,174,106,0.18), transparent 60%), linear-gradient(180deg, rgba(20,15,8,0.92), rgba(10,10,10,0.94))',
        border: '1px solid rgba(212,174,106,0.4)',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 14px', borderRadius: 999, marginBottom: 16,
          background: 'rgba(216,137,119,0.12)',
          border: '1px solid rgba(216,137,119,0.32)',
          fontFamily: 'var(--font-mono, ui-monospace), monospace',
          fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase',
          color: '#d88977', fontWeight: 700,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#d88977', boxShadow: '0 0 8px #d88977',
          }} />
          Vagas limitadas para o lançamento
        </div>
        <div style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 34, fontStyle: 'italic', fontWeight: 500,
          color: 'var(--text-primary)', marginBottom: 10, letterSpacing: '-0.01em', lineHeight: 1.2,
        }}>
          pronto para acabar<br />com as horas perdidas?
        </div>
        <div style={{
          maxWidth: 540, margin: '0 auto 22px',
          fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6,
        }}>
          Junte-se aos primeiros escritórios que já transformaram sua rotina. Comece em 30 segundos — sem cartão de crédito.
        </div>
        <button
          type="button"
          onClick={() => {
            const link = PLANOS_BASE.find(p => p.id === destaqueId)?.stripeLink
            if (link) window.open(link, '_blank')
          }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '16px 30px', borderRadius: 12,
            background: 'linear-gradient(135deg, #f5e8d3, #bfa68e, #7a5f48)',
            color: '#0a0a0a',
            fontFamily: 'var(--font-mono, ui-monospace), monospace',
            fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase',
            border: '1px solid rgba(212,174,106,0.5)',
            boxShadow: '0 16px 42px rgba(212,174,106,0.28)',
            cursor: 'pointer',
          }}
        >
          <Rocket size={15} strokeWidth={1.75} aria-hidden />
          Começar 7 dias grátis
        </button>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 16 }}>
          Cancele a qualquer momento · Sem cobrança durante o período grátis · Suporte em português
        </div>
      </div>

      {/* FAQ */}
      <div style={{
        padding: 28, borderRadius: 14, marginBottom: 20,
        background: 'rgba(15,15,15,0.82)',
        border: '1px solid var(--border)',
      }}>
        <div style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 26, fontStyle: 'italic', fontWeight: 500,
          color: 'var(--text-primary)', marginBottom: 6,
        }}>
          perguntas frequentes
        </div>
        <div style={{
          fontFamily: 'var(--font-mono, ui-monospace), monospace',
          fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase',
          color: 'var(--text-muted)', marginBottom: 18,
        }}>
          o que escritório costuma perguntar antes de começar
        </div>
        {[
          { q: 'E se eu não gostar? Tenho como cancelar?', a: 'Sim. Você pode cancelar com 1 clique a qualquer momento, sem multas, sem ligação com vendedor, sem perguntas. Além disso, oferecemos 7 dias de garantia: se não economizar 5h na primeira semana, devolvemos 100% do valor.' },
          { q: 'Preciso ter conhecimento técnico para usar?', a: 'Não. A LexAI foi projetada para ser usada por advogados sem nenhum conhecimento de programação. Você digita em português e a IA responde estruturado, pronto para usar.' },
          { q: 'Os documentos que eu enviar ficam seguros?', a: 'Totalmente. Somos LGPD compliant, todos os dados são criptografados em trânsito e em repouso. Não usamos seus documentos para treinar modelos. Sua privacidade é prioridade.' },
          { q: 'Posso trocar de plano depois?', a: 'Sim, você pode fazer upgrade ou downgrade a qualquer momento. A diferença é calculada proporcionalmente. Sem fidelidade nem multa.' },
          { q: 'Como funciona o limite de documentos?', a: 'Cada análise, pesquisa ou peça conta como 1 documento. O contador reseta no início do mês. Se atingir o limite, você recebe aviso e pode fazer upgrade ou aguardar o próximo ciclo.' },
          { q: 'Quanto tempo eu economizo de verdade?', a: 'A média dos nossos usuários é 12 a 20 horas por semana. Uma análise de contrato que levaria 3h leva 45 segundos. Uma peça que você escreveria em 2h sai pronta em 2 minutos.' },
          { q: 'Como funciona a cobrança por advogado?', a: 'O valor por advogado varia conforme o plano: Escritório R$ 1.399, Firma R$ 1.459 e Enterprise R$ 1.599. Quanto maior o plano, mais agentes e recursos disponíveis por usuário.' },
        ].map((item, i, arr) => (
          <div key={i} style={{
            padding: '16px 0',
            borderBottom: i < arr.length - 1 ? '1px solid rgba(191,166,142,0.12)' : 'none',
          }}>
            <div style={{
              fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6,
            }}>
              {item.q}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              {item.a}
            </div>
          </div>
        ))}
      </div>

      {/* CONTACT */}
      <div style={{
        textAlign: 'center', padding: '20px 0',
        fontFamily: 'var(--font-mono, ui-monospace), monospace',
        fontSize: 11, letterSpacing: '0.12em',
        color: 'var(--text-muted)',
      }}>
        dúvidas? contato@vanixcorp.com
      </div>

      <style>{`
        @media (max-width: 1100px) {
          .lp-plans-grid   { grid-template-columns: 1fr !important; }
          .lp-compare-grid { grid-template-columns: 1fr !important; }
          .lp-test-grid    { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 900px) {
          .lp-trust-grid    { grid-template-columns: repeat(2, 1fr) !important; }
          .lp-benefits-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

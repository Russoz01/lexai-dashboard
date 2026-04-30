'use client'

/* ═════════════════════════════════════════════════════════════════════
 * LexPricingGrid · v10.12 (2026-04-23)
 * ───────────────────────────────────────────────────────────────────
 * Componente canônico de planos — atelier editorial dark.
 * Fonte de verdade visual: /dashboard/planos + screenshot Leonardo.
 *
 * Uso:
 *   <LexPricingGrid />                              // landing (sem estado)
 *   <LexPricingGrid currentPlanId="starter"         // dashboard (com plano ativo)
 *     onCheckout={(id) => stripeCheckout(id)}       // Stripe inline
 *     loadingPlan={loadingPlan} />
 *
 * Usado em:
 *   · src/components/ui/lex-pricing.tsx   (landing)
 *   · src/app/empresas/page.tsx           (seção B2B)
 *   · src/app/dashboard/planos/page.tsx   (billing autenticado)
 *
 * Preços sincronizados com Stripe (price IDs em src/lib/stripe.ts):
 *   Escritório: R$ 1.399 / advogado / mês
 *   Firma:      R$ 1.459 / advogado / mês
 *   Enterprise: R$ 1.599 / advogado / mês
 * ════════════════════════════════════════════════════════════════════ */

import {
  Check, X, CheckCircle2, CreditCard, Headphones, Loader2, RotateCcw,
  ShieldCheck, TrendingUp, type LucideIcon,
} from 'lucide-react'

export type PlanoId = 'starter' | 'pro' | 'enterprise'

export interface LexPricingGridProps {
  /** Plano atual do usuário (marca "Você está aqui" + recalcula destaque). Omit se não autenticado. */
  currentPlanId?: PlanoId
  /** Handler de checkout. Se omitido, cards viram link pra /login. */
  onCheckout?: (plano: PlanoId) => void
  /** Plano em estado loading durante checkout. */
  loadingPlan?: PlanoId | null
  /** Some com trust bar (LGPD / Stripe / Cancele / Suporte) — útil quando já existe uma acima. */
  hideTrustBar?: boolean
  /** Some com nota "cobrança por advogado registrado · R$ X a R$ Y". */
  hidePricingNote?: boolean
}

interface Plano {
  id: PlanoId
  nome: string
  tagline: string
  precoMensal: number
  economiaReal: string
  features: { label: string; disponivel: boolean }[]
}

const PLANOS: Plano[] = [
  {
    id: 'starter', nome: 'Escritório', tagline: '1–5 advogados',
    precoMensal: 1399,
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
    economiaReal: 'Capacidade de atendimento +40% sem contratar',
    features: [
      { label: 'Todos os 27 agentes especializados', disponivel: true },
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

const TRUST_ITEMS: { Icon: LucideIcon; label: string; sub: string }[] = [
  { Icon: ShieldCheck,  label: 'LGPD compliant',         sub: 'Dados criptografados' },
  { Icon: CreditCard,   label: 'Pagamento Stripe',       sub: '100% seguro' },
  { Icon: RotateCcw,    label: 'Cancele quando quiser',  sub: 'Sem multas' },
  { Icon: Headphones,   label: 'Suporte em PT-BR',       sub: 'Resposta rápida' },
]

function getDestaqueId(currentPlanId?: PlanoId): PlanoId {
  if (currentPlanId === 'starter') return 'pro'
  if (currentPlanId === 'enterprise') return 'enterprise'
  return 'pro' // default (sem plano ou pro): destaca Firma
}

function getBadgeLabel(planoId: PlanoId, currentPlanId?: PlanoId): string | null {
  const destaque = getDestaqueId(currentPlanId)
  if (planoId !== destaque) return null
  if (currentPlanId === 'enterprise') return 'SEU PLANO PREMIUM'
  return 'MAIS ESCOLHIDO'
}

function getCtaLabel(
  planoId: PlanoId, currentPlanId: PlanoId | undefined,
  precoPlano: number, precoAtual: number,
): string {
  if (!currentPlanId) {
    // Landing / anônimo — todos os 3 planos entram via signup (sem cartao)
    // e usam demo de 30 min gratis. Money-back garantido por 7 dias apos
    // assinar (separado do trial pre-checkout).
    return 'Demo 30 min grátis'
  }
  if (planoId === currentPlanId) return 'Você está aqui'
  if (precoAtual > precoPlano) return 'Mudar para este plano'
  if (precoPlano > precoAtual) return 'Demo 30 min grátis'
  return 'Mudar para este plano'
}

export function LexPricingGrid({
  currentPlanId,
  onCheckout,
  loadingPlan = null,
  hideTrustBar = false,
  hidePricingNote = false,
}: LexPricingGridProps) {
  const precoAtual = currentPlanId
    ? PLANOS.find(p => p.id === currentPlanId)?.precoMensal ?? 0
    : 0
  const destaqueId = getDestaqueId(currentPlanId)

  function handleClick(plano: Plano) {
    if (plano.id === currentPlanId) return
    if (onCheckout) {
      onCheckout(plano.id)
      return
    }
    // Fallback landing — todos os planos abrem signup. Trial 7 dias
    // automatico no starter, demo de 30 min sem pagar nos demais.
    window.location.href = `/login?next=${encodeURIComponent('/dashboard/planos')}`
  }

  return (
    <div className="lex-pricing-grid">
      {/* TRUST BAR */}
      {!hideTrustBar && (
        <div
          style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14,
            marginBottom: 28,
          }}
          className="lpg-trust-grid"
        >
          {TRUST_ITEMS.map((t, i) => (
            <div
              key={i}
              style={{
                padding: 14, borderRadius: 12,
                background: 'rgba(15,15,15,0.78)',
                border: '1px solid rgba(191,166,142,0.14)',
                display: 'flex', alignItems: 'center', gap: 12,
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(212,174,106,0.12)',
                border: '1px solid rgba(212,174,106,0.28)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <t.Icon size={16} strokeWidth={1.75} style={{ color: '#bfa68e' }} aria-hidden />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#f5f1ea', marginBottom: 2 }}>{t.label}</div>
                <div style={{ fontSize: 11, color: '#9c9388' }}>{t.sub}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PRICING NOTE */}
      {!hidePricingNote && (
        <div style={{
          textAlign: 'center', marginBottom: 22,
          fontSize: 12, color: '#9c9388',
          fontFamily: 'var(--font-mono, ui-monospace), "SF Mono", Menlo, monospace',
          letterSpacing: '0.08em',
        }}>
          cobrança <strong style={{ color: '#bfa68e' }}>por advogado registrado</strong> · R$ 1.399 a R$ 1.599 conforme plano
        </div>
      )}

      {/* PLAN CARDS */}
      <div
        style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18,
        }}
        className="lpg-plans-grid"
      >
        {PLANOS.map(plano => {
          const isDestaque = plano.id === destaqueId
          const badgeLabel = getBadgeLabel(plano.id, currentPlanId)
          const preco = plano.precoMensal
          const isCurrentPlan = plano.id === currentPlanId
          const isEnterprisePremium = plano.id === 'enterprise' && currentPlanId === 'enterprise'
          const isLoadingThis = loadingPlan === plano.id
          const isLoadingOther = loadingPlan !== null && loadingPlan !== plano.id

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
                  : '1px solid rgba(191,166,142,0.14)',
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
                {/* Nome + tagline */}
                <div style={{
                  fontFamily: 'var(--font-mono, ui-monospace), monospace',
                  fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase',
                  color: '#bfa68e', marginBottom: 6,
                }}>
                  Plano · {plano.id}
                </div>
                <div style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 32, fontStyle: 'italic', fontWeight: 500,
                  color: '#f5f1ea', lineHeight: 1.1,
                  letterSpacing: '-0.01em', marginBottom: 4,
                }}>
                  {plano.nome}
                </div>
                <div style={{ fontSize: 12, color: '#9c9388', marginBottom: 20 }}>
                  {plano.tagline}
                </div>

                {/* Preço */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, color: '#d4ccc0', fontWeight: 600 }}>R$</span>
                  <span style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: 52, fontWeight: 600, lineHeight: 1,
                    color: isDestaque ? '#bfa68e' : '#f5f1ea',
                    letterSpacing: '-0.02em',
                  }}>
                    {preco.toLocaleString('pt-BR')}
                  </span>
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono, ui-monospace), monospace',
                  fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
                  color: '#9c9388', marginBottom: 14,
                }}>
                  por advogado / mês
                </div>

                {/* Economia real */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 12px', borderRadius: 10, marginBottom: 20,
                  background: 'rgba(212,174,106,0.08)',
                  border: '1px solid rgba(212,174,106,0.2)',
                  fontSize: 11, color: '#d4beac', fontWeight: 500, lineHeight: 1.4,
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
                        color: f.disponivel ? '#bfa68e' : '#9c9388',
                        marginTop: 1,
                      }}>
                        {f.disponivel
                          ? <Check size={11} strokeWidth={2.5} aria-hidden />
                          : <X size={11} strokeWidth={2.5} aria-hidden />}
                      </span>
                      <span style={{
                        fontSize: 12, lineHeight: 1.5,
                        color: f.disponivel ? '#d4ccc0' : '#9c9388',
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
                  type="button"
                  disabled={isCurrentPlan || isLoadingOther}
                  onClick={() => handleClick(plano)}
                  style={{
                    width: '100%', padding: '13px 16px', borderRadius: 10,
                    fontFamily: 'var(--font-mono, ui-monospace), monospace',
                    fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700,
                    cursor: isCurrentPlan || isLoadingOther ? 'default' : 'pointer',
                    transition: 'all 0.2s ease',
                    background: isCurrentPlan
                      ? 'rgba(191,166,142,0.06)'
                      : isDestaque
                        ? 'linear-gradient(135deg, #f5e8d3, #bfa68e, #7a5f48)'
                        : 'transparent',
                    color: isCurrentPlan
                      ? '#9c9388'
                      : isDestaque
                        ? '#0a0a0a'
                        : '#bfa68e',
                    border: isCurrentPlan
                      ? '1px solid rgba(191,166,142,0.14)'
                      : isDestaque
                        ? '1px solid rgba(212,174,106,0.5)'
                        : '1px solid rgba(212,174,106,0.38)',
                    boxShadow: isDestaque && !isCurrentPlan ? '0 12px 32px rgba(212,174,106,0.22)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    opacity: isLoadingOther ? 0.5 : 1,
                  }}
                >
                  {isLoadingThis ? (
                    <><Loader2 size={13} strokeWidth={2} className="animate-spin" aria-hidden /> Redirecionando...</>
                  ) : isCurrentPlan ? (
                    <><CheckCircle2 size={13} strokeWidth={2} aria-hidden /> {getCtaLabel(plano.id, currentPlanId, plano.precoMensal, precoAtual)}</>
                  ) : (
                    <>{getCtaLabel(plano.id, currentPlanId, plano.precoMensal, precoAtual)}</>
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <style>{`
        @media (max-width: 1100px) {
          .lpg-plans-grid  { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 900px) {
          .lpg-trust-grid  { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  )
}

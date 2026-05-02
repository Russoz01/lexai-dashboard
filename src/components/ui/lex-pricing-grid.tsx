'use client'

/* ═════════════════════════════════════════════════════════════════════
 * LexPricingGrid · v11.0 (2026-04-30)
 * ───────────────────────────────────────────────────────────────────
 * Componente canônico de planos — atelier editorial dark.
 * Fonte de verdade visual: /dashboard/planos + screenshot Leonardo.
 *
 * Uso:
 *   <LexPricingGrid />                              // landing (sem estado)
 *   <LexPricingGrid currentPlanId="solo"            // dashboard (com plano ativo)
 *     onCheckout={(id) => stripeCheckout(id)}       // Stripe inline
 *     loadingPlan={loadingPlan} />
 *
 * Usado em:
 *   · src/components/ui/lex-pricing.tsx   (landing)
 *   · src/app/empresas/page.tsx           (seção B2B)
 *   · src/app/dashboard/planos/page.tsx   (billing autenticado)
 *
 * Preços sincronizados com Stripe (price IDs em src/lib/stripe.ts):
 *   Solo:       R$   599 / advogado / mês  (NOVO v11)
 *   Escritório: R$ 1.399 / advogado / mês
 *   Firma:      R$ 1.459 / advogado / mês
 *   Enterprise: R$ 1.599 / advogado / mês
 *
 * Founding Member: 50% off vitalício pros primeiros 10 (cupom FOUNDING50).
 * Demo grátis aumentada de 30min → 50min (DB default + cópia em todos lugares).
 * ════════════════════════════════════════════════════════════════════ */

import {
  Check, X, CheckCircle2, CreditCard, Headphones, Loader2, RotateCcw,
  ShieldCheck, TrendingUp, type LucideIcon,
} from 'lucide-react'

export type PlanoId = 'solo' | 'starter' | 'pro' | 'enterprise'

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

/* ─────────────────────────────────────────────────────────────────────
 * Tiers redesign (2026-05-02 · audit R1 follow-up):
 * Antes todos os 4 planos diziam "Todos os 27 agentes" — quebrava anchor
 * pricing (sem justificativa pra pagar 2.7x mais caro). Agora cada tier
 * tem feature set distinto, justificando o preço:
 *
 * Solo (R$599)        — 8 agentes essenciais, single advogado
 * Escritório (R$1.399) — 18 agentes, até 5 advs, integração básica
 * Firma (R$1.459)     — TODOS 27 agentes, 6-15 advs, onboarding + CRM
 * Enterprise (R$1.599) — Firma + agentes CUSTOMIZADOS treinados pra escritório
 * ───────────────────────────────────────────────────────────────────── */
const PLANOS: Plano[] = [
  {
    id: 'solo', nome: 'Solo', tagline: 'Advogado autônomo',
    precoMensal: 599,
    economiaReal: 'Recupere 6h por semana em pesquisas e redação',
    features: [
      { label: '8 agentes essenciais (Resumidor, Redator, Pesquisador, Calculador, Legislação, Risco, Contestador, Audiência)', disponivel: true },
      { label: '50 análises de documentos por mês', disponivel: true },
      { label: 'Histórico de 30 dias', disponivel: true },
      { label: 'Suporte por email em 48h', disponivel: true },
      { label: 'Exportação Word ABNT (sem PDF profissional)', disponivel: false },
      { label: 'Equipe colaborativa (multi-usuário)', disponivel: false },
      { label: 'Agentes especializados (Compliance, Marketing, OAB)', disponivel: false },
      { label: 'Agentes customizados pro seu escritório', disponivel: false },
    ],
  },
  {
    id: 'starter', nome: 'Escritório', tagline: '1–5 advogados',
    precoMensal: 1399,
    economiaReal: 'Recupere 12h por semana em pesquisas por advogado',
    features: [
      { label: '18 agentes (8 essenciais + Parecerista, Consultor, Recursos, Estratégista, Negociador, Tradutor, Revisor, Atendimento, Simulado OAB, Professor)', disponivel: true },
      { label: '200 análises de documentos por mês', disponivel: true },
      { label: 'Histórico de 60 dias', disponivel: true },
      { label: 'Suporte por email em 24h', disponivel: true },
      { label: 'Exportação Word ABNT + PDF profissional', disponivel: true },
      { label: 'Equipe colaborativa até 5 advogados', disponivel: true },
      { label: 'Agentes especializados (Compliance, Marketing, OAB)', disponivel: false },
      { label: 'Agentes customizados pro seu escritório', disponivel: false },
    ],
  },
  {
    id: 'pro', nome: 'Firma', tagline: '6–15 advogados · Mais escolhido',
    precoMensal: 1459,
    economiaReal: 'Capacidade de atendimento +40% sem contratar',
    features: [
      { label: 'TODOS os 27 agentes (18 do Escritório + Compliance LGPD, Marketing-IA OAB, CRM, Planilhas, Calculador trabalhista, +5 verticais)', disponivel: true },
      { label: 'Documentos ilimitados', disponivel: true },
      { label: 'Histórico de 180 dias', disponivel: true },
      { label: 'Suporte prioritário em 3h (chat + email)', disponivel: true },
      { label: 'Sessão de onboarding 1:1 + treinamento de equipe', disponivel: true },
      { label: 'API REST básica para integrar com sistemas próprios', disponivel: true },
      { label: 'Agentes customizados pro seu escritório', disponivel: false },
      { label: 'Suporte WhatsApp 24h + Gerente dedicado', disponivel: false },
    ],
  },
  {
    id: 'enterprise', nome: 'Enterprise', tagline: '16+ advogados · White-label disponível',
    precoMensal: 1599,
    economiaReal: 'ROI de 8x sobre o investimento mensal',
    features: [
      { label: 'Tudo do Firma + agentes CUSTOMIZADOS treinados nos casos do escritório', disponivel: true },
      { label: 'Análises ilimitadas + fair use generoso', disponivel: true },
      { label: 'Histórico ilimitado + backup em nuvem dedicada', disponivel: true },
      { label: 'Suporte WhatsApp 24h + Gerente de conta dedicado', disponivel: true },
      { label: 'API privada com SLA 99.9% uptime', disponivel: true },
      { label: 'Opção on-premise (servidor próprio)', disponivel: true },
      { label: 'DPA contratado + auditoria LGPD anual', disponivel: true },
      { label: 'White-label opcional (marca do escritório)', disponivel: true },
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
  if (currentPlanId === 'solo') return 'starter'      // Solo upgradearia pra Escritório
  if (currentPlanId === 'starter') return 'pro'       // Escritório upgrade pra Firma
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
    // e usam demo de 50 min gratis. Money-back garantido por 7 dias apos
    // assinar (separado do trial pre-checkout).
    return 'Demo 50 min grátis'
  }
  if (planoId === currentPlanId) return 'Você está aqui'
  if (precoAtual > precoPlano) return 'Mudar para este plano'
  if (precoPlano > precoAtual) return 'Demo 50 min grátis'
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
    // automatico no starter, demo de 50 min sem pagar nos demais.
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
          cobrança <strong style={{ color: '#bfa68e' }}>por advogado registrado</strong> · R$ 599 a R$ 1.599 conforme plano
        </div>
      )}

      {/* PLAN CARDS */}
      <div
        style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14,
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
          // P0-8 audit fix (2026-05-02): Solo de-emphasized pra restaurar
          // anchor pricing. Antes Solo R$599 canibalizava Escritório R$1.399
          // (jump 2.3x = backfire psychology). Agora Solo entry-tier visual.
          const isSoloDeemphasized = plano.id === 'solo' && !currentPlanId

          return (
            <div key={plano.id} style={{
              position: 'relative',
              borderRadius: 16, overflow: 'hidden',
              opacity: isSoloDeemphasized ? 0.78 : 1,
              background: isEnterprisePremium
                ? 'radial-gradient(120% 140% at 20% 0%, rgba(212,174,106,0.12), transparent 60%), linear-gradient(180deg, rgba(20,15,8,0.92), rgba(10,10,10,0.94))'
                : isSoloDeemphasized
                  ? 'rgba(12,12,12,0.7)'
                  : 'rgba(15,15,15,0.82)',
              border: isEnterprisePremium
                ? '1px solid rgba(212,174,106,0.55)'
                : isDestaque
                  ? '2px solid rgba(212,174,106,0.62)'
                  : isSoloDeemphasized
                    ? '1px dashed rgba(191,166,142,0.18)'
                    : '1px solid rgba(191,166,142,0.14)',
              boxShadow: isEnterprisePremium
                ? '0 24px 60px rgba(212,174,106,0.12), inset 0 1px 0 rgba(255,255,255,0.04)'
                : isDestaque
                  ? '0 24px 56px rgba(212,174,106,0.18)'
                  : '0 8px 24px rgba(0,0,0,0.25)',
              transform: isDestaque ? 'translateY(-8px) scale(1.02)' : 'none',
              transition: 'transform 0.25s ease, border-color 0.2s ease, box-shadow 0.25s ease',
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
        @media (max-width: 1280px) {
          .lpg-plans-grid  { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 700px) {
          .lpg-plans-grid  { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 900px) {
          .lpg-trust-grid  { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  )
}

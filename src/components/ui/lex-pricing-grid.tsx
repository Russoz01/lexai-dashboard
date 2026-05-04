'use client'

/* ═════════════════════════════════════════════════════════════════════
 * LexPricingGrid · v12.0 (2026-05-03)
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
 *   Enterprise: R$ 1.599 / advogado / mês  (alinhado QA P0-9 — Sidebar + Sidebar)
 *   Firma:      R$ 1.459 / advogado / mês
 *   Escritório: R$ 1.399 / advogado / mês
 *   Solo:       R$   599 / advogado / mês  (badge "Para comecar")
 *
 * Audit business P0-1 (2026-05-03):
 *   - Reordenado pra Enterprise → Firma → Escritorio → Solo (cheap-to-the-right
 *     anchor effect — eye-track LTR vê o preço alto primeiro, ancora high).
 *   - Solo recebe badge "Para começar" pra desambiguar quem é o entry tier.
 *   - Enterprise bump pra R$2.499 foi REVERTIDO via QA P0-9 (alinhamento com
 *     Sidebar e Stripe Dashboard ao vivo — bump precisa ser coordenado em
 *     todas superficies + Stripe price IDs novos antes de aparecer aqui).
 *
 * Anual desconto (P0-3, 2026-05-03):
 *   - Toggle Mensal/Anual com badge "Economiza 17%" (2 meses grátis efetivo).
 *   - Anual default selecionado pra puxar conversão pro plano com churn menor.
 *   - Preços anuais: 17% desconto efetivo no /mes mostrado.
 *
 * Founding Member: 50% off vitalício pros primeiros 10 (cupom FOUNDING50).
 * Demo grátis aumentada de 30min → 50min (DB default + cópia em todos lugares).
 * ════════════════════════════════════════════════════════════════════ */

import { useState } from 'react'
import {
  Check, X, CheckCircle2, CreditCard, Headphones, Loader2, RotateCcw,
  ShieldCheck, Sparkles, TrendingUp, type LucideIcon,
} from 'lucide-react'

export type PlanoId = 'solo' | 'starter' | 'pro' | 'enterprise'

export type BillingInterval = 'monthly' | 'annual'

export interface LexPricingGridProps {
  /** Plano atual do usuário (marca "Você está aqui" + recalcula destaque). Omit se não autenticado. */
  currentPlanId?: PlanoId
  /** Handler de checkout. Recebe plano + intervalo (mensal/anual) pra decidir priceId Stripe. */
  onCheckout?: (plano: PlanoId, interval: BillingInterval) => void
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
  badge?: string                   // badge custom (ex: "Para começar" no Solo)
  precoMensal: number              // preço cobrança mensal (sem desconto)
  precoAnualMes: number            // preço /mes quando paga anual (~17% off)
  economiaReal: string
  features: { label: string; disponivel: boolean }[]
}

// Desconto anual aplicado: paga 10x ao invés de 12x = 16.67% off.
// Math.round pra evitar fração de centavo no display.
function calcAnualMes(mensal: number): number {
  return Math.round(mensal * 10 / 12)
}

/* ─────────────────────────────────────────────────────────────────────
 * Tiers redesign (2026-05-03 · audit business P0-1):
 *
 * Ordem visual: Enterprise → Firma → Escritorio → Solo (cheap-to-the-right).
 * Eye-track LTR pega o preço alto primeiro = anchor que faz Firma parecer
 * acessível ao invés de Solo parecer barato (que era o reverso, canibalizando
 * Escritorio).
 *
 * Tiers e justificativa de preço:
 *   Enterprise (R$1.599) — Firma + agentes CUSTOM treinados, on-premise,
 *                          white-label, SLA 99.9%, DPA. Bump pra R$2.499 ficou
 *                          pendente (precisa criar prices novos no Stripe +
 *                          alinhar Sidebar antes — QA P0-9 reverteu temporario).
 *   Firma      (R$1.459) — TODOS 27 agentes, 6-15 advs, onboarding + API.
 *   Escritorio (R$1.399) — 18 agentes, 1-5 advs, integração básica.
 *   Solo       (R$  599) — 8 agentes essenciais, advogado autônomo (badge
 *                          "Para começar" pra desambiguar entry tier).
 * ───────────────────────────────────────────────────────────────────── */
const PLANOS: Plano[] = [
  {
    id: 'enterprise', nome: 'Enterprise', tagline: '16+ advogados · White-label disponível',
    precoMensal: 1599,
    precoAnualMes: calcAnualMes(1599),
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
  {
    id: 'pro', nome: 'Firma', tagline: '6–15 advogados · Mais escolhido',
    precoMensal: 1459,
    precoAnualMes: calcAnualMes(1459),
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
    id: 'starter', nome: 'Escritório', tagline: '1–5 advogados',
    precoMensal: 1399,
    precoAnualMes: calcAnualMes(1399),
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
    id: 'solo', nome: 'Solo', tagline: 'Advogado autônomo',
    badge: 'Para começar',
    precoMensal: 599,
    precoAnualMes: calcAnualMes(599),
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
  _precoPlano: number, _precoAtual: number,
): string {
  // 2026-05-04 demo polish (Leonardo): Stripe checkout offline temporariamente.
  // Todos os CTAs apontam pra WhatsApp comercial. Pos-stripe-prices criado,
  // reverter este getCtaLabel pra logica de pricing comparativo.
  if (planoId === currentPlanId) return 'Você está aqui'
  return 'Falar com comercial'
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

  // Anual default selected — empurra pra plano com churn menor (P0-3 audit).
  // Usuario que paga anual normalmente nao cancela mes-a-mes, MRR mais previsivel.
  // 2026-05-03 fix P1-1: gate via env var. Se NEXT_PUBLIC_BILLING_ANNUAL=0,
  // toggle some + default forca 'monthly' pra evitar checkout broken quando
  // os 4 STRIPE_PRICE_*_ANNUAL ainda nao foram criados no Stripe Dashboard.
  const annualEnabled = process.env.NEXT_PUBLIC_BILLING_ANNUAL !== '0'
  const [billingInterval, setBillingInterval] = useState<BillingInterval>(
    annualEnabled ? 'annual' : 'monthly',
  )

  function handleClick(plano: Plano) {
    if (plano.id === currentPlanId) return
    // 2026-05-04 demo polish (Leonardo): Stripe offline. Click vai pra WhatsApp
    // comercial com mensagem pre-preenchida sobre o plano clicado. Reverter
    // pra checkout flow quando STRIPE_PRICE_*_ANNUAL estiverem criados.
    const planoLabel = plano.nome || plano.id
    const msg = `Olá, gostaria de saber mais sobre o plano ${planoLabel} da Pralvex.`
    window.location.href = `https://wa.me/5534993026456?text=${encodeURIComponent(msg)}`
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
                background: 'var(--card-bg)',
                border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', gap: 12,
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'var(--accent-light)',
                border: '1px solid var(--stone-line)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <t.Icon size={16} strokeWidth={1.75} style={{ color: 'var(--accent)' }} aria-hidden />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{t.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{t.sub}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PRICING NOTE */}
      {!hidePricingNote && (
        <div style={{
          textAlign: 'center', marginBottom: 16,
          fontSize: 12, color: 'var(--text-secondary)',
          fontFamily: 'var(--font-mono, ui-monospace), "SF Mono", Menlo, monospace',
          letterSpacing: '0.08em',
        }}>
          cobrança <strong style={{ color: 'var(--accent)' }}>por advogado registrado</strong> · R$ 599 a R$ 1.599 conforme plano
        </div>
      )}

      {/* BILLING TOGGLE — Mensal / Anual (audit business P0-3 · 2026-05-03)
          Anual default selected. Badge "Economiza 17%" pra ancorar valor.
          2026-05-03 fix P1-1: hidden if NEXT_PUBLIC_BILLING_ANNUAL=0 (gate
          ate criar 4 STRIPE_PRICE_*_ANNUAL no Dashboard). */}
      {annualEnabled && (
      <div
        role="radiogroup"
        aria-label="Selecionar intervalo de cobrança"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 0, marginBottom: 22,
        }}
      >
        <div style={{
          display: 'inline-flex', padding: 4, borderRadius: 999,
          border: '1px solid var(--border)',
          background: 'var(--card-bg)',
          gap: 4,
        }}>
          <button
            type="button"
            role="radio"
            aria-checked={billingInterval === 'monthly'}
            onClick={() => setBillingInterval('monthly')}
            style={{
              padding: '8px 18px', borderRadius: 999, border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-mono, ui-monospace), monospace',
              fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700,
              background: billingInterval === 'monthly'
                ? 'linear-gradient(135deg, #f5e8d3, #bfa68e)'
                : 'transparent',
              color: billingInterval === 'monthly' ? '#0a0a0a' : 'var(--text-secondary)',
              transition: 'all 0.18s ease',
            }}
          >
            Mensal
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={billingInterval === 'annual'}
            onClick={() => setBillingInterval('annual')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 18px', borderRadius: 999, border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-mono, ui-monospace), monospace',
              fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700,
              background: billingInterval === 'annual'
                ? 'linear-gradient(135deg, #f5e8d3, #bfa68e)'
                : 'transparent',
              color: billingInterval === 'annual' ? '#0a0a0a' : 'var(--text-secondary)',
              transition: 'all 0.18s ease',
            }}
          >
            Anual
            <span style={{
              fontSize: 9, padding: '2px 6px', borderRadius: 6,
              background: billingInterval === 'annual'
                ? 'rgba(10,10,10,0.16)'
                : 'var(--accent-light)',
              color: billingInterval === 'annual' ? '#0a0a0a' : 'var(--accent)',
              letterSpacing: '0.1em',
              border: billingInterval === 'annual' ? 'none' : '1px solid var(--stone-line)',
            }}>
              −17%
            </span>
          </button>
        </div>
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
          const badgeLabel = getBadgeLabel(plano.id, currentPlanId) ?? plano.badge ?? null
          // Preço exibido depende do toggle: anual mostra /mes com desconto.
          const preco = billingInterval === 'annual' ? plano.precoAnualMes : plano.precoMensal
          // Economia anual em R$ — aplicado quando intervalo anual.
          // (precoMensal × 12) − (precoAnualMes × 12) = total economizado/ano.
          const economiaAnualValor = (plano.precoMensal - plano.precoAnualMes) * 12
          const isCurrentPlan = plano.id === currentPlanId
          const isEnterprisePremium = plano.id === 'enterprise' && currentPlanId === 'enterprise'
          const isLoadingThis = loadingPlan === plano.id
          const isLoadingOther = loadingPlan !== null && loadingPlan !== plano.id
          // P0-8 audit fix (2026-05-02): Solo de-emphasized pra restaurar
          // anchor pricing. Antes Solo R$599 canibalizava Escritório R$1.399
          // (jump 2.3x = backfire psychology). Agora Solo entry-tier visual.
          // P0-1 (2026-05-03): grid reordenado pra Enterprise → Firma → Escritorio
          // → Solo, dashed border do Solo continua marcando entry tier.
          const isSoloDeemphasized = plano.id === 'solo' && !currentPlanId

          return (
            <div key={plano.id} style={{
              position: 'relative',
              borderRadius: 16, overflow: 'hidden',
              opacity: isSoloDeemphasized ? 0.78 : 1,
              background: isEnterprisePremium
                ? 'radial-gradient(120% 140% at 20% 0%, var(--accent-light), transparent 60%), var(--card-solid)'
                : 'var(--card-bg)',
              border: isEnterprisePremium
                ? '1px solid var(--stone)'
                : isDestaque
                  ? '2px solid var(--stone)'
                  : isSoloDeemphasized
                    ? '1px dashed var(--stone-line)'
                    : '1px solid var(--border)',
              boxShadow: isEnterprisePremium
                ? '0 24px 60px var(--shadow), inset 0 1px 0 rgba(255,255,255,0.04)'
                : isDestaque
                  ? '0 24px 56px var(--glow)'
                  : '0 8px 24px var(--shadow)',
              transform: isDestaque ? 'translateY(-8px) scale(1.02)' : 'none',
              transition: 'transform 0.25s ease, border-color 0.2s ease, box-shadow 0.25s ease',
            }}>
              {badgeLabel && (
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0,
                  padding: '7px 0', textAlign: 'center',
                  // Solo "Para começar" usa stone-line muted (entry tier visual).
                  // Destaque "MAIS ESCOLHIDO"/"SEU PLANO PREMIUM" continua gold.
                  background: plano.id === 'solo' && !isDestaque
                    ? 'var(--hover)'
                    : 'linear-gradient(135deg, #f5e8d3, #bfa68e, #7a5f48)',
                  color: plano.id === 'solo' && !isDestaque ? 'var(--text-secondary)' : '#0a0a0a',
                  borderBottom: plano.id === 'solo' && !isDestaque ? '1px solid var(--stone-line)' : 'none',
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
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 20 }}>
                  {plano.tagline}
                </div>

                {/* Preço */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 600 }}>R$</span>
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
                  color: 'var(--text-secondary)', marginBottom: billingInterval === 'annual' ? 8 : 14,
                }}>
                  por advogado / mês{billingInterval === 'annual' ? ' · cobrado anualmente' : ''}
                </div>

                {/* Economia anual — só aparece com toggle Anual selecionado */}
                {billingInterval === 'annual' && economiaAnualValor > 0 && (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '4px 10px', borderRadius: 999, marginBottom: 14,
                    background: 'var(--accent-light)',
                    border: '1px solid var(--stone-line)',
                    fontFamily: 'var(--font-mono, ui-monospace), monospace',
                    fontSize: 10, letterSpacing: '0.12em',
                    color: 'var(--accent)', fontWeight: 700,
                  }}>
                    <Sparkles size={10} strokeWidth={2.2} aria-hidden />
                    Economiza R$ {economiaAnualValor.toLocaleString('pt-BR')}/ano
                  </div>
                )}

                {/* Economia real */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 12px', borderRadius: 10, marginBottom: 20,
                  background: 'var(--accent-light)',
                  border: '1px solid var(--stone-line)',
                  fontSize: 11, color: 'var(--accent)', fontWeight: 500, lineHeight: 1.4,
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
                        background: f.disponivel ? 'var(--accent-light)' : 'var(--hover)',
                        border: `1px solid ${f.disponivel ? 'var(--stone-line)' : 'var(--border)'}`,
                        color: f.disponivel ? 'var(--accent)' : 'var(--text-muted)',
                        marginTop: 1,
                      }}>
                        {f.disponivel
                          ? <Check size={11} strokeWidth={2.5} aria-hidden />
                          : <X size={11} strokeWidth={2.5} aria-hidden />}
                      </span>
                      <span style={{
                        fontSize: 12, lineHeight: 1.5,
                        color: f.disponivel ? 'var(--text-primary)' : 'var(--text-muted)',
                        textDecoration: f.disponivel ? 'none' : 'line-through',
                        textDecorationColor: 'var(--text-muted)',
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
                      ? 'var(--hover)'
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
                        ? '1px solid var(--stone)'
                        : '1px solid var(--stone-line)',
                    boxShadow: isDestaque && !isCurrentPlan ? '0 12px 32px var(--glow)' : 'none',
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

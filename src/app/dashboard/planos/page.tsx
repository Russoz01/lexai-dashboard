'use client'

/* ═════════════════════════════════════════════════════════════
 * PLANOS — v10 editorial dark
 * ─────────────────────────────────────────────────────────────
 * Voz Renato · champagne + noir + ouro antigo.
 * Segue padrão visual da landing / dashboard / CRM.
 * ═════════════════════════════════════════════════════════════ */

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  AlertCircle, CheckCircle2, Clock, CreditCard, Gem, Loader2, MinusCircle,
  Rocket, RotateCcw, ShieldCheck, Smile, Sparkles, Star, XCircle, Zap,
  type LucideIcon,
} from 'lucide-react'
import { LexPricingGrid, type PlanoId } from '@/components/ui/lex-pricing-grid'
import { LexComparison } from '@/components/ui/lex-comparison'

const BENEFICIOS_ENTERPRISE = [
  'Onboarding dedicado com especialista jurídico',
  'Acesso antecipado a novos agentes e funcionalidades',
  'SLA de resposta garantido em 4h para chamados críticos',
  'Treinamento personalizado para sua equipe',
]

const GUARANTEE_POINTS: { Icon: LucideIcon; text: string }[] = [
  { Icon: Clock,     text: '7 dias para testar' },
  { Icon: RotateCcw, text: 'Reembolso em 24h' },
  { Icon: Smile,     text: 'Sem perguntas' },
]

type CancelReason = 'caro' | 'nao_usei' | 'falta_feature' | 'mudei_sistema' | 'outro'
type CancelOffer = 'cupom_30' | 'onboarding' | 'beta' | 'pause'

const REASON_LABELS: Record<CancelReason, string> = {
  caro:           'Está muito caro',
  nao_usei:       'Não consegui usar direito',
  falta_feature:  'Falta uma funcionalidade que preciso',
  mudei_sistema:  'Mudei pra outro sistema',
  outro:          'Outro motivo',
}

const REASON_TO_OFFER: Record<CancelReason, { offer: CancelOffer; title: string; body: string; cta: string }> = {
  caro: {
    offer: 'cupom_30',
    title: '30% off por 3 meses pra você ficar',
    body: 'A gente sabe que orçamento aperta. Aqui está um cupom que reduz a mensalidade em 30% pelos próximos 3 meses — sem mexer no plano.',
    cta: 'Aceitar 30% off',
  },
  nao_usei: {
    offer: 'onboarding',
    title: 'Onboarding 1:1 grátis com nosso time',
    body: 'Provavelmente você não viu metade do que a Pralvex faz. Topa 30 min com a gente pra mostrar atalhos e fluxos? É grátis, agendamos em 24h.',
    cta: 'Agendar onboarding',
  },
  falta_feature: {
    offer: 'beta',
    title: 'Conta o que falta — entra no programa beta',
    body: 'Diz qual funcionalidade você precisa e a gente já te coloca na fila do beta. Você ganha acesso antecipado quando chegar.',
    cta: 'Quero entrar no beta',
  },
  mudei_sistema: {
    offer: 'pause',
    title: 'Pausa de 90 dias antes de cancelar',
    body: 'Em vez de cancelar, pausa por 90 dias. Sua conta fica congelada (sem cobrança) e você reativa quando quiser — sem perder histórico.',
    cta: 'Pausar 90 dias',
  },
  outro: {
    offer: 'onboarding',
    title: 'Quer conversar antes de decidir?',
    body: 'Marque 15 min com nosso time pra conversar sobre o que está te incomodando. Sem pressão de vendas — só queremos entender.',
    cta: 'Marcar conversa',
  },
}

function PlanosPageInner() {
  const searchParams = useSearchParams()
  const [planoAtual, setPlanoAtual] = useState<PlanoId>('starter')
  const [loadingPlan, setLoadingPlan] = useState<PlanoId | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)
  const [toast, setToast] = useState<{ kind: 'success' | 'error' | 'info'; msg: string } | null>(null)

  // Save flow modal state — audit business P1-2 (2026-05-03)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState<CancelReason | null>(null)
  const [cancelStep, setCancelStep] = useState<'reason' | 'offer'>('reason')
  const [cancelDetail, setCancelDetail] = useState('')

  // Server-side plan source of truth (antes era localStorage exploitavel)
  // QA P0-3 fix (2026-05-03): API retorna `plano`, nao `plan`. Antes /planos
  // caia em fallback default 'starter' pra todo Pro/Firma/Enterprise.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/user/plan', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json() as { plano?: string }
        // Demo wave3 fix (2026-05-03): cobre 'solo' e 'free' que cairam em null
        // antes e deixavam usuario stuck em 'starter' default na UI.
        const normalized = data.plano === 'firma' ? 'pro'
          : data.plano === 'escritorio' ? 'starter'
          : data.plano === 'enterprise' ? 'enterprise'
          : data.plano === 'pro' ? 'pro'
          : data.plano === 'starter' ? 'starter'
          : data.plano === 'solo' ? 'solo'
          : data.plano === 'free' ? 'solo'
          : null
        if (!cancelled && normalized) setPlanoAtual(normalized as PlanoId)
      } catch { /* silent */ }
    })()
    return () => { cancelled = true }
  }, [])

  // Feedback Stripe Checkout via querystring
  useEffect(() => {
    const checkout = searchParams.get('checkout')
    if (checkout === 'success') {
      setToast({ kind: 'success', msg: 'Assinatura criada. Obrigado por confiar na Pralvex.' })
    } else if (checkout === 'cancelled') {
      setToast({ kind: 'info', msg: 'Checkout cancelado. Pode tentar de novo quando quiser.' })
    }
    if (!checkout) return
    const t = setTimeout(() => setToast(null), 5000)
    return () => clearTimeout(t)
  }, [searchParams])

  async function iniciarCheckout(plano: PlanoId, interval: 'monthly' | 'annual' = 'monthly') {
    setLoadingPlan(plano)
    setToast(null)
    try {
      // P0-2 audit business (2026-05-03): emit InitiateCheckout pra Meta/GA4/LinkedIn
      // antes do redirect — eventos client-side garantem dedup com server-side Purchase.
      if (typeof window !== 'undefined' && (window as Window & { pralvexPixels?: { initiateCheckout?: (p: string, i: string) => void } }).pralvexPixels) {
        (window as Window & { pralvexPixels?: { initiateCheckout?: (p: string, i: string) => void } }).pralvexPixels?.initiateCheckout?.(plano, interval)
      }
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: plano, interval }),
      })
      const data = await res.json() as { url?: string; error?: string }
      if (res.ok && data.url) {
        window.location.href = data.url
        return
      }
      if (data.error === 'unauthenticated') {
        window.location.href = `/login?next=${encodeURIComponent('/dashboard/planos')}`
        return
      }
      setToast({ kind: 'error', msg: 'Não foi possível abrir o checkout. Tente novamente em instantes.' })
    } catch {
      setToast({ kind: 'error', msg: 'Erro de conexão. Verifique sua internet e tente de novo.' })
    } finally {
      setLoadingPlan(null)
    }
  }

  // P1-2 audit (2026-05-03): em vez de redirecionar direto pro Stripe Portal,
  // abre o save flow modal pra coletar motivo + oferecer counter-offer.
  function abrirPortal() {
    setCancelModalOpen(true)
    setCancelReason(null)
    setCancelStep('reason')
    setCancelDetail('')
  }

  // Apos modal: redireciona pro Stripe Customer Portal (cancelamento real)
  async function prosseguirParaPortal() {
    setPortalLoading(true)
    setToast(null)
    // Registra que usuario decidiu seguir mesmo com counter-offer
    if (cancelReason) {
      try {
        await fetch('/api/cancel-reasons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reason: cancelReason,
            detail: cancelDetail || undefined,
            offered: REASON_TO_OFFER[cancelReason].offer,
            accepted: false,
            proceeded: true,
          }),
        })
      } catch { /* nao bloqueia portal */ }
    }
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json() as { url?: string }
      if (data.url) {
        window.location.href = data.url
        return
      }
      setToast({ kind: 'error', msg: 'Não foi possível abrir o portal. Tente novamente.' })
    } catch {
      setToast({ kind: 'error', msg: 'Erro ao abrir o portal de pagamento.' })
    } finally {
      setPortalLoading(false)
      setCancelModalOpen(false)
    }
  }

  // Aceitar counter-offer = registra accepted=true + fecha modal sem ir pro portal
  async function aceitarCounterOffer() {
    if (!cancelReason) return
    try {
      await fetch('/api/cancel-reasons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: cancelReason,
          detail: cancelDetail || undefined,
          offered: REASON_TO_OFFER[cancelReason].offer,
          accepted: true,
          proceeded: false,
        }),
      })
    } catch { /* silent */ }
    setCancelModalOpen(false)
    setToast({ kind: 'success', msg: 'Combinado. Nosso time vai te chamar em breve.' })
  }

  // Destaque para o CTA final: o plano mais premium que o usuário ainda não tem
  const destaqueId: PlanoId =
    planoAtual === 'solo' ? 'starter'
      : planoAtual === 'starter' ? 'pro'
        : planoAtual === 'pro' ? 'enterprise'
          : 'enterprise'

  return (
    <div className="agent-page" style={{ maxWidth: 1400 }}>
      {/* TOAST INLINE (checkout feedback + portal erro) */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed', top: 96, left: '50%', transform: 'translateX(-50%)',
            zIndex: 50, maxWidth: 460, padding: '12px 18px', borderRadius: 12,
            background: toast.kind === 'success'
              ? 'linear-gradient(135deg, rgba(16,185,129,0.18), rgba(16,185,129,0.05))'
              : toast.kind === 'error'
                ? 'linear-gradient(135deg, rgba(239,68,68,0.18), rgba(239,68,68,0.05))'
                : 'linear-gradient(135deg, rgba(212,174,106,0.18), rgba(212,174,106,0.05))',
            border: `1px solid ${toast.kind === 'success' ? 'rgba(16,185,129,0.35)' : toast.kind === 'error' ? 'rgba(239,68,68,0.35)' : 'rgba(212,174,106,0.35)'}`,
            color: 'var(--text-primary)',
            display: 'flex', alignItems: 'center', gap: 10, fontSize: 13,
            backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
            boxShadow: '0 20px 48px rgba(0,0,0,0.4)',
          }}
        >
          {toast.kind === 'success' && <CheckCircle2 size={16} strokeWidth={2} style={{ color: '#10b981', flexShrink: 0 }} aria-hidden />}
          {toast.kind === 'error' && <AlertCircle size={16} strokeWidth={2} style={{ color: '#ef4444', flexShrink: 0 }} aria-hidden />}
          {toast.kind === 'info' && <Sparkles size={16} strokeWidth={2} style={{ color: 'var(--accent)', flexShrink: 0 }} aria-hidden />}
          <span>{toast.msg}</span>
        </div>
      )}

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
          Oferta de lançamento · demo 50 min grátis
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

      {/* PLANOS — componente canônico (v10.12) */}
      <div style={{ marginBottom: 32 }}>
        <LexPricingGrid
          currentPlanId={planoAtual}
          onCheckout={iniciarCheckout}
          loadingPlan={loadingPlan}
        />
      </div>

      {/* COMPARATIVO COMPETITIVO — audit business P0-4 (2026-05-03) */}
      {/* Pralvex × Astrea/Projuris/Themis em 21 linhas decisivas. */}
      {/* Se decisor entra ja autenticado pra trocar plano, comparativo */}
      {/* dilui ansiedade de "sera que vale a pena" e ancora valor. */}
      <div style={{ marginBottom: 24, marginLeft: -28, marginRight: -28 }}>
        <LexComparison />
      </div>

      {/* GERENCIAR ASSINATURA */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20,
        padding: 22, borderRadius: 14, marginBottom: 22,
        background: 'var(--card-bg)',
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
          type="button" onClick={abrirPortal} disabled={portalLoading}
          style={{
            padding: '12px 18px', borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg, #f5e8d3, #bfa68e)',
            color: 'var(--bg-base)', border: '1px solid rgba(212,174,106,0.5)',
            fontFamily: 'var(--font-mono, ui-monospace), monospace',
            fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700,
            cursor: portalLoading ? 'wait' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
            boxShadow: '0 10px 28px rgba(212,174,106,0.22)',
            opacity: portalLoading ? 0.7 : 1,
          }}
        >
          {portalLoading ? <Loader2 size={13} strokeWidth={2} className="animate-spin" aria-hidden /> : <CreditCard size={13} strokeWidth={2} aria-hidden />}
          {portalLoading ? 'Abrindo...' : 'Abrir portal Stripe'}
        </button>
      </div>

      {/* ENTERPRISE EXCLUSIVE */}
      {planoAtual === 'enterprise' && (
        <div style={{
          padding: 24, borderRadius: 14, marginBottom: 32,
          background: 'radial-gradient(140% 140% at 20% 0%, rgba(212,174,106,0.12), transparent 60%), var(--card-bg)',
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
                background: 'var(--hover)',
                border: '1px solid var(--stone-line)',
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
        background: 'var(--card-bg)',
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
            sem Pralvex <span style={{ color: 'var(--text-muted)', margin: '0 8px', fontStyle: 'normal', fontSize: 16 }}>versus</span> com Pralvex
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
              color: 'var(--danger)', fontWeight: 700,
            }}>
              <XCircle size={14} strokeWidth={2} aria-hidden /> Sem Pralvex
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
                <MinusCircle size={11} strokeWidth={2} style={{ color: 'var(--danger)', marginTop: 3, flexShrink: 0 }} aria-hidden />
                {item}
              </div>
            ))}
          </div>
          <div style={{
            padding: 18, borderRadius: 12,
            background: 'radial-gradient(120% 140% at 20% 0%, rgba(212,174,106,0.08), transparent 60%), var(--hover)',
            border: '1px solid rgba(212,174,106,0.3)',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
              fontFamily: 'var(--font-mono, ui-monospace), monospace',
              fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase',
              color: 'var(--accent)', fontWeight: 700,
            }}>
              <CheckCircle2 size={14} strokeWidth={2} aria-hidden /> Com Pralvex
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

      {/* OFICIO INTERNO — trust block honesto (substituiu testemunhos fake) */}
      <div style={{
        padding: 28, borderRadius: 14, marginBottom: 24,
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div style={{
            fontFamily: 'var(--font-mono, ui-monospace), monospace',
            fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase',
            color: 'var(--accent)', marginBottom: 8,
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}>
            <Sparkles size={11} strokeWidth={2} aria-hidden /> Ofício interno
          </div>
          <div style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 28, fontStyle: 'italic', fontWeight: 500,
            color: 'var(--text-primary)', letterSpacing: '-0.01em',
          }}>
            como o atelier funciona por dentro
          </div>
          <div style={{
            marginTop: 10, fontSize: 13, color: 'var(--text-muted)', maxWidth: 560, margin: '10px auto 0',
          }}>
            Pralvex é nova. No lugar de depoimentos, estes são os três pactos que sustentam o produto hoje — os mesmos que você poderá auditar a qualquer momento dentro da conta.
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="lp-test-grid">
          {[
            {
              numero: 'I',
              titulo: 'Ferramenta de apoio',
              corpo: 'Toda saída termina com revisão humana obrigatória por profissional habilitado. O fluxo se recusa quando a confiança cai abaixo do limite — exatamente como o Provimento 205 exige.',
              icon: ShieldCheck,
            },
            {
              numero: 'II',
              titulo: 'Seus dados ficam seus',
              corpo: 'Nenhum documento enviado treina o modelo. Isolamento por sessão, AES-256 em repouso, TLS 1.3 em trânsito e servidor em São Paulo (AWS sa-east-1). DPA assinado conforme LGPD.',
              icon: Gem,
            },
            {
              numero: 'III',
              titulo: 'Compliance validado saída a saída',
              corpo: 'Claims proibidos pela OAB são bloqueados antes da entrega. Audit log completo por usuário — você pode conferir cada validação quando quiser.',
              icon: CheckCircle2,
            },
          ].map((t, i) => {
            const Ico = t.icon
            return (
              <div key={i} style={{
                padding: 22, borderRadius: 12,
                background: 'var(--hover)',
                border: '1px solid var(--stone-line)',
                display: 'flex', flexDirection: 'column', gap: 14,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{
                    fontFamily: 'var(--font-mono, ui-monospace), monospace',
                    fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase',
                    color: 'var(--accent)',
                  }}>
                    N° {t.numero}
                  </div>
                  <div style={{
                    width: 32, height: 32, borderRadius: 999,
                    background: 'var(--stone-soft)',
                    border: '1px solid var(--stone)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--accent)',
                  }}>
                    <Ico size={14} strokeWidth={2} aria-hidden />
                  </div>
                </div>
                <div style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 20, fontWeight: 500, letterSpacing: '-0.01em',
                  color: 'var(--text-primary)',
                }}>
                  {t.titulo}
                </div>
                <div style={{
                  fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.6,
                }}>
                  {t.corpo}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* GUARANTEE */}
      <div style={{
        padding: 28, borderRadius: 14, marginBottom: 24, textAlign: 'center',
        background: 'radial-gradient(120% 160% at 50% 0%, rgba(93,123,79,0.08), transparent 60%), var(--card-bg)',
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
          Teste todos os agentes sem risco. Se a Pralvex não economizar pelo menos 5 horas do seu trabalho na primeira semana, devolvemos 100% do valor. Sem perguntas, sem burocracia.
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
          color: 'var(--danger)', fontWeight: 700,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--danger)', boxShadow: '0 0 8px #d88977',
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
          onClick={() => void iniciarCheckout(destaqueId)}
          disabled={loadingPlan !== null}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '16px 30px', borderRadius: 12,
            background: 'linear-gradient(135deg, #f5e8d3, #bfa68e, #7a5f48)',
            color: 'var(--bg-base)',
            fontFamily: 'var(--font-mono, ui-monospace), monospace',
            fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase',
            border: '1px solid rgba(212,174,106,0.5)',
            boxShadow: '0 16px 42px rgba(212,174,106,0.28)',
            cursor: loadingPlan ? 'progress' : 'pointer',
            opacity: loadingPlan ? 0.7 : 1,
            transition: 'opacity 0.2s ease',
          }}
        >
          {loadingPlan === destaqueId ? (
            <Loader2 size={15} strokeWidth={1.75} aria-hidden className="anim-spin" />
          ) : (
            <Rocket size={15} strokeWidth={1.75} aria-hidden />
          )}
          Demo 50 min grátis
        </button>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 16 }}>
          Cancele a qualquer momento · Sem cobrança durante a demo · Suporte em português
        </div>
      </div>

      {/* FAQ */}
      <div style={{
        padding: 28, borderRadius: 14, marginBottom: 20,
        background: 'var(--card-bg)',
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
          { q: 'Preciso ter conhecimento técnico para usar?', a: 'Não. A Pralvex foi projetada para ser usada por advogados sem nenhum conhecimento de programação. Você digita em português e a IA responde estruturado, pronto para usar.' },
          { q: 'Os documentos que eu enviar ficam seguros?', a: 'Totalmente. Somos LGPD compliant, todos os dados são criptografados em trânsito e em repouso. Não usamos seus documentos para treinar modelos. Sua privacidade é prioridade.' },
          { q: 'Posso trocar de plano depois?', a: 'Sim, você pode fazer upgrade ou downgrade a qualquer momento. A diferença é calculada proporcionalmente. Sem fidelidade nem multa.' },
          { q: 'Como funciona o limite de documentos?', a: 'Cada análise, pesquisa ou peça conta como 1 documento. O contador reseta no início do mês. Se atingir o limite, você recebe aviso e pode fazer upgrade ou aguardar o próximo ciclo.' },
          { q: 'Quanto tempo eu economizo de verdade?', a: 'A média dos nossos usuários é 12 a 20 horas por semana. Uma análise de contrato que levaria 3h leva 45 segundos. Uma peça que você escreveria em 2h sai pronta em 2 minutos.' },
          { q: 'Como funciona a cobrança por advogado?', a: 'O valor por advogado varia conforme o plano: Solo R$ 599, Escritório R$ 1.399, Firma R$ 1.459 e Enterprise R$ 1.599. Quanto maior o plano, mais agentes e recursos disponíveis por usuário. Pagamento anual tem 17% de desconto.' },
        ].map((item, i, arr) => (
          <div key={i} style={{
            padding: '16px 0',
            borderBottom: i < arr.length - 1 ? '1px solid var(--stone-line)' : 'none',
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
        dúvidas? contato@pralvex.com.br
      </div>

      {/* SAVE FLOW MODAL — audit business P1-2 (2026-05-03) */}
      {/* Antes de redirecionar pro Stripe Customer Portal, oferece counter-offer. */}
      {cancelModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-modal-title"
          onClick={() => setCancelModalOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 540, width: '100%',
              padding: 28, borderRadius: 16,
              background: 'var(--card-solid)',
              border: '1px solid var(--stone-line)',
              boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
            }}
          >
            {cancelStep === 'reason' ? (
              <>
                <div style={{
                  fontFamily: 'var(--font-mono, ui-monospace), monospace',
                  fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase',
                  color: 'var(--accent)', marginBottom: 10,
                }}>
                  Antes de você ir
                </div>
                <h2 id="cancel-modal-title" style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 24, fontStyle: 'italic', fontWeight: 500,
                  color: 'var(--text-primary)', margin: '0 0 8px',
                  letterSpacing: '-0.01em', lineHeight: 1.2,
                }}>
                  conta o que ta faltando?
                </h2>
                <p style={{
                  fontSize: 13.5, color: 'var(--text-secondary)',
                  margin: '0 0 18px', lineHeight: 1.55,
                }}>
                  Sem julgamento. A gente quer entender pra melhorar — e quem sabe achar uma solução melhor pra você antes de cancelar.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
                  {(Object.keys(REASON_LABELS) as CancelReason[]).map((r) => (
                    <label
                      key={r}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                        border: '1px solid ' + (cancelReason === r ? 'var(--accent)' : 'var(--border)'),
                        background: cancelReason === r ? 'var(--accent-light)' : 'var(--card-bg)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <input
                        type="radio"
                        name="cancel-reason"
                        value={r}
                        checked={cancelReason === r}
                        onChange={() => setCancelReason(r)}
                        style={{ accentColor: 'var(--accent)' }}
                      />
                      <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>
                        {REASON_LABELS[r]}
                      </span>
                    </label>
                  ))}
                </div>
                {cancelReason === 'outro' && (
                  <textarea
                    value={cancelDetail}
                    onChange={(e) => setCancelDetail(e.target.value.slice(0, 1000))}
                    placeholder="Conta um pouco do que está acontecendo..."
                    style={{
                      width: '100%', minHeight: 80, padding: 12, borderRadius: 8,
                      border: '1px solid var(--border)', background: 'var(--hover)',
                      color: 'var(--text-primary)', fontSize: 13, marginBottom: 14,
                      fontFamily: 'inherit', resize: 'vertical',
                    }}
                  />
                )}
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setCancelModalOpen(false)}
                    style={{
                      // Match com botao primary ao lado: era 10px 16px, primary
                      // tinha 10px 18px — agora ambos 12/20 = mesma height (44px).
                      padding: '12px 20px', borderRadius: 8, border: '1px solid var(--border)',
                      background: 'transparent', color: 'var(--text-secondary)',
                      fontSize: 13, cursor: 'pointer',
                    }}
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    onClick={() => cancelReason && setCancelStep('offer')}
                    disabled={!cancelReason}
                    style={{
                      padding: '12px 20px', borderRadius: 8, border: '1px solid var(--stone)',
                      background: cancelReason ? 'linear-gradient(135deg, #f5e8d3, #bfa68e)' : 'var(--hover)',
                      color: cancelReason ? '#0a0a0a' : 'var(--text-muted)',
                      fontSize: 13, fontWeight: 700, cursor: cancelReason ? 'pointer' : 'not-allowed',
                    }}
                  >
                    Continuar
                  </button>
                </div>
              </>
            ) : (
              cancelReason && (
                <>
                  <div style={{
                    fontFamily: 'var(--font-mono, ui-monospace), monospace',
                    fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase',
                    color: 'var(--accent)', marginBottom: 10,
                  }}>
                    Antes de você ir · proposta
                  </div>
                  <h2 style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: 24, fontStyle: 'italic', fontWeight: 500,
                    color: 'var(--text-primary)', margin: '0 0 10px',
                    letterSpacing: '-0.01em', lineHeight: 1.25,
                  }}>
                    {REASON_TO_OFFER[cancelReason].title}
                  </h2>
                  <p style={{
                    fontSize: 14, color: 'var(--text-secondary)',
                    margin: '0 0 22px', lineHeight: 1.6,
                  }}>
                    {REASON_TO_OFFER[cancelReason].body}
                  </p>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    <button
                      type="button"
                      onClick={prosseguirParaPortal}
                      disabled={portalLoading}
                      style={{
                        // Antes 10px 16px — gerava 40px height enquanto o botao
                        // primary ao lado tinha 44px. Mesmo row, alturas diferentes.
                        padding: '12px 20px', borderRadius: 8,
                        border: '1px solid var(--border)', background: 'transparent',
                        color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer',
                      }}
                    >
                      {portalLoading ? 'Abrindo...' : 'Cancelar mesmo assim'}
                    </button>
                    <button
                      type="button"
                      onClick={aceitarCounterOffer}
                      style={{
                        padding: '12px 20px', borderRadius: 8, border: '1px solid var(--stone)',
                        background: 'linear-gradient(135deg, #f5e8d3, #bfa68e, #7a5f48)',
                        color: '#0a0a0a', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                        boxShadow: '0 8px 24px rgba(212,174,106,0.35)',
                      }}
                    >
                      {REASON_TO_OFFER[cancelReason].cta}
                    </button>
                  </div>
                </>
              )
            )}
          </div>
        </div>
      )}

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

export default function PlanosPage() {
  return (
    <Suspense fallback={<div className="page-content" aria-hidden />}>
      <PlanosPageInner />
    </Suspense>
  )
}

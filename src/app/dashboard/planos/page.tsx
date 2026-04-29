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

function PlanosPageInner() {
  const searchParams = useSearchParams()
  const [planoAtual, setPlanoAtual] = useState<PlanoId>('starter')
  const [loadingPlan, setLoadingPlan] = useState<PlanoId | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)
  const [toast, setToast] = useState<{ kind: 'success' | 'error' | 'info'; msg: string } | null>(null)

  // Server-side plan source of truth (antes era localStorage exploitavel)
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/user/plan', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json() as { plan?: string }
        const normalized = data.plan === 'firma' ? 'pro'
          : data.plan === 'escritorio' ? 'starter'
          : data.plan === 'enterprise' ? 'enterprise'
          : data.plan === 'pro' ? 'pro'
          : data.plan === 'starter' ? 'starter'
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

  async function iniciarCheckout(plano: PlanoId) {
    setLoadingPlan(plano)
    setToast(null)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: plano }),
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

  async function abrirPortal() {
    setPortalLoading(true)
    setToast(null)
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
    }
  }

  // Destaque para o CTA final: o plano mais premium que o usuário ainda não tem
  const destaqueId: PlanoId =
    planoAtual === 'starter' ? 'pro'
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

      {/* PLANOS — componente canônico (v10.12) */}
      <div style={{ marginBottom: 32 }}>
        <LexPricingGrid
          currentPlanId={planoAtual}
          onCheckout={iniciarCheckout}
          loadingPlan={loadingPlan}
        />
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
          type="button" onClick={abrirPortal} disabled={portalLoading}
          style={{
            padding: '12px 18px', borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg, #f5e8d3, #bfa68e)',
            color: '#0a0a0a', border: '1px solid rgba(212,174,106,0.5)',
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
              color: '#d88977', fontWeight: 700,
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
                background: 'rgba(10,10,10,0.55)',
                border: '1px solid rgba(191,166,142,0.12)',
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
                    background: 'rgba(191,166,142,0.08)',
                    border: '1px solid rgba(191,166,142,0.28)',
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
          onClick={() => void iniciarCheckout(destaqueId)}
          disabled={loadingPlan !== null}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '16px 30px', borderRadius: 12,
            background: 'linear-gradient(135deg, #f5e8d3, #bfa68e, #7a5f48)',
            color: '#0a0a0a',
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
          { q: 'Preciso ter conhecimento técnico para usar?', a: 'Não. A Pralvex foi projetada para ser usada por advogados sem nenhum conhecimento de programação. Você digita em português e a IA responde estruturado, pronto para usar.' },
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
        dúvidas? contato@pralvex.com
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

export default function PlanosPage() {
  return (
    <Suspense fallback={<div className="page-content" aria-hidden />}>
      <PlanosPageInner />
    </Suspense>
  )
}

'use client'

import { useState, useEffect } from 'react'
import {
  Check, CheckCircle2, Clock, CreditCard, Gem, Headphones, MinusCircle,
  Rocket, RotateCcw, ShieldCheck, Smile, Sparkles, Star, TrendingUp, X,
  XCircle, Zap, type LucideIcon,
} from 'lucide-react'
import s from './page.module.css'

const PLANOS_BASE = [
  {
    id: 'starter', nome: 'Escritório', tagline: '1–5 advogados',
    precoMensal: 1399,
    perSeat: true,
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
    perSeat: true,
    stripeLink: 'https://buy.stripe.com/test_9B69ASawWajH5192Rs2oE02',
    economiaReal: 'Capacidade de atendimento +40% sem contratar',
    features: [
      { label: 'Todos os 22 agentes especializados', disponivel: true },
      { label: 'Documentos ilimitados', disponivel: true },
      { label: 'Histórico de 90 dias', disponivel: true },
      { label: 'Suporte prioritário em 3h', disponivel: true },
      { label: 'Exportação em PDF profissional', disponivel: true },
      { label: 'Sessão de onboarding dedicada', disponivel: true },
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
      { label: 'Agentes customizados para o escritório', disponivel: true },
      { label: 'Análises ilimitadas + fair use', disponivel: true },
      { label: 'Histórico ilimitado e backup em nuvem', disponivel: true },
      { label: 'Suporte via WhatsApp 24h + Gerente dedicado', disponivel: true },
      { label: 'API privada + SLA de uptime', disponivel: true },
      { label: 'Opção on-premise', disponivel: true },
      { label: 'DPA incluso', disponivel: true },
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
  if (planoId === planoAtual) return '\u2713  Você está aqui'
  if (precoAtual > precoPlano) return 'Mudar para este plano'
  if (planoId === 'starter' || planoId === 'escritorio') return 'Começar 7 dias grátis'
  if (precoPlano > precoAtual) return 'Agendar demonstração'
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
      else alert('Não foi possível abrir o portal. Tente novamente.')
    } catch { alert('Erro ao abrir portal de pagamento') }
  }

  const precoAtual = PLANOS_BASE.find(p => p.id === planoAtual)?.precoMensal || 0
  const destaqueId = getDestaqueId(planoAtual)

  return (
    <div className={`page-content ${s.pageWrap}`}>
      {/* Header — marketing-focused */}
      <div className={s.headerWrap}>
        <span className={s.launchBadge}>
          <Zap size={12} strokeWidth={2} aria-hidden />
          Oferta de lançamento &mdash; 7 dias grátis sem cartão
        </span>
        <h1 className="page-title" style={{ fontSize: 36, marginBottom: 8 }}>
          Trabalhe <span style={{ color: 'var(--accent)' }}>10x mais rápido</span> no Direito
        </h1>
        <p className={`page-subtitle ${s.headerSubtitle}`}>
          Pare de gastar horas com pesquisas manuais. Comece hoje, cancele quando quiser, sem multas nem burocracia.
        </p>
      </div>

      {/* Trust bar — multiple signals */}
      <div className={s.trustGrid}>
        {TRUST_ITEMS.map((t, i) => (
          <div key={i} className={`section-card ${s.trustItem}`}>
            <t.Icon size={20} strokeWidth={1.75} className={s.trustIcon} aria-hidden />
            <div style={{ minWidth: 0 }}>
              <div className={s.trustLabel}>{t.label}</div>
              <div className={s.trustSub}>{t.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Pricing model note */}
      <div className={s.pricingNote}>
        Cobrança <strong style={{ color: 'var(--accent)' }}>por advogado registrado</strong> · De R$ 1.399 a R$ 1.599 conforme o plano
      </div>

      {/* Plan cards */}
      <div className={s.plansGrid}>
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
                <div className={s.planBody}>
                  <div className={s.planName}>{plano.nome}</div>
                  <div className={s.planTagline}>{plano.tagline}</div>

                  {/* Price */}
                  <div className={s.priceRow}>
                    <span className={s.priceCurrency}>R$</span>
                    <span className={s.priceValue} style={{
                      color: isDestaque ? 'var(--accent)' : 'var(--text-primary)',
                    }}>
                      {preco.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div className={s.pricePeriod}>
                    por advogado / mês
                  </div>
                  {/* Economia real — value driver */}
                  <div className={s.economiaBadge}>
                    <TrendingUp size={12} strokeWidth={2} aria-hidden />
                    {plano.economiaReal}
                  </div>
                </div>

                {/* Features */}
                <div className={s.featuresList}>
                  {plano.features.map((f, i) => (
                    <div key={i} className={s.featureRow}>
                      <span className={f.disponivel ? s.featureIconActive : s.featureIconInactive}>
                        {f.disponivel
                          ? <Check size={12} strokeWidth={2.5} aria-hidden />
                          : <X size={12} strokeWidth={2.5} aria-hidden />}
                      </span>
                      <span className={f.disponivel ? s.featureTextActive : s.featureTextInactive}>
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
                      window.open(plano.stripeLink, '_blank')
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
      <div className={`section-card animate-in ${s.manageCard}`}>
        <div className={s.manageIcon}>
          <CreditCard size={22} strokeWidth={1.75} style={{ color: 'var(--accent)' }} aria-hidden />
        </div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div className={s.manageTitle}>
            Gerenciar pagamento e assinatura
          </div>
          <div className={s.manageDesc}>
            Atualize cartão, baixe faturas, faça downgrade ou cancele a qualquer momento via Stripe.
          </div>
        </div>
        <button type="button" onClick={abrirPortal} className="btn-primary" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, flexShrink: 0,
        }}>
          <CreditCard size={14} strokeWidth={1.75} aria-hidden />
          Abrir portal Stripe
        </button>
      </div>

      {/* Enterprise exclusive benefits (shown only when user is on Enterprise) */}
      {planoAtual === 'enterprise' && (
        <div className={`section-card animate-in ${s.enterpriseCard}`}>
          <div className={s.enterpriseHeader}>
            <Gem size={18} strokeWidth={1.75} style={{ color: 'var(--accent)' }} aria-hidden />
            <span className={s.enterpriseTitle}>
              Benefícios Exclusivos Enterprise
            </span>
          </div>
          <div className={s.benefitsGrid}>
            {BENEFICIOS_ENTERPRISE.map((b, i) => (
              <div key={i} className={s.benefitItem}>
                <Star size={10} strokeWidth={2} style={{ color: 'var(--accent)', flexShrink: 0 }} aria-hidden />
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
          <div className={s.sectionTitle}>
            A diferença na prática
          </div>
          <div className={s.sectionHeading}>
            Advogado sem LexAI <span style={{ color: 'var(--text-muted)', margin: '0 8px' }}>vs</span> Advogado com LexAI
          </div>
        </div>
        <div className={s.compareGrid}>
          <div className={s.compareSideNo}>
            <div className={s.compareSideHeader} style={{ color: '#EF4444' }}>
              <XCircle size={16} strokeWidth={2} aria-hidden /> SEM LEXAI
            </div>
            {[
              '3 horas lendo um contrato de 40 páginas',
              'Pesquisa manual em 5 sites diferentes',
              'Petição escrita do zero toda semana',
              'Cálculos de prazos em planilha',
              'Risco de perder jurisprudência relevante',
              'Custo alto de estagiários para tarefas repetitivas',
            ].map((item, i) => (
              <div key={i} className={s.compareItem} style={{ color: 'var(--text-secondary)' }}>
                <MinusCircle size={11} strokeWidth={2} style={{ color: '#EF4444', marginTop: 3, flexShrink: 0 }} aria-hidden />
                {item}
              </div>
            ))}
          </div>
          <div className={s.compareSideYes}>
            <div className={s.compareSideHeader} style={{ color: 'var(--accent)' }}>
              <CheckCircle2 size={16} strokeWidth={2} aria-hidden /> COM LEXAI
            </div>
            {[
              'Análise completa em 45 segundos com riscos identificados',
              'Pesquisa em STF, STJ e tribunais em um clique',
              '6 templates prontos (petição, recurso, contestação...)',
              'Prazos calculados automaticamente com base no CPC',
              'IA não esquece nenhuma súmula relevante',
              'Sua equipe focada em estratégia, não em repetição',
            ].map((item, i) => (
              <div key={i} className={s.compareItem} style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                <CheckCircle2 size={11} strokeWidth={2.5} style={{ color: 'var(--accent)', marginTop: 3, flexShrink: 0 }} aria-hidden />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials — social proof */}
      <div className={`section-card ${s.testimonialSection}`}>
        <div className={s.testimonialHeader}>
          <div className={s.testimonialLabel}>
            <Sparkles size={12} strokeWidth={2} style={{ marginRight: 6 }} aria-hidden />
            Quem já usa está amando
          </div>
          <div className={s.testimonialHeading}>
            Resultados reais de quem testou
          </div>
        </div>
        <div className={s.testimonialGrid}>
          {[
            {
              nome: 'Mariana Castro',
              cargo: 'Advogada Civil — SP',
              foto: 'MC',
              cor: '#44372b',
              estrelas: 5,
              texto: 'Em 2 semanas economizei mais de 20 horas que eu gastava em pesquisa de jurisprudência. O Pesquisador encontra acórdãos que eu nem sabia que existiam.',
            },
            {
              nome: 'Dr. Pedro Henrique',
              cargo: 'Sócio — PHM Advogados',
              foto: 'PH',
              cor: '#10B981',
              estrelas: 5,
              texto: 'O Calculador e o Monitor Legislativo mudaram a forma como gerenciamos prazos. Zero perda processual desde que adotamos a plataforma no escritório.',
            },
            {
              nome: 'Renata Lima',
              cargo: 'Sócia — Lima Advocacia',
              foto: 'RL',
              cor: '#8B5CF6',
              estrelas: 5,
              texto: 'Substituiu 2 estagiários e ainda entrega mais rápido. O Redator gera petições que só precisam de pequenos ajustes. Investimento que se pagou em 1 mês.',
            },
          ].map((t, i) => (
            <div key={i} className={s.testimonialCard}>
              <div className={s.testimonialStars}>
                {Array.from({ length: t.estrelas }).map((_, j) => (
                  <Star key={j} size={12} strokeWidth={2} fill="currentColor" aria-hidden />
                ))}
              </div>
              <div className={s.testimonialText}>
                &ldquo;{t.texto}&rdquo;
              </div>
              <div className={s.testimonialAuthor}>
                <div className={s.testimonialAvatar} style={{ background: `linear-gradient(135deg, ${t.cor}, ${t.cor}aa)` }}>
                  {t.foto}
                </div>
                <div>
                  <div className={s.testimonialName}>{t.nome}</div>
                  <div className={s.testimonialRole}>{t.cargo}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Money-back guarantee — risk reversal */}
      <div className={`section-card ${s.guaranteeCard}`}>
        <div className={s.guaranteeIcon}>
          <ShieldCheck size={30} strokeWidth={1.75} style={{ color: '#10B981' }} aria-hidden />
        </div>
        <div className={s.guaranteeTitle}>
          Garantia de 7 dias ou seu dinheiro de volta
        </div>
        <div className={s.guaranteeDesc}>
          Teste todos os agentes sem risco. Se a LexAI não economizar pelo menos 5 horas do seu trabalho na primeira semana, devolvemos 100% do valor. Sem perguntas, sem burocracia.
        </div>
        <div className={s.guaranteePoints}>
          {GUARANTEE_POINTS.map((g, i) => (
            <div key={i} className={s.guaranteePoint}>
              <g.Icon size={14} strokeWidth={2} style={{ color: '#10B981' }} aria-hidden />
              {g.text}
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA — urgency + scarcity */}
      <div className={`section-card ${s.finalCtaCard}`}>
        <div className={s.scarcityBadge}>
          <span className={s.pulseDot} />
          Vagas limitadas para o lançamento
        </div>
        <div className={s.finalCtaTitle}>
          Pronto para acabar com as horas perdidas?
        </div>
        <div className={s.finalCtaDesc}>
          Junte-se aos primeiros escritórios que já transformaram sua rotina. Comece em 30 segundos &mdash; sem cartão de crédito.
        </div>
        <button type="button" onClick={() => {
          const link = PLANOS_BASE.find(p => p.id === destaqueId)?.stripeLink
          if (link) window.open(link, '_blank')
        }} className={s.finalCtaBtn}>
          <Rocket size={16} strokeWidth={1.75} aria-hidden />
          Começar 7 dias grátis agora
        </button>
        <div className={s.finalCtaSub}>
          Cancele a qualquer momento &middot; Sem cobrança durante o período grátis &middot; Suporte em português
        </div>
      </div>

      {/* FAQ */}
      <div className={`section-card ${s.faqSection}`}>
        <div className={s.faqTitle}>Perguntas Frequentes</div>
        {[
          { q: 'E se eu não gostar? Tenho como cancelar?', a: 'Sim. Você pode cancelar com 1 clique a qualquer momento, sem multas, sem ligação com vendedor, sem perguntas. Além disso, oferecemos 7 dias de garantia: se não economizar 5h na primeira semana, devolvemos 100% do valor.' },
          { q: 'Preciso ter conhecimento técnico para usar?', a: 'Não. A LexAI foi projetada para ser usada por advogados sem nenhum conhecimento de programação. Você digita em português e a IA responde estruturado, pronto para usar.' },
          { q: 'Os documentos que eu enviar ficam seguros?', a: 'Totalmente. Somos LGPD compliant, todos os dados são criptografados em trânsito e em repouso. Não usamos seus documentos para treinar modelos. Sua privacidade é prioridade.' },
          { q: 'Posso trocar de plano depois?', a: 'Sim, você pode fazer upgrade ou downgrade a qualquer momento. A diferença é calculada proporcionalmente. Sem fidelidade nem multa.' },
          { q: 'Como funciona o limite de documentos?', a: 'Cada análise, pesquisa ou peça conta como 1 documento. O contador reseta no início do mês. Se atingir o limite, você recebe aviso e pode fazer upgrade ou aguardar o próximo ciclo.' },
          { q: 'Quanto tempo eu economizo de verdade?', a: 'A média dos nossos usuários é 12 a 20 horas por semana. Uma análise de contrato que levaria 3h leva 45 segundos. Uma peça que você escreveria em 2h sai pronta em 2 minutos.' },
          { q: 'Como funciona a cobrança por advogado?', a: 'O valor por advogado varia conforme o plano: Escritório R$ 1.399, Firma R$ 1.459 e Enterprise R$ 1.599. Quanto maior o plano, mais agentes e recursos disponíveis por usuário.' },
        ].map((item, i, arr) => (
          <div key={i} className={s.faqItem} style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <div className={s.faqQuestion}>{item.q}</div>
            <div className={s.faqAnswer}>{item.a}</div>
          </div>
        ))}
      </div>

      {/* Contact */}
      <div className={s.contactFooter}>
        Dúvidas? Entre em contato: contato@vanixcorp.com
      </div>
    </div>
  )
}

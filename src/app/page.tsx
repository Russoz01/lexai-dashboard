'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

/* ----------------------------------------------------------------------------
 * LexAI — Atelier Landing
 *
 * Editorial minimalism com micro-interacoes de precisao. O premium vem do tipo,
 * whitespace e um unico stone-accent sobre o deep navy. Tres camadas de
 * animacao: (a) entrada sequencial do hero, (b) scroll-reveal com stagger
 * por IntersectionObserver, (c) cursor-follow glow no hero card + marquee
 * editorial no corte entre secoes. Zero dependencias externas.
 * -------------------------------------------------------------------------- */

const shell = {
  position: 'relative' as const,
  maxWidth: 1180,
  margin: '0 auto',
  padding: '0 40px',
}

const agentes = [
  { n: '01', name: 'Resumidor',   desc: 'Cole qualquer documento — contrato, acordao, peticao — e receba uma analise estruturada com riscos, clausulas criticas e prazos em segundos.' },
  { n: '02', name: 'Redator',     desc: 'Peticoes iniciais, recursos, contestacoes e notificacoes extrajudiciais com fundamentacao doutrinaria e jurisprudencial completa.' },
  { n: '03', name: 'Pesquisador', desc: 'Busca inteligente em jurisprudencia do STF, STJ, TRFs e TJs estaduais. Cada resultado com ementa, tribunal e data de julgamento.' },
  { n: '04', name: 'Negociador',  desc: 'Mapeamento de BATNA, ZOPA e tres cenarios de acordo. Estrategia de negociacao com fundamentacao e pontos de pressao.' },
  { n: '05', name: 'Professor',   desc: 'Aulas em tres niveis de profundidade — basico, intermediario e avancado. Questoes no estilo OAB, concursos e magistratura.' },
  { n: '06', name: 'Calculador',  desc: 'Prazos processuais com feriados, correcao monetaria (INPC, IGPM, IPCA), juros de mora e custas judiciais por estado.' },
  { n: '07', name: 'Legislacao',  desc: 'Qualquer artigo de lei explicado em linguagem acessivel, com doutrina majoritaria e jurisprudencia aplicada ao caso concreto.' },
  { n: '08', name: 'Rotina',      desc: 'Gestao de audiencias, prazos processuais, compromissos e fluxos de trabalho do escritorio organizados por prioridade.' },
  { n: '09', name: 'Simulado',    desc: 'Questoes no estilo OAB, CESPE e FGV geradas por IA. Gabarito comentado com artigos de lei e dicas para a prova.' },
  { n: '10', name: 'Consultor',   desc: 'Pareceres juridicos estruturados com fundamentacao legal, doutrina, argumentos pro e contra e recomendacoes praticas.' },
]

const provas = [
  { n: 'I',   metric: '12',    label: 'Agentes especializados' },
  { n: 'II',  metric: '9',     label: 'Areas do Direito cobertas' },
  { n: 'III', metric: '36',    label: 'Materias academicas' },
  { n: 'IV',  metric: '7 dias', label: 'Trial gratuito sem cartao' },
]

const depoimentos = [
  {
    initials: 'MC',
    name: 'Mariana Castro',
    cargo: 'Advogada Civil · OAB/SP',
    quote: 'Em duas semanas economizei mais de vinte horas de pesquisa. O Pesquisador encontra acordaos que eu nem sabia que existiam.',
  },
  {
    initials: 'LF',
    name: 'Lucas Ferreira',
    cargo: 'Aprovado na 1a fase da OAB · RJ',
    quote: 'O Professor explica conceitos juridicos como nenhum livro consegue. Passei de primeira usando os planos de estudo personalizados.',
  },
  {
    initials: 'RL',
    name: 'Renata Lima',
    cargo: 'Socia · Lima Advocacia',
    quote: 'Substituiu dois estagiarios e ainda entrega mais rapido. O investimento se pagou no primeiro mes de uso.',
  },
]

const planos = [
  {
    name: 'Starter',
    priceMonthly: '89',
    priceAnnual: '75',
    headline: '5 agentes · 50 documentos / mes',
    features: ['Resumidor, Pesquisador, Professor, Legislacao, Calculador', 'Historico de 30 dias', 'Suporte por email'],
  },
  {
    name: 'Pro',
    priceMonthly: '179',
    priceAnnual: '150',
    headline: '10 agentes · 200 documentos / mes',
    popular: true,
    features: ['Todos os agentes incluindo Simulado e Consultor', 'Exportacao em PDF', 'Suporte prioritario em 48h', 'Historico de 90 dias'],
  },
  {
    name: 'Enterprise',
    priceMonthly: '399',
    priceAnnual: '335',
    headline: '12 agentes · volume ilimitado',
    beta: true,
    features: ['Todos os agentes + Chat orquestrador + Planilhas', 'API privada + SLA', 'WhatsApp 24h', 'Historico ilimitado', 'Modelos customizados'],
  },
]

const footerColumns = [
  {
    title: 'Produto',
    links: [
      { label: 'Para empresas', href: '/empresas' },
      { label: 'Agentes',       href: '#agentes' },
      { label: 'Planos',        href: '#planos' },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { label: 'Entrar',         href: '/login' },
      { label: 'Comecar gratis', href: '/login' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacidade LGPD', href: '/privacidade' },
      { label: 'Termos de uso',    href: '/termos' },
    ],
  },
]

/* --------------------------------------------------------------------------
 * Atomic pieces — kept declarative.
 * ------------------------------------------------------------------------ */

function SerialLabel({ children }: { children: React.ReactNode }) {
  return <div className="ax-serial">{children}</div>
}

function Rule() {
  return <div aria-hidden className="ax-rule" />
}

function BrandMark() {
  return (
    <Link href="/" className="ax-brand">
      <span className="ax-brand-mark" aria-hidden>LX</span>
      <span className="ax-brand-text">
        <span className="ax-brand-name">LexAI</span>
        <span className="ax-brand-sub">Atelier juridico</span>
      </span>
    </Link>
  )
}

/* --------------------------------------------------------------------------
 * Scroll-reveal hook — IntersectionObserver-based.
 * Add `data-reveal` to any element. Once visible it gains `is-revealed`.
 * Stagger children with `style={{ '--reveal-delay': '...' }}`.
 * ------------------------------------------------------------------------ */

function useScrollReveal() {
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const nodes = document.querySelectorAll<HTMLElement>('[data-reveal]')
    if (prefersReduced) {
      nodes.forEach((n) => n.classList.add('is-revealed'))
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed')
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.14, rootMargin: '0px 0px -80px 0px' },
    )
    nodes.forEach((n) => io.observe(n))
    return () => io.disconnect()
  }, [])
}

/* --------------------------------------------------------------------------
 * Page
 * ------------------------------------------------------------------------ */

function PricingToggle({ annual, onChange }: { annual: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="ax-billing-toggle" data-reveal>
      <button
        className={`ax-billing-opt${!annual ? ' active' : ''}`}
        onClick={() => onChange(false)}
      >
        Mensal
      </button>
      <button
        className={`ax-billing-opt${annual ? ' active' : ''}`}
        onClick={() => onChange(true)}
      >
        Anual
        <span className="ax-billing-discount">−16%</span>
      </button>
    </div>
  )
}

export default function LandingPage() {
  useScrollReveal()

  const [annualBilling, setAnnualBilling] = useState(false)

  // Nav shadow appears after 24px of scroll
  const [navScrolled, setNavScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Cursor-follow glow on hero card
  const heroCardRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = heroCardRef.current
    if (!el) return
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      el.style.setProperty('--mx', `${x}%`)
      el.style.setProperty('--my', `${y}%`)
    }
    el.addEventListener('mousemove', onMove)
    return () => el.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <div className="ax-root">
      {/* ── NAV ────────────────────────────────────────────────────────── */}
      <header className={`ax-nav${navScrolled ? ' ax-nav--scrolled' : ''}`}>
        <div style={{ ...shell, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 40px' }}>
          <BrandMark />
          <nav className="ax-nav-links">
            <a href="#agentes" className="ax-nav-link">Agentes</a>
            <a href="#atelier" className="ax-nav-link">Atelier</a>
            <a href="#planos"  className="ax-nav-link">Planos</a>
            <Link href="/login" className="ax-nav-link">Entrar</Link>
            <Link href="/login" className="ax-cta-primary">Abrir meu gabinete</Link>
          </nav>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section style={{ ...shell, padding: '140px 40px 60px' }}>
        <div className="ax-hero-grid">
          <div className="ax-hero-left">
            <SerialLabel>N° 001 · LEXAI · MMXXVI</SerialLabel>
            <h1 className="ax-hero-title">
              <span className="ax-line" style={{ '--d': '0ms' } as React.CSSProperties}>Um escritorio juridico</span>
              <br />
              <span className="ax-line" style={{ '--d': '140ms' } as React.CSSProperties}>
                <em className="ax-italic">feito a mao</em>,
              </span>
              <br />
              <span className="ax-line ax-hero-muted" style={{ '--d': '280ms' } as React.CSSProperties}>
                potencializado por inteligencia artificial.
              </span>
            </h1>
            <p className="ax-hero-lede ax-line" style={{ '--d': '420ms' } as React.CSSProperties}>
              Doze agentes treinados no ordenamento juridico brasileiro. Cada um afinado como
              uma ferramenta de precisao — documentos, jurisprudencia, calculos, pecas
              processuais. Ninguem se perde entre abas.
            </p>
            <div className="ax-hero-cta-row ax-line" style={{ '--d': '560ms' } as React.CSSProperties}>
              <Link href="/login" className="ax-cta-primary ax-cta-large">
                <span>Abrir meu gabinete</span>
                <span className="ax-cta-arrow" aria-hidden>→</span>
              </Link>
              <a href="#agentes" className="ax-cta-ghost">Conhecer os agentes &nbsp;→</a>
            </div>
          </div>
          <aside className="ax-hero-right">
            <div className="ax-hero-card" ref={heroCardRef}>
              <div className="ax-hero-card-glow" aria-hidden />
              <div className="ax-hero-card-head">
                <span className="ax-serial">Edicao limitada</span>
                <span className="ax-serial">MMXXVI</span>
              </div>
              <div className="ax-hero-card-body">
                <div className="ax-hero-card-metric">12</div>
                <div className="ax-hero-card-metric-label">agentes</div>
                <Rule />
                <p className="ax-hero-card-quote">
                  &ldquo;Estrategia e precisao para quem trata Direito como <em className="ax-italic">oficio</em>.&rdquo;
                </p>
                <div className="ax-hero-card-sign">— Vanix Corp, <em className="ax-italic">atelier de software</em></div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ── MARQUEE editorial — faixa em movimento constante ───────────── */}
      <section className="ax-marquee-wrap" aria-hidden="true">
        <div className="ax-marquee">
          <div className="ax-marquee-track">
            {[...Array(2)].map((_, k) => (
              <div key={k} className="ax-marquee-inner">
                <span>Estrategia</span><span className="ax-marquee-dot">◆</span>
                <span><em className="ax-italic">Precisao</em></span><span className="ax-marquee-dot">◆</span>
                <span>Oficio</span><span className="ax-marquee-dot">◆</span>
                <span><em className="ax-italic">Atelier</em></span><span className="ax-marquee-dot">◆</span>
                <span>Jurisprudencia</span><span className="ax-marquee-dot">◆</span>
                <span><em className="ax-italic">Feito a mao</em></span><span className="ax-marquee-dot">◆</span>
                <span>MMXXVI</span><span className="ax-marquee-dot">◆</span>
                <span><em className="ax-italic">Ituverava, SP</em></span><span className="ax-marquee-dot">◆</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROVAS (serialized stats) ──────────────────────────────────── */}
      <section style={{ ...shell, padding: '80px 40px' }}>
        <div className="ax-provas" data-reveal>
          {provas.map((p, i) => (
            <div key={p.label} className="ax-prova" style={{ '--reveal-delay': `${i * 90}ms` } as React.CSSProperties}>
              <div className="ax-prova-num">{p.n}</div>
              <div className="ax-prova-metric">{p.metric}</div>
              <div className="ax-prova-label">{p.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── AGENTES ────────────────────────────────────────────────────── */}
      <section id="agentes" style={{ ...shell, padding: '140px 40px 120px' }}>
        <div className="ax-section-head" data-reveal>
          <SerialLabel>Capitulo I</SerialLabel>
          <h2 className="ax-section-title">
            Doze agentes. <em className="ax-italic">Um unico gabinete.</em>
          </h2>
          <p className="ax-section-sub">
            Nao e um assistente generico. Cada agente foi afinado para uma funcao especifica do
            exercicio da advocacia no Brasil — e responde na lingua do processo.
          </p>
        </div>

        <Rule />

        <div className="ax-agents" data-reveal>
          {agentes.map((a, i) => (
            <div key={a.name} className="ax-agent" style={{ '--reveal-delay': `${i * 70}ms` } as React.CSSProperties}>
              <div className="ax-agent-num">{a.n}</div>
              <div className="ax-agent-body">
                <div className="ax-agent-name">{a.name}</div>
                <div className="ax-agent-desc">{a.desc}</div>
              </div>
              <div className="ax-agent-arrow" aria-hidden>→</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ATELIER (philosophy strip) ─────────────────────────────────── */}
      <section id="atelier" style={{ ...shell, padding: '140px 40px' }}>
        <div className="ax-atelier" data-reveal>
          <SerialLabel>Capitulo II · Atelier</SerialLabel>
          <h2 className="ax-section-title ax-atelier-title">
            Nao somos mais um SaaS.
            <br />
            <em className="ax-italic">Somos um atelier.</em>
          </h2>
          <p className="ax-atelier-body">
            Cada prompt e afinado. Cada resposta, revisada. A experiencia e pensada para quem
            trata o Direito como oficio — e nao tolera ferramentas genericas. LexAI e uma
            ferramenta privada, feita para um numero limitado de profissionais por vez.
          </p>
          <Rule />
          <div className="ax-atelier-sig">
            Assinatura · <strong style={{ color: 'var(--text-primary)' }}>Leonardo, Vanix Corp</strong>
          </div>
        </div>
      </section>

      {/* ── DEPOIMENTOS ────────────────────────────────────────────────── */}
      <section style={{ ...shell, padding: '60px 40px 140px' }}>
        <div className="ax-section-head" data-reveal>
          <SerialLabel>Capitulo III · Vozes</SerialLabel>
          <h2 className="ax-section-title">
            O que dizem <em className="ax-italic">os primeiros</em>.
          </h2>
        </div>
        <Rule />
        <div className="ax-tests" data-reveal>
          {depoimentos.map((d, i) => (
            <figure key={d.name} className="ax-test" style={{ '--reveal-delay': `${i * 110}ms` } as React.CSSProperties}>
              <blockquote className="ax-test-quote">&ldquo;{d.quote}&rdquo;</blockquote>
              <figcaption className="ax-test-foot">
                <div className="ax-test-initials">{d.initials}</div>
                <div>
                  <div className="ax-test-name">{d.name}</div>
                  <div className="ax-test-cargo">{d.cargo}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ── PRICING ────────────────────────────────────────────────────── */}
      <section id="planos" style={{ ...shell, padding: '60px 40px 160px', maxWidth: 1180 }}>
        <div className="ax-section-head" data-reveal>
          <SerialLabel>Capitulo IV · Acesso</SerialLabel>
          <h2 className="ax-section-title">
            Planos <em className="ax-italic">transparentes</em>.
          </h2>
          <p className="ax-section-sub">
            Sete dias gratuitos, sem cartao. Cancelamento em um clique, sem fidelidade.
          </p>
        </div>
        <Rule />

        {/* Toggle mensal / anual */}
        <PricingToggle annual={annualBilling} onChange={setAnnualBilling} />

        <div className="ax-plans" data-reveal>
          {planos.map((p, i) => {
            const price = annualBilling ? p.priceAnnual : p.priceMonthly
            return (
              <div key={p.name} className={`ax-plan${p.popular ? ' ax-plan--popular' : ''}`} style={{ '--reveal-delay': `${i * 130}ms` } as React.CSSProperties}>
                {p.popular && <div className="ax-plan-badge">Recomendado</div>}
                {p.beta && !p.popular && (
                  <div className="ax-plan-badge ax-plan-badge--beta">
                    Beta · R$ 329 no 1º mes
                  </div>
                )}
                <div className="ax-plan-name">{p.name}</div>
                <div className="ax-plan-price">
                  <span className="ax-plan-currency">R$</span>
                  <span className="ax-plan-value">{price}</span>
                  <span className="ax-plan-per">/ mes</span>
                </div>
                {annualBilling && (
                  <div className="ax-plan-annual-note">cobrado anualmente · 16% off</div>
                )}
                {p.beta && !annualBilling && (
                  <div className="ax-plan-beta-note">
                    <span className="ax-plan-price-strike">R$ 399</span>
                    {' '}→ R$ 329 no primeiro mes para beta testers
                  </div>
                )}
                <div className="ax-plan-headline">{p.headline}</div>
                <ul className="ax-plan-features">
                  {p.features.map((f) => (
                    <li key={f}>
                      <span aria-hidden className="ax-plan-dot" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/login" className={`ax-plan-cta${p.popular ? ' ax-plan-cta--solid' : ''}`}>
                  {p.beta && !annualBilling ? 'Garantir R$ 329' : 'Abrir meu gabinete'}
                </Link>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── CLOSING MARK ───────────────────────────────────────────────── */}
      <section style={{ ...shell, padding: '80px 40px 120px', textAlign: 'center' }}>
        <div data-reveal>
          <SerialLabel>Ad finem · MMXXVI</SerialLabel>
          <h2 className="ax-closing-title">
            Pronto para praticar Direito <em className="ax-italic">com instrumento a altura</em>?
          </h2>
          <div style={{ marginTop: 36 }}>
            <Link href="/login" className="ax-cta-primary ax-cta-large">
              <span>Abrir meu gabinete</span>
              <span className="ax-cta-arrow" aria-hidden>→</span>
            </Link>
          </div>
          <div style={{ marginTop: 20, fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.3px' }}>
            Sete dias gratuitos · Sem cartao · Cancelamento em um clique
          </div>
        </div>
      </section>

      {/* ── LGPD NOTE ──────────────────────────────────────────────────── */}
      <section style={{ ...shell, padding: '0 40px 80px', maxWidth: 920 }}>
        <div className="ax-lgpd">
          <div className="ax-lgpd-head">Aviso · LGPD</div>
          LexAI e uma ferramenta de apoio baseada em inteligencia artificial. Os resultados
          gerados pelos agentes devem ser revisados por profissional habilitado pela OAB
          antes de qualquer uso processual ou contratual. A plataforma esta em conformidade
          com a Lei Geral de Protecao de Dados — seus dados sao criptografados e nunca
          utilizados para treinamento de modelos.
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer className="ax-footer">
        <div style={{ ...shell, padding: '64px 40px 32px' }}>
          <div className="ax-footer-grid">
            <div>
              <BrandMark />
              <p className="ax-footer-blurb">
                Inteligencia juridica feita a mao. Um atelier de software por
                <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}> Vanix Corp</strong>.
              </p>
            </div>
            {footerColumns.map((col) => (
              <div key={col.title}>
                <div className="ax-footer-title">{col.title}</div>
                <ul className="ax-footer-list">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="ax-footer-link">{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="ax-footer-bottom">
            <div>© MMXXVI · LexAI — uma marca <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Vanix Corp</strong></div>
            <div className="ax-footer-contact">
              <span>luizfernandoleonardoleonardo@gmail.com</span>
              <span className="ax-footer-sep">·</span>
              <span>(34) 99302-6456</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ── STYLES ─────────────────────────────────────────────────────── */}
      <style>{`
        /* ═══════════════════════════════════════════════════
           ATELIER — editorial design system for landing
           ═══════════════════════════════════════════════════ */

        .ax-root {
          position: relative;
          min-height: 100vh;
          background: var(--bg-base);
          color: var(--text-primary);
          font-family: var(--font-dm-sans, 'DM Sans'), -apple-system, sans-serif;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }
        .ax-root::before {
          content: '';
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          background:
            radial-gradient(ellipse 60% 45% at 15% 8%, var(--stone-soft), transparent 68%),
            radial-gradient(ellipse 55% 50% at 90% 95%, rgba(68,55,43,0.08), transparent 70%);
        }
        .ax-root > * { position: relative; z-index: 1; }

        /* ── Italics + serial labels ─────────────────────── */
        .ax-italic {
          font-family: var(--font-playfair, 'Playfair Display'), Georgia, serif;
          font-style: italic;
          font-weight: 500;
          color: var(--accent);
          letter-spacing: -0.5px;
        }
        .ax-serial {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 2.4px;
          text-transform: uppercase;
          color: var(--text-muted);
          font-variant-numeric: tabular-nums;
        }
        .ax-rule {
          height: 1px;
          width: 100%;
          background: var(--stone-line);
          margin: 40px 0;
        }

        /* ── Brand ───────────────────────────────────────── */
        .ax-brand {
          display: flex;
          align-items: center;
          gap: 14px;
          text-decoration: none;
        }
        .ax-brand-mark {
          width: 40px;
          height: 40px;
          border: 1px solid var(--stone-line);
          border-radius: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-playfair), Georgia, serif;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.5px;
          color: var(--text-primary);
          background: var(--stone-soft);
        }
        .ax-brand-text { display: flex; flex-direction: column; line-height: 1.1; }
        .ax-brand-name {
          font-size: 17px;
          font-weight: 600;
          letter-spacing: -0.3px;
          color: var(--text-primary);
        }
        .ax-brand-sub {
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-top: 3px;
        }

        /* ── Scroll reveal ───────────────────────────────── */
        [data-reveal] {
          opacity: 0;
          transform: translateY(22px);
          transition: opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1), transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
          transition-delay: var(--reveal-delay, 0ms);
        }
        [data-reveal].is-revealed {
          opacity: 1;
          transform: translateY(0);
        }

        /* Hero sequential lines (independent from scroll reveal) */
        .ax-hero-left .ax-line {
          opacity: 0;
          transform: translateY(22px);
          animation: ax-rise 0.9s cubic-bezier(0.16, 1, 0.3, 1) both;
          animation-delay: var(--d, 0ms);
        }
        .ax-hero-title .ax-line { display: inline-block; }

        /* ── Nav ─────────────────────────────────────────── */
        .ax-nav {
          position: sticky;
          top: 0;
          z-index: 50;
          background: var(--glass);
          backdrop-filter: blur(18px) saturate(140%);
          -webkit-backdrop-filter: blur(18px) saturate(140%);
          border-bottom: 1px solid transparent;
          transition: border-color 0.4s ease, box-shadow 0.4s ease;
        }
        .ax-nav--scrolled {
          border-bottom-color: var(--stone-line);
          box-shadow: 0 4px 30px rgba(19, 32, 37, 0.04);
        }
        .ax-nav-links {
          display: flex;
          align-items: center;
          gap: 28px;
        }
        .ax-nav-link {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
          text-decoration: none;
          letter-spacing: 0.2px;
          transition: color 0.2s ease;
        }
        .ax-nav-link:hover { color: var(--text-primary); }

        /* ── CTAs ────────────────────────────────────────── */
        .ax-cta-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 11px 22px;
          background: var(--text-primary);
          color: var(--bg-base);
          border: 1px solid var(--text-primary);
          border-radius: 2px;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.3px;
          text-decoration: none;
          position: relative;
          overflow: hidden;
          transition: transform 0.25s ease, background 0.25s ease, color 0.25s ease, box-shadow 0.35s ease;
        }
        .ax-cta-primary::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, transparent 20%, rgba(191,166,142,0.18) 50%, transparent 80%);
          transform: translateX(-100%);
          transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .ax-cta-primary > * { position: relative; z-index: 1; }
        .ax-cta-primary:hover {
          background: var(--accent);
          border-color: var(--accent);
          color: var(--bg-base);
          transform: translateY(-2px);
          box-shadow: 0 10px 40px rgba(68, 55, 43, 0.25);
        }
        .ax-cta-primary:hover::before {
          transform: translateX(100%);
        }
        .ax-cta-arrow {
          display: inline-block;
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .ax-cta-primary:hover .ax-cta-arrow {
          transform: translateX(4px);
        }
        .ax-cta-large { padding: 17px 36px; font-size: 14px; letter-spacing: 0.4px; }

        .ax-cta-ghost {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 17px 10px;
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.3px;
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: color 0.2s ease, border-color 0.2s ease;
        }
        .ax-cta-ghost:hover {
          color: var(--text-primary);
          border-bottom-color: var(--accent);
        }

        /* ── Hero ────────────────────────────────────────── */
        @keyframes ax-rise {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ax-fade { from { opacity: 0; } to { opacity: 1; } }

        .ax-hero-grid {
          display: grid;
          grid-template-columns: 1.45fr 1fr;
          gap: 80px;
          align-items: center;
        }
        .ax-hero-right {
          animation: ax-rise 1s cubic-bezier(0.16, 1, 0.3, 1) 0.32s both;
        }
        .ax-hero-title {
          font-size: clamp(44px, 6.2vw, 78px);
          font-weight: 300;
          letter-spacing: -2.4px;
          line-height: 1.02;
          margin: 28px 0 36px;
          color: var(--text-primary);
        }
        .ax-hero-title .ax-italic {
          font-size: 1.02em;
          letter-spacing: -2px;
        }
        .ax-hero-muted {
          color: var(--text-secondary);
          font-weight: 300;
        }
        .ax-hero-lede {
          font-size: 17px;
          line-height: 1.72;
          color: var(--text-secondary);
          max-width: 540px;
          margin: 0 0 44px;
          font-weight: 400;
        }
        .ax-hero-cta-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .ax-hero-card {
          border: 1px solid var(--stone-line);
          background: var(--card-bg);
          backdrop-filter: blur(18px);
          padding: 38px 36px;
          position: relative;
          overflow: hidden;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s ease;
          --mx: 50%;
          --my: 0%;
        }
        .ax-hero-card:hover {
          border-color: rgba(191, 166, 142, 0.42);
          transform: translateY(-2px);
        }
        .ax-hero-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 24px;
          right: 24px;
          height: 1px;
          background: var(--accent);
          opacity: 0.4;
          z-index: 2;
        }
        .ax-hero-card-glow {
          position: absolute;
          inset: -40%;
          pointer-events: none;
          background: radial-gradient(
            circle 280px at var(--mx) var(--my),
            rgba(191, 166, 142, 0.16),
            transparent 60%
          );
          opacity: 0;
          transition: opacity 0.5s ease;
          z-index: 0;
        }
        .ax-hero-card:hover .ax-hero-card-glow {
          opacity: 1;
        }
        .ax-hero-card > *:not(.ax-hero-card-glow) { position: relative; z-index: 1; }
        .ax-hero-card-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
        }
        .ax-hero-card-metric {
          font-family: var(--font-playfair), Georgia, serif;
          font-size: 108px;
          font-weight: 400;
          line-height: 0.9;
          color: var(--text-primary);
          letter-spacing: -4px;
        }
        .ax-hero-card-metric-label {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-top: 8px;
          margin-bottom: 28px;
        }
        .ax-hero-card-quote {
          font-family: var(--font-playfair), Georgia, serif;
          font-size: 17px;
          line-height: 1.55;
          font-style: italic;
          color: var(--text-primary);
          margin: 24px 0 16px;
        }
        .ax-hero-card-sign {
          font-size: 11px;
          color: var(--text-muted);
          letter-spacing: 0.3px;
        }

        /* ── Provas (stats) ──────────────────────────────── */
        .ax-provas {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          border-top: 1px solid var(--stone-line);
          border-bottom: 1px solid var(--stone-line);
        }
        .ax-prova {
          padding: 40px 32px;
          text-align: left;
          border-left: 1px solid var(--stone-line);
        }
        .ax-prova:first-child { border-left: none; }
        .ax-prova-num {
          font-family: var(--font-playfair), Georgia, serif;
          font-style: italic;
          font-size: 13px;
          color: var(--accent);
          margin-bottom: 14px;
        }
        .ax-prova-metric {
          font-family: var(--font-playfair), Georgia, serif;
          font-size: 56px;
          font-weight: 400;
          color: var(--text-primary);
          letter-spacing: -2px;
          line-height: 1;
        }
        .ax-prova-label {
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.6px;
          color: var(--text-secondary);
          margin-top: 14px;
          line-height: 1.5;
        }

        /* ── Section heads ───────────────────────────────── */
        .ax-section-head { margin-bottom: 20px; max-width: 680px; }
        .ax-section-title {
          font-size: clamp(32px, 4.6vw, 56px);
          font-weight: 300;
          letter-spacing: -1.8px;
          line-height: 1.08;
          color: var(--text-primary);
          margin: 22px 0 16px;
        }
        .ax-section-title .ax-italic { font-size: 1em; letter-spacing: -1.4px; }
        .ax-section-sub {
          font-size: 16px;
          line-height: 1.65;
          color: var(--text-secondary);
          max-width: 620px;
          font-weight: 400;
          margin: 0;
        }

        /* ── Marquee ─────────────────────────────────────── */
        .ax-marquee-wrap {
          border-top: 1px solid var(--stone-line);
          border-bottom: 1px solid var(--stone-line);
          padding: 22px 0;
          overflow: hidden;
          background: var(--stone-soft);
          margin-top: 40px;
        }
        .ax-marquee {
          display: flex;
          width: 100%;
          overflow: hidden;
          mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent);
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent);
        }
        .ax-marquee-track {
          display: flex;
          animation: ax-marquee 38s linear infinite;
          will-change: transform;
        }
        .ax-marquee-inner {
          display: flex;
          align-items: center;
          gap: 36px;
          padding-right: 36px;
          flex-shrink: 0;
          font-family: var(--font-playfair), Georgia, serif;
          font-size: 22px;
          letter-spacing: -0.3px;
          color: var(--text-primary);
          white-space: nowrap;
        }
        .ax-marquee-inner .ax-italic {
          font-size: 1em;
          letter-spacing: -0.6px;
        }
        .ax-marquee-dot {
          color: var(--accent);
          font-size: 11px;
          opacity: 0.6;
        }
        @keyframes ax-marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* ── Agents ──────────────────────────────────────── */
        .ax-agents {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          border-top: 1px solid var(--stone-line);
          border-left: 1px solid var(--stone-line);
        }
        .ax-agent {
          padding: 36px 32px;
          border-right: 1px solid var(--stone-line);
          border-bottom: 1px solid var(--stone-line);
          display: flex;
          gap: 28px;
          align-items: flex-start;
          transition: background 0.35s ease, transform 0.35s ease;
          position: relative;
          overflow: hidden;
        }
        .ax-agent::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 0;
          height: 1px;
          background: var(--accent);
          transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .ax-agent:hover {
          background: var(--stone-soft);
        }
        .ax-agent:hover::before {
          width: 100%;
        }
        .ax-agent-num {
          font-family: var(--font-playfair), Georgia, serif;
          font-style: italic;
          font-size: 22px;
          color: var(--accent);
          line-height: 1;
          padding-top: 4px;
          letter-spacing: -0.5px;
          transition: transform 0.4s ease;
        }
        .ax-agent:hover .ax-agent-num {
          transform: translateX(-4px);
        }
        .ax-agent-body { flex: 1; }
        .ax-agent-name {
          font-size: 19px;
          font-weight: 500;
          letter-spacing: -0.4px;
          color: var(--text-primary);
          margin-bottom: 8px;
        }
        .ax-agent-desc {
          font-size: 14px;
          line-height: 1.65;
          color: var(--text-secondary);
          max-width: 420px;
        }
        .ax-agent-arrow {
          align-self: center;
          font-size: 18px;
          color: var(--accent);
          opacity: 0;
          transform: translateX(-10px);
          transition: opacity 0.4s ease, transform 0.4s ease;
        }
        .ax-agent:hover .ax-agent-arrow {
          opacity: 1;
          transform: translateX(0);
        }

        /* ── Atelier ─────────────────────────────────────── */
        .ax-atelier {
          max-width: 780px;
          margin: 0 auto;
          text-align: center;
        }
        .ax-atelier-title { margin-bottom: 36px; }
        .ax-atelier-body {
          font-family: var(--font-playfair), Georgia, serif;
          font-size: 21px;
          line-height: 1.75;
          color: var(--text-secondary);
          font-weight: 400;
          max-width: 680px;
          margin: 0 auto;
          font-style: italic;
        }
        .ax-atelier-sig {
          font-size: 12px;
          letter-spacing: 0.4px;
          color: var(--text-muted);
          text-align: center;
        }

        /* ── Testimonials ────────────────────────────────── */
        .ax-tests {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0;
          border-top: 1px solid var(--stone-line);
          border-left: 1px solid var(--stone-line);
        }
        .ax-test {
          padding: 44px 36px;
          border-right: 1px solid var(--stone-line);
          border-bottom: 1px solid var(--stone-line);
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }
        .ax-test-quote {
          font-family: var(--font-playfair), Georgia, serif;
          font-size: 18px;
          line-height: 1.65;
          font-style: italic;
          color: var(--text-primary);
          margin: 0;
          flex: 1;
        }
        .ax-test-foot {
          display: flex;
          align-items: center;
          gap: 14px;
          padding-top: 20px;
          border-top: 1px solid var(--stone-line);
        }
        .ax-test-initials {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: var(--stone-soft);
          border: 1px solid var(--stone-line);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-primary);
          font-family: var(--font-playfair), Georgia, serif;
          font-size: 14px;
          font-weight: 600;
          flex-shrink: 0;
        }
        .ax-test-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          letter-spacing: -0.1px;
        }
        .ax-test-cargo {
          font-size: 11px;
          color: var(--text-muted);
          letter-spacing: 0.2px;
          margin-top: 2px;
        }

        /* ── Plans ───────────────────────────────────────── */
        .ax-plans {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0;
          border-top: 1px solid var(--stone-line);
          border-left: 1px solid var(--stone-line);
        }
        .ax-plan {
          position: relative;
          padding: 52px 40px 44px;
          border-right: 1px solid var(--stone-line);
          border-bottom: 1px solid var(--stone-line);
          display: flex;
          flex-direction: column;
          background: transparent;
          transition: background 0.4s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .ax-plan:hover {
          background: var(--stone-soft);
          transform: translateY(-4px);
        }
        .ax-plan--popular {
          background: var(--card-bg);
          backdrop-filter: blur(18px);
        }
        .ax-plan--popular::before {
          content: '';
          position: absolute;
          top: -1px; left: -1px; right: -1px;
          height: 2px;
          background: var(--accent);
        }
        /* Billing toggle */
        .ax-billing-toggle {
          display: flex;
          align-items: center;
          gap: 4px;
          margin: 0 auto 40px;
          width: fit-content;
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 100px;
          padding: 4px;
        }
        .ax-billing-opt {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          border-radius: 100px;
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.4px;
          color: var(--text-muted);
          transition: background 0.2s, color 0.2s;
        }
        .ax-billing-opt.active {
          background: var(--accent);
          color: #fff;
        }
        .ax-billing-discount {
          font-size: 10px;
          font-weight: 700;
          background: rgba(255,255,255,0.25);
          padding: 2px 6px;
          border-radius: 100px;
          letter-spacing: 0.5px;
        }
        .ax-billing-opt:not(.active) .ax-billing-discount {
          background: var(--accent-light);
          color: var(--accent);
        }

        .ax-plan-annual-note {
          font-size: 11px;
          color: var(--accent);
          letter-spacing: 0.5px;
          margin-bottom: 4px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .ax-plan-beta-note {
          font-size: 12px;
          color: var(--text-secondary);
          margin-bottom: 4px;
          line-height: 1.5;
        }
        .ax-plan-price-strike {
          text-decoration: line-through;
          color: var(--text-muted);
        }

        .ax-plan-badge {
          position: absolute;
          top: 20px;
          right: 28px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--accent);
          font-family: var(--font-playfair), Georgia, serif;
          font-style: italic;
        }
        .ax-plan-badge--beta {
          color: var(--warning, #f59e0b);
          letter-spacing: 1px;
          font-size: 9px;
        }
        .ax-plan-name {
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 2.4px;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 18px;
        }
        .ax-plan-price {
          display: flex;
          align-items: baseline;
          gap: 6px;
          margin-bottom: 8px;
        }
        .ax-plan-currency {
          font-size: 15px;
          color: var(--text-muted);
          letter-spacing: 0.5px;
        }
        .ax-plan-value {
          font-family: var(--font-playfair), Georgia, serif;
          font-size: 72px;
          font-weight: 400;
          line-height: 1;
          color: var(--text-primary);
          letter-spacing: -3px;
        }
        .ax-plan-per {
          font-size: 13px;
          color: var(--text-muted);
          letter-spacing: 0.3px;
        }
        .ax-plan-headline {
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 28px;
          letter-spacing: 0.2px;
        }
        .ax-plan-features {
          list-style: none;
          padding: 0;
          margin: 0 0 32px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1;
        }
        .ax-plan-features li {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.55;
        }
        .ax-plan-dot {
          width: 5px;
          height: 5px;
          background: var(--accent);
          border-radius: 50%;
          flex-shrink: 0;
        }
        .ax-plan-cta {
          display: block;
          text-align: center;
          padding: 14px 20px;
          border: 1px solid var(--stone-line);
          color: var(--text-primary);
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.4px;
          transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
        }
        .ax-plan-cta:hover {
          background: var(--text-primary);
          color: var(--bg-base);
          border-color: var(--text-primary);
        }
        .ax-plan-cta--solid {
          background: var(--text-primary);
          color: var(--bg-base);
          border-color: var(--text-primary);
        }
        .ax-plan-cta--solid:hover {
          background: var(--accent);
          border-color: var(--accent);
        }

        /* ── Closing ─────────────────────────────────────── */
        .ax-closing-title {
          font-size: clamp(34px, 4.8vw, 58px);
          font-weight: 300;
          letter-spacing: -1.6px;
          line-height: 1.1;
          color: var(--text-primary);
          margin: 28px 0 0;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
        }

        /* ── LGPD ────────────────────────────────────────── */
        .ax-lgpd {
          padding: 28px 32px;
          border: 1px solid var(--stone-line);
          font-size: 12px;
          line-height: 1.75;
          color: var(--text-muted);
          background: var(--stone-soft);
        }
        .ax-lgpd-head {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 2.4px;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 10px;
        }

        /* ── Footer ──────────────────────────────────────── */
        .ax-footer {
          border-top: 1px solid var(--stone-line);
          background: transparent;
        }
        .ax-footer-grid {
          display: grid;
          grid-template-columns: 1.6fr 1fr 1fr 1fr;
          gap: 48px;
        }
        .ax-footer-blurb {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.65;
          margin-top: 18px;
          max-width: 320px;
        }
        .ax-footer-title {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 2.4px;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 18px;
        }
        .ax-footer-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .ax-footer-link {
          font-size: 13px;
          color: var(--text-secondary);
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .ax-footer-link:hover { color: var(--accent); }
        .ax-footer-bottom {
          margin-top: 56px;
          padding-top: 28px;
          border-top: 1px solid var(--stone-line);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 14px;
          font-size: 11px;
          color: var(--text-muted);
          letter-spacing: 0.3px;
        }
        .ax-footer-contact {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          align-items: center;
        }
        .ax-footer-sep { color: var(--text-muted); opacity: 0.5; }

        /* ── Responsive ──────────────────────────────────── */
        @media (max-width: 960px) {
          .ax-hero-grid { grid-template-columns: 1fr; gap: 48px; }
          .ax-hero-right { max-width: 400px; }
          .ax-provas { grid-template-columns: repeat(2, 1fr); }
          .ax-prova:nth-child(3) { border-left: none; }
          .ax-prova { border-bottom: 1px solid var(--stone-line); }
          .ax-prova:nth-child(n+3) { border-bottom: none; }
          .ax-agents { grid-template-columns: 1fr; }
          .ax-tests { grid-template-columns: 1fr; }
          .ax-plans { grid-template-columns: 1fr; }
          .ax-footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
          .ax-nav-links { gap: 16px; }
          .ax-nav-link:not(.ax-cta-primary) { display: none; }
        }
        @media (max-width: 560px) {
          .ax-hero-grid { gap: 36px; }
          .ax-provas { grid-template-columns: 1fr; }
          .ax-prova { border-left: none !important; border-bottom: 1px solid var(--stone-line); }
          .ax-footer-grid { grid-template-columns: 1fr; }
          .ax-plan-value { font-size: 56px; }
          .ax-hero-card-metric { font-size: 80px; }
        }
      `}</style>
    </div>
  )
}

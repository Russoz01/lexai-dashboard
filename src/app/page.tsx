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
  { n: '01', name: 'Resumidor',          desc: 'Cole qualquer documento — contrato, acordao, peticao — e receba uma analise estruturada com riscos, clausulas criticas e prazos em segundos.' },
  { n: '02', name: 'Redator',            desc: 'Peticoes iniciais, recursos, contestacoes e notificacoes extrajudiciais com fundamentacao doutrinaria e jurisprudencial completa.' },
  { n: '03', name: 'Pesquisador',        desc: 'Busca inteligente em jurisprudencia do STF, STJ, TRFs e TJs estaduais. Cada resultado com ementa, tribunal e data de julgamento.' },
  { n: '04', name: 'Negociador',         desc: 'Mapeamento de BATNA, ZOPA e tres cenarios de acordo. Estrategia de negociacao com fundamentacao e pontos de pressao.' },
  { n: '05', name: 'Monitor Legislativo', desc: 'Mudancas normativas e novos precedentes na sua area de atuacao, entregues automaticamente. Nunca seja surpreendido por alteracao legislativa que afeta seus casos.' },
  { n: '06', name: 'Calculador',         desc: 'Prazos processuais com feriados, correcao monetaria (INPC, IGPM, IPCA), juros de mora e custas judiciais por estado.' },
  { n: '07', name: 'Legislacao',         desc: 'Qualquer artigo de lei explicado em linguagem acessivel, com doutrina majoritaria e jurisprudencia aplicada ao caso concreto.' },
  { n: '08', name: 'Rotina',             desc: 'Gestao de audiencias, prazos processuais, compromissos e fluxos de trabalho do escritorio organizados por prioridade.' },
  { n: '09', name: 'Parecerista',        desc: 'Pareceres juridicos estruturados com fundamentacao legal, doutrina majoritaria, argumentos pro e contra e recomendacao conclusiva. Pronto para revisao e assinatura.' },
  { n: '10', name: 'Estrategista',       desc: 'Analise estrategica de risco processual, mapeamento de precedentes favoraveis e desfavoraveis, e recomendacao de linha de atuacao antes de qualquer decisao.' },
  { n: '11', name: 'Tradutor Juridico',  desc: 'Contratos, tratados e documentos internacionais traduzidos com preservacao do vocabulario tecnico juridico. Ingles, espanhol e frances — essencial para advocacia internacional e contratos cross-border.' },
  { n: '12', name: 'Compliance',         desc: 'Analise de conformidade regulatoria, mapeamento de riscos de LGPD, anticorrupcao e setorial. Identifica exposicoes antes que virem passivos.' },
]

const provas = [
  { n: 'I',   metric: '12',       label: 'Agentes especializados' },
  { n: 'II',  metric: '9',        label: 'Areas do Direito cobertas' },
  { n: 'III', metric: '4 min',    label: 'Por analise de documento',   nota: '(media do beta fechado)' },
  { n: 'IV',  metric: '+R$1.600', label: 'Economizados por consulta',  nota: '(estimativa por consulta)' },
]

const depoimentos = [
  {
    initials: 'RL',
    name: 'Renata Lima',
    cargo: 'Socia · Lima Advocacia',
    quote: 'Substituiu dois estagiarios e ainda entrega mais rapido. O investimento se pagou no primeiro mes de uso.',
  },
  {
    initials: 'MC',
    name: 'Mariana Castro',
    cargo: 'Advogada Civil · SP',
    quote: 'Em duas semanas economizei mais de vinte horas de pesquisa. O Pesquisador encontra acordaos que eu nem sabia que existiam.',
  },
]

const planos = [
  {
    name: 'Escritorio',
    price: '1.399',
    seats: '1–5 advogados',
    headline: '5 agentes · 200 documentos / mes',
    features: ['Resumidor, Pesquisador, Redator, Calculador, Monitor Legislativo', 'Historico de 45 dias', 'Suporte por email em 24h'],
  },
  {
    name: 'Firma',
    price: '1.459',
    seats: '6–15 advogados',
    headline: '12 agentes · documentos ilimitados',
    popular: true,
    features: ['Todos os agentes especializados', 'Exportacao em PDF', 'Suporte prioritario em 3h', 'Historico de 90 dias', 'Sessao de onboarding dedicada', 'Compra avulsa de tokens'],
  },
  {
    name: 'Enterprise',
    price: '1.599',
    seats: '16+ advogados',
    headline: 'Ilimitado · agentes customizados',
    features: ['Agentes customizados para o escritorio', 'API privada + SLA de uptime', 'Gerente de conta dedicado', 'Historico ilimitado', 'Opcao on-premise', 'DPA incluso'],
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
      { label: 'Agendar demonstracao', href: '/login' },
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

export default function LandingPage() {
  useScrollReveal()

  // Nav shadow appears after 24px of scroll
  const [navScrolled, setNavScrolled] = useState(false)

  // Mobile menu open state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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
            <Link href="/empresas" className="ax-nav-link">Empresas</Link>
            <Link href="/login" className="ax-nav-link">Entrar</Link>
            <Link href="/login" className="ax-cta-primary">Agendar demonstracao</Link>
          </nav>
          <button
            className="ax-hamburger"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Abrir menu"
          >
            <span className="ax-hamburger-bar" />
            <span className="ax-hamburger-bar" />
            <span className="ax-hamburger-bar" />
          </button>
        </div>
      </header>

      {/* ── MOBILE MENU ─────────────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div
          className="ax-mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Fechar menu"
        />
      )}
      <div className={`ax-mobile-panel${mobileMenuOpen ? ' ax-mobile-panel--open' : ''}`}>
        <button
          className="ax-mobile-close"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Fechar menu"
        >
          <span style={{ display: 'block', width: '20px', height: '1px', background: 'var(--text-primary)', transform: 'rotate(45deg) translateY(0.5px)' }} />
          <span style={{ display: 'block', width: '20px', height: '1px', background: 'var(--text-primary)', transform: 'rotate(-45deg) translateY(-0.5px)', marginTop: '-1px' }} />
        </button>
        <nav className="ax-mobile-nav">
          <a href="#agentes" className="ax-mobile-link" onClick={() => setMobileMenuOpen(false)}>Agentes</a>
          <a href="#atelier" className="ax-mobile-link" onClick={() => setMobileMenuOpen(false)}>Atelier</a>
          <a href="#planos"  className="ax-mobile-link" onClick={() => setMobileMenuOpen(false)}>Planos</a>
          <div className="ax-mobile-divider" />
          <Link href="/login" className="ax-mobile-link" onClick={() => setMobileMenuOpen(false)}>Entrar</Link>
          <Link href="/login" className="ax-cta-primary ax-mobile-cta" onClick={() => setMobileMenuOpen(false)}>Agendar demonstracao</Link>
        </nav>
      </div>

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section style={{ ...shell, padding: '180px 40px 80px' }}>
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
              processuais. Cada prompt afinado. Cada resposta revisada. Nenhum prazo perdido.
            </p>
            <div className="ax-hero-cta-row ax-line" style={{ '--d': '560ms' } as React.CSSProperties}>
              <Link href="/login" className="ax-cta-primary ax-cta-large">
                <span>Agendar demonstracao</span>
                <span className="ax-cta-arrow" aria-hidden>→</span>
              </Link>
              <a href="/login" className="ax-cta-ghost">Comecar 7 dias gratis &nbsp;→</a>
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
      <section style={{ ...shell, padding: '140px 40px' }}>
        <div className="ax-provas" data-reveal>
          {provas.map((p, i) => (
            <div key={p.label} className="ax-prova" style={{ '--reveal-delay': `${i * 90}ms` } as React.CSSProperties}>
              <div className="ax-prova-num">{p.n}</div>
              <div className="ax-prova-metric">{p.metric}</div>
              <div className="ax-prova-label">
                {p.label}
                {'nota' in p && p.nota && (
                  <span style={{ display: 'block', fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>{p.nota}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── AGENTES ────────────────────────────────────────────────────── */}
      <section id="agentes" style={{ ...shell, padding: '240px 40px 200px' }}>
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
          {/* ── Documentos ──────────────────────────────── */}
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'var(--text-muted)',
            marginBottom: 16, marginTop: 0, paddingBottom: 8,
            borderBottom: '1px solid var(--stone-line)',
          }}>
            Documentos
          </div>
          {agentes.filter(a => ['Resumidor', 'Redator', 'Parecerista'].includes(a.name)).map((a, i) => (
            <div key={a.name} className="ax-agent" style={{ '--reveal-delay': `${i * 70}ms` } as React.CSSProperties}>
              <div className="ax-agent-num">{a.n}</div>
              <div className="ax-agent-body">
                <h3 className="ax-agent-name">{a.name}</h3>
                <div className="ax-agent-desc">{a.desc}</div>
              </div>
              <div className="ax-agent-arrow" aria-hidden>→</div>
            </div>
          ))}

          {/* ── Pesquisa & Legislação ────────────────────── */}
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'var(--text-muted)',
            marginBottom: 16, marginTop: 40, paddingBottom: 8,
            borderBottom: '1px solid var(--stone-line)',
          }}>
            Pesquisa &amp; Legislação
          </div>
          {agentes.filter(a => ['Pesquisador', 'Monitor Legislativo', 'Legislacao'].includes(a.name)).map((a, i) => (
            <div key={a.name} className="ax-agent" style={{ '--reveal-delay': `${(i + 3) * 70}ms` } as React.CSSProperties}>
              <div className="ax-agent-num">{a.n}</div>
              <div className="ax-agent-body">
                <h3 className="ax-agent-name">{a.name}</h3>
                <div className="ax-agent-desc">{a.desc}</div>
              </div>
              <div className="ax-agent-arrow" aria-hidden>→</div>
            </div>
          ))}

          {/* ── Estratégia ───────────────────────────────── */}
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'var(--text-muted)',
            marginBottom: 16, marginTop: 40, paddingBottom: 8,
            borderBottom: '1px solid var(--stone-line)',
          }}>
            Estratégia
          </div>
          {agentes.filter(a => ['Negociador', 'Estrategista'].includes(a.name)).map((a, i) => (
            <div key={a.name} className="ax-agent" style={{ '--reveal-delay': `${(i + 6) * 70}ms` } as React.CSSProperties}>
              <div className="ax-agent-num">{a.n}</div>
              <div className="ax-agent-body">
                <h3 className="ax-agent-name">{a.name}</h3>
                <div className="ax-agent-desc">{a.desc}</div>
              </div>
              <div className="ax-agent-arrow" aria-hidden>→</div>
            </div>
          ))}

          {/* ── Gestão ───────────────────────────────────── */}
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'var(--text-muted)',
            marginBottom: 16, marginTop: 40, paddingBottom: 8,
            borderBottom: '1px solid var(--stone-line)',
          }}>
            Gestão
          </div>
          {agentes.filter(a => ['Calculador', 'Rotina'].includes(a.name)).map((a, i) => (
            <div key={a.name} className="ax-agent" style={{ '--reveal-delay': `${(i + 8) * 70}ms` } as React.CSSProperties}>
              <div className="ax-agent-num">{a.n}</div>
              <div className="ax-agent-body">
                <h3 className="ax-agent-name">{a.name}</h3>
                <div className="ax-agent-desc">{a.desc}</div>
              </div>
              <div className="ax-agent-arrow" aria-hidden>→</div>
            </div>
          ))}

          {/* ── Internacional & Conformidade ─────────────── */}
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'var(--text-muted)',
            marginBottom: 16, marginTop: 40, paddingBottom: 8,
            borderBottom: '1px solid var(--stone-line)',
          }}>
            Internacional &amp; Conformidade
          </div>
          {agentes.filter(a => ['Tradutor Juridico', 'Compliance'].includes(a.name)).map((a, i) => (
            <div key={a.name} className="ax-agent" style={{ '--reveal-delay': `${(i + 10) * 70}ms` } as React.CSSProperties}>
              <div className="ax-agent-num">{a.n}</div>
              <div className="ax-agent-body">
                <h3 className="ax-agent-name">{a.name}</h3>
                <div className="ax-agent-desc">{a.desc}</div>
              </div>
              <div className="ax-agent-arrow" aria-hidden>→</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ATELIER (philosophy strip) ─────────────────────────────────── */}
      <section id="atelier" style={{ ...shell, padding: '240px 40px' }}>
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

      {/* ── SEGURANCA ──────────────────────────────────────────────────── */}
      <section style={{ ...shell, padding: '240px 40px 200px' }}>
        <div className="ax-section-head" data-reveal>
          <SerialLabel>Capitulo III · Sigilo</SerialLabel>
          <h2 className="ax-section-title">
            Seus dados de cliente nunca saem do seu <em className="ax-italic">controle</em>.
          </h2>
          <p className="ax-section-sub">
            Sigilo profissional nao e feature. E fundacao.
          </p>
        </div>
        <Rule />
        <div className="ax-agents" data-reveal>
          {[
            { n: '01', name: 'Criptografia ponta a ponta',       desc: 'Dados em repouso e em transito com criptografia bancaria — o mesmo padrao usado por bancos.' },
            { n: '02', name: 'Dados nunca usados em treinamento', desc: 'Garantia contratual, sem excecoes.' },
            { n: '03', name: 'Isolamento total entre clientes',   desc: 'Seu historico nunca cruza com outro escritorio.' },
            { n: '04', name: 'Logs de auditoria por usuario',     desc: 'Rastreabilidade completa de cada consulta e documento.' },
            { n: '05', name: 'Conformidade LGPD',                 desc: 'Lei n 13.709/2018 — operacao dentro do marco regulatorio brasileiro.' },
            { n: '06', name: 'Contrato de protecao de dados',     desc: 'Assinamos um acordo formal de processamento de dados (DPA) antes de qualquer operacao.' },
          ].map((a, i) => (
            <div key={a.name} className="ax-agent" style={{ '--reveal-delay': `${i * 70}ms` } as React.CSSProperties}>
              <div className="ax-agent-num">{a.n}</div>
              <div className="ax-agent-body">
                <h3 className="ax-agent-name">{a.name}</h3>
                <div className="ax-agent-desc">{a.desc}</div>
              </div>
              <div className="ax-agent-arrow" aria-hidden>→</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── RESULTADOS ─────────────────────────────────────────────────── */}
      <section style={{ ...shell, padding: '175px 40px 200px' }}>
        <div className="ax-section-head" data-reveal>
          <SerialLabel>Capitulo IV · Resultados</SerialLabel>
          <h2 className="ax-section-title">
            O que escritorios estao <em className="ax-italic">recuperando</em>.
          </h2>
          <p className="ax-section-sub">
            Resultados reais de quem usou a plataforma durante o acesso beta.
          </p>
        </div>
        <Rule />
        <div className="ax-tests ax-tests--results" data-reveal>
          {[
            {
              initials: 'ET',
              name: 'Escritorio Trabalhista',
              cargo: '6 advogados · SP',
              quote: 'Contestacoes levavam 4 horas por caso. Com Redator e Pesquisador em sequencia: 38 minutos. Recuperamos 3,4 horas por caso.',
            },
            {
              initials: 'EC',
              name: 'Escritorio Civel',
              cargo: '3 socios · Interior de SP',
              quote: 'Pesquisa de jurisprudencia centralizada num socio criava gargalo na entrega. Capacidade de atendimento aumentada em 40% sem contratar ninguem.',
            },
            {
              initials: 'EI',
              name: 'Escritorio Imobiliario',
              cargo: '8 advogados · Campinas',
              quote: 'Revisao de contratos atrasava fechamentos. Analise de risco de 60 paginas entregue em 3 minutos. Ciclo de 3 dias virou 4 horas.',
            },
          ].map((d, i) => (
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
        <div data-reveal style={{ marginTop: 56, textAlign: 'center' }}>
          <p className="ax-atelier-body" style={{ maxWidth: 640, margin: '0 auto' }}>
            Quantas horas de advogado senior o seu escritorio perde por semana?
          </p>
        </div>
      </section>

      {/* ── DEPOIMENTOS ────────────────────────────────────────────────── */}
      <section style={{ ...shell, padding: '84px 40px 240px' }}>
        <div className="ax-section-head" data-reveal>
          <SerialLabel>Capitulo V · Vozes</SerialLabel>
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
      <section id="planos" style={{ ...shell, padding: '84px 40px 280px', maxWidth: 1180 }}>
        <div className="ax-section-head" data-reveal>
          <SerialLabel>Capitulo VI · Acesso</SerialLabel>
          <h2 className="ax-section-title">
            Planos <em className="ax-italic">transparentes</em>.
          </h2>
          <p className="ax-section-sub">
            Demonstracao guiada de 30 minutos · Sem compromisso.
          </p>
        </div>
        <Rule />

        <div className="ax-plans" data-reveal>
          {planos.map((p, i) => (
            <div key={p.name} className={`ax-plan${p.popular ? ' ax-plan--popular' : ''}`} style={{ '--reveal-delay': `${i * 130}ms` } as React.CSSProperties}>
              {p.popular && <div className="ax-plan-badge">Mais escolhido</div>}
              <div className="ax-plan-name">{p.name}</div>
              <div className="ax-plan-seats">{p.seats}</div>
              <div className="ax-plan-price">
                <span className="ax-plan-currency">R$</span>
                <span className="ax-plan-value">{p.price}</span>
              </div>
              <div className="ax-plan-per-seat">por advogado / mes</div>
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
                {i === 0 ? 'Comecar 7 dias gratis' : 'Agendar demonstracao'}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── CLOSING MARK ───────────────────────────────────────────────── */}
      <section style={{ ...shell, padding: '140px 40px 200px', textAlign: 'center' }}>
        <div data-reveal>
          <SerialLabel>Ad finem · MMXXVI</SerialLabel>
          <h2 className="ax-closing-title">
            Pronto para praticar Direito <em className="ax-italic">com instrumento a altura</em>?
          </h2>
          <div style={{ marginTop: 36 }}>
            <Link href="/login" className="ax-cta-primary ax-cta-large">
              <span>Agendar demonstracao</span>
              <span className="ax-cta-arrow" aria-hidden>→</span>
            </Link>
          </div>
          <div style={{ marginTop: 20, fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.3px' }}>
            Demonstracao guiada de 30 minutos · Sem compromisso
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
                Inteligencia juridica feita a mao · <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Vanix Corp</strong>
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
              <span>contato@vanixcorp.com</span>
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
        /* Animated grain texture overlay */
        .ax-root::after {
          content: '';
          position: fixed;
          inset: -50%;
          width: 200%;
          height: 200%;
          pointer-events: none;
          z-index: 999;
          opacity: 0.028;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 128px 128px;
          animation: ax-grain 6s steps(8) infinite;
        }
        @keyframes ax-grain {
          0%, 100% { transform: translate(0, 0); }
          12% { transform: translate(-5%, -5%); }
          25% { transform: translate(5%, 0); }
          37% { transform: translate(-2%, 3%); }
          50% { transform: translate(3%, -3%); }
          62% { transform: translate(-3%, 5%); }
          75% { transform: translate(5%, -2%); }
          87% { transform: translate(-5%, 2%); }
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
          background: linear-gradient(90deg, transparent, var(--accent) 30%, var(--stone-line) 50%, var(--accent) 70%, transparent);
          opacity: 0.5;
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
          transform: translateY(36px) scale(0.97);
          filter: blur(4px);
          transition: opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1), filter 0.8s ease;
          transition-delay: var(--reveal-delay, 0ms);
        }
        [data-reveal].is-revealed {
          opacity: 1;
          transform: translateY(0) scale(1);
          filter: blur(0);
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
          background: linear-gradient(135deg, rgba(var(--bg-base-rgb, 245,243,239), 0.85), rgba(var(--bg-base-rgb, 245,243,239), 0.72));
          backdrop-filter: blur(24px) saturate(160%);
          -webkit-backdrop-filter: blur(24px) saturate(160%);
          border-bottom: 1px solid rgba(191,166,142,0.15);
          box-shadow: 0 1px 20px rgba(19, 32, 37, 0.03);
          transition: border-color 0.4s ease, box-shadow 0.4s ease, background 0.4s ease;
        }
        .ax-nav--scrolled {
          border-bottom-color: rgba(191,166,142,0.25);
          box-shadow: 0 4px 40px rgba(19, 32, 37, 0.06), 0 1px 0 rgba(191,166,142,0.1);
          background: linear-gradient(135deg, rgba(var(--bg-base-rgb, 245,243,239), 0.92), rgba(var(--bg-base-rgb, 245,243,239), 0.85));
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
          transition: color 0.3s ease;
          position: relative;
        }
        .ax-nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 1px;
          background: var(--accent);
          transition: width 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .ax-nav-link:hover { color: var(--text-primary); }
        .ax-nav-link:hover::after { width: 100%; }

        /* ── Hamburger ───────────────────────────────────── */
        .ax-hamburger {
          display: none;
          flex-direction: column;
          justify-content: center;
          align-items: flex-end;
          gap: 5px;
          width: 36px;
          height: 36px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
        }
        .ax-hamburger-bar {
          display: block;
          height: 1.5px;
          background: var(--text-secondary);
          border-radius: 1px;
          transition: width 0.2s ease;
        }
        .ax-hamburger-bar:nth-child(1) { width: 22px; }
        .ax-hamburger-bar:nth-child(2) { width: 16px; }
        .ax-hamburger-bar:nth-child(3) { width: 22px; }
        .ax-hamburger:hover .ax-hamburger-bar { background: var(--text-primary); }

        /* ── Mobile overlay ──────────────────────────────── */
        .ax-mobile-overlay {
          position: fixed;
          inset: 0;
          z-index: 90;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }

        /* ── Mobile panel ────────────────────────────────── */
        .ax-mobile-panel {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          z-index: 100;
          width: 280px;
          background: var(--card-bg);
          border-left: 1px solid var(--stone-line);
          display: flex;
          flex-direction: column;
          padding: 24px;
          transform: translateX(100%);
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          pointer-events: none;
        }
        .ax-mobile-panel--open {
          transform: translateX(0);
          pointer-events: all;
        }
        .ax-mobile-close {
          align-self: flex-end;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: none;
          border: none;
          cursor: pointer;
          margin-bottom: 40px;
          padding: 0;
        }
        .ax-mobile-nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .ax-mobile-link {
          font-family: 'DM Sans', sans-serif;
          font-size: 22px;
          font-weight: 400;
          color: var(--text-primary);
          text-decoration: none;
          letter-spacing: -0.3px;
          padding: 10px 0;
          border-bottom: none;
          transition: color 0.2s ease, opacity 0.2s ease;
          opacity: 0.85;
        }
        .ax-mobile-link:hover { opacity: 1; }
        .ax-mobile-divider {
          height: 1px;
          background: var(--stone-line);
          margin: 16px 0;
        }
        .ax-mobile-cta {
          margin-top: 8px;
          width: 100%;
          justify-content: center;
          font-size: 13px;
        }

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
        @keyframes ax-hero-mesh {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes ax-float-orb {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.18; }
          33% { transform: translate(15px, -20px) scale(1.08); opacity: 0.25; }
          66% { transform: translate(-10px, 15px) scale(0.95); opacity: 0.15; }
        }

        .ax-hero-grid {
          display: grid;
          grid-template-columns: 1.45fr 1fr;
          gap: 80px;
          align-items: center;
          position: relative;
        }
        /* Animated mesh gradient behind hero */
        .ax-hero-grid::before {
          content: '';
          position: absolute;
          top: -120px;
          left: -15%;
          right: -15%;
          bottom: -120px;
          pointer-events: none;
          background: linear-gradient(135deg, rgba(191,166,142,0.06) 0%, transparent 30%, rgba(68,55,43,0.04) 60%, transparent 100%);
          background-size: 200% 200%;
          animation: ax-hero-mesh 12s ease-in-out infinite;
          border-radius: 50%;
          filter: blur(60px);
          z-index: -1;
        }
        .ax-hero-right {
          animation: ax-rise 1s cubic-bezier(0.16, 1, 0.3, 1) 0.32s both;
          position: relative;
        }
        /* Floating orb glow behind hero card */
        .ax-hero-right::before {
          content: '';
          position: absolute;
          top: -30%;
          left: -20%;
          width: 140%;
          height: 160%;
          pointer-events: none;
          background: radial-gradient(circle at 50% 50%, rgba(191,166,142,0.2), transparent 60%);
          animation: ax-float-orb 8s ease-in-out infinite;
          z-index: -1;
          filter: blur(40px);
        }
        .ax-hero-title {
          font-size: clamp(44px, 6.2vw, 78px);
          font-weight: 300;
          letter-spacing: -2.4px;
          line-height: 1.02;
          margin: 28px 0 52px;
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
        /* Title accent glow */
        .ax-hero-left {
          position: relative;
        }
        .ax-hero-left::before {
          content: '';
          position: absolute;
          top: 40px;
          left: -40px;
          width: 180px;
          height: 180px;
          background: radial-gradient(circle, rgba(191,166,142,0.12), transparent 70%);
          pointer-events: none;
          z-index: -1;
          filter: blur(40px);
          animation: ax-float-orb 10s ease-in-out infinite reverse;
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
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s ease, box-shadow 0.6s ease;
          --mx: 50%;
          --my: 0%;
          box-shadow: 0 4px 30px rgba(68,55,43,0.06);
        }
        .ax-hero-card:hover {
          border-color: rgba(191, 166, 142, 0.5);
          transform: translateY(-4px);
          box-shadow: 0 20px 60px rgba(68,55,43,0.12), 0 0 40px rgba(191,166,142,0.08);
        }
        .ax-hero-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--accent), transparent);
          opacity: 0.6;
          z-index: 2;
        }
        .ax-hero-card-glow {
          position: absolute;
          inset: -40%;
          pointer-events: none;
          background: radial-gradient(
            circle 280px at var(--mx) var(--my),
            rgba(191, 166, 142, 0.2),
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
          border-top: 1px solid rgba(191,166,142,0.2);
          border-bottom: 1px solid rgba(191,166,142,0.2);
          background: linear-gradient(135deg, rgba(191,166,142,0.04) 0%, transparent 40%, rgba(68,55,43,0.03) 100%);
          position: relative;
        }
        .ax-provas::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 80% 100% at 50% 0%, rgba(191,166,142,0.06), transparent);
          pointer-events: none;
        }
        .ax-prova {
          padding: 56px 44px;
          text-align: left;
          border-left: 1px solid var(--stone-line);
          position: relative;
          transition: background 0.4s ease;
        }
        .ax-prova:hover {
          background: rgba(191,166,142,0.04);
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
        .ax-section-head { margin-bottom: 28px; max-width: 680px; position: relative; }
        .ax-section-title {
          font-size: clamp(32px, 4.6vw, 56px);
          font-weight: 300;
          letter-spacing: -1.8px;
          line-height: 1.08;
          color: var(--text-primary);
          margin: 22px 0 16px;
          position: relative;
        }
        .ax-section-title::before {
          content: '';
          position: absolute;
          top: -20px;
          left: -30px;
          width: 140px;
          height: 140px;
          background: radial-gradient(circle, rgba(191,166,142,0.1), transparent 70%);
          pointer-events: none;
          z-index: -1;
          filter: blur(20px);
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
        @keyframes ax-marquee-glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        .ax-marquee-wrap {
          border-top: 1px solid rgba(191,166,142,0.2);
          border-bottom: 1px solid rgba(191,166,142,0.2);
          padding: 26px 0;
          overflow: hidden;
          background: linear-gradient(135deg, var(--stone-soft), rgba(191,166,142,0.06));
          margin-top: 40px;
          position: relative;
        }
        .ax-marquee-wrap::before {
          content: '';
          position: absolute;
          top: 0;
          left: 30%;
          right: 30%;
          bottom: 0;
          background: radial-gradient(ellipse at 50% 50%, rgba(191,166,142,0.1), transparent);
          pointer-events: none;
          animation: ax-marquee-glow 6s ease-in-out infinite;
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
          padding: 48px 40px;
          border-right: 1px solid var(--stone-line);
          border-bottom: 1px solid var(--stone-line);
          display: flex;
          gap: 36px;
          align-items: flex-start;
          transition: background 0.35s ease, transform 0.35s ease, box-shadow 0.4s ease;
          position: relative;
          overflow: hidden;
          min-height: 140px;
        }
        .ax-agent::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--accent), rgba(191,166,142,0.3));
          transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .ax-agent::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(ellipse 300px 200px at 80% 20%, rgba(191,166,142,0.08), transparent);
          opacity: 0;
          transition: opacity 0.5s ease;
        }
        .ax-agent:hover {
          background: var(--stone-soft);
          box-shadow: inset 0 0 40px rgba(191,166,142,0.04);
        }
        .ax-agent:hover::before {
          width: 100%;
        }
        .ax-agent:hover::after {
          opacity: 1;
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
          line-height: 1.7;
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
          position: relative;
        }
        .ax-atelier::before {
          content: '';
          position: absolute;
          top: -80px;
          left: 50%;
          transform: translateX(-50%);
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(191,166,142,0.07), transparent 65%);
          pointer-events: none;
          z-index: -1;
          filter: blur(50px);
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
          grid-template-columns: repeat(2, 1fr);
          gap: 0;
          border-top: 1px solid var(--stone-line);
          border-left: 1px solid var(--stone-line);
        }
        .ax-tests--results {
          grid-template-columns: repeat(3, 1fr);
        }
        .ax-test {
          padding: 56px 44px;
          border-right: 1px solid var(--stone-line);
          border-bottom: 1px solid var(--stone-line);
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 36px;
          transition: background 0.4s ease, box-shadow 0.4s ease;
          position: relative;
        }
        .ax-test::after {
          content: '';
          position: absolute;
          top: -1px;
          left: 30%;
          right: 30%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(191,166,142,0.3), transparent);
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        .ax-test:hover {
          background: rgba(191,166,142,0.03);
        }
        .ax-test:hover::after {
          opacity: 1;
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
        @keyframes ax-plan-glow-pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.9; }
        }
        .ax-plans {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0;
          border-top: 1px solid var(--stone-line);
          border-left: 1px solid var(--stone-line);
        }
        .ax-plan {
          position: relative;
          padding: 64px 48px 56px;
          border-right: 1px solid var(--stone-line);
          border-bottom: 1px solid var(--stone-line);
          display: flex;
          flex-direction: column;
          background: transparent;
          transition: background 0.4s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease;
        }
        .ax-plan:hover {
          background: var(--stone-soft);
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(68,55,43,0.06);
        }
        .ax-plan--popular {
          background: linear-gradient(180deg, rgba(191,166,142,0.06) 0%, var(--card-bg) 40%);
          backdrop-filter: blur(18px);
          border-color: rgba(191,166,142,0.25);
          box-shadow: 0 4px 40px rgba(191,166,142,0.08);
        }
        .ax-plan--popular::before {
          content: '';
          position: absolute;
          top: -1px; left: -1px; right: -1px;
          height: 3px;
          background: linear-gradient(90deg, rgba(191,166,142,0.3), var(--accent), rgba(191,166,142,0.3));
          animation: ax-plan-glow-pulse 4s ease-in-out infinite;
        }
        .ax-plan--popular::after {
          content: '';
          position: absolute;
          top: 0;
          left: 10%;
          right: 10%;
          height: 80px;
          background: radial-gradient(ellipse at 50% 0%, rgba(191,166,142,0.1), transparent);
          pointer-events: none;
        }
        .ax-plan--popular:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 60px rgba(191,166,142,0.15), 0 0 0 1px rgba(191,166,142,0.2);
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
        .ax-plan-seats {
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.6px;
          color: var(--accent);
          margin-bottom: 20px;
          text-transform: uppercase;
        }
        .ax-plan-per-seat {
          font-size: 12px;
          color: var(--text-muted);
          letter-spacing: 0.3px;
          margin-bottom: 4px;
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
          gap: 16px;
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
          box-shadow: 0 4px 20px rgba(68,55,43,0.15);
          position: relative;
          overflow: hidden;
        }
        .ax-plan-cta--solid::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent 20%, rgba(191,166,142,0.2) 50%, transparent 80%);
          background-size: 200% 100%;
          animation: ax-shimmer 3s ease-in-out infinite;
          pointer-events: none;
        }
        .ax-plan-cta--solid:hover {
          background: var(--accent);
          border-color: var(--accent);
          box-shadow: 0 8px 30px rgba(191,166,142,0.25);
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
          position: relative;
        }
        .ax-closing-title::before {
          content: '';
          position: absolute;
          top: -40px;
          left: 50%;
          transform: translateX(-50%);
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(191,166,142,0.12), transparent 70%);
          pointer-events: none;
          z-index: -1;
          filter: blur(30px);
        }

        /* ── LGPD ────────────────────────────────────────── */
        .ax-lgpd {
          padding: 28px 32px;
          border: 1px solid rgba(191,166,142,0.15);
          font-size: 12px;
          line-height: 1.75;
          color: var(--text-muted);
          background: linear-gradient(135deg, var(--stone-soft), rgba(191,166,142,0.04));
          position: relative;
          overflow: hidden;
        }
        .ax-lgpd::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(191,166,142,0.3), transparent);
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
          border-top: 1px solid rgba(191,166,142,0.2);
          background: linear-gradient(180deg, transparent 0%, rgba(68,55,43,0.03) 40%, rgba(68,55,43,0.06) 100%);
          position: relative;
        }
        .ax-footer::before {
          content: '';
          position: absolute;
          top: -60px;
          left: 0;
          right: 0;
          height: 60px;
          background: linear-gradient(180deg, transparent, rgba(68,55,43,0.02));
          pointer-events: none;
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

        /* ── Section background alternation ──────────────── */
        /* Agentes section gets a subtle darker wash */
        #agentes {
          position: relative;
        }
        #agentes::before {
          content: '';
          position: absolute;
          inset: -40px -100vw;
          background: linear-gradient(180deg, transparent 0%, rgba(68,55,43,0.025) 20%, rgba(68,55,43,0.04) 50%, rgba(68,55,43,0.025) 80%, transparent 100%);
          pointer-events: none;
          z-index: -1;
        }

        /* Atelier section gets accent wash */
        #atelier {
          position: relative;
        }
        #atelier::before {
          content: '';
          position: absolute;
          inset: -40px -100vw;
          background: linear-gradient(180deg, transparent 0%, rgba(191,166,142,0.03) 30%, rgba(191,166,142,0.05) 50%, rgba(191,166,142,0.03) 70%, transparent 100%);
          pointer-events: none;
          z-index: -1;
        }

        /* Pricing section subtle background shift */
        #planos {
          position: relative;
        }
        #planos::before {
          content: '';
          position: absolute;
          inset: -40px -100vw;
          background: linear-gradient(180deg, transparent, rgba(68,55,43,0.02) 30%, rgba(191,166,142,0.04) 60%, transparent);
          pointer-events: none;
          z-index: -1;
        }

        /* ── Brand mark enhancement ─────────────────────── */
        .ax-brand-mark {
          transition: box-shadow 0.3s ease, border-color 0.3s ease;
        }
        .ax-brand:hover .ax-brand-mark {
          border-color: rgba(191,166,142,0.4);
          box-shadow: 0 0 16px rgba(191,166,142,0.15);
        }

        /* ── Testimonial initials glow ──────────────────── */
        .ax-test-initials {
          transition: box-shadow 0.3s ease, border-color 0.3s ease;
        }
        .ax-test:hover .ax-test-initials {
          border-color: rgba(191,166,142,0.3);
          box-shadow: 0 0 12px rgba(191,166,142,0.12);
        }

        /* ── Plan badge enhancement ─────────────────────── */
        .ax-plan-badge {
          position: relative;
        }
        .ax-plan--popular .ax-plan-badge {
          text-shadow: 0 0 20px rgba(191,166,142,0.3);
        }

        /* ── Enhanced serial labels ─────────────────────── */
        .ax-serial {
          transition: color 0.3s ease;
        }

        /* ── Footer link hover glow ─────────────────────── */
        .ax-footer-link {
          position: relative;
        }
        .ax-footer-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 1px;
          background: linear-gradient(90deg, var(--accent), transparent);
          transition: width 0.35s ease;
        }
        .ax-footer-link:hover::after {
          width: 100%;
        }

        /* ── Footer bottom gradient divider ──────────────── */
        .ax-footer-bottom {
          border-top: 1px solid transparent;
          border-image: linear-gradient(90deg, transparent, rgba(191,166,142,0.25), transparent) 1;
        }

        /* ── CTA button shimmer enhancement ──────────────── */
        @keyframes ax-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .ax-cta-large {
          position: relative;
        }
        .ax-cta-large::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent 20%, rgba(255,255,255,0.1) 50%, transparent 80%);
          background-size: 200% 100%;
          animation: ax-shimmer 4s ease-in-out infinite;
          pointer-events: none;
          border-radius: inherit;
        }

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
          .ax-tests--results { grid-template-columns: 1fr; }
          .ax-plans { grid-template-columns: 1fr; }
          .ax-footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
          .ax-nav-links { gap: 16px; }
          .ax-nav-link:not(.ax-cta-primary) { display: none; }
          .ax-hamburger { display: flex; }
        }
        @media (min-width: 961px) {
          .ax-hamburger { display: none; }
          .ax-mobile-panel { display: none; }
          .ax-mobile-overlay { display: none; }
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

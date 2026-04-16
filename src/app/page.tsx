'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { WhatsAppFloat } from '@/components/WhatsAppFloat'
import { ExitIntent } from '@/components/ExitIntent'
import s from './page.module.css'

/* ----------------------------------------------------------------------------
 * LexAI — Atelier Landing
 *
 * Editorial minimalism com micro-interacoes de precisao. O premium vem do tipo,
 * whitespace e um unico stone-accent sobre o deep navy. Tres camadas de
 * animacao: (a) entrada sequencial do hero, (b) scroll-reveal com stagger
 * por IntersectionObserver, (c) cursor-follow glow no hero card + marquee
 * editorial no corte entre secoes. Zero dependencias externas.
 * -------------------------------------------------------------------------- */

const agentes = [
  { n: '01', name: 'Resumidor',          desc: 'Cole qualquer documento — contrato, acordao, peticao — e receba uma analise estruturada com riscos, clausulas criticas e prazos em segundos.' },
  { n: '02', name: 'Redator',            desc: 'Peticoes iniciais, recursos, contestacoes e notificacoes extrajudiciais com fundamentacao doutrinaria e jurisprudencial completa.' },
  { n: '03', name: 'Pesquisador',        desc: 'Busca inteligente em jurisprudencia do STF, STJ, TRFs e TJs estaduais. Cada resultado com ementa, tribunal e data de julgamento.' },
  { n: '04', name: 'Negociador',         desc: 'Melhor alternativa sem acordo, margem viavel de negociacao e tres cenarios calculados antes da audiencia. Estrategia com fundamentacao e pontos de pressao.' },
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
  return <div className={s.serial}>{children}</div>
}

function Rule() {
  return <div aria-hidden className={s.rule} />
}

function BrandMark() {
  return (
    <Link href="/" className={s.brand}>
      <span className={s.brandMark} aria-hidden>LX</span>
      <span className={s.brandText}>
        <span className={s.brandName}>LexAI</span>
        <span className={s.brandSub}>Atelier juridico</span>
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
    <div className={s.root}>
      {/* ── NAV ────────────────────────────────────────────────────────── */}
      <header className={`${s.nav}${navScrolled ? ` ${s.navScrolled}` : ''}`}>
        <div className={s.shellNav}>
          <BrandMark />
          <nav className={s.navLinks}>
            <a href="#agentes" className={s.navLink}>Agentes</a>
            <a href="#atelier" className={s.navLink}>Atelier</a>
            <a href="#planos"  className={s.navLink}>Planos</a>
            <Link href="/empresas" className={s.navLink}>Empresas</Link>
            <Link href="/roi" className={s.navLink}>ROI</Link>
            <Link href="/sobre" className={s.navLink}>Sobre</Link>
            <Link href="/login" className={s.navLink}>Entrar</Link>
            <Link href="/login" className={s.ctaPrimary}>Agendar demonstracao</Link>
          </nav>
          <button
            className={s.hamburger}
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Abrir menu"
          >
            <span className={s.hamburgerBar} />
            <span className={s.hamburgerBar} />
            <span className={s.hamburgerBar} />
          </button>
        </div>
      </header>

      {/* ── MOBILE MENU ─────────────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div
          className={s.mobileOverlay}
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Fechar menu"
        />
      )}
      <div className={`${s.mobilePanel}${mobileMenuOpen ? ` ${s.mobilePanelOpen}` : ''}`}>
        <button
          className={s.mobileClose}
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Fechar menu"
        >
          <span className={s.mobileCloseBar1} />
          <span className={s.mobileCloseBar2} />
        </button>
        <nav className={s.mobileNav}>
          <a href="#agentes" className={s.mobileLink} onClick={() => setMobileMenuOpen(false)}>Agentes</a>
          <a href="#atelier" className={s.mobileLink} onClick={() => setMobileMenuOpen(false)}>Atelier</a>
          <a href="#planos"  className={s.mobileLink} onClick={() => setMobileMenuOpen(false)}>Planos</a>
          <div className={s.mobileDivider} />
          <Link href="/login" className={s.mobileLink} onClick={() => setMobileMenuOpen(false)}>Entrar</Link>
          <Link href="/login" className={`${s.ctaPrimary} ${s.mobileCta}`} onClick={() => setMobileMenuOpen(false)}>Agendar demonstracao</Link>
        </nav>
      </div>

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section id="main-content" className={s.heroSection}>
        <div className={s.heroGrid}>
          <div className={s.heroLeft}>
            <SerialLabel>N° 001 · LEXAI · MMXXVI</SerialLabel>
            <h1 className={s.heroTitle}>
              <span className={s.line} style={{ '--d': '0ms' } as React.CSSProperties}>Um escritorio juridico</span>
              <br />
              <span className={s.line} style={{ '--d': '140ms' } as React.CSSProperties}>
                <em className={s.italic}>feito a mao</em>,
              </span>
              <br />
              <span className={`${s.line} ${s.heroMuted}`} style={{ '--d': '280ms' } as React.CSSProperties}>
                potencializado por inteligencia artificial.
              </span>
            </h1>
            <p className={`${s.heroLede} ${s.line}`} style={{ '--d': '420ms' } as React.CSSProperties}>
              Doze agentes treinados no ordenamento juridico brasileiro. Cada um afinado como
              uma ferramenta de precisao — documentos, jurisprudencia, calculos, pecas
              processuais. Cada prompt afinado. Cada resposta revisada. Nenhum prazo perdido.
            </p>
            <div className={`${s.heroCtaRow} ${s.line}`} style={{ '--d': '560ms' } as React.CSSProperties}>
              <Link href="/login" className={`${s.ctaPrimary} ${s.ctaLarge}`}>
                <span>Agendar demonstracao</span>
                <span className={s.ctaArrow} aria-hidden>→</span>
              </Link>
              <a href="/login" className={s.ctaGhost}>Comecar 7 dias gratis &nbsp;→</a>
            </div>
            <div className={`${s.line} ${s.heroPricingWrap}`} style={{ '--d': '640ms' } as React.CSSProperties}>
              <div className={s.heroPriceFrom}>
                A partir de <strong className={s.heroPriceAmount}>R$ 1.399</strong>/mes por advogado
              </div>
              <div className={s.heroBetaBadge}>
                Mais de 40 escritorios no programa beta
              </div>
            </div>
          </div>
          <aside className={s.heroRight}>
            <div className={s.heroCard} ref={heroCardRef}>
              <div className={s.heroCardGlow} aria-hidden />
              <div className={s.heroCardHead}>
                <span className={s.serial}>Edicao limitada</span>
                <span className={s.serial}>MMXXVI</span>
              </div>
              <div>
                <div className={s.heroCardMetric}>12</div>
                <div className={s.heroCardMetricLabel}>agentes</div>
                <Rule />
                <p className={s.heroCardQuote}>
                  &ldquo;Estrategia e precisao para quem trata Direito como <em className={s.italic}>oficio</em>.&rdquo;
                </p>
                <div className={s.heroCardSign}>— Vanix Corp, <em className={s.italic}>atelier de software</em></div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ── MARQUEE editorial — faixa em movimento constante ───────────── */}
      <section className={s.marqueeWrap} aria-hidden="true">
        <div className={s.marquee}>
          <div className={s.marqueeTrack}>
            {[...Array(2)].map((_, k) => (
              <div key={k} className={s.marqueeInner}>
                <span>Estrategia</span><span className={s.marqueeDot}>◆</span>
                <span><em className={s.italic}>Precisao</em></span><span className={s.marqueeDot}>◆</span>
                <span>Oficio</span><span className={s.marqueeDot}>◆</span>
                <span><em className={s.italic}>Atelier</em></span><span className={s.marqueeDot}>◆</span>
                <span>Jurisprudencia</span><span className={s.marqueeDot}>◆</span>
                <span><em className={s.italic}>Feito a mao</em></span><span className={s.marqueeDot}>◆</span>
                <span>MMXXVI</span><span className={s.marqueeDot}>◆</span>
                <span><em className={s.italic}>Ituverava, SP</em></span><span className={s.marqueeDot}>◆</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROVAS (serialized stats) ──────────────────────────────────── */}
      <section className={s.provasSection}>
        <div className={s.provas} data-reveal>
          {provas.map((p, i) => (
            <div key={p.label} className={s.prova} style={{ '--reveal-delay': `${i * 90}ms` } as React.CSSProperties}>
              <div className={s.provaNum}>{p.n}</div>
              <div className={s.provaMetric}>{p.metric}</div>
              <div className={s.provaLabel}>
                {p.label}
                {'nota' in p && p.nota && (
                  <span className={s.provaNota}>{p.nota}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── AGENTES ────────────────────────────────────────────────────── */}
      <section id="agentes" className={s.agentesSection}>
        <div className={s.sectionHead} data-reveal>
          <SerialLabel>Capitulo I</SerialLabel>
          <h2 className={s.sectionTitle}>
            Doze agentes. <em className={s.italic}>Um unico gabinete.</em>
          </h2>
          <p className={s.sectionSub}>
            Nao e um assistente generico. Cada agente foi afinado para uma funcao especifica do
            exercicio da advocacia no Brasil — e responde na lingua do processo.
          </p>
        </div>

        <Rule />

        <div className={s.agents} data-reveal>
          {/* ── Documentos ──────────────────────────────── */}
          <div className={`${s.catHead} ${s.catHeadFirst}`}>Documentos</div>
          {agentes.filter(a => ['Resumidor', 'Redator', 'Parecerista'].includes(a.name)).map((a, i) => (
            <div key={a.name} className={s.agent} style={{ '--reveal-delay': `${i * 70}ms` } as React.CSSProperties}>
              <div className={s.agentNum}>{a.n}</div>
              <div className={s.agentBody}>
                <h3 className={s.agentName}>{a.name}</h3>
                <div className={s.agentDesc}>{a.desc}</div>
              </div>
              <div className={s.agentArrow} aria-hidden>→</div>
            </div>
          ))}
          <div className={s.agentGhost} aria-hidden />

          {/* ── Pesquisa & Legislação ────────────────────── */}
          <div className={s.catHead}>Pesquisa &amp; Legislação</div>
          {agentes.filter(a => ['Pesquisador', 'Monitor Legislativo', 'Legislacao'].includes(a.name)).map((a, i) => (
            <div key={a.name} className={s.agent} style={{ '--reveal-delay': `${(i + 3) * 70}ms` } as React.CSSProperties}>
              <div className={s.agentNum}>{a.n}</div>
              <div className={s.agentBody}>
                <h3 className={s.agentName}>{a.name}</h3>
                <div className={s.agentDesc}>{a.desc}</div>
              </div>
              <div className={s.agentArrow} aria-hidden>→</div>
            </div>
          ))}
          <div className={s.agentGhost} aria-hidden />

          {/* ── Estratégia ───────────────────────────────── */}
          <div className={s.catHead}>Estratégia</div>
          {agentes.filter(a => ['Negociador', 'Estrategista'].includes(a.name)).map((a, i) => (
            <div key={a.name} className={s.agent} style={{ '--reveal-delay': `${(i + 6) * 70}ms` } as React.CSSProperties}>
              <div className={s.agentNum}>{a.n}</div>
              <div className={s.agentBody}>
                <h3 className={s.agentName}>{a.name}</h3>
                <div className={s.agentDesc}>{a.desc}</div>
              </div>
              <div className={s.agentArrow} aria-hidden>→</div>
            </div>
          ))}

          {/* ── Gestão ───────────────────────────────────── */}
          <div className={s.catHead}>Gestão</div>
          {agentes.filter(a => ['Calculador', 'Rotina'].includes(a.name)).map((a, i) => (
            <div key={a.name} className={s.agent} style={{ '--reveal-delay': `${(i + 8) * 70}ms` } as React.CSSProperties}>
              <div className={s.agentNum}>{a.n}</div>
              <div className={s.agentBody}>
                <h3 className={s.agentName}>{a.name}</h3>
                <div className={s.agentDesc}>{a.desc}</div>
              </div>
              <div className={s.agentArrow} aria-hidden>→</div>
            </div>
          ))}

          {/* ── Internacional & Conformidade ─────────────── */}
          <div className={s.catHead}>Internacional &amp; Conformidade</div>
          {agentes.filter(a => ['Tradutor Juridico', 'Compliance'].includes(a.name)).map((a, i) => (
            <div key={a.name} className={s.agent} style={{ '--reveal-delay': `${(i + 10) * 70}ms` } as React.CSSProperties}>
              <div className={s.agentNum}>{a.n}</div>
              <div className={s.agentBody}>
                <h3 className={s.agentName}>{a.name}</h3>
                <div className={s.agentDesc}>{a.desc}</div>
              </div>
              <div className={s.agentArrow} aria-hidden>→</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ATELIER (philosophy strip) ─────────────────────────────────── */}
      <section id="atelier" className={s.atelierSection}>
        <div className={s.atelier} data-reveal>
          <SerialLabel>Capitulo II · Atelier</SerialLabel>
          <h2 className={`${s.sectionTitle} ${s.atelierTitle}`}>
            Nao somos mais um SaaS.
            <br />
            <em className={s.italic}>Somos um atelier.</em>
          </h2>
          <p className={s.atelierBody}>
            Cada prompt e afinado. Cada resposta, revisada. A experiencia e pensada para quem
            trata o Direito como oficio — e nao tolera ferramentas genericas. LexAI e uma
            ferramenta privada, feita para um numero limitado de profissionais por vez.
          </p>
          <Rule />
          <div className={s.atelierSig}>
            Assinatura · <strong className={s.atelierSigStrong}>Leonardo, Vanix Corp</strong>
          </div>
        </div>
      </section>

      {/* ── SEGURANCA ──────────────────────────────────────────────────── */}
      <section className={s.segurancaSection}>
        <div className={s.sectionHead} data-reveal>
          <SerialLabel>Capitulo III · Sigilo</SerialLabel>
          <h2 className={s.sectionTitle}>
            Seus dados de cliente nunca saem do seu <em className={s.italic}>controle</em>.
          </h2>
          <p className={s.sectionSub}>
            Sigilo profissional nao e feature. E fundacao.
          </p>
        </div>
        <Rule />
        <div className={s.agents} data-reveal>
          {[
            { n: '01', name: 'Criptografia ponta a ponta',       desc: 'Dados em repouso e em transito com criptografia bancaria — o mesmo padrao usado por bancos.' },
            { n: '02', name: 'Dados nunca usados em treinamento', desc: 'Garantia contratual, sem excecoes.' },
            { n: '03', name: 'Isolamento total entre clientes',   desc: 'Seu historico nunca cruza com outro escritorio.' },
            { n: '04', name: 'Logs de auditoria por usuario',     desc: 'Rastreabilidade completa de cada consulta e documento.' },
            { n: '05', name: 'Conformidade LGPD',                 desc: 'Lei n 13.709/2018 — operacao dentro do marco regulatorio brasileiro.' },
            { n: '06', name: 'Contrato de protecao de dados',     desc: 'Assinamos um acordo formal de processamento de dados (DPA) antes de qualquer operacao.' },
          ].map((a, i) => (
            <div key={a.name} className={s.agent} style={{ '--reveal-delay': `${i * 70}ms` } as React.CSSProperties}>
              <div className={s.agentNum}>{a.n}</div>
              <div className={s.agentBody}>
                <h3 className={s.agentName}>{a.name}</h3>
                <div className={s.agentDesc}>{a.desc}</div>
              </div>
              <div className={s.agentArrow} aria-hidden>→</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── RESULTADOS ─────────────────────────────────────────────────── */}
      <section className={s.resultadosSection}>
        <div className={s.sectionHead} data-reveal>
          <SerialLabel>Capitulo IV · Resultados</SerialLabel>
          <h2 className={s.sectionTitle}>
            O que escritorios estao <em className={s.italic}>recuperando</em>.
          </h2>
          <p className={s.sectionSub}>
            Resultados reais de quem usou a plataforma durante o acesso beta.
          </p>
        </div>
        <Rule />
        <div className={`${s.tests} ${s.testsResults}`} data-reveal>
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
            <figure key={d.name} className={s.test} style={{ '--reveal-delay': `${i * 110}ms` } as React.CSSProperties}>
              <blockquote className={s.testQuote}>&ldquo;{d.quote}&rdquo;</blockquote>
              <figcaption className={s.testFoot}>
                <div className={s.testInitials}>{d.initials}</div>
                <div>
                  <div className={s.testName}>{d.name}</div>
                  <div className={s.testCargo}>{d.cargo}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
        <div data-reveal className={s.resultadosCta}>
          <p className={`${s.atelierBody} ${s.resultadosQuestion}`}>
            Quantas horas de advogado senior o seu escritorio perde por semana?
          </p>
        </div>
      </section>

      {/* ── DEPOIMENTOS ────────────────────────────────────────────────── */}
      <section className={s.depoimentosSection}>
        <div className={s.sectionHead} data-reveal>
          <SerialLabel>Capitulo V · Vozes</SerialLabel>
          <h2 className={s.sectionTitle}>
            O que dizem <em className={s.italic}>os primeiros</em>.
          </h2>
        </div>
        <Rule />
        <div className={s.tests} data-reveal>
          {depoimentos.map((d, i) => (
            <figure key={d.name} className={s.test} style={{ '--reveal-delay': `${i * 110}ms` } as React.CSSProperties}>
              <blockquote className={s.testQuote}>&ldquo;{d.quote}&rdquo;</blockquote>
              <figcaption className={s.testFoot}>
                <div className={s.testInitials}>{d.initials}</div>
                <div>
                  <div className={s.testName}>{d.name}</div>
                  <div className={s.testCargo}>{d.cargo}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ── COMPARATIVO vs CHAT GENERICO ─────────────────────────────── */}
      <section className={s.compareSection}>
        <div className={s.sectionHead} data-reveal>
          <SerialLabel>Capitulo V-B · Diferencial</SerialLabel>
          <h2 className={s.sectionTitle}>
            Por que <em className={s.italic}>nao</em> usar ChatGPT para peca?
          </h2>
          <p className={s.sectionSub}>
            Um modelo generalista inventa citacao para parecer util. A LexAI recusa
            responder antes de fabricar.
          </p>
        </div>
        <Rule />

        <div className={s.compare} data-reveal>
          <div className={s.compareHead}>
            <div />
            <div className={`${s.compareLabel} ${s.compareLabelThem}`}>ChatGPT / Gemini</div>
            <div className={`${s.compareLabel} ${s.compareLabelUs}`}>LexAI</div>
          </div>
          {[
            { k: 'Jurisprudencia brasileira', them: 'Inventa acordao com numero falso', us: 'Cada citacao com link rastreavel' },
            { k: 'Calculo de prazo', them: 'Nao considera feriado local', us: 'Feriado estadual + municipal + recesso' },
            { k: 'Retencao de dados', them: 'Treina modelo publico com seu caso', us: 'Dado nunca treina modelo publico' },
            { k: 'Modelo de peca padrao', them: 'Impossivel — memoria limitada', us: 'Galeria propria por escritorio' },
            { k: 'Correcao monetaria', them: 'Aproximacao errada', us: 'Serie historica oficial integrada' },
            { k: 'Quando nao sabe', them: 'Inventa resposta confiante', us: 'Recusa e pede fonte adicional' },
            { k: 'Suporte', them: 'Forum em ingles, fila infinita', us: 'WhatsApp < 4h uteis, operador juridico' },
            { k: 'Conformidade LGPD', them: 'Servidor nos EUA, clausula generica', us: 'Processamento BR, contrato DPA' },
          ].map((row, i) => (
            <div key={i} className={s.compareRow} style={{ '--reveal-delay': `${i * 50}ms` } as React.CSSProperties}>
              <div className={s.compareK}>{row.k}</div>
              <div className={`${s.compareCell} ${s.compareCellThem}`}>
                <span className={s.compareIconX} aria-hidden>✕</span>
                {row.them}
              </div>
              <div className={`${s.compareCell} ${s.compareCellUs}`}>
                <span className={s.compareIconCheck} aria-hidden>✓</span>
                {row.us}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ────────────────────────────────────────────────────── */}
      <section id="planos" className={s.planosSection}>
        <div className={s.sectionHead} data-reveal>
          <SerialLabel>Capitulo VI · Acesso</SerialLabel>
          <h2 className={s.sectionTitle}>
            Planos <em className={s.italic}>transparentes</em>.
          </h2>
          <p className={s.sectionSub}>
            Demonstracao guiada de 30 minutos · Sem compromisso.
          </p>
        </div>
        <Rule />

        <div className={s.plans} data-reveal>
          {planos.map((p, i) => (
            <div key={p.name} className={`${s.plan}${p.popular ? ` ${s.planPopular}` : ''}`} style={{ '--reveal-delay': `${i * 130}ms` } as React.CSSProperties}>
              {p.popular && <div className={s.planBadge}>Mais escolhido</div>}
              <div className={s.planName}>{p.name}</div>
              <div className={s.planSeats}>{p.seats}</div>
              <div className={s.planPrice}>
                <span className={s.planCurrency}>R$</span>
                <span className={s.planValue}>{p.price}</span>
              </div>
              <div className={s.planPerSeat}>por advogado / mes</div>
              <div className={s.planHeadline}>{p.headline}</div>
              <ul className={s.planFeatures}>
                {p.features.map((f) => (
                  <li key={f}>
                    <span aria-hidden className={s.planDot} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/login" className={`${s.planCta}${p.popular ? ` ${s.planCtaSolid}` : ''}`}>
                {i === 0 ? 'Comecar 7 dias gratis' : 'Agendar demonstracao'}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── CLOSING MARK ───────────────────────────────────────────────── */}
      <section className={s.closingSection}>
        <div data-reveal>
          <SerialLabel>Ad finem · MMXXVI</SerialLabel>
          <h2 className={s.closingTitle}>
            Pronto para praticar Direito <em className={s.italic}>com instrumento a altura</em>?
          </h2>
          <div className={s.closingCtaWrap}>
            <Link href="/login" className={`${s.ctaPrimary} ${s.ctaLarge}`}>
              <span>Agendar demonstracao</span>
              <span className={s.ctaArrow} aria-hidden>→</span>
            </Link>
          </div>
          <div className={s.closingSubtext}>
            Demonstracao guiada de 30 minutos · Sem compromisso
          </div>
        </div>
      </section>

      {/* ── LGPD NOTE ──────────────────────────────────────────────────── */}
      <section className={s.lgpdSection}>
        <div className={s.lgpd}>
          <div className={s.lgpdHead}>Aviso · LGPD</div>
          LexAI e uma ferramenta de apoio baseada em inteligencia artificial. Os resultados
          gerados pelos agentes devem ser revisados por profissional habilitado pela OAB
          antes de qualquer uso processual ou contratual. A plataforma esta em conformidade
          com a Lei Geral de Protecao de Dados — seus dados sao criptografados e nunca
          utilizados para treinamento de modelos.
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer className={s.footer}>
        <div className={s.footerInner}>
          <div className={s.footerGrid}>
            <div>
              <BrandMark />
              <p className={s.footerBlurb}>
                Inteligencia juridica feita a mao · <strong className={s.footerBlurbStrong}>Vanix Corp</strong>
              </p>
            </div>
            {footerColumns.map((col) => (
              <div key={col.title}>
                <div className={s.footerTitle}>{col.title}</div>
                <ul className={s.footerList}>
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className={s.footerLink}>{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className={s.footerBottom}>
            <div>© MMXXVI · LexAI — uma marca <strong className={s.footerBottomStrong}>Vanix Corp</strong></div>
            <div className={s.footerContact}>
              <span>contato@vanixcorp.com</span>
            </div>
          </div>
        </div>
      </footer>

      <WhatsAppFloat />
      <ExitIntent />
    </div>
  )
}

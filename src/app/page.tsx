'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import TopoBackground from '@/components/TopoBackground'

/* ----------------------------------------------------------------------------
 * Design tokens — extracted so styles read like a stylesheet, not noise.
 * Spacing is on an 8px rhythm; colors are kept tight to the brand palette.
 * -------------------------------------------------------------------------- */

const accent = '#3B82F6'
const accentDeep = '#2563EB'
const ink = '#F1F1F1'
const inkDim = 'rgba(255,255,255,0.55)'
const inkFaint = 'rgba(255,255,255,0.40)'
const hairline = 'rgba(255,255,255,0.06)'
const surface = 'rgba(255,255,255,0.03)'
const surfaceLift = 'rgba(255,255,255,0.05)'

const shell = {
  position: 'relative' as const,
  zIndex: 10,
  maxWidth: 1120,
  margin: '0 auto',
  padding: '0 32px',
}

const sectionPad = '96px 0'

/* ----------------------------------------------------------------------------
 * Content — single source of truth, easier to scan than inline literals.
 * -------------------------------------------------------------------------- */

const navStats = [
  { value: '10', label: 'Agentes IA especializados' },
  { value: '7', label: 'Areas do Direito cobertas' },
  { value: '36', label: 'Materias academicas' },
  { value: '2 dias', label: 'Trial gratuito sem cartao' },
]

const agentes = [
  { name: 'Resumidor',  desc: 'Analise completa de documentos juridicos com riscos e fundamentacao', color: '#2563EB' },
  { name: 'Redator',    desc: 'Gere peticoes, recursos, contestacoes e pareceres completos',         color: '#F59E0B' },
  { name: 'Pesquisador', desc: 'Pesquise jurisprudencia do STF, STJ e tribunais estaduais',          color: '#EC4899' },
  { name: 'Negociador', desc: 'Estrategia BATNA/ZOPA com cenarios e proposta de acordo',             color: '#8B5CF6' },
  { name: 'Professor',  desc: 'Aulas em 3 niveis com questoes estilo OAB/concursos',                 color: '#06B6D4' },
  { name: 'Calculador', desc: 'Prazos processuais, correcao monetaria, juros e custas',              color: '#10B981' },
  { name: 'Legislacao', desc: 'Artigos de lei explicados com exemplos e jurisprudencia',             color: '#6366F1' },
  { name: 'Rotina',     desc: 'Organize sua agenda de aulas, estagios e compromissos',               color: '#F97316' },
]

const depoimentos = [
  {
    initials: 'MC',
    name: 'Mariana Castro',
    cargo: 'Advogada Civil — SP',
    quote: 'Em 2 semanas economizei mais de 20 horas que eu gastava em pesquisa de jurisprudencia. O Pesquisador encontra acordaos que eu nem sabia que existiam.',
    color: '#2563EB',
  },
  {
    initials: 'LF',
    name: 'Lucas Ferreira',
    cargo: 'Estudante OAB — RJ',
    quote: 'O Professor explica conceitos juridicos como nenhum livro consegue. Passei na 1a fase da OAB de primeira usando os planos de estudo personalizados.',
    color: '#10B981',
  },
  {
    initials: 'RL',
    name: 'Renata Lima',
    cargo: 'Socia — Lima Advocacia',
    quote: 'Substituiu 2 estagiarios e ainda entrega mais rapido. O Redator gera peticoes que so precisam de pequenos ajustes. Investimento que se pagou em 1 mes.',
    color: '#8B5CF6',
  },
]

const planos = [
  {
    name: 'Starter',
    price: '59',
    headline: '3 agentes · 50 docs/mes',
    features: ['Resumidor, Pesquisador, Professor', 'Suporte FAQ', 'Historico 30 dias'],
  },
  {
    name: 'Pro',
    price: '119',
    headline: '6 agentes · 200 docs/mes',
    popular: true,
    features: ['Todos os basicos', 'Exportacao PDF', 'Email 48h', 'Historico 90 dias'],
  },
  {
    name: 'Enterprise',
    price: '239',
    headline: '10 agentes · Ilimitado',
    features: ['Todos + exclusivos', 'API propria', 'WhatsApp 24h', 'Historico ilimitado', 'Modelos customizados'],
  },
]

const footerColumns = [
  {
    title: 'Produto',
    links: [
      { label: 'Para Empresas', href: '/empresas' },
      { label: 'Agentes', href: '#agentes' },
      { label: 'Planos', href: '#planos' },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { label: 'Entrar', href: '/login' },
      { label: 'Comecar gratis', href: '/login' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacidade (LGPD)', href: '/privacidade' },
      { label: 'Termos de Uso', href: '/termos' },
    ],
  },
]

/* ----------------------------------------------------------------------------
 * Small composable pieces — keep the page body declarative.
 * -------------------------------------------------------------------------- */

function BrandMark() {
  return (
    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
      <div
        style={{
          width: 38, height: 38, borderRadius: 11,
          background: 'linear-gradient(135deg, #141414, #2A2A2A)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 16px rgba(59,130,246,0.30)',
        }}
      >
        <span style={{ color: ink, fontSize: 14, fontWeight: 800, letterSpacing: '0.5px' }}>LX</span>
      </div>
      <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px', color: ink }}>LexAI</span>
    </Link>
  )
}

function PrimaryCTA({ children, href = '/login', large = false }: { children: React.ReactNode; href?: string; large?: boolean }) {
  return (
    <Link
      href={href}
      className="lx-cta"
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: large ? 16 : 14,
        color: ink,
        background: `linear-gradient(135deg, ${accent}, ${accentDeep})`,
        padding: large ? '15px 32px' : '9px 20px',
        borderRadius: large ? 12 : 9,
        textDecoration: 'none',
        fontWeight: 600,
        letterSpacing: '-0.1px',
        boxShadow: `0 8px 28px rgba(37,99,235,${large ? 0.38 : 0.22})`,
      }}
    >
      {children}
    </Link>
  )
}

function GhostCTA({ children, href }: { children: React.ReactNode; href: string }) {
  return (
    <a
      href={href}
      className="lx-ghost"
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16,
        color: 'rgba(255,255,255,0.7)',
        padding: '15px 28px',
        borderRadius: 12,
        textDecoration: 'none',
        fontWeight: 500,
        border: '1px solid rgba(255,255,255,0.14)',
        background: 'rgba(255,255,255,0.02)',
      }}
    >
      {children}
    </a>
  )
}

function AgentCard({ name, desc, color }: { name: string; desc: string; color: string }) {
  return (
    <div className="lx-agent">
      <span className="lx-agent-bar" style={{ background: color, boxShadow: `0 0 18px ${color}55` }} />
      <div>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, color: ink }}>{name}</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.50)', lineHeight: 1.55 }}>{desc}</div>
      </div>
    </div>
  )
}

function TestimonialCard({ initials, name, cargo, quote, color }: typeof depoimentos[number]) {
  return (
    <div className="lx-test">
      <div style={{ display: 'flex', gap: 3, marginBottom: 4 }}>
        {[0, 1, 2, 3, 4].map((s) => (
          <i key={s} className="bi bi-star-fill" style={{ color: '#F59E0B', fontSize: 13 }} />
        ))}
      </div>
      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.65, fontStyle: 'italic', margin: 0, flex: 1 }}>
        &ldquo;{quote}&rdquo;
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
        <div
          style={{
            width: 42, height: 42, borderRadius: '50%',
            background: `linear-gradient(135deg, ${color}, ${color}99)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: ink, fontWeight: 700, fontSize: 13, flexShrink: 0,
            boxShadow: `0 4px 16px ${color}33`,
          }}
        >
          {initials}
        </div>
        <div>
          <div style={{ color: ink, fontWeight: 700, fontSize: 13 }}>{name}</div>
          <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>{cargo}</div>
        </div>
      </div>
    </div>
  )
}

function PricingCard({ plan }: { plan: typeof planos[number] }) {
  const isPopular = !!plan.popular
  return (
    <div className={`lx-plan ${isPopular ? 'lx-plan--popular' : ''}`}>
      {isPopular && <div className="lx-badge">Mais popular</div>}
      <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: ink }}>{plan.name}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4, marginBottom: 4 }}>
        <span style={{ fontSize: 14, color: inkFaint }}>R$</span>
        <span style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-2px', color: ink }}>{plan.price}</span>
        <span style={{ fontSize: 14, color: inkFaint }}>/mes</span>
      </div>
      <div style={{ fontSize: 13, color: inkFaint, marginBottom: 24 }}>{plan.headline}</div>
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
        {plan.features.map((f) => (
          <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>
            <span style={{ color: '#10B981', fontSize: 14, lineHeight: 1 }}>&#10003;</span>
            {f}
          </li>
        ))}
      </ul>
      <Link
        href="/login"
        className={isPopular ? 'lx-plan-cta lx-plan-cta--solid' : 'lx-plan-cta'}
      >
        Comecar gratis
      </Link>
    </div>
  )
}

/* ----------------------------------------------------------------------------
 * Page
 * -------------------------------------------------------------------------- */

export default function LandingPage() {
  // Force dark theme on the public landing without polluting localStorage.
  useEffect(() => {
    const root = document.documentElement
    const previous = root.getAttribute('data-theme')
    root.setAttribute('data-theme', 'dark')
    return () => {
      if (previous) root.setAttribute('data-theme', previous)
    }
  }, [])

  return (
    <div data-theme="dark" style={{ position: 'relative', minHeight: '100vh', background: '#0A0A0A', color: ink, fontFamily: "'DM Sans', sans-serif", overflow: 'hidden' }}>
      {/* Animated topographic waves — sits behind everything */}
      <TopoBackground />

      {/* Soft accent glow under hero */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          top: '-10%', left: '50%',
          width: 1200, height: 800,
          transform: 'translateX(-50%)',
          background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.10) 0%, rgba(59,130,246,0.04) 30%, transparent 65%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <header
        style={{
          position: 'sticky', top: 0, zIndex: 50,
          backdropFilter: 'blur(14px) saturate(160%)',
          WebkitBackdropFilter: 'blur(14px) saturate(160%)',
          background: 'rgba(10,10,10,0.65)',
          borderBottom: `1px solid ${hairline}`,
        }}
      >
        <nav style={{ ...shell, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 32px' }}>
          <BrandMark />
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <a href="#agentes" className="lx-nav-link">Agentes</a>
            <a href="#planos" className="lx-nav-link">Planos</a>
            <Link href="/login" className="lx-nav-link">Entrar</Link>
            <PrimaryCTA>Comecar gratis</PrimaryCTA>
          </div>
        </nav>
      </header>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section style={{ ...shell, padding: '120px 32px 60px', textAlign: 'center', maxWidth: 880 }}>
        <div className="lx-pill">
          <span style={{ color: '#10B981' }}>•</span>
          2 dias gratis · Sem cartao
        </div>

        <h1 className="lx-hero-title">
          Seu escritorio juridico<br />
          <span className="lx-hero-accent">potencializado por IA</span>
        </h1>

        <p style={{ fontSize: 19, color: inkDim, lineHeight: 1.65, maxWidth: 600, margin: '0 auto 40px' }}>
          10 agentes de inteligencia artificial especializados em Direito brasileiro.
          Analise documentos, pesquise jurisprudencia e gere pecas processuais em minutos.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <PrimaryCTA large>Comecar gratis por 2 dias</PrimaryCTA>
          <GhostCTA href="#agentes">Ver agentes</GhostCTA>
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────────────────────────── */}
      <section style={{ ...shell, padding: '24px 32px 80px' }}>
        <div className="lx-stats">
          {navStats.map((s) => (
            <div key={s.label} className="lx-stat">
              <div className="lx-stat-value">{s.value}</div>
              <div className="lx-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── AGENTES ─────────────────────────────────────────────────────── */}
      <section id="agentes" style={{ ...shell, padding: sectionPad }}>
        <SectionHead
          eyebrow="Agentes especializados"
          title="10 agentes treinados em Direito brasileiro"
          subtitle="Cada agente e treinado com prompts elite para o ordenamento juridico nacional"
        />
        <div className="lx-agent-grid">
          {agentes.map((a) => <AgentCard key={a.name} {...a} />)}
        </div>
      </section>

      {/* ── DEPOIMENTOS ─────────────────────────────────────────────────── */}
      <section style={{ ...shell, padding: sectionPad }}>
        <SectionHead
          eyebrow="Quem ja usa"
          title="O que nossos usuarios dizem"
          subtitle="Resultados reais de quem ja usa LexAI no dia a dia"
        />
        <div className="lx-test-grid">
          {depoimentos.map((d) => <TestimonialCard key={d.name} {...d} />)}
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────────────── */}
      <section id="planos" style={{ ...shell, padding: sectionPad, maxWidth: 1040 }}>
        <SectionHead
          eyebrow="Planos"
          title="Planos simples e transparentes"
          subtitle="Comece gratis por 2 dias. Cancele quando quiser."
        />
        <div className="lx-plans">
          {planos.map((p) => <PricingCard key={p.name} plan={p} />)}
        </div>
      </section>

      {/* ── CTA FINAL ───────────────────────────────────────────────────── */}
      <section style={{ ...shell, padding: '80px 32px 60px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 16, color: ink }}>
          Pronto para transformar sua pratica juridica?
        </h2>
        <p style={{ fontSize: 17, color: inkDim, marginBottom: 32, maxWidth: 560, margin: '0 auto 32px' }}>
          Junte-se a advogados e estudantes que ja usam IA no dia a dia.
        </p>
        <PrimaryCTA large>Comecar agora — 2 dias gratis</PrimaryCTA>
      </section>

      {/* ── DISCLAIMER LGPD ─────────────────────────────────────────────── */}
      <section style={{ ...shell, padding: '32px 32px 56px', maxWidth: 920 }}>
        <div
          style={{
            padding: '22px 26px', borderRadius: 14,
            background: 'rgba(255,255,255,0.02)',
            border: `1px solid ${hairline}`,
            fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65,
          }}
        >
          <div style={{ fontWeight: 700, color: 'rgba(255,255,255,0.78)', marginBottom: 8, fontSize: 13 }}>
            <i className="bi bi-info-circle" style={{ marginRight: 8 }} />
            Aviso importante
          </div>
          A LexAI e uma ferramenta de apoio baseada em inteligencia artificial. Os resultados gerados pelos agentes
          devem ser sempre revisados por profissional habilitado pela OAB antes de qualquer uso processual ou contratual.
          A plataforma nao substitui o aconselhamento juridico profissional. Estamos em conformidade com a Lei Geral
          de Protecao de Dados (LGPD) — seus dados sao criptografados e nunca usados para treinamento de modelos.
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: `1px solid ${hairline}`, background: 'rgba(0,0,0,0.35)' }}>
        <div style={{ ...shell, padding: '56px 32px 28px' }}>
          <div className="lx-footer-grid">
            <div>
              <BrandMark />
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 14, lineHeight: 1.6, maxWidth: 280 }}>
                Inteligencia artificial especializada em Direito brasileiro para advogados e estudantes.
              </p>
            </div>
            {footerColumns.map((col) => (
              <div key={col.title}>
                <div style={{ fontSize: 12, fontWeight: 700, color: ink, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 14 }}>
                  {col.title}
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="lx-foot-link">{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 40, paddingTop: 24,
              borderTop: `1px solid ${hairline}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              flexWrap: 'wrap', gap: 16,
              fontSize: 12, color: 'rgba(255,255,255,0.40)',
            }}
          >
            <div>© 2026 LexAI · uma marca <strong style={{ color: ink }}>Vanix Corp</strong></div>
            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
              <span>luizfernandoleonardoleonardo@gmail.com</span>
              <span>(34) 99302-6456</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ── PAGE STYLES ─────────────────────────────────────────────────── */}
      <style>{`
        html { scroll-behavior: smooth; }

        @keyframes lx-rise {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .lx-pill {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 12px; font-weight: 600; letter-spacing: 0.8px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.78);
          padding: 8px 16px; border-radius: 999px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.10);
          margin-bottom: 28px;
          backdrop-filter: blur(10px);
          animation: lx-rise 0.6s ease both;
        }

        .lx-hero-title {
          font-size: clamp(40px, 6vw, 64px);
          font-weight: 800;
          letter-spacing: -2px;
          line-height: 1.05;
          margin: 0 0 22px;
          color: ${ink};
          animation: lx-rise 0.7s ease 0.05s both;
        }
        .lx-hero-accent {
          background: linear-gradient(135deg, #60A5FA 0%, ${accent} 50%, #6366F1 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          filter: drop-shadow(0 8px 32px rgba(59,130,246,0.45));
        }

        .lx-cta { transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease; }
        .lx-cta:hover { transform: translateY(-2px); filter: brightness(1.08); box-shadow: 0 12px 36px rgba(37,99,235,0.45); }

        .lx-ghost { transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease; }
        .lx-ghost:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.22); color: ${ink}; }

        .lx-nav-link {
          font-size: 14px;
          color: rgba(255,255,255,0.62);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.15s ease;
        }
        .lx-nav-link:hover { color: ${ink}; }

        .lx-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          padding: 28px 32px;
          background: rgba(255,255,255,0.02);
          border: 1px solid ${hairline};
          border-radius: 20px;
          backdrop-filter: blur(8px);
        }
        .lx-stat { text-align: center; }
        .lx-stat-value {
          font-size: 32px; font-weight: 800;
          letter-spacing: -1px;
          background: linear-gradient(135deg, #60A5FA, ${accent});
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .lx-stat-label { font-size: 13px; color: ${inkFaint}; margin-top: 4px; }

        .lx-agent-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        .lx-agent {
          padding: 22px 24px;
          border-radius: 16px;
          background: ${surface};
          border: 1px solid ${hairline};
          display: flex;
          align-items: center;
          gap: 18px;
          transition: transform 0.25s ease, background 0.25s ease, border-color 0.25s ease;
        }
        .lx-agent:hover {
          transform: translateY(-3px) scale(1.01);
          background: ${surfaceLift};
          border-color: rgba(255,255,255,0.12);
        }
        .lx-agent-bar {
          width: 4px; height: 44px;
          border-radius: 999px;
          flex-shrink: 0;
          transition: height 0.25s ease, box-shadow 0.25s ease;
        }
        .lx-agent:hover .lx-agent-bar { height: 52px; }

        .lx-test-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .lx-test {
          background: ${surface};
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px;
          padding: 26px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: transform 0.25s ease, border-color 0.25s ease;
        }
        .lx-test:hover {
          transform: translateY(-3px);
          border-color: rgba(255,255,255,0.16);
        }

        .lx-plans {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          align-items: stretch;
        }
        .lx-plan {
          position: relative;
          padding: 36px 30px;
          border-radius: 22px;
          text-align: center;
          background: ${surface};
          border: 1px solid ${hairline};
          display: flex;
          flex-direction: column;
          transition: transform 0.25s ease, border-color 0.25s ease;
        }
        .lx-plan:hover { transform: translateY(-3px); border-color: rgba(255,255,255,0.14); }
        .lx-plan--popular {
          background: linear-gradient(180deg, rgba(37,99,235,0.10) 0%, rgba(37,99,235,0.04) 100%);
          border-color: rgba(59,130,246,0.35);
          transform: scale(1.03);
          box-shadow: 0 24px 60px rgba(37,99,235,0.18);
        }
        .lx-plan--popular:hover { transform: scale(1.03) translateY(-3px); }
        .lx-badge {
          position: absolute;
          top: -12px; left: 50%; transform: translateX(-50%);
          padding: 6px 14px;
          border-radius: 999px;
          background: linear-gradient(135deg, ${accent}, ${accentDeep});
          color: ${ink};
          font-size: 11px; font-weight: 700;
          letter-spacing: 1px; text-transform: uppercase;
          box-shadow: 0 6px 20px rgba(37,99,235,0.45);
        }
        .lx-plan-cta {
          display: block;
          margin-top: auto;
          padding: 13px 20px;
          border-radius: 11px;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          color: rgba(255,255,255,0.75);
          background: transparent;
          border: 1px solid rgba(255,255,255,0.16);
          transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
        }
        .lx-plan-cta:hover { background: rgba(255,255,255,0.06); color: ${ink}; border-color: rgba(255,255,255,0.28); }
        .lx-plan-cta--solid {
          background: linear-gradient(135deg, ${accent}, ${accentDeep});
          color: ${ink};
          border: none;
          box-shadow: 0 8px 24px rgba(37,99,235,0.40);
        }
        .lx-plan-cta--solid:hover { filter: brightness(1.08); transform: translateY(-1px); box-shadow: 0 12px 32px rgba(37,99,235,0.50); }

        .lx-footer-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr 1fr;
          gap: 40px;
        }
        .lx-foot-link {
          font-size: 13px;
          color: rgba(255,255,255,0.50);
          text-decoration: none;
          transition: color 0.15s ease;
        }
        .lx-foot-link:hover { color: ${ink}; }

        @media (max-width: 900px) {
          .lx-agent-grid { grid-template-columns: 1fr; }
          .lx-test-grid  { grid-template-columns: 1fr; }
          .lx-plans      { grid-template-columns: 1fr; }
          .lx-plan--popular { transform: none; }
          .lx-plan--popular:hover { transform: translateY(-3px); }
          .lx-stats { grid-template-columns: repeat(2, 1fr); }
          .lx-footer-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 560px) {
          .lx-footer-grid { grid-template-columns: 1fr; }
          .lx-stats { grid-template-columns: 1fr 1fr; gap: 24px; padding: 24px; }
        }
      `}</style>
    </div>
  )
}

/* ----------------------------------------------------------------------------
 * Helper: section header — same composition reused throughout the page.
 * -------------------------------------------------------------------------- */

function SectionHead({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 56 }}>
      <div
        style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '1.5px',
          textTransform: 'uppercase', color: accent, marginBottom: 12,
        }}
      >
        {eyebrow}
      </div>
      <h2 style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 14, color: ink, lineHeight: 1.15 }}>
        {title}
      </h2>
      <p style={{ fontSize: 16, color: inkDim, maxWidth: 560, margin: '0 auto', lineHeight: 1.6 }}>
        {subtitle}
      </p>
    </div>
  )
}

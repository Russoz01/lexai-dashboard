'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { WhatsAppFloat } from '@/components/WhatsAppFloat'
import { ExitIntent } from '@/components/ExitIntent'

/* ─────────────────────────────────────────────────────────────────────────────
 * /empresas — Página B2B LexAI
 *
 * Segue exatamente o mesmo sistema editorial da landing principal:
 *   · CSS custom properties do globals.css (--accent, --bg-base, etc.)
 *   · Playfair italic nos títulos hero
 *   · Serial labels em caps + hairlines
 *   · Scroll-reveal via IntersectionObserver
 *   · Footer MMXXVI + mesma tipografia
 * ──────────────────────────────────────────────────────────────────────────── */

const AGENTES = [
  { n: '01', name: 'Resumidor',           icon: 'bi-file-earmark-text',        desc: 'Contrato de 80 paginas em 90 segundos. Clausulas de risco, prazos e obrigacoes destacadas com pagina de origem para voce conferir.' },
  { n: '02', name: 'Redator',             icon: 'bi-pencil-square',            desc: 'Primeira versao de peticao, recurso ou notificacao em 4 minutos. Fundamentacao com jurisprudencia rastreavel \u2014 zero invencao.' },
  { n: '03', name: 'Pesquisador',         icon: 'bi-journal-bookmark',         desc: 'Busca paralela em STF, STJ, TRFs e TJs. Cada acórdao retorna com ementa, data, relator e link. Sem rodeios, sem pagina 8 do Google.' },
  { n: '04', name: 'Negociador',          icon: 'bi-lightning',                desc: 'Tres cenarios de acordo calculados antes da audiencia. Gatilhos da parte contraria, concessao minima viavel e roteiro de argumentos.' },
  { n: '05', name: 'Monitor Legislativo', icon: 'bi-bell',                     desc: 'Alerta por area do escritorio: trabalhista, tributario, penal. Voce recebe a mudanca no dia que ela sai, nao duas semanas depois.' },
  { n: '06', name: 'Calculador',          icon: 'bi-calculator',               desc: 'Prazo processual com feriado estadual e municipal. Correcao com INPC, IGPM, IPCA ou SELIC. Verba rescisoria, custa e honorario em uma planilha.' },
  { n: '07', name: 'Professor',           icon: 'bi-book',                     desc: 'Artigo explicado com doutrina majoritaria, precedente aplicavel e exemplo do seu caso. Estudo para OAB, concurso ou atualizacao continua.' },
  { n: '08', name: 'Rotina',              icon: 'bi-calendar-week',            desc: 'Audiencia, prazo e compromisso em uma unica pauta, com prioridade calculada. Sincroniza com Google Calendar.' },
  { n: '09', name: 'Parecerista',         icon: 'bi-file-earmark-check',       desc: 'Parecer com fundamentacao estruturada: tese, anti-tese, doutrina, jurisprudencia e recomendacao assinavel. Pronto para protocolar.' },
  { n: '10', name: 'Estrategista',        icon: 'bi-shield-check',             desc: 'Antes de aceitar a causa: taxa historica de vitoria no tribunal, precedentes contrarios e melhor angulo de abordagem. Voce entra sabendo a chance real.' },
  { n: '11', name: 'Tradutor Juridico',   icon: 'bi-translate',                desc: 'Contrato internacional em ingles, espanhol ou frances sem perder terminologia tecnica. Glossario salvo por cliente.' },
  { n: '12', name: 'Compliance',          icon: 'bi-shield-lock',              desc: 'Checklist LGPD e anticorrupcao por operacao. Identifica exposicao regulatoria antes de virar TAC, multa ou manchete.' },
]

const CASOS = [
  {
    icon: 'bi-briefcase-fill',
    persona: 'Banca de Direito Civil',
    size: '5–15 advogados',
    accent: 'var(--accent)',
    pains: 'Alto volume de contratos, revisão lenta e risco de cláusulas abusivas passando despercebidas.',
    solution: 'Resumidor analisa o contrato em 30 segundos apontando cláusulas sensíveis. Redator gera minutas padronizadas. Pesquisador fundamenta com jurisprudência atual.',
  },
  {
    icon: 'bi-hammer',
    persona: 'Advocacia Trabalhista',
    size: '3–10 advogados',
    accent: '#D4A853',
    pains: 'Cálculos de verbas rescisórias complexos, prazos apertados e grande volume de audiências simultâneas.',
    solution: 'Calculador apura verbas com correção e juros automáticos. Rotina organiza pautas e prazos. Negociador prepara estratégias para acordos em audiência.',
  },
  {
    icon: 'bi-building-fill',
    persona: 'Departamento Jurídico',
    size: 'Empresas médias e grandes',
    accent: '#6B8F71',
    pains: 'Alto volume de demandas internas, padronização entre áreas e compliance regulatório contínuo.',
    solution: 'Compliance monitora mudanças regulatórias. Modelos customizados garantem padronização entre times. Parecerista entrega análises prontas para assinatura.',
  },
]

const PLANOS = [
  {
    name: 'Escritório',
    price: '1.399',
    seats: '1–5 advogados',
    headline: '5 agentes · 200 documentos/mês',
    features: ['Resumidor, Pesquisador, Redator, Calculador, Monitor Legislativo', 'Histórico de 45 dias', 'Suporte por e-mail em 24h'],
    cta: 'Começar 7 dias grátis',
    href: '/login',
    highlight: false,
  },
  {
    name: 'Firma',
    price: '1.459',
    seats: '6–15 advogados',
    headline: '12 agentes · documentos ilimitados',
    features: ['Todos os 12 agentes especializados', 'Exportação em PDF', 'Suporte prioritário em 3h', 'Histórico de 90 dias', 'Sessão de onboarding dedicada'],
    cta: 'Agendar demonstração',
    href: '/login',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: '1.599',
    seats: '16+ advogados',
    headline: 'Ilimitado · agentes customizados',
    features: ['Agentes customizados para o escritório', 'API privada + SLA de uptime', 'Gerente de conta dedicado', 'Histórico ilimitado', 'Opção on-premise', 'DPA incluso'],
    cta: 'Agendar demonstração',
    href: '/login',
    highlight: false,
  },
]

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
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' },
    )
    nodes.forEach((n) => io.observe(n))
    return () => io.disconnect()
  }, [])
}

export default function EmpresasPage() {
  useScrollReveal()

  return (
    <div className="emp-root">

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav className="emp-nav">
        <Link href="/" className="emp-brand">
          <span className="emp-brand-mark" aria-hidden>LX</span>
          <span className="emp-brand-name">LexAI</span>
        </Link>
        <div className="emp-nav-links">
          <Link href="/" className="emp-nav-link">Início</Link>
          <Link href="/#planos" className="emp-nav-link">Planos</Link>
          <Link href="/login" className="emp-nav-link">Entrar</Link>
          <Link href="/login" className="emp-nav-cta">
            Agendar demonstração
          </Link>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section id="main-content" className="emp-hero">
        <div className="emp-shell">
          <div className="emp-serial">
            <span className="emp-serial-dot" />
            LexAI para escritórios e bancas
          </div>

          <h1 className="emp-hero-h1" data-reveal>
            Seu escritório.<br />
            <em>Doze especialistas.</em><br />
            Uma assinatura.
          </h1>

          <p className="emp-hero-lede" data-reveal>
            Doze agentes de IA calibrados para o Direito brasileiro. Cada um com conhecimento profundo da sua área, disponível agora, sem contratação, sem onboarding de meses.
          </p>

          <div className="emp-hero-ctas" data-reveal>
            <Link href="/login" className="emp-btn-primary">
              <i className="bi bi-calendar-check" />
              Agendar demonstração
            </Link>
            <Link href="#casos" className="emp-btn-ghost">
              Ver casos de uso
            </Link>
          </div>

          {/* Stats editoriais */}
          <div className="emp-stats" data-reveal>
            {[
              { roman: 'I',   value: '12',      label: 'Agentes especializados' },
              { roman: 'II',  value: '9',       label: 'Áreas do Direito cobertas' },
              { roman: 'III', value: '4 min',   label: 'Por análise de documento' },
              { roman: 'IV',  value: '< 24h',   label: 'Setup completo' },
            ].map((s) => (
              <div key={s.roman} className="emp-stat">
                <span className="emp-stat-roman">{s.roman}</span>
                <div className="emp-stat-value">{s.value}</div>
                <div className="emp-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="emp-hairline" aria-hidden />

      {/* ── AGENTES ─────────────────────────────────────────────────────── */}
      <section className="emp-section emp-shell">
        <div className="emp-section-head" data-reveal>
          <div className="emp-serial">
            <span className="emp-serial-dot" />
            CAPÍTULO I · ATELIER
          </div>
          <h2 className="emp-section-h2">
            O gabinete completo,<br /><em>já disponível</em>
          </h2>
          <p className="emp-section-sub">
            Todos os especialistas que seu escritório precisaria contratar — em uma única plataforma, com custo por advogado, sem mensalidade extra por agente.
          </p>
        </div>

        <div className="emp-agents-grid">
          {AGENTES.map((a, i) => (
            <div key={a.n} className="emp-agent-card" data-reveal style={{ '--reveal-delay': `${i * 40}ms` } as React.CSSProperties}>
              <div className="emp-agent-header">
                <span className="emp-agent-num">{a.n}</span>
                <div className="emp-agent-icon">
                  <i className={`bi ${a.icon}`} />
                </div>
              </div>
              <h3 className="emp-agent-name">{a.name}</h3>
              <p className="emp-agent-desc">{a.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="emp-hairline" aria-hidden />

      {/* ── CASOS DE USO ────────────────────────────────────────────────── */}
      <section id="casos" className="emp-section emp-shell">
        <div className="emp-section-head" data-reveal>
          <div className="emp-serial">
            <span className="emp-serial-dot" />
            CAPÍTULO II · PERFIS
          </div>
          <h2 className="emp-section-h2">
            Feito para<br /><em>seu perfil</em>
          </h2>
          <p className="emp-section-sub">
            O mesmo sistema de agentes se adapta a bancas de nicho, advocacia de massa e departamentos jurídicos corporativos.
          </p>
        </div>

        <div className="emp-casos-grid">
          {CASOS.map((c, i) => (
            <div key={c.persona} className="emp-caso-card" data-reveal style={{ '--reveal-delay': `${i * 80}ms` } as React.CSSProperties}>
              <div className="emp-caso-icon" style={{ '--caso-accent': c.accent } as React.CSSProperties}>
                <i className={`bi ${c.icon}`} />
              </div>
              <div className="emp-caso-header">
                <h3 className="emp-caso-persona">{c.persona}</h3>
                <span className="emp-caso-size">{c.size}</span>
              </div>
              <div className="emp-caso-block">
                <div className="emp-caso-tag emp-caso-tag-pain">Dor</div>
                <p className="emp-caso-text">{c.pains}</p>
              </div>
              <div className="emp-caso-block">
                <div className="emp-caso-tag emp-caso-tag-sol">Solução LexAI</div>
                <p className="emp-caso-text emp-caso-text-bright">{c.solution}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="emp-hairline" aria-hidden />

      {/* ── PLANOS ──────────────────────────────────────────────────────── */}
      <section className="emp-section emp-shell">
        <div className="emp-section-head" data-reveal>
          <div className="emp-serial">
            <span className="emp-serial-dot" />
            CAPÍTULO III · INVESTIMENTO
          </div>
          <h2 className="emp-section-h2">
            Valor por advogado,<br /><em>não por feature</em>
          </h2>
          <p className="emp-section-sub">
            Preço único por assento. Sem cobrança extra por agente, sem limite de documentos no Firma e Enterprise. Plano escolhido pelo tamanho da equipe.
          </p>
        </div>

        <div className="emp-planos-grid">
          {PLANOS.map((p, i) => (
            <div
              key={p.name}
              className={`emp-plano-card${p.highlight ? ' emp-plano-highlight' : ''}`}
              data-reveal
              style={{ '--reveal-delay': `${i * 80}ms` } as React.CSSProperties}
            >
              {p.highlight && (
                <div className="emp-plano-badge">Mais escolhido</div>
              )}
              <div className="emp-plano-name">{p.name}</div>
              <div className="emp-plano-price">
                <span className="emp-plano-currency">R$</span>
                <span className="emp-plano-amount">{p.price}</span>
                <span className="emp-plano-period">/adv/mês</span>
              </div>
              <div className="emp-plano-seats">{p.seats}</div>
              <div className="emp-plano-headline">{p.headline}</div>
              <ul className="emp-plano-features">
                {p.features.map((f) => (
                  <li key={f}>
                    <i className="bi bi-check2" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={p.href} className={`emp-plano-cta${p.highlight ? ' emp-plano-cta-accent' : ''}`}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="emp-planos-note" data-reveal>
          Todos os planos incluem 7 dias gratuitos · Cancelamento a qualquer momento · Sem taxa de setup
        </p>
      </section>

      <div className="emp-hairline" aria-hidden />

      {/* ── COMPARATIVO vs CHAT GENERICO ────────────────────────────────── */}
      <section className="emp-section emp-shell" data-reveal>
        <div className="emp-serial">
          <span className="emp-serial-dot" />
          CAPÍTULO IV · COMPARATIVO
        </div>
        <h2 className="emp-section-h2">
          Por que <em>nao</em> usar ChatGPT para peca?
        </h2>
        <p className="emp-section-lede">
          Um modelo generalista nao foi treinado para jurisprudencia brasileira.
          Pior: ele inventa citacao para parecer util. A LexAI recusa responder
          antes de fabricar.
        </p>

        <div className="emp-compare-table">
          <div className="emp-compare-row emp-compare-head">
            <div />
            <div className="emp-compare-them">ChatGPT / Gemini generico</div>
            <div className="emp-compare-us">LexAI</div>
          </div>
          {[
            {
              k: 'Jurisprudencia brasileira',
              them: 'Inventa acórdao com numero falso',
              us: 'Cada citacao com link rastreavel',
              themBad: true,
            },
            {
              k: 'Calculo de prazo com feriado',
              them: 'Nao considera feriado local',
              us: 'Feriado estadual + municipal + recesso forense',
              themBad: true,
            },
            {
              k: 'LGPD e retencao de dados',
              them: 'Treina modelo publico com seu caso',
              us: 'Dado do cliente nunca treina modelo publico',
              themBad: true,
            },
            {
              k: 'Modelo de peca padrao do escritorio',
              them: 'Impossivel \u2014 memoria limitada',
              us: 'Galeria propria, glossario por cliente',
              themBad: true,
            },
            {
              k: 'Correcao INPC / IGPM / SELIC',
              them: 'Aproximacao errada',
              us: 'Serie historica oficial integrada',
              themBad: true,
            },
            {
              k: 'Quando nao sabe',
              them: 'Inventa resposta confiante',
              us: 'Recusa e pede fonte adicional',
              themBad: true,
            },
            {
              k: 'Suporte em portugues',
              them: 'Forum em ingles, fila infinita',
              us: 'WhatsApp < 4h uteis, operador juridico',
              themBad: true,
            },
            {
              k: 'Conformidade LGPD',
              them: 'Servidor nos EUA, clausula generica',
              us: 'Processamento BR quando possivel, contrato DPA',
              themBad: true,
            },
          ].map((row, i) => (
            <div key={i} className="emp-compare-row">
              <div className="emp-compare-k">{row.k}</div>
              <div className="emp-compare-them emp-compare-them--bad">
                <i className="bi bi-x" aria-hidden /> {row.them}
              </div>
              <div className="emp-compare-us">
                <i className="bi bi-check2" aria-hidden /> {row.us}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="emp-hairline" aria-hidden />

      {/* ── CTA FINAL ───────────────────────────────────────────────────── */}
      <section className="emp-section emp-shell emp-cta-section" data-reveal>
        <div className="emp-cta-card">
          <div className="emp-serial emp-serial-center">
            <span className="emp-serial-dot" />
            CAPÍTULO IV · PRÓXIMO PASSO
          </div>
          <h2 className="emp-cta-h2">
            Pronto para conhecer<br />a LexAI <em>na prática?</em>
          </h2>
          <p className="emp-cta-sub">
            Demonstração ao vivo de 30 minutos. Nenhum compromisso de assinatura. Proposta no mesmo dia.
          </p>
          <div className="emp-cta-actions">
            <Link href="/login" className="emp-btn-primary emp-btn-lg">
              <i className="bi bi-calendar-check" />
              Agendar demonstração gratuita
            </Link>
            <Link href="/" className="emp-btn-ghost">
              Ver a plataforma completa
            </Link>
          </div>
          <div className="emp-cta-trustline">
            30 minutos &nbsp;·&nbsp; Sem compromisso &nbsp;·&nbsp; Proposta em até 24h
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="emp-footer">
        <div className="emp-shell emp-footer-inner">
          <div className="emp-footer-brand">
            <span className="emp-brand-mark emp-brand-mark-sm" aria-hidden>LX</span>
            <span className="emp-footer-copy">© MMXXVI LexAI · uma marca <strong>Vanix Corp</strong></span>
          </div>
          <div className="emp-footer-links">
            <Link href="/">Início</Link>
            <Link href="/#planos">Planos</Link>
            <Link href="/empresas">Para Empresas</Link>
            <Link href="/privacidade">Privacidade (LGPD)</Link>
            <Link href="/termos">Termos de Uso</Link>
          </div>
        </div>
      </footer>

      <WhatsAppFloat message="Ola! Vim do site da LexAI Empresas e gostaria de uma demonstracao." />
      <ExitIntent />

      <style jsx global>{`
        /* ── Root ────────────────────────────────────────────────────────── */
        .emp-root {
          min-height: 100vh;
          background: var(--bg-base);
          color: var(--text-primary);
          font-family: var(--font-dm, 'DM Sans', sans-serif);
        }

        /* ── Shell ───────────────────────────────────────────────────────── */
        .emp-shell {
          max-width: 1160px;
          margin: 0 auto;
          padding-left: 48px;
          padding-right: 48px;
        }

        /* ── Nav ─────────────────────────────────────────────────────────── */
        .emp-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 22px 48px;
          border-bottom: 1px solid var(--stone-line);
          backdrop-filter: blur(12px) saturate(160%);
          -webkit-backdrop-filter: blur(12px) saturate(160%);
          position: sticky;
          top: 0;
          z-index: 80;
          background: color-mix(in srgb, var(--bg-base) 85%, transparent);
        }
        .emp-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: var(--text-primary);
        }
        .emp-brand-mark {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          background: linear-gradient(135deg, var(--bg-base), color-mix(in srgb, var(--accent) 15%, var(--bg-base)));
          border: 1px solid var(--stone-line);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 800;
          color: var(--accent);
          box-shadow: 0 2px 12px color-mix(in srgb, var(--accent) 20%, transparent);
        }
        .emp-brand-mark-sm {
          width: 28px;
          height: 28px;
          font-size: 11px;
          border-radius: 7px;
        }
        .emp-brand-name {
          font-size: 18px;
          font-weight: 700;
          letter-spacing: -0.4px;
        }
        .emp-nav-links {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .emp-nav-link {
          font-size: 14px;
          color: var(--text-secondary);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }
        .emp-nav-link:hover {
          color: var(--text-primary);
        }
        .emp-nav-cta {
          font-size: 13px;
          font-weight: 600;
          color: var(--bg-base);
          background: var(--accent);
          padding: 9px 20px;
          border-radius: 8px;
          text-decoration: none;
          transition: opacity 0.2s, transform 0.15s;
        }
        .emp-nav-cta:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        /* ── Hairlines / Serial ──────────────────────────────────────────── */
        .emp-hairline {
          height: 1px;
          background: linear-gradient(90deg, var(--accent) 0%, var(--stone-line) 20%, transparent 100%);
          opacity: 0.4;
          max-width: 1160px;
          margin: 0 auto;
        }
        .emp-serial {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.6px;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 24px;
        }
        .emp-serial-center {
          justify-content: center;
        }
        .emp-serial-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--accent);
        }

        /* ── Hero ────────────────────────────────────────────────────────── */
        .emp-hero {
          padding: 120px 0 96px;
          text-align: center;
        }
        .emp-hero .emp-serial {
          justify-content: center;
        }
        .emp-hero-h1 {
          font-family: var(--font-playfair, 'Playfair Display', Georgia, serif);
          font-size: clamp(44px, 6vw, 72px);
          font-weight: 700;
          line-height: 1.08;
          letter-spacing: -2px;
          color: var(--text-primary);
          margin-bottom: 28px;
        }
        .emp-hero-h1 em {
          font-style: italic;
          color: var(--accent);
        }
        .emp-hero-lede {
          font-size: 18px;
          color: var(--text-secondary);
          line-height: 1.7;
          max-width: 580px;
          margin: 0 auto 44px;
        }
        .emp-hero-ctas {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          flex-wrap: wrap;
          margin-bottom: 80px;
        }

        /* ── Buttons ─────────────────────────────────────────────────────── */
        .emp-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          font-weight: 600;
          color: var(--bg-base);
          background: var(--accent);
          padding: 14px 28px;
          border-radius: 10px;
          text-decoration: none;
          box-shadow: 0 4px 20px color-mix(in srgb, var(--accent) 30%, transparent);
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
        }
        .emp-btn-primary:hover {
          opacity: 0.9;
          transform: translateY(-2px);
          box-shadow: 0 8px 28px color-mix(in srgb, var(--accent) 40%, transparent);
        }
        .emp-btn-lg {
          font-size: 16px;
          padding: 16px 36px;
        }
        .emp-btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          font-weight: 500;
          color: var(--text-secondary);
          padding: 14px 28px;
          border-radius: 10px;
          text-decoration: none;
          border: 1px solid var(--stone-line);
          transition: color 0.2s, border-color 0.2s, transform 0.15s;
        }
        .emp-btn-ghost:hover {
          color: var(--text-primary);
          border-color: var(--accent);
          transform: translateY(-1px);
        }

        /* ── Stats editoriais ────────────────────────────────────────────── */
        .emp-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
          border: 1px solid var(--stone-line);
          border-radius: 14px;
          background: var(--card-bg, color-mix(in srgb, var(--bg-base) 60%, transparent));
          backdrop-filter: blur(8px);
          overflow: hidden;
          max-width: 860px;
          margin: 0 auto;
        }
        .emp-stat {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding: 36px 36px 32px;
          border-right: 1px solid var(--stone-line);
          text-align: left;
        }
        .emp-stat:last-child {
          border-right: none;
        }
        .emp-stat-roman {
          font-family: var(--font-playfair, Georgia, serif);
          font-size: 12px;
          font-style: italic;
          color: var(--text-muted, var(--text-secondary));
          letter-spacing: 1.4px;
          margin-bottom: 16px;
        }
        .emp-stat-value {
          font-family: var(--font-playfair, Georgia, serif);
          font-size: 36px;
          font-weight: 500;
          color: var(--text-primary);
          line-height: 1;
          letter-spacing: -1px;
        }
        .emp-stat-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          color: var(--text-secondary);
          margin-top: 16px;
          line-height: 1.4;
        }

        /* ── Sections ────────────────────────────────────────────────────── */
        .emp-section {
          padding: 112px 48px;
        }
        .emp-section-head {
          max-width: 640px;
          margin-bottom: 72px;
        }
        .emp-section-h2 {
          font-family: var(--font-playfair, Georgia, serif);
          font-size: clamp(34px, 4vw, 52px);
          font-weight: 700;
          letter-spacing: -1.5px;
          line-height: 1.1;
          color: var(--text-primary);
          margin-bottom: 20px;
        }
        .emp-section-h2 em {
          font-style: italic;
          color: var(--accent);
        }
        .emp-section-sub {
          font-size: 16px;
          color: var(--text-secondary);
          line-height: 1.7;
          margin: 0;
        }

        /* ── Agentes grid ─────────────────────────────────────────────────── */
        .emp-agents-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1px;
          border: 1px solid var(--stone-line);
          border-radius: 14px;
          overflow: hidden;
          background: var(--stone-line);
        }
        .emp-agent-card {
          background: var(--bg-base);
          padding: 28px 24px 32px;
          transition: background 0.2s;
        }
        .emp-agent-card:hover {
          background: color-mix(in srgb, var(--accent) 5%, var(--bg-base));
        }
        .emp-agent-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .emp-agent-num {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.4px;
          color: var(--text-muted, var(--text-secondary));
          opacity: 0.6;
        }
        .emp-agent-icon {
          width: 36px;
          height: 36px;
          border-radius: 9px;
          background: color-mix(in srgb, var(--accent) 12%, transparent);
          border: 1px solid color-mix(in srgb, var(--accent) 25%, transparent);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          color: var(--accent);
        }
        .emp-agent-name {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.3px;
          margin-bottom: 10px;
        }
        .emp-agent-desc {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0;
        }

        /* ── Casos grid ──────────────────────────────────────────────────── */
        .emp-casos-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .emp-caso-card {
          padding: 36px 32px;
          border-radius: 16px;
          border: 1px solid var(--stone-line);
          background: color-mix(in srgb, var(--accent) 3%, var(--bg-base));
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .emp-caso-icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: color-mix(in srgb, var(--caso-accent, var(--accent)) 12%, transparent);
          border: 1px solid color-mix(in srgb, var(--caso-accent, var(--accent)) 25%, transparent);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          color: var(--caso-accent, var(--accent));
        }
        .emp-caso-header {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .emp-caso-persona {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.3px;
          margin: 0;
        }
        .emp-caso-size {
          font-size: 12px;
          color: var(--text-secondary);
          font-weight: 500;
        }
        .emp-caso-block {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .emp-caso-tag {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .emp-caso-tag-pain  { color: #E05252; }
        .emp-caso-tag-sol   { color: #6B8F71; }
        .emp-caso-text {
          font-size: 13.5px;
          color: var(--text-secondary);
          line-height: 1.65;
          margin: 0;
        }
        .emp-caso-text-bright {
          color: var(--text-primary);
          opacity: 0.85;
        }

        /* ── Planos ──────────────────────────────────────────────────────── */
        .emp-planos-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-bottom: 32px;
        }
        .emp-plano-card {
          padding: 40px 36px;
          border-radius: 18px;
          border: 1px solid var(--stone-line);
          background: var(--bg-base);
          display: flex;
          flex-direction: column;
          gap: 0;
          position: relative;
          transition: border-color 0.2s, transform 0.18s;
        }
        .emp-plano-card:hover {
          border-color: color-mix(in srgb, var(--accent) 40%, transparent);
          transform: translateY(-3px);
        }
        .emp-plano-highlight {
          border-color: var(--accent);
          background: color-mix(in srgb, var(--accent) 5%, var(--bg-base));
        }
        .emp-plano-badge {
          position: absolute;
          top: -13px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          color: var(--bg-base);
          background: var(--accent);
          padding: 4px 14px;
          border-radius: 20px;
          white-space: nowrap;
        }
        .emp-plano-name {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 20px;
        }
        .emp-plano-price {
          display: flex;
          align-items: baseline;
          gap: 4px;
          margin-bottom: 6px;
        }
        .emp-plano-currency {
          font-size: 20px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .emp-plano-amount {
          font-family: var(--font-playfair, Georgia, serif);
          font-size: 48px;
          font-weight: 700;
          line-height: 1;
          letter-spacing: -2px;
          color: var(--text-primary);
        }
        .emp-plano-period {
          font-size: 13px;
          color: var(--text-secondary);
        }
        .emp-plano-seats {
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }
        .emp-plano-headline {
          font-size: 13px;
          font-weight: 600;
          color: var(--accent);
          margin-bottom: 28px;
          padding-bottom: 24px;
          border-bottom: 1px solid var(--stone-line);
        }
        .emp-plano-features {
          list-style: none;
          padding: 0;
          margin: 0 0 36px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1;
        }
        .emp-plano-features li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 13.5px;
          color: var(--text-secondary);
          line-height: 1.5;
        }
        .emp-plano-features li .bi {
          color: var(--accent);
          font-size: 15px;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .emp-plano-cta {
          display: block;
          text-align: center;
          font-size: 14px;
          font-weight: 600;
          padding: 13px;
          border-radius: 10px;
          text-decoration: none;
          border: 1px solid var(--stone-line);
          color: var(--text-primary);
          background: transparent;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
        }
        .emp-plano-cta:hover {
          background: var(--stone-line);
        }
        .emp-plano-cta-accent {
          background: var(--accent);
          border-color: var(--accent);
          color: var(--bg-base);
        }
        .emp-plano-cta-accent:hover {
          background: color-mix(in srgb, var(--accent) 85%, #fff);
          border-color: color-mix(in srgb, var(--accent) 85%, #fff);
          color: var(--bg-base);
        }
        .emp-planos-note {
          text-align: center;
          font-size: 13px;
          color: var(--text-secondary);
          opacity: 0.7;
        }

        /* ── Comparativo tabela ──────────────────────────────────────────── */
        .emp-compare-table {
          margin-top: 48px;
          border: 1px solid var(--stone-line);
          border-radius: 6px;
          overflow: hidden;
          background: var(--card-bg);
        }
        .emp-compare-row {
          display: grid;
          grid-template-columns: 1.1fr 1.4fr 1.4fr;
          gap: 0;
          border-bottom: 1px solid var(--stone-line);
        }
        .emp-compare-row:last-child { border-bottom: none; }
        .emp-compare-row > div {
          padding: 18px 22px;
          font-size: 14px;
          line-height: 1.5;
          color: var(--text-secondary);
          display: flex; align-items: center; gap: 10px;
        }
        .emp-compare-row > div + div {
          border-left: 1px solid var(--stone-line);
        }
        .emp-compare-head > div {
          font-size: 12px; letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 600;
          background: color-mix(in srgb, var(--text-muted) 8%, transparent);
        }
        .emp-compare-head .emp-compare-us {
          background: color-mix(in srgb, var(--accent) 12%, transparent);
          color: var(--text-primary);
        }
        .emp-compare-k {
          font-weight: 600;
          color: var(--text-primary);
        }
        .emp-compare-them i,
        .emp-compare-us i {
          font-size: 18px;
          flex-shrink: 0;
        }
        .emp-compare-them--bad i { color: #b85540; }
        .emp-compare-us i { color: #6B8F71; font-weight: 700; }
        .emp-compare-us {
          background: color-mix(in srgb, var(--accent) 4%, transparent);
          color: var(--text-primary);
        }
        @media (max-width: 720px) {
          .emp-compare-row { grid-template-columns: 1fr; }
          .emp-compare-row > div + div { border-left: none; border-top: 1px solid var(--stone-line); }
        }

        /* ── CTA final ───────────────────────────────────────────────────── */
        .emp-cta-section {
          padding-top: 0;
        }
        .emp-cta-card {
          border: 1px solid var(--stone-line);
          border-radius: 20px;
          background: color-mix(in srgb, var(--accent) 5%, var(--bg-base));
          padding: 72px 48px;
          text-align: center;
        }
        .emp-cta-h2 {
          font-family: var(--font-playfair, Georgia, serif);
          font-size: clamp(30px, 4vw, 48px);
          font-weight: 700;
          letter-spacing: -1.5px;
          line-height: 1.1;
          color: var(--text-primary);
          margin-bottom: 20px;
        }
        .emp-cta-h2 em {
          font-style: italic;
          color: var(--accent);
        }
        .emp-cta-sub {
          font-size: 16px;
          color: var(--text-secondary);
          margin: 0 auto 40px;
          max-width: 480px;
          line-height: 1.6;
        }
        .emp-cta-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }
        .emp-cta-trustline {
          font-size: 13px;
          color: var(--text-secondary);
          opacity: 0.6;
        }

        /* ── Footer ──────────────────────────────────────────────────────── */
        .emp-footer {
          border-top: 1px solid var(--stone-line);
          padding: 36px 0;
          margin-top: 80px;
        }
        .emp-footer-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
        }
        .emp-footer-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .emp-footer-copy {
          font-size: 13px;
          color: var(--text-secondary);
          opacity: 0.6;
        }
        .emp-footer-copy strong {
          color: var(--text-secondary);
          opacity: 1;
        }
        .emp-footer-links {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }
        .emp-footer-links a {
          font-size: 13px;
          color: var(--text-secondary);
          text-decoration: none;
          opacity: 0.6;
          transition: opacity 0.2s;
        }
        .emp-footer-links a:hover {
          opacity: 1;
        }

        /* ── Scroll reveal ───────────────────────────────────────────────── */
        [data-reveal] {
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.6s ease, transform 0.6s ease;
          transition-delay: var(--reveal-delay, 0ms);
        }
        [data-reveal].is-revealed {
          opacity: 1;
          transform: translateY(0);
        }

        /* ── Responsive ──────────────────────────────────────────────────── */
        @media (max-width: 1024px) {
          .emp-agents-grid { grid-template-columns: repeat(3, 1fr); }
          .emp-planos-grid  { grid-template-columns: 1fr; max-width: 480px; margin-left: auto; margin-right: auto; }
        }
        @media (max-width: 860px) {
          .emp-shell { padding-left: 24px; padding-right: 24px; }
          .emp-nav   { padding: 18px 24px; }
          .emp-section { padding: 72px 24px; }
          .emp-agents-grid { grid-template-columns: repeat(2, 1fr); }
          .emp-casos-grid  { grid-template-columns: 1fr; }
          .emp-stats { grid-template-columns: repeat(2, 1fr); }
          .emp-stat:nth-child(2) { border-right: none; }
        }
        @media (max-width: 640px) {
          .emp-nav-links .emp-nav-link { display: none; }
          .emp-hero { padding: 80px 0 64px; }
          .emp-agents-grid { grid-template-columns: 1fr; }
          .emp-stats { grid-template-columns: 1fr; }
          .emp-stat { border-right: none; border-bottom: 1px solid var(--stone-line); }
          .emp-stat:last-child { border-bottom: none; }
          .emp-cta-card { padding: 48px 24px; }
        }
      `}</style>
    </div>
  )
}

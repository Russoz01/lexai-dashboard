'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { WhatsAppFloat } from '@/components/WhatsAppFloat'
import { ExitIntent } from '@/components/ExitIntent'
import s from './page.module.css'

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
    <div className={s.empRoot}>

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav className={s.empNav}>
        <Link href="/" className={s.empBrand}>
          <span className={s.empBrandMark} aria-hidden>LX</span>
          <span className={s.empBrandName}>LexAI</span>
        </Link>
        <div className={s.empNavLinks}>
          <Link href="/" className={s.empNavLink}>Início</Link>
          <Link href="/#planos" className={s.empNavLink}>Planos</Link>
          <Link href="/login" className={s.empNavLink}>Entrar</Link>
          <Link href="/login" className={s.empNavCta}>
            Agendar demonstração
          </Link>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section id="main-content" className={s.empHero}>
        <div className={s.empShell}>
          <div className={s.empSerial}>
            <span className={s.empSerialDot} />
            LexAI para escritórios e bancas
          </div>

          <h1 className={s.empHeroH1} data-reveal>
            Seu escritório.<br />
            <em>Doze especialistas.</em><br />
            Uma assinatura.
          </h1>

          <p className={s.empHeroLede} data-reveal>
            Doze agentes de IA calibrados para o Direito brasileiro. Cada um com conhecimento profundo da sua área, disponível agora, sem contratação, sem onboarding de meses.
          </p>

          <div className={s.empHeroCtas} data-reveal>
            <Link href="/login" className={s.empBtnPrimary}>
              <i className="bi bi-calendar-check" />
              Agendar demonstração
            </Link>
            <Link href="#casos" className={s.empBtnGhost}>
              Ver casos de uso
            </Link>
          </div>

          {/* Stats editoriais */}
          <div className={s.empStats} data-reveal>
            {[
              { roman: 'I',   value: '12',      label: 'Agentes especializados' },
              { roman: 'II',  value: '9',       label: 'Áreas do Direito cobertas' },
              { roman: 'III', value: '4 min',   label: 'Por análise de documento' },
              { roman: 'IV',  value: '< 24h',   label: 'Setup completo' },
            ].map((st) => (
              <div key={st.roman} className={s.empStat}>
                <span className={s.empStatRoman}>{st.roman}</span>
                <div className={s.empStatValue}>{st.value}</div>
                <div className={s.empStatLabel}>{st.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className={s.empHairline} aria-hidden />

      {/* ── AGENTES ─────────────────────────────────────────────────────── */}
      <section className={`${s.empSection} ${s.empShell}`}>
        <div className={s.empSectionHead} data-reveal>
          <div className={s.empSerial}>
            <span className={s.empSerialDot} />
            CAPÍTULO I · ATELIER
          </div>
          <h2 className={s.empSectionH2}>
            O gabinete completo,<br /><em>já disponível</em>
          </h2>
          <p className={s.empSectionSub}>
            Todos os especialistas que seu escritório precisaria contratar — em uma única plataforma, com custo por advogado, sem mensalidade extra por agente.
          </p>
        </div>

        <div className={s.empAgentsGrid}>
          {AGENTES.map((a, i) => (
            <div key={a.n} className={s.empAgentCard} data-reveal style={{ '--reveal-delay': `${i * 40}ms` } as React.CSSProperties}>
              <div className={s.empAgentHeader}>
                <span className={s.empAgentNum}>{a.n}</span>
                <div className={s.empAgentIcon}>
                  <i className={`bi ${a.icon}`} />
                </div>
              </div>
              <h3 className={s.empAgentName}>{a.name}</h3>
              <p className={s.empAgentDesc}>{a.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className={s.empHairline} aria-hidden />

      {/* ── CASOS DE USO ────────────────────────────────────────────────── */}
      <section id="casos" className={`${s.empSection} ${s.empShell}`}>
        <div className={s.empSectionHead} data-reveal>
          <div className={s.empSerial}>
            <span className={s.empSerialDot} />
            CAPÍTULO II · PERFIS
          </div>
          <h2 className={s.empSectionH2}>
            Feito para<br /><em>seu perfil</em>
          </h2>
          <p className={s.empSectionSub}>
            O mesmo sistema de agentes se adapta a bancas de nicho, advocacia de massa e departamentos jurídicos corporativos.
          </p>
        </div>

        <div className={s.empCasosGrid}>
          {CASOS.map((c, i) => (
            <div key={c.persona} className={s.empCasoCard} data-reveal style={{ '--reveal-delay': `${i * 80}ms` } as React.CSSProperties}>
              <div className={s.empCasoIcon} style={{ '--caso-accent': c.accent } as React.CSSProperties}>
                <i className={`bi ${c.icon}`} />
              </div>
              <div className={s.empCasoHeader}>
                <h3 className={s.empCasoPersona}>{c.persona}</h3>
                <span className={s.empCasoSize}>{c.size}</span>
              </div>
              <div className={s.empCasoBlock}>
                <div className={`${s.empCasoTag} ${s.empCasoTagPain}`}>Dor</div>
                <p className={s.empCasoText}>{c.pains}</p>
              </div>
              <div className={s.empCasoBlock}>
                <div className={`${s.empCasoTag} ${s.empCasoTagSol}`}>Solução LexAI</div>
                <p className={`${s.empCasoText} ${s.empCasoTextBright}`}>{c.solution}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className={s.empHairline} aria-hidden />

      {/* ── PLANOS ──────────────────────────────────────────────────────── */}
      <section className={`${s.empSection} ${s.empShell}`}>
        <div className={s.empSectionHead} data-reveal>
          <div className={s.empSerial}>
            <span className={s.empSerialDot} />
            CAPÍTULO III · INVESTIMENTO
          </div>
          <h2 className={s.empSectionH2}>
            Valor por advogado,<br /><em>não por feature</em>
          </h2>
          <p className={s.empSectionSub}>
            Preço único por assento. Sem cobrança extra por agente, sem limite de documentos no Firma e Enterprise. Plano escolhido pelo tamanho da equipe.
          </p>
        </div>

        <div className={s.empPlanosGrid}>
          {PLANOS.map((p, i) => (
            <div
              key={p.name}
              className={`${s.empPlanoCard}${p.highlight ? ` ${s.empPlanoHighlight}` : ''}`}
              data-reveal
              style={{ '--reveal-delay': `${i * 80}ms` } as React.CSSProperties}
            >
              {p.highlight && (
                <div className={s.empPlanoBadge}>Mais escolhido</div>
              )}
              <div className={s.empPlanoName}>{p.name}</div>
              <div className={s.empPlanoPrice}>
                <span className={s.empPlanoCurrency}>R$</span>
                <span className={s.empPlanoAmount}>{p.price}</span>
                <span className={s.empPlanoPeriod}>/adv/mês</span>
              </div>
              <div className={s.empPlanoSeats}>{p.seats}</div>
              <div className={s.empPlanoHeadline}>{p.headline}</div>
              <ul className={s.empPlanoFeatures}>
                {p.features.map((f) => (
                  <li key={f}>
                    <i className="bi bi-check2" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={p.href} className={`${s.empPlanoCta}${p.highlight ? ` ${s.empPlanoCtaAccent}` : ''}`}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className={s.empPlanosNote} data-reveal>
          Todos os planos incluem 7 dias gratuitos · Cancelamento a qualquer momento · Sem taxa de setup
        </p>
      </section>

      <div className={s.empHairline} aria-hidden />

      {/* ── COMPARATIVO vs CHAT GENERICO ────────────────────────────────── */}
      <section className={`${s.empSection} ${s.empShell}`} data-reveal>
        <div className={s.empSerial}>
          <span className={s.empSerialDot} />
          CAPÍTULO IV · COMPARATIVO
        </div>
        <h2 className={s.empSectionH2}>
          Por que <em>nao</em> usar ChatGPT para peca?
        </h2>
        <p className={s.empSectionLede}>
          Um modelo generalista nao foi treinado para jurisprudencia brasileira.
          Pior: ele inventa citacao para parecer util. A LexAI recusa responder
          antes de fabricar.
        </p>

        <div className={s.empCompareTable}>
          <div className={`${s.empCompareRow} ${s.empCompareHead}`}>
            <div />
            <div className={s.empCompareThem}>ChatGPT / Gemini generico</div>
            <div className={s.empCompareUs}>LexAI</div>
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
            <div key={i} className={s.empCompareRow}>
              <div className={s.empCompareK}>{row.k}</div>
              <div className={`${s.empCompareThem} ${s.empCompareThemBad}`}>
                <i className="bi bi-x" aria-hidden /> {row.them}
              </div>
              <div className={s.empCompareUs}>
                <i className="bi bi-check2" aria-hidden /> {row.us}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className={s.empHairline} aria-hidden />

      {/* ── CTA FINAL ───────────────────────────────────────────────────── */}
      <section className={`${s.empSection} ${s.empShell} ${s.empCtaSection}`} data-reveal>
        <div className={s.empCtaCard}>
          <div className={`${s.empSerial} ${s.empSerialCenter}`}>
            <span className={s.empSerialDot} />
            CAPÍTULO IV · PRÓXIMO PASSO
          </div>
          <h2 className={s.empCtaH2}>
            Pronto para conhecer<br />a LexAI <em>na prática?</em>
          </h2>
          <p className={s.empCtaSub}>
            Demonstração ao vivo de 30 minutos. Nenhum compromisso de assinatura. Proposta no mesmo dia.
          </p>
          <div className={s.empCtaActions}>
            <Link href="/login" className={`${s.empBtnPrimary} ${s.empBtnLg}`}>
              <i className="bi bi-calendar-check" />
              Agendar demonstração gratuita
            </Link>
            <Link href="/" className={s.empBtnGhost}>
              Ver a plataforma completa
            </Link>
          </div>
          <div className={s.empCtaTrustline}>
            30 minutos &nbsp;·&nbsp; Sem compromisso &nbsp;·&nbsp; Proposta em até 24h
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className={s.empFooter}>
        <div className={`${s.empShell} ${s.empFooterInner}`}>
          <div className={s.empFooterBrand}>
            <span className={`${s.empBrandMark} ${s.empBrandMarkSm}`} aria-hidden>LX</span>
            <span className={s.empFooterCopy}>© MMXXVI LexAI · uma marca <strong>Vanix Corp</strong></span>
          </div>
          <div className={s.empFooterLinks}>
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
    </div>
  )
}

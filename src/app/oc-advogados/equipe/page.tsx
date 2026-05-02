'use client'

import { useEffect, useRef } from 'react'
import {
  WHATSAPP_MAIN,
  TEAM,
  buildWhatsAppLink,
} from '../components'
import s from './page.module.css'

/* ══════════════════════════════════════════════════════════════
   Team Page — /oc-advogados/equipe
   Showcase all 10 attorneys. Leadership (2 Sócios Diretores) gets
   2 large cards on first row. Rest in 3-per-row grid.
   ══════════════════════════════════════════════════════════════ */

const BRIEFS: Record<string, string> = {
  'Sócio Diretor':
    'Atuação em Direito Previdenciário, com ampla experiência em concessão e revisão de benefícios, direito trabalhista e cível.',
  'Sócia Filial SP':
    'Responsável pela unidade de São Paulo, com atuação estratégica em processos de grande complexidade.',
  'Sócia Gestora Geral':
    'Coordenação da gestão geral do escritório, com atuação em Direito Previdenciário e Cível.',
  'Sócio Gestor de Equipe':
    'Liderança de equipe em Direito Previdenciário, com foco em aprovação de benefícios junto ao INSS.',
  'Sócia Gestora de Equipe':
    'Liderança de equipe em Direito Previdenciário, com foco em aprovação de benefícios junto ao INSS.',
  Advogada:
    'Atuação em Direito Previdenciário, com foco em atendimento humanizado e acompanhamento próximo do cliente.',
}

export default function OcTeamPage() {
  const revealRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!revealRef.current) return
    const nodes = revealRef.current.querySelectorAll<HTMLElement>(
      `.${s.reveal}`
    )
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(s.revealVisible)
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    )
    nodes.forEach((n) => io.observe(n))
    return () => io.disconnect()
  }, [])

  const leadership = TEAM.slice(0, 2)
  const rest = TEAM.slice(2)

  return (
    <div ref={revealRef} className={s.root}>
      {/* ═══════════════ HERO ═══════════════ */}
      <section className={s.hero}>
        <div className={s.heroGlow} aria-hidden />
        <div className={s.heroInner}>
          <span className={`${s.eyebrow} ${s.reveal}`}>
            <span className={s.eyebrowRule} aria-hidden />
            Nossa equipe · Nº 002
          </span>
          <h1 className={`${s.h1} ${s.reveal}`}>
            Os profissionais <em>por trás da OC</em>.
          </h1>
          <p className={`${s.lede} ${s.reveal}`}>
            Mais de dez advogados especializados, presentes em cinco
            escritórios em São Paulo. Cada profissional traz uma
            combinação rara: formação técnica rigorosa, experiência em
            campo e atendimento humanizado.
          </p>

          <div className={`${s.heroStats} ${s.reveal}`}>
            <div className={s.heroStat}>
              <span className={s.heroStatVal}>10+</span>
              <span className={s.heroStatLbl}>Advogados</span>
            </div>
            <div className={s.heroStat}>
              <span className={s.heroStatVal}>05</span>
              <span className={s.heroStatLbl}>Unidades</span>
            </div>
            <div className={s.heroStat}>
              <span className={s.heroStatVal}>BR</span>
              <span className={s.heroStatLbl}>Atuação nacional</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ LEADERSHIP ═══════════════ */}
      <section className={s.section}>
        <div className={s.container}>
          <header className={`${s.sectionHead} ${s.reveal}`}>
            <span className={s.eyebrow}>
              <span className={s.eyebrowRule} aria-hidden />
              Sócios Diretores
            </span>
            <h2 className={s.h2}>
              A <em>liderança</em> do escritório.
            </h2>
          </header>

          <div className={s.leadershipGrid}>
            {leadership.map((att, i) => (
              <article
                key={att.name}
                className={`${s.leadershipCard} ${s.reveal}`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <div className={s.leadershipCardGlow} aria-hidden />
                <div className={s.leadershipAvatar} aria-hidden>
                  <span>{att.initials}</span>
                </div>
                <span className={s.cardRole}>{att.role}</span>
                <h3 className={s.leadershipName}>{att.name}</h3>
                <div className={s.cardRule} aria-hidden />
                <p className={s.cardBrief}>{BRIEFS[att.role]}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className={s.sectionRule} aria-hidden />

      {/* ═══════════════ FULL TEAM GRID ═══════════════ */}
      <section className={s.section}>
        <div className={s.container}>
          <header className={`${s.sectionHead} ${s.reveal}`}>
            <span className={s.eyebrow}>
              <span className={s.eyebrowRule} aria-hidden />
              Sócios e Advogados
            </span>
            <h2 className={s.h2}>
              Uma equipe <em>multidisciplinar</em>.
            </h2>
          </header>

          <div className={s.teamGrid}>
            {rest.map((att, i) => (
              <article
                key={att.name}
                className={`${s.teamCard} ${s.reveal}`}
                style={{ transitionDelay: `${(i % 3) * 80}ms` }}
              >
                <div className={s.teamAvatar} aria-hidden>
                  <span>{att.initials}</span>
                </div>
                <span className={s.cardRole}>{att.role}</span>
                <h3 className={s.teamName}>{att.name}</h3>
                <div className={s.cardRule} aria-hidden />
                <p className={s.cardBrief}>
                  {BRIEFS[att.role] || BRIEFS['Advogada']}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ FINAL CTA ═══════════════ */}
      <section className={s.section}>
        <div className={s.container}>
          <div className={`${s.finalCta} ${s.reveal}`}>
            <div className={s.finalCtaGlow} aria-hidden />
            <span className={s.eyebrow}>
              <span className={s.eyebrowRule} aria-hidden />
              Fale com nossa equipe
            </span>
            <h2 className={s.finalCtaTitle}>
              Quer conversar com um dos{' '}
              <em>nossos advogados?</em>
            </h2>
            <p className={s.finalCtaLede}>
              Envie uma mensagem e direcionamos você ao especialista
              mais indicado para o seu caso.
            </p>
            <a
              href={buildWhatsAppLink(WHATSAPP_MAIN)}
              target="_blank"
              rel="noopener noreferrer"
              className={s.ctaPrimary}
            >
              <i className="bi bi-whatsapp" aria-hidden />
              Fale com um Especialista
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

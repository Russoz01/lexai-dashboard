'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import {
  WHATSAPP_MAIN,
  WHATSAPP_MAIN_DISPLAY,
  INSTAGRAM_URL,
  PRACTICE_AREAS,
  SERVICES,
  TEAM,
  OFFICES,
  buildWhatsAppLink,
} from './components'
import s from './page.module.css'

/* ══════════════════════════════════════════════════════════════
   Home — OC Advogados
   ══════════════════════════════════════════════════════════════ */

// Social proof numbers (only confirmed data)
const STATS = [
  { value: 5, suffix: '', label: 'Escritórios em São Paulo', icon: 'bi-geo-alt' },
  { value: 10, suffix: '+', label: 'Advogados Especializados', icon: 'bi-people' },
  { value: 460, suffix: ' mil', label: 'Seguidores no Instagram', icon: 'bi-instagram' },
]

const SERVICE_CTA_MSG = (name: string) =>
  `Olá! Venho do site e gostaria de informações sobre ${name}.`

export default function OcHomePage() {
  const [scrollY, setScrollY] = useState(0)

  // Parallax scroll for hero monogram
  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY)
          ticking = false
        })
        ticking = true
      }
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // IntersectionObserver for reveal animations
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

  // Top 4 attorneys for preview
  const topTeam = TEAM.slice(0, 4)

  return (
    <div ref={revealRef} className={s.root}>
      {/* ═══════════════ HERO ═══════════════ */}
      <section className={s.hero}>
        <div
          className={s.heroMonogram}
          aria-hidden
          style={{ transform: `translateY(${scrollY * 0.15}px)` }}
        >
          <span>O</span>
          <span>C</span>
        </div>
        <div className={s.heroGlow} aria-hidden />

        <div className={s.heroInner}>
          <span className={`${s.heroEyebrow} ${s.reveal}`}>
            <span className={s.heroEyebrowRule} aria-hidden />
            ESCRITÓRIO DE ADVOCACIA · MMXXVI
          </span>

          <h1 className={`${s.heroTitle} ${s.reveal}`}>
            Seus direitos.
            <br />
            <em>Nossa especialidade.</em>
          </h1>

          <p className={`${s.heroLede} ${s.reveal}`}>
            Atuamos em todo Brasil com foco em Direito Previdenciário,
            Trabalhista e Cível. Atendimento humanizado, resultados
            concretos — com a serenidade que o seu caso merece.
          </p>

          <div className={`${s.heroCtas} ${s.reveal}`}>
            <a
              href={buildWhatsAppLink(WHATSAPP_MAIN)}
              target="_blank"
              rel="noopener noreferrer"
              className={s.ctaPrimary}
            >
              <i className="bi bi-whatsapp" aria-hidden />
              Fale com um Especialista
            </a>
            <a href="#areas" className={s.ctaGhost}>
              Conheça nossos serviços
              <i className="bi bi-arrow-down" aria-hidden />
            </a>
          </div>

          <div className={s.heroScrollHint} aria-hidden>
            <span>Role para baixo</span>
            <i className="bi bi-chevron-compact-down" />
          </div>
        </div>
      </section>

      {/* ═══════════════ SOCIAL PROOF BAR ═══════════════ */}
      <section className={`${s.section} ${s.socialBar}`} aria-label="Números do escritório">
        <div className={s.socialBarInner}>
          {STATS.map((stat, i) => (
            <StatItem key={stat.label} {...stat} index={i} />
          ))}
        </div>
      </section>

      {/* ═══════════════ PRACTICE AREAS ═══════════════ */}
      <section className={s.section} id="areas">
        <div className={s.container}>
          <header className={`${s.sectionHead} ${s.reveal}`}>
            <span className={s.eyebrow}>
              <span className={s.eyebrowRule} aria-hidden />
              Áreas de atuação
            </span>
            <h2 className={s.h2}>
              Advocacia especializada para proteger{' '}
              <em>seus direitos</em>
            </h2>
            <p className={s.sectionLede}>
              Três áreas complementares, um mesmo compromisso: cuidar
              daquilo que mais importa para você e sua família.
            </p>
          </header>

          <div className={s.areasGrid}>
            {PRACTICE_AREAS.map((area, i) => (
              <article
                key={area.name}
                className={`${s.areaCard} ${area.primary ? s.areaCardPrimary : ''} ${s.reveal}`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                {area.primary && (
                  <span className={s.areaCardBadge}>Especialidade principal</span>
                )}
                <div className={s.areaCardIcon}>
                  <i className={`bi ${area.icon}`} aria-hidden />
                </div>
                <h3 className={s.areaCardTitle}>{area.name}</h3>
                <p className={s.areaCardDesc}>{area.description}</p>
                <a
                  href={buildWhatsAppLink(
                    WHATSAPP_MAIN,
                    `Olá! Tenho interesse em ${area.name}.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={s.areaCardLink}
                >
                  Conversar com especialista
                  <i className="bi bi-arrow-right" aria-hidden />
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className={s.sectionRule} aria-hidden />

      {/* ═══════════════ SERVICES HIGHLIGHT ═══════════════ */}
      <section className={s.section}>
        <div className={s.container}>
          <header className={`${s.sectionHead} ${s.reveal}`}>
            <span className={s.eyebrow}>
              <span className={s.eyebrowRule} aria-hidden />
              Serviços em destaque
            </span>
            <h2 className={s.h2}>
              Escritório especializado em{' '}
              <em>aprovação de benefícios</em>
            </h2>
            <p className={s.sectionLede}>
              Do pedido administrativo à ação judicial, conduzimos o
              processo completo com análise técnica e acompanhamento
              próximo.
            </p>
          </header>

          <div className={s.servicesGrid}>
            {SERVICES.map((svc, i) => (
              <Link
                key={svc.slug}
                href={`/oc-advogados/servicos/${svc.slug}`}
                className={`${s.serviceCard} ${s.reveal}`}
                style={{ transitionDelay: `${i * 70}ms` }}
              >
                <div className={s.serviceCardHead}>
                  <div className={s.serviceCardIcon}>
                    <i className={`bi ${svc.icon}`} aria-hidden />
                  </div>
                  <span className={s.serviceCardNumber}>
                    0{i + 1}
                  </span>
                </div>
                <h3 className={s.serviceCardTitle}>{svc.name}</h3>
                <p className={s.serviceCardDesc}>{svc.tagline}</p>
                <span className={s.serviceCardLink}>
                  Saiba mais
                  <i className="bi bi-arrow-up-right" aria-hidden />
                </span>
              </Link>
            ))}
          </div>

          <div className={`${s.servicesCta} ${s.reveal}`}>
            <p className={s.servicesCtaText}>
              Não sabe qual serviço precisa?
            </p>
            <a
              href={buildWhatsAppLink(WHATSAPP_MAIN)}
              target="_blank"
              rel="noopener noreferrer"
              className={s.ctaAccent}
            >
              <i className="bi bi-whatsapp" aria-hidden />
              Fale com um especialista
            </a>
          </div>
        </div>
      </section>

      <div className={s.sectionRule} aria-hidden />

      {/* ═══════════════ ABOUT PREVIEW ═══════════════ */}
      <section className={s.section}>
        <div className={s.container}>
          <div className={s.aboutGrid}>
            <div className={`${s.aboutContent} ${s.reveal}`}>
              <span className={s.eyebrow}>
                <span className={s.eyebrowRule} aria-hidden />
                Sobre nós
              </span>
              <h2 className={s.h2}>
                Advocacia com <em>propósito</em>
              </h2>
              <p className={s.aboutP}>
                A OC Advogados é um escritório especializado em Direito
                Previdenciário, Cível e Trabalhista com presença em{' '}
                <strong>5 cidades</strong> do estado de São Paulo. Nossa
                equipe de mais de <strong>10 advogados</strong> é movida
                pela paixão de solucionar problemas e assegurar direitos
                a famílias em todo o Brasil.
              </p>
              <p className={s.aboutP}>
                Atendimento humanizado, técnica rigorosa e a serenidade
                de quem vive o caso de perto — porque cada processo é,
                antes de tudo, a história de uma pessoa.
              </p>
              <Link href="/oc-advogados/sobre" className={s.aboutLink}>
                Conheça nossa história
                <i className="bi bi-arrow-right" aria-hidden />
              </Link>
            </div>

            <div className={`${s.aboutDecor} ${s.reveal}`} aria-hidden>
              <span className={s.aboutQuoteMark}>&ldquo;</span>
              <div className={s.aboutDecorRule} />
              <div className={s.aboutDecorStat}>
                <span className={s.aboutDecorStatValue}>05</span>
                <span className={s.aboutDecorStatLabel}>
                  Escritórios
                </span>
              </div>
              <div className={s.aboutDecorStat}>
                <span className={s.aboutDecorStatValue}>10+</span>
                <span className={s.aboutDecorStatLabel}>
                  Advogados
                </span>
              </div>
              <div className={s.aboutDecorStat}>
                <span className={s.aboutDecorStatValue}>BR</span>
                <span className={s.aboutDecorStatLabel}>
                  Atuação nacional
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className={s.sectionRule} aria-hidden />

      {/* ═══════════════ TEAM PREVIEW ═══════════════ */}
      <section className={s.section}>
        <div className={s.container}>
          <header className={`${s.sectionHead} ${s.reveal}`}>
            <span className={s.eyebrow}>
              <span className={s.eyebrowRule} aria-hidden />
              Nossa equipe
            </span>
            <h2 className={s.h2}>
              Advogados especialistas <em>ao seu lado</em>
            </h2>
            <p className={s.sectionLede}>
              Conheça alguns dos profissionais que compõem a OC — cada
              um com formação técnica e experiência em campo.
            </p>
          </header>

          <div className={s.teamGrid}>
            {topTeam.map((att, i) => (
              <article
                key={att.name}
                className={`${s.teamCard} ${s.reveal}`}
                style={{ transitionDelay: `${i * 70}ms` }}
              >
                <div className={s.teamAvatar} aria-hidden>
                  <span>{att.initials}</span>
                </div>
                <h3 className={s.teamName}>{att.name}</h3>
                <span className={s.teamRole}>{att.role}</span>
              </article>
            ))}
          </div>

          <div className={`${s.teamCtaWrap} ${s.reveal}`}>
            <Link href="/oc-advogados/equipe" className={s.ctaGhost}>
              Conheça a equipe completa
              <i className="bi bi-arrow-right" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <div className={s.sectionRule} aria-hidden />

      {/* ═══════════════ LOCATIONS PREVIEW ═══════════════ */}
      <section className={s.section}>
        <div className={s.container}>
          <header className={`${s.sectionHead} ${s.reveal}`}>
            <span className={s.eyebrow}>
              <span className={s.eyebrowRule} aria-hidden />
              Presença nacional
            </span>
            <h2 className={s.h2}>
              5 escritórios em São Paulo{' '}
              <em>para atender você</em>
            </h2>
          </header>

          <div className={`${s.locationsStrip} ${s.reveal}`}>
            {OFFICES.map((o) => (
              <div key={o.name} className={s.locationPill}>
                <i className="bi bi-geo-alt-fill" aria-hidden />
                <span className={s.locationPillCity}>{o.city}</span>
                <span className={s.locationPillState}>{o.state}</span>
                {o.isHq && <span className={s.locationPillHq}>Matriz</span>}
              </div>
            ))}
          </div>

          <p className={`${s.locationsNote} ${s.reveal}`}>
            Atendemos clientes de todo o Brasil, presencialmente ou de
            forma remota.
          </p>

          <div className={`${s.teamCtaWrap} ${s.reveal}`}>
            <Link href="/oc-advogados/contato" className={s.ctaGhost}>
              Ver endereços e contatos
              <i className="bi bi-arrow-right" aria-hidden />
            </Link>
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
              Fale com a OC
            </span>
            <h2 className={s.finalCtaTitle}>
              Fale sobre o seu caso.
              <br />
              <em>Nós ajudamos você a resolvê-lo.</em>
            </h2>
            <p className={s.finalCtaLede}>
              Envie uma mensagem para advogados especializados em
              Direito Previdenciário. Atendimento em todo Brasil.
            </p>
            <a
              href={buildWhatsAppLink(WHATSAPP_MAIN)}
              target="_blank"
              rel="noopener noreferrer"
              className={`${s.ctaPrimary} ${s.ctaPrimaryLg}`}
            >
              <i className="bi bi-whatsapp" aria-hidden />
              Falar com um Especialista Agora
            </a>
            <p className={s.finalCtaPhone}>
              Ou ligue: <strong>{WHATSAPP_MAIN_DISPLAY}</strong>
            </p>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={s.finalCtaInsta}
            >
              <i className="bi bi-instagram" aria-hidden />
              Acompanhe conteúdo no Instagram · 460 mil seguidores
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Stat item with countUp animation on scroll intersect
   ══════════════════════════════════════════════════════════════ */
function StatItem({
  value,
  suffix,
  label,
  icon,
  index,
}: {
  value: number
  suffix: string
  label: string
  icon: string
  index: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!ref.current) return
    const node = ref.current
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const duration = 1400
            const start = performance.now()
            const animate = (now: number) => {
              const elapsed = now - start
              const progress = Math.min(elapsed / duration, 1)
              // easeOutCubic
              const eased = 1 - Math.pow(1 - progress, 3)
              setDisplay(Math.round(value * eased))
              if (progress < 1) requestAnimationFrame(animate)
            }
            requestAnimationFrame(animate)
            io.unobserve(node)
          }
        })
      },
      { threshold: 0.5 }
    )
    io.observe(node)
    return () => io.disconnect()
  }, [value])

  return (
    <div
      ref={ref}
      className={s.statItem}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <i className={`bi ${icon} ${s.statIcon}`} aria-hidden />
      <span className={s.statValue}>
        {display}
        {suffix}
      </span>
      <span className={s.statLabel}>{label}</span>
    </div>
  )
}

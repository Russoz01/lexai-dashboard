'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import s from './layout.module.css'
import svc from './servicos/[slug]/page.module.css'

/* ══════════════════════════════════════════════════════════════
   OC ADVOGADOS — Client components + re-exported shared data
   Dados e utilidades moram em ./data (server-safe). Aqui moram só
   componentes React que usam hooks ou contexto cliente.
   ══════════════════════════════════════════════════════════════ */

// Re-export everything from data so existing client pages keep working:
//   `import { SERVICES, TEAM, buildWhatsAppLink } from '../components'`
export * from './data'

// Local imports for use inside this file (Nav, Footer, etc.)
import {
  WHATSAPP_MAIN,
  WHATSAPP_MAIN_DISPLAY,
  EMAIL,
  INSTAGRAM_URL,
  INSTAGRAM_HANDLE,
  SERVICES,
  OFFICES,
  buildWhatsAppLink,
  type Service,
} from './data'

/* ══════════════════════════════════════════════════════════════
   NAVIGATION BAR
   ══════════════════════════════════════════════════════════════ */
export function Nav() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
    setServicesOpen(false)
  }, [pathname])

  // Prevent body scroll when mobile menu open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const isActive = (href: string) => {
    if (href === '/oc-advogados') return pathname === '/oc-advogados'
    return pathname?.startsWith(href)
  }

  const isServicesActive = pathname?.startsWith('/oc-advogados/servicos')

  const links = [
    { href: '/oc-advogados', label: 'Home' },
    { href: '/oc-advogados/sobre', label: 'Sobre' },
    { href: '/oc-advogados/equipe', label: 'Equipe' },
    { href: '/oc-advogados/contato', label: 'Contato' },
  ]

  return (
    <header
      className={`${s.nav} ${scrolled ? s.navScrolled : ''}`}
      role="banner"
    >
      <div className={s.navInner}>
        <Link
          href="/oc-advogados"
          className={s.navBrand}
          aria-label="OC Advogados — Página inicial"
        >
          <span className={s.navBrandMark}>
            <span className={s.navBrandO}>O</span>
            <span className={s.navBrandC}>C</span>
          </span>
          <span className={s.navBrandText}>
            <span className={s.navBrandName}>OC Advogados</span>
            <span className={s.navBrandSub}>Escritório de Advocacia</span>
          </span>
        </Link>

        <nav className={s.navLinks} aria-label="Navegação principal">
          <Link
            href="/oc-advogados"
            className={`${s.navLink} ${isActive('/oc-advogados') && pathname === '/oc-advogados' ? s.navLinkActive : ''}`}
          >
            Home
          </Link>
          <Link
            href="/oc-advogados/sobre"
            className={`${s.navLink} ${pathname === '/oc-advogados/sobre' ? s.navLinkActive : ''}`}
          >
            Sobre
          </Link>

          <div
            className={s.navDropdown}
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
          >
            <button
              type="button"
              className={`${s.navLink} ${s.navDropdownTrigger} ${isServicesActive ? s.navLinkActive : ''}`}
              onClick={() => setServicesOpen((v) => !v)}
              aria-expanded={servicesOpen}
              aria-haspopup="menu"
            >
              Serviços
              <i
                className={`bi bi-chevron-down ${s.navDropdownCaret} ${servicesOpen ? s.navDropdownCaretOpen : ''}`}
                aria-hidden
              />
            </button>
            <div
              className={`${s.navDropdownMenu} ${servicesOpen ? s.navDropdownMenuOpen : ''}`}
              role="menu"
            >
              {SERVICES.map((svc) => (
                <Link
                  key={svc.slug}
                  href={`/oc-advogados/servicos/${svc.slug}`}
                  className={s.navDropdownItem}
                  role="menuitem"
                >
                  <i className={`bi ${svc.icon}`} aria-hidden />
                  <span>
                    <span className={s.navDropdownItemName}>{svc.name}</span>
                    <span className={s.navDropdownItemDesc}>
                      {svc.tagline}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <Link
            href="/oc-advogados/equipe"
            className={`${s.navLink} ${pathname === '/oc-advogados/equipe' ? s.navLinkActive : ''}`}
          >
            Equipe
          </Link>
          <Link
            href="/oc-advogados/contato"
            className={`${s.navLink} ${pathname === '/oc-advogados/contato' ? s.navLinkActive : ''}`}
          >
            Contato
          </Link>
        </nav>

        <a
          href={buildWhatsAppLink(WHATSAPP_MAIN)}
          target="_blank"
          rel="noopener noreferrer"
          className={s.navCta}
        >
          <i className="bi bi-whatsapp" aria-hidden />
          <span>Fale com um Especialista</span>
        </a>

        <button
          type="button"
          className={s.navHamburger}
          aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span className={`${s.navHamburgerBar} ${mobileOpen ? s.navHamburgerBarOpen1 : ''}`} />
          <span className={`${s.navHamburgerBar} ${mobileOpen ? s.navHamburgerBarOpen2 : ''}`} />
          <span className={`${s.navHamburgerBar} ${mobileOpen ? s.navHamburgerBarOpen3 : ''}`} />
        </button>
      </div>

      {/* Mobile menu drawer */}
      <div
        className={`${s.navMobileOverlay} ${mobileOpen ? s.navMobileOverlayOpen : ''}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden
      />
      <aside
        className={`${s.navMobile} ${mobileOpen ? s.navMobileOpen : ''}`}
        aria-label="Menu móvel"
        aria-hidden={!mobileOpen}
      >
        <div className={s.navMobileHeader}>
          <span className={s.navMobileBrandText}>OC Advogados</span>
          <button
            type="button"
            className={s.navMobileClose}
            aria-label="Fechar menu"
            onClick={() => setMobileOpen(false)}
          >
            <i className="bi bi-x-lg" aria-hidden />
          </button>
        </div>
        <nav className={s.navMobileLinks} aria-label="Navegação móvel">
          {links.slice(0, 2).map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`${s.navMobileLink} ${isActive(l.href) && (l.href === '/oc-advogados' ? pathname === l.href : true) ? s.navMobileLinkActive : ''}`}
            >
              {l.label}
            </Link>
          ))}

          <div className={s.navMobileSection}>
            <span className={s.navMobileSectionLabel}>Serviços</span>
            {SERVICES.map((svc) => (
              <Link
                key={svc.slug}
                href={`/oc-advogados/servicos/${svc.slug}`}
                className={s.navMobileSubLink}
              >
                <i className={`bi ${svc.icon}`} aria-hidden />
                {svc.name}
              </Link>
            ))}
          </div>

          {links.slice(2).map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`${s.navMobileLink} ${pathname === l.href ? s.navMobileLinkActive : ''}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <a
          href={buildWhatsAppLink(WHATSAPP_MAIN)}
          target="_blank"
          rel="noopener noreferrer"
          className={s.navMobileCta}
        >
          <i className="bi bi-whatsapp" aria-hidden />
          Fale com um Especialista
        </a>
      </aside>
    </header>
  )
}

/* ══════════════════════════════════════════════════════════════
   FOOTER
   ══════════════════════════════════════════════════════════════ */
export function Footer() {
  const hq = OFFICES.find((o) => o.isHq)
  return (
    <footer className={s.footer} role="contentinfo">
      <div className={s.footerInner}>
        <div className={s.footerGrid}>
          {/* Column 1: Brand + social */}
          <div className={s.footerCol}>
            <div className={s.footerBrand}>
              <span className={s.footerBrandMark}>
                <span className={s.navBrandO}>O</span>
                <span className={s.navBrandC}>C</span>
              </span>
              <span className={s.footerBrandName}>OC Advogados</span>
            </div>
            <p className={s.footerTag}>
              Especialistas em concessão e revisão de benefícios
              previdenciários, direito trabalhista e civil. Atendimento
              humanizado, resultados concretos.
            </p>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={s.footerSocial}
            >
              <i className="bi bi-instagram" aria-hidden />
              <span>
                <span className={s.footerSocialHandle}>
                  {INSTAGRAM_HANDLE}
                </span>
                <span className={s.footerSocialCount}>
                  460 mil seguidores
                </span>
              </span>
            </a>
          </div>

          {/* Column 2: Nav */}
          <div className={s.footerCol}>
            <h4 className={s.footerHeading}>Navegação</h4>
            <ul className={s.footerLinks}>
              <li>
                <Link href="/oc-advogados" className={s.footerLink}>
                  Home
                </Link>
              </li>
              <li>
                <Link href="/oc-advogados/sobre" className={s.footerLink}>
                  Sobre
                </Link>
              </li>
              <li>
                <Link href="/oc-advogados/equipe" className={s.footerLink}>
                  Equipe
                </Link>
              </li>
              <li>
                <Link href="/oc-advogados/contato" className={s.footerLink}>
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Services */}
          <div className={s.footerCol}>
            <h4 className={s.footerHeading}>Áreas de Atuação</h4>
            <ul className={s.footerLinks}>
              {SERVICES.map((svc) => (
                <li key={svc.slug}>
                  <Link
                    href={`/oc-advogados/servicos/${svc.slug}`}
                    className={s.footerLink}
                  >
                    {svc.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className={s.footerCol}>
            <h4 className={s.footerHeading}>Contato</h4>
            <ul className={s.footerContact}>
              {hq && (
                <li className={s.footerContactItem}>
                  <i className="bi bi-geo-alt" aria-hidden />
                  <span>{hq.address}</span>
                </li>
              )}
              <li className={s.footerContactItem}>
                <i className="bi bi-whatsapp" aria-hidden />
                <a
                  href={buildWhatsAppLink(WHATSAPP_MAIN)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={s.footerLink}
                >
                  {WHATSAPP_MAIN_DISPLAY}
                </a>
              </li>
              <li className={s.footerContactItem}>
                <i className="bi bi-envelope" aria-hidden />
                <a href={`mailto:${EMAIL}`} className={s.footerLink}>
                  {EMAIL}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className={s.footerBottom}>
          <span className={s.footerCopy}>
            © 2026 OC Advogados · Todos os direitos reservados.
          </span>
          <span className={s.footerLegal}>
            Atuamos em todo Brasil · Escritórios em Ituverava, Campinas,
            Ribeirão Preto, São Paulo e Bebedouro
          </span>
        </div>
      </div>
    </footer>
  )
}

/* ══════════════════════════════════════════════════════════════
   FLOATING WHATSAPP BUTTON
   ══════════════════════════════════════════════════════════════ */
export function FloatingWhatsApp() {
  return (
    <a
      href={buildWhatsAppLink(WHATSAPP_MAIN)}
      target="_blank"
      rel="noopener noreferrer"
      className={s.floatWa}
      aria-label="Fale conosco pelo WhatsApp"
    >
      <span className={s.floatWaPulse} aria-hidden />
      <i className="bi bi-whatsapp" aria-hidden />
    </a>
  )
}

/* ══════════════════════════════════════════════════════════════
   SHARED UI HELPERS
   ══════════════════════════════════════════════════════════════ */

// Thin stone horizontal rule ("legal document divider")
export function LegalDivider() {
  return <div className={s.legalDivider} aria-hidden />
}

// Section eyebrow (uppercase stone label above H2s)
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <span className={s.eyebrow}>{children}</span>
}

/* ══════════════════════════════════════════════════════════════
   SERVICE DETAIL PAGE — Client component
   Receives fully-resolved service. Styles imported at top of file.
   ══════════════════════════════════════════════════════════════ */
export function ServicePageClient({ service }: { service: Service }) {
  const revealRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!revealRef.current) return
    const nodes = revealRef.current.querySelectorAll<HTMLElement>(
      `.${svc.reveal}`
    )
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(svc.revealVisible)
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    )
    nodes.forEach((n) => io.observe(n))
    return () => io.disconnect()
  }, [])

  const others = SERVICES.filter((s) => s.slug !== service.slug)
  const index =
    SERVICES.findIndex((s) => s.slug === service.slug) + 1
  const total = SERVICES.length
  const pad = (n: number) => n.toString().padStart(2, '0')

  const whatsappMsg = `Olá! Tenho interesse no serviço "${service.name}" e gostaria de mais informações.`

  return (
    <div ref={revealRef} className={svc.root}>
      {/* ═══════════════ HERO ═══════════════ */}
      <section className={svc.hero}>
        <div className={svc.heroGlow} aria-hidden />
        <div className={svc.heroInner}>
          <div className={`${svc.breadcrumb} ${svc.reveal}`}>
            <Link href="/oc-advogados" className={svc.breadcrumbLink}>
              Home
            </Link>
            <span className={svc.breadcrumbSep} aria-hidden>
              /
            </span>
            <span className={svc.breadcrumbCurrent}>Serviços</span>
            <span className={svc.breadcrumbSep} aria-hidden>
              /
            </span>
            <span className={svc.breadcrumbCurrent}>
              {service.shortName}
            </span>
          </div>

          <span className={`${svc.eyebrow} ${svc.reveal}`}>
            <span className={svc.eyebrowRule} aria-hidden />
            Serviço · Nº {pad(index)} / {pad(total)}
          </span>

          <div className={`${svc.heroIconWrap} ${svc.reveal}`}>
            <i className={`bi ${service.icon}`} aria-hidden />
          </div>

          <h1 className={`${svc.h1} ${svc.reveal}`}>
            {service.name}
          </h1>

          <p className={`${svc.heroTagline} ${svc.reveal}`}>
            {service.tagline}
          </p>

          <div className={`${svc.heroActions} ${svc.reveal}`}>
            <a
              href={buildWhatsAppLink(WHATSAPP_MAIN, whatsappMsg)}
              target="_blank"
              rel="noopener noreferrer"
              className={svc.ctaPrimary}
            >
              <i className="bi bi-whatsapp" aria-hidden />
              Falar com um Especialista
            </a>
            <Link href="/oc-advogados/contato" className={svc.ctaGhost}>
              <i className="bi bi-geo-alt" aria-hidden />
              Ver unidades
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════ BODY ═══════════════ */}
      <section className={svc.section}>
        <div className={svc.container}>
          <div className={svc.bodyGrid}>
            <aside className={`${svc.bodySidebar} ${svc.reveal}`}>
              <span className={svc.sidebarEyebrow}>
                Sobre este serviço
              </span>
              <h2 className={svc.sidebarTitle}>
                O que é <em>{service.shortName}</em>?
              </h2>
              <div className={svc.sidebarRule} aria-hidden />
              <p className={svc.sidebarBody}>{service.description}</p>
            </aside>

            <div className={svc.bodyContent}>
              {service.paragraphs.map((p, i) => (
                <p
                  key={i}
                  className={`${svc.bodyP} ${svc.reveal}`}
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  {p}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className={svc.sectionRule} aria-hidden />

      {/* ═══════════════ ELIGIBILITY ═══════════════ */}
      <section className={svc.section}>
        <div className={svc.container}>
          <div className={`${svc.eligibility} ${svc.reveal}`}>
            <div className={svc.eligibilityGlow} aria-hidden />
            <div className={svc.eligibilityHead}>
              <span className={svc.eligibilityIcon}>
                <i className="bi bi-patch-check" aria-hidden />
              </span>
              <span className={svc.eligibilityEyebrow}>
                Elegibilidade
              </span>
            </div>
            <h2 className={svc.eligibilityTitle}>
              Quem tem <em>direito</em>?
            </h2>
            <p className={svc.eligibilityText}>{service.eligibility}</p>
            <a
              href={buildWhatsAppLink(WHATSAPP_MAIN, whatsappMsg)}
              target="_blank"
              rel="noopener noreferrer"
              className={svc.eligibilityCta}
            >
              <i className="bi bi-whatsapp" aria-hidden />
              Consultar minha situação
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════ CTA BIG ═══════════════ */}
      <section className={svc.section}>
        <div className={svc.container}>
          <div className={`${svc.ctaBig} ${svc.reveal}`}>
            <div className={svc.ctaBigGlow} aria-hidden />
            <span className={svc.eyebrow}>
              <span className={svc.eyebrowRule} aria-hidden />
              Próximo passo
            </span>
            <h2 className={svc.ctaBigTitle}>
              Pronto para <em>começar</em>?
            </h2>
            <p className={svc.ctaBigLede}>
              Envie uma mensagem no WhatsApp e nossa equipe avalia seu
              caso com atenção — sem compromisso.
            </p>
            <a
              href={buildWhatsAppLink(WHATSAPP_MAIN, whatsappMsg)}
              target="_blank"
              rel="noopener noreferrer"
              className={svc.ctaPrimary}
            >
              <i className="bi bi-whatsapp" aria-hidden />
              Falar com um Especialista
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════ OTHER SERVICES ═══════════════ */}
      <section className={svc.section}>
        <div className={svc.container}>
          <header className={`${svc.sectionHead} ${svc.reveal}`}>
            <span className={svc.eyebrow}>
              <span className={svc.eyebrowRule} aria-hidden />
              Outros serviços
            </span>
            <h2 className={svc.h2}>
              Como podemos <em>ajudar mais</em>?
            </h2>
          </header>

          <div className={svc.othersGrid}>
            {others.map((o, i) => (
              <Link
                key={o.slug}
                href={`/oc-advogados/servicos/${o.slug}`}
                className={`${svc.otherCard} ${svc.reveal}`}
                style={{ transitionDelay: `${i * 70}ms` }}
              >
                <div className={svc.otherIcon}>
                  <i className={`bi ${o.icon}`} aria-hidden />
                </div>
                <h3 className={svc.otherName}>{o.name}</h3>
                <p className={svc.otherTag}>{o.tagline}</p>
                <span className={svc.otherAction}>
                  Saiba mais
                  <i className="bi bi-arrow-right" aria-hidden />
                </span>
              </Link>
            ))}
          </div>

          <div className={svc.backLinkWrap}>
            <Link href="/oc-advogados" className={svc.backLink}>
              <i className="bi bi-arrow-left" aria-hidden />
              Voltar para a página inicial
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

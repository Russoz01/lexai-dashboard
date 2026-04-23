'use client'

import { useEffect, useRef } from 'react'
import {
  WHATSAPP_MAIN,
  WHATSAPP_MAIN_DISPLAY,
  OFFICES,
  EMAIL,
  INSTAGRAM_URL,
  INSTAGRAM_HANDLE,
  buildWhatsAppLink,
  buildMapsLink,
} from '../components'
import s from './page.module.css'

export default function OcContactPage() {
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
      { threshold: 0.1, rootMargin: '0px 0px -6% 0px' }
    )
    nodes.forEach((n) => io.observe(n))
    return () => io.disconnect()
  }, [])

  return (
    <div ref={revealRef} className={s.root}>
      {/* ═══════════════ HERO ═══════════════ */}
      <section className={s.hero}>
        <div className={s.heroGlow} aria-hidden />
        <div className={s.heroInner}>
          <span className={`${s.eyebrow} ${s.reveal}`}>
            <span className={s.eyebrowRule} aria-hidden />
            Contato · Nº 003
          </span>
          <h1 className={`${s.h1} ${s.reveal}`}>
            Fale com a <em>OC Advogados</em>.
          </h1>
          <p className={`${s.lede} ${s.reveal}`}>
            Atendimento presencial em cinco escritórios ou remoto em
            todo Brasil. Escolha a unidade mais próxima ou envie uma
            mensagem pelo WhatsApp — nossa equipe responde com
            agilidade.
          </p>
        </div>
      </section>

      {/* ═══════════════ OFFICES GRID ═══════════════ */}
      <section className={s.section}>
        <div className={s.container}>
          <header className={`${s.sectionHead} ${s.reveal}`}>
            <span className={s.eyebrow}>
              <span className={s.eyebrowRule} aria-hidden />
              Nossas unidades
            </span>
            <h2 className={s.h2}>
              Cinco escritórios <em>em São Paulo</em>.
            </h2>
          </header>

          <div className={s.officesGrid}>
            {OFFICES.map((o, i) => (
              <article
                key={o.name}
                className={`${s.officeCard} ${o.isHq ? s.officeCardHq : ''} ${s.reveal}`}
                style={{ transitionDelay: `${(i % 2) * 90}ms` }}
              >
                {o.isHq && (
                  <span className={s.officeBadge}>Matriz</span>
                )}
                <div className={s.officeHead}>
                  <span className={s.officeIndex}>
                    0{i + 1}
                  </span>
                  <h3 className={s.officeCity}>{o.city}</h3>
                  <span className={s.officeState}>{o.state}</span>
                </div>

                <ul className={s.officeInfo}>
                  <li className={s.officeInfoItem}>
                    <i className="bi bi-geo-alt" aria-hidden />
                    <span>
                      {o.address}
                      {o.cep && (
                        <span className={s.officeCep}>
                          CEP {o.cep}
                        </span>
                      )}
                    </span>
                  </li>
                  {o.phone && (
                    <li className={s.officeInfoItem}>
                      <i className="bi bi-telephone" aria-hidden />
                      <a
                        href={`tel:+55${o.phone.replace(/\D/g, '')}`}
                        className={s.officeLink}
                      >
                        {o.phone}
                      </a>
                    </li>
                  )}
                  <li className={s.officeInfoItem}>
                    <i className="bi bi-whatsapp" aria-hidden />
                    <a
                      href={buildWhatsAppLink(
                        o.whatsappRaw,
                        `Olá! Venho do site e gostaria de atendimento na unidade ${o.city}.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={s.officeLink}
                    >
                      {o.whatsapp}
                    </a>
                  </li>
                </ul>

                <div className={s.officeActions}>
                  <a
                    href={buildWhatsAppLink(
                      o.whatsappRaw,
                      `Olá! Venho do site e gostaria de atendimento na unidade ${o.city}.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={s.officeCtaWa}
                  >
                    <i className="bi bi-whatsapp" aria-hidden />
                    WhatsApp da unidade
                  </a>
                  <a
                    href={buildMapsLink(o.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={s.officeCtaMaps}
                  >
                    <i className="bi bi-map" aria-hidden />
                    Abrir no Maps
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className={s.sectionRule} aria-hidden />

      {/* ═══════════════ ADDITIONAL CONTACT ═══════════════ */}
      <section className={s.section}>
        <div className={s.container}>
          <header className={`${s.sectionHead} ${s.reveal}`}>
            <span className={s.eyebrow}>
              <span className={s.eyebrowRule} aria-hidden />
              Outros canais
            </span>
            <h2 className={s.h2}>
              Prefere outro <em>canal de contato?</em>
            </h2>
          </header>

          <div className={s.channelsGrid}>
            <a
              href={`mailto:${EMAIL}`}
              className={`${s.channelCard} ${s.reveal}`}
            >
              <div className={s.channelIcon}>
                <i className="bi bi-envelope" aria-hidden />
              </div>
              <span className={s.channelLabel}>E-mail</span>
              <span className={s.channelValue}>{EMAIL}</span>
              <span className={s.channelAction}>
                Abrir e-mail
                <i className="bi bi-arrow-up-right" aria-hidden />
              </span>
            </a>

            <a
              href={buildWhatsAppLink(WHATSAPP_MAIN)}
              target="_blank"
              rel="noopener noreferrer"
              className={`${s.channelCard} ${s.reveal}`}
              style={{ transitionDelay: '90ms' }}
            >
              <div className={s.channelIcon}>
                <i className="bi bi-whatsapp" aria-hidden />
              </div>
              <span className={s.channelLabel}>WhatsApp Principal</span>
              <span className={s.channelValue}>
                {WHATSAPP_MAIN_DISPLAY}
              </span>
              <span className={s.channelAction}>
                Enviar mensagem
                <i className="bi bi-arrow-up-right" aria-hidden />
              </span>
            </a>

            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`${s.channelCard} ${s.reveal}`}
              style={{ transitionDelay: '180ms' }}
            >
              <div className={s.channelIcon}>
                <i className="bi bi-instagram" aria-hidden />
              </div>
              <span className={s.channelLabel}>Instagram</span>
              <span className={s.channelValue}>
                {INSTAGRAM_HANDLE}
              </span>
              <span className={s.channelAction}>
                460 mil seguidores
                <i className="bi bi-arrow-up-right" aria-hidden />
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════ FINAL CTA ═══════════════ */}
      <section className={s.section}>
        <div className={s.container}>
          <div className={`${s.finalCta} ${s.reveal}`}>
            <div className={s.finalCtaGlow} aria-hidden />
            <h2 className={s.finalCtaTitle}>
              Prefere atendimento <em>remoto</em>?
              <br />
              Sem problema.
            </h2>
            <p className={s.finalCtaLede}>
              Atendemos clientes em todo Brasil por vias remotas, com o
              mesmo cuidado e acompanhamento próximo do atendimento
              presencial.
            </p>
            <a
              href={buildWhatsAppLink(WHATSAPP_MAIN)}
              target="_blank"
              rel="noopener noreferrer"
              className={s.ctaPrimary}
            >
              <i className="bi bi-whatsapp" aria-hidden />
              Fale pelo WhatsApp Principal
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

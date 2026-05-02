'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import {
  WHATSAPP_MAIN,
  PRACTICE_AREAS,
  OFFICES,
  INSTAGRAM_URL,
  buildWhatsAppLink,
} from '../components'
import s from './page.module.css'

export default function OcAboutPage() {
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
      { threshold: 0.14, rootMargin: '0px 0px -6% 0px' }
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
            Sobre nós · Nº 001
          </span>
          <h1 className={`${s.h1} ${s.reveal}`}>
            Advocacia com <em>propósito</em> e presença.
          </h1>
          <p className={`${s.lede} ${s.reveal}`}>
            A OC Advogados é um escritório especializado em Direito
            Previdenciário, Cível e Trabalhista. Mais de dez advogados,
            cinco escritórios no estado de São Paulo e atuação em todo
            Brasil — sempre com o mesmo compromisso: cuidar do seu caso
            com técnica e humanidade.
          </p>
        </div>
      </section>

      {/* ═══════════════ MISSION / NARRATIVE ═══════════════ */}
      <section className={s.section}>
        <div className={s.container}>
          <div className={s.narrative}>
            <div className={`${s.narrativeBlock} ${s.reveal}`}>
              <span className={s.eyebrow}>
                <span className={s.eyebrowRule} aria-hidden />
                Missão
              </span>
              <h2 className={s.h2}>
                Proteger <em>o que é seu</em> com serenidade e técnica.
              </h2>
            </div>
            <div className={s.narrativeBody}>
              <p className={`${s.p} ${s.reveal}`}>
                Nosso trabalho existe para pessoas que enfrentam um
                dos momentos mais delicados da vida: o pedido de um
                benefício negado, uma aposentadoria calculada abaixo
                do devido, um direito trabalhista não respeitado. Em
                cada um desses casos há, antes de tudo, uma história
                — e ela merece ser conduzida com seriedade.
              </p>
              <p className={`${s.p} ${s.reveal}`}>
                Somos especialistas em{' '}
                <strong>concessão e revisão de benefícios
                previdenciários, direito trabalhista e civil</strong>.
                Atuamos com atendimento humanizado e eficaz,
                explicando cada etapa do processo em linguagem clara,
                sem jargões desnecessários e sem promessas que não
                podemos cumprir.
              </p>
              <p className={`${s.p} ${s.reveal}`}>
                A OC foi construída sobre três valores não-negociáveis:
                técnica jurídica rigorosa, atendimento próximo e
                transparência em cada etapa. É desse tripé que nasce a
                confiança que nossos clientes depositam em nós — e é
                isso que nos move a cada manhã.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className={s.sectionRule} aria-hidden />

      {/* ═══════════════ PRACTICE AREAS EXPANDED ═══════════════ */}
      <section className={s.section}>
        <div className={s.container}>
          <header className={`${s.sectionHead} ${s.reveal}`}>
            <span className={s.eyebrow}>
              <span className={s.eyebrowRule} aria-hidden />
              Áreas de atuação
            </span>
            <h2 className={s.h2}>
              Três áreas, <em>um compromisso</em>.
            </h2>
          </header>

          <div className={s.areasList}>
            {PRACTICE_AREAS.map((area, i) => (
              <article
                key={area.name}
                className={`${s.areaRow} ${s.reveal}`}
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                <div className={s.areaIndex}>
                  <span>0{i + 1}</span>
                </div>
                <div className={s.areaBody}>
                  <div className={s.areaHead}>
                    <i className={`bi ${area.icon} ${s.areaIcon}`} aria-hidden />
                    <h3 className={s.areaTitle}>{area.name}</h3>
                    {area.primary && (
                      <span className={s.areaBadge}>
                        Especialidade
                      </span>
                    )}
                  </div>
                  <p className={s.areaDesc}>{area.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className={s.sectionRule} aria-hidden />

      {/* ═══════════════ NATIONAL SCOPE ═══════════════ */}
      <section className={s.section}>
        <div className={s.container}>
          <div className={s.scopeGrid}>
            <div className={`${s.scopeContent} ${s.reveal}`}>
              <span className={s.eyebrow}>
                <span className={s.eyebrowRule} aria-hidden />
                Presença nacional
              </span>
              <h2 className={s.h2}>
                Cinco escritórios, <em>um Brasil inteiro</em>.
              </h2>
              <p className={s.p}>
                Mantemos unidades físicas em cinco cidades do estado de
                São Paulo — Ituverava (matriz), Campinas, Ribeirão
                Preto, São Paulo e Bebedouro — e atendemos clientes em
                todo o território brasileiro, presencialmente ou por
                vias remotas.
              </p>
              <p className={s.p}>
                Essa capilaridade permite que casos sejam acompanhados
                de perto, com deslocamentos reduzidos para o cliente e
                agilidade processual nas regiões onde estamos presentes.
              </p>
              <Link href="/oc-advogados/contato" className={s.inlineLink}>
                Ver endereços e contatos
                <i className="bi bi-arrow-right" aria-hidden />
              </Link>
            </div>

            <ul className={`${s.cityList} ${s.reveal}`}>
              {OFFICES.map((o, i) => (
                <li key={o.name} className={s.cityItem}>
                  <span className={s.cityNum}>0{i + 1}</span>
                  <div className={s.cityBody}>
                    <span className={s.cityName}>
                      {o.city}
                      {o.isHq && (
                        <span className={s.cityHq}>matriz</span>
                      )}
                    </span>
                    <span className={s.cityMeta}>
                      {o.state} · {o.whatsapp}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div className={s.sectionRule} aria-hidden />

      {/* ═══════════════ INSTAGRAM SOCIAL PROOF ═══════════════ */}
      <section className={s.section}>
        <div className={s.container}>
          <div className={`${s.igCard} ${s.reveal}`}>
            <div className={s.igGlow} aria-hidden />
            <span className={s.eyebrow}>
              <span className={s.eyebrowRule} aria-hidden />
              Comunidade
            </span>
            <h2 className={s.h2}>
              Junte-se a mais de{' '}
              <em>460 mil pessoas</em>
            </h2>
            <p className={s.p}>
              Compartilhamos conteúdo jurídico acessível no Instagram
              — dicas práticas, esclarecimentos sobre benefícios e
              atualizações em Direito Previdenciário, Trabalhista e
              Cível. Um espaço de conhecimento para quem busca
              entender seus direitos.
            </p>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={s.ctaGhost}
            >
              <i className="bi bi-instagram" aria-hidden />
              Seguir @ocadvogados
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════ FINAL CTA ═══════════════ */}
      <section className={s.section}>
        <div className={s.container}>
          <div className={`${s.finalCta} ${s.reveal}`}>
            <h2 className={s.finalCtaTitle}>
              Pronto para conversar <em>sobre o seu caso?</em>
            </h2>
            <p className={s.finalCtaLede}>
              Nossa equipe de especialistas está pronta para orientar
              você. Atendimento em todo Brasil.
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

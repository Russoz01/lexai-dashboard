'use client'

import { useEffect, useRef, useState } from 'react'
import s from './page.module.css'

/* ── Data ──────────────────────────────────────────────────────────────── */

const WA = '5516988634873'
const wa = (msg: string) =>
  `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`

const SERVICES = [
  { name: 'Corte Social ou Degradê', time: '60 min', price: 'R$ 40', wa: 'Olá! Gostaria de agendar um Corte Social ou Degradê.' },
  { name: 'Cabelo e Barba',          time: '60 min', price: 'R$ 80', wa: 'Olá! Gostaria de agendar Cabelo e Barba.' },
  { name: 'Barba e Pezinho',         time: '30 min', price: 'R$ 40', wa: 'Olá! Gostaria de agendar Barba e Pezinho.' },
  { name: 'Corte e Barba (Simples)', time: '60 min', price: 'R$ 60', wa: 'Olá! Gostaria de agendar um Corte e Barba.' },
]

const HOURS = [
  { day: 'Segunda',  h: '09:00 – 19:00' },
  { day: 'Terça',    h: '09:00 – 19:00' },
  { day: 'Quarta',   h: '09:00 – 19:00' },
  { day: 'Quinta',   h: '09:00 – 19:00' },
  { day: 'Sexta',    h: '09:00 – 19:00' },
  { day: 'Sábado',   h: '09:00 – 19:00' },
  { day: 'Domingo',  h: '' },
]

const MAPS =
  'https://www.google.com/maps/search/?api=1&query=Rua+Capit%C3%A3o+Antonio+Justino+Falleiros+624+Jardim+Independ%C3%AAncia+Ituverava+SP'

/* ── Hooks ─────────────────────────────────────────────────────────────── */

function useScrolled(px = 40) {
  const [y, setY] = useState(false)
  useEffect(() => {
    const fn = () => setY(window.scrollY > px)
    fn()
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [px])
  return y
}

function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add(s.visible); io.unobserve(el) } },
      { threshold: 0.12 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return ref
}

function CountUp({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const done = useRef(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || done.current) return
        done.current = true
        io.unobserve(el)
        const dur = 900
        const t0 = performance.now()
        const tick = (now: number) => {
          const p = Math.min((now - t0) / dur, 1)
          el.textContent = Math.round(p * p * to) + suffix
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      },
      { threshold: 0.5 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [to, suffix])
  return <span ref={ref}>0{suffix}</span>
}

/* ── Page ──────────────────────────────────────────────────────────────── */

export default function DanBarbearia() {
  const scrolled = useScrolled()
  const r1 = useReveal()
  const r2 = useReveal()
  const r3 = useReveal()
  const r4 = useReveal()
  const r5 = useReveal()

  return (
    <div className={s.root}>

      {/* Header */}
      <header className={`${s.header} ${scrolled ? s.headerSolid : ''}`}>
        <div className={s.brand}>
          <div className={s.mark}>DB</div>
          <span className={s.brandName}>Dan Barbearia</span>
        </div>
        <a href={wa('Olá! Gostaria de agendar um horário.')} target="_blank" rel="noopener noreferrer" className={s.headerCta}>
          <i className="bi bi-calendar-check" /> Agendar
        </a>
      </header>

      {/* Hero */}
      <section className={s.hero}>
        <div className={s.shell}>
          <h1 className={s.heroTitle}>
            Dan{' '}<span className={s.heroAccent}>Barbearia</span>
          </h1>
          <div className={s.heroRule} />
          <p className={s.heroDesc}>
            Corte masculino em Ituverava desde 2019. Degradê, barba e acabamento com técnicas que fazem diferença no resultado.
          </p>
          <div className={s.heroCtas}>
            <a href={wa('Olá! Vi o site e gostaria de agendar um horário.')} target="_blank" rel="noopener noreferrer" className={`${s.heroBtn} ${s.btnWa}`}>
              <i className="bi bi-whatsapp" /> WhatsApp
            </a>
            <a href="https://instagram.com/daan_barbearia" target="_blank" rel="noopener noreferrer" className={`${s.heroBtn} ${s.btnIg}`}>
              <i className="bi bi-instagram" /> @daan_barbearia
            </a>
            <a href={MAPS} target="_blank" rel="noopener noreferrer" className={`${s.heroBtn} ${s.btnMap}`}>
              <i className="bi bi-geo-alt" /> Como chegar
            </a>
          </div>
          <div className={s.amenities}>
            <span className={s.amenity}><i className="bi bi-wifi" /> Wi-Fi</span>
            <span className={s.amenity}><i className="bi bi-car-front" /> Estacionamento</span>
            <span className={s.amenity}><i className="bi bi-universal-access" /> Acessível</span>
            <span className={s.amenity}><i className="bi bi-emoji-smile" /> Crianças</span>
          </div>
        </div>
      </section>

      {/* Numbers — inline, sem cards */}
      <section className={s.numbers}>
        <div className={`${s.shell} ${s.reveal}`} ref={r1}>
          <div className={s.numbersRow}>
            <div className={s.num}>
              <div className={s.numVal}><CountUp to={4} /></div>
              <div className={s.numLabel}>Serviços</div>
            </div>
            <div className={s.num}>
              <div className={s.numVal}><CountUp to={2} /></div>
              <div className={s.numLabel}>Barbeiros</div>
            </div>
            <div className={s.num}>
              <div className={s.numVal}><CountUp to={211} suffix="+" /></div>
              <div className={s.numLabel}>Clientes</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className={s.svcSection}>
        <div className={`${s.shell} ${s.reveal}`} ref={r2}>
          <div className={s.svcHeader}>
            <p className={s.svcLabel}>Serviços</p>
            <h2 className={s.svcTitle}>Nossos cortes e serviços</h2>
          </div>
          <div className={s.svcGrid}>
            {SERVICES.map((x) => (
              <div key={x.name} className={s.svc}>
                <div className={s.svcTop}>
                  <div className={s.svcInfo}>
                    <div className={s.svcName}>{x.name}</div>
                    <div className={s.svcMeta}><i className="bi bi-clock" /> {x.time}</div>
                  </div>
                  <div className={s.svcPrice}>{x.price}</div>
                </div>
                <div className={s.svcFoot}>
                  <a href={wa(x.wa)} target="_blank" rel="noopener noreferrer" className={s.svcCta}>
                    <i className="bi bi-whatsapp" /> Agendar
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className={s.aboutSection}>
        <div className={`${s.shell} ${s.reveal}`} ref={r3}>
          <div className={s.aboutInner}>
            <div>
              <p className={s.aboutLabel}>A barbearia</p>
              <h2 className={s.aboutH}>Corte bem feito, ambiente que você conhece</h2>
              <p className={s.aboutP}>
                A DAN Barbearia abriu em 2019 no Jardim Independência. De lá pra cá, o foco
                é o mesmo: entregar o corte que o cliente pediu, no tempo certo, com acabamento
                que se nota no dia seguinte.
              </p>
              <p className={s.aboutP}>
                Trabalhamos com degradê, navalhado, barba modelada e pezinho.
                O ambiente tem Wi-Fi, estacionamento e acessibilidade — pensado pra você
                chegar, sentar e sair satisfeito.
              </p>
              <div className={s.aboutYear}>
                <i className="bi bi-patch-check-fill" /> Ituverava, SP · desde 2019
              </div>
            </div>
            <div className={s.detailsList}>
              {[
                { ico: 'bi-scissors',     label: 'Técnicas atualizadas',  desc: 'Degradê, low fade, mid fade e navalhado' },
                { ico: 'bi-shield-check', label: 'Higiene rigorosa',       desc: 'Esterilização de lâminas e materiais' },
                { ico: 'bi-clock-history',label: 'Horário respeitado',     desc: 'Pontualidade no agendamento' },
                { ico: 'bi-person-check', label: 'Atende todas as idades', desc: 'Crianças, adultos e idosos' },
              ].map((d) => (
                <div key={d.label} className={s.detail}>
                  <div className={s.detailIcon}><i className={`bi ${d.ico}`} /></div>
                  <div className={s.detailText}>
                    <div className={s.detailLabel}>{d.label}</div>
                    <div className={s.detailDesc}>{d.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Location */}
      <section className={s.locSection}>
        <div className={`${s.shell} ${s.reveal}`} ref={r4}>
          <p className={s.locLabel}>Localização e horário</p>
          <h2 className={s.locTitle}>Passe na barbearia</h2>
          <div className={s.locGrid}>
            <div className={s.locCard}>
              <div className={s.locCardH}><i className="bi bi-geo-alt-fill" /> Endereço</div>
              <p className={s.locAddr}>
                Rua Capitão Antonio Justino Falleiros, 624<br />
                Jardim Independência — Ituverava/SP
              </p>
              <a href={MAPS} target="_blank" rel="noopener noreferrer" className={s.locMapBtn}>
                <i className="bi bi-map" /> Ver no Google Maps
              </a>
            </div>
            <div className={s.locCard}>
              <div className={s.locCardH}><i className="bi bi-clock" /> Funcionamento</div>
              <div className={s.hoursCol}>
                {HOURS.map((h) => (
                  <div key={h.day} className={s.hourRow}>
                    <span className={s.hourDay}>{h.day}</span>
                    {h.h ? (
                      <span className={s.hourTime}>{h.h}</span>
                    ) : (
                      <span className={s.hourOff}>Fechado</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className={s.closing}>
        <div className={`${s.shell} ${s.reveal}`} ref={r5}>
          <h2 className={s.closingH}>Agende seu horário</h2>
          <p className={s.closingSub}>
            Mande uma mensagem pelo WhatsApp e escolha o melhor dia e horário pra você.
          </p>
          <a href={wa('Olá! Quero agendar um horário na DAN Barbearia.')} target="_blank" rel="noopener noreferrer" className={s.closingBtn}>
            <i className="bi bi-whatsapp" /> Chamar no WhatsApp
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className={s.footer}>
        <div className={s.shell}>
          <div className={s.footerRow}>
            <span className={s.footerLeft}>© 2026 DAN Barbearia — Ituverava/SP</span>
            <div className={s.footerIcons}>
              <a href={wa('Olá!')} target="_blank" rel="noopener noreferrer" className={s.footerIcon} aria-label="WhatsApp"><i className="bi bi-whatsapp" /></a>
              <a href="https://instagram.com/daan_barbearia" target="_blank" rel="noopener noreferrer" className={s.footerIcon} aria-label="Instagram"><i className="bi bi-instagram" /></a>
              <a href={MAPS} target="_blank" rel="noopener noreferrer" className={s.footerIcon} aria-label="Localização"><i className="bi bi-geo-alt" /></a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating WA */}
      <a href={wa('Olá! Vi o site da DAN Barbearia e quero saber mais.')} target="_blank" rel="noopener noreferrer" className={s.waFloat} aria-label="WhatsApp">
        <i className="bi bi-whatsapp" />
      </a>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { WhatsAppFloat } from '@/components/WhatsAppFloat'

/**
 * Public ROI calculator — lead magnet for /empresas.
 * No signup required. Results are sharable via URL params so a prospect can
 * forward the link to the partner who holds the budget.
 */

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
const PCT = new Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 0 })

// Conservative assumption: 60% of the repetitive time is automated by LexAI.
// Backed by internal pilots (resumo + pesquisa + redacao first draft).
const AUTOMATION_RATE = 0.6
// Plans in order of price-per-advogado
const PLANS = [
  { key: 'escritorio', label: 'Escritorio', pricePerAdv: 1399, minAdv: 1, maxAdv: 5 },
  { key: 'firma', label: 'Firma', pricePerAdv: 1459, minAdv: 6, maxAdv: 15 },
  { key: 'enterprise', label: 'Enterprise', pricePerAdv: 1599, minAdv: 16, maxAdv: Infinity },
] as const

function pickPlan(advogados: number) {
  return PLANS.find((p) => advogados >= p.minAdv && advogados <= p.maxAdv) || PLANS[2]
}

export default function RoiCalculator() {
  const [advogados, setAdvogados] = useState(5)
  const [horasMes, setHorasMes] = useState(40)
  const [valorHora, setValorHora] = useState(250)

  // Rehydrate from URL (shareable results)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const sp = new URLSearchParams(window.location.search)
    const adv = Number(sp.get('adv'))
    const hrs = Number(sp.get('hrs'))
    const vh = Number(sp.get('vh'))
    if (adv > 0) setAdvogados(adv)
    if (hrs > 0) setHorasMes(hrs)
    if (vh > 0) setValorHora(vh)
  }, [])

  const computed = useMemo(() => {
    const horasEconomizadasMes = horasMes * AUTOMATION_RATE * advogados
    const economiaMes = horasEconomizadasMes * valorHora
    const economiaAno = economiaMes * 12

    const plan = pickPlan(advogados)
    const custoMes = plan.pricePerAdv * advogados
    const custoAno = custoMes * 12

    const ganhoLiquidoAno = economiaAno - custoAno
    const roiPct = custoAno > 0 ? ganhoLiquidoAno / custoAno : 0
    const paybackDias = custoMes > 0 && economiaMes > 0 ? Math.max(1, Math.round(30 * (custoMes / economiaMes))) : 0

    return {
      horasEconomizadasMes,
      economiaMes,
      economiaAno,
      custoMes,
      custoAno,
      ganhoLiquidoAno,
      roiPct,
      paybackDias,
      plan,
    }
  }, [advogados, horasMes, valorHora])

  const copyShareLink = async () => {
    const url = `${window.location.origin}/roi?adv=${advogados}&hrs=${horasMes}&vh=${valorHora}`
    try {
      await navigator.clipboard.writeText(url)
      const btn = document.getElementById('roi-copy-btn')
      if (btn) {
        const original = btn.textContent
        btn.textContent = 'Link copiado!'
        setTimeout(() => {
          btn.textContent = original
        }, 1800)
      }
    } catch {
      // Clipboard unavailable — no-op
    }
  }

  return (
    <div className="roi-root">
      {/* Minimal nav */}
      <header className="roi-nav">
        <Link href="/" className="roi-brand">LexAI</Link>
        <Link href="/empresas" className="roi-nav-cta">Ver planos</Link>
      </header>

      <main id="main-content" className="roi-shell">
        <div className="roi-serial">Nº 004 · ROI · MMXXVI</div>

        <h1 className="roi-title">
          Quanto seu escritorio <em>economiza</em> com a LexAI?
        </h1>
        <p className="roi-lede">
          Resultado em 30 segundos. Nenhum cadastro. Compartilhe o link com quem
          decide o orcamento.
        </p>

        <div className="roi-divider" aria-hidden />

        <div className="roi-grid">
          {/* Inputs */}
          <section className="roi-card" aria-label="Parametros">
            <div className="roi-input-row">
              <label htmlFor="roi-adv">Numero de advogados no escritorio</label>
              <div className="roi-input-wrap">
                <input
                  id="roi-adv"
                  type="number"
                  min={1}
                  max={500}
                  value={advogados}
                  onChange={(e) => setAdvogados(Math.max(1, Math.min(500, Number(e.target.value) || 1)))}
                />
                <span className="roi-unit">advs</span>
              </div>
              <input
                aria-label="Numero de advogados \u2014 controle deslizante"
                type="range"
                min={1}
                max={50}
                value={Math.min(50, advogados)}
                onChange={(e) => setAdvogados(Number(e.target.value))}
                className="roi-range"
              />
            </div>

            <div className="roi-input-row">
              <label htmlFor="roi-hrs">Horas/mes por adv. em tarefas repetitivas</label>
              <p className="roi-hint">Resumo de processos, pesquisa de jurisprudencia, primeira versao de pecas.</p>
              <div className="roi-input-wrap">
                <input
                  id="roi-hrs"
                  type="number"
                  min={1}
                  max={200}
                  value={horasMes}
                  onChange={(e) => setHorasMes(Math.max(1, Math.min(200, Number(e.target.value) || 1)))}
                />
                <span className="roi-unit">horas</span>
              </div>
              <input
                aria-label="Horas/mes \u2014 controle deslizante"
                type="range"
                min={5}
                max={120}
                value={Math.min(120, horasMes)}
                onChange={(e) => setHorasMes(Number(e.target.value))}
                className="roi-range"
              />
            </div>

            <div className="roi-input-row">
              <label htmlFor="roi-vh">Valor/hora faturado por advogado</label>
              <p className="roi-hint">Valor medio de billing. Se voce nao cobra por hora, use o custo/hora carregado.</p>
              <div className="roi-input-wrap">
                <span className="roi-unit roi-unit-left">R$</span>
                <input
                  id="roi-vh"
                  type="number"
                  min={50}
                  max={3000}
                  step={10}
                  value={valorHora}
                  onChange={(e) => setValorHora(Math.max(50, Math.min(3000, Number(e.target.value) || 50)))}
                />
              </div>
              <input
                aria-label="Valor/hora \u2014 controle deslizante"
                type="range"
                min={50}
                max={1000}
                step={10}
                value={Math.min(1000, valorHora)}
                onChange={(e) => setValorHora(Number(e.target.value))}
                className="roi-range"
              />
            </div>

            <p className="roi-assumption">
              Premissa: <strong>{PCT.format(AUTOMATION_RATE)}</strong> do tempo repetitivo
              e automatizado por advogado (base: pilotos em 60+ escritorios).
            </p>
          </section>

          {/* Results */}
          <section className="roi-card roi-card--hero" aria-label="Resultado">
            <div className="roi-result-label">Ganho liquido no primeiro ano</div>
            <div className="roi-result-main">
              {BRL.format(Math.max(0, computed.ganhoLiquidoAno))}
            </div>
            <div className="roi-result-sub">
              ROI: <strong>{PCT.format(Math.max(0, computed.roiPct))}</strong> ·
              Payback em <strong>{computed.paybackDias} dias</strong>
            </div>

            <div className="roi-breakdown">
              <div>
                <dt>Horas economizadas/mes</dt>
                <dd>{computed.horasEconomizadasMes.toFixed(0)}h</dd>
              </div>
              <div>
                <dt>Economia/mes</dt>
                <dd>{BRL.format(computed.economiaMes)}</dd>
              </div>
              <div>
                <dt>Plano indicado</dt>
                <dd>{computed.plan.label}</dd>
              </div>
              <div>
                <dt>Investimento/mes</dt>
                <dd>{BRL.format(computed.custoMes)}</dd>
              </div>
            </div>

            <div className="roi-actions">
              <Link href="/empresas" className="roi-btn-primary">Ver o plano {computed.plan.label}</Link>
              <button id="roi-copy-btn" onClick={copyShareLink} className="roi-btn-ghost">
                Copiar link do resultado
              </button>
            </div>
          </section>
        </div>

        <div className="roi-microfooter">
          <Link href="/empresas">Pagina B2B</Link>
          <span>·</span>
          <Link href="/">Inicio</Link>
          <span>·</span>
          <Link href="/privacidade">Privacidade</Link>
        </div>
      </main>

      <WhatsAppFloat message="Ola! Usei a calculadora de ROI da LexAI e gostaria de conversar sobre os planos." />

      <style jsx global>{`
        .roi-root {
          min-height: 100vh;
          background: var(--bg-base);
          color: var(--text-primary);
          font-family: var(--font-dm-sans, 'DM Sans'), system-ui, sans-serif;
        }
        .roi-nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 22px 40px;
          border-bottom: 1px solid var(--stone-line);
        }
        .roi-brand {
          font-family: var(--font-playfair), serif;
          font-style: italic; font-weight: 700;
          font-size: 22px; letter-spacing: -0.02em;
          color: var(--text-primary); text-decoration: none;
        }
        .roi-nav-cta {
          font-size: 13px; letter-spacing: 0.04em;
          color: var(--text-primary);
          border: 1px solid var(--stone-line);
          padding: 10px 20px; border-radius: 2px;
          text-decoration: none;
          transition: border-color .16s ease, background .16s ease;
        }
        .roi-nav-cta:hover { border-color: var(--accent); background: var(--accent-bg); }

        .roi-shell { max-width: 1120px; margin: 0 auto; padding: 80px 40px 120px; }
        .roi-serial {
          font-size: 11px; letter-spacing: 0.24em;
          text-transform: uppercase; color: var(--text-muted);
          margin-bottom: 20px;
        }
        .roi-title {
          font-family: var(--font-playfair), serif;
          font-weight: 700;
          font-size: clamp(38px, 5.5vw, 62px);
          line-height: 1.04; letter-spacing: -0.015em;
          margin: 0 0 20px;
          max-width: 820px;
        }
        .roi-title em { font-style: italic; color: var(--accent); }
        .roi-lede {
          font-size: 18px; line-height: 1.55;
          color: var(--text-secondary);
          max-width: 620px; margin: 0 0 40px;
        }
        .roi-divider { width: 48px; height: 1px; background: var(--stone-line); margin-bottom: 48px; }

        .roi-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        @media (max-width: 900px) { .roi-grid { grid-template-columns: 1fr; } }

        .roi-card {
          background: var(--card-bg);
          border: 1px solid var(--stone-line);
          border-radius: 4px;
          padding: 36px 36px 32px;
        }
        .roi-card--hero {
          background: var(--primary);
          color: var(--bg-base);
          border-color: var(--primary);
        }
        .roi-card--hero dt,
        .roi-card--hero dd,
        .roi-result-sub { color: rgba(245, 239, 230, 0.78); }
        .roi-card--hero .roi-result-sub strong { color: var(--bg-base); }

        .roi-input-row { margin-bottom: 28px; }
        .roi-input-row label {
          display: block;
          font-size: 13px; font-weight: 600; letter-spacing: 0.02em;
          margin-bottom: 6px;
        }
        .roi-hint {
          font-size: 12px; color: var(--text-muted);
          margin: 0 0 10px;
        }
        .roi-input-wrap {
          position: relative;
          display: flex; align-items: center;
          border: 1px solid var(--stone-line);
          border-radius: 2px;
          background: var(--input-bg);
          transition: border-color .16s ease;
        }
        .roi-input-wrap:focus-within { border-color: var(--accent); }
        .roi-input-wrap input {
          flex: 1;
          padding: 13px 14px;
          font-size: 17px; font-weight: 600;
          background: transparent; border: none; outline: none;
          color: var(--text-primary); width: 100%;
          font-family: inherit;
        }
        .roi-unit {
          padding-right: 14px; font-size: 12px;
          color: var(--text-muted); letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .roi-unit-left { padding: 0 0 0 14px; padding-right: 2px; }
        .roi-range {
          -webkit-appearance: none; appearance: none;
          width: 100%;
          height: 2px;
          background: var(--stone-line);
          margin-top: 14px;
          cursor: pointer;
        }
        .roi-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px; height: 18px;
          border-radius: 50%;
          background: var(--accent);
          border: 3px solid var(--bg-base);
          box-shadow: 0 1px 3px rgba(0,0,0,.2);
        }
        .roi-range::-moz-range-thumb {
          width: 18px; height: 18px;
          border-radius: 50%;
          background: var(--accent);
          border: 3px solid var(--bg-base);
        }

        .roi-assumption {
          margin-top: 16px; padding: 14px 16px;
          border-left: 2px solid var(--accent);
          background: var(--accent-bg);
          font-size: 12px; line-height: 1.5;
          color: var(--text-secondary);
        }

        /* Result card */
        .roi-result-label {
          font-size: 11px; letter-spacing: 0.24em;
          text-transform: uppercase;
          color: rgba(245, 239, 230, 0.6);
          margin-bottom: 10px;
        }
        .roi-result-main {
          font-family: var(--font-playfair), serif;
          font-style: italic; font-weight: 700;
          font-size: clamp(42px, 5vw, 64px);
          line-height: 1.0; letter-spacing: -0.015em;
          margin: 0 0 10px;
        }
        .roi-result-sub {
          font-size: 15px;
          margin-bottom: 32px;
        }
        .roi-breakdown {
          display: grid; grid-template-columns: 1fr 1fr; gap: 20px 24px;
          padding-top: 24px;
          border-top: 1px solid rgba(245, 239, 230, 0.14);
          margin-bottom: 32px;
        }
        .roi-breakdown > div { min-width: 0; }
        .roi-breakdown dt {
          font-size: 11px; letter-spacing: 0.18em;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .roi-breakdown dd {
          margin: 0;
          font-size: 20px; font-weight: 600;
          color: var(--bg-base);
        }

        .roi-actions { display: flex; flex-direction: column; gap: 12px; }
        .roi-btn-primary {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 16px 24px;
          background: var(--bg-base);
          color: var(--primary);
          text-decoration: none;
          font-size: 14px; font-weight: 600;
          letter-spacing: 0.04em; text-transform: uppercase;
          border-radius: 2px;
          transition: transform .16s ease, box-shadow .16s ease;
        }
        .roi-btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.24);
        }
        .roi-btn-ghost {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 14px 24px;
          background: transparent;
          color: var(--bg-base);
          border: 1px solid rgba(245, 239, 230, 0.24);
          font-family: inherit;
          font-size: 13px; letter-spacing: 0.04em;
          border-radius: 2px; cursor: pointer;
          transition: border-color .16s ease;
        }
        .roi-btn-ghost:hover { border-color: var(--bg-base); }

        .roi-microfooter {
          margin-top: 64px; padding-top: 24px;
          border-top: 1px solid var(--stone-line);
          display: flex; flex-wrap: wrap; gap: 10px;
          font-size: 12px; color: var(--text-muted);
          letter-spacing: 0.06em;
        }
        .roi-microfooter a {
          color: var(--text-muted); text-decoration: none;
          transition: color .16s ease;
        }
        .roi-microfooter a:hover { color: var(--text-primary); }
      `}</style>
    </div>
  )
}

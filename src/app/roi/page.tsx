'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { WhatsAppFloat } from '@/components/WhatsAppFloat'
import s from './page.module.css'

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
    <div className={s.roiRoot}>
      {/* Minimal nav */}
      <header className={s.roiNav}>
        <Link href="/" className={s.roiBrand}>LexAI</Link>
        <Link href="/empresas" className={s.roiNavCta}>Ver planos</Link>
      </header>

      <main id="main-content" className={s.roiShell}>
        <div className={s.roiSerial}>Nº 004 · ROI · MMXXVI</div>

        <h1 className={s.roiTitle}>
          Quanto seu escritorio <em>economiza</em> com a LexAI?
        </h1>
        <p className={s.roiLede}>
          Resultado em 30 segundos. Nenhum cadastro. Compartilhe o link com quem
          decide o orcamento.
        </p>

        <div className={s.roiDivider} aria-hidden />

        <div className={s.roiGrid}>
          {/* Inputs */}
          <section className={s.roiCard} aria-label="Parametros">
            <div className={s.roiInputRow}>
              <label htmlFor="roi-adv">Numero de advogados no escritorio</label>
              <div className={s.roiInputWrap}>
                <input
                  id="roi-adv"
                  type="number"
                  min={1}
                  max={500}
                  value={advogados}
                  onChange={(e) => setAdvogados(Math.max(1, Math.min(500, Number(e.target.value) || 1)))}
                />
                <span className={s.roiUnit}>advs</span>
              </div>
              <input
                aria-label="Numero de advogados \u2014 controle deslizante"
                type="range"
                min={1}
                max={50}
                value={Math.min(50, advogados)}
                onChange={(e) => setAdvogados(Number(e.target.value))}
                className={s.roiRange}
              />
            </div>

            <div className={s.roiInputRow}>
              <label htmlFor="roi-hrs">Horas/mes por adv. em tarefas repetitivas</label>
              <p className={s.roiHint}>Resumo de processos, pesquisa de jurisprudencia, primeira versao de pecas.</p>
              <div className={s.roiInputWrap}>
                <input
                  id="roi-hrs"
                  type="number"
                  min={1}
                  max={200}
                  value={horasMes}
                  onChange={(e) => setHorasMes(Math.max(1, Math.min(200, Number(e.target.value) || 1)))}
                />
                <span className={s.roiUnit}>horas</span>
              </div>
              <input
                aria-label="Horas/mes \u2014 controle deslizante"
                type="range"
                min={5}
                max={120}
                value={Math.min(120, horasMes)}
                onChange={(e) => setHorasMes(Number(e.target.value))}
                className={s.roiRange}
              />
            </div>

            <div className={s.roiInputRow}>
              <label htmlFor="roi-vh">Valor/hora faturado por advogado</label>
              <p className={s.roiHint}>Valor medio de billing. Se voce nao cobra por hora, use o custo/hora carregado.</p>
              <div className={s.roiInputWrap}>
                <span className={`${s.roiUnit} ${s.roiUnitLeft}`}>R$</span>
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
                className={s.roiRange}
              />
            </div>

            <p className={s.roiAssumption}>
              Premissa: <strong>{PCT.format(AUTOMATION_RATE)}</strong> do tempo repetitivo
              e automatizado por advogado (base: pilotos em 60+ escritorios).
            </p>
          </section>

          {/* Results */}
          <section className={`${s.roiCard} ${s.roiCardHero}`} aria-label="Resultado">
            <div className={s.roiResultLabel}>Ganho liquido no primeiro ano</div>
            <div className={s.roiResultMain}>
              {BRL.format(Math.max(0, computed.ganhoLiquidoAno))}
            </div>
            <div className={s.roiResultSub}>
              ROI: <strong>{PCT.format(Math.max(0, computed.roiPct))}</strong> ·
              Payback em <strong>{computed.paybackDias} dias</strong>
            </div>

            <div className={s.roiBreakdown}>
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

            <div className={s.roiActions}>
              <Link href="/empresas" className={s.roiBtnPrimary}>Ver o plano {computed.plan.label}</Link>
              <button id="roi-copy-btn" onClick={copyShareLink} className={s.roiBtnGhost}>
                Copiar link do resultado
              </button>
            </div>
          </section>
        </div>

        <div className={s.roiMicrofooter}>
          <Link href="/empresas">Pagina B2B</Link>
          <span>·</span>
          <Link href="/">Inicio</Link>
          <span>·</span>
          <Link href="/privacidade">Privacidade</Link>
        </div>
      </main>

      <WhatsAppFloat message="Ola! Usei a calculadora de ROI da LexAI e gostaria de conversar sobre os planos." />
    </div>
  )
}

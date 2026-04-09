/* =========================================================
   roi.js — ROI calculator
   ========================================================= */
'use strict';

function initRoiCalculator() {
  const leads  = document.getElementById('roi-leads');
  const ticket = document.getElementById('roi-ticket');
  const conv   = document.getElementById('roi-conv');
  const off    = document.getElementById('roi-off');
  if (!leads || !ticket || !conv || !off) return;

  const leadsV   = document.getElementById('roi-leads-v');
  const ticketV  = document.getElementById('roi-ticket-v');
  const convV    = document.getElementById('roi-conv-v');
  const offV     = document.getElementById('roi-off-v');
  const lossEl   = document.getElementById('roi-loss');
  const gainEl   = document.getElementById('roi-gain');
  const percentEl = document.getElementById('roi-percent');
  const paybackEl = document.getElementById('roi-payback');

  // Formatters
  function formatBRL(n) {
    n = Math.round(n);
    return 'R$ ' + n.toLocaleString('pt-BR');
  }

  // ROI logic (conservative — calibrated for small-city PME reality):
  // - Off-hour abandonment: 55% of leads who arrive outside expediente give up
  // - Current actual revenue = leads actually attended * conv% * ticket
  // - AI uplift: 1.6x conversion (capped at 22%) + captures 75% of off-hour leads
  // - Alex AI ongoing cost = R$ 1.197/mes (Pro plan)
  // - Setup unico Pro = R$ 3.997
  function update() {
    const L = parseInt(leads.value, 10);
    const T = parseInt(ticket.value, 10);
    const C = parseInt(conv.value, 10) / 100;
    const O = parseInt(off.value, 10) / 100;

    // Display values
    leadsV.textContent  = L.toLocaleString('pt-BR');
    ticketV.textContent = formatBRL(T);
    convV.textContent   = (C * 100).toFixed(0) + '%';
    offV.textContent    = (O * 100).toFixed(0) + '%';

    const offAbandonment = 0.55; // 55% abandon when outside business hours
    const aiUplift  = 1.6;
    const maxConv   = 0.22;
    const aiCapture = 0.75; // recupera 75% dos off-hour

    // Currently lost revenue
    const leadsLostOff    = L * O * offAbandonment;
    const currentAttended = L - leadsLostOff;
    const currentRevenue  = currentAttended * C * T;

    // With Alex AI
    const aiLeadsLost = L * O * (1 - aiCapture); // only small % still leaks
    const aiAttended  = L - aiLeadsLost;
    const aiConv      = Math.min(C * aiUplift, maxConv);
    const aiRevenue   = aiAttended * aiConv * T;

    const monthlyGain = Math.max(aiRevenue - currentRevenue, 0);
    const monthlyLoss = monthlyGain; // perda por nao ter Alex AI = ganho potencial

    // Annual ROI
    const aiYearCost = 1197 * 12 + 3997; // R$ 18.361
    const annualGain = monthlyGain * 12;
    const roiPct     = aiYearCost > 0 ? ((annualGain - aiYearCost) / aiYearCost) * 100 : 0;

    // Payback in days
    const dailyGain   = monthlyGain / 30;
    const totalInvest = 3997 + 1197;
    const paybackDays = dailyGain > 0 ? Math.ceil(totalInvest / dailyGain) : 0;

    // Apply with grammar
    lossEl.textContent    = formatBRL(monthlyLoss);
    gainEl.textContent    = formatBRL(aiRevenue);
    percentEl.textContent = Math.round(Math.max(roiPct, 0)).toLocaleString('pt-BR') + '%';

    let paybackText;
    if (paybackDays <= 0 || monthlyGain <= 0) {
      paybackText = 'ajuste os valores';
    } else if (paybackDays === 1) {
      paybackText = '1 dia';
    } else if (paybackDays < 365) {
      paybackText = paybackDays + ' dias';
    } else {
      paybackText = '> 1 ano';
    }
    paybackEl.textContent = paybackText;

    // Dynamic CTA: update button text with calculated loss value
    const ctaTextEl = document.querySelector('.roi-cta-dynamic .roi-cta-text');
    if (ctaTextEl) {
      if (monthlyLoss > 0) {
        ctaTextEl.textContent = 'Recuperar ' + formatBRL(monthlyLoss) + '/m\u00eas \u2192 Diagn\u00f3stico gr\u00e1tis';
      } else {
        ctaTextEl.textContent = 'Quero ver isso operando no meu negocio';
      }
    }
  }

  [leads, ticket, conv, off].forEach(function (el) {
    el.addEventListener('input', update);
  });
  update();
}

initRoiCalculator();

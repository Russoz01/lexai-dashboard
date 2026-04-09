/* =========================================================
   scarcity.js — scarcity slots copy manager
   ============================================================
   Lets us update "vagas" copy without a redeploy. The operator
   sets window.ALEX_AI_SLOTS_LEFT before main.js loads (ex.: via
   a <script> no index.html, ou futuramente via endpoint). Os
   elementos com data-slots="..." recebem a copy certa, sem que
   a gente invente um numero que nao tem fonte.

   Sem config: o texto default do HTML ja diz "Poucas vagas",
   e o bloco com numero (.urgency-count) e' escondido pra nao
   mostrar placeholder "--".
   ========================================================= */
'use strict';

function initScarcitySlots() {
  const cfg   = window.ALEX_AI_SLOTS_LEFT;
  const nodes = document.querySelectorAll('[data-slots]');
  if (!nodes.length) return;

  function fmtLine(n) {
    if (n == null || n === false) return null;
    if (n <= 0) return 'Janela atual fechada';
    if (n === 1) return 'Ultima vaga disponivel';
    if (n <= 3) return 'Poucas vagas (' + n + ')';
    return n + ' vagas disponiveis';
  }

  nodes.forEach(function (el) {
    const bucket = el.getAttribute('data-slots');
    const value  = cfg && typeof cfg === 'object' ? cfg[bucket] : undefined;

    const target = el.querySelector('[data-slots-line]');
    const numEl  = el.querySelector('[data-slots-num]');

    if (typeof value === 'number') {
      const line = fmtLine(value);
      if (target && line) target.textContent = line;
      if (numEl) {
        numEl.textContent = value < 10 ? '0' + value : String(value);
        /* reveal any parent count wrapper */
        const wrapper = numEl.closest('.urgency-count');
        if (wrapper) wrapper.style.display = '';
      }
    } else {
      /* No value for this bucket: keep the default HTML copy,
         but hide numeric placeholder so we never render "--". */
      if (numEl) {
        const wrapper2 = numEl.closest('.urgency-count');
        if (wrapper2) wrapper2.style.display = 'none';
        else numEl.style.display = 'none';
      }
    }
  });
}

initScarcitySlots();

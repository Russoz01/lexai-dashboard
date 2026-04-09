/* =========================================================
   loader.js — page loader progress bar
   ========================================================= */
'use strict';
import { noMotion } from './utils.js';
import { initScrollReveal, initTextSplit } from './animations.js';

const loader         = document.getElementById('loader');
const loaderProgress = document.getElementById('loader-progress');
const loaderPct      = document.getElementById('loader-pct');
let progress         = 0;

if (loader && loaderProgress && loaderPct) {
  const loaderTick = setInterval(function () {
    progress += Math.random() * 18;
    if (progress >= 100) {
      progress = 100;
      clearInterval(loaderTick);
      setTimeout(function () {
        loader.classList.add('done');
        setTimeout(function () {
          loader.style.display = 'none';
          initScrollReveal();
          initTextSplit();
        }, 600);
      }, 180);
    }
    loaderProgress.style.width = progress + '%';
    loaderPct.textContent = Math.floor(progress);
  }, 70);
} else {
  /* If no loader exists, init reveals immediately */
  initScrollReveal();
  initTextSplit();
}

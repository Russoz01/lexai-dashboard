/* =========================================================
   ALEX AI -- main.js  (entry point)
   Imports all feature modules. Each module handles its own
   initialisation on load; no IIFE wrapper needed in ES modules.
   ========================================================= */
'use strict';
import './modules/cursor.js';
import './modules/nav.js';
import './modules/loader.js';
import './modules/animations.js';
import './modules/interactions.js';
import './modules/roi.js';
import './modules/effects.js';
import './modules/theme.js';
import './modules/scarcity.js';

/* Service worker registration — offline support + repeat-visit cache */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

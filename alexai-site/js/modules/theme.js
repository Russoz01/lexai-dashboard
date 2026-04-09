/* =========================================================
   theme.js — light / dark / system theme toggle
   ========================================================= */
'use strict';

function initThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  const root        = document.documentElement;
  const STORAGE_KEY = 'alexai-theme';

  function getStored() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function setStored(v) {
    try { localStorage.setItem(STORAGE_KEY, v); } catch (e) {}
  }
  function currentTheme() {
    return root.getAttribute('data-theme') || 'light';
  }
  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    setStored(theme);
    btn.setAttribute('aria-label',
      theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro');
    btn.setAttribute('title',
      theme === 'dark' ? 'Tema claro' : 'Tema escuro');
    /* Dispatch custom event for other JS to react */
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: theme } }));
  }

  btn.addEventListener('click', function (e) {
    e.preventDefault();
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    /* Add a brief visual flash for feedback */
    btn.animate(
      [
        { transform: 'rotate(0deg) scale(1)' },
        { transform: 'rotate(180deg) scale(1.15)' },
        { transform: 'rotate(360deg) scale(1)' }
      ],
      { duration: 600, easing: 'cubic-bezier(.22, 1, .36, 1)' }
    );
    applyTheme(next);
  });

  /* React to OS theme change if user hasn't made an explicit choice */
  if (window.matchMedia) {
    const mql      = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = function (e) {
      if (!getStored()) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    };
    if (mql.addEventListener) mql.addEventListener('change', listener);
    else if (mql.addListener) mql.addListener(listener);
  }
}

initThemeToggle();

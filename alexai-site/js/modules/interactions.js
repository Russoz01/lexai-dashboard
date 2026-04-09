/* =========================================================
   interactions.js — FAQ, plans toggle, smooth scroll,
                     ripple, scroll-to-top, bg shift
   ========================================================= */
'use strict';
import { noMotion, prefersReducedMotion, rafThrottle } from './utils.js';

/* ============================================================
   FAQ ACCORDION
   ============================================================ */
document.querySelectorAll('.faq-item').forEach(function (item, idx) {
  const btn = item.querySelector('.faq-question');
  const ans = item.querySelector('.faq-answer');
  if (!btn) return;
  /* a11y wiring */
  btn.setAttribute('type', 'button');
  btn.setAttribute('aria-expanded', 'false');
  if (ans) {
    const ansId = 'faq-answer-' + idx;
    ans.setAttribute('id', ansId);
    ans.setAttribute('role', 'region');
    btn.setAttribute('aria-controls', ansId);
  }
  btn.addEventListener('click', function () {
    const isOpen = item.classList.contains('open');
    /* Close all */
    document.querySelectorAll('.faq-item').forEach(function (i) {
      i.classList.remove('open');
      const b = i.querySelector('.faq-question');
      if (b) b.setAttribute('aria-expanded', 'false');
    });
    /* Open clicked if it was closed */
    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

/* ── FAQ accordion smooth expand (Phase 4 version) ── */
export function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  items.forEach(function (item) {
    const q = item.querySelector('.faq-q, .faq-question');
    if (!q) return;
    q.addEventListener('click', function () {
      items.forEach(function (other) {
        if (other !== item) other.classList.remove('active');
      });
      item.classList.toggle('active');
    });
  });
}

initFAQ();

/* ============================================================
   PLANS TOGGLE
   Pricing calibrated for small-city PME reality (interior BR).
   Broken values ending in 7 for marketing psychology.
   Annual = ~20% off recurring (rounded to keep broken feel).
   - Essencial mensal: R$ 597/mes  -> anual: R$ 477/mes (economia R$ 1.440/ano)
   - Pro mensal:       R$ 1.197/mes -> anual: R$ 957/mes (economia R$ 2.880/ano)
   ============================================================ */
const pricing = {
  mensal: {
    essencial: { setup: '1.997', rec: 'R$ 597/mes', save: '' },
    pro:       { setup: '3.997', rec: 'R$ 1.197/mes', save: '' }
  },
  anual: {
    essencial: { setup: '1.997', rec: 'R$ 477/mes', save: 'Economia de R$ 1.440/ano' },
    pro:       { setup: '3.997', rec: 'R$ 957/mes', save: 'Economia de R$ 2.880/ano' }
  }
};

window.setBilling = function (type) {
  if (type !== 'mensal' && type !== 'anual') return;

  document.querySelectorAll('.ptog').forEach(function (b) {
    const active = b.dataset.billing === type;
    b.classList.toggle('ptog--on', active);
    b.setAttribute('aria-pressed', active ? 'true' : 'false');
  });

  ['essencial', 'pro'].forEach(function (plan) {
    const p       = pricing[type][plan];
    const setupEl = document.getElementById('setup-' + plan);
    const recEl   = document.getElementById('rec-' + plan);
    const saveEl  = document.getElementById('save-' + plan);

    if (setupEl) setupEl.textContent = p.setup;
    if (recEl) {
      const strong = document.createElement('strong');
      strong.textContent = p.rec;
      recEl.textContent = '';
      recEl.appendChild(strong);
      recEl.appendChild(document.createTextNode(' manutencao'));
    }
    if (saveEl) {
      saveEl.textContent = p.save || '';
      saveEl.classList.toggle('show', !!p.save && type === 'anual');
    }
  });
};

// Bind click events (replaces inline onclick)
document.querySelectorAll('.ptog').forEach(function (btn) {
  btn.addEventListener('click', function () {
    window.setBilling(btn.dataset.billing);
  });
});

/* ============================================================
   SMOOTH SCROLL
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(function (a) {
  a.addEventListener('click', function (e) {
    const href = a.getAttribute('href');
    if (href === '#') return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      const offset = target.getBoundingClientRect().top + window.scrollY - 56;
      window.scrollTo({ top: offset, behavior: noMotion ? 'auto' : 'smooth' });
    }
  });
});

/* ── Click ripple effect ── */
function initRipple() {
  const targets = document.querySelectorAll('.btn-fill, .btn-outline, .nav-cta, .plan-cta');
  targets.forEach(function (el) {
    el.addEventListener('click', function (e) {
      const rect   = el.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      const size = Math.max(rect.width, rect.height);
      ripple.style.width  = ripple.style.height = size + 'px';
      ripple.style.left   = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top    = (e.clientY - rect.top  - size / 2) + 'px';
      el.appendChild(ripple);
      setTimeout(function () { ripple.remove(); }, 700);
    });
  });
}
initRipple();

/* ── Scroll to top floating button ── */
function initScrollTop() {
  const btn = document.createElement('button');
  btn.id = 'scroll-top';
  btn.setAttribute('aria-label', 'Voltar ao topo');
  btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  document.body.appendChild(btn);
  function toggle() {
    if (window.scrollY > window.innerHeight) btn.classList.add('visible');
    else btn.classList.remove('visible');
  }
  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  window.addEventListener('scroll', rafThrottle(toggle), { passive: true });
  toggle();
}
initScrollTop();

/* ── Dynamic bg color shift based on scroll ── */
export function initBgShift() {
  if (prefersReducedMotion()) return;
  const sections = document.querySelectorAll('.section--dark, .section--dark-alt');
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        document.body.classList.add('body-dark');
      } else {
        if (document.querySelectorAll('.section--dark.is-active, .section--dark-alt.is-active').length === 0) {
          document.body.classList.remove('body-dark');
        }
      }
    });
  }, { threshold: 0.5 });
  sections.forEach(function (s) { io.observe(s); });
}

initBgShift();

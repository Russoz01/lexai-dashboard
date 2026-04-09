/* =========================================================
   animations.js — scroll reveal, text split, counters,
                   comparison bars, stagger reveal
   ========================================================= */
'use strict';
import { noMotion, prefersReducedMotion } from './utils.js';

/* ============================================================
   SCROLL REVEAL
   ============================================================ */
export function initScrollReveal() {
  if (noMotion) {
    /* Immediately reveal everything when reduced motion is preferred */
    document.querySelectorAll('.rv, .rv-s').forEach(function (el) {
      el.classList.add('on');
    });
    return;
  }

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('on');
        /* a11y/perf: stop observing once revealed (fix memory leak) */
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.06 });

  document.querySelectorAll('.rv, .rv-s').forEach(function (el) {
    observer.observe(el);
  });

  /* Fallback: a scroll-driven sweep in case IO is throttled / blocked.
     Cheap no-op once IO has marked everything .on. */
  let fallbackTick = false;
  function fallbackSweep() {
    const pending = document.querySelectorAll('.rv:not(.on), .rv-s:not(.on)');
    if (!pending.length) {
      window.removeEventListener('scroll', onScrollFallback, { passive: true });
      return;
    }
    Array.prototype.forEach.call(pending, function (el) {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight + 80 && r.bottom > -80) {
        el.classList.add('on');
      }
    });
  }
  function onScrollFallback() {
    if (fallbackTick) return;
    fallbackTick = true;
    requestAnimationFrame(function () {
      fallbackTick = false;
      fallbackSweep();
    });
  }
  window.addEventListener('scroll', onScrollFallback, { passive: true });
  /* Body scroller fallback: when <body> has its own overflow:auto
     (happens in some layouts), scroll events fire on body, not window. */
  document.addEventListener('scroll', onScrollFallback, { passive: true, capture: true });
  /* Initial sweep — also catches any element already in viewport */
  setTimeout(fallbackSweep, 400);
  /* Hard safety net: if anything is still unrevealed after 4s
     (IO throttled, fallback blocked, scroller mismatch), force-reveal
     everything so content never stays invisible. */
  setTimeout(function () {
    const stragglers = document.querySelectorAll('.rv:not(.on), .rv-s:not(.on)');
    Array.prototype.forEach.call(stragglers, function (el) {
      el.classList.add('on');
    });
  }, 4000);
}

/* ============================================================
   TEXT SPLIT ANIMATION
   Elements with [data-split] have their text split into words,
   each wrapped for a slide-up reveal on scroll.
   ============================================================ */
export function initTextSplit() {
  const splitEls = document.querySelectorAll('[data-split]');
  if (splitEls.length === 0) return;

  if (noMotion) {
    /* No animation -- leave text as-is */
    return;
  }

  splitEls.forEach(function (el) {
    /* Guard: only split once */
    if (el.dataset.splitDone) return;
    el.dataset.splitDone = '1';

    const text  = el.textContent.trim();
    const words = text.split(/\s+/);
    el.textContent = '';
    el.setAttribute('aria-label', text);

    words.forEach(function (word, i) {
      /* Outer span hides overflow */
      const outer = document.createElement('span');
      outer.style.display       = 'inline-block';
      outer.style.overflow      = 'hidden';
      outer.style.verticalAlign = 'top';

      /* Inner span slides up */
      const inner = document.createElement('span');
      inner.textContent   = word;
      inner.style.display = 'inline-block';
      inner.style.transform  = 'translateY(110%)';
      inner.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1) ' + (i * 0.045) + 's';
      inner.className = 'split-word';

      outer.appendChild(inner);
      el.appendChild(outer);

      /* Add a space between words */
      if (i < words.length - 1) {
        el.appendChild(document.createTextNode(' '));
      }
    });
  });

  /* Observe for visibility */
  const splitObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const innerSpans = entry.target.querySelectorAll('.split-word');
        innerSpans.forEach(function (span) {
          span.style.transform = 'translateY(0)';
        });
        splitObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  splitEls.forEach(function (el) {
    splitObserver.observe(el);
  });
}

/* ============================================================
   COUNTER ANIMATION
   ============================================================ */
function animateCounter(el) {
  const target   = parseFloat(el.dataset.target);
  const suffix   = el.dataset.suffix || '';
  const prefix   = el.dataset.prefix || '';
  let start      = null;
  const duration = noMotion ? 0 : 1500;

  if (noMotion) {
    el.textContent = prefix + (Number.isInteger(target) ? target : target.toFixed(1)) + suffix;
    return;
  }

  function step(ts) {
    if (!start) start = ts;
    const prog  = Math.min((ts - start) / duration, 1);
    const eased = 1 - Math.pow(1 - prog, 3);
    const val   = target * eased;
    el.textContent = prefix + (Number.isInteger(target) ? Math.floor(val) : val.toFixed(1)) + suffix;
    if (prog < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const counterObs = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });

document.querySelectorAll('[data-counter]').forEach(function (el) {
  counterObs.observe(el);
});

/* ============================================================
   COMPARISON BARS ANIMATION
   ============================================================ */
function initCompBars() {
  const bars = document.querySelectorAll('.comp-bar[data-width]');
  if (!bars.length) return;

  const compObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const barEls = entry.target.querySelectorAll('.comp-bar[data-width]');
        barEls.forEach(function (bar) {
          const w = bar.dataset.width;
          bar.style.width = w + '%';
        });
        compObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.comp-row').forEach(function (row) {
    compObs.observe(row);
  });
}

initCompBars();

/* ── Enhanced staggered reveal for card grids ── */
export function initStaggerReveal() {
  if (prefersReducedMotion()) return;
  if (!('IntersectionObserver' in window)) return;
  // Auto-add .rv to card-grid children that don't already have it
  const groups = [
    '.features-grid',
    '.steps-grid',
    '.plans-grid',
    '.cc-grid',
    '.tec-grid',
    '.trust-row',
    '.about-tags',
    '.tech-tags'
  ];
  // Cards that have their own 3D transform — only add .rv (no .rv-up)
  const tiltClasses = ['feat', 'step', 'cc-card', 'tec-card', 'plan-card'];
  groups.forEach(function (sel) {
    const grid = document.querySelector(sel);
    if (!grid) return;
    Array.prototype.forEach.call(grid.children, function (child, i) {
      const isTilt = tiltClasses.some(function (c) { return child.classList.contains(c); });
      if (!child.classList.contains('rv')) {
        if (isTilt) child.classList.add('rv');
        else child.classList.add('rv', 'rv-up');
      }
      if (!child.style.getPropertyValue('--rv-delay')) {
        child.style.setProperty('--rv-delay', (i * 0.08) + 's');
      }
    });
  });

  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('rv-visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -80px 0px' });

  document.querySelectorAll('.rv').forEach(function (el) {
    io.observe(el);
  });
}

initStaggerReveal();

/* ── Viewport number counters (IntersectionObserver) ── */
export function initCounters() {
  if (prefersReducedMotion()) return;
  if (!('IntersectionObserver' in window)) return;
  let targets = document.querySelectorAll('[data-count]');
  // Auto-detect numbers in common stat elements
  const statSelectors = '.big-stat-number, .trust-num, .quiz-stat-val, .stat-number, .roi-out-num';
  document.querySelectorAll(statSelectors).forEach(function (el) {
    if (el.hasAttribute('data-count')) return;
    const txt = (el.textContent || '').trim();
    const match = txt.match(/^([^0-9]*)([\d.,]+)(.*)$/);
    if (match && match[2]) {
      const numStr = match[2].replace(/\./g, '').replace(',', '.');
      const num = parseFloat(numStr);
      if (!isNaN(num) && num > 0) {
        el.setAttribute('data-count', num);
        el.setAttribute('data-count-prefix', match[1] || '');
        el.setAttribute('data-count-suffix', match[3] || '');
        el.setAttribute('data-count-decimals', (numStr.split('.')[1] || '').length);
        el.setAttribute('data-count-orig', txt);
        targets = document.querySelectorAll('[data-count]'); // refresh
      }
    }
  });

  function formatNumber(n, decimals) {
    if (decimals > 0) {
      return n.toFixed(decimals).replace('.', ',');
    }
    return Math.round(n).toLocaleString('pt-BR');
  }

  function animate(el) {
    const target   = parseFloat(el.getAttribute('data-count')) || 0;
    const decimals = parseInt(el.getAttribute('data-count-decimals'), 10) || 0;
    const prefix   = el.getAttribute('data-count-prefix') || '';
    const suffix   = el.getAttribute('data-count-suffix') || '';
    const duration = 1600;
    const start    = performance.now();
    function tick(now) {
      const p     = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      const val   = target * eased;
      el.textContent = prefix + formatNumber(val, decimals) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = prefix + formatNumber(target, decimals) + suffix;
    }
    requestAnimationFrame(tick);
  }

  const observed = new WeakSet();
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && !observed.has(entry.target)) {
        observed.add(entry.target);
        animate(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.35 });

  document.querySelectorAll('[data-count]').forEach(function (el) {
    io.observe(el);
  });
}

initCounters();

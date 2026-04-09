/* =========================================================
   effects.js — hero canvas, parallax, phone chat,
                card spotlight, mouse parallax,
                scroll parallax, 3D tilt, magnetic buttons,
                scroll progress bar
   ========================================================= */
'use strict';
import { noMotion, isTouch, prefersReducedMotion, isTouchDevice, debounce, rafThrottle } from './utils.js';

/* ============================================================
   PARALLAX HERO TITLE + FLOATING SHAPES
   ============================================================ */
const heroTitle  = document.querySelector('.hero-title');
const heroFloats = document.querySelectorAll('.hero-float');
const floatRates = [0.05, 0.08, 0.12];

let scrollTicking = false;

function onScrollParallax() {
  if (noMotion) return;
  /* Disable hero parallax on small phones — saves CPU on low-end Androids */
  if (window.innerWidth < 400) return;

  const y  = window.scrollY;
  const wh = window.innerHeight;

  /* Hero title parallax + fade */
  if (heroTitle && y < wh) {
    heroTitle.style.transform = 'translateY(' + (y * 0.15) + 'px)';
    heroTitle.style.opacity   = Math.max(0, 1 - (y / wh) * 1.3);
  }

  /* Floating shapes parallax */
  heroFloats.forEach(function (el, i) {
    const rate = floatRates[i % floatRates.length];
    el.style.transform = 'translateY(' + (y * rate) + 'px)';
  });
}

window.addEventListener('scroll', function () {
  if (!scrollTicking) {
    requestAnimationFrame(function () {
      onScrollParallax();
      scrollTicking = false;
    });
    scrollTicking = true;
  }
}, { passive: true });

/* ============================================================
   PHONE CONVERSATION LOOP
   Animates .msg elements inside .phone-messages in sequence.
   Repeats after a pause. Only runs while visible.
   ============================================================ */
(function initPhoneChat() {
  const chatContainer = document.querySelector('.phone-messages');
  if (!chatContainer) return;

  const messages = chatContainer.querySelectorAll('.msg');
  const typingEl = chatContainer.querySelector('.msg-typing');
  if (messages.length === 0) return;

  let loopTimer  = null;
  let stepTimers = [];
  let isVisible  = false;
  const delayPerMsg = 700;  /* ms stagger between messages */
  const typingTime  = 2000; /* how long typing indicator shows */
  const resetPause  = 3000; /* pause before replaying */

  /** Hide all messages and typing indicator */
  function resetChat() {
    messages.forEach(function (msg) {
      msg.classList.remove('msg-anim');
    });
    if (typingEl) typingEl.classList.remove('msg-anim');
  }

  /** Clear all scheduled timers */
  function clearTimers() {
    stepTimers.forEach(function (t) { clearTimeout(t); });
    stepTimers = [];
    if (loopTimer) { clearTimeout(loopTimer); loopTimer = null; }
  }

  /** Run one full animation cycle */
  function playSequence() {
    if (!isVisible) return;
    resetChat();

    messages.forEach(function (msg, i) {
      const t = setTimeout(function () {
        if (!isVisible) return;
        msg.classList.add('msg-anim');
      }, (i + 1) * delayPerMsg);
      stepTimers.push(t);
    });

    /* Show typing indicator after last message */
    const typingStart = (messages.length + 1) * delayPerMsg;
    if (typingEl) {
      const t1 = setTimeout(function () {
        if (!isVisible) return;
        typingEl.classList.add('msg-anim');
      }, typingStart);
      stepTimers.push(t1);

      /* Hide typing after typingTime */
      const t2 = setTimeout(function () {
        if (!isVisible) return;
        typingEl.classList.remove('msg-anim');
      }, typingStart + typingTime);
      stepTimers.push(t2);
    }

    /* Schedule next cycle */
    const totalTime = typingStart + typingTime + resetPause;
    loopTimer = setTimeout(function () {
      if (isVisible) playSequence();
    }, totalTime);
  }

  if (noMotion) {
    /* Show all messages immediately without animation */
    messages.forEach(function (msg) { msg.classList.add('msg-anim'); });
    return;
  }

  const chatObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        isVisible = true;
        playSequence();
      } else {
        isVisible = false;
        clearTimers();
        resetChat();
      }
    });
  }, { threshold: 0.3 });

  chatObserver.observe(chatContainer);
})();

/* ============================================================
   CANVAS GRADIENT MESH (hero background)
   ============================================================ */
function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  if (prefersReducedMotion()) return;

  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let w, h;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    w = rect.width; h = rect.height;
    canvas.width  = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
  }

  // Blobs: each is a large colored radial gradient that drifts
  const blobs = [
    { x: .25, y: .35, r: .55, color: [122, 141, 104], speed: .00012, phase: 0 },
    { x: .75, y: .55, r: .65, color: [217, 190, 138], speed: .00009, phase: 2 },
    { x: .50, y: .85, r: .50, color: [145, 123, 94],  speed: .00015, phase: 4 },
    { x: .10, y: .15, r: .40, color: [91,  107, 78],  speed: .00011, phase: 1 }
  ];

  const t0 = performance.now();
  function draw(t) {
    const dt = t - t0;
    ctx.clearRect(0, 0, w, h);
    // Darker base
    ctx.fillStyle = 'rgba(26,29,23,0)';
    ctx.fillRect(0, 0, w, h);

    blobs.forEach(function (b) {
      const cx  = (b.x + Math.sin(dt * b.speed + b.phase) * .12) * w;
      const cy  = (b.y + Math.cos(dt * b.speed * 1.3 + b.phase) * .12) * h;
      const rad = b.r * Math.max(w, h);
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
      grd.addColorStop(0,   'rgba(' + b.color[0] + ',' + b.color[1] + ',' + b.color[2] + ',.55)');
      grd.addColorStop(0.4, 'rgba(' + b.color[0] + ',' + b.color[1] + ',' + b.color[2] + ',.18)');
      grd.addColorStop(1,   'rgba(' + b.color[0] + ',' + b.color[1] + ',' + b.color[2] + ',0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  resize();
  draw(performance.now());
  window.addEventListener('resize', debounce(function () {
    canvas.width = 0; canvas.height = 0;
    resize();
  }, 180));
}
initHeroCanvas();

/* ============================================================
   SCROLL PROGRESS BAR
   ============================================================ */
function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  function update() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    bar.style.width = pct + '%';
  }
  window.addEventListener('scroll', rafThrottle(update), { passive: true });
  update();
}
initScrollProgress();

/* ============================================================
   MOUSE PARALLAX (hero shapes follow mouse)
   ============================================================ */
function initMouseParallax() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  if (prefersReducedMotion()) return;
  if (isTouchDevice()) return;

  const floats = document.querySelectorAll('.hero-float[data-depth]');
  const orbs   = document.querySelectorAll('.hero-orb');
  if (!floats.length && !orbs.length) return;

  let targetX = 0, targetY = 0;
  let curX = 0, curY = 0;

  hero.addEventListener('mousemove', rafThrottle(function (e) {
    const rect = hero.getBoundingClientRect();
    const cx   = rect.left + rect.width / 2;
    const cy   = rect.top  + rect.height / 2;
    targetX = (e.clientX - cx) / rect.width;
    targetY = (e.clientY - cy) / rect.height;
  }), { passive: true });

  function tick() {
    curX += (targetX - curX) * .06;
    curY += (targetY - curY) * .06;

    floats.forEach(function (el) {
      const depth = parseFloat(el.dataset.depth) || .4;
      const tx    = -curX * 60 * depth;
      const ty    = -curY * 60 * depth;
      el.style.transform = 'translate3d(' + tx + 'px,' + ty + 'px, 0)';
    });

    orbs.forEach(function (el, i) {
      const d  = (i + 1) * .15;
      const tx = curX * 40 * d;
      const ty = curY * 40 * d;
      el.style.setProperty('--mx', tx + 'px');
      el.style.setProperty('--my', ty + 'px');
      el.style.transform = 'translate3d(' + tx + 'px,' + ty + 'px, 0)';
    });

    requestAnimationFrame(tick);
  }
  tick();
}
initMouseParallax();

/* ============================================================
   CARD HOVER SPOTLIGHT (mouse-tracking gradient)
   ============================================================ */
function initCardSpotlight() {
  if (isTouchDevice()) return;
  const cards = document.querySelectorAll('.plan-card, .cc-card, .tec-card, .feat, .step');
  cards.forEach(function (card) {
    card.addEventListener('mousemove', rafThrottle(function (e) {
      const rect = card.getBoundingClientRect();
      const x    = ((e.clientX - rect.left) / rect.width) * 100;
      const y    = ((e.clientY - rect.top)  / rect.height) * 100;
      card.style.setProperty('--mx', x + '%');
      card.style.setProperty('--my', y + '%');
    }), { passive: true });
  });
}
initCardSpotlight();

/* ============================================================
   SCROLL-LINKED PARALLAX (data-parallax)
   ============================================================ */
function initScrollParallax() {
  if (prefersReducedMotion()) return;
  const items = document.querySelectorAll('[data-parallax]');
  if (!items.length) return;
  function update() {
    items.forEach(function (el) {
      const rect  = el.getBoundingClientRect();
      const speed = parseFloat(el.dataset.parallax) || .3;
      const offset = (window.innerHeight / 2 - rect.top - rect.height / 2) * speed;
      el.style.setProperty('--parallax-y', offset + 'px');
      el.style.transform = 'translate3d(0,' + offset + 'px,0)';
    });
  }
  window.addEventListener('scroll', rafThrottle(update), { passive: true });
  update();
}
initScrollParallax();

/* ── 3D tilt on cards (mouse-reactive rotateX/rotateY) ── */
function init3DTilt() {
  if (prefersReducedMotion() || isTouchDevice()) return;
  const cards    = document.querySelectorAll('.feat, .step, .cc-card, .tec-card, .plan-card');
  const maxAngle = 8; // degrees
  cards.forEach(function (card) {
    let rafId = null;
    card.addEventListener('mousemove', function (e) {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(function () {
        const rect = card.getBoundingClientRect();
        const cx   = rect.width  / 2;
        const cy   = rect.height / 2;
        const dx   = (e.clientX - rect.left - cx) / cx;
        const dy   = (e.clientY - rect.top  - cy) / cy;
        const ry   = dx * maxAngle;
        const rx   = -dy * maxAngle;
        card.style.setProperty('--rx', rx.toFixed(2) + 'deg');
        card.style.setProperty('--ry', ry.toFixed(2) + 'deg');
      });
    }, { passive: true });
    card.addEventListener('mouseleave', function () {
      if (rafId) cancelAnimationFrame(rafId);
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
      card.style.setProperty('--tz', '0px');
      card.style.setProperty('--ts', '1');
    });
  });
}
init3DTilt();

/* ── Magnetic buttons (follow cursor with spring) ── */
function initMagneticButtons() {
  if (prefersReducedMotion() || isTouchDevice()) return;
  const targets  = document.querySelectorAll('.btn-fill, .magnetic, .nav-cta');
  const strength = 0.25;
  targets.forEach(function (el) {
    el.addEventListener('mousemove', rafThrottle(function (e) {
      const rect = el.getBoundingClientRect();
      const mx   = e.clientX - rect.left - rect.width  / 2;
      const my   = e.clientY - rect.top  - rect.height / 2;
      el.style.transform = 'translate3d(' + (mx * strength).toFixed(1) + 'px, ' + (my * strength).toFixed(1) + 'px, 0)';
    }), { passive: true });
    el.addEventListener('mouseleave', function () {
      el.style.transform = '';
    });
  });
}
initMagneticButtons();

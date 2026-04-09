/* =========================================================
   nav.js — navigation scroll detection + mobile menu
   ========================================================= */
'use strict';
import { rafThrottle } from './utils.js';

/* ============================================================
   NAVIGATION -- scroll detection + dark-section awareness
   ============================================================ */
const nav         = document.getElementById('nav');
const heroSection = document.getElementById('home');
const darkSections = document.querySelectorAll('.section-dark, .hero');

/**
 * Combined nav handler: scrolled class, dark-over detection.
 */
function updateNav() {
  if (!nav) return;

  /* Scrolled state */
  if (window.scrollY > 20) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }

  /* Dark section detection */
  const navH = nav.offsetHeight;
  let overDark = false;
  darkSections.forEach(function (sec) {
    const rect = sec.getBoundingClientRect();
    if (rect.top < navH && rect.bottom > navH) {
      overDark = true;
    }
  });

  /* Also treat hero bottom check */
  if (heroSection) {
    const heroBot = heroSection.getBoundingClientRect().bottom;
    if (heroBot > 80) overDark = true;
  }

  if (overDark && !nav.classList.contains('scrolled')) {
    nav.classList.add('nav-over-dark');
  } else if (!overDark) {
    nav.classList.remove('nav-over-dark');
  }
}

/* rAF-throttled scroll handler for nav */
window.addEventListener('scroll', rafThrottle(updateNav), { passive: true });
updateNav();

/* ============================================================
   MOBILE MENU
   ============================================================ */
const navToggle = document.getElementById('nav-toggle');
const navMenu   = document.getElementById('nav-menu');

if (navToggle && navMenu) {
  navToggle.addEventListener('click', function () {
    navMenu.classList.toggle('open');
  });
  navMenu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      navMenu.classList.remove('open');
    });
  });
}

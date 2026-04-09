/* =========================================================
   cursor.js — custom cursor + hover binding
   ========================================================= */
'use strict';
import { isTouch } from './utils.js';

const dot       = document.getElementById('c-dot');
const ring      = document.getElementById('c-ring');
const cursorWrap = document.getElementById('cursor');

/* Hide cursor elements on touch devices */
if (isTouch) {
  if (cursorWrap) cursorWrap.style.display = 'none';
  document.body.style.cursor = 'auto';
  document.querySelectorAll('a, button').forEach(function (el) {
    el.style.cursor = 'pointer';
  });
}

let mx = 0, my = 0, rx = 0, ry = 0;

if (!isTouch && dot && ring) {
  document.addEventListener('mousemove', function (e) {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  }, { passive: true });

  (function animRing() {
    rx += (mx - rx) * 0.1;
    ry += (my - ry) * 0.1;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animRing);
  })();
}

/**
 * Bind hover class toggle for custom cursor on interactive elements.
 * Exposed on window so quiz.js can re-call it after rendering options.
 */
function bindCursorHover() {
  document.querySelectorAll('a, button, [data-hover], .quiz-option').forEach(function (el) {
    /* Avoid binding twice */
    if (el._cursorBound) return;
    el._cursorBound = true;
    el.addEventListener('mouseenter', function () {
      document.body.classList.add('cursor-hover');
    });
    el.addEventListener('mouseleave', function () {
      document.body.classList.remove('cursor-hover');
    });
  });
}
bindCursorHover();
window.rebindCursorHover = bindCursorHover;

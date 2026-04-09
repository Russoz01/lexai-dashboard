/* =========================================================
   utils.js — shared utilities and feature flags
   ========================================================= */
'use strict';

/**
 * Debounce — delays execution until a pause in calls.
 * @param {Function} fn   Callback to debounce
 * @param {number}   ms   Delay in milliseconds
 * @returns {Function}
 */
export function debounce(fn, ms) {
  let timer;
  return function () {
    const ctx = this;
    const args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(ctx, args);
    }, ms);
  };
}

/**
 * rAF throttle — coalesces calls into next animation frame.
 * Use for scroll/resize handlers that mutate DOM/styles.
 */
export function rafThrottle(fn) {
  let ticking = false;
  return function () {
    const ctx = this;
    const args = arguments;
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      fn.apply(ctx, args);
      ticking = false;
    });
  };
}

/**
 * Detect whether the current device is touch-primary.
 * @returns {boolean}
 */
export function isTouchDevice() {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );
}

/**
 * Check if user prefers reduced motion.
 * @returns {boolean}
 */
export function prefersReducedMotion() {
  return (
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Linear interpolation helper.
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/* ---- Shared state ----
   hasFinePointer: real mouse/trackpad. Custom cursor + mouse FX should
   only run when this is true (skips phones, tablets, kiosks).
   isTouch is kept as legacy fallback for hybrids that report both. */
export const hasFinePointer = window.matchMedia?.('(pointer: fine)').matches ?? false;
export const isTouch   = !hasFinePointer;
export const noMotion  = prefersReducedMotion();

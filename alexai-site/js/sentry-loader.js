/* sentry-loader.js — conditionally bootstraps Sentry error monitoring.
   No-ops if ALEX_AI_SENTRY_DSN is not injected at deploy time. */
(function () {
  var dsn = window.ALEX_AI_SENTRY_DSN;
  if (!dsn) return;
  var s = document.createElement('script');
  s.src = 'https://js.sentry-cdn.com/' + (window.ALEX_AI_SENTRY_KEY || 'disabled') + '.min.js';
  s.crossOrigin = 'anonymous';
  s.async = true;
  s.onload = function () {
    if (window.Sentry && typeof window.Sentry.onLoad === 'function') {
      window.Sentry.onLoad(function () {
        window.Sentry.init({
          dsn: dsn,
          environment: window.ALEX_AI_ENV || 'production',
          tracesSampleRate: 0.1,
          replaysSessionSampleRate: 0,
          replaysOnErrorSampleRate: 1.0
        });
      });
    }
  };
  document.head.appendChild(s);
})();

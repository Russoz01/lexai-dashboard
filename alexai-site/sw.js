/* sw.js — Alex AI service worker
   Strategy: cache-first for static assets, network-first for HTML.
   Cache name versioning: bump CACHE_NAME on deploys to purge stale assets. */
const CACHE_NAME = 'alexai-v1';

const PRECACHE_URLS = [
  '/',
  '/css/style.css',
  '/js/main.js',
  '/js/modules/utils.js',
  '/js/modules/cursor.js',
  '/js/modules/nav.js',
  '/js/modules/loader.js',
  '/js/modules/animations.js',
  '/js/modules/interactions.js',
  '/js/modules/roi.js',
  '/js/modules/effects.js',
  '/js/modules/theme.js',
  '/js/modules/scarcity.js',
  '/js/quiz.js',
  '/js/quiz-loader.js',
  '/favicon.svg'
];

/* Install: precache all static assets */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

/* Activate: delete old caches */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

/* Fetch: cache-first for JS/CSS/fonts/images; network-first for HTML */
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  /* Only handle same-origin requests */
  if (url.origin !== self.location.origin) return;

  /* HTML: network-first (keep page content fresh) */
  if (event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  /* Static assets: cache-first */
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});

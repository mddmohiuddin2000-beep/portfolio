/* Service worker — offline shell for the portfolio.
   Bump CACHE_VERSION whenever the precached files change. */
const CACHE_VERSION = 'mohi-v7';
const PRECACHE = [
  './',
  './index.html',
  './assets/site.css',
  './assets/site.js',
  './assets/fonts/plus-jakarta-400.woff2',
  './assets/fonts/plus-jakarta-700.woff2',
  './assets/fonts/instrument-serif-400-italic.woff2',
  './profile.jpg',
  './favicon.svg',
  './assets/Academic-CV-Mohi.pdf',
  './assets/Professional-CV-Mohi.pdf',
  './manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;

  // Gallery photos live on Google's CDN — never cache those.
  if (!sameOrigin) return;

  // gallery.json is rewritten every 6 hours by the sync Action. It must always
  // come from the network, otherwise the cached copy hides new photos.
  if (url.pathname.endsWith('/gallery.json')) return;

  // Navigation: network first, fall back to the cached shell when offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put('./index.html', copy));
          return res;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Static assets: cache first, refresh in the background.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then((c) => c.put(request, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});

const CACHE = 'powerhouse-portal-2026-11-v4';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './benefits-data.js',
  './app.js',
  './wca.js',
  './assets/portal-hero.png',
  './manifest.webmanifest',
  './assets/app-icon.png',
  './assets/dwp-brand.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  // Network first: a new Render deployment should be seen immediately.
  // The cache is only the fallback when the device is offline.
  event.respondWith(
    fetch(event.request, { cache: 'no-store' })
      .then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        if (event.request.mode === 'navigate') return caches.match('./index.html');
        return Response.error();
      })
  );
});

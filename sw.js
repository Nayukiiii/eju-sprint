const CACHE = 'eju-sprint-stage3-v6';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './whiteboard.js',
  './math_tools.js',
  './bank.js',
  './bank2.js',
  './bank3.js',
  './bank_math_real.js',
  './bank_bunso_extra.js',
  './bank_core.js',
  './knowledge.js',
  './papers_manifest.js',
  './mindmap.js',
  './stage1_audit_data.js',
  './app.js',
  './sync.js',
  './ai_verify.js',
  './vendor/anthropic-sdk.js',
  './manifest.webmanifest',
  './icon.svg',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== location.origin || url.pathname.startsWith('/api/')) return;

  // For paper scan PNGs, use cache-first for fast image flipping; for code files, use network-first so updates apply immediately
  if (url.pathname.startsWith('/papers/')) {
    event.respondWith(
      caches.match(event.request).then(hit => hit || fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, copy));
        }
        return response;
      }))
    );
    return;
  }

  event.respondWith(
    fetch(event.request).then(response => {
      if (response && response.status === 200) {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy));
      }
      return response;
    }).catch(() => caches.match(event.request).then(hit => hit || caches.match('./index.html')))
  );
});

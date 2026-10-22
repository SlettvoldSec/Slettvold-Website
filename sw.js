/* slettvold.org service worker: makes the site installable, opens instantly on repeat visits and keeps working
   offline. Pages: always from the network when online (so you see the latest), the saved copy when offline.
   Fonts, styles, scripts and images: from the cache (their URLs change when the files change). Nothing is
   sent anywhere; the contact form and other sites are never touched. */
const CACHE = 'slettvold-v1';
const CORE = ['/', '/ja/', '/offline/', '/favicon.png', '/img/app-192.png'];

self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin || url.pathname.startsWith('/docs/') || url.pathname === '/sw.js') return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req).then((hit) => hit || caches.match('/offline/'))));
    return;
  }
  if (/^\/(assets|img|onidojo\/img)\//.test(url.pathname) || /\.(woff2|png|jpg|svg|css|js)$/.test(url.pathname)) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    })));
  }
});

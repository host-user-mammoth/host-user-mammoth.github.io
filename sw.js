const CACHE = 'mammoth-shell-v3';   // v3 2026-09-24: new icons; now also served by the public site
const SHELL = ['./manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

// The previous version branched on request.mode === 'navigate' to decide network-first vs
// cache-first -- but the artifact host may not load the page in a way that ever sets that mode,
// which meant the fetch handler silently fell into the cache-first branch below for the app
// document itself: after the very first install, every later open could serve the ORIGINAL
// cached HTML instead of whatever was actually just republished. Root-caused via a user report
// ("it's not updating when you send me the link") -- fixed by keying off the URL instead of
// request.mode: only truly static assets (icons, manifest) are ever cache-first. Everything
// else, including the app document itself and any of its variants, always tries the network
// first and only falls back to cache if genuinely offline.
self.addEventListener('fetch', (e) => {
  const path = new URL(e.request.url).pathname;
  const isStaticAsset = /\.(png|jpg|jpeg|svg|ico)$/i.test(path) || path.endsWith('manifest.json');
  if (isStaticAsset) {
    e.respondWith(caches.match(e.request).then((cached) => cached || fetch(e.request)));
    return;
  }
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});

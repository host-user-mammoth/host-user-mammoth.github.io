// Retired 2026-09-29: the site moved to mammoth-picks-web.pages.dev. Unregister so installed copies stop serving the old page.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.registration.unregister().then(() => self.clients.matchAll()).then((cs) => cs.forEach((c) => c.navigate(c.url)))));

// Service worker that unregisters itself and clears all caches
// This fixes the blank page issue caused by stale cache-first caching

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => {
      return self.clients.matchAll();
    }).then((clients) => {
      clients.forEach((client) => client.navigate(client.url));
    })
  );
});

// Network-only: never serve from cache
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});

const CACHE_NAME = 'purohitsetu-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Let network handle normal requests
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
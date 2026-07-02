// Service Worker de ¿Y Si SI?
// Necesario para que los navegadores (sobre todo Chrome/Android) consideren la app "instalable"
// y para que pueda abrir sin conexión una vez visitada.

const CACHE_NAME = 'y-si-si-v1';
const APP_SHELL = ['./', './ilusionometro.html'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(APP_SHELL.map((url) => cache.add(url)));
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Network-first, cache fallback: siempre intenta traer la versión más nueva,
// y si no hay conexión, sirve lo último guardado.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

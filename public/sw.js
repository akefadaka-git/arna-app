const CACHE_NAME = 'arna-ethiopic-font-v1';
const FONT_URL = '/fonts/NotoSansEthiopic-variable.ttf';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add(FONT_URL)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key.startsWith('arna-ethiopic-font-') && key !== CACHE_NAME)
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  const fontUrl = new URL(FONT_URL, self.location.origin);
  if (event.request.method !== 'GET' ||
      requestUrl.origin !== self.location.origin ||
      requestUrl.pathname !== fontUrl.pathname) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(event.request);
      if (cached) return cached;
      const response = await fetch(event.request);
      if (response.ok) await cache.put(event.request, response.clone());
      return response;
    }),
  );
});

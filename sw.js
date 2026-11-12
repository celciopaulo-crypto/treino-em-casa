/* Service Worker — Treino em Casa (PWA)
   Guarda a app e os vídeos em cache para funcionarem offline depois da 1ª abertura. */
const CACHE = 'treino-em-casa-v1';
const SHELL = ['treino-em-casa.html', 'manifest.json', 'icon.svg'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(SHELL))
      .catch(() => {})            // se algum ficheiro do shell falhar, não bloqueia
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.map((k) => (k === CACHE ? null : caches.delete(k)))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // deixa YouTube e outros à rede normal
  if (url.pathname.indexOf('/videos/') !== -1) return; // vídeos: geridos offline via IndexedDB (fiável no iPhone)

  // Usa o caminho como chave: ignora o cabeçalho Range dos vídeos e evita respostas 206 na cache.
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(url.pathname);
    if (cached) return cached;
    try {
      const res = await fetch(url.pathname, { cache: 'no-store' });
      if (res && res.status === 200) cache.put(url.pathname, res.clone());
      return res;
    } catch (err) {
      const fallback = await cache.match(url.pathname);
      if (fallback) return fallback;
      throw err;
    }
  })());
});

/* Service Worker — Gouvernance DNSI (V1.0.0) */
const CACHE_NAME = "gouvernance-dnsi-v1.0.1";

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon.png",
  "./Gouvernance%20-%200.%20Synthese.html",
  "./Gouvernance%20-%201.%20Programmes.html",
  "./Gouvernance%20-%202.%20Portefeuille.html",
  "./Gouvernance%20-%203.%20Capacite.html",
  "./Gouvernance%20-%204.%20Strategie.html"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(ASSETS.map((url) => cache.add(url)))
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  /* Stratégie Network-First : fraîcheur GitHub en ligne, repli cache hors-ligne */
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req))
  );
});

export const CACHE_NAME = "RTGCP-beta-v1.0.7-test1";
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/Icons/logo192.png",
  "/style.css",
  "/script.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting(); // Immediately activate
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
  );
  self.clients.claim();

  // Tell all pages to reload
  self.clients.matchAll({ includeUncontrolled: true }).then((clients) => {
    clients.forEach((client) => {
      client.postMessage({ type: "RELOAD_PAGE" });
    });
  });
});

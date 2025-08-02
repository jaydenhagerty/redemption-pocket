export const CACHE_NAME = "Beta-v1.0.10"; // Bump this for each version

const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/Icons/logo192.png",
  "/style.css",
  "/script.js",
];

// INSTALL: Pre-cache app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .catch((err) => console.warn("Caching failed:", err))
  );
  self.skipWaiting(); // Immediately activate new version
});

// ACTIVATE: Delete old caches
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
  self.clients.claim(); // Start controlling pages
});

// FETCH: Cache-first strategy
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      // Else, fetch from network
      return fetch(event.request)
        .then((response) => {
          // Optionally cache new requests here if needed
          return response;
        })
        .catch((err) => {
          console.warn("Fetch failed:", err);
          throw err;
        });
    })
  );
});

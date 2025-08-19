const CACHE_NAME = "Beta-v1.5.1";
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/Icons/logo192.png",
  "/style.css",
  "/script.js",
];

// Install event: cache app shell
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Caching app shell");
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // Activate worker immediately after install
});

// Activate event: clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("[Service Worker] Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Take control of all pages immediately
});

// Fetch event: serve cached content if available
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

// Listen for updates
self.addEventListener("message", (event) => {
  if (event.data === "skipWaiting") {
    self.skipWaiting();
  }
});

// const CACHE_NAME = "Beta-v1.2-cooldown-patch"; // Update this for every new release

// const urlsToCache = [
//   "/",
//   "/index.html",
//   "/manifest.json",
//   "/Icons/logo192.png",
//   "/style.css",
//   "/script.js",
// ];

// // INSTALL: Pre-cache app shell
// self.addEventListener("install", (event) => {
//   event.waitUntil(
//     caches
//       .open(CACHE_NAME)
//       .then((cache) => cache.addAll(urlsToCache))
//       .catch((err) => console.warn("Caching failed:", err))
//   );
//   self.skipWaiting(); // Activate new worker immediately
// });

// // ACTIVATE: Clean old caches + reload clients
// self.addEventListener("activate", (event) => {
//   event.waitUntil(
//     (async () => {
//       const keys = await caches.keys();
//       await Promise.all(
//         keys
//           .filter((key) => key !== CACHE_NAME)
//           .map((key) => caches.delete(key))
//       );

//       const clientsList = await self.clients.matchAll({ type: "window" });
//       for (const client of clientsList) {
//         client.navigate(client.url); // Force reload to get fresh content
//       }
//     })()
//   );
//   self.clients.claim(); // Take control of all open clients
// });

// // FETCH: Cache-first with network fallback and optional cache update
// self.addEventListener("fetch", (event) => {
//   if (event.request.method !== "GET") return;

//   event.respondWith(
//     caches.match(event.request).then((cachedResponse) => {
//       if (cachedResponse) {
//         // Try updating cache in background (optional)
//         fetch(event.request)
//           .then((networkResponse) => {
//             return caches.open(CACHE_NAME).then((cache) => {
//               cache.put(event.request, networkResponse.clone());
//             });
//           })
//           .catch(() => {}); // Ignore fetch errors
//         return cachedResponse;
//       }

//       // Not cached: fetch from network
//       return fetch(event.request)
//         .then((networkResponse) => {
//           // Optionally cache this new response
//           return caches.open(CACHE_NAME).then((cache) => {
//             cache.put(event.request, networkResponse.clone());
//             return networkResponse;
//           });
//         })
//         .catch((err) => {
//           console.warn("Fetch failed:", err);
//           throw err;
//         });
//     })
//   );
// });

/**
 * Service Worker for tiengtrungdema (Network-First Strategy & Offline Support)
 */

const CACHE_NAME = "tiengtrungdema-v3.0.7";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./css/styles.css",
  "./js/app.js",
  "./js/data/vocabulary.js",
  "./js/data/roadmapLessons.js",
  "./js/data/exams.js",
  "./js/modules/userManager.js",
  "./js/modules/srs.js",
  "./js/modules/writingCanvas.js",
  "./js/modules/speechEngine.js",
  "./js/modules/examRoom.js",
  "./manifest.json",
  "./icon.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[ServiceWorker] Pre-caching offline assets for tiengtrungdema");
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn("[ServiceWorker] Some assets could not be pre-cached:", err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[ServiceWorker] Clearing outdated cache:", key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Chien luoc Network-First: Uu tien tai phien ban moi nhat tu Network
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Khong cache audio truc tuyen tu Youdao / Google TTS
  if (url.origin !== location.origin) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.headers.get("accept")?.includes("text/html")) {
            return caches.match("./index.html");
          }
        });
      })
  );
});

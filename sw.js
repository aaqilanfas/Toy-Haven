const CACHE_NAME = "toy-haven-v2";
const APP_SHELL = [
  "./",
  "./index.html",
  "./products.html",
  "./cart.html",
  "./checkout.html",
  "./collection.html",
  "./support.html",
  "./css/base.css",
  "./css/home.css",
  "./css/products.css",
  "./css/cart.css",
  "./css/checkout.css",
  "./css/collection.css",
  "./css/support.css",
  "./js/app.js",
  "./js/home.js",
  "./js/products.js",
  "./js/cart.js",
  "./js/checkout.js",
  "./js/collection.js",
  "./js/support.js",
  "./data/products.json",
  "./assets/logo.svg",
  "./assets/favicon.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (event.request.method === "GET" && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      });
    })
  );
});
/* Seed Classifier offline service worker — relative paths support subdirectory hosting. */
const CACHE_VERSION = "seedyai-v1.0.6";
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/styles.css",
  "./preprocess.js",
  "./js/i18n.js",
  "./js/guide-data.js",
  "./js/storage.js",
  "./js/inference.js",
  "./js/pwa.js",
  "./js/app.js",
  "./assets/img/logo-mark.svg",
  "./assets/img/hero-maize.svg",
  "./assets/img/seed-asili.svg",
  "./assets/img/seed-chotara.svg",
  "./assets/img/seed-huria.svg",
  "./assets/img/seed-asili.jpg",
  "./assets/img/seed-chotara.jpg",
  "./assets/img/seed-huria.jpg",
  "./assets/img/scan-illustration.svg",
  "./assets/img/empty-history.svg",
  "./assets/icons/favicon.svg",
  "./assets/icons/favicon-32.png",
  "./assets/icons/favicon-48.png",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/maskable-512.png",
  "./assets/icons/apple-touch-icon.png",
];

const OFFLINE_ASSETS = [
  "./model_meta.json",
  "./classes.json",
  "./seed_classifier.onnx",
  "./vendor/ort.min.js",
  "./vendor/ort-wasm-simd-threaded.wasm",
  "./vendor/ort-wasm-simd-threaded.mjs",
];

const CACHE_FIRST = new Set([
  "./seed_classifier.onnx",
  "./model_meta.json",
  "./classes.json",
  "./vendor/ort.min.js",
  "./vendor/ort-wasm-simd-threaded.wasm",
  "./vendor/ort-wasm-simd-threaded.mjs",
]);

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      await cache.addAll(CORE_ASSETS);
      // The model and WASM are large. Cache them when possible, but do not
      // block installation if a single optional asset is unavailable.
      await Promise.allSettled(
        OFFLINE_ASSETS.map(async (url) => {
          try {
            const response = await fetch(url, { cache: "reload" });
            if (response.ok) await cache.put(url, response);
          } catch {
            /* offline support can be completed from Settings */
          }
        })
      );
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([SHELL_CACHE, RUNTIME_CACHE]);
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => key.startsWith("seedyai-") && !keep.has(key)).map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

async function networkFirstNavigation(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(new URL("./index.html", self.location.href), response.clone());
    return response;
  } catch {
    return (
      (await caches.match(request, { ignoreSearch: true })) ||
      (await caches.match(new URL("./index.html", self.location.href))) ||
      new Response("Seed Classifier is offline and the app shell is not cached yet.", {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      })
    );
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request, { ignoreSearch: true });
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

async function staleWhileRevalidate(event) {
  const request = event.request;
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await caches.match(request, { ignoreSearch: true });
  const update = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);
  if (cached) {
    event.waitUntil(update);
    return cached;
  }
  return (await update) || Response.error();
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.headers.has("range")) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  const path = url.pathname;
  const isModelAsset = OFFLINE_ASSETS.some((asset) =>
    path.endsWith(asset.replace("./", "/"))
  );

  if (isModelAsset) {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(event));
});

async function prepareOffline() {
  const cache = await caches.open(SHELL_CACHE);
  const results = { ok: true, cached: 0, failed: [] };
  for (const url of [...CORE_ASSETS, ...OFFLINE_ASSETS]) {
    try {
      const response = await fetch(url, { cache: "reload" });
      if (!response.ok) throw new Error(String(response.status));
      await cache.put(url, response);
      results.cached += 1;
    } catch {
      results.ok = false;
      results.failed.push(url);
    }
  }
  return results;
}

self.addEventListener("message", (event) => {
  const data = event.data || {};
  const port = event.ports?.[0];

  if (data.type === "SKIP_WAITING") {
    self.skipWaiting();
    return;
  }

  if (data.type === "PREPARE_OFFLINE") {
    event.waitUntil(
      prepareOffline().then((result) => {
        port?.postMessage(result);
      })
    );
    return;
  }

  if (data.type === "CLEAR_CACHES") {
    event.waitUntil(
      caches
        .keys()
        .then((keys) =>
          Promise.all(keys.filter((key) => key.startsWith("seedyai-")).map((key) => caches.delete(key)))
        )
        .then(() => port?.postMessage({ ok: true }))
    );
  }
});

/* Service worker, install prompt and connectivity helpers. */
const SW_URL = new URL("../sw.js", import.meta.url);
const CACHE_PREFIX = "seedyai-";

export function isNativeApp() {
  return window.Capacitor?.isNativePlatform?.() === true;
}

let deferredPrompt = null;
let registration = null;
let updateCallback = null;
let installing = false;
let installedEvent = false;

export function onUpdateAvailable(callback) {
  updateCallback = callback;
  if (registration?.waiting) callback();
}

export function isStandalone() {
  if (isNativeApp()) return true;
  return (
    window.matchMedia?.("(display-mode: standalone)")?.matches === true ||
    window.matchMedia?.("(display-mode: fullscreen)")?.matches === true ||
    window.navigator.standalone === true
  );
}

export function isIos() {
  const ua = navigator.userAgent || "";
  const touchMac = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return /iPad|iPhone|iPod/i.test(ua) || touchMac;
}

export function canInstall() {
  return Boolean(deferredPrompt);
}

export function isInstalled() {
  return installedEvent || isStandalone();
}

export async function promptInstall() {
  if (!deferredPrompt) return { outcome: "unavailable" };
  const prompt = deferredPrompt;
  deferredPrompt = null;
  try {
    prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice?.outcome === "accepted") {
      return { outcome: "accepted" };
    }
    return { outcome: "dismissed" };
  } catch {
    return { outcome: "error" };
  }
}

export function onInstallStateChange(callback) {
  window.addEventListener("appinstalled", () => {
    installedEvent = true;
    deferredPrompt = null;
    callback();
  });
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    callback();
  });
}

export function connectivity() {
  return {
    online: navigator.onLine !== false,
    saveData: Boolean(navigator.connection?.saveData),
  };
}

export function onConnectivityChange(callback) {
  const handler = () => callback(connectivity());
  window.addEventListener("online", handler);
  window.addEventListener("offline", handler);
  callback(connectivity());
  return () => {
    window.removeEventListener("online", handler);
    window.removeEventListener("offline", handler);
  };
}

export async function registerServiceWorker() {
  if (isNativeApp()) {
    return { supported: false, registration: null };
  }
  if (!("serviceWorker" in navigator)) {
    return { supported: false, registration: null };
  }
  try {
    registration = await navigator.serviceWorker.register(SW_URL, {
      scope: new URL("../", import.meta.url).pathname,
      updateViaCache: "none",
    });
    if (registration.waiting) updateCallback?.();
    registration.addEventListener("updatefound", () => {
      const worker = registration.installing;
      if (!worker) return;
      worker.addEventListener("statechange", () => {
        if (worker.state === "installed" && navigator.serviceWorker.controller) {
          updateCallback?.();
        }
      });
    });
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (installing) {
        installing = false;
        window.location.reload();
      }
    });
    return { supported: true, registration };
  } catch (error) {
    return { supported: true, registration: null, error };
  }
}

export function applyUpdate() {
  if (!registration?.waiting) return false;
  installing = true;
  registration.waiting.postMessage({ type: "SKIP_WAITING" });
  return true;
}

function askWorker(type, timeout = 90000) {
  return new Promise((resolve, reject) => {
    const worker = navigator.serviceWorker?.controller || registration?.active;
    if (!worker) {
      reject(new Error("No active service worker"));
      return;
    }
    const channel = new MessageChannel();
    const timer = setTimeout(() => reject(new Error("Service worker timeout")), timeout);
    channel.port1.onmessage = (event) => {
      clearTimeout(timer);
      resolve(event.data);
    };
    worker.postMessage({ type }, [channel.port2]);
  });
}

export async function prepareOffline() {
  if (isNativeApp()) {
    return { ok: true };
  }
  if (!("serviceWorker" in navigator)) {
    return { ok: false, unsupported: true };
  }
  try {
    await navigator.serviceWorker.ready;
    const response = await askWorker("PREPARE_OFFLINE");
    return response || { ok: false };
  } catch (error) {
    return { ok: false, error };
  }
}

export async function checkOfflineAssets() {
  if (isNativeApp()) {
    return { supported: true, model: true, runtime: true, shell: true };
  }
  if (!("caches" in window)) {
    return { supported: false, model: false, runtime: false, shell: false };
  }
  const cacheNames = await caches.keys();
  const appCaches = cacheNames.filter((name) => name.startsWith(CACHE_PREFIX));
  if (!appCaches.length) {
    return { supported: true, model: false, runtime: false, shell: false };
  }
  const checks = await Promise.all([
    caches.match(new URL("../seed_classifier.onnx", import.meta.url).href, {
      ignoreSearch: true,
    }),
    caches.match(new URL("../vendor/ort-wasm-simd-threaded.wasm", import.meta.url).href, {
      ignoreSearch: true,
    }),
    caches.match(new URL("../index.html", import.meta.url).href, { ignoreSearch: true }),
  ]);
  return {
    supported: true,
    model: Boolean(checks[0]),
    runtime: Boolean(checks[1]),
    shell: Boolean(checks[2]),
  };
}

export async function clearAppCaches() {
  if (isNativeApp()) return { ok: true };
  if (!("caches" in window)) return { ok: true };
  try {
    const names = await caches.keys();
    await Promise.all(
      names
        .filter((name) => name.startsWith(CACHE_PREFIX))
        .map((name) => caches.delete(name))
    );
    return { ok: true };
  } catch (error) {
    return { ok: false, error };
  }
}

export function onVisibilityChange(callback) {
  const handler = () => callback(document.visibilityState);
  document.addEventListener("visibilitychange", handler);
  window.addEventListener("pagehide", () => callback("hidden"));
  return () => document.removeEventListener("visibilitychange", handler);
}

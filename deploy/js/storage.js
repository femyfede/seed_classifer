/* Local-only preferences and scan history. Nothing here leaves the device. */
const PREFIX = "seedyai.";
const HISTORY_KEY = `${PREFIX}history.v1`;
const MAX_HISTORY = 50;

function safeGet(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key, value) {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function storageAvailable() {
  try {
    const key = "__seedyai_test__";
    window.localStorage.setItem(key, "1");
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export function getPreference(key, fallback) {
  const raw = safeGet(`${PREFIX}pref.${key}`);
  if (raw == null) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function setPreference(key, value) {
  return safeSet(`${PREFIX}pref.${key}`, JSON.stringify(value));
}

export function loadHistory() {
  const raw = safeGet(HISTORY_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidEntry).sort((a, b) => b.timestamp - a.timestamp);
  } catch {
    return [];
  }
}

function isValidEntry(entry) {
  return Boolean(
    entry &&
      typeof entry.id === "string" &&
      typeof entry.classKey === "string" &&
      Number.isFinite(entry.confidence) &&
      Number.isFinite(entry.timestamp)
  );
}

function writeHistory(entries) {
  const trimmed = entries.slice(0, MAX_HISTORY);
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
    return { ok: true, entries: trimmed };
  } catch (error) {
    return { ok: false, error, entries: trimmed };
  }
}

export function makeHistoryEntry({ classKey, displayName, confidence, scores, dataUrl, imageIncluded }) {
  const id =
    window.crypto?.randomUUID?.() ||
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  return {
    id,
    classKey,
    displayName,
    confidence,
    scores: Array.isArray(scores)
      ? scores.map((score) => ({
          classKey: score.classKey,
          probability: score.probability,
        }))
      : [],
    timestamp: Date.now(),
    image: imageIncluded ? dataUrl || null : null,
    imageIncluded: Boolean(imageIncluded && dataUrl),
  };
}

export function addHistoryEntry(entry) {
  const entries = loadHistory();
  entries.unshift(entry);
  const result = writeHistory(entries);
  if (!result.ok && entry.image) {
    // A photo may exceed the browser's localStorage quota. Fall back to the
    // summary-only form rather than losing the result entirely.
    const summary = { ...entry, image: null, imageIncluded: false };
    const fallbackEntries = loadHistory().map((item) => (item.id === entry.id ? summary : item));
    return { ...writeHistory(fallbackEntries), imageDropped: true };
  }
  return result;
}

export function deleteHistoryEntry(id) {
  const entries = loadHistory().filter((entry) => entry.id !== id);
  return writeHistory(entries);
}

export function clearHistory() {
  try {
    window.localStorage.removeItem(HISTORY_KEY);
    return { ok: true };
  } catch (error) {
    return { ok: false, error };
  }
}

export function clearAllPreferences() {
  const keys = [];
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith(PREFIX)) keys.push(key);
    }
    keys.forEach((key) => window.localStorage.removeItem(key));
    return { ok: true };
  } catch (error) {
    return { ok: false, error };
  }
}

export async function estimateStorage() {
  if (!navigator.storage?.estimate) return null;
  try {
    const estimate = await navigator.storage.estimate();
    return {
      usage: Number(estimate.usage) || 0,
      quota: Number(estimate.quota) || 0,
    };
  } catch {
    return null;
  }
}

export { MAX_HISTORY };

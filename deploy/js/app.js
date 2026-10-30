/*
 * Seed Classifier application controller.
 * All inference runs locally through inference.js; no photos leave the device.
 */
import {
  LANGUAGES,
  translate,
  applyStaticTranslations,
  localeFor,
} from "./i18n.js";
import {
  SECTION_ORDER,
  SEED_GUIDE,
  REGION_ZONES,
  REGIONS,
  QUICK_REGIONS,
  findRegion,
  regionDisplay,
} from "./guide-data.js";
import {
  getPreference,
  setPreference,
  loadHistory,
  addHistoryEntry,
  deleteHistoryEntry,
  clearHistory as clearHistoryStorage,
  clearAllPreferences,
  estimateStorage,
  makeHistoryEntry,
  MAX_HISTORY,
} from "./storage.js";
import {
  InferenceError,
  loadMetadata,
  loadModel,
  resetModel,
  isModelLoaded,
  classifySource,
  loadImageElement,
  drawVideoFrame,
  canvasToDataUrl,
  fileToDataUrl,
  makeThumbnail,
} from "./inference.js";
import * as pwa from "./pwa.js";

const APP_VERSION = "1.0.5";
const GUIDE_CATEGORIES = ["local", "chotara", "huria"];
const SCREEN_IDS = {
  home: "screen-home",
  scan: "screen-scan",
  guide: "screen-guide",
  history: "screen-history",
  settings: "screen-settings",
  chat: "screen-chat",
};
const STAGE_IDS = {
  empty: "scanEmpty",
  camera: "scanCamera",
  preview: "scanPreview",
  loading: "scanLoading",
  error: "scanError",
  result: "scanResult",
};
const SECTION_ICONS = {
  overview: "i-leaf",
  regions: "i-sun",
  soil: "i-soil",
  climate: "i-sun",
  water: "i-water",
  planting: "i-sprout",
  fertilizer: "i-leaf",
  pests: "i-bug",
  harvest: "i-basket",
  limitations: "i-alert",
};
const CAMERA_MESSAGES = {
  insecure: "errorCameraInsecure",
  unsupported: "errorCameraUnsupported",
  permission: "errorCameraPermission",
  notfound: "errorCameraNotFound",
  busy: "errorCameraBusy",
  generic: "errorGeneric",
};

const CHATBOT_RESPONSES = {
  asili: `The **Asili** category includes traditional and farmer-saved maize types with wide local variation. These seeds are often saved from season to season and adapted to local conditions. They may have diverse characteristics in terms of kernel color, size, and shape.`,
  chotara: `**Chotara** refers to hybrid maize types bred from selected parent lines. Fresh seed is normally bought each season as they don't breed true to type. These often have more uniform characteristics and are developed for specific traits like yield or disease resistance.`,
  huria: `**Huria** are open-pollinated improved types. Seed can be saved with careful selection and isolation, but cross-pollination may occur. These were developed to improve upon local varieties while maintaining some ability to save seed.`,
  unrelated: `The image does not match the Asili, Chotara, or Huria categories. This could be a different type of seed, not a maize kernel, or an image that's unclear. Try photographing one kernel on a plain, contrasting surface with even lighting.`,
  guide: `I can help you explore the seed guide! I can show you information about the three seed categories (Asili, Chotara, Huria) or the growing guide for different regions in Tanzania. What would you like to know?`,
  region: `I can help you explore growing guides for Tanzanian regions. I have information about various regions including their ecological zones, soil requirements, planting conditions, seasonal considerations, and seed selection advice. Which region are you interested in?`,
  default: `I'm the Seed AI Assistant! I can help you with:\n\n• Identifying maize seed categories (Asili, Chotara, Huria)\n• Exploring the seed guide and growing conditions\n• Answering questions about your scan results\n• Providing regional growing guidance for Tanzania\n\nWhat would you like to know?`,
};

function getChatbotResponse(message) {
  const lower = (message || "").toLowerCase().trim();
  if (!lower) return CHATBOT_RESPONSES.default;

  if (
    lower.includes("asili") ||
    lower.includes("traditional") ||
    lower.includes("farmer-saved")
  )
    return CHATBOT_RESPONSES.asili;
  if (
    lower.includes("chotara") ||
    lower.includes("hybrid") ||
    lower.includes("parent lines")
  )
    return CHATBOT_RESPONSES.chotara;
  if (
    lower.includes("huria") ||
    lower.includes("improved types") ||
    lower.includes("open-pollinated")
  )
    return CHATBOT_RESPONSES.huria;
  if (lower.includes("unrelated") || lower.includes("not match"))
    return CHATBOT_RESPONSES.unrelated;
  if (lower.includes("guide") || lower.includes("seed guide"))
    return CHATBOT_RESPONSES.guide;
  if (lower.includes("region") || lower.includes("tanzania"))
    return CHATBOT_RESPONSES.region;
  return CHATBOT_RESPONSES.default;
}

function formatChatMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br>");
}

function addMessage(text, sender) {
  const chatWindow = $("chatWindow");
  if (!chatWindow) return;

  const msgDiv = document.createElement("div");
  msgDiv.className = `chat-message ${sender}`;
  msgDiv.innerHTML = formatChatMarkdown(escapeHtml(text));
  chatWindow.appendChild(msgDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

const $ = (id) => document.getElementById(id);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const state = {
  lang: getInitialLanguage(),
  screen: "home",
  guideMode: "types",
  guideCategory: "local",
  regionId: null,
  regionQuery: "",
  metadata: null,
  modelStatus: "idle",
  modelError: null,
  history: [],
  connectivity: pwa.connectivity(),
  offlineChecks: null,
  preparingOffline: false,
  scan: {
    stage: "empty",
    image: null,
    imageDataUrl: "",
    result: null,
    errorKey: "",
    cameraErrorKey: "",
    saved: false,
    saveDismissed: false,
    imageSaved: false,
    saving: false,
  },
  chat: {
    messages: [],
    input: "",
  },
};

const camera = {
  stream: null,
  active: false,
  starting: false,
  facing: getInitialCameraFacing(),
  token: 0,
};

let modelPromise = null;
let metadataPromise = null;
let toastTimer = null;
let pendingConfirm = null;
let updateShown = false;

/* --------------------------------------------------------------------------
 * Helpers
 * ----------------------------------------------------------------------- */

function getInitialLanguage() {
  return getPreference("lang", "en") === "sw" ? "sw" : "en";
}

function getInitialCameraFacing() {
  const saved = getPreference("cameraFacing", "environment");
  return saved === "user" ? "user" : "environment";
}

const t = (key, vars) => translate(state.lang, key, vars);

function pairText(pair) {
  if (!pair) return "";
  return pair[state.lang] || pair.en || "";
}

function escapeHtml(value) {
  const chars = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return String(value == null ? "" : value).replace(/[&<>"']/g, (char) => chars[char]);
}

function formatPercent(value) {
  const pct = Math.max(0, Math.min(1, Number(value) || 0)) * 100;
  return `${pct.toFixed(pct >= 99.95 || pct === 0 ? 0 : 1)}%`;
}

function formatDate(timestamp) {
  try {
    return new Intl.DateTimeFormat(localeFor(state.lang), {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(timestamp));
  } catch {
    return new Date(timestamp).toLocaleString();
  }
}

function formatBytes(bytes) {
  const value = Number(bytes) || 0;
  if (value < 1024) return `${value} B`;
  const units = ["KB", "MB", "GB"];
  let size = value / 1024;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unit]}`;
}

function normalizeSearch(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function displayCategory(classKey, fallback) {
  if (classKey === "other") return t("categoryUnrelated");
  const guide = SEED_GUIDE[classKey];
  if (guide) return t(guide.nameKey);
  if (state.metadata) {
    const index = state.metadata.classes.indexOf(classKey);
    if (index >= 0) return state.metadata.displayNames[index] || fallback || classKey;
  }
  return fallback || classKey;
}

function categoryIllustration(classKey) {
  const guide = SEED_GUIDE[classKey];
  if (guide) return guide.illustration;
  return "assets/img/scan-illustration.svg";
}

function sleepFrame() {
  return new Promise((resolve) => window.requestAnimationFrame(() => resolve()));
}

function focusLater(element) {
  window.requestAnimationFrame(() => {
    if (element && typeof element.focus === "function") {
      element.focus({ preventScroll: true });
    }
  });
}

function replaceHash(hash) {
  try {
    window.history.replaceState(null, "", hash);
  } catch {
    window.location.hash = hash;
  }
}

/* --------------------------------------------------------------------------
 * Chrome, language and connectivity
 * ----------------------------------------------------------------------- */

function setLanguage(lang, options = {}) {
  state.lang = lang === "sw" ? "sw" : "en";
  if (options.persist !== false) setPreference("lang", state.lang);
  applyStaticTranslations(document, state.lang);
  renderLanguageChoices();
  updateChrome();
  renderCurrentScreen();
}

function updateChrome() {
  const langToggle = $("langToggle");
  const nextLang = state.lang === "en" ? "sw" : "en";
  langToggle.textContent = LANGUAGES[nextLang].short;
  langToggle.setAttribute(
    "aria-label",
    `${t("language")}: ${LANGUAGES[nextLang].label}`
  );

  const online = state.connectivity.online;
  $("connBadge").classList.toggle("is-offline", !online);
  $("connBadgeText").textContent = t(online ? "online" : "offline");
  $("homeOfflineBadge").classList.toggle("is-offline", !online);

  const settingsStatus = $("settingsOnlineStatus");
  if (settingsStatus) settingsStatus.classList.toggle("is-offline", !online);
  $("settingsOnlineText").textContent = t(online ? "statusOnline" : "statusOffline");
  $("settingsOnlineBody").textContent = t(
    online ? "statusOnlineBody" : "statusOfflineBody"
  );

  document.title = state.lang === "sw"
    ? "Seed Classifier — Kitambua Mbegu za Mahindi na Mwongozo wa Kilimo"
    : "Seed Classifier — Maize Seed Identification and Growing Guide";
}

function renderLanguageChoices() {
  const english = $("settingsLangEn");
  const swahili = $("settingsLangSw");
  if (!english || !swahili) return;
  english.textContent = t("english");
  swahili.textContent = t("kiswahili");
  english.setAttribute("aria-pressed", String(state.lang === "en"));
  swahili.setAttribute("aria-pressed", String(state.lang === "sw"));
}

function handleConnectivity(connectivity) {
  state.connectivity = connectivity;
  updateChrome();
  if (state.screen === "settings") renderConnectivityDetails();
}

function showToast(message, type = "info", duration = 3400) {
  const toast = $("toast");
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.toggle("error", type === "error");
  toast.classList.add("show");
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
}

/* --------------------------------------------------------------------------
 * Routing
 * ----------------------------------------------------------------------- */

function parseRoute() {
  const raw = window.location.hash.replace(/^#\/?/, "");
  const parts = raw.split("/").filter(Boolean);
  const route = { screen: "home" };

  if (parts[0] === "scan") {
    route.screen = "scan";
  } else if (parts[0] === "history") {
    route.screen = "history";
  } else if (parts[0] === "settings") {
    route.screen = "settings";
  } else if (parts[0] === "guide") {
    route.screen = "guide";
    if (parts[1] === "regions") {
      route.guideMode = "regions";
      route.regionId = findRegion(parts[2]) ? parts[2] : null;
    } else {
      route.guideMode = "types";
      route.guideCategory = GUIDE_CATEGORIES.includes(parts[1]) ? parts[1] : null;
    }
  } else if (parts[0] === "chat") {
    route.screen = "chat";
  }

  return route;
}

function applyRoute(options = {}) {
  const route = parseRoute();
  const previousScreen = state.screen;
  const initial = options.initial === true;

  if (previousScreen === "scan" && route.screen !== "scan") {
    if (state.scan.stage === "camera" || camera.active || camera.starting) {
      stopCamera();
      state.scan.stage = "empty";
    }
  }

  state.screen = route.screen;
  if (route.screen === "guide") {
    state.guideMode = route.guideMode || "types";
    if (route.guideCategory) state.guideCategory = route.guideCategory;
    if (state.guideMode === "regions") {
      state.regionId = route.regionId || null;
    }
  } else if (route.screen === "chat") {
    renderChat();
  }

  showScreen(state.screen);
  renderCurrentScreen();

  if (route.screen === "scan" && state.modelStatus === "idle") {
    ensureModel();
  }

  if (!initial && previousScreen !== state.screen) {
    window.scrollTo(0, 0);
    if (options.focus !== false) {
      const main = $("main");
      window.requestAnimationFrame(() => main.focus({ preventScroll: true }));
    }
  }
}

function showScreen(screen) {
  Object.entries(SCREEN_IDS).forEach(([name, id]) => {
    const node = $(id);
    if (node) node.hidden = name !== screen;
  });

  $$(".nav-item").forEach((item) => {
    const active = item.dataset.nav === screen;
    item.classList.toggle("active", active);
    if (active) item.setAttribute("aria-current", "page");
    else item.removeAttribute("aria-current");
  });
}

function renderCurrentScreen() {
  if (state.screen === "home") renderHome();
  else if (state.screen === "scan") renderScan();
  else if (state.screen === "guide") renderGuide();
  else if (state.screen === "history") renderHistory();
  else if (state.screen === "settings") renderSettings();
  else if (state.screen === "chat") renderChat();
}

/* --------------------------------------------------------------------------
 * Home
 * ----------------------------------------------------------------------- */

function renderHome() {
  $("homeCategories").innerHTML = GUIDE_CATEGORIES.map((key) => {
    const guide = SEED_GUIDE[key];
    return `
      <article class="category-card">
        <div class="category-media">
          <img src="./${escapeHtml(guide.illustration)}" width="480" height="360" alt="" loading="lazy">
        </div>
        <div class="category-body">
          <h3>${escapeHtml(t(guide.nameKey))}</h3>
          <p>${escapeHtml(t(guide.shortKey))}</p>
          <a class="category-link" href="#guide/${key}">
            ${escapeHtml(t("readGuide"))}
            <svg class="icon" aria-hidden="true"><use href="#i-chevron-right"></use></svg>
          </a>
        </div>
      </article>`;
  }).join("");

  $("homeQuickRegions").innerHTML = QUICK_REGIONS.map((id) => {
    const region = findRegion(id);
    if (!region) return "";
    return `<button class="chip" type="button" data-quick-region="${escapeHtml(id)}">${escapeHtml(pairText(region.name))}</button>`;
  }).join("");

  renderInstallState();
}

/* --------------------------------------------------------------------------
 * Model lifecycle
 * ----------------------------------------------------------------------- */

function setModelStatus(status, error = null) {
  state.modelStatus = status;
  state.modelError = error;
  updateScanStatus();
  renderModelMeta();
}

function updateScanStatus() {
  const pill = $("scanStatus");
  const text = $("scanStatusText");
  if (!pill || !text) return;

  pill.classList.toggle("loading", state.modelStatus === "idle" || state.modelStatus === "loading");
  pill.classList.toggle("error", state.modelStatus === "error");

  if (state.modelStatus === "ready") {
    text.textContent = t("modelReady");
  } else if (state.modelStatus === "error") {
    text.textContent = t("modelFailed");
  } else {
    text.textContent = t("modelLoading");
  }

  if (state.modelStatus === "error") {
    pill.tabIndex = 0;
    pill.setAttribute("role", "button");
    pill.setAttribute("title", t("retry"));
    pill.setAttribute("aria-label", `${t("modelFailed")}. ${t("retry")}`);
  } else {
    pill.removeAttribute("tabindex");
    pill.removeAttribute("role");
    pill.removeAttribute("title");
    pill.removeAttribute("aria-label");
  }
}

function renderChat() {
  const chatWindow = $("chatWindow");
  const chatInput = $("chatInput");
  if (!chatWindow || !chatInput) return;

  chatWindow.innerHTML = "";

  if (state.chat.messages.length === 0) {
    const welcome = document.createElement("div");
    welcome.className = "chat-welcome";
    welcome.innerHTML = `<p><strong>${t("chatTitle")}</strong></p><p>${t("chatSubtitle")}</p>`;
    chatWindow.appendChild(welcome);
  }

  state.chat.messages.forEach((msg) => {
    const msgDiv = document.createElement("div");
    msgDiv.className = `chat-message ${msg.sender}`;
    msgDiv.innerHTML = formatChatMarkdown(escapeHtml(msg.text));
    chatWindow.appendChild(msgDiv);
  });

  chatInput.focus();
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

async function ensureMetadata() {
  if (state.metadata) return true;
  if (!metadataPromise) {
    metadataPromise = loadMetadata()
      .then((meta) => {
        state.metadata = meta;
        renderModelMeta();
        return true;
      })
      .catch(() => false)
      .finally(() => {
        metadataPromise = null;
      });
  }
  return metadataPromise;
}

async function ensureModel(force = false) {
  if (force) resetModel();
  if (isModelLoaded()) {
    setModelStatus("ready");
    return true;
  }

  if (!modelPromise) {
    setModelStatus("loading");
    modelPromise = (async () => {
      state.metadata = await loadMetadata();
      renderModelMeta();
      await loadModel();
      return true;
    })();
    modelPromise.catch(() => {});
  }

  try {
    await modelPromise;
    modelPromise = null;
    setModelStatus("ready");
    if (state.screen === "scan") renderScan();
    return true;
  } catch (error) {
    modelPromise = null;
    setModelStatus("error", error);
    if (state.screen === "scan") renderScanStatusOnly();
    return false;
  }
}

/* --------------------------------------------------------------------------
 * Scan
 * ----------------------------------------------------------------------- */

function setStage(stage) {
  state.scan.stage = stage;
  Object.entries(STAGE_IDS).forEach(([name, id]) => {
    const node = $(id);
    if (node) node.hidden = name !== stage;
  });
}

function renderScan() {
  updateScanStatus();
  setStage(state.scan.stage);

  const preview = $("previewImage");
  if (preview) {
    preview.alt = t("previewAlt");
    if (state.scan.imageDataUrl && preview.src !== state.scan.imageDataUrl) {
      preview.src = state.scan.imageDataUrl;
    }
  }

  if (state.scan.stage === "camera") paintCameraState();
  if (state.scan.stage === "error") renderScanError();
  if (state.scan.stage === "result") renderResult();

  if (state.scan.stage === "loading") {
    $("scanLoadingTitle").textContent = t("scanningTitle");
    $("scanLoadingText").textContent = t("scanningBody");
  }
}

function renderScanStatusOnly() {
  updateScanStatus();
}

function renderScanError() {
  const key = state.scan.errorKey || "errorGeneric";
  $("scanErrorTitle").textContent =
    key === "errorModel" ? t("modelFailed") : t("errorGeneric");
  $("scanErrorText").textContent = t(key);
}

function scanErrorKey(error) {
  const code = error && error.code ? String(error.code) : "";
  if (
    code === "runtime" ||
    code === "preprocess" ||
    code.startsWith("metadata") ||
    code.startsWith("model")
  ) {
    return "errorModel";
  }
  if (code === "file-type") return "errorFileType";
  if (code === "file-size") return "errorFileSize";
  if (code === "inference" || code === "output-shape") return "errorInference";
  if (code === "image-decode" || code === "image-empty" || code === "file-missing") {
    return "errorImage";
  }
  return "errorGeneric";
}

function showScanError(key) {
  state.scan.errorKey = key;
  setStage("error");
  renderScanError();
  focusLater($("scanErrorTitle"));
}

async function identify() {
  if (!state.scan.image) {
    showScanError("errorNoImage");
    return;
  }

  state.scan.errorKey = "";
  setStage("loading");
  $("scanLoadingTitle").textContent = t("scanningTitle");
  $("scanLoadingText").textContent = t("scanningBody");
  await sleepFrame();

  const ready = await ensureModel();
  if (!ready) {
    showScanError("errorModel");
    return;
  }

  try {
    const result = await classifySource(state.scan.image);
    state.scan.result = result;
    state.scan.saved = false;
    state.scan.saveDismissed = false;
    state.scan.imageSaved = false;
    setStage("result");
    renderResult();
    focusLater($("resultClassTitle"));
  } catch (error) {
    showScanError(scanErrorKey(error));
  }
}

function retryScan() {
  const key = state.scan.errorKey;
  if (key === "errorModel") resetModel();

  if (state.scan.image) {
    identify();
    return;
  }

  state.scan.errorKey = "";
  setStage("empty");
  if (key === "errorModel") ensureModel(true);
}

async function setImage(dataUrl) {
  let image;
  try {
    image = await loadImageElement(dataUrl);
  } catch {
    showScanError("errorImage");
    return;
  }

  stopCamera();
  state.scan.image = image;
  state.scan.imageDataUrl = dataUrl;
  state.scan.result = null;
  state.scan.errorKey = "";
  state.scan.cameraErrorKey = "";
  state.scan.saved = false;
  state.scan.saveDismissed = false;
  state.scan.imageSaved = false;
  $("previewImage").src = dataUrl;
  $("previewImage").alt = t("previewAlt");
  setStage("preview");
  hideCameraError();
}

async function handleFile(file) {
  if (!file) return;
  if (file.type && !file.type.startsWith("image/")) {
    showScanError("errorFileType");
    return;
  }
  try {
    const result = await fileToDataUrl(file);
    await setImage(result.dataUrl);
  } catch (error) {
    showScanError(scanErrorKey(error));
  }
}

function resetScan() {
  stopCamera();
  state.scan.image = null;
  state.scan.imageDataUrl = "";
  state.scan.result = null;
  state.scan.errorKey = "";
  state.scan.cameraErrorKey = "";
  state.scan.saved = false;
  state.scan.saveDismissed = false;
  state.scan.imageSaved = false;
  state.scan.saving = false;
  $("previewImage").removeAttribute("src");
  $("scanResult").innerHTML = "";
  hideCameraError();
  setStage("empty");
}

function renderResult() {
  const result = state.scan.result;
  if (!result) return;

  const unrelated = result.classKey === "other";
  const guide = SEED_GUIDE[result.classKey] || null;
  const categoryName = displayCategory(result.classKey, result.displayName);
  const confidence = Number(result.confidence) || 0;
  const lowConfidence = !unrelated && confidence < 0.6;
  const sortedScores = result.scores
    .slice()
    .sort((a, b) => b.probability - a.probability);
  const topKey = result.classKey;

  const scoresHtml = sortedScores.map((score) => {
    const name = displayCategory(score.classKey, score.displayName);
    const pct = Math.max(0, Math.min(1, Number(score.probability) || 0)) * 100;
    return `
      <div class="score-row${score.classKey === topKey ? " is-top" : ""}">
        <span class="score-name">${escapeHtml(name)}</span>
        <span class="score-bar"><span class="score-fill" style="width:${pct.toFixed(2)}%"></span></span>
        <span class="score-value">${escapeHtml(formatPercent(score.probability))}</span>
      </div>`;
  }).join("");

  const explainer = unrelated
    ? `<p>${escapeHtml(t("unrelatedBody"))}</p>`
    : `<p>${escapeHtml(t(guide.shortKey))}</p><p>${escapeHtml(t("classDisclaimer"))}</p>`;

  const exploreButton = guide
    ? `<button class="btn btn-primary" type="button" data-action="explore-guide">
         <svg class="icon" aria-hidden="true"><use href="#i-leaf"></use></svg>
         <span>${escapeHtml(t("exploreCategory", { name: categoryName }))}</span>
       </button>`
    : `<button class="btn btn-primary" type="button" data-action="try-again">
         <svg class="icon" aria-hidden="true"><use href="#i-camera"></use></svg>
         <span>${escapeHtml(t("tryAgain"))}</span>
       </button>`;

  let saveHtml = "";
  if (state.scan.saved) {
    saveHtml = `
      <div class="saved-note">
        <svg class="icon" aria-hidden="true"><use href="#i-check"></use></svg>
        <span>${escapeHtml(t(state.scan.imageSaved ? "savedWithPhoto" : "savedSummary"))}</span>
      </div>`;
  } else if (state.scan.saveDismissed) {
    saveHtml = `
      <div class="save-panel">
        <p style="margin-bottom:0.6rem">${escapeHtml(t("notSaved"))}</p>
        <button class="btn btn-secondary" type="button" data-action="open-save">
          <svg class="icon" aria-hidden="true"><use href="#i-history"></use></svg>
          <span>${escapeHtml(t("saveToHistory"))}</span>
        </button>
      </div>`;
  } else {
    saveHtml = `
      <div class="save-panel">
        <h3>${escapeHtml(t("saveConsentTitle"))}</h3>
        <p>${escapeHtml(t("saveConsentBody"))}</p>
        <div class="save-actions">
          <button class="btn btn-primary" type="button" data-action="save-summary">
            <svg class="icon" aria-hidden="true"><use href="#i-check"></use></svg>
            <span>${escapeHtml(t("saveSummary"))}</span>
          </button>
          <button class="btn btn-secondary" type="button" data-action="save-photo">
            <svg class="icon" aria-hidden="true"><use href="#i-image"></use></svg>
            <span>${escapeHtml(t("saveWithPhoto"))}</span>
          </button>
          <button class="btn btn-quiet" type="button" data-action="dont-save">
            ${escapeHtml(t("dontSave"))}
          </button>
        </div>
      </div>`;
  }

  const imageHtml = state.scan.imageDataUrl
    ? `<img class="result-image" src="${escapeHtml(state.scan.imageDataUrl)}" alt="${escapeHtml(t("resultImageAlt"))}">`
    : "";

  $("scanResult").innerHTML = `
    <article class="result-card${unrelated ? " unrelated-result" : ""}">
      <div class="result-hero">
        ${imageHtml}
        <span class="result-badge">${escapeHtml(t("predictedClass"))}</span>
      </div>
      <div class="result-body">
        <div class="result-kicker">
          <svg class="icon" aria-hidden="true"><use href="#i-sparkle"></use></svg>
          <span>${escapeHtml(t("resultTitle"))}</span>
        </div>
        <h2 class="result-class" id="resultClassTitle" tabindex="-1">${escapeHtml(categoryName)}</h2>

        <div class="confidence-block">
          <div class="confidence-top">
            <span class="confidence-label">${escapeHtml(t("confidence"))}</span>
            <strong class="confidence-number">${escapeHtml(formatPercent(confidence))}</strong>
          </div>
          <div class="confidence-track">
            <div class="confidence-fill${lowConfidence ? " low" : ""}" style="width:${(confidence * 100).toFixed(2)}%"></div>
          </div>
          <p class="confidence-note">${escapeHtml(t("confidenceDisclaimer"))}</p>
          ${lowConfidence ? `<div class="low-confidence">${escapeHtml(t("lowConfidence"))}</div>` : ""}
        </div>

        <p class="confidence-label">${escapeHtml(t("classProbabilities"))}</p>
        <div class="score-list">${scoresHtml}</div>

        <div class="result-explainer">${explainer}</div>
        ${saveHtml}

        <div class="result-actions">
          ${exploreButton}
          <button class="btn btn-secondary" type="button" data-action="scan-another">
            <svg class="icon" aria-hidden="true"><use href="#i-refresh"></use></svg>
            <span>${escapeHtml(t("scanAnother"))}</span>
          </button>
        </div>
      </div>
    </article>`;
}

async function saveResult(withPhoto) {
  if (!state.scan.result || state.scan.saved || state.scan.saving) return;
  state.scan.saving = true;
  $$("[data-action^='save-']", $("scanResult")).forEach((button) => {
    button.disabled = true;
  });

  let thumbnail = null;
  if (withPhoto && state.scan.imageDataUrl) {
    thumbnail = await makeThumbnail(state.scan.imageDataUrl, 420);
  }

  const result = state.scan.result;
  const entry = makeHistoryEntry({
    classKey: result.classKey,
    displayName: result.displayName,
    confidence: result.confidence,
    scores: result.scores,
    dataUrl: thumbnail,
    imageIncluded: Boolean(thumbnail),
  });

  const outcome = addHistoryEntry(entry);
  state.scan.saving = false;

  if (!outcome.ok) {
    showToast(t("errorGeneric"), "error");
    renderResult();
    return;
  }

  state.history = loadHistory();
  state.scan.saved = true;
  state.scan.saveDismissed = false;
  state.scan.imageSaved = Boolean(thumbnail) && !outcome.imageDropped;
  renderResult();

  if (outcome.imageDropped) {
    showToast(t("savedSummary"));
  } else {
    showToast(t(state.scan.imageSaved ? "savedWithPhoto" : "savedSummary"));
  }
}

/* --------------------------------------------------------------------------
 * Camera
 * ----------------------------------------------------------------------- */

function paintCameraState() {
  const status = $("cameraStatus");
  const error = $("cameraError");
  const errorText = $("cameraErrorText");
  const capture = $("captureBtn");
  if (!status || !error || !errorText || !capture) return;

  if (state.scan.cameraErrorKey) {
    error.hidden = false;
    status.hidden = true;
    errorText.textContent = t(state.scan.cameraErrorKey);
    capture.disabled = true;
    return;
  }

  error.hidden = true;
  status.hidden = false;
  status.textContent = camera.active ? t("cameraReady") : t("cameraOpening");
  capture.disabled = !camera.active;
}

function hideCameraError() {
  state.scan.cameraErrorKey = "";
  const error = $("cameraError");
  if (error) error.hidden = true;
  paintCameraState();
}

function showCameraError(code) {
  state.scan.cameraErrorKey = CAMERA_MESSAGES[code] || CAMERA_MESSAGES.generic;
  setStage("camera");
  paintCameraState();
}

async function openCamera() {
  state.scan.errorKey = "";
  state.scan.cameraErrorKey = "";
  setStage("camera");
  paintCameraState();

  if (!window.isSecureContext) {
    showCameraError("insecure");
    return;
  }
  if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== "function") {
    showCameraError("unsupported");
    return;
  }

  await startCamera();
}

async function startCamera() {
  stopCamera({ keepStage: true });
  const token = ++camera.token;
  camera.starting = true;
  camera.active = false;
  state.scan.cameraErrorKey = "";
  setStage("camera");
  paintCameraState();

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: { ideal: camera.facing },
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
    });

    if (token !== camera.token || state.scan.stage !== "camera") {
      stream.getTracks().forEach((track) => track.stop());
      return;
    }

    camera.stream = stream;
    camera.active = true;
    camera.starting = false;
    const video = $("cameraVideo");
    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;
    try {
      await video.play();
    } catch {
      /* The stream may still render via autoplay after a user gesture. */
    }
    if (token === camera.token) paintCameraState();
  } catch (error) {
    if (token !== camera.token) return;
    camera.starting = false;
    camera.active = false;
    camera.stream = null;
    const name = error && error.name ? error.name : "";
    if (name === "NotAllowedError" || name === "SecurityError") {
      showCameraError("permission");
    } else if (name === "NotFoundError" || name === "OverconstrainedError") {
      showCameraError("notfound");
    } else if (name === "NotReadableError" || name === "AbortError") {
      showCameraError("busy");
    } else {
      showCameraError("generic");
    }
  }
}

function stopCamera(options = {}) {
  camera.token += 1;
  camera.starting = false;
  camera.active = false;
  if (camera.stream) {
    camera.stream.getTracks().forEach((track) => track.stop());
    camera.stream = null;
  }
  const video = $("cameraVideo");
  if (video) {
    try {
      video.pause();
    } catch {
      /* ignore */
    }
    video.srcObject = null;
  }
  if (!options.keepStage && state.scan.stage === "camera") {
    state.scan.stage = "empty";
    setStage("empty");
  }
  paintCameraState();
}

async function switchCamera() {
  if (camera.starting) return;
  camera.facing = camera.facing === "environment" ? "user" : "environment";
  setPreference("cameraFacing", camera.facing);
  await startCamera();
}

function capturePhoto() {
  if (!camera.active) return;
  try {
    const canvas = drawVideoFrame($("cameraVideo"));
    const dataUrl = canvasToDataUrl(canvas, 0.9);
    setImage(dataUrl);
  } catch {
    showToast(t("errorImage"), "error");
  }
}

function closeCamera() {
  stopCamera();
  state.scan.stage = "empty";
  setStage("empty");
}

function retakePhoto() {
  resetScan();
  openCamera();
}

/* --------------------------------------------------------------------------
 * Guide
 * ----------------------------------------------------------------------- */

function renderGuide() {
  const typesView = $("guideTypesView");
  const regionsView = $("guideRegionsView");
  const typesMode = state.guideMode === "types";

  $("guideModeTypes").setAttribute("aria-selected", String(typesMode));
  $("guideModeRegions").setAttribute("aria-selected", String(!typesMode));
  typesView.hidden = !typesMode;
  regionsView.hidden = typesMode;

  if (typesMode) {
    renderGuideCategories();
  } else {
    renderRegions();
  }
}

function renderGuideCategories() {
  if (!GUIDE_CATEGORIES.includes(state.guideCategory)) {
    state.guideCategory = "local";
  }

  $("guideTabs").innerHTML = GUIDE_CATEGORIES.map((key) => {
    const guide = SEED_GUIDE[key];
    return `<button class="pill-tab" type="button" role="tab" aria-selected="${state.guideCategory === key}" data-guide-category="${key}">${escapeHtml(t(guide.nameKey))}</button>`;
  }).join("");

  const guide = SEED_GUIDE[state.guideCategory];
  const sectionsHtml = SECTION_ORDER.map((sectionKey) => {
    const section = guide.sections[sectionKey];
    const content = section[state.lang] || section.en;
    const points = (content.points || [])
      .map((point) => `<li>${escapeHtml(point)}</li>`)
      .join("");
    return `
      <article class="guide-section">
        <div class="guide-section-head">
          <span class="guide-icon"><svg class="icon" aria-hidden="true"><use href="#${SECTION_ICONS[sectionKey] || "i-leaf"}"></use></svg></span>
          <h3>${escapeHtml(t(`section${sectionKey.charAt(0).toUpperCase()}${sectionKey.slice(1)}`))}</h3>
        </div>
        <p class="guide-text">${escapeHtml(content.text)}</p>
        ${points ? `<ul class="guide-points">${points}</ul>` : ""}
      </article>`;
  }).join("");

  $("guideCategory").innerHTML = `
    <div class="category-hero">
      <div class="category-hero-media">
        <img src="./${escapeHtml(guide.illustration)}" width="520" height="390" alt="">
      </div>
      <div class="category-hero-body">
        <span class="eyebrow">${escapeHtml(t("whatItMeans"))}</span>
        <h2>${escapeHtml(t(guide.nameKey))}</h2>
        <p>${escapeHtml(t(guide.shortKey))}</p>
        <p class="privacy-line">
          <svg class="icon" aria-hidden="true"><use href="#i-info"></use></svg>
          <span>${escapeHtml(t("classDisclaimer"))}</span>
        </p>
      </div>
    </div>
    <div class="guide-sections">${sectionsHtml}</div>
    <p class="history-note">${escapeHtml(t("officialNote"))}</p>`;
}

function renderRegions() {
  const selected = findRegion(state.regionId);
  const searchWrap = $("regionSearchInput").closest(".region-search");
  const hint = $("regionSelectHint");

  if (selected) {
    searchWrap.hidden = true;
    hint.hidden = true;
    $("regionList").hidden = true;
    $("regionEmpty").hidden = true;
    renderRegionDetail(selected);
    return;
  }

  searchWrap.hidden = false;
  hint.hidden = false;
  $("regionList").hidden = false;
  $("regionDetail").innerHTML = "";
  if ($("regionSearchInput").value !== state.regionQuery) {
    $("regionSearchInput").value = state.regionQuery;
  }
  renderRegionList();
}

function renderRegionList() {
  const query = normalizeSearch(state.regionQuery);
  const matches = REGIONS.filter((region) => {
    if (!query) return true;
    const zone = REGION_ZONES[region.zone];
    const haystack = [
      region.name.en,
      region.name.sw,
      zone?.name?.en,
      zone?.name?.sw,
      region.id,
    ]
      .map(normalizeSearch)
      .join(" ");
    return haystack.includes(query);
  });

  $("regionList").innerHTML = matches.map((region) => {
    const zone = REGION_ZONES[region.zone];
    return `
      <li>
        <button class="region-option" type="button" data-region-id="${escapeHtml(region.id)}">
          <span class="region-name">${escapeHtml(pairText(region.name))}</span>
          <span class="region-zone">${escapeHtml(pairText(zone?.name))}</span>
        </button>
      </li>`;
  }).join("");

  $("regionEmpty").hidden = matches.length > 0;
}

function renderRegionDetail(region) {
  const display = regionDisplay(region, state.lang);
  $("regionDetail").innerHTML = `
    <div class="region-detail">
      <div class="region-detail-head">
        <div>
          <span class="eyebrow">${escapeHtml(t("regionSelected"))}</span>
          <h2 id="regionDetailTitle" tabindex="-1">${escapeHtml(pairText(region.name))}</h2>
          <p>${escapeHtml(t("regionEcologicalZone"))}: ${escapeHtml(display.zone)}</p>
        </div>
        <button class="btn btn-secondary" type="button" data-action="change-region">
          <svg class="icon" aria-hidden="true"><use href="#i-search"></use></svg>
          <span>${escapeHtml(t("changeRegion"))}</span>
        </button>
      </div>
      <div class="detail-grid">
        <div class="detail-block region-local-note">
          <div class="detail-label"><svg class="icon" aria-hidden="true"><use href="#i-info"></use></svg><span>${escapeHtml(t("regionLocalNote"))}</span></div>
          <p class="detail-text">${escapeHtml(display.localNote)}</p>
        </div>
        <div class="detail-block">
          <div class="detail-label"><svg class="icon" aria-hidden="true"><use href="#i-sun"></use></svg><span>${escapeHtml(t("regionPlantingConditions"))}</span></div>
          <p class="detail-text">${escapeHtml(display.conditions)}</p>
        </div>
        <div class="detail-block">
          <div class="detail-label"><svg class="icon" aria-hidden="true"><use href="#i-soil"></use></svg><span>${escapeHtml(t("regionSoilRainfall"))}</span></div>
          <p class="detail-text">${escapeHtml(display.soil)}</p>
        </div>
        <div class="detail-block">
          <div class="detail-label"><svg class="icon" aria-hidden="true"><use href="#i-water"></use></svg><span>${escapeHtml(t("regionSeason"))}</span></div>
          <p class="detail-text">${escapeHtml(display.season)}</p>
        </div>
        <div class="detail-block">
          <div class="detail-label"><svg class="icon" aria-hidden="true"><use href="#i-sprout"></use></svg><span>${escapeHtml(t("regionSeedAdvice"))}</span></div>
          <p class="detail-text">${escapeHtml(display.advice)}</p>
        </div>
      </div>
      <div class="result-explainer">
        <p>${escapeHtml(t("regionCaveat"))}</p>
      </div>
      <p class="history-note">${escapeHtml(t("regionSeedWarning"))}</p>
    </div>`;
}

function goGuideMode(mode) {
  state.guideMode = mode;
  if (mode === "regions") {
    replaceHash(state.regionId ? `#guide/regions/${state.regionId}` : "#guide/regions");
  } else {
    replaceHash(`#guide/${state.guideCategory}`);
  }
  renderGuide();
}

function selectGuideCategory(category) {
  if (!GUIDE_CATEGORIES.includes(category)) return;
  state.guideCategory = category;
  replaceHash(`#guide/${category}`);
  renderGuide();
}

function selectRegion(id) {
  const region = findRegion(id);
  if (!region) return;
  state.regionId = region.id;
  state.regionQuery = "";
  replaceHash(`#guide/regions/${region.id}`);
  renderGuide();
  focusLater($("regionDetailTitle"));
}

function changeRegion() {
  state.regionId = null;
  state.regionQuery = "";
  replaceHash("#guide/regions");
  renderGuide();
  focusLater($("regionSearchInput"));
}

/* --------------------------------------------------------------------------
 * History
 * ----------------------------------------------------------------------- */

function renderHistory() {
  state.history = loadHistory();
  const count = state.history.length;
  $("historyCount").textContent = t("historyCount", { count });
  $("clearHistoryBtn").disabled = count === 0;

  if (!count) {
    $("historyList").innerHTML = `
      <div class="empty-state">
        <div class="empty-illustration">
          <img src="./assets/img/empty-history.svg" width="420" height="300" alt="">
        </div>
        <h2>${escapeHtml(t("historyEmptyTitle"))}</h2>
        <p>${escapeHtml(t("historyEmptyBody"))}</p>
        <button class="btn btn-primary" type="button" data-action="start-scan">
          <svg class="icon" aria-hidden="true"><use href="#i-scan"></use></svg>
          <span>${escapeHtml(t("historyStartScan"))}</span>
        </button>
      </div>`;
    return;
  }

  $("historyList").innerHTML = state.history.map((entry) => {
    const category = displayCategory(entry.classKey, entry.displayName);
    const date = formatDate(entry.timestamp);
    const hasImage = Boolean(entry.image);
    const thumb = hasImage
      ? `<img src="${escapeHtml(entry.image)}" alt="">`
      : `<img src="./${escapeHtml(categoryIllustration(entry.classKey))}" alt="">`;
    const pct = Math.max(0, Math.min(1, Number(entry.confidence) || 0)) * 100;
    return `
      <article class="history-card">
        <div class="history-thumb${hasImage ? "" : " placeholder"}">${thumb}</div>
        <div class="history-info">
          <div class="history-top">
            <h2 class="history-class">${escapeHtml(category)}</h2>
          </div>
          <p class="history-date">${escapeHtml(t("savedOn", { date }))}${hasImage ? "" : ` · ${escapeHtml(t("historyNoPhoto"))}`}</p>
          <div class="history-confidence">
            <span>${escapeHtml(formatPercent(entry.confidence))}</span>
            <span class="mini-track"><span class="mini-fill" style="display:block;width:${pct.toFixed(2)}%"></span></span>
          </div>
          <div class="history-actions">
            <button class="btn btn-secondary" type="button" data-action="view" data-id="${escapeHtml(entry.id)}">
              <svg class="icon" aria-hidden="true"><use href="#i-eye"></use></svg>
              <span>${escapeHtml(t("viewResult"))}</span>
            </button>
            <button class="btn btn-danger-soft" type="button" data-action="delete" data-id="${escapeHtml(entry.id)}" aria-label="${escapeHtml(t("deleteEntry"))}" title="${escapeHtml(t("deleteEntry"))}">
              <svg class="icon" aria-hidden="true"><use href="#i-trash"></use></svg>
            </button>
          </div>
        </div>
      </article>`;
  }).join("");
}

function openHistoryEntry(id) {
  const entry = state.history.find((item) => item.id === id);
  if (!entry) return;

  const guide = SEED_GUIDE[entry.classKey] || null;
  const category = displayCategory(entry.classKey, entry.displayName);
  const date = formatDate(entry.timestamp);
  const scores = Array.isArray(entry.scores)
    ? entry.scores
        .slice()
        .sort((a, b) => b.probability - a.probability)
        .map((score) => `
          <div class="score-row${score.classKey === entry.classKey ? " is-top" : ""}">
            <span class="score-name">${escapeHtml(displayCategory(score.classKey))}</span>
            <span class="score-bar"><span class="score-fill" style="width:${(Math.max(0, Math.min(1, score.probability)) * 100).toFixed(2)}%"></span></span>
            <span class="score-value">${escapeHtml(formatPercent(score.probability))}</span>
          </div>`)
        .join("")
    : "";
  const image = entry.image
    ? `<img class="history-detail-image" src="${escapeHtml(entry.image)}" alt="${escapeHtml(t("resultImageAlt"))}">`
    : `<p class="history-note">${escapeHtml(t("historyNoPhoto"))}</p>`;
  const guideButton = guide
    ? `<div class="result-actions">
         <button class="btn btn-primary" type="button" data-history-guide="${escapeHtml(entry.classKey)}">
           <svg class="icon" aria-hidden="true"><use href="#i-leaf"></use></svg>
           <span>${escapeHtml(t("exploreCategory", { name: category }))}</span>
         </button>
       </div>`
    : "";

  $("historyDialogContent").innerHTML = `
    ${image}
    <div class="history-detail-meta">
      <span>${escapeHtml(category)}</span>
      <span>${escapeHtml(t("confidence"))}: ${escapeHtml(formatPercent(entry.confidence))}</span>
      <span>${escapeHtml(date)}</span>
    </div>
    ${scores ? `<p class="confidence-label">${escapeHtml(t("classProbabilities"))}</p><div class="score-list">${scores}</div>` : ""}
    <div class="result-explainer">
      <p>${escapeHtml(guide ? t(guide.shortKey) : t("unrelatedBody"))}</p>
      <p>${escapeHtml(t("classDisclaimer"))}</p>
    </div>
    ${guideButton}`;
  $("historyDialogContent").scrollTop = 0;
  if (!$("historyDialog").open) $("historyDialog").showModal();
}

async function deleteEntry(id) {
  const entry = state.history.find((item) => item.id === id);
  if (!entry) return;
  const confirmed = await askConfirm(
    t("deleteEntryTitle"),
    t("deleteEntryBody"),
    t("deleteConfirm"),
    true
  );
  if (!confirmed) return;
  deleteHistoryEntry(id);
  state.history = loadHistory();
  renderHistory();
  showToast(t("historyCleared"));
}

async function clearAllHistory() {
  if (!state.history.length) return;
  const confirmed = await askConfirm(
    t("clearHistoryTitle"),
    t("clearHistoryBody"),
    t("clearHistoryConfirm"),
    true
  );
  if (!confirmed) return;
  clearHistoryStorage();
  state.history = [];
  renderHistory();
  renderScan();
  renderSettingsDataActions();
  showToast(t("historyCleared"));
}

/* --------------------------------------------------------------------------
 * Settings
 * ----------------------------------------------------------------------- */

function renderSettings() {
  if (!state.metadata) ensureMetadata();
  renderLanguageChoices();
  renderConnectivityDetails();
  renderInstallState();
  renderModelMeta();
  renderSettingsDataActions();
  renderOfflineChecks();
  refreshOfflineChecks();
  refreshStorageInfo();
}

function renderConnectivityDetails() {
  const online = state.connectivity.online;
  const status = $("settingsOnlineStatus");
  if (!status) return;
  status.classList.toggle("is-offline", !online);
  $("settingsOnlineText").textContent = t(online ? "statusOnline" : "statusOffline");
  $("settingsOnlineBody").textContent = t(
    online ? "statusOnlineBody" : "statusOfflineBody"
  );
  $("prepareOfflineBtn").disabled =
    state.preparingOffline ||
    (!pwa.isNativeApp() && !("serviceWorker" in navigator));
}

function renderInstallState() {
  const installed = pwa.isInstalled();
  const available = pwa.canInstall();
  const card = $("homeInstallCard");
  if (card) card.hidden = installed || !available;

  const button = $("settingsInstallBtn");
  const status = $("installStatusText");
  const note = $("installPromptNote");
  if (button) {
    button.hidden = installed;
    button.disabled = !available;
  }
  if (status) {
    status.textContent = t(installed ? "installedStatus" : "notInstalledStatus");
  }
  if (note) {
    note.textContent = installed
      ? t("installInstalledBody")
      : available
        ? t("installSectionBody")
        : t("installUnavailable");
  }
}

function renderSettingsDataActions() {
  const hasHistory = state.history.length > 0;
  $("settingsClearHistory").disabled = !hasHistory;
}

function renderModelMeta() {
  const grid = $("modelMeta");
  if (!grid) return;
  const meta = state.metadata;
  const size = meta ? `${meta.imgSize} × ${meta.imgSize}` : "—";
  const classes = meta ? String(meta.classes.length) : "—";
  const accuracy =
    meta && Number.isFinite(Number(meta.raw?.test_accuracy))
      ? formatPercent(Number(meta.raw.test_accuracy))
      : "—";

  grid.innerHTML = `
    <div class="meta-item"><span>${escapeHtml(t("modelSizeLabel"))}</span><strong>${escapeHtml(size)}</strong></div>
    <div class="meta-item"><span>${escapeHtml(t("modelClassesLabel"))}</span><strong>${escapeHtml(classes)}</strong></div>
    <div class="meta-item"><span>${escapeHtml(t("modelAccuracyLabel"))}</span><strong>${escapeHtml(accuracy)}</strong></div>
    <div class="meta-item"><span>${escapeHtml(t("version"))}</span><strong>${escapeHtml(APP_VERSION)}</strong></div>`;
}

function renderOfflineChecks() {
  const container = $("offlineChecks");
  if (!container) return;
  const checks = state.offlineChecks;
  const entries = [
    ["offlineShell", checks ? checks.shell : false],
    ["offlineModel", checks ? checks.model : false],
    ["offlineRuntime", checks ? checks.runtime : false],
  ];

  container.innerHTML = entries.map(([labelKey, ready]) => `
    <div class="offline-check${ready ? " ready" : ""}">
      <span class="mini-status"></span>
      <strong>${escapeHtml(t(labelKey))}</strong>
      <span>${escapeHtml(t(checks ? (ready ? "offlineAssetReady" : "offlineAssetMissing") : "loading"))}</span>
    </div>`).join("");
}

let offlineCheckSequence = 0;
async function refreshOfflineChecks() {
  if (!("caches" in window)) return;
  const sequence = ++offlineCheckSequence;
  try {
    const checks = await pwa.checkOfflineAssets();
    if (sequence !== offlineCheckSequence) return;
    state.offlineChecks = checks;
    if (state.screen === "settings") renderOfflineChecks();
  } catch {
    if (sequence !== offlineCheckSequence) return;
    state.offlineChecks = { supported: false, shell: false, model: false, runtime: false };
    if (state.screen === "settings") renderOfflineChecks();
  }
}

async function prepareOffline() {
  if (state.preparingOffline) return;
  state.preparingOffline = true;
  const button = $("prepareOfflineBtn");
  button.disabled = true;
  button.querySelector("span").textContent = t("offlinePreparing");

  const result = await pwa.prepareOffline();
  state.preparingOffline = false;
  button.disabled = false;
  button.querySelector("span").textContent = t("prepareOffline");

  if (result.ok) {
    showToast(t("offlineReadyToast"));
    refreshOfflineChecks();
    refreshStorageInfo();
  } else {
    showToast(t("offlineFailedToast"), "error");
  }
}

async function refreshStorageInfo() {
  const node = $("storageInfo");
  if (!node) return;
  const estimate = await estimateStorage();
  node.textContent = estimate
    ? t("storageUsed", { size: formatBytes(estimate.usage) })
    : t("storageUnknown");
}

async function resetApp() {
  const confirmed = await askConfirm(
    t("clearAllTitle"),
    t("clearAllBody"),
    t("clearAllConfirm"),
    true
  );
  if (!confirmed) return;

  clearAllPreferences();
  clearHistoryStorage();
  await pwa.clearAppCaches();

  resetModel();
  state.metadata = null;
  state.modelStatus = "idle";
  state.modelError = null;
  state.history = [];
  state.lang = "en";
  state.guideCategory = "local";
  state.guideMode = "types";
  state.regionId = null;
  state.regionQuery = "";
  state.offlineChecks = null;
  resetScan();
  applyStaticTranslations(document, state.lang);
  renderLanguageChoices();
  updateChrome();
  renderModelMeta();
  replaceHash("#home");
  applyRoute({ focus: false });
  showToast(t("dataCleared"));
}

/* --------------------------------------------------------------------------
 * Dialogs
 * ----------------------------------------------------------------------- */

function askConfirm(title, text, confirmLabel, danger = true) {
  if (pendingConfirm) return Promise.resolve(false);
  const dialog = $("confirmDialog");
  $("confirmTitle").textContent = title;
  $("confirmText").textContent = text;
  const ok = $("confirmOk");
  ok.textContent = confirmLabel;
  ok.className = `btn ${danger ? "btn-danger" : "btn-primary"}`;
  dialog.returnValue = "";
  $("confirmCancel").focus();
  dialog.showModal();

  return new Promise((resolve) => {
    pendingConfirm = resolve;
  });
}

function bindDialogEvents() {
  const confirmDialog = $("confirmDialog");
  const historyDialog = $("historyDialog");

  $("confirmCancel").addEventListener("click", () => confirmDialog.close("cancel"));
  $("confirmOk").addEventListener("click", () => confirmDialog.close("confirm"));
  confirmDialog.addEventListener("close", () => {
    const resolve = pendingConfirm;
    pendingConfirm = null;
    if (resolve) resolve(confirmDialog.returnValue === "confirm");
  });

  $("historyDialogClose").addEventListener("click", () => historyDialog.close());
  [confirmDialog, historyDialog].forEach((dialog) => {
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close("cancel");
    });
  });

  $("historyDialogContent").addEventListener("click", (event) => {
    const button = event.target.closest("[data-history-guide]");
    if (!button) return;
    const key = button.getAttribute("data-history-guide");
    historyDialog.close();
    window.location.hash = `#guide/${key}`;
  });
}

/* --------------------------------------------------------------------------
 * Event wiring
 * ----------------------------------------------------------------------- */
function bindEvents() {
  bindDialogEvents();

  $("langToggle").addEventListener("click", () => {
    setLanguage(state.lang === "en" ? "sw" : "en");
  });

  $("settingsBtn").addEventListener("click", () => {
    if (state.screen === "settings") {
      focusLater($("settings-title"));
    } else {
      window.location.hash = "#settings";
    }
  });

  $("heroScanBtn").addEventListener("click", () => {
    window.location.hash = "#scan";
  });
  $("heroGuideBtn").addEventListener("click", () => {
    window.location.hash = "#guide";
  });
  $("homeRegionBtn").addEventListener("click", () => {
    window.location.hash = "#guide/regions";
  });
  $("homeInstallBtn").addEventListener("click", requestInstall);
  $("settingsInstallBtn").addEventListener("click", requestInstall);

  $("homeQuickRegions").addEventListener("click", (event) => {
    const button = event.target.closest("[data-quick-region]");
    if (button) window.location.hash = `#guide/regions/${button.dataset.quickRegion}`;
  });

  $("homeCategories").addEventListener("click", (event) => {
    if (event.target.closest("a")) window.scrollTo(0, 0);
  });

  $("cameraStartBtn").addEventListener("click", openCamera);
  $("galleryBtn").addEventListener("click", () => $("fileInput").click());
  $("changeImageBtn").addEventListener("click", () => $("fileInput").click());
  $("scanErrorUploadBtn").addEventListener("click", () => $("fileInput").click());
  $("cameraUploadBtn").addEventListener("click", () => $("fileInput").click());
  $("retakeBtn").addEventListener("click", retakePhoto);
  $("removeImageBtn").addEventListener("click", resetScan);

  $("identifyBtn").addEventListener("click", identify);
  $("captureBtn").addEventListener("click", capturePhoto);
  $("switchCameraBtn").addEventListener("click", switchCamera);
  $("closeCameraBtn").addEventListener("click", closeCamera);
  $("cameraRetryBtn").addEventListener("click", openCamera);
  $("scanRetryBtn").addEventListener("click", retryScan);

  ["fileInput", "cameraInput"].forEach((id) => {
    $(id).addEventListener("change", async (event) => {
      const file = event.target.files && event.target.files[0];
      event.target.value = "";
      if (file) await handleFile(file);
    });
  });

  const handleStatusRetry = () => {
    if (state.modelStatus === "error") ensureModel(true);
  };
  $("scanStatus").addEventListener("click", handleStatusRetry);
  $("scanStatus").addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleStatusRetry();
    }
  });

  const screenScan = $("screen-scan");
  ["dragenter", "dragover"].forEach((type) => {
    screenScan.addEventListener(type, (event) => {
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
    });
  });
  screenScan.addEventListener("drop", async (event) => {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) await handleFile(file);
  });

  $("scanResult").addEventListener("click", async (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const action = button.dataset.action;
    if (action === "explore-guide" && state.scan.result) {
      window.location.hash = `#guide/${state.scan.result.classKey}`;
    } else if (action === "scan-another") {
      resetScan();
      focusLater($("scanEmpty").querySelector(".stage-title"));
    } else if (action === "try-again") {
      resetScan();
      openCamera();
    } else if (action === "save-summary") {
      await saveResult(false);
    } else if (action === "save-photo") {
      await saveResult(true);
    } else if (action === "dont-save") {
      state.scan.saveDismissed = true;
      renderResult();
      showToast(t("notSaved"));
    } else if (action === "open-save") {
      state.scan.saveDismissed = false;
      renderResult();
    }
  });

  $("guideModeTypes").addEventListener("click", () => goGuideMode("types"));
  $("guideModeRegions").addEventListener("click", () => goGuideMode("regions"));
  $("guideTabs").addEventListener("click", (event) => {
    const tab = event.target.closest("[data-guide-category]");
    if (tab) selectGuideCategory(tab.dataset.guideCategory);
  });

  $("regionSearchInput").addEventListener("input", (event) => {
    state.regionQuery = event.target.value;
    renderRegionList();
  });
  $("regionList").addEventListener("click", (event) => {
    const button = event.target.closest("[data-region-id]");
    if (button) selectRegion(button.dataset.regionId);
  });
  $("regionDetail").addEventListener("click", (event) => {
    if (event.target.closest("[data-action='change-region']")) changeRegion();
  });

  $("historyList").addEventListener("click", async (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const action = button.dataset.action;
    if (action === "start-scan") {
      window.location.hash = "#scan";
    } else if (action === "view") {
      openHistoryEntry(button.dataset.id);
    } else if (action === "delete") {
      await deleteEntry(button.dataset.id);
    }
  });
  $("clearHistoryBtn").addEventListener("click", clearAllHistory);

  $("settingsLangEn").addEventListener("click", () => setLanguage("en"));
  $("settingsLangSw").addEventListener("click", () => setLanguage("sw"));
  $("prepareOfflineBtn").addEventListener("click", prepareOffline);
  $("settingsClearHistory").addEventListener("click", clearAllHistory);
  $("settingsClearAll").addEventListener("click", resetApp);

  $("updateBtn").addEventListener("click", () => {
    if (!pwa.applyUpdate()) window.location.reload();
    else {
      $("updateBtn").disabled = true;
      $("updateBtn").textContent = t("loading");
    }
  });

  $("chatInput").addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendChatMessage();
    }
  });
  $("sendBtn").addEventListener("click", sendChatMessage);
  $("clearChatBtn").addEventListener("click", clearChat);

  window.addEventListener("hashchange", () => applyRoute());
  window.addEventListener(
    "scroll",
    () => $("topbar").classList.toggle("is-scrolled", window.scrollY > 4),
    { passive: true }
  );
  const stopCameraForBackground = () => {
    const wasCamera = state.scan.stage === "camera" || camera.active || camera.starting;
    stopCamera();
    if (wasCamera) {
      state.scan.stage = "empty";
      setStage("empty");
    }
  };
  window.addEventListener("pagehide", stopCameraForBackground);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") stopCameraForBackground();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (document.querySelector("dialog[open]")) return;
    if (state.screen === "scan" && state.scan.stage === "camera") closeCamera();
  });
}

async function requestInstall() {
  const result = await pwa.promptInstall();
  renderInstallState();
  if (result.outcome === "unavailable") {
    showToast(t("installUnavailable"));
  }
}

async function sendChatMessage() {
  const input = $("chatInput");
  const message = input.value.trim();
  if (!message) return;

  // Add user message
  state.chat.messages.push({ text: message, sender: "user" });
  addMessage(message, "user");
  input.value = "";

  // Get bot response
  const response = getChatbotResponse(message);
  state.chat.messages.push({ text: response, sender: "bot" });
  addMessage(response, "bot");

  // Focus input again
  input.focus();
}

function clearChat() {
  state.chat.messages = [];
  renderChat();
  showToast(t("clearChat"));
}

/* --------------------------------------------------------------------------
 * Startup
 * ----------------------------------------------------------------------- */

async function init() {
  state.history = loadHistory();
  applyStaticTranslations(document, state.lang);
  $("appVersion").textContent = APP_VERSION;
  $("scanResult").setAttribute("aria-live", "polite");
  renderLanguageChoices();
  bindEvents();

  pwa.onConnectivityChange(handleConnectivity);
  pwa.onInstallStateChange(() => {
    renderInstallState();
    if (state.screen === "home") renderHome();
  });
  pwa.onUpdateAvailable(() => {
    if (updateShown) return;
    updateShown = true;
    $("updateBanner").hidden = false;
  });

  applyRoute({ initial: true, focus: false });
  updateChrome();
  renderInstallState();

  const registration = await pwa.registerServiceWorker();
  if (registration.supported && state.screen === "settings") {
    refreshOfflineChecks();
  }
}

init().catch((error) => {
  console.error("Seed Classifier failed to start:", error);
  showToast(translate("en", "errorGeneric"), "error");
});

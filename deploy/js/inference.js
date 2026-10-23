/*
 * On-device inference for the maize seed classifier.
 *
 * Contract verified against train_model.py and deploy/model_meta.json:
 *   - input  : float32 NCHW [1, 3, 64, 64]
 *   - resize : full image stretched to 64x64 (training eval transform)
 *   - scale  : /255 -> [0, 1]
 *   - norm   : (x - ImageNet mean) / ImageNet std
 *   - output : 4 raw logits -> external softmax
 *   - order  : metadata.classes (chotara, huria, local, other)
 */
const META_URL = new URL("../model_meta.json", import.meta.url);
const MODEL_URL = new URL("../seed_classifier.onnx", import.meta.url);
const VENDOR_URL = new URL("../vendor/", import.meta.url);

export class InferenceError extends Error {
  constructor(code, message, cause) {
    super(message || code);
    this.name = "InferenceError";
    this.code = code;
    this.cause = cause;
  }
}

let runtimeConfigured = false;
let session = null;
let sessionPromise = null;
let metadata = null;

export async function loadMetadata() {
  if (metadata) return metadata;
  let response;
  try {
    response = await fetch(META_URL, { cache: "no-cache" });
  } catch (error) {
    throw new InferenceError("metadata-network", "Could not read model metadata.", error);
  }
  if (!response.ok) {
    throw new InferenceError("metadata-http", `Model metadata returned ${response.status}.`);
  }
  let json;
  try {
    json = await response.json();
  } catch (error) {
    throw new InferenceError("metadata-json", "Model metadata is not valid JSON.", error);
  }
  if (!Array.isArray(json.classes) || !json.classes.length) {
    throw new InferenceError("metadata-classes", "Model metadata has no class list.");
  }
  if (!Array.isArray(json.display_names) || json.display_names.length !== json.classes.length) {
    json.display_names = json.classes.map((name) => name);
  }
  if (!Number.isFinite(json.img_size) || json.img_size < 16) {
    throw new InferenceError("metadata-size", "Model metadata has an invalid image size.");
  }
  const norm = json.normalization || {};
  if (
    !Array.isArray(norm.mean) || norm.mean.length !== 3 ||
    !Array.isArray(norm.std) || norm.std.length !== 3
  ) {
    throw new InferenceError("metadata-norm", "Model metadata has invalid normalization values.");
  }
  metadata = {
    classes: json.classes.slice(),
    displayNames: json.display_names.slice(),
    imgSize: Number(json.img_size),
    mean: norm.mean.map(Number),
    std: norm.std.map(Number),
    layout: norm.layout || "NCHW",
    raw: json,
  };
  if (metadata.layout !== "NCHW") {
    throw new InferenceError("metadata-layout", `Unsupported tensor layout: ${metadata.layout}`);
  }
  return metadata;
}

function configureRuntime() {
  if (runtimeConfigured) return;
  const ort = window.ort;
  if (!ort || typeof ort.InferenceSession?.create !== "function") {
    throw new InferenceError("runtime", "ONNX Runtime was not loaded.");
  }
  if (ort.env?.wasm) {
    ort.env.wasm.wasmPaths = VENDOR_URL.href;
    ort.env.wasm.numThreads = 1;
    ort.env.wasm.proxy = false;
    ort.env.wasm.simd = true;
  }
  if (ort.env) ort.env.logLevel = "error";
  runtimeConfigured = true;
}

export function getOrt() {
  configureRuntime();
  return window.ort;
}

export function isModelLoaded() {
  return Boolean(session);
}

export async function loadModel() {
  if (session) return session;
  if (sessionPromise) return sessionPromise;

  sessionPromise = (async () => {
    configureRuntime();
    let response;
    try {
      response = await fetch(MODEL_URL, { cache: "no-cache" });
    } catch (error) {
      throw new InferenceError("model-network", "Could not download the model.", error);
    }
    if (!response.ok) {
      throw new InferenceError("model-http", `The model returned ${response.status}.`);
    }
    const buffer = await response.arrayBuffer();
    if (buffer.byteLength < 1024) {
      throw new InferenceError("model-empty", "The model file appears to be empty.");
    }
    try {
      session = await window.ort.InferenceSession.create(buffer, {
        executionProviders: ["wasm"],
        graphOptimizationLevel: "all",
      });
      return session;
    } catch (error) {
      throw new InferenceError("model-runtime", "ONNX Runtime could not create a session.", error);
    }
  })();

  try {
    return await sessionPromise;
  } catch (error) {
    session = null;
    throw error;
  } finally {
    sessionPromise = null;
  }
}

export function resetModel() {
  session = null;
  sessionPromise = null;
}

export function softmax(values) {
  if (!values || !values.length) return [];
  let max = -Infinity;
  for (const value of values) {
    if (value > max) max = value;
  }
  let sum = 0;
  const result = new Array(values.length);
  for (let i = 0; i < values.length; i++) {
    result[i] = Math.exp(values[i] - max);
    sum += result[i];
  }
  if (!Number.isFinite(sum) || sum <= 0) {
    return result.map(() => 1 / result.length);
  }
  for (let i = 0; i < result.length; i++) result[i] /= sum;
  return result;
}

function drawSource(source, size, cropSquare) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new InferenceError("canvas", "Could not create a drawing canvas.");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  if (cropSquare && (source instanceof HTMLVideoElement)) {
    const width = source.videoWidth || source.width;
    const height = source.videoHeight || source.height;
    const side = Math.min(width, height);
    if (!side) throw new InferenceError("image-empty", "The image has no pixels.");
    ctx.drawImage(
      source,
      (width - side) / 2,
      (height - side) / 2,
      side,
      side,
      0,
      0,
      size,
      size
    );
  } else {
    const width = source.naturalWidth || source.videoWidth || source.width;
    const height = source.naturalHeight || source.videoHeight || source.height;
    if (!width || !height) throw new InferenceError("image-empty", "The image has no pixels.");
    ctx.drawImage(source, 0, 0, size, size);
  }
  return ctx.getImageData(0, 0, size, size);
}

export async function classifySource(source, options = {}) {
  const meta = await loadMetadata();
  const activeSession = await loadModel();
  const started = performance.now();

  const size = meta.imgSize;
  const imageData = drawSource(source, size, options.cropSquare === true);
  const preprocess = window.SeedPreprocess;
  if (!preprocess || typeof preprocess.preprocessRGBA !== "function") {
    throw new InferenceError("preprocess", "The shared preprocessing module is unavailable.");
  }
  const floats = preprocess.preprocessRGBA(imageData.data, size);

  // Final guard against the historical NHWC/NCHW regression.
  const plane = size * size;
  if (floats.length !== plane * 3) {
    throw new InferenceError("preprocess-length", "Preprocessing produced the wrong tensor length.");
  }

  const inputName = activeSession.inputNames?.[0] || "input";
  const outputName = activeSession.outputNames?.[0] || "output";
  const tensor = new window.ort.Tensor("float32", floats, [1, 3, size, size]);

  let output;
  try {
    const results = await activeSession.run({ [inputName]: tensor });
    output = results[outputName];
  } catch (error) {
    throw new InferenceError("inference", "The model could not process this image.", error);
  }

  const logits = output?.data;
  if (!logits || logits.length !== meta.classes.length) {
    throw new InferenceError(
      "output-shape",
      `Unexpected model output (${logits ? logits.length : "none"} values).`
    );
  }

  const probabilities = softmax(Array.from(logits));
  let topIndex = 0;
  for (let i = 1; i < probabilities.length; i++) {
    if (probabilities[i] > probabilities[topIndex]) topIndex = i;
  }

  const scores = meta.classes.map((classKey, index) => ({
    classKey,
    displayName: meta.displayNames[index] || classKey,
    probability: probabilities[index],
    logit: Number(logits[index]),
  }));

  return {
    classKey: meta.classes[topIndex],
    displayName: meta.displayNames[topIndex] || meta.classes[topIndex],
    confidence: probabilities[topIndex],
    scores,
    imgSize: size,
    durationMs: Math.round(performance.now() - started),
    rawLogits: Array.from(logits),
  };
}

export function loadImageElement(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new InferenceError("image-decode", "The image could not be decoded."));
    image.src = src;
  });
}

export function sourceForPreview(dataUrl) {
  return loadImageElement(dataUrl);
}

export function drawVideoFrame(video) {
  const width = video.videoWidth;
  const height = video.videoHeight;
  if (!width || !height) {
    throw new InferenceError("camera-not-ready", "The camera frame is not ready yet.");
  }
  const side = Math.min(width, height);
  const target = Math.min(1280, Math.max(640, side));
  const canvas = document.createElement("canvas");
  canvas.width = target;
  canvas.height = target;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    video,
    (width - side) / 2,
    (height - side) / 2,
    side,
    side,
    0,
    0,
    target,
    target
  );
  return canvas;
}

export function canvasToDataUrl(canvas, quality = 0.9) {
  return canvas.toDataURL("image/jpeg", quality);
}

export async function fileToDataUrl(file, maxSide = 1400) {
  if (!file) throw new InferenceError("file-missing", "No file was selected.");
  if (!file.type.startsWith("image/")) {
    throw new InferenceError("file-type", "The selected file is not an image.");
  }
  if (file.size > 20 * 1024 * 1024) {
    throw new InferenceError("file-size", "The selected image is too large.");
  }

  let bitmap;
  try {
    if ("createImageBitmap" in window) {
      bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    } else {
      const fallbackUrl = URL.createObjectURL(file);
      try {
        bitmap = await loadImageElement(fallbackUrl);
      } finally {
        URL.revokeObjectURL(fallbackUrl);
      }
    }
  } catch (error) {
    throw new InferenceError("image-decode", "The image could not be opened.", error);
  }

  const width = bitmap.width || bitmap.naturalWidth;
  const height = bitmap.height || bitmap.naturalHeight;
  const scale = Math.min(1, maxSide / Math.max(width, height));
  const outWidth = Math.max(1, Math.round(width * scale));
  const outHeight = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = outWidth;
  canvas.height = outHeight;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, outWidth, outHeight);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, outWidth, outHeight);
  if (bitmap.close) bitmap.close();

  return {
    dataUrl: canvas.toDataURL("image/jpeg", 0.9),
    width: outWidth,
    height: outHeight,
  };
}

export function makeThumbnail(dataUrl, maxSide = 420) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.72));
    };
    image.onerror = () => resolve(null);
    image.src = dataUrl;
  });
}

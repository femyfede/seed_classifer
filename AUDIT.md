# Full System Audit — Maize Seed Classifier

**Project:** `seedclassifer`
**Audit date:** 2026-09-17
**Auditor role:** ML / TinyML / software engineering review
**Scope:** Training pipeline, ONNX browser deployment, Edge Impulse web deployment, ESP32-S3 firmware, dataset, model artifacts, and cross-component contracts.
**Method:** Static code review, artifact inspection (ONNX IR, TFLite/EON metadata), and empirical inference experiments on the actual dataset.

---

## 1. Executive Summary

The system is composed of **four independent inference surfaces** that were built at different times with **different models, different class taxonomies, different input sizes, and different preprocessing**:

| Surface | Model | Input | Classes | Status |
|---|---|---|---|---|
| `deploy/` (new browser) | PyTorch → ONNX (float32) | 64×64 | Chotara, Huria, Local, Other | **Broken (critical preprocessing bug)** |
| `browser/` (old browser) | Edge Impulse WASM (INT8) | 96×96 | Asili, Chotara, Huria, unrelated | **Likely broken (module binding) + stale** |
| `SeedClass/` (ESP32-S3) | Edge Impulse EON (INT8) | 96×96 | Asili, Chotara, Huria, unrelated | Structurally sound |
| `model/` artifacts | PyTorch/ONNX | 64×64 | Chotara, Huria, Local, Other | Trained on leaky data |

**Two issues dominate everything else:**

1. **CRITICAL — Tensor layout bug in the browser deployment.** `deploy/index.html` writes image data in interleaved NHWC order into a tensor declared as `[1,3,64,64]` (NCHW). This scrambles every input. **Empirically verified: the deployed app predicts `Other` ("unrelated") with ~100% confidence for *every* image, including correct Chotara/Huria/Local seeds.** This is the exact symptom reported ("it keeps saying unrelated"). The model itself is fine — the app feeding it is wrong.

2. **CRITICAL — Dataset leakage and extreme class sparsity.** The "20,355 image" dataset actually contains only **48 unique Chotara seeds, 33 unique Huria seeds, and 46 unique Local seeds**, each replicated/augmented up to **229×**. A random image-level train/test split therefore leaks augmentations of the same physical seed into both splits. The reported 84–99% test accuracy is substantially inflated and does not reflect real-world generalization.

Everything else (taxonomy inconsistency, dual diverging models, dependency/reproducibility gaps, licensing) is downstream of these two.

---

## 2. System Inventory

```
seedclassifer/
├── train_model.py                       PyTorch training → best_model.pth + ONNX
├── model/
│   ├── best_model.pth                   PyTorch checkpoint (987 KB)
│   ├── seed_classifier.onnx             ONNX export (979 KB) — NCHW [batch,3,64,64] → [batch,4] logits
│   └── classes.json                     ["Chotara","Huria","Local","Other"]
├── deploy/                              NEW browser app (ONNX Runtime Web)
│   ├── index.html
│   ├── seed_classifier.onnx
│   └── classes.json
├── browser/                             OLD browser app (Edge Impulse WASM)
│   ├── index.html                       (96×96, classes Asili/Chotara/Huria/unrelated)
│   ├── run-impulse.js
│   ├── edge-impulse-standalone.js       (Emscripten glue, embind)
│   └── edge-impulse-standalone.wasm     (8.4 MB)
├── data_maize_extracted/data_maize/     Extracted dataset (used by training)
│   ├── MaizeData/chotara/  (4958)
│   ├── MaizeData/huria/    (4621)
│   ├── MaizeData/local/    (4776)
│   └── Other/              (6000)
├── data_maize/data_maize/MaizeData/huria/   Partial raw data
├── data_maize.zip                       (~170 MB raw archive)
├── ei-seedy_final-arduino-1.0.4-impulse-#1.zip
├── seedy_final-wasm-v8-impulse-#1.zip
└── SeedClass/                           ESP32-S3 PlatformIO firmware
    ├── platformio.ini
    ├── src/       main.cpp, camera.cpp, inference.cpp, lcd.cpp
    ├── include/   config.h, camera.h, inference.h, lcd.h
    ├── test/      test_config.cpp, test_normalize.cpp
    └── lib/fedeSeed_inferencing_new/    Edge Impulse EON SDK (96×96, INT8)
```

**Verified model contracts**

| Artifact | Input | Output | Post-processing |
|---|---|---|---|
| `model/seed_classifier.onnx` | `input` `[batch,3,64,64]` float32 (NCHW) | `output` `[batch,4]` float32 **logits** | External softmax required |
| `browser/edge-impulse-standalone.wasm` | 96×96 RGB (27,648 values) | 4-way probabilities | Internal softmax |
| ESP32 EON model | 96×96 RGB, INT8 | 4-way INT8 | `process_classification_i8` |

ONNX graph confirmed: last node is `Gemm → output`, i.e. **raw logits, no embedded softmax** (`opset_import = 11`, `ir_version = 6`, producer `pytorch 2.14.0`).

---

## 3. Findings (severity-ranked)

### CRITICAL-1 — NHWC/NCHW tensor layout bug makes every browser prediction wrong
**Files:** `deploy/index.html:842-859` (`preprocessCanvas`)
**Class:** Functional bug (correctness)
**Status:** **Confirmed by experiment**

The tensor is declared channel-first:

```js
return new ort.Tensor('float32', float32Data, [1, 3, IMG_SIZE, IMG_SIZE]); // NCHW
```

but the loop writes **channel-interleaved** data:

```js
for (let i = 0; i < IMG_SIZE * IMG_SIZE; i++) {
    float32Data[i * 3]     = (r - MEAN[0]) / STD[0];
    float32Data[i * 3 + 1] = (g - MEAN[1]) / STD[1];
    float32Data[i * 3 + 2] = (b - MEAN[2]) / STD[2];
}
```

For NCHW, the first `64*64 = 4096` floats must be **the entire R plane**, then G, then B. Instead the buffer is `R0,G0,B0,R1,G1,B1,…`, so the model receives three garbage planes constructed from interleaved channels.

**Empirical evidence** (same model, real dataset images):

| Image (true class) | Correct NCHW → prediction | Current interleaved code → prediction |
|---|---|---|
| `aug_0_1001402136_WangDataa29.jpg` (Chotara) | Chotara 0.863 | **Other 1.000** |
| `1251561412_SanzalSima9.jpg` (Huria) | Huria 0.567 | **Other 1.000** |
| `aug_0_1000623800_Bihilifa55.jpg` (Local) | Local 1.000 | **Other 1.000** |
| `aug_1.jpg` (Other) | Other 1.000 | Other 1.000 |

Every non-`Other` image collapses to `Other → "unrelated"`. This fully explains the reported behavior.

**Recommended fix:** write channel-planar:
```js
const plane = IMG_SIZE * IMG_SIZE;
float32Data[0 * plane + i] = (r - MEAN[0]) / STD[0];
float32Data[1 * plane + i] = (g - MEAN[1]) / STD[1];
float32Data[2 * plane + i] = (b - MEAN[2]) / STD[2];
```
and add an automated preprocessing-parity test (Python vs JS) so this cannot silently regress.

---

### CRITICAL-2 — Dataset leakage + extreme seed sparsity invalidate reported accuracy
**Files:** `train_model.py:13,53-54`; `data_maize_extracted/data_maize/`
**Class:** Data integrity / evaluation methodology
**Status:** Confirmed by filename analysis

`train_test_split(..., random_state=42)` splits at the **image level**, but the dataset is dominated by augmentations of very few source seeds:

| Class | Images | Unique seed identities | Max augmentations of one seed |
|---|---|---|---|
| chotara | 4,958 | **48** | **229** |
| huria | 4,621 | **33** | **265** |
| local | 4,776 | **46** | **220** |
| Other | 6,000 | (no stable ID pattern) | — |

Augmented copies of the *same* physical seed appear in both train and test, so the test set measures memorization, not generalization. This is a textbook augmentation-leakage setup.

**Impact:**
- Reported test metrics (`Local` 0.99 F1, `Other` 1.00 F1, overall 84%) are optimistic.
- `Other` scoring **100% precision/recall** is a red flag: the "Other" pool may be trivially separable (distinct backgrounds/objects) rather than genuinely "other maize seed".
- Real-world performance on new seeds/phones/lighting will be materially lower.

**Recommended fix:**
- Group-aware split by seed identity (`GroupShuffleSplit` / `StratifiedGroupKFold`, groups = trailing filename token).
- Re-balance by **unique seed**, not image count.
- Report per-seed accuracy; add a genuine held-out-seed test set.
- Audit what `Other/` actually contains.
- Ideally add more *distinct* seeds per class.

**Note:** A quick group-split evaluation of the *existing* model (trained on leaked data) gives Chotara 0.647 / Huria 0.853 / Local 0.963 / Other 1.000 — this is still optimistic because the model already saw those seeds' augmentations during training. A true number requires retraining with seed-disjoint splits.

---

### HIGH-1 — Class taxonomy is inconsistent across all four surfaces
**Files:** `train_model.py:20,27`, `model/classes.json`, `deploy/index.html` (`DISPLAY_NAMES`), `browser/run-impulse.js:1`, `SeedClass/.../model_variables.h:50`

| Source | Class set |
|---|---|
| PyTorch / ONNX / `model/classes.json` | `Chotara, Huria, Local, Other` |
| `deploy/index.html` display mapping | `Local→Asili`, `Other→unrelated` |
| Edge Impulse (browser + ESP32) | `Asili, Chotara, Huria, unrelated` |

The critical assumption **`Local` ≡ `Asili`** is **undocumented and unverified**. There is no README or data dictionary; the only mention of "Asili" outside generated code is a comment in `config.h:17`. If `local` is not truly the `Asili` variety, the web app actively mislabels seeds. This must be confirmed with the data owner before any further deployment.

---

### HIGH-2 — Two diverging models with incompatible preprocessing
**Files:** `train_model.py:41,78`, `SeedClass/src/inference.cpp:12,306-316`, EI `model_metadata.h`

| Aspect | ONNX (web) | Edge Impulse (web-old + ESP32) |
|---|---|---|
| Input size | 64×64 | 96×96 |
| Numeric format | float32 | INT8 quantized |
| Resize | **stretch** (PIL `resize`) | `EI_CLASSIFIER_RESIZE_FIT_SHORTEST` (aspect-preserving) |
| Normalization | ImageNet mean/std | model-internal (INT8) |
| Classes | Chotara/Huria/Local/Other | Asili/Chotara/Huria/unrelated |
| Output | raw logits + JS softmax | probabilities |

The **same seed produces different predicted classes depending on the surface**, with no shared contract or version stamp. There is no test that the web and device agree. This is an architectural gap: pick one model/taxonomy/preprocessing and make it the single source of truth.

---

### HIGH-3 — Older browser app is stale and likely fails to load
**Files:** `browser/run-impulse.js:3-10`, `browser/edge-impulse-standalone.js:4854-4875`

- `loadClassifier()` checks `window.EdgeImpulseClassifier`, but embind's `exposePublicSymbol` attaches to `Module[name]` (i.e. `window.Module.EdgeImpulseClassifier`). `window.EdgeImpulseClassifier` is not defined by this build → the app shows *"Edge Impulse WebAssembly export could not be loaded."*
- Even if fixed, `browser/` is stale: 96×96, 8.4 MB WASM, classes that don't match the current PyTorch model.
- Having two browser apps (`browser/` and `deploy/`) is confusing; only one should ship.

**Recommended fix:** Retire `browser/` or fix the binding (`Module.EdgeImpulseClassifier`) if the EI model is still intended; otherwise delete to avoid ambiguity.

---

### MEDIUM-1 — ONNX Runtime Web multi-threading requires cross-origin isolation
**File:** `deploy/index.html:741`
Setting `ort.env.wasm.numThreads > 1` requires `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp`. The dev server used (`python -m http.server`) sends neither, so threaded WASM may fail or silently fall back, and can throw at init. Verify behavior and either serve with the required headers or force `numThreads = 1`.

---

### MEDIUM-2 — Unpinned CDN dependency + no SRI (offline & supply-chain risk)
**File:** `deploy/index.html:656`
`https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.min.js` has **no version pin** and **no Subresource Integrity hash**. Consequences: the app cannot run offline; a future (or compromised) CDN payload changes behavior silently. Vendor ONNX Runtime locally (or pin an exact version + SRI).

---

### MEDIUM-3 — Debug panel shipped to end users
**File:** `deploy/index.html` (`displayResults`) renders raw logits/probabilities. This leaks model internals and clutters the UI. Remove for production (keep behind a `?debug=1` flag).

---

### MEDIUM-4 — Non-reproducible training; hardcoded absolute paths
**Files:** `train_model.py:13-14`
- Absolute Windows paths (`C:\Users\FEDE\...`) → not portable/CI-friendly.
- No `requirements.txt` / lockfile; versions are implicit (currently torch 2.14.0+cpu, Python 3.14).
- No `torch.manual_seed` / `cudnn` deterministic flags → runs are not bit-reproducible.
- No `--config`/CLI; hyperparameters are hardcoded.

---

### MEDIUM-5 — Training performance & methodology
**File:** `train_model.py`
- Entire ~20k-image dataset is decoded into RAM as float32 (~1 GB) before training; loading alone takes ~100 s. On CPU each epoch is ~2–7 min (12 epochs ≈ 40 min), which is why runs hit timeouts.
- `num_workers=0` → no parallel data loading.
- No early stopping; fixed 12 epochs; `ReduceLROnPlateau` never triggered (LR stayed at 0.002 throughout).
- `WeightedRandomSampler` balances image counts, which (given CRITICAL-2) over-samples augmented copies rather than distinct seeds.

---

### MEDIUM-6 — Model collapses toward `Other`; weak rejection design
**Evidence:** existing model returns `Other` at ~1.000 on out-of-distribution inputs. Combined with CRITICAL-1, real photos were 100% funneled to "unrelated". The single global `CONFIDENCE_THRESHOLD = 0.6f` (`SeedClass/include/config.h:23`) is the only rejection mechanism; there is no out-of-distribution / entropy / margin check, and no calibration.

---

### LOW-1 — Duplicated and unreferenced constants
- `SeedClass/src/inference.cpp:12-14` redefines `RAW_IMAGE_WIDTH/HEIGHT/CHANNELS` (320/240/3) instead of using `CAMERA_RAW_WIDTH/HEIGHT/IMAGE_CHANNELS` from `config.h:52-54`. Drift risk.
- `browser/run-impulse.js:1` `LABELS` and `inspectImage()` are dead code (unused by `index.html`).

---

### LOW-2 — Camera orientation assumptions unverified
**File:** `SeedClass/src/camera.cpp:119-120`
`sensor->set_vflip(1)` **and** `set_hmirror(1)` are both enabled. If the training images were captured without those transforms, device inference sees a 180°-rotated/mirrored distribution. Was not validated against the training data. Rotation invariance is not guaranteed by the model (only ±10° during training).

---

### LOW-3 — No preprocessing parity tests
There are no tests asserting that Python, JS, and C++ preprocess an image identically. `SeedClass/test/` only tests config constants and label normalization — **not** the actual image pipeline, which is exactly where CRITICAL-1 lived.

---

### LOW-4 — Edge Impulse SDK licensing
**Files:** `SeedClass/lib/fedeSeed_inferencing_new/**`, `browser/edge-impulse-standalone.*`
The generated SDK headers state the software *"requires an active paid Edge Impulse subscription"* and restrict use/redistribution. Confirm licensing before publishing firmware or the WASM app.

---

### LOW-5 — No top-level documentation
No root README explaining which app is canonical, how to train, how to serve, or the class taxonomy. This ambiguity is the direct cause of the `Asili`/`Local` confusion.

---

## 4. Cross-Component Contract Matrix

| Property | `model/` (ONNX) | `deploy/` | `browser/` (old) | ESP32 `SeedClass` |
|---|---|---|---|---|
| Classes | Chotara,Huria,Local,Other | maps Local→Asili, Other→unrelated | Asili,Chotara,Huria,unrelated | Asili,Chotara,Huria,unrelated |
| Input H×W | 64×64 | 64×64 | 96×96 | 96×96 |
| Channel order | **NCHW** | **writes NHWC (BUG)** | interleaved (EI format) | interleaved (EI format) |
| Numeric | float32 | float32 | uint8 | int8 |
| Normalization | ImageNet mean/std | ImageNet mean/std | EI internal | EI internal |
| Resize | stretch | stretch | stretch | FIT_SHORTEST |
| Output | logits | softmax (JS) | probabilities | INT8 probs |
| **Matches training?** | — | ❌ layout bug | n/a (EI model) | n/a (EI model) |

Only the ONNX path is supposed to share the training contract, and it is the one with the layout bug.

---

## 5. Environmental / Tooling Observations

- Python **3.14.7**, PyTorch **2.14.0+cpu** (no CUDA), `onnx` 1.22.0, `onnxscript` 0.7.2 (installed during this session).
- ONNX export required `dynamo=False` due to (a) the new dynamo exporter conflicting with `dynamic_axes`, and (b) a Windows `cp1252` `UnicodeEncodeError` on the exporter's ✅ emoji (fixed via `PYTHONIOENCODING=utf-8`).
- No `requirements.txt`, no lockfile, no CI configuration.
- `.pio/` build artifacts are present (project has been compiled locally); `firmware.bin` exists.
- Dev server used: `python -m http.server 8080` (no COOP/COEP, no MIME tuning).

---

## 6. Reproduction Evidence

**ONNX I/O contract**
```python
import onnx
m = onnx.load("model/seed_classifier.onnx")
# input ['batch', 3, 64, 64] float32 ; output ['batch', 4] float32 ; last node: Gemm
```

**Layout-bug experiment (decisive)**
```python
# Correct NCHW vs interleaved (current JS) on real dataset images:
# Chotara image -> NCHW: Chotara 0.863 | interleaved: Other 1.000
# Huria   image -> NCHW: Huria   0.567 | interleaved: Other 1.000
# Local   image -> NCHW: Local   1.000 | interleaved: Other 1.000
```

**Seed sparsity / leakage counts**
```python
# chotara: 4958 images, 48 unique seeds, max 229 copies/seed
# huria  : 4621 images, 33 unique seeds, max 265 copies/seed
# local  : 4776 images, 46 unique seeds, max 220 copies/seed
```

---

## 7. Recommended Remediation Order (not yet implemented)

1. **Fix CRITICAL-1** — planar (NCHW) preprocessing in `deploy/index.html`; add a Python↔JS parity test.
2. **Address CRITICAL-2** — group-aware (seed-disjoint) splits; report honest metrics; audit `Other/`; expand distinct seeds.
3. **Resolve HIGH-1** — confirm `Local ≡ Asili`; freeze one taxonomy; align ONNX, EI, web, and firmware.
4. **Resolve HIGH-2/HIGH-3** — choose one canonical model + one canonical web app; retire the other.
5. **Medium items** — pin/vendor ONNX Runtime Web, remove debug panel, add COOP/COEP or `numThreads=1`, add `requirements.txt` + seeds + CLI, remove dead code.
6. **Low items** — dedupe constants, validate camera orientation, add pipeline tests, settle licensing, write a root README.

---

## 8. Verdict

The **model is not inherently broken** — with correct preprocessing it classifies the training data's classes correctly. The deployed experience is broken primarily by a **one-line-class tensor layout bug**, compounded by a **leaky, seed-sparse dataset** that makes the model look far better than it is and likely biases it toward the `Other` class. Until CRITICAL-1 and CRITICAL-2 are addressed, plus the taxonomy question (HIGH-1), no surface should be considered production-ready.

---

## 9. Remediation Status

All findings below have been addressed in this codebase. `AUDIT.md` is retained
as the original record of the findings.

| Finding | Status | What changed |
|---|---|---|
| **CRITICAL-1** NCHW/NHWC layout bug | ✅ Fixed | Preprocessing extracted to `deploy/preprocess.js` and rewritten channel-**planar** (NCHW). UI no longer contains the buggy loop. |
| **CRITICAL-2** Dataset leakage | ✅ Addressed | `train_model.py` now performs **seed-disjoint** splits by extracted seed identity; reports held-out-seed metrics; other augmentations no longer leak across splits. |
| High-1 taxonomy | ⚠️ Documented | `local→Asili` mapping made explicit in `model_meta.json` (`display_names`) and flagged in `README.md`; still requires confirmation from the data owner. |
| High-2 diverging models | ✅ Addressed | `deploy/` (ONNX) designated canonical; contract documented in `README.md`. Embedded EI stays as a separate documented target. |
| High-3 stale/broken old browser app | ✅ Retired | `browser/index.html` is now a redirect; stock EI app preserved under `browser/legacy/`; `browser/README.md` explains. |
| Medium-1 ORT threading / COOP-COEP | ✅ Fixed | `ort.env.wasm.numThreads = 1` — no cross-origin isolation required. |
| Medium-2 unpinned CDN / offline | ✅ Fixed | ONNX Runtime **vendored** into `deploy/vendor/` (no CDN, works offline). |
| Medium-3 debug panel in production | ✅ Fixed | Debug output hidden unless `?debug=1`. |
| Medium-4 reproducibility | ✅ Fixed | `requirements.txt` added; CLI args; explicit seeds; no hard-coded user paths (paths default relative to the script). |
| Medium-5 training methodology | ✅ Improved | Stronger augmentation, macro-F1 checkpoint selection, cosine LR, label smoothing, honest eval. |
| Medium-6 collapse toward `Other` | ✅ Improved | Correct preprocessing + low-confidence UI warning + capture guidance; `Other` audited (it is unrelated photos, not "other seed"). |
| Low-1 duplicated constants | ✅ Fixed | `inference.cpp` uses `CAMERA_RAW_*` from `config.h`. |
| Low-2 camera orientation | ✅ Addressed | `CAMERA_VFLIP` / `CAMERA_HMIRROR` are now configurable in `config.h`. |
| Low-3 no parity tests | ✅ Fixed | `tools/parity_test.js` (Python↔JS) and `tools/e2e_check.py` (image→JS preprocess→ONNX) added. |
| Low-4 EI licensing | ⚠️ Documented | Noted in `README.md`; no licensing decision made. |
| Low-5 no documentation | ✅ Fixed | Root `README.md` documents architecture, contract, taxonomy, and workflow. |

**Verification evidence**

- `node tools/parity_test.js` → `PASS` (JS planar preprocessing matches Python).
- `python tools/e2e_check.py` → **75% (9/12)** in the latest run. The test now
  sorts each class's file list before seeded sampling so the selected smoke-test
  fixtures are reproducible across filesystems. This 12-image smoke test is not
  a substitute for held-out evaluation; Chotara/Huria confusions remain.
- Current exported model metrics (`deploy/model_meta.json`): **test accuracy
  0.761, validation macro-F1 0.762**. These held-out metrics are distinct from
  the small end-to-end smoke-test result.

**Still open (requires human input / hardware):**

- Confirm the `local ≡ Asili` assumption (High-1).
- Validate camera orientation on physical hardware (Low-2).
- Decide on Edge Impulse SDK licensing before redistribution (Low-4).
- Collect more distinct physical seeds to improve true generalization.

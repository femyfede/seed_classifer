# Seed Classifier

Classify East African maize seed varieties from a photo. This project trains a
small CNN in PyTorch, exports it to ONNX, and runs it fully offline in the
browser. An ESP32-S3 firmware variant runs a quantised Edge Impulse model
on-device.

---

## ⚠️ Read this first

1. **The browser app is the canonical deployment:** [`deploy/`](deploy/).
   The former Edge Impulse web app in `browser/` is retired (see
   [`browser/README.md`](browser/README.md)).
2. **Capture guidance matters.** The model was trained on single maize seeds
   photographed against a plain, blue background. Photos with cluttered
   backgrounds, multiple seeds, or poor lighting can be misclassified as
   `unrelated`. Photograph **one seed, plain background, even light, filling the
   frame.**
3. **Class-name assumption.** The training folder `local` is presented to users
   as **Asili**, and `other` as **unrelated**. This mapping is an explicit
   assumption that has not been independently verified — see
   [`AUDIT.md`](AUDIT.md) (HIGH-1). Confirm it before relying on the labels.
4. **Dataset caveat.** The bundled dataset contains many augmented copies of very
   few physical seeds. Training uses **seed-disjoint splits** and reports honest
   held-out metrics, but absolute accuracy on brand-new seeds will be lower than
   the training-set numbers suggest. See [`AUDIT.md`](AUDIT.md) (CRITICAL-2).

---

## Repository layout

```
train_model.py              Training pipeline (PyTorch → ONNX + metadata)
requirements.txt            Python dependencies
deploy/                     Canonical browser app (ONNX Runtime Web, offline)
  index.html                UI
  preprocess.js             Shared preprocessing (single source of truth)
  seed_classifier.onnx      Model
  classes.json              Class list
  model_meta.json           Config + metrics + display-name mapping
  vendor/                   Vendored onnxruntime-web (offline, no CDN)
model/                      Training output artifacts
tools/                      Preprocessing parity test
SeedClass/                  ESP32-S3 PlatformIO firmware (Edge Impulse model)
browser/                    RETIRED legacy EI app (redirect + legacy/ reference)
data_maize_extracted/       Dataset used for training
AUDIT.md                    Full system audit and findings
```

---

## Model contract

The browser app **must** reproduce the training preprocessing exactly. The
single source of truth is [`deploy/preprocess.js`](deploy/preprocess.js):

| Step   | Value                                                          |
|--------|----------------------------------------------------------------|
| Input  | RGB, resized (stretched) to 64×64                              |
| Scale  | `/255` → `[0,1]`                                               |
| Norm   | ImageNet: mean `[0.485,0.456,0.406]`, std `[0.229,0.224,0.225]`|
| Layout | **NCHW planar** `[1, 3, 64, 64]`                               |
| Output | 4 raw logits → softmax                                         |

> **NCHW is critical.** Writing channel-interleaved (NHWC) data into the NCHW
> tensor silently produces garbage predictions (every image → `unrelated`). This
> was the original bug; `tools/parity_test.js` now guards against it.

The `ESP32-S3` firmware uses a *separate* quantised Edge Impulse model (96×96,
INT8) and does **not** share this contract. See the cross-component matrix in
[`AUDIT.md`](AUDIT.md).

---

## Training

```bash
pip install -r requirements.txt
python train_model.py --epochs 20
```

Options:

```
--data-dir DIR     dataset root (default: ./data_maize_extracted)
--out-dir DIR      output artifacts (default: ./model)
--img-size N       default 64
--batch-size N     default 128
--epochs N         default 20
--lr F             default 0.002
--width F          model width multiplier (default 1.0)
--test-size F      default 0.2      --val-size F   default 0.1
--seed N           default 42       --workers N    default 0
--no-group-split   naive per-image split (LEAKS augmentations; not recommended)
```

The pipeline:

- Discovers class folders automatically and splits by **physical seed identity**
  (`GroupShuffleSplit` style), so augmented copies of the same seed never appear
  in more than one split.
- Caches images at `--cache-size`, applies strong augmentation (random crops,
  flips, 180° rotation, colour jitter, grayscale, random erasing) to reduce
  reliance on the capture background.
- Selects the best checkpoint by validation **macro-F1** (not accuracy).
- Writes `best_model.pth`, `seed_classifier.onnx`, `classes.json`,
  `model_meta.json`.

### After training

Copy the artifacts into the web app:

```bash
copy model\seed_classifier.onnx deploy\
copy model\classes.json deploy\
copy model\model_meta.json deploy\
```

---

## Running the browser app

ONNX Runtime Web is vendored, so the app is fully offline. It **must be served
over HTTP** — opening `index.html` directly (`file://`) is blocked by the
browser and will show a "must be served" message. Camera access also requires a
secure context (`localhost` counts).

The included server sets the correct MIME types for `.wasm`/`.mjs` and disables
caching:

```bash
# from the repo root
python deploy/serve.py
# or on Windows: double-click serve.bat
```

Then open <http://localhost:8080/>. Add `?debug=1` to reveal raw logits and the
class mapping.

> If you see *"no available backend found"* or *"Model failed to load"*, you are
> almost certainly opening the file directly instead of via `serve.py`, or your
> server is sending `.mjs`/`.wasm` with the wrong MIME type. Use `serve.py`.

## Preprocessing parity test

Guards the Python ↔ JavaScript preprocessing contract:

```bash
python tools/gen_parity_fixture.py
node tools/parity_test.js
```

## ESP32-S3 firmware

```bash
cd SeedClass
pio run                 # build
pio run --target upload # flash
```

Camera orientation is configurable via `CAMERA_VFLIP` / `CAMERA_HMIRROR` in
`SeedClass/include/config.h`.

---

## Known limitations

See [`AUDIT.md`](AUDIT.md) for the full list. Highlights:

- Capturing conditions (plain background) strongly affect accuracy.
- `Other`/`unrelated` was trained on unrelated photos (animals, phones, rice,
  sand) — it is **not** "other maize seed".
- The browser and embedded firmware use different models and taxonomies.
- The Edge Impulse SDK in `SeedClass/` is licensed for use with an active paid
  Edge Impulse subscription.

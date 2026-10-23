# `browser/` — retired legacy deployment

> **This app is retired.** Use [`../deploy/`](../deploy/) instead.

## What happened

This folder previously held a browser classifier built on an **Edge Impulse
WebAssembly** export (96×96, INT8, classes `Asili / Chotara / Huria /
unrelated`). It has been retired in favour of the single canonical app in
`deploy/`, which runs the project's own trained ONNX model.

Reasons for retiring it (see `../AUDIT.md`):

- **Broken binding** — it checked `window.EdgeImpulseClassifier`, but Emscripten
  embind registers the class on `Module` (`Module.EdgeImpulseClassifier`), so it
  failed to load.
- **Stale model** — 96×96 / INT8 / different class taxonomy from the model the
  rest of the project now trains and ships.
- **Two apps, one project** — having two browser deployments caused confusion
  about which one was authoritative.

`index.html` here is a redirect notice pointing at `../deploy/`.

## `legacy/`

`legacy/` preserves the **stock Edge Impulse WebAssembly demo** (extracted from
`seedy_final-wasm-v8-impulse-#1.zip`) as a reference. It is a generic
"paste feature vector → run inference" page, not the seed-classifier UI.

To run it (from this directory):

```bash
python legacy/server.py
```

It is kept for reference only and is not part of the supported deployment.

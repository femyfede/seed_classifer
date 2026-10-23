"""End-to-end check: real image -> browser preprocessing -> ONNX model.

Demonstrates that the exact preprocessing used by deploy/preprocess.js feeds
the ONNX model correctly (guarding AUDIT.md CRITICAL-1).

Usage:
    python tools/e2e_check.py
"""

from __future__ import annotations

import json
import os
import random
import subprocess
import sys
import tempfile

import numpy as np
from PIL import Image

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(SCRIPT_DIR)
DEPLOY = os.path.join(ROOT, "deploy")
DATA = os.path.join(ROOT, "data_maize_extracted")
SIZE = 64
PER_CLASS = 3


def main() -> int:
    try:
        import onnxruntime as ort
    except ImportError:
        print("onnxruntime not installed; skipping e2e check.")
        return 0

    classes = json.load(open(os.path.join(DEPLOY, "classes.json")))
    session = ort.InferenceSession(os.path.join(DEPLOY, "seed_classifier.onnx"),
                                   providers=["CPUExecutionProvider"])
    input_name = session.get_inputs()[0].name

    work = tempfile.mkdtemp(prefix="seed-e2e-")
    manifest = {}
    random.seed(11)

    for class_name in classes:
        class_dir = None
        for root, _dirs, files in os.walk(DATA):
            if os.path.basename(root).lower() == class_name and any(
                f.lower().endswith((".jpg", ".jpeg", ".png")) for f in files
            ):
                class_dir = root
                break
        images = sorted(
            f for f in os.listdir(class_dir)
            if f.lower().endswith((".jpg", ".jpeg", ".png"))
        )
        for i, fname in enumerate(random.sample(images, PER_CLASS)):
            arr = np.asarray(
                Image.open(os.path.join(class_dir, fname)).convert("RGB")
                .resize((SIZE, SIZE), Image.BILINEAR),
                dtype=np.uint8,
            )
            rgba = np.concatenate([arr, np.full((SIZE, SIZE, 1), 255, dtype=np.uint8)], axis=2)
            key = f"{class_name}_{i}"
            open(os.path.join(work, key + ".rgba"), "wb").write(rgba.tobytes())
            manifest[key] = class_name

    subprocess.run(["node", os.path.join(SCRIPT_DIR, "e2e_preprocess.js"), work, str(SIZE)],
                   check=True)

    correct = 0
    total = 0
    print(f"{'fixture':<14}{'true':<10}{'predicted':<12}{'p(conf)':>8}")
    for key, true_class in manifest.items():
        tensor = np.fromfile(os.path.join(work, key + ".f32"), dtype=np.float32)
        tensor = tensor.reshape(1, 3, SIZE, SIZE)
        logits = session.run(None, {input_name: tensor})[0][0]
        exp = np.exp(logits - logits.max())
        probs = exp / exp.sum()
        pred = classes[int(probs.argmax())]
        total += 1
        correct += int(pred == true_class)
        print(f"{key:<14}{true_class:<10}{pred:<12}{probs.max():>8.3f}")

    acc = correct / total
    print(f"\nEnd-to-end accuracy (browser preprocessing -> ONNX): {acc:.0%} "
          f"({correct}/{total})")
    return 0 if acc >= 0.75 else 1


if __name__ == "__main__":
    raise SystemExit(main())

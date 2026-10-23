"""Generate a fixture for the Python <-> JavaScript preprocessing parity test.

Writes two files into tools/parity/:
  - fixture_rgba.bin     : size*size*4 RGBA bytes (u8)
  - fixture_expected.bin : 3*size*size float32, planal NCHW, normalized

The expected tensor is computed here independently of the JS module so the
test genuinely cross-checks the two implementations.
"""

from __future__ import annotations

import os
import struct

import numpy as np

SIZE = 64
MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)

HERE = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(HERE, "parity")


def main() -> None:
    os.makedirs(OUT_DIR, exist_ok=True)

    # Deterministic, non-trivial pattern so layout errors are obvious.
    yy, xx = np.mgrid[0:SIZE, 0:SIZE]
    r = ((xx * 255) // (SIZE - 1)).astype(np.uint8)
    g = ((yy * 255) // (SIZE - 1)).astype(np.uint8)
    b = (((xx + yy) * 255) // (2 * (SIZE - 1))).astype(np.uint8)
    a = np.full((SIZE, SIZE), 255, dtype=np.uint8)
    rgba = np.stack([r, g, b, a], axis=-1)  # HWC, 4 channels

    float_rgb = rgba[:, :, :3].astype(np.float32) / 255.0
    normalized = (float_rgb - MEAN) / STD                 # HWC
    planar = np.transpose(normalized, (2, 0, 1)).astype(np.float32)  # CHW

    with open(os.path.join(OUT_DIR, "fixture_rgba.bin"), "wb") as handle:
        handle.write(rgba.tobytes())
    with open(os.path.join(OUT_DIR, "fixture_expected.bin"), "wb") as handle:
        handle.write(struct.pack(f"<{planar.size}f", *planar.reshape(-1).tolist()))

    print(f"Fixture written to {OUT_DIR} (size={SIZE})")


if __name__ == "__main__":
    main()

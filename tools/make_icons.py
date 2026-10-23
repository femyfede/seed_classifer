#!/usr/bin/env python3
"""Generate the SeedyAI PWA icon set (local, dependency-light).

Run from the repo root:
    python tools/make_icons.py

Requires Pillow (already used by the training pipeline).
"""

from __future__ import annotations

import os
from PIL import Image, ImageDraw

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "deploy", "assets", "icons")
SIZE = 1024


def rounded_mask(size: int, radius: int) -> Image.Image:
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size, size), radius=radius, fill=255)
    return mask


def layer() -> Image.Image:
    return Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))


def draw_icon(maskable: bool = False) -> Image.Image:
    s = SIZE / 64.0
    img = Image.new("RGBA", (SIZE, SIZE), (24, 63, 50, 255))

    glow = layer()
    ImageDraw.Draw(glow).ellipse(
        (int(38 * s), int(2 * s), int(62 * s), int(26 * s)),
        fill=(244, 209, 133, 46),
    )
    img.alpha_composite(glow)

    # Kernel body, with highlights composited (not alpha-painted directly).
    kernel = layer()
    kd = ImageDraw.Draw(kernel)
    cx, cy = int(32 * s), int(34 * s)
    rx, ry = int(11.4 * s), int(18.2 * s)
    kd.ellipse((cx - rx, cy - ry, cx + rx, cy + ry), fill=(244, 209, 133, 255))
    shine = layer()
    sd = ImageDraw.Draw(shine)
    sd.ellipse(
        (cx - int(6.6 * s), cy - int(11.4 * s), cx + int(6.6 * s), cy + int(12.6 * s)),
        fill=(255, 242, 200, 145),
    )
    kernel.alpha_composite(shine)
    groove = layer()
    gd = ImageDraw.Draw(groove)
    gd.line(
        [(cx, cy - int(4 * s)), (cx - int(2 * s), cy + int(17 * s))],
        fill=(190, 131, 51, 90),
        width=max(2, int(2.2 * s)),
    )
    kernel.alpha_composite(groove)
    kernel = kernel.rotate(-16, resample=Image.BICUBIC, center=(cx, cy))
    img.alpha_composite(kernel)

    # Leaf: a tilted elliptical blade with a center vein.
    leaf = layer()
    lx, ly = int(41 * s), int(11 * s)
    lrx, lry = int(10 * s), int(4.6 * s)
    ld = ImageDraw.Draw(leaf)
    ld.ellipse((lx - lrx, ly - lry, lx + lrx, ly + lry), fill=(143, 181, 140, 255))
    leaf = leaf.rotate(-34, resample=Image.BICUBIC, center=(lx, ly))
    ld = ImageDraw.Draw(leaf)
    ld.line(
        [(int(33 * s), int(17 * s)), (int(48 * s), int(6 * s))],
        fill=(94, 143, 96, 200),
        width=max(2, int(1.6 * s)),
    )
    img.alpha_composite(leaf)

    # Tiny stem at the base.
    stem = layer()
    ImageDraw.Draw(stem).line(
        [(int(31 * s), int(50 * s)), (int(29 * s), int(57 * s))],
        fill=(94, 143, 96, 230),
        width=max(2, int(2.4 * s)),
    )
    img.alpha_composite(stem)

    if maskable:
        safe = Image.new("RGBA", (SIZE, SIZE), (24, 63, 50, 255))
        art = img.resize((int(SIZE * 0.70), int(SIZE * 0.70)), Image.LANCZOS)
        safe.alpha_composite(art, (int(SIZE * 0.15), int(SIZE * 0.15)))
        return safe
    return img


def main() -> None:
    os.makedirs(OUT, exist_ok=True)
    base = draw_icon(False)
    mask = rounded_mask(SIZE, int(SIZE * 0.22))
    rounded = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    rounded.paste(base, (0, 0), mask)
    rounded.resize((512, 512), Image.LANCZOS).save(os.path.join(OUT, "icon-512.png"), optimize=True)
    rounded.resize((192, 192), Image.LANCZOS).save(os.path.join(OUT, "icon-192.png"), optimize=True)
    rounded.resize((180, 180), Image.LANCZOS).save(os.path.join(OUT, "apple-touch-icon.png"), optimize=True)
    rounded.resize((32, 32), Image.LANCZOS).save(os.path.join(OUT, "favicon-32.png"), optimize=True)
    rounded.resize((48, 48), Image.LANCZOS).save(os.path.join(OUT, "favicon-48.png"), optimize=True)

    maskable = draw_icon(True)
    maskable.resize((512, 512), Image.LANCZOS).save(os.path.join(OUT, "maskable-512.png"), optimize=True)

    print("Wrote icons to", OUT)


if __name__ == "__main__":
    main()

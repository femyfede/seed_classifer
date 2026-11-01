"""
Maize Seed Classifier - training pipeline.

Trains a small CNN to classify maize seed varieties and exports:
  - best_model.pth      PyTorch checkpoint (best val macro-F1)
  - seed_classifier.onnx  ONNX model (NCHW float32, raw logits)
  - classes.json        ordered class list
  - model_meta.json     config, metrics, display-name mapping

Key properties (see AUDIT.md):
  * Seed-disjoint ("group-aware") splits so augmentations of the same
    physical seed never straddle train/val/test. This is essential because
    the dataset contains many augmented copies of very few source seeds.
  * Honest evaluation: per-class report, confusion matrix, and a
    held-out-seed accuracy metric.
  * Reproducible: explicit seeds, CLI-driven, no hard-coded user paths.
  * Strong augmentation to reduce reliance on the (blue) capture background.

Usage:
    python train_model.py --epochs 20
    python train_model.py --data-dir path/to/data --out-dir path/to/model
"""

from __future__ import annotations

import argparse
import json
import os
import random
import re
import time
from collections import defaultdict

import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from PIL import Image, ImageFilter
from sklearn.metrics import classification_report, confusion_matrix, f1_score
from torch.utils.data import DataLoader, Dataset
import torchvision.transforms as transforms

try:
    import onnx  # noqa: F401
    HAS_ONNX = True
except Exception:  # pragma: no cover - optional dependency
    HAS_ONNX = False

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# ImageNet statistics (must match the browser + on-device preprocessing).
MEAN = [0.485, 0.456, 0.406]
STD = [0.229, 0.224, 0.225]

# Human-facing display names for the model classes. The mapping is an explicit
# assumption (see AUDIT.md HIGH-1): the training folder "local" is presented as
# the "Asili" variety and "other" as "unrelated".
DISPLAY_NAMES = {
    "chotara": "Chotara",
    "huria": "Huria",
    "local": "Asili",
    "other": "unrelated",
}

IMAGE_EXTS = (".jpg", ".jpeg", ".png", ".bmp", ".webp")


# ---------------------------------------------------------------------------
# Dataset loading
# ---------------------------------------------------------------------------

def extract_group_id(filename: str) -> str:
    """Return the physical-seed identity a file belongs to.

    Examples:
        aug_0_1001402136_WangDataa29.jpg -> WangDataa29
        1251561412_SanzalSima9.jpg       -> SanzalSima9
        aug_0_1000623800_Bihilifa55.jpg  -> Bihilifa55
        aug_1.jpg / orig_5000.jpg        -> 1 / 5000
    """
    stem = os.path.splitext(filename)[0]
    match = re.search(r"([A-Za-z]+[0-9]+)$", stem)
    if match:
        return match.group(1)
    match = re.search(r"_([0-9]+)$", stem)
    if match:
        return match.group(1)
    return stem


def find_class_dirs(data_dir: str) -> dict[str, str]:
    """Map class name -> directory for every folder that directly holds images.

    Supports both flat (``data/chotara``) and nested
    (``data/data_maize/MaizeData/chotara``) layouts.
    """
    class_dirs: dict[str, str] = {}
    for root, _dirs, files in os.walk(data_dir):
        if not any(f.lower().endswith(IMAGE_EXTS) for f in files):
            continue
        name = os.path.basename(root).lower()
        # First occurrence wins; ignore the dataset root itself.
        if name and name not in class_dirs and root != data_dir:
            class_dirs[name] = root
    return class_dirs


def discover_classes(data_dir: str) -> list[str]:
    return sorted(find_class_dirs(data_dir))


def load_images(data_dir: str, classes: list[str], cache_size: int):
    """Load every image once, resized and cached as uint8 RGB arrays."""
    class_dirs = find_class_dirs(data_dir)
    images, labels, groups = [], [], []
    class_to_idx = {name: i for i, name in enumerate(classes)}

    for class_name in classes:
        class_dir = class_dirs[class_name]
        files = [
            f for f in os.listdir(class_dir) if f.lower().endswith(IMAGE_EXTS)
        ]
        print(f"  Loading {class_name}: {len(files)} images...")
        for fname in files:
            try:
                img = Image.open(os.path.join(class_dir, fname)).convert("RGB")
                img = img.resize((cache_size, cache_size), Image.BILINEAR)
                images.append(np.asarray(img, dtype=np.uint8))
                labels.append(class_to_idx[class_name])
                groups.append(extract_group_id(fname))
            except Exception as exc:  # pragma: no cover - defensive
                print(f"    ! skipped {fname}: {exc}")

    return np.stack(images), np.array(labels, dtype=np.int64), np.array(groups)


def synthesize_negatives(count: int, size: int, seed: int) -> np.ndarray:
    """Generate synthetic out-of-distribution images for the 'other' class.

    The real 'other' data (animals, phones, rice, sand) does not include
    foliage, so green/leaf-like inputs are confidently forced into seed
    classes. These synthetic negatives (vegetation greens, soil, skin, greys,
    gradients, noise, stripes) teach the reject bucket to cover them.

    Deliberately avoids the blue background and the yellow/cream seed colours
    so genuine seeds are not pushed into 'other'.
    """
    rng = np.random.default_rng(seed)
    images = []
    for _ in range(count):
        kind = rng.integers(0, 6)
        if kind == 0:  # flat colour from an OOD-friendly palette
            palette = [
                (60, 140, 50), (40, 110, 40), (90, 160, 70),      # greens
                (120, 90, 60), (90, 70, 50), (150, 120, 90),       # soil/brown
                (200, 200, 200), (240, 240, 240), (30, 30, 30),    # greys/white/black
                (220, 170, 140), (180, 130, 110),                  # skin
                (180, 60, 60), (140, 60, 140), (60, 140, 150),     # red/purple/teal
            ]
            img = np.full((size, size, 3), palette[int(rng.integers(0, len(palette)))], np.int16)
            img += rng.normal(0, 8, (size, size, 3)).astype(np.int16)
        elif kind == 1:  # linear gradient
            base = rng.integers(40, 200, 3)
            gx = np.linspace(0, 1, size)[:, None]
            gy = np.linspace(0, 1, size)[None, :]
            factor = 0.4 + 0.8 * (0.5 * gx + 0.5 * gy)
            img = base[None, None, :] * factor[:, :, None]
        elif kind == 2:  # coloured gaussian noise
            base = rng.integers(40, 200, 3)
            img = rng.normal(0, 30, (size, size, 3)) + base[None, None, :]
        elif kind == 3:  # blurred random blobs (foliage/mottled texture)
            base = rng.integers(30, 180, 3)
            small = rng.normal(0, 60, (8, 8, 3)) + base[None, None, :]
            img = np.asarray(
                Image.fromarray(np.clip(small, 0, 255).astype(np.uint8))
                .resize((size, size), Image.BILINEAR).filter(ImageFilter.GaussianBlur(1.5)),
                dtype=np.int16,
            )
        elif kind == 4:  # stripes (veins / edges)
            base = rng.integers(40, 200, 3)
            period = int(rng.integers(2, 6))
            stripe = ((np.arange(size) // period) % 2).astype(np.int16)
            img = base[None, None, :] + stripe[:, None, None] * 30 + stripe[None, :, None] * 20
        else:  # radial vignette
            yy, xx = np.mgrid[0:size, 0:size]
            r = np.sqrt((yy - size / 2) ** 2 + (xx - size / 2) ** 2) / (size / 2)
            base = rng.integers(40, 200, 3)
            img = base[None, None, :] * (1 - 0.6 * r[:, :, None])

        images.append(np.clip(img, 0, 255).astype(np.uint8))
    return np.stack(images)


# ---------------------------------------------------------------------------
# Group-aware splitting
# ---------------------------------------------------------------------------

def group_split(classes, labels, groups, test_size, val_size, seed):
    """Split indices so that no group id appears in more than one split.

    Splitting is done per class so the class distribution is preserved.
    """
    rng = random.Random(seed)
    train_idx, val_idx, test_idx = [], [], []

    for class_idx in range(len(classes)):
        class_positions = np.where(labels == class_idx)[0]
        by_group = defaultdict(list)
        for pos in class_positions:
            by_group[groups[pos]].append(int(pos))

        group_ids = sorted(by_group)
        rng.shuffle(group_ids)

        n = len(group_ids)
        n_test = max(1, int(round(n * test_size))) if n > 1 else 0
        n_val = max(1, int(round(n * val_size))) if n - n_test > 1 else 0

        test_groups = set(group_ids[:n_test])
        val_groups = set(group_ids[n_test:n_test + n_val])

        for gid, positions in by_group.items():
            if gid in test_groups:
                test_idx.extend(positions)
            elif gid in val_groups:
                val_idx.extend(positions)
            else:
                train_idx.extend(positions)

    rng.shuffle(train_idx)
    rng.shuffle(val_idx)
    rng.shuffle(test_idx)
    return (
        np.array(train_idx, dtype=np.int64),
        np.array(val_idx, dtype=np.int64),
        np.array(test_idx, dtype=np.int64),
    )


# ---------------------------------------------------------------------------
# Dataset / model
# ---------------------------------------------------------------------------

class SeedDataset(Dataset):
    def __init__(self, images, labels, transform):
        self.images = images
        self.labels = labels
        self.transform = transform

    def __len__(self):
        return len(self.images)

    def __getitem__(self, idx):
        img = Image.fromarray(self.images[idx])
        x = self.transform(img)
        return x, int(self.labels[idx])


class SeedCNN(nn.Module):
    def __init__(self, num_classes, width=1.0):
        super().__init__()

        def ch(base):
            return max(8, int(base * width))

        c1, c2, c3, c4 = ch(32), ch(64), ch(128), ch(128)
        fc = ch(256)

        self.features = nn.Sequential(
            nn.Conv2d(3, c1, 3, padding=1), nn.BatchNorm2d(c1), nn.ReLU(True),
            nn.MaxPool2d(2), nn.Dropout2d(0.15),

            nn.Conv2d(c1, c2, 3, padding=1), nn.BatchNorm2d(c2), nn.ReLU(True),
            nn.MaxPool2d(2), nn.Dropout2d(0.15),

            nn.Conv2d(c2, c3, 3, padding=1), nn.BatchNorm2d(c3), nn.ReLU(True),
            nn.MaxPool2d(2), nn.Dropout2d(0.15),

            nn.Conv2d(c3, c4, 3, padding=1), nn.BatchNorm2d(c4), nn.ReLU(True),
            nn.AdaptiveAvgPool2d(4),
        )
        self.classifier = nn.Sequential(
            nn.Linear(c4 * 4 * 4, fc), nn.ReLU(True), nn.Dropout(0.4),
            nn.Linear(fc, num_classes),
        )

    def forward(self, x):
        x = self.features(x)
        x = x.view(x.size(0), -1)
        return self.classifier(x)


def build_transforms(img_size):
    train_tf = transforms.Compose([
        transforms.RandomResizedCrop(img_size, scale=(0.6, 1.0), ratio=(0.8, 1.25)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomVerticalFlip(),
        transforms.RandomRotation(180),
        transforms.ColorJitter(0.3, 0.3, 0.3, 0.05),
        transforms.RandomGrayscale(p=0.1),
        transforms.ToTensor(),
        transforms.Normalize(MEAN, STD),
        transforms.RandomErasing(p=0.2, scale=(0.02, 0.15)),
    ])
    eval_tf = transforms.Compose([
        transforms.Resize((img_size, img_size)),
        transforms.ToTensor(),
        transforms.Normalize(MEAN, STD),
    ])
    return train_tf, eval_tf


# ---------------------------------------------------------------------------
# Training / evaluation
# ---------------------------------------------------------------------------

def run_epoch(model, loader, criterion, device, optimizer=None):
    train = optimizer is not None
    model.train(train)
    total_loss, correct, total = 0.0, 0, 0
    preds_all, labels_all = [], []

    context = torch.enable_grad() if train else torch.no_grad()
    with context:
        for images, labels in loader:
            images, labels = images.to(device), labels.to(device)
            if train:
                optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            if train:
                loss.backward()
                optimizer.step()
            total_loss += loss.item() * images.size(0)
            preds = outputs.argmax(1)
            correct += (preds == labels).sum().item()
            total += labels.size(0)
            preds_all.extend(preds.cpu().numpy())
            labels_all.extend(labels.cpu().numpy())

    return (
        total_loss / max(total, 1),
        correct / max(total, 1),
        np.array(preds_all),
        np.array(labels_all),
    )


def main():
    parser = argparse.ArgumentParser(description="Train the maize seed classifier.")
    parser.add_argument("--data-dir", default=os.path.join(SCRIPT_DIR, "data_maize_extracted"))
    parser.add_argument("--out-dir", default=os.path.join(SCRIPT_DIR, "model"))
    parser.add_argument("--img-size", type=int, default=64)
    parser.add_argument("--cache-size", type=int, default=80,
                        help="Resolution images are cached at before augmentation.")
    parser.add_argument("--batch-size", type=int, default=128)
    parser.add_argument("--epochs", type=int, default=20)
    parser.add_argument("--lr", type=float, default=2e-3)
    parser.add_argument("--width", type=float, default=1.0, help="Model width multiplier.")
    parser.add_argument("--test-size", type=float, default=0.2)
    parser.add_argument("--val-size", type=float, default=0.1)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--workers", type=int, default=0)
    parser.add_argument("--no-group-split", action="store_true",
                        help="Use a naive per-image split (leaks augmentations).")
    parser.add_argument("--synth-negatives", type=int, default=3000,
                        help="Synthetic OOD negatives added to the 'other' class "
                             "(train split only). Use 0 to disable.")
    args = parser.parse_args()

    # Reproducibility.
    random.seed(args.seed)
    np.random.seed(args.seed)
    torch.manual_seed(args.seed)

    os.makedirs(args.out_dir, exist_ok=True)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Device: {device}")

    classes = discover_classes(args.data_dir)
    if not classes:
        raise SystemExit(f"No class folders with images found in {args.data_dir}")
    print(f"Classes ({len(classes)}): {classes}")

    print("Loading data...")
    t0 = time.time()
    images, labels, groups = load_images(args.data_dir, classes, args.cache_size)
    print(f"Dataset: {images.shape}, counts: {np.bincount(labels).tolist()} "
          f"({time.time() - t0:.0f}s)")

    if args.no_group_split:
        print("WARNING: naive per-image split selected - metrics will be optimistic.")
        from sklearn.model_selection import train_test_split
        idx = np.arange(len(labels))
        train_idx, test_idx = train_test_split(
            idx, test_size=args.test_size, random_state=args.seed, stratify=labels)
        train_idx, val_idx = train_test_split(
            train_idx, test_size=args.val_size, random_state=args.seed,
            stratify=labels[train_idx])
    else:
        train_idx, val_idx, test_idx = group_split(
            classes, labels, groups, args.test_size, args.val_size, args.seed)

    # Add synthetic out-of-distribution negatives to the 'other' class. They
    # are attached to the *training* split only, so validation/test 'other'
    # metrics stay honest (real unrelated images).
    synth_added = 0
    if args.synth_negatives > 0:
        if "other" in classes:
            other_idx = classes.index("other")
            synth = synthesize_negatives(args.synth_negatives, args.cache_size, args.seed)
            base = len(images)
            images = np.concatenate([images, synth], axis=0)
            labels = np.concatenate(
                [labels, np.full(len(synth), other_idx, dtype=np.int64)], axis=0)
            groups = np.concatenate(
                [groups, np.array([f"SYN_{i}" for i in range(len(synth))])], axis=0)
            train_idx = np.concatenate(
                [train_idx, np.arange(base, base + len(synth), dtype=np.int64)])
            synth_added = len(synth)
            print(f"Added {synth_added} synthetic OOD negatives to 'other' (train only).")
        else:
            print("Note: no 'other' class found - synthetic negatives skipped.")

    n_groups = len(set(groups)) - synth_added
    n_train_groups = len(set(groups[train_idx])) if len(train_idx) else 0
    n_val_groups = len(set(groups[val_idx])) if len(val_idx) else 0
    n_test_groups = len(set(groups[test_idx])) if len(test_idx) else 0
    print(f"Split (group-aware={not args.no_group_split}): "
          f"train={len(train_idx)}, val={len(val_idx)}, test={len(test_idx)}, "
          f"unique seeds={n_groups} (train {n_train_groups - synth_added}, "
          f"val {n_val_groups}, test {n_test_groups})")

    train_tf, eval_tf = build_transforms(args.img_size)
    train_ds = SeedDataset(images[train_idx], labels[train_idx], train_tf)
    val_ds = SeedDataset(images[val_idx], labels[val_idx], eval_tf)
    test_ds = SeedDataset(images[test_idx], labels[test_idx], eval_tf)

    train_loader = DataLoader(train_ds, batch_size=args.batch_size, shuffle=True,
                              num_workers=args.workers, drop_last=False)
    val_loader = DataLoader(val_ds, batch_size=args.batch_size, shuffle=False,
                            num_workers=args.workers)
    test_loader = DataLoader(test_ds, batch_size=args.batch_size, shuffle=False,
                             num_workers=args.workers)

    model = SeedCNN(len(classes), width=args.width).to(device)

    # Compute class weights to handle imbalance
    class_counts = np.bincount(train_labels, minlength=len(classes))
    class_weights = torch.tensor(len(train_labels) / (len(classes) * (class_counts + 1e-8)),
                                  dtype=torch.float32, device=device)
    print(f"Class weights: {class_weights.tolist()}")

    criterion = nn.CrossEntropyLoss(weight=class_weights, label_smoothing=0.05)
    optimizer = optim.Adam(model.parameters(), lr=args.lr, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=args.epochs)

    best_f1, best_path = -1.0, os.path.join(args.out_dir, "best_model.pth")
    print(f"\nTraining {args.epochs} epochs...")
    start = time.time()

    for epoch in range(args.epochs):
        ep = time.time()
        tr_loss, tr_acc, _, _ = run_epoch(model, train_loader, criterion, device, optimizer)
        va_loss, va_acc, va_pred, va_true = run_epoch(model, val_loader, criterion, device)
        macro_f1 = f1_score(va_true, va_pred, average="macro", zero_division=0)
        scheduler.step()
        lr = optimizer.param_groups[0]["lr"]
        print(f"Epoch {epoch + 1:2d}/{args.epochs} [{time.time() - ep:5.0f}s] "
              f"train {tr_loss:.4f}/{tr_acc:.4f} | "
              f"val {va_loss:.4f}/{va_acc:.4f} f1={macro_f1:.4f} | lr {lr:.5f}")

        if macro_f1 > best_f1:
            best_f1 = macro_f1
            torch.save(model.state_dict(), best_path)
            print(f"   * saved best (val macro-F1={macro_f1:.4f})")

    print(f"\nTraining finished in {time.time() - start:.0f}s. Best val macro-F1: {best_f1:.4f}")

    # ----- Evaluation on the held-out (seed-disjoint) test set -----
    model.load_state_dict(torch.load(best_path, map_location=device, weights_only=True))
    _, test_acc, preds, truth = run_epoch(model, test_loader, criterion, device)

    print("\nHeld-out seed test set:")
    print(classification_report(truth, preds, target_names=classes, zero_division=0,
                                digits=4))
    print("Confusion matrix (rows=true, cols=pred):")
    print(confusion_matrix(truth, preds))

    # ----- Export ONNX -----
    if HAS_ONNX:
        print("Exporting ONNX...")
        model.eval()
        dummy = torch.randn(1, 3, args.img_size, args.img_size, device=device)
        onnx_path = os.path.join(args.out_dir, "seed_classifier.onnx")
        export_kwargs = dict(
            input_names=["input"], output_names=["output"],
            dynamic_axes={"input": {0: "batch"}, "output": {0: "batch"}},
            opset_version=11,
        )
        try:
            torch.onnx.export(model, dummy, onnx_path, dynamo=False, **export_kwargs)
        except TypeError:
            torch.onnx.export(model, dummy, onnx_path, **export_kwargs)
        print(f"ONNX saved: {onnx_path}")
    else:
        print("onnx package not installed - skipping ONNX export.")

    # ----- Metadata -----
    with open(os.path.join(args.out_dir, "classes.json"), "w") as handle:
        json.dump(classes, handle, indent=2)

    report = classification_report(truth, preds, target_names=classes,
                                   zero_division=0, output_dict=True)
    meta = {
        "classes": classes,
        "display_names": [DISPLAY_NAMES.get(c, c) for c in classes],
        "img_size": args.img_size,
        "normalization": {"mean": MEAN, "std": STD, "layout": "NCHW"},
        "group_aware_split": not args.no_group_split,
        "unique_seeds": {
            "total": n_groups,
            "train": n_train_groups,
            "val": n_val_groups,
            "test": n_test_groups,
        },
        "val_macro_f1": best_f1,
        "test_accuracy": test_acc,
        "per_class": report,
        "num_params": sum(p.numel() for p in model.parameters()),
    }
    with open(os.path.join(args.out_dir, "model_meta.json"), "w") as handle:
        json.dump(meta, handle, indent=2)

    print(f"\nArtifacts written to {args.out_dir}:")
    print("  best_model.pth, seed_classifier.onnx, classes.json, model_meta.json")
    print(f"Test accuracy (seed-disjoint): {test_acc:.4f}, macro-F1: {best_f1:.4f}")
    print("DONE!")


if __name__ == "__main__":
    main()

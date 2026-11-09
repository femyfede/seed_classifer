#!/usr/bin/env python3
"""
Maize Seed Classifier - Multi-Kernel Training Pipeline

Trains a CNN to classify maize seed samples with MULTIPLE kernels per image.
This version is optimized for batch/sample classification instead of single kernels.

Key changes from single-kernel version:
  * Less aggressive augmentation (multiple kernels provide diversity)
  * Same model architecture (CNN generalizes well)
  * Focus on sample-level classification
  * Exports as: seed_classifier_multikernel.onnx

Usage:
    python train_multikernel_model.py --data-dir data_maize_multikernel --epochs 25
    python train_multikernel_model.py --data-dir data_maize_multikernel --out-dir model
"""

import argparse
import json
import os
import random
import re
from collections import defaultdict
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from PIL import Image
from sklearn.metrics import classification_report, confusion_matrix, f1_score
from torch.utils.data import DataLoader, Dataset
import torchvision.transforms as transforms

try:
    import onnx
    HAS_ONNX = True
except:
    HAS_ONNX = False

SCRIPT_DIR = Path(__file__).parent
MEAN = [0.485, 0.456, 0.406]
STD = [0.229, 0.224, 0.225]

DISPLAY_NAMES = {
    "chotara": "Chotara",
    "huria": "Huria",
    "asili": "Asili",
    "local": "Asili",
    "other": "unrelated",
}

IMAGE_EXTS = (".jpg", ".jpeg", ".png", ".bmp", ".webp")


def find_class_dirs(data_dir: str) -> dict:
    """Find class directories in data folder."""
    class_dirs = {}
    for root, _dirs, files in os.walk(data_dir):
        if not any(f.lower().endswith(IMAGE_EXTS) for f in files):
            continue
        name = os.path.basename(root).lower()
        if name and name not in class_dirs and root != data_dir:
            class_dirs[name] = root
    return class_dirs


def discover_classes(data_dir: str) -> list:
    return sorted(find_class_dirs(data_dir))


def load_images(data_dir: str, classes: list, cache_size: int = 224):
    """Load multi-kernel sample images."""
    class_dirs = find_class_dirs(data_dir)
    images, labels, groups = [], [], []
    class_to_idx = {name: i for i, name in enumerate(classes)}

    for class_name in classes:
        class_dir = class_dirs[class_name]
        files = [f for f in os.listdir(class_dir) if f.lower().endswith(IMAGE_EXTS)]
        print(f"  Loading {class_name}: {len(files)} samples...")

        for fname in files:
            try:
                img = Image.open(os.path.join(class_dir, fname)).convert("RGB")
                img = img.resize((cache_size, cache_size), Image.BILINEAR)
                images.append(np.asarray(img, dtype=np.uint8))
                labels.append(class_to_idx[class_name])
                groups.append(fname.split("_")[0])  # Group by filename prefix
            except Exception as e:
                print(f"    ! skipped {fname}: {e}")

    return np.stack(images), np.array(labels, dtype=np.int64), np.array(groups)


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
    """Build transforms - lighter augmentation for multi-kernel samples."""
    train_tf = transforms.Compose([
        # Less aggressive augmentation for multi-kernel images
        transforms.RandomResizedCrop(img_size, scale=(0.8, 1.0), ratio=(0.9, 1.1)),
        transforms.RandomHorizontalFlip(p=0.3),
        transforms.RandomVerticalFlip(p=0.3),
        transforms.RandomRotation(45),
        transforms.ColorJitter(0.2, 0.2, 0.2, 0.05),
        transforms.ToTensor(),
        transforms.Normalize(MEAN, STD),
    ])

    val_tf = transforms.Compose([
        transforms.Resize(img_size),
        transforms.CenterCrop(img_size),
        transforms.ToTensor(),
        transforms.Normalize(MEAN, STD),
    ])

    return train_tf, val_tf


def train_epoch(model, loader, criterion, optimizer, device):
    model.train()
    total_loss = 0
    for x, y in loader:
        x, y = x.to(device), y.to(device)
        optimizer.zero_grad()
        out = model(x)
        loss = criterion(out, y)
        loss.backward()
        optimizer.step()
        total_loss += loss.item() * y.size(0)
    return total_loss / len(loader.dataset)


def eval_epoch(model, loader, criterion, device):
    model.eval()
    total_loss = 0
    all_preds, all_true = [], []
    with torch.no_grad():
        for x, y in loader:
            x, y = x.to(device), y.to(device)
            out = model(x)
            loss = criterion(out, y)
            total_loss += loss.item() * y.size(0)
            all_preds.extend(out.argmax(1).cpu().numpy())
            all_true.extend(y.cpu().numpy())
    return total_loss / len(loader.dataset), np.array(all_preds), np.array(all_true)


def export_onnx(model, img_size, out_path):
    """Export model to ONNX format."""
    if not HAS_ONNX:
        print("  ! onnx not installed; skipping export")
        return

    dummy = torch.randn(1, 3, img_size, img_size)
    try:
        torch.onnx.export(
            model, dummy, out_path,
            input_names=["images"],
            output_names=["logits"],
            opset_version=12,
            verbose=False,
        )
        print(f"  ✓ Exported: {out_path}")
    except Exception as e:
        print(f"  ! ONNX export failed: {e}")


def main():
    parser = argparse.ArgumentParser(
        description="Train multi-kernel maize seed classifier"
    )
    parser.add_argument("--data-dir", default="data_maize_multikernel",
                        help="Path to training data (with asili/chotara/huria folders)")
    parser.add_argument("--out-dir", default="model",
                        help="Output directory for model files")
    parser.add_argument("--epochs", type=int, default=25,
                        help="Number of training epochs")
    parser.add_argument("--batch-size", type=int, default=16,
                        help="Batch size")
    parser.add_argument("--img-size", type=int, default=224,
                        help="Image size")
    parser.add_argument("--seed", type=int, default=42,
                        help="Random seed")
    parser.add_argument("--device", default="cuda" if torch.cuda.is_available() else "cpu")

    args = parser.parse_args()

    # Setup
    torch.manual_seed(args.seed)
    np.random.seed(args.seed)
    random.seed(args.seed)
    os.makedirs(args.out_dir, exist_ok=True)
    device = torch.device(args.device)

    print(f"\n{'='*60}")
    print("MULTI-KERNEL MAIZE SEED CLASSIFIER - TRAINING")
    print(f"{'='*60}\n")

    # Load data
    print("Loading data...")
    classes = discover_classes(args.data_dir)
    print(f"  Classes: {classes}")

    images, labels, groups = load_images(args.data_dir, classes, args.img_size)
    print(f"  Total samples: {len(images)}")

    # Split data
    from sklearn.model_selection import train_test_split
    indices = np.arange(len(images))
    train_idx, test_idx = train_test_split(
        indices, test_size=0.2, stratify=labels, random_state=args.seed
    )
    train_idx, val_idx = train_test_split(
        train_idx, test_size=0.2, stratify=labels[train_idx], random_state=args.seed
    )

    train_tf, val_tf = build_transforms(args.img_size)

    train_ds = SeedDataset(images[train_idx], labels[train_idx], train_tf)
    val_ds = SeedDataset(images[val_idx], labels[val_idx], val_tf)
    test_ds = SeedDataset(images[test_idx], labels[test_idx], val_tf)

    train_loader = DataLoader(train_ds, batch_size=args.batch_size, shuffle=True)
    val_loader = DataLoader(val_ds, batch_size=args.batch_size)
    test_loader = DataLoader(test_ds, batch_size=args.batch_size)

    # Model
    print(f"\nInitializing model...")
    model = SeedCNN(len(classes)).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    scheduler = optim.lr_scheduler.StepLR(optimizer, step_size=10, gamma=0.5)

    best_val_f1 = 0
    best_model_path = os.path.join(args.out_dir, "best_multikernel_model.pth")

    print(f"\nTraining for {args.epochs} epochs...\n")

    for epoch in range(args.epochs):
        train_loss = train_epoch(model, train_loader, criterion, optimizer, device)
        val_loss, val_preds, val_true = eval_epoch(model, val_loader, criterion, device)
        val_f1 = f1_score(val_true, val_preds, average="macro", zero_division=0)

        scheduler.step()

        if val_f1 > best_val_f1:
            best_val_f1 = val_f1
            torch.save(model.state_dict(), best_model_path)

        print(f"Epoch {epoch+1:2d}/{args.epochs} | "
              f"Train Loss: {train_loss:.4f} | "
              f"Val Loss: {val_loss:.4f} | "
              f"Val F1: {val_f1:.4f}")

    # Evaluate on test set
    print(f"\n{'='*60}")
    print("FINAL EVALUATION")
    print(f"{'='*60}\n")

    model.load_state_dict(torch.load(best_model_path))
    test_loss, test_preds, test_true = eval_epoch(model, test_loader, criterion, device)
    test_f1 = f1_score(test_true, test_preds, average="macro", zero_division=0)

    print(f"Test Loss: {test_loss:.4f}")
    print(f"Test Macro-F1: {test_f1:.4f}\n")
    print(classification_report(test_true, test_preds, target_names=classes))

    # Export
    print(f"\nExporting model...")
    onnx_path = os.path.join(args.out_dir, "seed_classifier_multikernel.onnx")
    export_onnx(model, args.img_size, onnx_path)

    # Save metadata
    meta = {
        "classes": classes,
        "img_size": args.img_size,
        "display_names": {c: DISPLAY_NAMES.get(c, c) for c in classes},
        "test_f1": float(test_f1),
        "model_type": "multikernel",
    }
    meta_path = os.path.join(args.out_dir, "model_meta_multikernel.json")
    with open(meta_path, "w") as f:
        json.dump(meta, f, indent=2)

    print(f"  ✓ Metadata: {meta_path}")
    print(f"\n{'='*60}")
    print("✓ TRAINING COMPLETE")
    print(f"{'='*60}\n")
    print(f"Model ready for deployment!")


if __name__ == "__main__":
    main()

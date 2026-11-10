#!/usr/bin/env python3
"""
Data Augmentation & Training Pipeline for Multi-Kernel Maize Classifier

This script:
1. Takes sample images from the user
2. Applies aggressive data augmentation (rotation, flip, color, zoom)
3. Generates 30+ variations per sample
4. Trains the model on augmented data
5. Exports the new model

Usage:
    python augment_and_train.py --images image1.jpg image2.jpg image3.jpg \
                                 --labels asili chotara huria \
                                 --epochs 30
"""

import argparse
import os
import random
import numpy as np
from pathlib import Path
from PIL import Image, ImageEnhance, ImageOps
import json

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset
import torchvision.transforms as transforms
from sklearn.metrics import f1_score, classification_report

SCRIPT_DIR = Path(__file__).parent
DATA_DIR = SCRIPT_DIR / "data_maize_multikernel" / "MaizeData"
MEAN = [0.485, 0.456, 0.406]
STD = [0.229, 0.224, 0.225]

DISPLAY_NAMES = {
    "chotara": "Chotara",
    "huria": "Huria",
    "asili": "Asili",
}


class ImageAugmentor:
    """Aggressive augmentation for multi-kernel samples"""

    @staticmethod
    def rotate(img, angle):
        return img.rotate(angle, expand=False, fillcolor=(255, 255, 255))

    @staticmethod
    def flip_h(img):
        return ImageOps.mirror(img)

    @staticmethod
    def flip_v(img):
        return ImageOps.flip(img)

    @staticmethod
    def color_jitter(img, brightness=0.3, contrast=0.3, saturation=0.3):
        img = ImageEnhance.Brightness(img).enhance(1 + random.uniform(-brightness, brightness))
        img = ImageEnhance.Contrast(img).enhance(1 + random.uniform(-contrast, contrast))
        img = ImageEnhance.Color(img).enhance(1 + random.uniform(-saturation, saturation))
        return img

    @staticmethod
    def zoom(img, zoom_range=(0.8, 1.2)):
        """Random zoom in/out"""
        zoom = random.uniform(zoom_range[0], zoom_range[1])
        w, h = img.size
        new_w, new_h = int(w * zoom), int(h * zoom)

        if zoom > 1:
            img = img.resize((new_w, new_h), Image.BILINEAR)
            x = (new_w - w) // 2
            y = (new_h - h) // 2
            img = img.crop((x, y, x+w, y+h))
        else:
            img_cropped = img.crop((0, 0, new_w, new_h))
            white_img = Image.new('RGB', (w, h), (255, 255, 255))
            x = (w - new_w) // 2
            y = (h - new_h) // 2
            white_img.paste(img_cropped, (x, y))
            img = white_img

        return img

    @staticmethod
    def gaussian_blur(img, radius=1.5):
        """Light blur"""
        return img.filter(Image.GaussianBlur(radius=radius))

    @classmethod
    def augment_image(cls, img_path, num_variations=30):
        """Generate multiple augmented versions of an image"""
        img = Image.open(img_path).convert('RGB')
        img = img.resize((224, 224), Image.BILINEAR)

        augmented = [img]  # Original

        for _ in range(num_variations):
            aug_img = img.copy()

            # Random combination of augmentations
            if random.random() > 0.3:
                aug_img = cls.rotate(aug_img, random.uniform(-25, 25))

            if random.random() > 0.4:
                aug_img = cls.flip_h(aug_img) if random.random() > 0.5 else aug_img

            if random.random() > 0.4:
                aug_img = cls.flip_v(aug_img)

            if random.random() > 0.3:
                aug_img = cls.color_jitter(aug_img, brightness=0.2, contrast=0.2, saturation=0.2)

            if random.random() > 0.5:
                aug_img = cls.zoom(aug_img, zoom_range=(0.85, 1.15))

            if random.random() > 0.6:
                aug_img = cls.gaussian_blur(aug_img, radius=0.5)

            augmented.append(aug_img)

        return augmented


def create_augmented_dataset(image_paths, labels, output_dir="data_maize_multikernel"):
    """Create augmented training dataset"""
    data_dir = Path(output_dir) / "MaizeData"

    # Create directories
    for label in set(labels):
        label_dir = data_dir / label.lower()
        label_dir.mkdir(parents=True, exist_ok=True)

    print("\nGenerating augmented samples...")
    total_generated = 0

    for img_path, label in zip(image_paths, labels):
        label_lower = label.lower()
        label_dir = data_dir / label_lower

        print(f"\n  Processing {Path(img_path).name} -> {label}...")

        # Generate augmentations
        augmented_images = ImageAugmentor.augment_image(img_path, num_variations=30)

        for idx, aug_img in enumerate(augmented_images):
            save_path = label_dir / f"{label_lower}_aug_{idx:03d}_{Path(img_path).stem}.jpg"
            aug_img.save(str(save_path), quality=95)
            total_generated += 1

        print(f"    Generated {len(augmented_images)} variations")

    print(f"\n  Total augmented samples created: {total_generated}")
    return total_generated


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


def load_images_from_dir(data_dir, classes):
    """Load all augmented images from directory"""
    images, labels, groups = [], [], []
    class_to_idx = {name: i for i, name in enumerate(classes)}

    for class_name in classes:
        class_dir = Path(data_dir) / "MaizeData" / class_name.lower()
        if not class_dir.exists():
            continue

        files = [f for f in class_dir.glob("*.jpg") if f.is_file()]
        print(f"  Loading {class_name}: {len(files)} augmented samples...")

        for fpath in files:
            try:
                img = Image.open(fpath).convert("RGB")
                img = img.resize((224, 224), Image.BILINEAR)
                images.append(np.asarray(img, dtype=np.uint8))
                labels.append(class_to_idx[class_name.lower()])
                groups.append(fpath.stem)
            except Exception as e:
                print(f"    ! skipped {fpath.name}: {e}")

    return np.stack(images), np.array(labels, dtype=np.int64), np.array(groups)


def train_model(data_dir, classes, epochs=30, batch_size=16, device="cuda"):
    """Train the model on augmented data"""
    device = torch.device(device if torch.cuda.is_available() else "cpu")

    print(f"\n{'='*60}")
    print("TRAINING AUGMENTED MULTI-KERNEL MODEL")
    print(f"{'='*60}\n")

    # Load images
    print("Loading augmented images...")
    images, labels, groups = load_images_from_dir(data_dir, classes)
    print(f"  Total samples: {len(images)}\n")

    # Split data
    from sklearn.model_selection import train_test_split
    indices = np.arange(len(images))
    train_idx, test_idx = train_test_split(
        indices, test_size=0.15, stratify=labels, random_state=42
    )
    train_idx, val_idx = train_test_split(
        train_idx, test_size=0.15, stratify=labels[train_idx], random_state=42
    )

    # Transforms
    train_tf = transforms.Compose([
        transforms.RandomRotation(15),
        transforms.RandomHorizontalFlip(p=0.2),
        transforms.ToTensor(),
        transforms.Normalize(MEAN, STD),
    ])

    val_tf = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize(MEAN, STD),
    ])

    train_ds = SeedDataset(images[train_idx], labels[train_idx], train_tf)
    val_ds = SeedDataset(images[val_idx], labels[val_idx], val_tf)
    test_ds = SeedDataset(images[test_idx], labels[test_idx], val_tf)

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_ds, batch_size=batch_size)
    test_loader = DataLoader(test_ds, batch_size=batch_size)

    # Model
    model = SeedCNN(len(classes)).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    scheduler = optim.lr_scheduler.StepLR(optimizer, step_size=10, gamma=0.5)

    best_val_f1 = 0
    os.makedirs("model", exist_ok=True)
    best_model_path = "model/best_augmented_model.pth"

    print(f"Training for {epochs} epochs...\n")

    for epoch in range(epochs):
        # Train
        model.train()
        train_loss = 0
        for x, y in train_loader:
            x, y = x.to(device), y.to(device)
            optimizer.zero_grad()
            out = model(x)
            loss = criterion(out, y)
            loss.backward()
            optimizer.step()
            train_loss += loss.item() * y.size(0)
        train_loss /= len(train_ds)

        # Validate
        model.eval()
        val_loss = 0
        val_preds = []
        val_true = []
        with torch.no_grad():
            for x, y in val_loader:
                x, y = x.to(device), y.to(device)
                out = model(x)
                loss = criterion(out, y)
                val_loss += loss.item() * y.size(0)
                val_preds.extend(out.argmax(1).cpu().numpy())
                val_true.extend(y.cpu().numpy())
        val_loss /= len(val_ds)
        val_f1 = f1_score(val_true, val_preds, average="macro", zero_division=0)

        if val_f1 > best_val_f1:
            best_val_f1 = val_f1
            torch.save(model.state_dict(), best_model_path)

        scheduler.step()

        print(f"Epoch {epoch+1:2d}/{epochs} | "
              f"Train Loss: {train_loss:.4f} | "
              f"Val Loss: {val_loss:.4f} | "
              f"Val F1: {val_f1:.4f}")

    # Test evaluation
    print(f"\n{'='*60}")
    print("FINAL EVALUATION")
    print(f"{'='*60}\n")

    model.load_state_dict(torch.load(best_model_path))
    model.eval()
    test_preds = []
    test_true = []
    with torch.no_grad():
        for x, y in test_loader:
            x, y = x.to(device), y.to(device)
            out = model(x)
            test_preds.extend(out.argmax(1).cpu().numpy())
            test_true.extend(y.cpu().numpy())

    test_f1 = f1_score(test_true, test_preds, average="macro", zero_division=0)
    print(f"Test Macro-F1: {test_f1:.4f}\n")
    print(classification_report(test_true, test_preds, target_names=classes))

    # Export ONNX
    try:
        import onnx
        dummy = torch.randn(1, 3, 224, 224).to(device)
        onnx_path = "model/seed_classifier_multikernel.onnx"
        torch.onnx.export(model, dummy, onnx_path,
                         input_names=["images"], output_names=["logits"],
                         opset_version=12, verbose=False)
        print(f"[OK] Exported: {onnx_path}")
    except Exception as e:
        print(f"[!] ONNX export failed: {e}")

    # Save metadata
    meta = {
        "classes": classes,
        "img_size": 224,
        "display_names": {c: DISPLAY_NAMES.get(c.lower(), c) for c in classes},
        "test_f1": float(test_f1),
        "model_type": "multikernel_augmented",
        "augmentation_samples": "30 per image",
    }
    with open("model/model_meta_multikernel.json", "w") as f:
        json.dump(meta, f, indent=2)

    print(f"\n{'='*60}")
    print("TRAINING COMPLETE!")
    print(f"{'='*60}\n")
    print("Next steps:")
    print("1. cp model/seed_classifier_multikernel.onnx deploy/model/seed_classifier.onnx")
    print("2. cp model/model_meta_multikernel.json deploy/model_meta.json")
    print("3. git add deploy/model/ && git commit && git push")
    print("4. Vercel will auto-deploy!")


def main():
    parser = argparse.ArgumentParser(
        description="Augment and train multi-kernel maize classifier"
    )
    parser.add_argument("--images", nargs="+", required=True,
                        help="Path to sample images (e.g., image1.jpg image2.jpg)")
    parser.add_argument("--labels", nargs="+", required=True,
                        help="Label for each image (e.g., asili chotara huria)")
    parser.add_argument("--epochs", type=int, default=30,
                        help="Number of training epochs")
    parser.add_argument("--batch-size", type=int, default=16,
                        help="Batch size")
    parser.add_argument("--output-dir", default="data_maize_multikernel",
                        help="Output directory for augmented data")

    args = parser.parse_args()

    # Validate inputs
    if len(args.images) != len(args.labels):
        print("ERROR: Number of images must match number of labels!")
        return

    classes = list(set(args.labels))

    # Augment
    create_augmented_dataset(args.images, args.labels, args.output_dir)

    # Train
    train_model(args.output_dir, classes, epochs=args.epochs)


if __name__ == "__main__":
    main()

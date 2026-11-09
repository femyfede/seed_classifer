#!/usr/bin/env python3
"""
Helper script to prepare multi-kernel training data.
Copies sample images to training directory with proper organization.
"""

import os
import shutil
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
DATA_DIR = SCRIPT_DIR / "data_maize_multikernel" / "MaizeData"

# Create directories
for variety in ["asili", "chotara", "huria"]:
    variety_dir = DATA_DIR / variety
    variety_dir.mkdir(parents=True, exist_ok=True)
    print(f"✓ Created: {variety_dir}")

print("\n" + "="*60)
print("NEXT STEPS:")
print("="*60)
print(f"\n1. Place your multi-kernel sample images in:")
print(f"   - {DATA_DIR / 'asili'}/")
print(f"   - {DATA_DIR / 'chotara'}/")
print(f"   - {DATA_DIR / 'huria'}/")
print(f"\n2. Run training:")
print(f"   python train_model.py --data-dir {DATA_DIR.parent} --epochs 25")
print(f"\n3. New model will be generated in:")
print(f"   - model/seed_classifier_multikernel.onnx")
print("\nNote: Need minimum 20+ images per variety for good results\n")

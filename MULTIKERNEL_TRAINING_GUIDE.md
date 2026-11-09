# Multi-Kernel Maize Seed Classifier - Retraining Guide

This guide walks you through retraining the model to classify **multiple maize kernels in a single photo** instead of just single kernels.

## 📋 Prerequisites

1. **Python 3.8+** with PyTorch installed
2. **Multi-kernel sample images** (20+ per variety, properly labeled)
3. **Good lighting** and **white/plain backgrounds**

## 🎯 Step 1: Prepare Your Training Images

### Collect Images
Create folders and organize your multi-kernel samples:

```
data_maize_multikernel/
└── MaizeData/
    ├── asili/         ← Place your Asili multi-kernel samples here
    ├── chotara/       ← Place your Chotara multi-kernel samples here
    └── huria/         ← Place your Huria multi-kernel samples here
```

### Image Requirements
- ✅ **Multiple kernels per image** (4-10 kernels per photo is ideal)
- ✅ **Clear, high-quality photos**
- ✅ **White or plain background**
- ✅ **Good lighting (no shadows)**
- ✅ **Focused and sharp**
- ✅ **JPG format** (or PNG)

### Naming Convention
Name your files clearly with the variety:
```
asili_sample_1.jpg
asili_sample_2.jpg
asili_sample_3.jpg
...
chotara_sample_1.jpg
chotara_sample_2.jpg
...
huria_sample_1.jpg
huria_sample_2.jpg
...
```

## 🚀 Step 2: Prepare Data Structure

Run the preparation script:

```bash
python prepare_multikernel_data.py
```

This creates the necessary folder structure.

## 🎓 Step 3: Train the Multi-Kernel Model

Run the training script:

```bash
python train_multikernel_model.py \
  --data-dir data_maize_multikernel \
  --epochs 25 \
  --batch-size 16
```

### Training Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `--data-dir` | data_maize_multikernel | Path to training data |
| `--out-dir` | model | Output directory for model |
| `--epochs` | 25 | Number of training epochs |
| `--batch-size` | 16 | Batch size (reduce if out of memory) |
| `--img-size` | 224 | Image size (224 is standard) |
| `--seed` | 42 | Random seed for reproducibility |
| `--device` | cuda/cpu | auto-detect GPU if available |

### What to Expect

```
============================================================
MULTI-KERNEL MAIZE SEED CLASSIFIER - TRAINING
============================================================

Loading data...
  Classes: ['asili', 'chotara', 'huria']
  Loading asili: 25 samples...
  Loading chotara: 28 samples...
  Loading huria: 22 samples...
  Total samples: 75

Training for 25 epochs...

Epoch  1/25 | Train Loss: 1.0542 | Val Loss: 0.8234 | Val F1: 0.75
Epoch  2/25 | Train Loss: 0.7234 | Val Loss: 0.6123 | Val F1: 0.82
...
Epoch 25/25 | Train Loss: 0.2145 | Val Loss: 0.3456 | Val F1: 0.91

============================================================
FINAL EVALUATION
============================================================

Test Loss: 0.3456
Test Macro-F1: 0.90

              precision    recall  f1-score   support

       asili       0.92      0.88      0.90         5
     chotara       0.89      0.91      0.90         5
       huria       0.88      0.90      0.89         5

✓ TRAINING COMPLETE
============================================================
```

## 📦 Step 4: Generated Model Files

After training, you'll have:

```
model/
├── best_multikernel_model.pth      ← PyTorch checkpoint
├── seed_classifier_multikernel.onnx ← ONNX model (for browser)
├── model_meta.json                  ← Configuration metadata
└── model_meta_multikernel.json      ← Multi-kernel metadata
```

## 🔄 Step 5: Update the App to Use New Model

### Option A: Replace Current Model (Recommended)

```bash
# Backup old model
cp deploy/model/seed_classifier.onnx deploy/model/seed_classifier_single.onnx.bak

# Copy new model
cp model/seed_classifier_multikernel.onnx deploy/model/seed_classifier.onnx

# Copy metadata
cp model/model_meta_multikernel.json deploy/model_meta.json
```

### Option B: Keep Both Models

Keep the multi-kernel model separate and load it conditionally:

```bash
cp model/seed_classifier_multikernel.onnx deploy/model/seed_classifier_multikernel.onnx
cp model/model_meta_multikernel.json deploy/model/model_meta_multikernel.json
```

Then update `deploy/js/inference.js` to use the multi-kernel model.

## ✅ Step 6: Test the Updated App

1. **Start local server:**
   ```bash
   cd deploy
   python -m http.server 8000
   ```

2. **Open browser:** http://localhost:8000

3. **Test with multi-kernel samples:**
   - Go to Scan page
   - Upload one of your multi-kernel photos
   - Verify it correctly classifies the variety

4. **Test with single kernels:**
   - Verify it still works (though may be less accurate)

## 📊 Performance Tips

### If model overfits (high train F1, low test F1):
- Add more training data
- Increase dropout values
- Reduce learning rate
- Train for fewer epochs

### If model underfits (low F1 on both):
- Add more training data
- Reduce dropout
- Increase model width (width parameter)
- Train for more epochs

### If inference is slow:
- Reduce image size (--img-size 192 or 160)
- Use quantized ONNX export
- Add model optimization layer

## 🚀 Deploy Updated Model

After testing locally:

```bash
# Commit changes
git add deploy/model/seed_classifier.onnx
git add deploy/model/model_meta.json
git commit -m "Retrain model for multi-kernel classification"

# Push to GitHub
git push origin main

# Vercel will auto-deploy the new model
```

## 🐛 Troubleshooting

### "No seed found" on multi-kernel images
- The old single-kernel model is still in use
- Verify you copied the new model to the app

### Model accuracy is low
- Need more training data (aim for 50+ per variety)
- Improve image quality (better lighting, contrast)
- Check that images are properly labeled

### CUDA/GPU issues
- The script auto-detects GPU; falls back to CPU
- Training on CPU will be slower but works fine

### Out of memory error
- Reduce batch size: `--batch-size 8`
- Reduce image size: `--img-size 192`
- Use CPU: `--device cpu`

## 📈 Scaling Up

For production use:
- Collect **100+ samples per variety**
- Test with diverse lighting conditions
- Include edge cases (damaged seeds, partially visible)
- Regular retraining with new farmer data
- Monitor accuracy metrics over time

## ✨ Success Checklist

- [ ] Created `data_maize_multikernel` folder structure
- [ ] Collected 20+ multi-kernel samples per variety
- [ ] Ran `train_multikernel_model.py` successfully
- [ ] Model achieved >85% F1 score
- [ ] Copied new model to `deploy/model/`
- [ ] Tested app with multi-kernel images
- [ ] Verified classification works correctly
- [ ] Pushed to GitHub for Vercel deployment

---

**Questions?** Check the output logs for detailed error messages or contact support.

#ifndef CONFIG_H
#define CONFIG_H

// =====================================================
// Serial configuration
// =====================================================

#define SERIAL_BAUD_RATE 115200

// =====================================================
// Classification configuration
// =====================================================

// Align with Edge Impulse model's EI_CLASSIFIER_THRESHOLD (0.6)
//
// Increase this gradually after confirming that:
// - Asili is detected correctly
// - Chotara is detected correctly
// - Huria is detected correctly
// - Unrelated scenes are rejected correctly
//
// Recommended final range: 0.65f to 0.70f
#define CONFIDENCE_THRESHOLD 0.6f

// =====================================================
// Colour classifier (yellow kernels = Asili, white = Chotara)
// =====================================================
//
// 1 = classify by kernel colour, 0 = use the Edge Impulse model.
#define CLASSIFIER_USE_COLOR 1

// Pixel counts as "seed" when yellowness >= this and brightness >= the minimum.
// White cloth measures ~0.03, cream/white kernels ~0.40, yellow kernels ~0.50-0.70.
#define COLOR_SEED_YELLOWNESS 0.20f
#define COLOR_MIN_BRIGHTNESS 90

// Seed pixels need red >= this * green. Kernels measure 1.06+, green
// backgrounds ~0.45, so green objects are not mistaken for seed.
#define COLOR_MIN_RED_GREEN 0.85f

// A seed pixel counts as "yellow" at or above this yellowness.
#define COLOR_YELLOW_YELLOWNESS 0.55f

// Share of yellow seed pixels: <= CHOTARA gives 100% Chotara, >= ASILI gives
// 100% Asili, linear in between. Calibrated on phone photos (white kernels
// ~0.25, yellow ~0.44-0.66); re-check with the serial monitor on the XIAO.
#define COLOR_SHARE_CHOTARA 0.15f
#define COLOR_SHARE_ASILI 0.55f

// Below this fraction of seed pixels the LCD shows "No Seed Found".
// Empty cloth measures ~2.5% (wrinkles/tint), seed photos 18%+.
#define COLOR_MIN_SEED_FRACTION 0.08f

// Number of predictions used for majority voting.
#define CLASSIFICATION_SAMPLES 3

// Time between individual classification samples.
#define SAMPLE_GAP_MS 0

// How long each result screen (class, then region + soil) stays on the LCD.
#define RESULT_SCREEN_MS 1500

// =====================================================
// Camera warm-up configuration
// =====================================================

// Number of camera frames discarded during startup.
#define CAMERA_WARMUP_FRAMES 15

// Delay after each discarded startup frame.
#define CAMERA_WARMUP_FRAME_DELAY_MS 100

// =====================================================
// Camera image dimensions
// =====================================================

#define CAMERA_RAW_WIDTH 320
#define CAMERA_RAW_HEIGHT 240
#define CAMERA_IMAGE_CHANNELS 3

// =====================================================
// Camera orientation
// =====================================================
//
// These must match the orientation of the images the model was trained on.
// If the device sees a mirrored/upside-down scene, flip the corresponding
// value. Verify with a known seed before deploying.

#define CAMERA_VFLIP 1
#define CAMERA_HMIRROR 1

#endif